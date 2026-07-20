import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { erro: 'Muitas requisições. Tente novamente em alguns minutos.' }
});
app.use('/api/', limiter);

const frontendDistPath = path.join(__dirname, 'dist');

if (!fs.existsSync(frontendDistPath)) {
  console.error("\nERRO: A pasta 'dist' do frontend não foi encontrada.");
  console.error("Execute 'npm run build' primeiro.\n");
}

app.use(express.json());
app.use(express.static(frontendDistPath));

const usuariosPath = path.join(__dirname, 'dados', 'usuarios.json');

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
    const dir = path.dirname(usuariosPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(usuariosPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Erro ao salvar usuarios:', e);
  }
}

app.post('/api/auth/register', (req, res) => {
  const { usuario, nome, senha, email } = req.body;
  if (!usuario || typeof usuario !== 'string' || usuario.length < 3) return res.status(400).json({ erro: 'Usuário inválido (mín. 3 caracteres)' });
  if (!nome || typeof nome !== 'string' || nome.length < 2) return res.status(400).json({ erro: 'Nome é obrigatório (mín. 2 caracteres)' });
  if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 200) return res.status(400).json({ erro: 'Email inválido' });
  if (!senha || typeof senha !== 'string' || senha.length < 3) return res.status(400).json({ erro: 'Senha inválida (mín. 3 caracteres)' });
  const usuarios = lerUsuarios();
  if (usuarios.find(u => u.usuario === usuario)) return res.status(409).json({ erro: 'Usuário já existe' });
  if (usuarios.find(u => u.email === email)) return res.status(409).json({ erro: 'Email já cadastrado' });
  usuarios.push({ usuario, nome, email, senha, role: 'user', premium: false, criadoEm: new Date().toISOString() });
  salvarUsuarios(usuarios);
  res.json({ ok: true });
});

app.post('/api/newsletter', (req, res) => {
  const { email, nome } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 200) return res.status(400).json({ erro: 'Email inválido' });
  if (!nome || typeof nome !== 'string' || nome.length < 2) return res.status(400).json({ erro: 'Nome é obrigatório' });
  const newsPath = path.join(__dirname, 'dados', 'newsletter.json');
  let inscricoes = [];
  try {
    if (fs.existsSync(newsPath)) inscricoes = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));
  } catch (e) { /* ignore */ }
  if (inscricoes.find(i => i.email === email)) return res.json({ ok: true, message: 'Email já cadastrado' });
  inscricoes.push({ email, nome, origem: req.headers.referer || 'direto', criadoEm: new Date().toISOString() });
  try {
    const dir = path.dirname(newsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(newsPath, JSON.stringify(inscricoes, null, 2));
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

const visitasPath = path.join(__dirname, 'dados', 'visitas.json');

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
    const dir = path.dirname(visitasPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(visitasPath, JSON.stringify(data, null, 2));
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

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
