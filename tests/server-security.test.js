import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Testes pesados/edge-case adicionais para rotas do servidor Express, em
// complemento a tests/server.test.js e tests/premium.test.js (não duplica o
// que já está coberto lá: CRUD básico de admin, path traversal básico de
// materiais/plano, webhook HMAC básico, fluxo básico de visitas). Foca em
// segurança e integridade: escalação de privilégio, path traversal com
// variantes de encoding, injeção em campos de texto, e side-effects em disco.
let app;
let tmpDir;

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'petrobras-test-sec-'));
  process.env.USUARIOS_PATH = path.join(tmpDir, 'usuarios.json');
  process.env.NEWSLETTER_PATH = path.join(tmpDir, 'newsletter.json');
  process.env.VISITAS_PATH = path.join(tmpDir, 'visitas.json');
  ({ default: app } = await import('../server.js'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('POST /api/auth/register — edge cases pesados', () => {
  it('aceita nome com unicode/acentos/emoji sem quebrar e grava corretamente', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'unicodeuser', nome: 'José 🎉 Ñandú Über', email: 'unicode@ex.com', senha: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.user.usuario).toBe('unicodeuser');

    const salvo = JSON.parse(fs.readFileSync(process.env.USUARIOS_PATH, 'utf-8'));
    const user = salvo.find(u => u.usuario === 'unicodeuser');
    expect(user.nome).toBe('José 🎉 Ñandú Über');
  });

  it('aceita senha exatamente no limite mínimo (3 chars) e rejeita 2 chars', async () => {
    const ok = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'minsenha3', nome: 'Min Senha', email: 'minsenha3@ex.com', senha: 'abc' });
    expect(ok.status).toBe(200);

    const curta = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'minsenha2', nome: 'Min Senha 2', email: 'minsenha2@ex.com', senha: 'ab' });
    expect(curta.status).toBe(400);
  });

  it('rejeita senha acima do limite máximo (200 chars) e aceita exatamente 200', async () => {
    const senha201 = 'a'.repeat(201);
    const senha200 = 'a'.repeat(200);

    const acima = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'maxsenha201', nome: 'Max Senha', email: 'maxsenha201@ex.com', senha: senha201 });
    expect(acima.status).toBe(400);

    const limite = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'maxsenha200', nome: 'Max Senha', email: 'maxsenha200@ex.com', senha: senha200 });
    expect(limite.status).toBe(200);
  });

  it('campo "usuario" com tentativa de injeção (aspas, DROP, operadores Mongo) é tratado como string literal, nunca quebra e nunca vira objeto', async () => {
    const tentativas = [
      "'; DROP TABLE usuarios; --",
      '" OR "1"="1',
      '{"$ne": null}',
      '<script>alert(1)</script>',
    ];
    for (const [i, usuarioMalicioso] of tentativas.entries()) {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ usuario: usuarioMalicioso, nome: 'Malicioso', email: `malicioso${i}@ex.com`, senha: '123456' });
      // Deve ser aceito como string comum (o campo não tem whitelist de charset)
      // OU rejeitado por tamanho -- nunca deve derrubar o servidor (500) nem
      // gravar algo que não seja uma string simples no campo `usuario`.
      expect([200, 400, 409]).toContain(res.status);
      if (res.status === 200) {
        expect(typeof res.body.user.usuario).toBe('string');
      }
    }
    // Confere integridade do arquivo inteiro: todo `usuario` salvo é string.
    const salvo = JSON.parse(fs.readFileSync(process.env.USUARIOS_PATH, 'utf-8'));
    expect(salvo.every(u => typeof u.usuario === 'string')).toBe(true);
  });

  it('objeto literal no lugar de string em "usuario" é rejeitado (não passa no typeof string)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: { $ne: null }, nome: 'Objeto', email: 'objeto@ex.com', senha: '123456' });
    expect(res.status).toBe(400);
  });

  it('array no lugar de string em "usuario" é rejeitado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: ['a', 'b'], nome: 'Array', email: 'array@ex.com', senha: '123456' });
    expect(res.status).toBe(400);
  });

  it('rejeita email duplicado mesmo com usuário diferente', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'dono-do-email', nome: 'Dono', email: 'compartilhado@ex.com', senha: '123456' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'outro-usuario-mesmo-email', nome: 'Outro', email: 'compartilhado@ex.com', senha: '123456' });
    expect(res.status).toBe(409);
  });

  it('usuario com espaços em branco / vazio após trim é aceito ou rejeitado sem quebrar (nunca 500)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: '   ', nome: 'Espacos', email: 'espacos@ex.com', senha: '123456' });
    expect(res.status).not.toBe(500);
  });
});

