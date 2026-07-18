const express = require('express');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const compression = require('compression');
const crypto = require('crypto');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_DIR = path.join(__dirname, 'site');
const DADOS_DIR = path.join(__dirname, 'dados');
const PLANOS_DIR = path.join(__dirname, 'planos');
const USUARIOS_FILE = path.join(DADOS_DIR, 'usuarios.json');
const PREMIUM_FILE = path.join(DADOS_DIR, 'premium.json');

const MP_ACCESS_TOKEN = process.env.MP_TOKEN || 'APP_USR-3935088362204982-071815-adc4f6225c7d4da947e55691c76d2056-33790062';
const SITE_URL = process.env.SITE_URL || 'http://163.176.163.213';

const mercadopago = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
const preferenceClient = new Preference(mercadopago);

if (!fs.existsSync(DADOS_DIR)) {
  fs.mkdirSync(DADOS_DIR, { recursive: true });
}

function sendJSON(res, status, data) {
  const json = JSON.stringify(data, null, 2);
  res.status(status)
     .header('Content-Type', 'application/json; charset=utf-8')
     .header('Access-Control-Allow-Origin', '*')
     .send(json);
}

function hashSenha(senha) {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

async function lerJSON(caminho, padrao) {
  try {
    const data = await fsPromises.readFile(caminho, 'utf-8');
    return JSON.parse(data);
  } catch { return padrao; }
}

async function salvarJSON(caminho, dados) {
  await fsPromises.writeFile(caminho, JSON.stringify(dados, null, 2), 'utf-8');
}

app.use(compression());
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  next();
});

app.get('/api/arquivos', async (req, res) => {
  try {
    const files = await fsPromises.readdir(DADOS_DIR);
    res.json(files.filter(f => f.endsWith('.json')));
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao ler diretório' });
  }
});

app.get('/api/dados/:nome.json', async (req, res) => {
  const nome = req.params.nome;
  const filePath = path.join(DADOS_DIR, nome + '.json');
  if (!filePath.startsWith(DADOS_DIR)) return res.status(403).json({ erro: 'Acesso negado' });
  try {
    const data = await fsPromises.readFile(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.json({});
  }
});

app.put('/api/dados/:nome.json', async (req, res) => {
  const nome = req.params.nome;
  const filePath = path.join(DADOS_DIR, nome + '.json');
  if (!filePath.startsWith(DADOS_DIR)) return res.status(403).json({ erro: 'Acesso negado' });
  try {
    await fsPromises.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar' });
  }
});

app.delete('/api/dados/:nome.json/:chave', async (req, res) => {
  const { nome, chave: chaveEnc } = req.params;
  const chave = decodeURIComponent(chaveEnc);
  const filePath = path.join(DADOS_DIR, nome + '.json');
  if (!filePath.startsWith(DADOS_DIR)) return res.status(403).json({ erro: 'Acesso negado' });
  try {
    const data = await fsPromises.readFile(filePath, 'utf-8');
    const obj = JSON.parse(data);
    if (Array.isArray(obj)) {
      const idx = obj.findIndex(i => i.semana === Number(chave));
      if (idx >= 0) obj.splice(idx, 1);
    } else {
      if (chave.includes('::')) {
        const [p1, p2] = chave.split('::');
        if (obj[p1]?.[p2] !== undefined) delete obj[p1][p2];
      } else {
        delete obj[chave];
      }
    }
    await fsPromises.writeFile(filePath, JSON.stringify(obj, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ erro: 'Arquivo não encontrado' });
    res.status(500).json({ erro: 'Erro ao salvar' });
  }
});

app.get('/api/planos', (req, res, next) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
}, async (req, res) => {
  try {
    const lerDiretorio = async (subDir, grupo) => {
      const dirCompleto = path.join(PLANOS_DIR, subDir);
      const entradas = await fsPromises.readdir(dirCompleto, { withFileTypes: true });
      const planos = [];
      for (const entrada of entradas) {
        if (entrada.isFile() && entrada.name.endsWith('.md')) {
          const id = path.join(subDir, entrada.name.replace('.md', '')).replace(/\\/g, '/');
          const nome = entrada.name.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          planos.push({ id, nome, grupo });
        }
      }
      return planos;
    };
    const grupos = [
      { path: '.', grupo: 'Cronogramas e Planos' },
      { path: 'materias', grupo: 'Matérias' },
      { path: 'resumos', grupo: 'Resumos' },
      { path: 'simulados', grupo: 'Simulados' },
    ];
    const promessas = grupos.map(g => lerDiretorio(g.path, g.grupo));
    const resultados = await Promise.all(promessas);
    res.json(resultados.flat());
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar planos de estudo', detalhe: err.message });
  }
});

const planoHandler = async (req, res) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
  const { grupo, nome } = req.params;
  const subPath = grupo ? path.join(grupo, nome) : nome;
  const caminho = path.join(PLANOS_DIR, subPath + '.md');
  if (!caminho.startsWith(PLANOS_DIR)) return res.status(403).json({ erro: 'Acesso negado' });
  try {
    const data = await fsPromises.readFile(caminho, 'utf-8');
    res.header('Content-Type', 'text/plain; charset=utf-8').send(data);
  } catch (err) {
    res.status(404).json({ erro: 'Arquivo não encontrado' });
  }
};

