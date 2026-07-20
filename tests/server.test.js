import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import os from 'os';
import path from 'path';

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

describe('GET /api/plano/:id (path traversal)', () => {
  it('bloqueia tentativa de escapar do diretório base', async () => {
    const res = await request(app).get('/api/plano/..%2F..%2Fserver.js');
    expect(res.status).not.toBe(200);
  });
});

describe('POST /api/visitas', () => {
  it('registra visita e reflete no GET /api/visitas', async () => {
    const post = await request(app).post('/api/visitas').send({ usuario: 'fulano' });
    expect(post.status).toBe(200);
    const get = await request(app).get('/api/visitas');
    expect(get.status).toBe(200);
    expect(get.body.total).toBeGreaterThan(0);
  });
});
