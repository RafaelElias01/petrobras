import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { hojeBrasiliaISO } from '../dataLocal.js';

let app;
let tmpDir;

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'petrobras-test-'));
  process.env.USUARIOS_PATH = path.join(tmpDir, 'usuarios.json');
  process.env.NEWSLETTER_PATH = path.join(tmpDir, 'newsletter.json');
  process.env.VISITAS_PATH = path.join(tmpDir, 'visitas.json');
  ({ default: app } = await import('../server.js'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('POST /api/auth/register', () => {
  it('rejeita senha curta', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'ab1', nome: 'Fulano', email: 'a@b.com', senha: 'xy' });
    expect(res.status).toBe(400);
  });

  it('rejeita email inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'fulano1', nome: 'Fulano', email: 'sem-arroba', senha: '123456' });
    expect(res.status).toBe(400);
  });

  it('cria usuário e retorna token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'fulano', nome: 'Fulano', email: 'fulano@ex.com', senha: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toMatchObject({ usuario: 'fulano', role: 'user' });
  });

  it('rejeita usuário duplicado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'fulano', nome: 'Fulano2', email: 'fulano2@ex.com', senha: '123456' });
    expect(res.status).toBe(409);
  });

  it('nunca grava senha em texto plano no arquivo', () => {
    const salvo = JSON.parse(fs.readFileSync(process.env.USUARIOS_PATH, 'utf-8'));
    const user = salvo.find(u => u.usuario === 'fulano');
    expect(user.senha).toBeUndefined();
    expect(user.senhaHash).toMatch(/^\$2[aby]\$/);
  });
});

describe('POST /api/auth/login', () => {
  it('loga com credenciais corretas', async () => {
    const res = await request(app).post('/api/auth/login').send({ usuario: 'fulano', senha: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejeita senha errada', async () => {
    const res = await request(app).post('/api/auth/login').send({ usuario: 'fulano', senha: 'errada' });
    expect(res.status).toBe(401);
  });

  it('rejeita usuário inexistente sem vazar qual campo está errado', async () => {
    const res = await request(app).post('/api/auth/login').send({ usuario: 'nao-existe', senha: 'qualquer' });
    expect(res.status).toBe(401);
    expect(res.body.erro).toBe('Usuário ou senha inválidos');
  });
});

describe('POST /api/premium/confirmar', () => {
  it('bloqueia sem token', async () => {
    const res = await request(app).post('/api/premium/confirmar').send({ usuario: 'fulano' });
    expect(res.status).toBe(401);
  });

  it('bloqueia token de um usuário tentando confirmar premium de outro', async () => {
    const outro = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'outrouser', nome: 'Outro', email: 'outro@ex.com', senha: '123456' });
    const res = await request(app)
      .post('/api/premium/confirmar')
      .set('Authorization', `Bearer ${outro.body.token}`)
      .send({ usuario: 'fulano' });
    expect(res.status).toBe(401);
  });

  it('permite confirmar o próprio premium com token válido', async () => {
    const login = await request(app).post('/api/auth/login').send({ usuario: 'fulano', senha: '123456' });
    const res = await request(app)
      .post('/api/premium/confirmar')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ usuario: 'fulano' });
    expect(res.status).toBe(200);
    expect(res.body.premium).toBe(true);
  });
});

describe('POST /api/demo/incrementar', () => {
  it('bloqueia sem token', async () => {
    const res = await request(app).post('/api/demo/incrementar');
    expect(res.status).toBe(401);
  });

  it('bloqueia usuário que não é o demo estudante', async () => {
    const login = await request(app).post('/api/auth/login').send({ usuario: 'fulano', senha: '123456' });
    const res = await request(app)
      .post('/api/demo/incrementar')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(400);
  });

  it('incrementa e marca expirado ao atingir o máximo de acessos', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'estudante', nome: 'Estudante', email: 'estudante@ex.com', senha: '123456' });
    const login = await request(app).post('/api/auth/login').send({ usuario: 'estudante', senha: '123456' });
    const token = login.body.token;
    let ultimo;
    for (let i = 0; i < 5; i++) {
      ultimo = await request(app).post('/api/demo/incrementar').set('Authorization', `Bearer ${token}`);
    }
    expect(ultimo.status).toBe(200);
    expect(ultimo.body.count).toBe(5);
    expect(ultimo.body.expirado).toBe(true);
  });
});

describe('POST /api/premium/criar-preferencia', () => {
  it('bloqueia sem autenticacao', async () => {
    const res = await request(app).post('/api/premium/criar-preferencia');
    expect(res.status).toBe(401);
  });

  it('retorna 503 quando Mercado Pago nao esta configurado (sem MP_ACCESS_TOKEN)', async () => {
    const login = await request(app).post('/api/auth/login').send({ usuario: 'fulano', senha: '123456' });
    const res = await request(app)
      .post('/api/premium/criar-preferencia')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(503);
  });

  it('bloqueia a conta demo "estudante" de assinar premium (conta compartilhada)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'estudante', nome: 'Estudante', email: 'estudante-teste@ex.com', senha: '123456' });
    const login = await request(app).post('/api/auth/login').send({ usuario: 'estudante', senha: '123456' });
    const res = await request(app)
      .post('/api/premium/criar-preferencia')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(403);
  });
});

describe('POST /api/premium/webhook', () => {
  it('retorna 503 quando Mercado Pago nao esta configurado (sem MP_ACCESS_TOKEN)', async () => {
    const res = await request(app).post('/api/premium/webhook');
    expect(res.status).toBe(503);
  });
});

