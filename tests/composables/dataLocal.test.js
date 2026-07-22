// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { hojeLocalISO, dataLocalISO, hojeBrasiliaISO } from '../../dataLocal.js';

describe('dataLocal', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('dataLocalISO', () => {
    it('formata uma data em UTC meio-dia para YYYY-MM-DD sem deslocar de dia', () => {
      // Meio-dia UTC é longe o bastante de qualquer virada de fuso comum (-12 a +14h)
      const d = new Date('2026-03-15T12:00:00Z');
      expect(dataLocalISO(d)).toBe('2026-03-15');
    });

    it('aceita uma string de data e retorna o mesmo formato', () => {
      expect(dataLocalISO('2026-01-01T12:00:00Z')).toBe('2026-01-01');
    });

    it('não usa UTC puro: horário tarde da noite local (~23h Brasília) não deve virar o dia seguinte incorretamente', () => {
      // 2026-07-21T23:30 em horário de Brasília (-03:00) é 2026-07-22T02:30 em UTC.
      // dataLocalISO deve refletir a data LOCAL passada ao construtor Date,
      // então testamos que ela usa o fuso local do processo consistentemente
      // (round-trip: hoje local menos o próprio offset bate com a data local).
      const local = new Date(2026, 6, 21, 23, 30, 0); // mês 6 = julho (0-indexed), horário LOCAL da máquina
      const resultado = dataLocalISO(local);
      expect(resultado).toBe('2026-07-21');
    });
  });

  describe('hojeLocalISO', () => {
    it('retorna a data de hoje no fuso local da máquina que executa o teste', () => {
      vi.setSystemTime(new Date(2026, 6, 22, 10, 0, 0)); // horário local, não UTC
      expect(hojeLocalISO()).toBe('2026-07-22');
    });

    it('perto da meia-noite local ainda retorna o dia correto (não pula pro dia seguinte por causa de UTC)', () => {
      vi.setSystemTime(new Date(2026, 6, 21, 23, 59, 0)); // 23h59 horário local
      expect(hojeLocalISO()).toBe('2026-07-21');
    });

    it('logo após meia-noite local retorna o novo dia', () => {
      vi.setSystemTime(new Date(2026, 6, 22, 0, 1, 0)); // 00h01 horário local
      expect(hojeLocalISO()).toBe('2026-07-22');
    });
  });

  describe('hojeBrasiliaISO', () => {
    it('retorna sempre no formato YYYY-MM-DD', () => {
      const resultado = hojeBrasiliaISO();
      expect(resultado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('reflete o horário de Brasília independentemente do fuso do processo (ex: perto da meia-noite UTC)', () => {
      // 2026-07-22T02:00:00Z é 2026-07-21T23:00:00 em Brasília (UTC-3) --
      // então mesmo rodando o teste com relógio "amanhã" em UTC, Brasília
      // ainda deve estar no dia anterior.
      vi.setSystemTime(new Date('2026-07-22T02:00:00Z'));
      expect(hojeBrasiliaISO()).toBe('2026-07-21');
    });

    it('vira o dia exatamente às 00:00 em Brasília (03:00 UTC)', () => {
      vi.setSystemTime(new Date('2026-07-22T03:00:00Z'));
      expect(hojeBrasiliaISO()).toBe('2026-07-22');
    });
  });
});
