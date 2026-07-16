import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { DIAS_SEMANA, SEMANAS_PLANO, META_HORAS_SEMANA, CONTEUDOS } from './dados.js';

let instance;

export function useHoras() {
  if (instance) {
    return instance;
  }

  const horas = ref(Armazenamento.carregar('horas', {}));
  const semanaAtual = ref(1);

  watch(horas, (novoValor) => {
    Armazenamento.salvar('horas', novoValor);
  }, { deep: true });

  const materias = CONTEUDOS.map(m => m.id);

  const getHorasDia = (sem, dia) => horas.value[sem]?.[dia] || {};

  const horaValor = (sem, dia, mat) => getHorasDia(sem, dia)[mat] || 0;
  
  const setHora = (sem, dia, mat, val) => {
    // Adaptação para o registro rápido no Diário
    // Se 'sem' for uma data completa (ex: "2026-07-17"), usamos 'dia' como a matéria.
    if (String(sem).includes('-')) {
      const data = sem;
      const materia = dia;
      if (!horas.value[data]) horas.value[data] = {};
      horas.value[data][materia] = Math.max(0, Number(mat) || 0);
    } else { // Lógica original para a tabela de horas
      if (!horas.value[sem]) horas.value[sem] = {};
      if (!horas.value[sem][dia]) horas.value[sem][dia] = {};
      horas.value[sem][dia][mat] = Math.max(0, Number(val) || 0);
    }
  };

  const totalDia = (sem, dia) => computed(() => {
    return materias.reduce((acc, mat) => acc + (getHorasDia(sem, dia)[mat] || 0), 0);
  }).value;

  const totalMateriaSemana = (sem, mat) => {
    if (!horas.value[sem]) return 0;
    return DIAS_SEMANA.reduce((acc, dia) => acc + (horas.value[sem][dia.valor]?.[mat] || 0), 0);
  };

  const horasSemana = (sem) => {
    if (!horas.value[sem]) return 0;
    return materias.reduce((acc, mat) => acc + totalMateriaSemana(sem, mat), 0);
  };

  const totalAcumulado = (mat) => {
    let total = 0;
    for (let i = 1; i <= SEMANAS_PLANO; i++) {
      total += totalMateriaSemana(i, mat);
    }
    return total;
  };

  const totalHorasAcumuladas = computed(() => materias.reduce((acc, mat) => acc + totalAcumulado(mat), 0));

  const horasSemanaAtual = computed(() => horasSemana(semanaAtual.value));

  const metaSemanaCss = computed(() => {
    const progresso = horasSemanaAtual.value / META_HORAS_SEMANA;
    if (progresso >= 1) return 'verde';
    if (progresso >= 0.7) return 'laranja';
    return '';
  });

  const totalMeta = computed(() => SEMANAS_PLANO * META_HORAS_SEMANA);

  instance = { horas, semanaAtual, DIAS_SEMANA, SEMANAS_PLANO, META_HORAS_SEMANA, horaValor, setHora, totalDia, totalMateriaSemana, horasSemana, totalAcumulado, totalHorasAcumuladas, horasSemanaAtual, metaSemanaCss, totalMeta };
  return instance;
}