// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hojeLocalISO } from '../../dataLocal.js';

// useHoras() usa singleton em nível de módulo (`let instance`), então cada
// teste precisa de vi.resetModules() + import dinâmico pra pegar estado limpo.
async function montarHoras() {
  vi.resetModules();
  const { useHoras } = await import('../../useHoras.js');
  return useHoras();
}

// Testes de "hoje" usam hojeLocalISO() para calcular a chave de data em vez
// de uma string fixa: o fuso da máquina que roda o teste (dev local vs CI)
// pode ser diferente, então uma data hardcoded como '2026-07-21' só bate
// com "hoje" se o executor estiver no fuso certo. Isso já causou um deploy
// falhar (CI roda em UTC, dev local em America/Sao_Paulo).

describe('useHoras', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('adicionarHoras grava e horaValor lê de volta o mesmo valor', async () => {
    const { adicionarHoras, horaValor } = await montarHoras();
    adicionarHoras('2026-07-21', 'quimica', 2);
    expect(horaValor('2026-07-21', 'quimica')).toBe(2);
  });

  it('totalHoje reflete horas registradas no dia de hoje (usa a mesma noção de "hoje" do resto do app)', async () => {
    // Regressão original: totalHoje usava `new Date().toISOString().slice(0,10)`
    // (UTC) em vez de hojeLocalISO(). No Brasil (UTC-3), entre ~21h e meia-noite
    // local isso já apontava pro dia seguinte em UTC, fazendo horas registradas
    // à noite não aparecerem em "Registro do Dia". Testado aqui via hojeLocalISO()
    // (não uma data hardcoded) para não depender do fuso do executor (CI roda em
    // UTC, dev local pode estar em qualquer fuso).
    const { adicionarHoras, totalHoje } = await montarHoras();
    adicionarHoras(hojeLocalISO(), 'quimica', 1.5);
    expect(totalHoje.value).toBe(1.5);
  });

  it('totalHoje não conta horas registradas em outro dia', async () => {
    const { adicionarHoras, totalHoje } = await montarHoras();
    adicionarHoras('2020-01-01', 'quimica', 3);
    expect(totalHoje.value).toBe(0);
  });

  it('registrosHoje lista as matérias com horas > 0 registradas hoje, ordenadas por horas desc', async () => {
    const { adicionarHoras, registrosHoje } = await montarHoras();
    const hoje = hojeLocalISO();
    adicionarHoras(hoje, 'portugues', 1);
    adicionarHoras(hoje, 'quimica', 3);
    adicionarHoras(hoje, 'matematica', 0); // não deve aparecer

    const nomes = registrosHoje.value.map(r => r.id);
    expect(nomes).toEqual(['quimica', 'portugues']);
  });

  it('removerMateria apaga o registro do dia e limpa o dia se ficar vazio', async () => {
    const { adicionarHoras, removerMateria, horas } = await montarHoras();
    adicionarHoras('2026-07-21', 'quimica', 2);
    expect(horas.value['2026-07-21']).toBeTruthy();

    removerMateria('2026-07-21', 'quimica');
    expect(horas.value['2026-07-21']).toBeUndefined();
  });

  it('setHora nunca deixa valor negativo (Math.max(0, ...))', async () => {
    const { setHora, horaValor } = await montarHoras();
    setHora(1, 'segunda', 'quimica', -5);
    expect(horaValor(1, 'segunda', 'quimica')).toBe(0);
  });

  it('horasSemana soma todas as matérias de todos os dias da semana informada', async () => {
    const { setHora, horasSemana } = await montarHoras();
    setHora(1, 'seg', 'quimica', 2);
    setHora(1, 'ter', 'portugues', 1.5);
    expect(horasSemana(1)).toBe(3.5);
  });

  it('totalHorasAcumuladas soma horas de todas as semanas do plano', async () => {
    const { setHora, totalHorasAcumuladas } = await montarHoras();
    setHora(1, 'seg', 'quimica', 2);
    setHora(5, 'sex', 'matematica', 3);
    expect(totalHorasAcumuladas.value).toBe(5);
  });
});
