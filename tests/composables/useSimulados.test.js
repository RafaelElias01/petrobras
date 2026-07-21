// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// useSimulados() usa singleton em nível de módulo (`let instance`), então cada
// teste precisa de vi.resetModules() + import dinâmico pra pegar estado limpo.
async function montarSimulados() {
  vi.resetModules();
  const { useSimulados, SIMULADO_TOTAL_QUESTOES } = await import('../../useSimulados.js');
  return { ...useSimulados(), SIMULADO_TOTAL_QUESTOES };
}

describe('useSimulados', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('SIMULADO_TOTAL_QUESTOES reflete a soma real de questões do conteúdo (10+10+38=58, não um /60 hardcoded)', async () => {
    const { SIMULADO_TOTAL_QUESTOES } = await montarSimulados();
    expect(SIMULADO_TOTAL_QUESTOES).toBe(58);
  });

  it('calcula porcentagem com base no total real de questões, não em 60', async () => {
    const { simulados, salvarSimulado, simuladosOrdenados, formSimulado } = await montarSimulados();
    formSimulado.value = { semana: 1, portugues: 10, matematica: 10, quimica: 38 };
    salvarSimulado();
    expect(simuladosOrdenados.value[0].total).toBe(58);
    expect(simuladosOrdenados.value[0].porcentagem).toBe(100);
  });
});