app.get('/api/plano/:grupo/:nome', planoHandler);
app.get('/api/plano/:nome', planoHandler);

app.use(express.static(SITE_DIR));

// ===================== AUTH =====================
app.post('/api/auth/register', async (req, res) => {
  const { usuario, senha, nome, email } = req.body;
  if (!usuario || !senha || !nome) return sendJSON(res, 400, { erro: 'Campos obrigatorios: usuario, senha, nome' });
  if (usuario.length < 3) return sendJSON(res, 400, { erro: 'Usuario deve ter pelo menos 3 caracteres' });
  if (senha.length < 4) return sendJSON(res, 400, { erro: 'Senha deve ter pelo menos 4 caracteres' });

  const usuarios = await lerJSON(USUARIOS_FILE, []);
  if (usuarios.find(u => u.usuario === usuario)) return sendJSON(res, 400, { erro: 'Usuario ja existe' });

  const novo = { usuario, senhaHash: hashSenha(senha), nome, email: email || '', role: 'user', premium: false, dataCadastro: new Date().toISOString() };
  usuarios.push(novo);
  await salvarJSON(USUARIOS_FILE, usuarios);
  sendJSON(res, 201, { ok: true, usuario: { usuario: novo.usuario, nome: novo.nome, role: novo.role, premium: false } });
});

app.post('/api/auth/login', async (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) return sendJSON(res, 400, { erro: 'Campos obrigatorios' });

  const usuarios = await lerJSON(USUARIOS_FILE, []);
  const encontrado = usuarios.find(u => u.usuario === usuario && u.senhaHash === hashSenha(senha));
  if (!encontrado) return sendJSON(res, 401, { erro: 'Usuario ou senha invalidos' });

  sendJSON(res, 200, { ok: true, usuario: { usuario: encontrado.usuario, nome: encontrado.nome, role: encontrado.role, premium: !!encontrado.premium } });
});

// ===================== MERCADO PAGO =====================
app.post('/api/mercadopago/preference', async (req, res) => {
  const { usuario, email } = req.body;
  if (!usuario) return sendJSON(res, 400, { erro: 'Usuario obrigatorio' });

  try {
    const preference = await preferenceClient.create({
      body: {
        items: [{ id: 'premium-petrobras', title: 'Petrobras Academy - Acesso Premium', description: 'Acesso vitalicio a todas as ferramentas de estudo para concurso Petrobras', quantity: 1, currency_id: 'BRL', unit_price: 49.90 }],
        payer: { email: email || '' },
        back_urls: { success: `${SITE_URL}/?premium=sucesso`, failure: `${SITE_URL}/?premium=erro`, pending: `${SITE_URL}/?premium=pendente` },
        auto_return: 'approved',
        external_reference: usuario,
        notification_url: `${SITE_URL}/api/mercadopago/webhook`,
        metadata: { usuario }
      }
    });

    sendJSON(res, 200, { init_point: preference.init_point, preference_id: preference.id });
  } catch (err) {
    console.error('Erro MP:', err);
    sendJSON(res, 500, { erro: 'Erro ao criar pagamento' });
  }
});

app.post('/api/mercadopago/webhook', async (req, res) => {
  res.status(200).send('ok');

  const { action, data } = req.body;
  if (action !== 'payment.created' && action !== 'payment.updated') return;
  if (!data?.id) return;

  try {
    const https = require('https');
    const options = { hostname: 'api.mercadopago.com', path: `/v1/payments/${data.id}`, method: 'GET', headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` } };
    const reqMP = https.request(options, (resMP) => {
      let body = '';
      resMP.on('data', c => body += c);
      resMP.on('end', async () => {
        const payment = JSON.parse(body);
        if (payment.status === 'approved') {
          const usuario = payment.external_reference || payment.metadata?.usuario;
          if (usuario) {
            const usuarios = await lerJSON(USUARIOS_FILE, []);
            const idx = usuarios.findIndex(u => u.usuario === usuario);
            if (idx >= 0) {
              usuarios[idx].premium = true;
              usuarios[idx].dataPremium = new Date().toISOString();
              usuarios[idx].paymentId = data.id;
              await salvarJSON(USUARIOS_FILE, usuarios);
              console.log(`Premium ativado para: ${usuario}`);
            }
          }
        }
      });
    });
    reqMP.end();
  } catch (err) { console.error('Erro webhook:', err); }
});

app.get('/api/premium/status/:usuario', async (req, res) => {
  const { usuario } = req.params;
  const usuarios = await lerJSON(USUARIOS_FILE, []);
  const encontrado = usuarios.find(u => u.usuario === usuario);
  sendJSON(res, 200, { premium: encontrado ? !!encontrado.premium : false });
});

function tentarPorta(port) {
  const server = app.listen(port, () => {
    const addr = `http://localhost:${port}`;
    console.log(`\n  \uD83E\uDDEA Petrobras Study Tracker\n  ${addr}\n`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`  Porta ${port} ocupada, tentando ${port + 1}...`);
      tentarPorta(port + 1);
    } else {
      console.error('  Erro ao iniciar servidor:', err.message);
      process.exit(1);
    }
  });
}

tentarPorta(PORT);
