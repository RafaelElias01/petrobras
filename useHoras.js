import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { DIAS_SEMANA, SEMANAS_PLANO, META_HORAS_SEMANA, META_HORAS_DIA, CONTEUDOS } from './dados.js';

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

  const horaValor = (sem, dia, mat) => {
    if (mat === undefined) {
      return horas.value[sem]?.[dia] || 0;
    }
    return getHorasDia(sem, dia)[mat] || 0;
  };
  
  const setHora = (sem, dia, mat, val) => {
    if (String(sem).includes('-')) {
      const data = sem;
      const materia = dia;
      if (!horas.value[data]) horas.value[data] = {};
      horas.value[data][materia] = Math.max(0, Number(val) || 0);
    } else {
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

  const hoje = new Date().toISOString().slice(0, 10);

  const totalHoje = computed(() => {
    const registros = horas.value[hoje] || {};
    return Object.values(registros).reduce((acc, v) => acc + v, 0);
  });

  const registrosHoje = computed(() => {
    const registros = horas.value[hoje] || {};
    return Object.keys(registros)
      .filter(id => registros[id] > 0)
      .map(id => {
        const materia = CONTEUDOS.find(c => c.id === id);
        return {
          id,
          nome: materia ? materia.nome : id,
          icone: materia ? materia.icone : '📚',
          cor: materia ? materia.cor : '#6b7280',
          horas: registros[id]
        };
      })
      .sort((a, b) => b.horas - a.horas);
  });

  function adicionarHoras(data, materiaId, incremento) {
    const atual = horaValor(data, materiaId);
    setHora(data, materiaId, null, (atual + incremento));
  }

  function removerMateria(data, materiaId) {
    if (horas.value[data]) {
      delete horas.value[data][materiaId];
      if (Object.keys(horas.value[data]).length === 0) {
        delete horas.value[data];
      }
    }
    horas.value = { ...horas.value };
  }

  instance = { horas, semanaAtual, DIAS_SEMANA, SEMANAS_PLANO, META_HORAS_SEMANA, META_HORAS_DIA, horaValor, setHora, totalDia, totalMateriaSemana, horasSemana, totalAcumulado, totalHorasAcumuladas, horasSemanaAtual, metaSemanaCss, totalMeta, totalHoje, registrosHoje, adicionarHoras, removerMateria };
  return instance;
}
