import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath, pathToFileURL } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { hojeBrasiliaISO } from './dataLocal.js';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.set('trust proxy', 1);

// Mercado Pago (Checkout Pro): so fica ativo se as credenciais estiverem
// configuradas via env var (nunca em texto puro no codigo -- repo publico).
const PREMIUM_PRECO = 49.90;
const mpClient = process.env.MP_ACCESS_TOKEN
  ? new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
  : null;
if (!mpClient) {
  console.warn('MP_ACCESS_TOKEN nao configurado: checkout Mercado Pago desativado.');
}

// Email de boas-vindas pós-cadastro (Resend). Só ativa com a API key
// configurada via env var; sem ela, o cadastro segue funcionando normalmente,
// só sem o email. RESEND_FROM precisa ser um remetente de domínio verificado
// no Resend -- sem isso, usar o padrão de teste "onboarding@resend.dev".
const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.RESEND_FROM || 'Estudo Petrobras <onboarding@resend.dev>';
if (!resendClient) {
  console.warn('RESEND_API_KEY nao configurado: email de boas-vindas desativado.');
}

async function enviarEmailBoasVindas({ email, nome, usuario }) {
  if (!resendClient) return;
  try {
    await resendClient.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Bem-vindo(a) ao Estudo Petrobras!',
      html: `<p>Olá, ${nome}!</p>
        <p>Sua conta foi criada com sucesso. Seu usuário de acesso é: <strong>${usuario}</strong></p>
        <p>Por segurança, nunca enviamos sua senha por email -- guarde-a em local seguro.</p>
        <p>Bons estudos!</p>`,
    });
  } catch (e) {
    console.error('Erro ao enviar email de boas-vindas:', e);
  }
}

// Segurança de cabeçalhos. GA4/Facebook Pixel removidos do index.html (IDs
// placeholder) — CSP não referencia mais esses domínios. Reativar aqui
// junto com o index.html quando houver IDs reais.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      frameSrc: ["'self'", 'https://www.mercadopago.com.br', 'https://www.mercadopago.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { erro: 'Muitas requisições. Tente novamente em alguns minutos.' }
});
app.use('/api/', limiter);

// Rate-limit mais estrito para auth (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { erro: 'Muitas tentativas de autenticação. Aguarde alguns minutos.' }
});

// --- Sessões server-side (em memória, TTL 7 dias) ---
const SESSAO_TTL = 7 * 24 * 60 * 60 * 1000;
// Sessão do usuário demo 'estudante' expira bem mais rápido: sem isso, o
// limite de acessos por sessão vira inútil (bastaria ficar logado 7 dias
// sem nunca deslogar). 45min limita tempo total de uso mesmo se a pessoa
// nunca navegar pra uma feature bloqueada.
const SESSAO_TTL_DEMO = 45 * 60 * 1000;
const sessoes = new Map(); // token -> { usuario, exp, demoCount? }

function criarSessao(usuario) {
  const token = crypto.randomBytes(32).toString('hex');
  const ttl = usuario === 'estudante' ? SESSAO_TTL_DEMO : SESSAO_TTL;
  sessoes.set(token, { usuario, exp: Date.now() + ttl });
  return token;
}

function sessaoDoToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const s = sessoes.get(token);
  if (!s) return null;
  if (Date.now() > s.exp) { sessoes.delete(token); return null; }
  return s;
}

function usuarioDoToken(req) {
  return sessaoDoToken(req)?.usuario || null;
}

// Limite de acesso demo (usuário 'estudante'): contado por sessão de login no
// servidor, não mais em localStorage (burlável limpando storage/trocando de
// navegador). Reseta a cada novo login, mas dentro da mesma sessão não tem
// como escapar client-side.
const DEMO_MAX_ACESSOS = 5;

// Limpeza periódica de sessões expiradas
setInterval(() => {
  const agora = Date.now();
  for (const [token, s] of sessoes) if (agora > s.exp) sessoes.delete(token);
}, 60 * 60 * 1000).unref();

const frontendDistPath = path.join(__dirname, 'dist');

if (!fs.existsSync(frontendDistPath)) {
  console.error("\nERRO: A pasta 'dist' do frontend não foi encontrada.");
  console.error("Execute 'npm run build' primeiro.\n");
}

app.use(express.json());
app.use(express.static(frontendDistPath));

