// Regras de resposta por palavra-chave. Conteúdo espelha o FAQ real do site
// (FaqSection.vue) -- ao atualizar uma resposta lá, atualizar aqui também
// pra não ficarem contraditórias (ver LIVRO_DE_ERROS.md, mesma categoria do
// ERRO-006: lista/conteúdo divergindo da fonte real).
//
// Cada regra tem `keywords` (normalizadas: minúsculo, sem acento) e
// `resposta`. A primeira regra cujo texto da mensagem contém qualquer uma
// das keywords é usada. Ordem importa: regras mais específicas primeiro.

export function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    // Colapsa espaços internos repetidos (autocorretor do celular, espaço
    // duplo por engano) -- sem isso, "/bot  desligar" não bate com nenhuma
    // entrada de interpretarComando() e o comando é ignorado em silêncio.
    .replace(/\s+/g, ' ');
}

// Tokeniza em palavras (sem pontuação) pra casar keyword como PALAVRA, não
// como substring solta -- "tempo" não deveria bater dentro de "atempo" ou
// "contemporaneo", por exemplo. Keywords de mais de uma palavra (ex: "quero
// falar") continuam comparadas como substring do texto original normalizado,
// já que são frases, não uma palavra isolada.
function tokens(texto) {
  return texto.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

// Distância de Levenshtein: número mínimo de inserções/remoções/trocas de
// letra pra transformar uma palavra na outra. Definição clássica é
// recursiva (Levenshtein(a, b) = min de 3 subcasos recursivos aparados em 1
// letra), mas recursão pura reprocessa os mesmos subcasos exponencialmente
// -- aqui memoizamos por par (i, j) já visitado, então cada subcaso resolve
// só uma vez (programação dinâmica top-down). Usada pra tolerar erro de
// digitação no WhatsApp (ex: "presio" ainda bater em "preco").
function distanciaLevenshtein(a, b, memo = new Map()) {
  function calcular(i, j) {
    if (i === 0) return j;
    if (j === 0) return i;
    const chave = `${i},${j}`;
    if (memo.has(chave)) return memo.get(chave);

    const custoTroca = a[i - 1] === b[j - 1] ? 0 : 1;
    const resultado = Math.min(
      calcular(i - 1, j) + 1,        // remover letra de a
      calcular(i, j - 1) + 1,        // inserir letra de b
      calcular(i - 1, j - 1) + custoTroca, // trocar (ou manter) letra
    );
    memo.set(chave, resultado);
    return resultado;
  }
  return calcular(a.length, b.length);
}

// Tolerância cresce com o tamanho da palavra: erro de 1 letra numa palavra
// curta ("pix" -> "piw") já é mais significativo do que numa palavra longa
// ("mercadopago" -> "mercadopagp"). Palavras com 4 letras ou menos exigem
// match exato (evita "e"/"o" virando keyword de qualquer coisa por acaso).
//
// Teto de tolerância é 1, não 2: uma varredura de ~150 palavras comuns do
// português (conjugações, plurais, prefixos re-/ob-) contra as keywords
// mostrou que tolerância 2 gera falsos positivos reais -- ex.: "contexto"
// batia em "conteudo" (distância 2), "entendente" em "atendente",
// "embolso" em "reembolso". Com teto 1 isso desaparece; o custo é deixar
// de cobrir erro de digitação de 2 letras simultâneas (raro), que ainda
// cai no fallback "não entendi" (resultado seguro, não uma resposta errada).
function toleranciaParaTamanho(tamanho) {
  if (tamanho <= 4) return 0;
  return 1;
}

// Mesmo com teto 1, algumas palavras REAIS do português ficam a distância 1
// de uma keyword só por coincidência de forma (não são erro de digitação
// dela) -- achado na mesma varredura: "calor"/"vapor" viram "valor" (preço),
// "evolução"/"revolução" viram "devolução" (reembolso). Ambos os pares têm
// significado completamente diferente da keyword, então ficam de fora do
// fuzzy match aqui (mas continuam batendo por match exato se o usuário
// digitar a keyword certa). Formato: keywordNormalizada -> Set de palavras
// normalizadas a ignorar.
const EXCECOES_FUZZY = new Map([
  ['valor', new Set(['calor', 'vapor'])],
  ['devolucao', new Set(['evolucao', 'revolucao'])],
  ['valeu', new Set(['vale'])],
  ['diferente', new Set(['deferente'])],
]);

function bateKeyword(textoNormalizado, textoTokens, keywordNormalizada) {
  if (keywordNormalizada.includes(' ')) {
    return textoNormalizado.includes(keywordNormalizada);
  }
  const tolerancia = toleranciaParaTamanho(keywordNormalizada.length);
  const excecoes = EXCECOES_FUZZY.get(keywordNormalizada);
  return textoTokens.some(token => {
    if (token === keywordNormalizada) return true;
    if (tolerancia === 0) return false;
    if (excecoes?.has(token)) return false;
    // Corta cedo se a diferença de tamanho já excede a tolerância --
    // evita rodar Levenshtein em pares obviamente incompatíveis.
    if (Math.abs(token.length - keywordNormalizada.length) > tolerancia) return false;
    return distanciaLevenshtein(token, keywordNormalizada) <= tolerancia;
  });
}

export const SITE_URL = 'https://www.petrobrasacademy.com.br';

export const REGRAS = [
  {
    keywords: ['atendente', 'falar com alguem', 'pessoa de verdade', 'humano', 'suporte humano', 'atendimento humano', 'quero falar', 'me chama alguem'],
    resposta: `👋 Já te encaminhei aqui pro nosso atendimento!\nAlguém do time vai te responder por aqui mesmo, assim que possível.\nSe quiser adiantar, me conta agora o que você precisa que já deixo registrado 🙂`,
  },
  {
    keywords: ['link do pagamento', 'link do mercado pago', 'link pra pagar', 'manda o link', 'me manda o link', 'link de compra'],
    resposta: `🔗 O pagamento é feito dentro do site, vinculado à sua conta (é assim que garantimos que o Premium é ativado certinho pra você).\n\n1️⃣ Entre ou crie sua conta: ${SITE_URL}\n2️⃣ Clique em "Seja Premium"\n3️⃣ Escolha Pix, cartão ou boleto no Mercado Pago\n\nAprovado, libera na hora! 👑`,
  },
  {
    keywords: ['preco', 'valor', 'quanto custa', 'quanto e', 'mensalidade'],
    resposta: `💰 O Premium custa *R$ 49,90*, pagamento único — sem mensalidade. Acesso vitalício a todo o conteúdo e atualizações futuras.\n\nAssine direto pelo site: ${SITE_URL}`,
  },
  {
    keywords: ['pagamento', 'pagar', 'pix', 'cartao', 'boleto', 'mercado pago', 'mercadopago'],
    resposta: `💳 O pagamento é 100% automático pelo Mercado Pago (Pix, cartão ou boleto). Assim que aprovado, seu Premium é liberado na hora, sem precisar enviar comprovante.\n\nPague direto pelo site: ${SITE_URL}`,
  },
  {
    keywords: ['reembolso', 'devolucao', 'cancelar', 'garantia', 'estorno'],
    resposta: `Sobre reembolso: fale direto com a gente aqui mesmo que a gente te ajuda a resolver caso a caso. 🙂`,
  },
  {
    keywords: ['materia', 'materias', 'conteudo', 'assunto', 'o que cai', 'o que tem na prova', 'disciplinas', 'quimica', 'processos de petroleo', 'metrologia'],
    resposta: `📚 A plataforma cobre tudo que cai na prova da Cesgranrio:\nLíngua Portuguesa (10 questões), Matemática (10 questões), Química (38 questões, é o bloco de específicas), Processos de Petróleo, Segurança/Meio Ambiente e Metrologia/Controle.\nPortuguês + Matemática valem 40% da prova, e as específicas (Química etc.) valem 60% — é pra isso que o ciclo de estudos é ponderado.\n📲 ${SITE_URL}`,
  },
  {
    keywords: ['nao consigo entrar', 'nao consigo acessar', 'nao esta funcionando', 'da erro', 'deu erro', 'bug', 'travou', 'nao abre', 'fora do ar', 'nao carrega', 'problema no site', 'problema tecnico'],
    resposta: `😕 Poxa, desculpa o transtorno!\nMe conta rapidinho: qual tela você tava tentando acessar e o que aparece na hora do erro (print ajuda bastante).\nVou encaminhar pro time técnico dar uma olhada assim que possível.`,
  },
  {
    keywords: ['conta demo', 'usuario estudante', 'conta estudante', 'conta de teste', 'conta compartilhada', 'demo'],
    resposta: `🔎 A conta "estudante" é uma demo compartilhada, só pra você experimentar a plataforma.\nEla libera 5 tentativas nas funções bloqueadas e depois pede uma conta própria.\nPor segurança, essa conta demo nunca vira Premium (é compartilhada com outros visitantes) — pra ter acesso completo é preciso criar seu próprio cadastro.\n📲 ${SITE_URL}`,
  },
  {
    keywords: ['funciona mesmo', 'quem ja passou', 'depoimento', 'depoimentos', 'prova social', 'aprovado', 'aprovados', 'da resultado'],
    resposta: `🏆 Funciona sim, e tem gente aprovada usando:\nCarlos (Macaé) foi de 38% pra 82% de acerto e ficou em 12º lugar. Ana (Salvador) ficou em 6º. Mariana (Duque de Caxias), mãe e trabalha o dia todo, passou estudando só à noite. Bruno (Betim) era fraco em matemática e foi de 3 pra 8 acertos nos simulados.\n📲 ${SITE_URL}`,
  },
  {
    keywords: ['simulado', 'simulados', 'banco de questoes', 'questoes', 'exercicios', 'prova modelo', 'treino de prova'],
    resposta: `📝 Os simulados usam banco de questões no estilo Cesgranrio, com correção na hora.\nDepois você recebe relatório de desempenho e as que errou vão pro caderno de erros, pra focar exatamente no que precisa melhorar.\n📲 ${SITE_URL}`,
  },
  {
    keywords: ['flashcard', 'flashcards', 'revisao espacada', 'cartao de memorizacao', 'cartoes'],
    resposta: `🧠 Os flashcards usam repetição espaçada, revisando no D+1, D+7 e D+30 — o intervalo certo pra grudar na memória de verdade.\nIsso fica junto com o diário de estudos, que já agenda essas revisões pra você automaticamente.\n📲 ${SITE_URL}`,
  },
  {
    keywords: ['obrigado', 'obrigada', 'valeu', 'vlw', 'obg', 'brigado', 'brigada', 'agradecido', 'ate mais', 'falou', 'tchau'],
    resposta: `🙌 Por nada! Qualquer dúvida é só chamar aqui.\nBons estudos e boa sorte na prova! 🚀`,
  },
  {
    keywords: ['diferente', 'diferenca', 'por que', 'porque', 'vale a pena', 'como funciona'],
    resposta: `🎯 Não somos um "depósito de PDFs". Somos um método de estudo ativo:\n\n🔁 *Ciclo Ponderado* — você estuda o que a Cesgranrio mais cobra\n🧠 *Revisão Espaçada* — flashcards que garantem que você não esqueça\n📊 *Métricas Reais* — você vê seu progresso e ajusta a rota\n\nConheça: ${SITE_URL}`,
  },
  {
    keywords: ['tempo', 'pouco tempo', 'trabalho', 'corrido'],
    resposta: `⏱️ A plataforma foi desenhada pra quem tem pouco tempo. O ciclo de estudos prioriza as matérias de maior peso, e os flashcards são perfeitos pra revisões rápidas de 15 minutos no ônibus ou no intervalo.\n\nSaiba mais: ${SITE_URL}`,
  },
  {
    keywords: ['atualizado', 'edital', 'concurso', '2026', 'cesgranrio'],
    resposta: `📅 Todo o conteúdo é baseado na análise dos últimos editais da Cesgranrio para Técnico em Química. O acesso vitalício garante atualizações pros próximos concursos sem custo adicional.`,
  },
  {
    keywords: ['celular', 'mobile', 'app', 'aplicativo'],
    resposta: `📱 Sim! A plataforma é 100% responsiva — funciona em computador, tablet e celular. Estude onde e quando quiser: ${SITE_URL}`,
  },
  {
    keywords: ['cadastro', 'criar conta', 'login', 'como entro', 'esqueci senha', 'esqueci a senha'],
    resposta: `📝 Você pode criar sua conta grátis direto pelo site: ${SITE_URL}\n\nSe esqueceu a senha, fale com a gente aqui que ajudamos a recuperar o acesso.`,
  },
  {
    keywords: ['premium', 'assinar', 'assinatura', 'vip'],
    resposta: `👑 O Premium libera o conteúdo completo: ciclo de estudos, flashcards, simulados, banco de questões e relatório de desempenho. R$ 49,90, pagamento único, vitalício.\n\nAssine: ${SITE_URL}`,
  },
  {
    keywords: ['oi', 'ola', 'boa tarde', 'bom dia', 'boa noite', 'menu', 'ajuda'],
    resposta: `Olá! 👋 Sou o assistente automático do *Estudo Petrobras*.\n\nPosso te ajudar com:\n💰 Preço e pagamento\n👑 O que é o Premium\n📚 Matérias e conteúdo\n📝 Simulados e flashcards\n🏆 Resultados de quem já passou\n📝 Cadastro e login\n😕 Problema técnico\n\nÉ só perguntar! Se precisar falar com uma pessoa, me diga "atendente" que a gente te responde por aqui assim que possível.`,
  },
];

export const RESPOSTA_PADRAO =
  `Não entendi bem sua pergunta 🤔 Pode tentar de outro jeito? Ou digite *menu* pra ver os assuntos que posso ajudar.\n\nSe preferir, veja tudo no site: ${SITE_URL}`;

// Comandos de controle do bot (liga/desliga/status), digitados pelo próprio
// dono do número. No WhatsApp isso chega como mensagem "fromMe" -- só quem
// está logado no aparelho pareado com o bot consegue mandar uma dessas, o
// que já serve como autenticação (não existe outra forma de gerar uma
// mensagem fromMe pra esse número). bot.js é responsável por só chamar isso
// pra mensagens fromMe e por persistir o estado resultante.
export function interpretarComando(mensagemBruta) {
  const texto = normalizar(mensagemBruta).trim();
  if (['/bot desligar', '/bot off', '/bot pausar'].includes(texto)) return 'desligar';
  if (['/bot ligar', '/bot on', '/bot ativar'].includes(texto)) return 'ligar';
  if (['/bot status'].includes(texto)) return 'status';
  return null;
}

export function encontrarResposta(mensagem) {
  const texto = normalizar(mensagem);
  const textoTokens = tokens(texto);
  for (const regra of REGRAS) {
    if (regra.keywords.some(k => bateKeyword(texto, textoTokens, normalizar(k)))) {
      return regra.resposta;
    }
  }
  return RESPOSTA_PADRAO;
}
