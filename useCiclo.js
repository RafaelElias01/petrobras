import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { CICLO_ESTUDOS } from './dados.js';

let instance;

export function useCiclo() {
  if (instance) {
    return instance;
  }

  const ciclo = ref(Armazenamento.carregar('ciclo', { posicao: 0, concluido: {} }));
  if (ciclo.value.posicao >= CICLO_ESTUDOS.length) {
    ciclo.value.posicao = 0;
  }
  const cicloExpandido = ref(false);

  watch(ciclo, (novoValor) => {
    Armazenamento.salvar('ciclo', novoValor);
  }, { deep: true });

  const materiaAtual = computed(() => CICLO_ESTUDOS[ciclo.value.posicao]);

  const cicloCompleto = computed(() => {
    const concluidas = Object.keys(ciclo.value.concluido).length;
    return Math.round((concluidas / CICLO_ESTUDOS.length) * 100);
  });

  function avancarCiclo() {
    const chave = `${materiaAtual.value.materia}-c${ciclo.value.posicao}`;
    ciclo.value.concluido[chave] = true;
    ciclo.value.posicao = (ciclo.value.posicao + 1) % CICLO_ESTUDOS.length;
  }

  function reiniciarCiclo() {
    ciclo.value = { posicao: 0, concluido: {} };
  }

  instance = { ciclo, cicloExpandido, CICLO_ESTUDOS, materiaAtual, cicloCompleto, avancarCiclo, reiniciarCiclo };
  return instance;
}