// Escrita atômica: grava em arquivo temporário e usa rename (atômico no POSIX)
// para evitar JSON truncado se o processo for morto no meio de um write
// (ex: systemctl restart durante deploy).
function escreverJsonAtomico(destino, data) {
  const dir = path.dirname(destino);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(destino)}.${process.pid}.tmp`);
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, destino);
}

const usuariosPath = process.env.USUARIOS_PATH || path.join(__dirname, 'dados', 'usuarios.json');

function lerUsuarios() {
  try {
    if (!fs.existsSync(usuariosPath)) return [];
    const data = fs.readFileSync(usuariosPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Erro ao ler usuários:', e);
    return [];
  }
}

function salvarUsuarios(data) {
  try {
    escreverJsonAtomico(usuariosPath, data);
  } catch (e) {
    console.error('Erro ao salvar usuarios:', e);
  }
}

// Migração one-time: qualquer usuário com `senha` em texto plano vira `senhaHash`
// (bcrypt) e o campo plaintext é apagado do disco.
function migrarSenhasPlaintext() {
  const usuarios = lerUsuarios();
  let mudou = false;
  for (const u of usuarios) {
    if (u.senha && !u.senhaHash) {
      u.senhaHash = bcrypt.hashSync(String(u.senha), 10);
      delete u.senha;
      mudou = true;
    }
  }
  if (mudou) {
    salvarUsuarios(usuarios);
    console.log(`Migração: ${usuarios.filter(u => u.senhaHash).length} senha(s) rehasheada(s) com bcrypt.`);
  }
}
migrarSenhasPlaintext();

// Seed opcional dos usuários demo (admin/estudante) usados pelo antigo
// fallback client-side (usuarios.js: autenticar()), agora removido do
// front-end. Login passou a depender exclusivamente deste servidor, então
// esses usuários precisam existir aqui para continuar funcionando.
//
// A senha nunca fica em texto puro no código-fonte (este repo é público):
// vem de variável de ambiente, só setada na VM. Sem a env var, o seed
// simplesmente não roda — a conta precisa ser criada manualmente via
// POST /api/auth/register (mesma limitação já documentada para o 'admin',
// cuja senha demo antiga não foi recuperável do histórico).
function seedUsuariosDemo() {
  const senhaEstudante = process.env.DEMO_ESTUDANTE_SENHA;
  if (!senhaEstudante) return;
  const usuarios = lerUsuarios();
  if (usuarios.find(u => u.usuario === 'estudante')) return;
  usuarios.push({
    usuario: 'estudante',
    nome: 'Estudante',
    email: 'estudante-demo@estudo-petrobras.local',
    senhaHash: bcrypt.hashSync(senhaEstudante, 10),
    role: 'user',
    premium: false,
    criadoEm: new Date().toISOString(),
  });
  salvarUsuarios(usuarios);
  console.log('Seed: usuário demo "estudante" criado em dados/usuarios.json.');
}
seedUsuariosDemo();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/auth/register', authLimiter, (req, res) => {
  const { usuario, nome, senha, email } = req.body;
  if (!usuario || typeof usuario !== 'string' || usuario.length < 3 || usuario.length > 50) return res.status(400).json({ erro: 'Usuário inválido (mín. 3 caracteres)' });
  if (!nome || typeof nome !== 'string' || nome.length < 2 || nome.length > 50) return res.status(400).json({ erro: 'Nome é obrigatório (mín. 2 caracteres)' });
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 200) return res.status(400).json({ erro: 'Email inválido' });
  if (!senha || typeof senha !== 'string' || senha.length < 3 || senha.length > 200) return res.status(400).json({ erro: 'Senha inválida (mín. 3 caracteres)' });
  const usuarioNormalizado = usuario.toLowerCase();
  const usuarios = lerUsuarios();
  if (usuarios.find(u => u.usuario.toLowerCase() === usuarioNormalizado)) return res.status(409).json({ erro: 'Usuário já existe' });
  if (usuarios.find(u => u.email === email)) return res.status(409).json({ erro: 'Email já cadastrado' });
  const senhaHash = bcrypt.hashSync(senha, 10);
  usuarios.push({ usuario: usuarioNormalizado, nome, email, senhaHash, role: 'user', premium: false, criadoEm: new Date().toISOString() });
  salvarUsuarios(usuarios);
  const token = criarSessao(usuarioNormalizado);
  res.json({ ok: true, token, user: { usuario: usuarioNormalizado, nome, role: 'user', premium: false } });
  // Depois da resposta: não atrasa nem falha o cadastro se o email demorar/der erro.
  enviarEmailBoasVindas({ email, nome, usuario: usuarioNormalizado });
});

// Hash bcrypt válido (60 chars) usado só como referência de timing quando o
// usuário não existe -- precisa ser um hash bcrypt de verdade (não uma string
// qualquer com o prefixo "$2b$10$"), senão bcrypt.compareSync lança/erra e o
// tempo de resposta não fica equivalente ao caso de usuário existente.
const HASH_DUMMY_ANTI_TIMING = bcrypt.hashSync('dummy-anti-timing-estudo-petrobras', 10);

app.post('/api/auth/login', authLimiter, (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || typeof usuario !== 'string' || !senha || typeof senha !== 'string') {
    return res.status(400).json({ erro: 'Credenciais inválidas' });
  }
  const usuarios = lerUsuarios();
  const user = usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase());
  // Compara sempre (mesmo sem usuário) para não vazar timing de existência
  const hashRef = user?.senhaHash || HASH_DUMMY_ANTI_TIMING;
  const ok = bcrypt.compareSync(senha, hashRef);
  if (!user || !ok) return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
  const token = criarSessao(user.usuario);
  res.json({ ok: true, token, user: { usuario: user.usuario, nome: user.nome, role: user.role || 'user', premium: user.premium || false } });
});

// Resolve o usuário autenticado (via token de sessão) e confere role==='admin'
// direto em dados/usuarios.json -- fonte única de verdade. Usado por toda a
// seção /api/admin/* abaixo.
function usuarioAdminDoToken(req) {
  const nomeUsuario = usuarioDoToken(req);
  if (!nomeUsuario) return null;
  const usuarios = lerUsuarios();
  const user = usuarios.find(u => u.usuario === nomeUsuario);
  return user && user.role === 'admin' ? user : null;
}

function semSenhaHash(u) {
  const { senhaHash, ...resto } = u;
  return resto;
}

// Painel de administração: CRUD de usuários direto em dados/usuarios.json
// (mesmo arquivo usado por /api/auth/*). Antes disso o painel (Admin.vue)
// lia/escrevia só em localStorage do navegador -- por isso cadastros reais
// (via /api/auth/register) nunca apareciam pra quem abrisse o admin em outra
// sessão/máquina. Essas rotas passam a ser a fonte real de dados do painel.
app.get('/api/admin/usuarios', (req, res) => {
  if (!usuarioAdminDoToken(req)) return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  const usuarios = lerUsuarios();
  res.json(usuarios.map(semSenhaHash));
});

app.post('/api/admin/usuarios', (req, res) => {
  if (!usuarioAdminDoToken(req)) return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  const { usuario, nome, senha, role } = req.body;
  if (!usuario || typeof usuario !== 'string' || usuario.length < 3) return res.status(400).json({ erro: 'Usuário inválido (mín. 3 caracteres)' });
  if (!nome || typeof nome !== 'string' || nome.length < 2) return res.status(400).json({ erro: 'Nome é obrigatório (mín. 2 caracteres)' });
  if (!senha || typeof senha !== 'string' || senha.length < 3 || senha.length > 200) return res.status(400).json({ erro: 'Senha inválida (mín. 3 caracteres)' });
  const roleFinal = role === 'admin' ? 'admin' : 'user';
  const usuarios = lerUsuarios();
  if (usuarios.find(u => u.usuario === usuario)) return res.status(409).json({ erro: 'Usuário já existe' });
  const senhaHash = bcrypt.hashSync(senha, 10);
  const novo = { usuario, nome, email: '', senhaHash, role: roleFinal, premium: false, criadoEm: new Date().toISOString() };
  usuarios.push(novo);
  salvarUsuarios(usuarios);
  res.json(semSenhaHash(novo));
});

app.put('/api/admin/usuarios/:usuario', (req, res) => {
  if (!usuarioAdminDoToken(req)) return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  const { usuario } = req.params;
  const { nome, senha, role } = req.body;
  const usuarios = lerUsuarios();
  const idx = usuarios.findIndex(u => u.usuario === usuario);
  if (idx === -1) return res.status(404).json({ erro: 'Usuário não encontrado' });
  if (nome !== undefined) {
    if (typeof nome !== 'string' || nome.length < 2) return res.status(400).json({ erro: 'Nome é obrigatório (mín. 2 caracteres)' });
    usuarios[idx].nome = nome;
  }
  if (role !== undefined) {
    usuarios[idx].role = role === 'admin' ? 'admin' : 'user';
  }
  if (senha) {
    if (typeof senha !== 'string' || senha.length < 3 || senha.length > 200) return res.status(400).json({ erro: 'Senha inválida (mín. 3 caracteres)' });
    usuarios[idx].senhaHash = bcrypt.hashSync(senha, 10);
  }
  salvarUsuarios(usuarios);
  res.json(semSenhaHash(usuarios[idx]));
});

app.delete('/api/admin/usuarios/:usuario', (req, res) => {
  const admin = usuarioAdminDoToken(req);
  if (!admin) return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  const { usuario } = req.params;
  if (usuario === admin.usuario) return res.status(400).json({ erro: 'Não é possível remover o próprio usuário' });
  const usuarios = lerUsuarios();
  const existe = usuarios.some(u => u.usuario === usuario);
  if (!existe) return res.status(404).json({ erro: 'Usuário não encontrado' });
  salvarUsuarios(usuarios.filter(u => u.usuario !== usuario));
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token) sessoes.delete(token);
  res.json({ ok: true });
});

const newsPath = process.env.NEWSLETTER_PATH || path.join(__dirname, 'dados', 'newsletter.json');

app.post('/api/newsletter', (req, res) => {
  const { email, nome } = req.body;
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 200) return res.status(400).json({ erro: 'Email inválido' });
  if (!nome || typeof nome !== 'string' || nome.length < 2) return res.status(400).json({ erro: 'Nome é obrigatório' });
  let inscricoes = [];
  try {
    if (fs.existsSync(newsPath)) inscricoes = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));
  } catch (e) { /* ignore */ }
  if (inscricoes.find(i => i.email === email)) return res.json({ ok: true, message: 'Email já cadastrado' });
  inscricoes.push({ email, nome, origem: req.headers.referer || 'direto', criadoEm: new Date().toISOString() });
  try {
    escreverJsonAtomico(newsPath, inscricoes);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao salvar' });
  }
});

app.get('/api/premium/status/:usuario', (req, res) => {
  const { usuario } = req.params;
  if (!usuario || typeof usuario !== 'string' || usuario.length > 50) return res.status(400).json({ erro: 'Usuário inválido' });
  // Só o próprio usuário autenticado pode consultar seu status (evita vazar
  // nome/email de terceiros via enumeração de usuário na URL).
  const autenticado = usuarioDoToken(req);
  if (!autenticado || autenticado.toLowerCase() !== usuario.toLowerCase()) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }
  const usuarios = lerUsuarios();
  const user = usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase());
  if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json({ premium: user.premium || false, premiumEm: user.premiumEm || null, nome: user.nome, email: user.email || '' });
});

function ativarPremium(usuario) {
  const usuarios = lerUsuarios();
  const idx = usuarios.findIndex(u => u.usuario === usuario);
  if (idx === -1) return false;
  usuarios[idx].premium = true;
  usuarios[idx].premiumEm = new Date().toISOString();
  salvarUsuarios(usuarios);
  return true;
}

app.post('/api/premium/criar-preferencia', async (req, res) => {
  const usuario = usuarioDoToken(req);
  if (!usuario) return res.status(401).json({ erro: 'Não autenticado' });
  // 'estudante' é a conta demo compartilhada publicamente (ver Login.vue).
  // Premium nela ativaria pra QUALQUER visitante que logar com essa conta --
  // precisa de uma conta própria pra ter um external_reference que faça sentido.
  if (usuario === 'estudante') {
    return res.status(403).json({ erro: 'A conta demo não pode assinar o Premium. Crie sua própria conta primeiro.' });
  }
  if (!mpClient) return res.status(503).json({ erro: 'Checkout Mercado Pago não configurado' });
  try {
    const preference = new Preference(mpClient);
    const resultado = await preference.create({
      body: {
        items: [{
          id: 'premium-acesso',
          title: 'Acesso Premium — Estudo Petrobras',
          quantity: 1,
          unit_price: PREMIUM_PRECO,
          currency_id: 'BRL',
        }],
        external_reference: usuario,
        notification_url: 'https://petrobrasacademy.com.br/api/premium/webhook',
        back_urls: {
          success: 'https://petrobrasacademy.com.br/#dashboard',
          failure: 'https://petrobrasacademy.com.br/#dashboard',
          pending: 'https://petrobrasacademy.com.br/#dashboard',
        },
        auto_return: 'approved',
      },
    });
    res.json({ ok: true, init_point: resultado.init_point });
  } catch (e) {
    console.error('Erro ao criar preferência Mercado Pago:', e);
    res.status(500).json({ erro: 'Erro ao criar preferência de pagamento' });
  }
});

// Verifica a assinatura do webhook do Mercado Pago (x-signature/x-request-id)
// conforme o manifesto documentado por eles: "id:{data.id};request-id:{req-id};ts:{ts};"
// hash HMAC-SHA256 com o secret do webhook, comparado ao v1 recebido.
function assinaturaWebhookValida(req) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false;
  const assinatura = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];
  const dataId = req.query['data.id'];
  if (!assinatura || !requestId || !dataId) return false;
  const partes = Object.fromEntries(
    assinatura.split(',').map(p => p.trim().split('=').map(s => s.trim()))
  );
  const { ts, v1 } = partes;
  if (!ts || !v1) return false;
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${ts};`;
  const hashEsperado = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  // timingSafeEqual exige buffers do mesmo tamanho -- uma assinatura forjada
  // com tamanho diferente do hash real lançaria RangeError aqui, derrubando
  // o endpoint com 500 em vez de simplesmente rejeitar como assinatura inválida.
  const bufEsperado = Buffer.from(hashEsperado);
  const bufRecebido = Buffer.from(v1);
  if (bufEsperado.length !== bufRecebido.length) return false;
  return crypto.timingSafeEqual(bufEsperado, bufRecebido);
}

