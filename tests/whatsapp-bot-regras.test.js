import { describe, it, expect } from 'vitest';
import { interpretarComando } from '../whatsapp-bot/regras.js';

describe('interpretarComando (liga/desliga do bot via WhatsApp)', () => {
  it('reconhece variantes de desligar', () => {
    expect(interpretarComando('/bot desligar')).toBe('desligar');
    expect(interpretarComando('/bot off')).toBe('desligar');
    expect(interpretarComando('/bot pausar')).toBe('desligar');
  });

  it('reconhece variantes de ligar', () => {
    expect(interpretarComando('/bot ligar')).toBe('ligar');
    expect(interpretarComando('/bot on')).toBe('ligar');
    expect(interpretarComando('/bot ativar')).toBe('ligar');
  });

  it('reconhece o comando de status', () => {
    expect(interpretarComando('/bot status')).toBe('status');
  });

  it('ignora maiúsculas e espaço extra nas bordas', () => {
    expect(interpretarComando('  /BOT Desligar  ')).toBe('desligar');
    expect(interpretarComando('/bot LIGAR')).toBe('ligar');
  });

  it('não reconhece mensagem comum (não é um comando) e retorna null', () => {
    expect(interpretarComando('oi, quanto custa o premium?')).toBe(null);
    expect(interpretarComando('bot desligar')).toBe(null); // sem a barra "/", não conta
    expect(interpretarComando('')).toBe(null);
  });
});