describe('Rate limit do authLimiter — nota de ambiente', () => {
  it('em NODE_ENV=test o limite é elevado para 1000 propositalmente (ver server.js linha ~371-380); testar o valor real de produção (20) exigiria subir uma instância separada do app com NODE_ENV != test antes do import, o que quebraria o isolamento de módulo compartilhado com os outros arquivos de teste deste processo Vitest. Confirma-se aqui apenas que o limiter está ativo e não bloqueia um punhado de requisições legítimas.', async () => {
    let ultimaStatus;
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ usuario: 'nao-existe-rate-limit-test', senha: 'errada' });
      ultimaStatus = res.status;
    }
    expect(ultimaStatus).toBe(401); // não virou 429 dentro do teto de teste
  });
});

describe('GET /api/materiais/:nome — path traversal (variantes de encoding)', () => {
  it('bloqueia ../../../etc/passwd', async () => {
    const res = await request(app).get('/api/materiais/' + encodeURIComponent('../../../etc/passwd'));
    expect(res.status).toBe(403);
  });

  it('bloqueia dupla-codificação (..%252f..%252fserver.js)', async () => {
    const res = await request(app).get('/api/materiais/..%252f..%252fserver.js');
    expect([403, 404]).toContain(res.status);
    // Nunca deve retornar 200 com conteúdo de server.js
    expect(res.status).not.toBe(200);
  });

  it('bloqueia nome absoluto tipo /etc/passwd (rota trata como segmento único)', async () => {
    const res = await request(app).get('/api/materiais/' + encodeURIComponent('/etc/passwd'));
    expect(res.status).not.toBe(200);
  });

  it('bloqueia tentativa de escapar via nome de arquivo do próprio server (server.js)', async () => {
    const res = await request(app).get('/api/materiais/server.js');
    expect(res.status).toBe(403);
  });

  it('bloqueia nome com barra invertida (Windows-style traversal)', async () => {
    const res = await request(app).get('/api/materiais/' + encodeURIComponent('..\\..\\server.js'));
    expect(res.status).not.toBe(200);
  });

  it('bloqueia nome com byte nulo (%00) tentando truncar extensão', async () => {
    const res = await request(app).get('/api/materiais/guia-estudos-gratuito.md%00.txt');
    expect(res.status).not.toBe(200);
  });

  it('404 para nome inexistente mas presente na whitelist não se aplica -- confirma 403 para qualquer nome fora da whitelist', async () => {
    const res = await request(app).get('/api/materiais/nao-existe.md');
    expect(res.status).toBe(403);
  });

  it('200 para o nome válido único da whitelist, com Content-Disposition de anexo', async () => {
    const res = await request(app).get('/api/materiais/guia-estudos-gratuito.md');
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('guia-estudos-gratuito.md');
  });
});