app.post('/api/premium/webhook', express.json(), async (req, res) => {
  if (!mpClient) return res.status(503).end();
  // Responde 200 rápido em qualquer caso para o Mercado Pago não re-tentar
  // indefinidamente, mas só processa se a assinatura bater.
  if (!assinaturaWebhookValida(req)) {
    console.warn('Webhook Mercado Pago: assinatura inválida ou ausente, ignorado.');
    return res.status(200).end();
  }
  const paymentId = req.query['data.id'] || req.body?.data?.id;
  if (!paymentId) return res.status(200).end();
  try {
    const payment = new Payment(mpClient);
    const info = await payment.get({ id: paymentId });
    if (info.status === 'approved' && info.external_reference) {
      const ativou = ativarPremium(info.external_reference);
      console.log(`Webhook Mercado Pago: pagamento ${paymentId} aprovado, premium ${ativou ? 'ativado' : 'usuario nao encontrado'} p/ ${info.external_reference}.`);
    }
  } catch (e) {
    console.error('Erro ao processar webhook Mercado Pago:', e);
  }
  res.status(200).end();
});

app.post('/api/demo/incrementar', (req, res) => {
  const sessao = sessaoDoToken(req);
  if (!sessao) return res.status(401).json({ erro: 'Não autenticado' });
  if (sessao.usuario !== 'estudante') {
    return res.status(400).json({ erro: 'Limite de demo não se aplica a este usuário' });
  }
  sessao.demoCount = (sessao.demoCount || 0) + 1;
  res.json({ count: sessao.demoCount, max: DEMO_MAX_ACESSOS, expirado: sessao.demoCount >= DEMO_MAX_ACESSOS });
});

