// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { Armazenamento } from '../../armazenamento.js';
import { CICLO_ESTUDOS } from '../../dados.js';

// Total de "slots" do ciclo ponderado = soma dos pesos de cada matéria.
// Ver AGENTS.md: "Ciclo nao expande 24 slots" — hoje soma 24.
const TOTAL_PONDERADO = CICLO_ESTUDOS.reduce((acc, item) => acc + item.peso, 0);

// useCiclo() usa singleton em nível de módulo (`let instance`), então cada
// teste precisa de vi.resetModules() + import dinâmico pra pegar estado limpo
// (mesmo padrão de tests/composables/useHoras.test.js).
async function montarCiclo() {
  vi.resetModules();
  const { useCiclo } = await import('../../useCiclo.js');
  return useCiclo();
}

describe('useCiclo', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicia com estado padrão quando não há dados salvos', async () => {
    const { ciclo, totalPonderado, materiaAtual, idxOriginalAtual, cicloCompleto } = await montarCiclo();

    expect(ciclo.value).toEqual({ posicao: 0, concluido: {} });
    expect(totalPonderado.value).toBe(TOTAL_PONDERADO);
    expect(materiaAtual.value.materia).toBe(CICLO_ESTUDOS[0].materia);
    expect(idxOriginalAtual.value).toBe(0);
    expect(cicloCompleto.value).toBe(0);
  });

  it('expande o ciclo ponderado somando o peso de cada matéria (24 slots)', async () => {
    const { totalPonderado } = await montarCiclo();
    expect(totalPonderado.value).toBe(24);
  });

  it('avancarCiclo incrementa a contagem do item atual e avança a posição', async () => {
    const { ciclo, avancarCiclo } = await montarCiclo();

    avancarCiclo();

    expect(ciclo.value.concluido['item-0']).toBe(1);
    expect(ciclo.value.posicao).toBe(1);
  });

  it('avança para o próximo item original só depois de esgotar o peso do atual', async () => {
    const { avancarCiclo, idxOriginalAtual, ciclo } = await montarCiclo();
    const pesoPrimeiroItem = CICLO_ESTUDOS[0].peso; // 4

    for (let i = 0; i < pesoPrimeiroItem; i++) avancarCiclo();

    expect(ciclo.value.posicao).toBe(pesoPrimeiroItem);
    expect(idxOriginalAtual.value).toBe(1);
    expect(ciclo.value.concluido['item-0']).toBe(pesoPrimeiroItem);
  });

  it('faz wrap-around da posição ao completar o ciclo ponderado inteiro', async () => {
    const { avancarCiclo, ciclo } = await montarCiclo();

    for (let i = 0; i < TOTAL_PONDERADO; i++) avancarCiclo();

    expect(ciclo.value.posicao).toBe(0);
    // cada item original ocupa `peso` slots, então uma volta completa incrementa
    // seu contador de conclusões exatamente `peso` vezes.
    CICLO_ESTUDOS.forEach((item, idx) => {
      expect(ciclo.value.concluido[`item-${idx}`]).toBe(item.peso);
    });
  });

  it('calcula cicloCompleto (%) com base no total de conclusões ponderadas', async () => {
    const { avancarCiclo, cicloCompleto } = await montarCiclo();
    const metade = TOTAL_PONDERADO / 2;

    for (let i = 0; i < metade; i++) avancarCiclo();

    expect(cicloCompleto.value).toBe(50);
  });

  it('completosPorItem mapeia conclusões de volta para o índice original de CICLO_ESTUDOS', async () => {
    const { avancarCiclo, completosPorItem } = await montarCiclo();

    avancarCiclo();
    avancarCiclo();

    expect(completosPorItem.value[0]).toBe(2);
    expect(completosPorItem.value[1]).toBe(0);
  });

  it('reiniciarCiclo zera posição e conclusões', async () => {
    const { avancarCiclo, reiniciarCiclo, ciclo } = await montarCiclo();

    avancarCiclo();
    avancarCiclo();
    reiniciarCiclo();

    expect(ciclo.value).toEqual({ posicao: 0, concluido: {} });
  });

  it('corrige posição inválida herdada de dados salvos antigos (watchEffect de proteção)', async () => {
    localStorage.setItem('petrobras_quimica_ciclo', JSON.stringify({ posicao: 999, concluido: {} }));

    const { ciclo } = await montarCiclo();

    expect(ciclo.value.posicao).toBe(0);
  });

  it('cicloCompleto nunca passa de 100%, mesmo com mais conclusões que o total ponderado', () => {
    const { ciclo, cicloCompleto } = useCiclo();
    // Simula um usuário que completou o ciclo mais de uma vez (loop repetido).
    ciclo.value.concluido = CICLO_ESTUDOS.reduce((acc, item, idx) => {
      acc[`item-${idx}`] = item.peso * 3; // 3 voltas completas
      return acc;
    }, {});

    expect(cicloCompleto.value).toBe(100);
  });

  it('persiste o estado no Armazenamento (localStorage) após avancarCiclo', async () => {
    vi.useFakeTimers();
    try {
      const { avancarCiclo } = await montarCiclo();

      avancarCiclo();
      await nextTick(); // deixa o watch({ deep: true }) disparar Armazenamento.salvar
      vi.advanceTimersByTime(1100); // passa do debounce padrão de 1000ms

      const salvo = Armazenamento.carregar('ciclo', null);
      expect(salvo).toEqual({ posicao: 1, concluido: { 'item-0': 1 } });
    } finally {
      vi.useRealTimers();
    }
  });

  it('useCiclo() retorna a mesma instância (singleton) em chamadas repetidas, como os outros composables', async () => {
    const a = await montarCiclo();
    const { useCiclo } = await import('../../useCiclo.js');
    const b = useCiclo();
    expect(b).toBe(a);
  });
});
