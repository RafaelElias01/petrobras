import fs from 'fs';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcodeTerminal from 'qrcode-terminal';
import { encontrarResposta, interpretarComando } from './regras.js';

// Pasta de sessão: fora do git (.gitignore protege whatsapp-bot/auth_info),
// nunca sincronizada por deploy destrutivo. Guarda as credenciais que
// permitem reconectar sem escanear QR de novo a cada restart do serviço.
const AUTH_DIR = process.env.WPP_AUTH_DIR || './auth_info';

// Liga/desliga persistido em disco (fora do git, como auth_info/) -- sem
// isso, um "/bot desligar" seria esquecido no próximo restart do serviço
// systemd, e o bot voltaria a responder sozinho sem o dono ter mandado ligar.
const ESTADO_PATH = process.env.WPP_ESTADO_PATH || './estado.json';

function lerEstadoLigado() {
  try {
    const dados = JSON.parse(fs.readFileSync(ESTADO_PATH, 'utf-8'));
    return dados.ligado !== false;
  } catch {
    return true; // sem arquivo ainda (primeira vez) ou corrompido: default ligado
  }
}

function salvarEstadoLigado(ligado) {
  try {
    fs.writeFileSync(ESTADO_PATH, JSON.stringify({ ligado }, null, 2));
  } catch (e) {
    console.error('Erro ao salvar estado.json:', e);
  }
}

let ligado = lerEstadoLigado();

// Rate limit defensivo: nunca mais que N respostas automáticas por minuto,
// mesmo que improvável de estourar num bot de FAQ (recomendação de
// segurança contra detecção de bot pelo WhatsApp -- ver LIVRO_DE_ERROS.md
// se algum dia isso virar um erro real).
const LIMITE_RESPOSTAS_POR_MINUTO = 20;
let respostasNoMinuto = 0;
setInterval(() => { respostasNoMinuto = 0; }, 60 * 1000).unref();

async function iniciar() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // deprecated na v7; usamos o evento manualmente
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\nEscaneie o QR code abaixo com o WhatsApp (Aparelhos conectados > Conectar um aparelho):\n');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const motivo = lastDisconnect?.error?.output?.statusCode;
      const deslogado = motivo === DisconnectReason.loggedOut;
      if (deslogado) {
        console.error('Sessão desconectada pelo usuário (logout no celular). Apague a pasta de auth e rode de novo pra parear.');
        return;
      }
      console.warn('Conexão perdida, reconectando em 3s...', motivo);
      setTimeout(iniciar, 3000);
      return;
    }

    if (connection === 'open') {
      console.log('Bot conectado ao WhatsApp com sucesso.');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      try {
        if (!msg.message) continue;

        const remetente = msg.key.remoteJid;
        if (!remetente || remetente.endsWith('@g.us')) continue; // ignora grupos

        // Com "mensagens temporárias" ativado no chat, o conteúdo real vem
        // embrulhado em ephemeralMessage.message -- sem desembrulhar, essas
        // mensagens (inclusive comandos /bot do próprio dono) caem no `texto`
        // vazio abaixo e são descartadas em silêncio, sem log nem resposta.
        const conteudo = msg.message.ephemeralMessage?.message || msg.message;
        const texto =
          conteudo.conversation ||
          conteudo.extendedTextMessage?.text ||
          '';
        if (!texto.trim()) continue;

        // Mensagem enviada pelo próprio dono (do aparelho pareado com o
        // bot): só aceita comando de controle, nunca vira pergunta de FAQ
        // nem conta no rate limit de respostas automáticas.
        if (msg.key.fromMe) {
          const comando = interpretarComando(texto);
          if (comando === 'desligar') {
            ligado = false;
            salvarEstadoLigado(ligado);
            await sock.sendMessage(remetente, { text: '🔴 Bot desligado. Não respondo mais ninguém até você mandar "/bot ligar".' });
          } else if (comando === 'ligar') {
            ligado = true;
            salvarEstadoLigado(ligado);
            await sock.sendMessage(remetente, { text: '🟢 Bot ligado. Voltando a responder normalmente.' });
          } else if (comando === 'status') {
            await sock.sendMessage(remetente, { text: `Status atual: ${ligado ? '🟢 ligado' : '🔴 desligado'}` });
          }
          continue;
        }

        if (!ligado) continue; // desligado pelo dono: ignora todo mundo

        if (respostasNoMinuto >= LIMITE_RESPOSTAS_POR_MINUTO) {
          console.warn('Limite de respostas/minuto atingido, ignorando mensagem por segurança.');
          continue;
        }

        // Incrementa ANTES do await: o listener é assíncrono e o event emitter
        // não espera uma chamada terminar antes de disparar a próxima, então
        // duas mensagens quase simultâneas (upsert batches diferentes) podiam
        // ler o mesmo valor desatualizado no `if` acima e as duas passarem,
        // estourando o limite. Reservar a "vaga" já aqui fecha essa corrida.
        respostasNoMinuto++;
        const resposta = encontrarResposta(texto);
        await sock.sendMessage(remetente, { text: `🤖 ${resposta}` });
      } catch (e) {
        console.error('Erro ao processar mensagem:', e);
      }
    }
  });
}

iniciar().catch((e) => {
  console.error('Erro fatal ao iniciar o bot:', e);
  process.exit(1);
});
