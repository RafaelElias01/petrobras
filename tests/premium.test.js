import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

// Mocka o SDK do Mercado Pago inteiro: sem isso, não dá pra testar o
// caminho de sucesso (preferência criada, webhook aprovando pagamento)
// sem bater na API real deles com credenciais de verdade.
vi.mock('mercadopago', () => {
  class MercadoPagoConfig {
    constructor(opts) { this.opts = opts; }
  }
  class Preference {
    async create({ body }) {
      return {
        id: 'pref-fake-123',
        init_point: 'https://www.mercadopago.com.br/checkout/fake-init-point',
        external_reference: body.external_reference,
      };
    }
  }
  class Payment {
    async get({ id }) {
      // Pagamento "aprovado" para qualquer id que comece com "aprovado-",
      // simulando o retorno real da API do Mercado Pago para um pagamento
      // Premium concluído com sucesso.
      if (String(id).startsWith('aprovado-barato-')) {
        // Simula um pagamento aprovado, mas com valor abaixo do preço do Premium.
        return { id, status: 'approved', transaction_amount: 1.00, external_reference: global.__mp_test_usuario };
      }
      if (String(id).startsWith('aprovado-')) {
        return { id, status: 'approved', transaction_amount: 49.90, external_reference: global.__mp_test_usuario };
      }
      return { id, status: 'pending', transaction_amount: 49.90, external_reference: global.__mp_test_usuario };
    }
  }
  return { MercadoPagoConfig, Preference, Payment };
});

let app;
let tmpDir;
const WEBHOOK_SECRET = 'segredo-teste-webhook';

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'petrobras-premium-test-'));
  process.env.USUARIOS_PATH = path.join(tmpDir, 'usuarios.json');
  process.env.NEWSLETTER_PATH = path.join(tmpDir, 'newsletter.json');
  process.env.VISITAS_PATH = path.join(tmpDir, 'visitas.json');
  process.env.MP_ACCESS_TOKEN = 'TEST-fake-token-para-mock';
  process.env.MP_WEBHOOK_SECRET = WEBHOOK_SECRET;
  ({ default: app } = await import('../server.js'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.MP_ACCESS_TOKEN;
  delete process.env.MP_WEBHOOK_SECRET;
});

function assinarWebhook(dataId) {
  const ts = Math.floor(Date.now() / 1000);
  const requestId = 'req-teste-1';
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${ts};`;
  const v1 = crypto.createHmac('sha256', WEBHOOK_SECRET).update(manifest).digest('hex');
  return {
    header: `ts=${ts},v1=${v1}`,
    requestId,
  };
}

describe('Fluxo real de assinatura Premium (com Mercado Pago mockado)', () => {
  it('cria a conta, gera preferência de pagamento com init_point válido', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'premiumuser', nome: 'Premium User', email: 'premium@ex.com', senha: '123456' });
    expect(reg.status).toBe(200);

    const res = await request(app)
      .post('/api/premium/criar-preferencia')
      .set('Authorization', `Bearer ${reg.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.init_point).toMatch(/^https:\/\/www\.mercadopago\.com/);
  });

  it('usuário NÃO está premium antes do pagamento ser confirmado', async () => {
    const login = await request(app).post('/api/auth/login').send({ usuario: 'premiumuser', senha: '123456' });
    const status = await request(app)
      .get('/api/premium/status/premiumuser')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(status.body.premium).toBe(false);
  });

  it('webhook com assinatura inválida é ignorado (não ativa premium)', async () => {
    const res = await request(app)
      .post('/api/premium/webhook?data.id=aprovado-fake-1')
      .set('x-signature', 'ts=123,v1=assinatura-forjada-invalida')
      .set('x-request-id', 'req-forjado')
      .send({});
    expect(res.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ usuario: 'premiumuser', senha: '123456' });
    const status = await request(app)
      .get('/api/premium/status/premiumuser')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(status.body.premium).toBe(false);
  });

  it('webhook com assinatura válida + pagamento aprovado ATIVA o premium de verdade', async () => {
    global.__mp_test_usuario = 'premiumuser';
    const dataId = 'aprovado-fake-2';
    const { header, requestId } = assinarWebhook(dataId);

    const res = await request(app)
      .post(`/api/premium/webhook?data.id=${dataId}`)
      .set('x-signature', header)
      .set('x-request-id', requestId)
      .send({});
    expect(res.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ usuario: 'premiumuser', senha: '123456' });
    const status = await request(app)
      .get('/api/premium/status/premiumuser')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(status.body.premium).toBe(true);
  });

  it('pagamento aprovado com valor abaixo do preço do Premium NÃO ativa o premium', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'baratouser', nome: 'Barato User', email: 'barato@ex.com', senha: '123456' });
    global.__mp_test_usuario = 'baratouser';

    const dataId = 'aprovado-barato-1';
    const { header, requestId } = assinarWebhook(dataId);
    const res = await request(app)
      .post(`/api/premium/webhook?data.id=${dataId}`)
      .set('x-signature', header)
      .set('x-request-id', requestId)
      .send({});
    expect(res.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ usuario: 'baratouser', senha: '123456' });
    const status = await request(app)
      .get('/api/premium/status/baratouser')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(status.body.premium).toBe(false);
  });

  it('pagamento pendente (não aprovado) NÃO ativa o premium', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'pendenteuser', nome: 'Pendente User', email: 'pendente@ex.com', senha: '123456' });
    global.__mp_test_usuario = 'pendenteuser';

    const dataId = 'pendente-fake-1';
    const { header, requestId } = assinarWebhook(dataId);
    await request(app)
      .post(`/api/premium/webhook?data.id=${dataId}`)
      .set('x-signature', header)
      .set('x-request-id', requestId)
      .send({});

    const status = await request(app)
      .get('/api/premium/status/pendenteuser')
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(status.body.premium).toBe(false);
  });
});
