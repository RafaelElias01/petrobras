import { describe, it, expect } from 'vitest';
import { gerarPayloadPix } from '../pix.js';

describe('gerarPayloadPix', () => {
  it('gera payload BR Code com header e CRC16 hex de 4 dígitos no fim', () => {
    const payload = gerarPayloadPix({ chave: '+5551983098650', nome: 'Fulano', cidade: 'Curitiba', valor: 49.9 });
    expect(payload.startsWith('000201')).toBe(true);
    expect(payload.slice(-4)).toMatch(/^[0-9A-F]{4}$/);
  });

  it('campo TXID (05) fica direto dentro do template 62, sem campo 03 aninhado', () => {
    // Regressão: addField('05', addField('03', txid)) já quebrou o QR (bancos rejeitam).
    // O campo 62 deve conter só "05" + tamanho + txid, nada de "03" no meio.
    const payload = gerarPayloadPix({ chave: '+5551983098650', nome: 'Fulano', cidade: 'Curitiba', valor: 10, txid: 'ABC123' });
    expect(payload).toContain('62100506ABC123');
  });

  it('trunca nome e cidade nos limites do padrão EMV (25 e 15 chars)', () => {
    const nomeGrande = 'N'.repeat(40);
    const cidadeGrande = 'C'.repeat(40);
    const payload = gerarPayloadPix({ chave: 'chave', nome: nomeGrande, cidade: cidadeGrande, valor: 1 });
    expect(payload).toContain('59' + '25' + 'N'.repeat(25));
    expect(payload).toContain('60' + '15' + 'C'.repeat(15));
  });
});
