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
  next();
});

const frontendDistPath = path.join(__dirname, 'dist');

if (!fs.existsSync(frontendDistPath)) {
  console.error("\nERRO: A pasta 'dist' do frontend não foi encontrada.");
  console.error("Execute 'npm run build' primeiro.\n");
}

app.use(express.static(frontendDistPath));

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
  const idSanitized = id.replace(/\.\.\//g, '').replace(/\.\.\\/g, '').replace(/\//g, path.sep);
  const filePath = path.join(__dirname, 'petrobras-quimica-study-plan', `${idSanitized}.md`);
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