app.get('/api/materiais/:nome', (req, res) => {
  const { nome } = req.params;
  const permitidos = ['guia-estudos-gratuito.md'];
  if (!permitidos.includes(nome)) return res.status(403).json({ erro: 'Arquivo não disponível' });
  const materiaPath = path.join(__dirname, 'materiais', nome);
  if (!fs.existsSync(materiaPath)) return res.status(404).json({ erro: 'Material não encontrado' });
  res.setHeader('Content-Disposition', `attachment; filename="${nome}"`);
  res.sendFile(materiaPath);
});

const visitasPath = process.env.VISITAS_PATH || path.join(__dirname, 'dados', 'visitas.json');

function lerVisitas() {
  try {
    if (!fs.existsSync(visitasPath)) return [];
    const data = fs.readFileSync(visitasPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Erro ao ler visitas:', e);
    return [];
  }
}

function salvarVisitas(data) {
  try {
    escreverJsonAtomico(visitasPath, data);
  } catch (e) {
    console.error('Erro ao salvar visitas:', e);
  }
}

const PAGINAS_VALIDAS = new Set([
  'dashboard', 'checklist', 'ciclo', 'horas', 'simulados', 'erros',
  'flashcards', 'diario', 'relatorio', 'exercicios', 'plano', 'admin'
]);

app.post('/api/visitas', (req, res) => {
  // Nunca confia no campo `usuario` vindo do body (input do client, fácil de
  // forjar). Se houver um token válido, usa o usuário autenticado; senão,
  // registra como visitante anônimo.
  const usuario = usuarioDoToken(req) || 'anônimo';
  const ip = req.ip || 'desconhecido';
  const paginaBruta = typeof req.body?.pagina === 'string' ? req.body.pagina : '';
  const pagina = PAGINAS_VALIDAS.has(paginaBruta) ? paginaBruta : 'dashboard';
  const visitas = lerVisitas();
  visitas.push({
    usuario,
    ip,
    pagina,
    data: hojeBrasiliaISO(),
    hora: new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false }),
    timestamp: Date.now()
  });
  salvarVisitas(visitas);
  res.json({ ok: true });
});

