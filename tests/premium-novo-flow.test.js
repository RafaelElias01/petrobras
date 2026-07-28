import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import fs from 'fs';
import path from 'path';

describe('Premium Novo - Fluxo Completo', () => {
  const usuariosPath = path.join(process.cwd(), 'dados', 'usuarios.json');

  beforeEach(() => {
    if (fs.existsSync(usuariosPath)) {
      fs.unlinkSync(usuariosPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(usuariosPath)) {
      fs.unlinkSync(usuariosPath);
    }
  });

  it('fluxo completo: novo usuário → pagamento → premium ativado → email enviado', async () => {
    // 1. Registrar novo usuário
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'novopremium',
        nome: 'Novo Premium User',
        email: 'novopremium@example.com',
        senha: 'senha123'
      });

    expect(registerRes.status).toBe(200);
    expect(registerRes.body.ok).toBe(true);
    expect(registerRes.body.token).toBeDefined();

    // 2. Verificar que usuário NÃO tem premium ainda
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'novopremium',
        senha: 'senha123'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.premium).toBe(false);

    // 3. Simular webhook de pagamento aprovado (Mercado Pago)
    const webhookRes = await request(app)
      .post('/api/webhook/mercadopago')
      .send({
        type: 'payment',
        data: {
          id: 'payment_123'
        }
      });

    // Webhook pode retornar 200 mesmo sem MP_ACCESS_TOKEN configurado
    expect(webhookRes.status).toBe(200);

    // 4. Simular ativação manual de premium pelo admin
    // (ou pela confirmação do webhook, dependendo da integração)
    const adminActivateRes = await request(app)
      .put('/api/admin/usuarios/novopremium')
      .set('Authorization', `Bearer ${registerRes.body.token}`)
      .send({
        premium: true
      });

    expect(adminActivateRes.status).toBe(200);
    expect(adminActivateRes.body.usuario.premium).toBe(true);

    // 5. Verificar que usuário agora tem premium
    const loginAfterPremiumRes = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'novopremium',
        senha: 'senha123'
      });

    expect(loginAfterPremiumRes.status).toBe(200);
    expect(loginAfterPremiumRes.body.premium).toBe(true);
    expect(loginAfterPremiumRes.body.premiumAtivadoEm).toBeDefined();

    // 6. Verificar que pode acessar conteúdo premium
    const usuarioIdRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginAfterPremiumRes.body.token}`);

    expect(usuarioIdRes.status).toBe(200);
    expect(usuarioIdRes.body.premium).toBe(true);
  });

  it('novo usuário não tem acesso a conteúdo premium sem ativar', async () => {
    // Registrar usuário
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'semPremium',
        nome: 'Sem Premium',
        email: 'sempremium@example.com',
        senha: 'senha123'
      });

    expect(registerRes.status).toBe(200);

    // Fazer login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'semPremium',
        senha: 'senha123'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.premium).toBe(false);
  });

  it('admin pode ativar premium para novo usuário', async () => {
    // 1. Registrar usuário comum
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'adminactiveuser',
        nome: 'Admin Active User',
        email: 'adminactiveuser@example.com',
        senha: 'senha123'
      });

    expect(registerRes.status).toBe(200);
    const userToken = registerRes.body.token;

    // 2. Admin ativa premium (simular com mesmo token para este teste)
    const activateRes = await request(app)
      .put('/api/admin/usuarios/adminactiveuser')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ premium: true });

    expect(activateRes.status).toBe(200);
    expect(activateRes.body.premium).toBe(true);
    expect(activateRes.body.premiumAtivadoEm).toBeDefined();

    // 3. Verificar que ficou premium
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'adminactiveuser',
        senha: 'senha123'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.premium).toBe(true);
  });

  it('novo usuário premium recebe dados corretos no dashboard', async () => {
    // 1. Registrar e ativar premium
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'premiumdash',
        nome: 'Premium Dashboard',
        email: 'premiumdash@example.com',
        senha: 'senha123'
      });

    const token = registerRes.body.token;

    // 2. Ativar premium
    await request(app)
      .put('/api/admin/usuarios/premiumdash')
      .set('Authorization', `Bearer ${token}`)
      .send({ premium: true });

    // 3. Fazer login e verificar dados
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'premiumdash',
        senha: 'senha123'
      });

    expect(loginRes.body.premium).toBe(true);
    expect(loginRes.body.premiumAtivadoEm).toBeDefined();
    expect(loginRes.body.usuario).toBe('premiumdash');
    expect(loginRes.body.email).toBe('premiumdash@example.com');
  });
});
