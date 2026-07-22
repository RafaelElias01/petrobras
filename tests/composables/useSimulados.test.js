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

  it('formSimuladoTotal soma os 3 campos do formulário em edição, tratando ausentes como 0', async () => {
    const { formSimulado, formSimuladoTotal } = await montarSimulados();
    formSimulado.value = { semana: 1, portugues: 5, matematica: 3 }; // quimica ausente
    expect(formSimuladoTotal.value).toBe(8);
  });

  it('salvarSimulado atualiza em vez de duplicar quando já existe registro pra mesma semana', async () => {
    const { formSimulado, salvarSimulado, simulados } = await montarSimulados();
    formSimulado.value = { semana: 1, portugues: 5, matematica: 5, quimica: 20 };
    salvarSimulado();
    formSimulado.value = { semana: 1, portugues: 10, matematica: 10, quimica: 38 };
    salvarSimulado();

    expect(simulados.value.length).toBe(1);
    expect(simulados.value[0]).toMatchObject({ portugues: 10, matematica: 10, quimica: 38 });
  });

  it('simuladosOrdenados ordena por semana crescente, independente da ordem de inserção', async () => {
    const { formSimulado, salvarSimulado, simuladosOrdenados } = await montarSimulados();
    formSimulado.value = { semana: 3, portugues: 5, matematica: 5, quimica: 20 };
    salvarSimulado();
    formSimulado.value = { semana: 1, portugues: 5, matematica: 5, quimica: 20 };
    salvarSimulado();

    expect(simuladosOrdenados.value.map(s => s.semana)).toEqual([1, 3]);
  });

  it('removerSimulado remove pelo número da semana', async () => {
    const { formSimulado, salvarSimulado, removerSimulado, simulados } = await montarSimulados();
    formSimulado.value = { semana: 1, portugues: 5, matematica: 5, quimica: 20 };
    salvarSimulado();

    removerSimulado(1);

    expect(simulados.value).toEqual([]);
  });

  it('simuladoStatus retorna N/A quando não há nenhum simulado registrado', async () => {
    const { simuladoStatus } = await montarSimulados();
    expect(simuladoStatus.value).toEqual({ classe: '', texto: 'N/A' });
  });

  it('simuladoStatus usa o ÚLTIMO simulado por semana (não o mais recentemente salvo)', async () => {
    const { formSimulado, salvarSimulado, simuladoStatus } = await montarSimulados();
    formSimulado.value = { semana: 3, portugues: 10, matematica: 10, quimica: 38 }; // 100%, salvo primeiro
    salvarSimulado();
    formSimulado.value = { semana: 1, portugues: 0, matematica: 0, quimica: 0 }; // 0%, salvo depois
    salvarSimulado();

    // Semana 3 é a mais alta, então simuladosOrdenados.at(-1) deve ser ela, não a semana 1.
    expect(simuladoStatus.value.texto).toBe('100%');
    expect(simuladoStatus.value.classe).toBe('verde');
  });

  it('simuladoStatus classifica >= 70% como verde', async () => {
    const { formSimulado, salvarSimulado, simuladoStatus } = await montarSimulados();
    formSimulado.value = { semana: 1, portugues: 7, matematica: 7, quimica: 27 }; // 41/58 ≈ 70.7%
    salvarSimulado();
    expect(simuladoStatus.value.classe).toBe('verde');
  });

  it('simuladoStatus classifica entre 50% e 69% como laranja', async () => {
    const { formSimulado, salvarSimulado, simuladoStatus } = await montarSimulados();
    formSimulado.value = { semana: 1, portugues: 5, matematica: 5, quimica: 20 }; // 30/58 ≈ 51.7%
    salvarSimulado();
    expect(simuladoStatus.value.classe).toBe('laranja');
  });

  it('simuladoStatus classifica abaixo de 50% como vermelho', async () => {
    const { formSimulado, salvarSimulado, simuladoStatus } = await montarSimulados();
    formSimulado.value = { semana: 1, portugues: 2, matematica: 2, quimica: 5 }; // 9/58 ≈ 15.5%
    salvarSimulado();
    expect(simuladoStatus.value.classe).toBe('vermelho');
  });
});
