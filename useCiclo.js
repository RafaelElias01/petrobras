import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { CICLO_ESTUDOS } from './dados.js';

let instance;

export function useCiclo() {
  if (instance) return instance;

  const ciclo = ref(Armazenamento.carregar('ciclo', { posicao: 0, concluido: {} }));

  const CICLO_PONDERADO = computed(() => {
    const arr = [];
    CICLO_ESTUDOS.forEach((item, idx) => {
      for (let w = 0; w < item.peso; w++) {
        arr.push({ ...item, idxOriginal: idx });
      }
    });
    return arr;
  });

  const totalPonderado = computed(() => CICLO_PONDERADO.value.length);

  if (ciclo.value.posicao >= totalPonderado.value) {
    ciclo.value.posicao = 0;
    Armazenamento.salvar('ciclo', ciclo.value);
  }

  const cicloExpandido = ref(false);

  watch(ciclo, (novoValor) => {
    Armazenamento.salvar('ciclo', novoValor);
  }, { deep: true });

  const materiaAtual = computed(() => CICLO_PONDERADO.value[ciclo.value.posicao]);

  const idxOriginalAtual = computed(() => materiaAtual.value?.idxOriginal ?? 0);

  const cicloCompleto = computed(() => {
    const totalCompletions = Object.values(ciclo.value.concluido || {}).reduce((a, b) => a + b, 0);
    const total = totalPonderado.value;
    if (total === 0) return 0;
    return Math.min(100, Math.round((totalCompletions / total) * 100));
  });

  const completosPorItem = computed(() => {
    const map = {};
    CICLO_ESTUDOS.forEach((_, i) => {
      map[i] = ciclo.value.concluido[`item-${i}`] || 0;
    });
    return map;
  });

  function avancarCiclo() {
    const item = CICLO_PONDERADO.value[ciclo.value.posicao];
    const chave = `item-${item.idxOriginal}`;
    ciclo.value.concluido[chave] = (ciclo.value.concluido[chave] || 0) + 1;
    ciclo.value.posicao = (ciclo.value.posicao + 1) % totalPonderado.value;
  }

  function reiniciarCiclo() {
    ciclo.value = { posicao: 0, concluido: {} };
  }

  instance = {
    ciclo, cicloExpandido, CICLO_ESTUDOS, materiaAtual, idxOriginalAtual,
    cicloCompleto, completosPorItem, totalPonderado,
    avancarCiclo, reiniciarCiclo
  };
  return instance;
}