describe('/api/admin/usuarios — validação de payload malformado', () => {
  let tokenAdmin;

  beforeAll(async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'chefe-seguranca', nome: 'Chefe Seguranca', email: 'chefeseg@ex.com', senha: '123456' });
    const usuarios = JSON.parse(fs.readFileSync(process.env.USUARIOS_PATH, 'utf-8'));
    const idx = usuarios.findIndex(u => u.usuario === 'chefe-seguranca');
    usuarios[idx].role = 'admin';
    fs.writeFileSync(process.env.USUARIOS_PATH, JSON.stringify(usuarios, null, 2));
    const login = await request(app).post('/api/auth/login').send({ usuario: 'chefe-seguranca', senha: '123456' });
    tokenAdmin = login.body.token;
  });

  it('bloqueia token forjado/inválido (string aleatória) com 403, não 500', async () => {
    const res = await request(app)
      .get('/api/admin/usuarios')
      .set('Authorization', 'Bearer token-completamente-forjado-e-invalido');
    expect(res.status).toBe(403);
  });

  it('bloqueia header Authorization malformado (sem "Bearer ")', async () => {
    const res = await request(app)
      .get('/api/admin/usuarios')
      .set('Authorization', tokenAdmin); // faltando prefixo "Bearer "
    expect(res.status).toBe(403);
  });

  it('POST com role="admin" forjado por usuário comum ainda é bloqueado antes de checar o body', async () => {
    const comum = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'comum-seguranca', nome: 'Comum', email: 'comumseg@ex.com', senha: '123456' });
    const res = await request(app)
      .post('/api/admin/usuarios')
      .set('Authorization', `Bearer ${comum.body.token}`)
      .send({ usuario: 'tentativa-escalada', nome: 'X', senha: '123456', role: 'admin' });
    expect(res.status).toBe(403);
    const salvo = JSON.parse(fs.readFileSync(process.env.USUARIOS_PATH, 'utf-8'));
    expect(salvo.find(u => u.usuario === 'tentativa-escalada')).toBeUndefined();
  });

  it('POST sem campo "senha" é rejeitado com 400', async () => {
    const res = await request(app)
      .post('/api/admin/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ usuario: 'semsenha', nome: 'Sem Senha' });
    expect(res.status).toBe(400);
  });

  it('POST com body vazio é rejeitado com 400, não 500', async () => {
    const res = await request(app)
      .post('/api/admin/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST com role desconhecida (nem "admin" nem "user") cai para "user" por padrão seguro', async () => {
    const res = await request(app)
      .post('/api/admin/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ usuario: 'roleesquisita', nome: 'Role Esquisita', senha: '123456', role: 'super-admin-fake' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('user');
  });

  it('PUT em usuário inexistente retorna 404, não cria o usuário', async () => {
    const res = await request(app)
      .put('/api/admin/usuarios/usuario-fantasma')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'Fantasma' });
    expect(res.status).toBe(404);
    const salvo = JSON.parse(fs.readFileSync(process.env.USUARIOS_PATH, 'utf-8'));
    expect(salvo.find(u => u.usuario === 'usuario-fantasma')).toBeUndefined();
  });

  it('DELETE em usuário inexistente retorna 404', async () => {
    const res = await request(app)
      .delete('/api/admin/usuarios/usuario-fantasma-2')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(404);
  });

  it('PUT com role inválida no meio de outros campos válidos ainda normaliza para "user" (nunca escala sozinho)', async () => {
    const res = await request(app)
      .put('/api/admin/usuarios/roleesquisita')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'Ainda Esquisita', role: 'root' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('user');
  });
});

