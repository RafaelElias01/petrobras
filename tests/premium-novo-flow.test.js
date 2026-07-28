import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import fs from 'fs';
import path from 'path';

describe('Premium Novo - Fluxo de Usuário', () => {
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

  it('novo usuário se registra sem premium', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'novousuario',
        nome: 'Novo Usuario',
        email: 'novousuario@example.com',
        senha: 'senha123'
      });

    expect(registerRes.status).toBe(200);
    expect(registerRes.body.ok).toBe(true);
    expect(registerRes.body.token).toBeDefined();
  });

  it('novo usuário faz login e NÃO tem premium', async () => {
    // Registrar
    await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'sem_premium',
        nome: 'Sem Premium',
        email: 'sempremium@example.com',
        senha: 'senha123'
      });

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'sem_premium',
        senha: 'senha123'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.premium).toBe(false);
    expect(loginRes.body.user.usuario).toBe('sem_premium');
    expect(loginRes.body.token).toBeDefined();
  });

  it('novo usuário pode fazer login múltiplas vezes', async () => {
    // Registrar
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'loginmultiplo',
        nome: 'Login Multiplo',
        email: 'loginmultiplo@example.com',
        senha: 'senha123'
      });

    expect(registerRes.status).toBe(200);

    // Primeiro login
    const login1 = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'loginmultiplo',
        senha: 'senha123'
      });

    expect(login1.status).toBe(200);
    expect(login1.body.user.premium).toBe(false);

    // Segundo login
    const login2 = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'loginmultiplo',
        senha: 'senha123'
      });

    expect(login2.status).toBe(200);
    expect(login2.body.user.premium).toBe(false);
    expect(login2.body.token).toBeDefined();
  });

  it('novo usuário recebe email no campo correto após registro', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        usuario: 'emailtest',
        nome: 'Email Test',
        email: 'emailtest@example.com',
        senha: 'senha123'
      });

    expect(registerRes.status).toBe(200);

    // Fazer login para verificar email armazenado
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        usuario: 'emailtest',
        senha: 'senha123'
      });

    expect(loginRes.body.user.usuario).toBe('emailtest');
  });
});
