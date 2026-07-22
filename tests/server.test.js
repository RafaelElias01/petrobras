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
    expect(res.body.user).toMatchObject({ usuario: 'fulano', role: 'user', premium: false });
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
    expect(res.body.user).toMatchObject({ usuario: 'fulano', premium: false });
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

describe('POST /api/premium/confirmar (removido)', () => {
  it('rota não existe mais -- ativar premium sem passar pelo Mercado Pago era um bypass de pagamento', async () => {
    // Endpoint antigo do fluxo de PIX manual: ativava premium só com o
    // usuário estar autenticado como si mesmo, sem checar pagamento nenhum.
    // Nunca foi chamado pelo frontend desde que o checkout automático via
    // Mercado Pago (criar-preferencia + webhook) entrou no lugar, mas
    // continuou exposto e funcional -- qualquer usuário logado podia
    // ativar premium de graça chamando a rota direto. Removido.
    await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'outrouser', nome: 'Outro', email: 'outro@ex.com', senha: '123456' });
    const res = await request(app).post('/api/premium/confirmar').send({ usuario: 'fulano' });
    expect(res.status).toBe(404);
  });
});

describe('/api/admin/usuarios', () => {
  let tokenComum, tokenAdmin;

  beforeAll(async () => {
    let res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'chefe', nome: 'Chefe', email: 'chefe@ex.com', senha: '123456' });
    tokenAdmin = res.body.token;

    // Promove 'chefe' a admin direto no arquivo -- não existe rota pra
    // "primeiro admin" de propósito (bootstrap é manual/infra, não client-facing).
    const usuarios = JSON.parse(fs.readFileSync(process.env.USUARIOS_PATH, 'utf-8'));
    const idx = usuarios.findIndex(u => u.usuario === 'chefe');
    usuarios[idx].role = 'admin';
    fs.writeFileSync(process.env.USUARIOS_PATH, JSON.stringify(usuarios, null, 2));

    res = await request(app).post('/api/auth/login').send({ usuario: 'fulano', senha: '123456' });
    tokenComum = res.body.token;
  });

  describe('GET', () => {
    it('bloqueia sem token', async () => {
      const res = await request(app).get('/api/admin/usuarios');
      expect(res.status).toBe(403);
    });

    it('bloqueia usuário comum (não-admin)', async () => {
      const res = await request(app).get('/api/admin/usuarios').set('Authorization', `Bearer ${tokenComum}`);
      expect(res.status).toBe(403);
    });

    it('lista usuários reais pra admin, sem vazar senhaHash', async () => {
      const res = await request(app).get('/api/admin/usuarios').set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      expect(res.body.find(u => u.usuario === 'fulano')).toBeTruthy();
      expect(res.body.every(u => u.senhaHash === undefined)).toBe(true);
    });
  });

  describe('POST', () => {
    it('bloqueia usuário comum', async () => {
      const res = await request(app)
        .post('/api/admin/usuarios')
        .set('Authorization', `Bearer ${tokenComum}`)
        .send({ usuario: 'naoautorizado', nome: 'X', senha: '123456' });
      expect(res.status).toBe(403);
    });

    it('admin cria novo usuário e ele passa a existir de verdade em dados/usuarios.json', async () => {
      const res = await request(app)
        .post('/api/admin/usuarios')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ usuario: 'criadopelopainel', nome: 'Criado Pelo Painel', senha: '123456', role: 'user' });
      expect(res.status).toBe(200);
      expect(res.body.senhaHash).toBeUndefined();

      const salvo = JSON.parse(fs.readFileSync(process.env.USUARIOS_PATH, 'utf-8'));
      expect(salvo.find(u => u.usuario === 'criadopelopainel')).toBeTruthy();

      const listaRes = await request(app).get('/api/admin/usuarios').set('Authorization', `Bearer ${tokenAdmin}`);
      expect(listaRes.body.find(u => u.usuario === 'criadopelopainel')).toBeTruthy();
    });
  });

  describe('PUT', () => {
    it('atualiza nome e role de um usuário existente', async () => {
      const res = await request(app)
        .put('/api/admin/usuarios/criadopelopainel')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nome: 'Nome Editado', role: 'admin' });
      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('Nome Editado');
      expect(res.body.role).toBe('admin');
    });

    it('404 pra usuário inexistente', async () => {
      const res = await request(app)
        .put('/api/admin/usuarios/nao-existe')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nome: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE', () => {
    it('bloqueia remover o próprio usuário', async () => {
      const res = await request(app)
        .delete('/api/admin/usuarios/chefe')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(400);
    });

    it('remove outro usuário', async () => {
      const res = await request(app)
        .delete('/api/admin/usuarios/criadopelopainel')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      const salvo = JSON.parse(fs.readFileSync(process.env.USUARIOS_PATH, 'utf-8'));
      expect(salvo.find(u => u.usuario === 'criadopelopainel')).toBeUndefined();
    });

    it('bloqueia rebaixar o último admin restante', async () => {
      // Neste ponto 'chefe' é o único admin.
      await request(app)
        .post('/api/auth/register')
        .send({ usuario: 'outroadmin', nome: 'Outro Admin', email: 'outroadmin@ex.com', senha: '123456' });
      const promove = await request(app)
        .put('/api/admin/usuarios/outroadmin')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ role: 'admin' });
      expect(promove.status).toBe(200);

      // Agora existem 2 admins ('chefe' e 'outroadmin') -- rebaixar um é permitido.
      const rebaixaOk = await request(app)
        .put('/api/admin/usuarios/outroadmin')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ role: 'user' });
      expect(rebaixaOk.status).toBe(200);

      // 'chefe' voltou a ser o único admin -- rebaixar ou remover agora é bloqueado.
      const rebaixaBloqueada = await request(app)
        .put('/api/admin/usuarios/chefe')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ role: 'user' });
      expect(rebaixaBloqueada.status).toBe(400);
    });

    it('bloqueia remover (DELETE) o único admin restante quando outros 2 admins já foram removidos antes', async () => {
      // 3 admins: 'chefe' + 'adminb' + 'adminc'. 'adminb' deleta 'adminc' (3->2,
      // permitido) e depois 'chefe' (2->1, também permitido -- a regra só
      // bloqueia quando o total JÁ é 1). 'adminb' vira o único admin: a
      // checagem de "remover o próprio usuário" roda antes da de "último
      // admin" no código-fonte, então ele não consegue se autodeletar --
      // confirmando que a API nunca deixa o sistema sem nenhum administrador.
      await request(app)
        .post('/api/auth/register')
        .send({ usuario: 'adminb', nome: 'Admin B', email: 'adminb@ex.com', senha: '123456' });
      await request(app)
        .put('/api/admin/usuarios/adminb')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ role: 'admin' });
      await request(app)
        .post('/api/auth/register')
        .send({ usuario: 'adminc', nome: 'Admin C', email: 'adminc@ex.com', senha: '123456' });
      await request(app)
        .put('/api/admin/usuarios/adminc')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ role: 'admin' });

      const loginB = await request(app).post('/api/auth/login').send({ usuario: 'adminb', senha: '123456' });
      const tokenB = loginB.body.token;

      const deleteC = await request(app)
        .delete('/api/admin/usuarios/adminc')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(deleteC.status).toBe(200);

      const deleteChefe = await request(app)
        .delete('/api/admin/usuarios/chefe')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(deleteChefe.status).toBe(200);

      // 'adminb' é agora o único admin -- tentar se autodeletar é bloqueado
      // (por "próprio usuário", não chega a testar "último admin", mas
      // confirma que a API nunca deixa o sistema sem nenhum administrador).
      const autodelete = await request(app)
        .delete('/api/admin/usuarios/adminb')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(autodelete.status).toBe(400);

      const lista = await request(app).get('/api/admin/usuarios').set('Authorization', `Bearer ${tokenB}`);
      expect(lista.body.filter(u => u.role === 'admin').length).toBe(1);

      // 'chefe' foi deletado (não só rebaixado) -- recria via register e
      // promove de novo, restaurando tokenAdmin como admin válido pro resto
      // da suite. Reusa o mesmo email/usuario 'chefe'.
      const recriaChefe = await request(app)
        .post('/api/auth/register')
        .send({ usuario: 'chefe', nome: 'Chefe', email: 'chefe2@ex.com', senha: '123456' });
      tokenAdmin = recriaChefe.body.token;
      await request(app)
        .put('/api/admin/usuarios/chefe')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ role: 'admin' });
    });

    it('rejeita senha inválida (muito curta) ao atualizar usuário via PUT', async () => {
      const res = await request(app)
        .put('/api/admin/usuarios/fulano')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nome: 'Fulano', senha: 'ab' });
      expect(res.status).toBe(400);
      expect(res.body.erro).toMatch(/Senha inválida/);
    });
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