app.get('/api/visitas', (req, res) => {
  // Expõe IP + usuário de todo mundo que visitou o site -- só admin pode ver.
  const autenticado = usuarioDoToken(req);
  if (!autenticado) return res.status(401).json({ erro: 'Não autenticado' });
  const usuarios = lerUsuarios();
  const user = usuarios.find(u => u.usuario === autenticado);
  if (!user || user.role !== 'admin') return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  const visitas = lerVisitas();
  const total = visitas.length;
  const hoje = hojeBrasiliaISO();
  const unicos = new Set(visitas.map(v => v.usuario === 'anônimo' ? `ip:${v.ip}` : `u:${v.usuario}`)).size;

  const porDiaMap = new Map();
  for (const v of visitas) {
    porDiaMap.set(v.data, (porDiaMap.get(v.data) || 0) + 1);
  }
  const porDia = Array.from(porDiaMap.entries())
    .map(([data, total]) => ({ data, total }))
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(-30);

  const porPaginaMap = new Map();
  for (const v of visitas) {
    const p = v.pagina || 'dashboard';
    porPaginaMap.set(p, (porPaginaMap.get(p) || 0) + 1);
  }
  const porPagina = Array.from(porPaginaMap.entries())
    .map(([pagina, total]) => ({ pagina, total }))
    .sort((a, b) => b.total - a.total);

  visitas.reverse();
  res.json({
    total,
    hoje: visitas.filter(v => v.data === hoje).length,
    unicos,
    porDia,
    porPagina,
    visitas: visitas.slice(0, 200)
  });
});