describe('GET /api/materiais/:nome', () => {
  it('bloqueia tentativa de path traversal (nome não bate com a whitelist)', async () => {
    const res = await request(app).get('/api/materiais/%2e%2e%2fserver.js');
    expect(res.status).toBe(403);
  });

  it('bloqueia nome que não está na whitelist', async () => {
    const res = await request(app).get('/api/materiais/segredo.md');
    expect(res.status).toBe(403);
  });
});

describe('GET /api/planos e GET /api/plano/:id', () => {
  it('lista os planos reais com grupo por subpasta', async () => {
    const res = await request(app).get('/api/planos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.find(p => p.id === 'planos/ciclo-estudos')).toBeTruthy();
  });

  it('busca um documento com ID aninhado (contém "/")', async () => {
    // Regressão: regex de sanitização já removeu "/" do ID, quebrando todo
    // acesso a documento (todo ID vem de subpasta, ex: "planos/ciclo-estudos").
    const res = await request(app).get('/api/plano/planos/ciclo-estudos');
    expect(res.status).toBe(200);
  });

  it('bloqueia tentativa de escapar do diretório base (path traversal)', async () => {
    const res = await request(app).get('/api/plano/..%2F..%2Fserver.js');
    expect(res.status).not.toBe(200);
  });

  it('bloqueia "." literal no ID (a regex de validação não permite ponto)', async () => {
    const res = await request(app).get('/api/plano/planos%2F%2E%2E%2Fserver');
    expect(res.status).not.toBe(200);
  });

  it('retorna 404 pra documento inexistente com ID válido', async () => {
    const res = await request(app).get('/api/plano/planos/nao-existe-de-verdade');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/visitas', () => {
  it('registra visita anônima (ignora usuario do body, sem token) e reflete no GET /api/visitas (admin)', async () => {
    const post = await request(app).post('/api/visitas').send({ usuario: 'fulano' });
    expect(post.status).toBe(200);

    // GET /api/visitas agora exige token de admin.
    const usuarios = JSON.parse(fs.readFileSync(process.env.USUARIOS_PATH, 'utf-8'));
    const idx = usuarios.findIndex(u => u.usuario === 'fulano');
    usuarios[idx].role = 'admin';
    fs.writeFileSync(process.env.USUARIOS_PATH, JSON.stringify(usuarios, null, 2));
    const login = await request(app).post('/api/auth/login').send({ usuario: 'fulano', senha: '123456' });

    const get = await request(app)
      .get('/api/visitas')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(get.status).toBe(200);
    expect(get.body.total).toBeGreaterThan(0);
    // O campo `usuario` do body é ignorado sem token: fica registrado como anônimo.
    expect(get.body.visitas.find(v => v.usuario === 'anônimo')).toBeTruthy();
  });

  it('bloqueia GET /api/visitas sem token', async () => {
    const res = await request(app).get('/api/visitas');
    expect(res.status).toBe(401);
  });

  it('bloqueia GET /api/visitas com token de usuário não-admin', async () => {
    const login = await request(app).post('/api/auth/login').send({ usuario: 'outrouser', senha: '123456' });
    const res = await request(app)
      .get('/api/visitas')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(403);
  });

  it('usa o usuário do token (não o do body) quando autenticado', async () => {
    const login = await request(app).post('/api/auth/login').send({ usuario: 'outrouser', senha: '123456' });
    const post = await request(app)
      .post('/api/visitas')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ usuario: 'usuario-forjado' });
    expect(post.status).toBe(200);

    const adminLogin = await request(app).post('/api/auth/login').send({ usuario: 'fulano', senha: '123456' });
    const get = await request(app)
      .get('/api/visitas')
      .set('Authorization', `Bearer ${adminLogin.body.token}`);
    expect(get.body.visitas.find(v => v.usuario === 'outrouser')).toBeTruthy();
    expect(get.body.visitas.find(v => v.usuario === 'usuario-forjado')).toBeFalsy();
  });

  it('registra a página válida enviada e cai em "dashboard" para valores inválidos; grava e conta "hoje" em horário de Brasília', async () => {
    // Regressão de fuso: a VM de produção roda em UTC, mas o público é 100%
    // Brasil. Antes desta correção, tanto a gravação (POST) quanto a
    // contagem "hoje" (GET) usavam new Date().toISOString() (UTC do
    // processo), fazendo visitas registradas à noite (horário de Brasília)
    // contarem como "ontem" no fuso do servidor, ou vice-versa dependendo da
    // hora. Usa hojeBrasiliaISO() (a mesma função do código de produção) em
    // vez de uma data hardcoded, pra continuar correto em qualquer fuso do
    // executor -- incluindo o do CI (UTC).
    await request(app).post('/api/visitas').send({ pagina: 'flashcards' });
    await request(app).post('/api/visitas').send({ pagina: 'pagina-que-nao-existe' });

    const adminLogin = await request(app).post('/api/auth/login').send({ usuario: 'fulano', senha: '123456' });
    const get = await request(app)
      .get('/api/visitas')
      .set('Authorization', `Bearer ${adminLogin.body.token}`);

    expect(get.body.visitas.some(v => v.pagina === 'flashcards')).toBe(true);
    expect(get.body.visitas.some(v => v.pagina === 'pagina-que-nao-existe')).toBe(false);
    expect(Array.isArray(get.body.porDia)).toBe(true);
    expect(Array.isArray(get.body.porPagina)).toBe(true);
    expect(typeof get.body.unicos).toBe('number');

    const registroRecente = get.body.visitas[0];
    expect(registroRecente.data).toBe(hojeBrasiliaISO());
    expect(get.body.hoje).toBeGreaterThan(0);
  });
});
