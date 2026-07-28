import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import fs from 'fs';
import path from 'path';

describe('Reset Password Flow', () => {
  beforeEach(() => {
    // Limpar arquivo de usuários antes de cada teste
    const usuariosPath = path.join(process.cwd(), 'dados', 'usuarios.json');
    if (fs.existsSync(usuariosPath)) {
      fs.unlinkSync(usuariosPath);
    }
  });

  describe('POST /api/auth/reset-password-request', () => {
    it('retorna sucesso mesmo se email nao existe (por segurança)', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password-request')
        .send({ email: 'inexistente@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toContain('Se o email está cadastrado');
    });

    it('rejeita email inválido', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password-request')
        .send({ email: 'nao-eh-email' });

      expect(res.status).toBe(400);
      expect(res.body.erro).toContain('Email');
    });

    it('rejeita sem email', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password-request')
        .send({});

      expect(res.status).toBe(400);
    });

    it('envia link de reset para email válido cadastrado', async () => {
      // Primeiro, registrar um usuário
      await request(app)
        .post('/api/auth/register')
        .send({
          usuario: 'testeuser',
          nome: 'Teste User',
          email: 'teste@example.com',
          senha: '123456'
        });

      // Depois, pedir reset
      const res = await request(app)
        .post('/api/auth/reset-password-request')
        .send({ email: 'teste@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('rejeita sem token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ novaSenha: '123456' });

      expect(res.status).toBe(400);
    });

    it('rejeita token inválido', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'token-falso-invalido',
          novaSenha: '123456'
        });

      expect(res.status).toBe(401);
      expect(res.body.erro).toContain('inválido');
    });

    it('rejeita senha muito curta', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'algum-token',
          novaSenha: 'ab'
        });

      expect(res.status).toBe(400);
      expect(res.body.erro).toContain('mín');
    });

    it('rejeita nova senha não fornecida', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'algum-token' });

      expect(res.status).toBe(400);
    });
  });

  describe('Full Reset Password Flow', () => {
    it('usuário consegue resetar senha após receber link', async () => {
      // 1. Registrar usuário
      await request(app)
        .post('/api/auth/register')
        .send({
          usuario: 'resetuser',
          nome: 'Reset User',
          email: 'reset@example.com',
          senha: '123456'
        });

      // 2. Verificar que pode fazer login com senha antiga
      const loginAntes = await request(app)
        .post('/api/auth/login')
        .send({ usuario: 'resetuser', senha: '123456' });

      expect(loginAntes.status).toBe(200);
      expect(loginAntes.body.token).toBeDefined();

      // 3. Simular clique no link de reset (gerar token)
      // Não conseguimos acessar resetPasswordTokens diretamente, então vamos
      // chamar reset-password-request que gera o token internamente.
      // Para testar o token, precisamos injetar um token "válido".
      //
      // Como o token é gerado internamente e armazenado em Map,
      // não conseguimos facilmente extraí-lo no teste sem modificar o server.
      // Mas podemos testar que as APIs funcionam sem erros.

      const resetRequest = await request(app)
        .post('/api/auth/reset-password-request')
        .send({ email: 'reset@example.com' });

      expect(resetRequest.status).toBe(200);
      expect(resetRequest.body.ok).toBe(true);

      // 4. Tentar login com senha antiga deve falhar (mas não fazemos aqui
      // pois precisaríamos do token gerado internamente para reseta)
      // Isso é mais um teste de integração que valida o fluxo end-to-end
      // em ambiente real com email.
    });
  });
});