app.get('/api/planos', (req, res) => {
  const planosDir = path.join(__dirname, 'petrobras-quimica-study-plan');
  const planos = [];

  function scanDir(dir, grupo) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch { return; }
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath, entry.name);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
        const relPath = path.relative(planosDir, fullPath);
        const id = relPath.replace(/\.md$/, '').replace(/\\/g, '/');
        const nome = path.parse(entry.name).name.replace(/-/g, ' ');
        planos.push({ id, nome, grupo: grupo || 'Cronogramas' });
      }
    }
  }

  scanDir(planosDir, '');
  res.json(planos);
});

app.get(/^\/api\/plano\/(.+)$/, (req, res) => {
  const id = req.params[0];
  // Permite "/" (IDs vêm de subpastas, ex: "planos/ciclo-estudos"), mas só
  // caracteres seguros por segmento -- a checagem real de path traversal é o
  // filePath.startsWith(basePath) logo abaixo (path.resolve já normaliza "..").
  if (!id || !/^[a-zA-Z0-9_\-/]+$/.test(id)) return res.status(400).send('ID inválido');
  const basePath = path.resolve(__dirname, 'petrobras-quimica-study-plan');
  const filePath = path.resolve(basePath, `${id}.md`);
  if (!filePath.startsWith(basePath)) return res.status(403).send('Acesso negado');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Documento não encontrado');
  }
});

if (fs.existsSync(frontendDistPath)) {
  app.get('/{*path}', (req, res) => res.sendFile(path.join(frontendDistPath, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

const ehExecucaoDireta = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (ehExecucaoDireta) {
  app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
  });
}

export default app;
