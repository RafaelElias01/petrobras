import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

const frontendDistPath = path.join(__dirname, 'dist');

if (!fs.existsSync(frontendDistPath)) {
  console.error("\nERRO: A pasta 'dist' do frontend não foi encontrada.");
  console.error("Execute 'npm run build' primeiro.\n");
}

app.use(express.json());
app.use(express.static(frontendDistPath));

const visitasPath = path.join(__dirname, 'dados', 'visitas.json');

function lerVisitas() {
  try {
    if (!fs.existsSync(visitasPath)) return [];
    return JSON.parse(fs.readFileSync(visitasPath, 'utf-8'));
  } catch { return []; }
}

function salvarVisitas(data) {
  try {
    const dir = path.dirname(visitasPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(visitasPath, JSON.stringify(data, null, 2));
  } catch (e) { console.error('Erro ao salvar visitas:', e); }
}

app.post('/api/visitas', (req, res) => {
  const { usuario } = req.body;
  if (!usuario) return res.status(400).json({ erro: 'usuario é obrigatório' });
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'desconhecido';
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

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