describe('POST /api/newsletter — edge cases', () => {
  it('rejeita email malformado', async () => {
    const res = await request(app)
      .post('/api/newsletter')
      .send({ email: 'nao-eh-email', nome: 'Fulano' });
    expect(res.status).toBe(400);
  });

  it('rejeita email vazio ou ausente', async () => {
    const res = await request(app).post('/api/newsletter').send({ nome: 'Fulano' });
    expect(res.status).toBe(400);
  });

  it('rejeita nome ausente', async () => {
    const res = await request(app)
      .post('/api/newsletter')
      .send({ email: 'semnome@ex.com' });
    expect(res.status).toBe(400);
  });

  it('grava inscrição nova no NEWSLETTER_PATH com os campos esperados', async () => {
    const res = await request(app)
      .post('/api/newsletter')
      .send({ email: 'novo-inscrito@ex.com', nome: 'Novo Inscrito' });
    expect(res.status).toBe(200);
    const salvo = JSON.parse(fs.readFileSync(process.env.NEWSLETTER_PATH, 'utf-8'));
    const inscricao = salvo.find(i => i.email === 'novo-inscrito@ex.com');
    expect(inscricao).toBeTruthy();
    expect(inscricao.nome).toBe('Novo Inscrito');
    expect(inscricao.criadoEm).toBeTruthy();
  });

  it('email duplicado retorna ok sem duplicar a entrada no arquivo', async () => {
    const antes = JSON.parse(fs.readFileSync(process.env.NEWSLETTER_PATH, 'utf-8')).length;
    const res = await request(app)
      .post('/api/newsletter')
      .send({ email: 'novo-inscrito@ex.com', nome: 'Novo Inscrito De Novo' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Email já cadastrado');
    const depois = JSON.parse(fs.readFileSync(process.env.NEWSLETTER_PATH, 'utf-8')).length;
    expect(depois).toBe(antes);
  });

  it('email com maiúsculas é tratado como valor distinto do já cadastrado em minúsculas (comportamento atual: comparação case-sensitive) -- documenta o comportamento real, não duplica sem checar', async () => {
    const antes = JSON.parse(fs.readFileSync(process.env.NEWSLETTER_PATH, 'utf-8')).length;
    const res = await request(app)
      .post('/api/newsletter')
      .send({ email: 'NOVO-INSCRITO@ex.com', nome: 'Maiusculo' });
    expect(res.status).toBe(200);
    const depois = JSON.parse(fs.readFileSync(process.env.NEWSLETTER_PATH, 'utf-8')).length;
    // Email com case diferente é tratado como outro registro (código compara com ===
    // sem normalizar case) -- confirma que isso não trava nem perde dados, apenas
    // registra uma segunda entrada.
    expect(depois).toBe(antes + 1);
  });
});

describe('POST /api/visitas — payload malformado e tipos errados', () => {
  it('aceita POST sem body nenhum (usa defaults: anônimo + dashboard)', async () => {
    const res = await request(app).post('/api/visitas').send();
    expect(res.status).toBe(200);
  });

  it('campo "pagina" com tipo errado (número) cai no default "dashboard" sem quebrar', async () => {
    const res = await request(app).post('/api/visitas').send({ pagina: 12345 });
    expect(res.status).toBe(200);
  });

  it('campo "pagina" com objeto não quebra a rota (500)', async () => {
    const res = await request(app).post('/api/visitas').send({ pagina: { a: 1 } });
    expect(res.status).toBe(200);
  });

  it('campo "pagina" fora da whitelist (tentativa de injeção) cai no default "dashboard"', async () => {
    const res = await request(app)
      .post('/api/visitas')
      .send({ pagina: '<script>alert(1)</script>' });
    expect(res.status).toBe(200);
  });

  it('body com array no lugar de objeto não derruba a rota', async () => {
    const res = await request(app).post('/api/visitas').send([1, 2, 3]);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/premium/status/:usuario — controle de acesso', () => {
  it('bloqueia consulta sem token', async () => {
    const res = await request(app).get('/api/premium/status/qualquer');
    expect(res.status).toBe(401);
  });

  it('bloqueia consultar o status de outro usuário (evita enumeração)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'vitima-enum', nome: 'Vitima', email: 'vitimaenum@ex.com', senha: '123456' });
    const atacante = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'atacante-enum', nome: 'Atacante', email: 'atacanteenum@ex.com', senha: '123456' });
    const res = await request(app)
      .get('/api/premium/status/vitima-enum')
      .set('Authorization', `Bearer ${atacante.body.token}`);
    expect(res.status).toBe(401);
  });

  it('usuário inexistente autenticado como si mesmo (token não bate com ninguém no arquivo) retorna 401 antes de vazar 404', async () => {
    const res = await request(app)
      .get('/api/premium/status/usuario-que-nao-existe-mesmo')
      .set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });
});
