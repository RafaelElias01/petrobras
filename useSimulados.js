import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';

let instance;

export function useSimulados() {
  if (instance) {
    return instance;
  }

  const simulados = ref(Armazenamento.carregar('simulados', []));
  const formSimulado = ref({ semana: 1, portugues: 0, matematica: 0, quimica: 0 });

  watch(simulados, (novoValor) => {
    Armazenamento.salvar('simulados', novoValor);
  }, { deep: true });

  const formSimuladoTotal = computed(() => {
    return (formSimulado.value.portugues || 0) + (formSimulado.value.matematica || 0) + (formSimulado.value.quimica || 0);
  });

  const simuladosOrdenados = computed(() => {
    return [...simulados.value]
      .map(s => ({
        ...s,
        total: (s.portugues || 0) + (s.matematica || 0) + (s.quimica || 0),
        porcentagem: Math.round(((s.portugues || 0) + (s.matematica || 0) + (s.quimica || 0)) / 60 * 100)
      }))
      .sort((a, b) => a.semana - b.semana);
  });

  const simuladoStatus = computed(() => {
    const ultimo = simuladosOrdenados.value.at(-1);
    if (!ultimo) return { classe: '', texto: 'N/A' };
    const pct = ultimo.porcentagem;
    const classe = pct >= 70 ? 'verde' : pct >= 50 ? 'laranja' : 'vermelho';
    return { classe, texto: `${pct}%` };
  });

  function salvarSimulado() {
    const novoSimulado = { ...formSimulado.value };
    const index = simulados.value.findIndex(s => s.semana === novoSimulado.semana);
    if (index > -1) {
      simulados.value[index] = novoSimulado;
    } else {
      simulados.value.push(novoSimulado);
    }
  }

  function removerSimulado(semana) {
    simulados.value = simulados.value.filter(s => s.semana !== semana);
  }

  instance = { simulados, formSimulado, formSimuladoTotal, simuladosOrdenados, simuladoStatus, salvarSimulado, removerSimulado };
  return instance;
}
