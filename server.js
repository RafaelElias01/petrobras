import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const frontendDistPath = path.join(__dirname, 'dist');

if (!fs.existsSync(frontendDistPath)) {
  console.error("\nERRO: A pasta 'dist' do frontend não foi encontrada.");
  console.error("Execute 'npm run build' primeiro.\n");
}

app.use(express.static(frontendDistPath));

app.get('/api/planos', (req, res) => {
  const planosDir = path.join(__dirname, 'petrobras-quimica-study-plan');
  fs.readdir(planosDir, (err, files) => {
    if (err) return res.status(500).send('Erro ao ler planos.');
    const planos = files
      .filter(f => f.endsWith('.md'))
      .map(file => ({ id: path.parse(file).name, nome: path.parse(file).name.replace(/-/g, ' '), grupo: 'Cronogramas' }));
    res.json(planos);
  });
});

app.get('/api/plano/:id', (req, res) => {
  const filePath = path.join(__dirname, 'petrobras-quimica-study-plan', `${req.params.id}.md`);
  res.sendFile(filePath);
});

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});