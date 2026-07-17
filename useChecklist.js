import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { CONTEUDOS } from './dados.js';

let instance;

export function useChecklist() {
  if (instance) {
    return instance;
  }

  const checklist = ref(Armazenamento.carregar('checklist', {}));
  const filtro = ref('');
  const gruposAbertos = ref(Armazenamento.carregar('gruposAbertos', {}));

  watch(checklist, (novoValor) => {
    Armazenamento.salvar('checklist', novoValor);
  }, { deep: true });

  watch(gruposAbertos, (novoValor) => {
    Armazenamento.salvar('gruposAbertos', novoValor);
  }, { deep: true });

  function alternarItem(materiaId, grupoNome, topicoIndex) {
    const id = `${materiaId}-${grupoNome}-${topicoIndex}`;
    checklist.value[id] = !checklist.value[id];
  }

  const totalItens = (materia) => materia.grupos.reduce((acc, g) => acc + g.topicos.length, 0);

  const itensConcluidos = (materia) => {
    return materia.grupos.reduce((acc, g) => {
      return acc + g.topicos.reduce((subAcc, t, idx) => {
        const id = `${materia.id}-${g.nome}-${idx}`;
        return subAcc + (checklist.value[id] ? 1 : 0);
      }, 0);
    }, 0);
  };

  const itensConcluidosGrupo = (materiaId, grupo) => {
    return grupo.topicos.reduce((acc, t, idx) => {
      const id = `${materiaId}-${grupo.nome}-${idx}`;
      return acc + (checklist.value[id] ? 1 : 0);
    }, 0);
  };

  const progressoMateria = (materia) => {
    const total = totalItens(materia);
    if (total === 0) return 0;
    const concluidos = itensConcluidos(materia);
    return Math.round((concluidos / total) * 100);
  };

  const totalGeral = computed(() => CONTEUDOS.reduce((acc, m) => acc + totalItens(m), 0));
  const totalConcluidoGeral = computed(() => CONTEUDOS.reduce((acc, m) => acc + itensConcluidos(m), 0));

  const totalExerciciosSugeridos = computed(() =>
    CONTEUDOS.reduce((acc, m) => acc + m.grupos.reduce((s, g) => s + (g.exercicios_sugeridos || 0), 0), 0)
  );

  const progressoGeral = computed(() => {
    if (totalGeral.value === 0) return 0;
    return Math.round((totalConcluidoGeral.value / totalGeral.value) * 100);
  });

  const conteudosFiltrados = computed(() => {
    if (!filtro.value) return CONTEUDOS;
    const termo = filtro.value.toLowerCase();
    return CONTEUDOS.map(m => ({
      ...m,
      grupos: m.grupos.map(g => ({
        ...g,
        topicos: g.topicos.filter(t => t.toLowerCase().includes(termo))
      })).filter(g => g.topicos.length > 0)
    })).filter(m => m.grupos.length > 0);
  });

  function toggleGrupo(materiaId, grupoNome) {
    const id = `${materiaId}-${grupoNome}`;
    gruposAbertos.value[id] = !gruposAbertos.value[id];
  }

  function expandirTudo() {
    CONTEUDOS.forEach(m => {
      m.grupos.forEach(g => {
        gruposAbertos.value[`${m.id}-${g.nome}`] = true;
      });
    });
  }

  function colapsarTudo() {
    gruposAbertos.value = {};
  }

  instance = { checklist, progressoGeral, progressoMateria, itensConcluidos, totalItens, totalGeral, totalConcluidoGeral, totalExerciciosSugeridos, filtro, gruposAbertos, conteudosFiltrados, alternarItem, itensConcluidosGrupo, toggleGrupo, expandirTudo, colapsarTudo };
  return instance;
}
