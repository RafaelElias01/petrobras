import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath, pathToFileURL } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.set('trust proxy', 1);

// Segurança de cabeçalhos. CSP espelha as fontes já usadas no index.html
// (Google Analytics + Facebook Pixel + inline). Não apertar sem testar produção.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://www.googletagmanager.com', 'https://connect.facebook.net'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com', 'https://connect.facebook.net'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://www.facebook.com', 'https://www.google-analytics.com'],
      frameSrc: ["'self'", 'https://www.mercadopago.com.br', 'https://www.mercadopago.com'],
      // VM serve HTTP puro (sem SSL ainda): não forçar upgrade p/ HTTPS,
      // senão o navegador tenta buscar assets em https inexistente. Reativar após certbot.
      upgradeInsecureRequests: null,
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
const sessoes = new Map(); // token -> { usuario, exp }

function criarSessao(usuario) {
  const token = crypto.randomBytes(32).toString('hex');
  sessoes.set(token, { usuario, exp: Date.now() + SESSAO_TTL });
  return token;
}

function usuarioDoToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const s = sessoes.get(token);
  if (!s) return null;
  if (Date.now() > s.exp) { sessoes.delete(token); return null; }
  return s.usuario;
}

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

app.post('/api/auth/register', authLimiter, (req, res) => {
  const { usuario, nome, senha, email } = req.body;
  if (!usuario || typeof usuario !== 'string' || usuario.length < 3) return res.status(400).json({ erro: 'Usuário inválido (mín. 3 caracteres)' });
  if (!nome || typeof nome !== 'string' || nome.length < 2) return res.status(400).json({ erro: 'Nome é obrigatório (mín. 2 caracteres)' });
  if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 200) return res.status(400).json({ erro: 'Email inválido' });
  if (!senha || typeof senha !== 'string' || senha.length < 3 || senha.length > 200) return res.status(400).json({ erro: 'Senha inválida (mín. 3 caracteres)' });
  const usuarios = lerUsuarios();
  if (usuarios.find(u => u.usuario === usuario)) return res.status(409).json({ erro: 'Usuário já existe' });
  if (usuarios.find(u => u.email === email)) return res.status(409).json({ erro: 'Email já cadastrado' });
  const senhaHash = bcrypt.hashSync(senha, 10);
  usuarios.push({ usuario, nome, email, senhaHash, role: 'user', premium: false, criadoEm: new Date().toISOString() });
  salvarUsuarios(usuarios);
  const token = criarSessao(usuario);
  res.json({ ok: true, token, user: { usuario, nome, role: 'user' } });
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || typeof usuario !== 'string' || !senha || typeof senha !== 'string') {
    return res.status(400).json({ erro: 'Credenciais inválidas' });
  }
  const usuarios = lerUsuarios();
  const user = usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase());
  // Compara sempre (mesmo sem usuário) para não vazar timing de existência
  const hashRef = user?.senhaHash || '$2b$10$0000000000000000000000000000000000000000000000000000';
  const ok = bcrypt.compareSync(senha, hashRef);
  if (!user || !ok) return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
  const token = criarSessao(user.usuario);
  res.json({ ok: true, token, user: { usuario: user.usuario, nome: user.nome, role: user.role || 'user' } });
});

const newsPath = process.env.NEWSLETTER_PATH || path.join(__dirname, 'dados', 'newsletter.json');

app.post('/api/newsletter', (req, res) => {
  const { email, nome } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 200) return res.status(400).json({ erro: 'Email inválido' });
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
  const usuarios = lerUsuarios();
  const user = usuarios.find(u => u.usuario === usuario);
  if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json({ premium: user.premium || false, premiumEm: user.premiumEm || null, nome: user.nome, email: user.email || '' });
});

app.post('/api/premium/confirmar', (req, res) => {
  const { usuario } = req.body;
  if (!usuario || typeof usuario !== 'string') return res.status(400).json({ erro: 'Usuário inválido' });
  // Só o próprio usuário autenticado pode confirmar seu premium.
  const autenticado = usuarioDoToken(req);
  if (!autenticado || autenticado.toLowerCase() !== usuario.toLowerCase()) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }
  const usuarios = lerUsuarios();
  const idx = usuarios.findIndex(u => u.usuario === usuario);
  if (idx === -1) return res.status(404).json({ erro: 'Usuário não encontrado' });
  usuarios[idx].premium = true;
  usuarios[idx].premiumEm = new Date().toISOString();
  salvarUsuarios(usuarios);
  res.json({ ok: true, premium: true });
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

app.post('/api/visitas', (req, res) => {
  const { usuario } = req.body;
  if (!usuario || typeof usuario !== 'string' || usuario.length > 50) return res.status(400).json({ erro: 'usuario inválido' });
  const ip = req.ip || 'desconhecido';
  const visitas = lerVisitas();
  visitas.push({
    usuario,
    ip,
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().split(' ')[0],
    timestamp: Date.now()
  });
  salvarVisitas(visitas);
  res.json({ ok: true });
});

app.get('/api/visitas', (req, res) => {
  const visitas = lerVisitas();
  const total = visitas.length;
  const hoje = new Date().toISOString().split('T')[0];
  visitas.reverse();
  res.json({ total, hoje: visitas.filter(v => v.data === hoje).length, visitas: visitas.slice(0, 100) });
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
  const id = req.params[0].replace(/[^a-zA-Z0-9_-]/g, '');
  if (!id) return res.status(400).send('ID inválido');
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
