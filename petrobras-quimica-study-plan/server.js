const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SITE_DIR = path.join(__dirname, 'site');
const DADOS_DIR = path.join(__dirname, 'dados');

if (!fs.existsSync(DADOS_DIR)) {
  fs.mkdirSync(DADOS_DIR, { recursive: true });
}

function sendJSON(res, status, data) {
  const json = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(json);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  const contentType = mime[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method;

  // --- API: listar arquivos ---
  if (url.pathname === '/api/arquivos' && method === 'GET') {
    fs.readdir(DADOS_DIR, (err, files) => {
      if (err) return sendJSON(res, 500, { erro: 'Erro ao ler diretório' });
      sendJSON(res, 200, files.filter(f => f.endsWith('.json')));
    });
    return;
  }

  // --- API: ler arquivo ---
  const lerMatch = url.pathname.match(/^\/api\/dados\/(.+)\.json$/);
  if (lerMatch && method === 'GET') {
    const nome = lerMatch[1];
    const filePath = path.join(DADOS_DIR, nome + '.json');
    if (!filePath.startsWith(DADOS_DIR)) return sendJSON(res, 403, { erro: 'Acesso negado' });
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) sendJSON(res, 200, {});
      else sendJSON(res, 200, JSON.parse(data));
    });
    return;
  }

  // --- API: salvar arquivo ---
  if (lerMatch && method === 'PUT') {
    const nome = lerMatch[1];
    const filePath = path.join(DADOS_DIR, nome + '.json');
    if (!filePath.startsWith(DADOS_DIR)) return sendJSON(res, 403, { erro: 'Acesso negado' });

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8', err => {
          if (err) return sendJSON(res, 500, { erro: 'Erro ao salvar' });
          sendJSON(res, 200, { ok: true });
        });
      } catch(e) {
        sendJSON(res, 400, { erro: 'JSON inválido' });
      }
    });
    return;
  }

  // --- API: deletar dado específico dentro de um arquivo ---
  const delMatch = url.pathname.match(/^\/api\/dados\/(.+)\.json\/(.+)$/);
  if (delMatch && method === 'DELETE') {
    const nome = delMatch[1];
    const chave = decodeURIComponent(delMatch[2]);
    const filePath = path.join(DADOS_DIR, nome + '.json');
    if (!filePath.startsWith(DADOS_DIR)) return sendJSON(res, 403, { erro: 'Acesso negado' });
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) return sendJSON(res, 404, { erro: 'Arquivo não encontrado' });
      const obj = JSON.parse(data);
      if (Array.isArray(obj)) {
        const idx = obj.findIndex(i => i.semana === Number(chave));
        if (idx >= 0) obj.splice(idx, 1);
      } else {
        if (chave.includes('::')) {
          const [p1, p2, p3] = chave.split('::');
          if (obj[p1]?.[p2] !== undefined) delete obj[p1][p2];
        } else {
          delete obj[chave];
        }
      }
      fs.writeFile(filePath, JSON.stringify(obj, null, 2), 'utf-8', err => {
        if (err) return sendJSON(res, 500, { erro: 'Erro ao salvar' });
        sendJSON(res, 200, { ok: true });
      });
    });
    return;
  }

  // --- API: listar planos disponíveis ---
  if (url.pathname === '/api/planos' && method === 'GET') {
    const planos = [
      { id: 'cronograma-cesgranrio', nome: 'Cronograma 12 Semanas (Cesgranrio)', grupo: 'Plano Principal' },
      { id: 'conteudo-programatico', nome: 'Conteúdo Programático Detalhado', grupo: 'Plano Principal' },
      { id: 'checklist-conteudos', nome: 'Checklist de Conteúdos', grupo: 'Ferramentas' },
      { id: 'materias/portugues', nome: 'Português', grupo: 'Matérias' },
      { id: 'materias/matematica', nome: 'Matemática', grupo: 'Matérias' },
      { id: 'materias/quimica-geral', nome: 'Química Geral e Inorgânica', grupo: 'Matérias' },
      { id: 'materias/quimica-organica', nome: 'Química Orgânica', grupo: 'Matérias' },
      { id: 'materias/fisico-quimica', nome: 'Físico-Química', grupo: 'Matérias' },
      { id: 'materias/quimica-analitica', nome: 'Química Analítica', grupo: 'Matérias' },
      { id: 'materias/analise-instrumental', nome: 'Análise Instrumental', grupo: 'Matérias' }
    ];
    sendJSON(res, 200, planos);
    return;
  }

  // --- API: ler arquivo de plano (.md) ---
  const planosMatch = url.pathname.match(/^\/api\/plano\/(.+)$/);
  if (planosMatch && method === 'GET') {
    const nomeArquivo = planosMatch[1] + '.md';
    const caminho = path.join(__dirname, nomeArquivo);
    if (!caminho.startsWith(__dirname)) return sendJSON(res, 403, { erro: 'Acesso negado' });
    fs.readFile(caminho, 'utf-8', (err, data) => {
      if (err) return sendJSON(res, 404, { erro: 'Arquivo não encontrado' });
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // --- Arquivos estáticos ---
  let filePath = url.pathname === '/' ? path.join(SITE_DIR, 'index.html') : path.join(SITE_DIR, url.pathname);
  if (!filePath.startsWith(SITE_DIR)) return sendJSON(res, 403, { erro: 'Acesso negado' });
  sendFile(res, filePath);
});

server.listen(PORT, () => {
  const addr = `http://localhost:${PORT}`;
  console.log(`\n  🧪 Petrobras Study Tracker\n  ${addr}\n`);
});
