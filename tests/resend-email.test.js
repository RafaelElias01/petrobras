import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Isolado em arquivo próprio: precisa de RESEND_API_KEY setada ANTES do
// import de server.js (resendClient é instanciado uma vez, no module load) e
// de um mock do pacote 'resend' -- os outros arquivos de teste rodam sem essa
// env var de propósito (resendClient fica null, early-return, nunca exercita
// emails.send). Aqui é o único lugar que prova o comportamento real do envio.
const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

let app;
let tmpDir;

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'petrobras-resend-test-'));
  process.env.USUARIOS_PATH = path.join(tmpDir, 'usuarios.json');
  process.env.NEWSLETTER_PATH = path.join(tmpDir, 'newsletter.json');
  process.env.VISITAS_PATH = path.join(tmpDir, 'visitas.json');
  process.env.RESEND_API_KEY = 'chave-fake-de-teste';
  ({ default: app } = await import('../server.js'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.RESEND_API_KEY;
});

describe('Envio de email via Resend -- resendClient.emails.send() não lança em erro da API', () => {
  beforeEach(() => {
    sendMock.mockClear();
  });

  it('loga o erro quando a API do Resend responde { error } sem lançar exceção (ex: from não verificado)', async () => {
    sendMock.mockResolvedValueOnce({
      data: null,
      error: { name: 'validation_error', message: 'The gmail.com domain is not verified. Please, add and verify your domain on https://resend.com/domains' },
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'semdominioverificado', nome: 'Fulano', email: 'fulano@gmail.com', senha: '123456' });
    expect(res.status).toBe(200);

    // enviarEmailBoasVindas roda depois da resposta (fire-and-forget) -- dar
    // um tick pro microtask/await interno terminar antes de checar o spy.
    await new Promise(r => setTimeout(r, 50));

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      'Erro ao enviar email de boas-vindas (API Resend):',
      expect.objectContaining({ name: 'validation_error' })
    );
    errorSpy.mockRestore();
  });

  it('não loga erro nenhum quando a API do Resend responde com sucesso', async () => {
    sendMock.mockResolvedValueOnce({ data: { id: 'email-fake-123' }, error: null });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .post('/api/auth/register')
      .send({ usuario: 'comsucesso', nome: 'Ciclana', email: 'ciclana@ex.com', senha: '123456' });
    expect(res.status).toBe(200);

    await new Promise(r => setTimeout(r, 50));

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
