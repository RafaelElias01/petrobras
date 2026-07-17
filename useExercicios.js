import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { EXERCICIOS } from './exercicios.js';

let instance;

export function useExercicios() {
  if (instance) {
    return instance;
  }

  const filtroMateria = ref('');
  const filtroGrupo = ref('');
  const filtroDificuldade = ref('');
  const modoQuiz = ref(false);
  const quizQuestoes = ref([]);
  const quizIndex = ref(0);
  const respostas = ref({});
  const revisao = ref(false);
  const mostrarExplicacao = ref(false);
  const selecionado = ref(null);
  const favoritos = ref(Armazenamento.carregar('exercicios_favoritos', []));
  const responded = ref(false);

  const materiasDisponiveis = computed(() => {
    const materias = new Map();
    EXERCICIOS.forEach(q => {
      if (!materias.has(q.materia)) {
        materias.set(q.materia, q.materiaNome || q.materia);
      }
    });
    return Array.from(materias, ([id, nome]) => ({ id, nome }));
  });

  const gruposDisponiveis = computed(() => {
    const base = filtroMateria.value
      ? EXERCICIOS.filter(q => q.materia === filtroMateria.value)
      : EXERCICIOS;
    return [...new Set(base.map(q => q.grupo))].sort();
  });

  const questoesFiltradas = computed(() => {
    let resultado = EXERCICIOS;
    if (filtroMateria.value) {
      resultado = resultado.filter(q => q.materia === filtroMateria.value);
    }
    if (filtroGrupo.value) {
      resultado = resultado.filter(q => q.grupo === filtroGrupo.value);
    }
    if (filtroDificuldade.value) {
      resultado = resultado.filter(q => q.dificuldade === filtroDificuldade.value);
    }
    return resultado;
  });

  const quizAtual = computed(() => {
    if (!modoQuiz.value || quizQuestoes.value.length === 0) return null;
    return quizQuestoes.value[quizIndex.value] || null;
  });

  const quizProgresso = computed(() => {
    if (quizQuestoes.value.length === 0) return 0;
    return Math.round((quizIndex.value / quizQuestoes.value.length) * 100);
  });

  const quizAcertos = computed(() => {
    let acertos = 0;
    Object.entries(respostas.value).forEach(([questaoId, respostaIndex]) => {
      const questao = EXERCICIOS.find(q => q.id === Number(questaoId));
      if (questao && questao.correta === respostaIndex) {
        acertos++;
      }
    });
    return acertos;
  });

  const quizTotal = computed(() => {
    return Object.keys(respostas.value).length;
  });

  const favoritosLista = computed(() => {
    return EXERCICIOS.filter(q => favoritos.value.includes(q.id));
  });

  function iniciarQuiz(questoes) {
    modoQuiz.value = true;
    quizQuestoes.value = [...questoes];
    quizIndex.value = 0;
    respostas.value = {};
    revisao.value = false;
    mostrarExplicacao.value = false;
    selecionado.value = null;
    responded.value = false;
  }

  function responderQuestao(questaoId, alternativaIndex) {
    respostas.value = { ...respostas.value, [questaoId]: alternativaIndex };
    selecionado.value = alternativaIndex;
    responded.value = true;
  }

  function proximaQuestao() {
    if (quizIndex.value < quizQuestoes.value.length - 1) {
      quizIndex.value++;
      const questaoAtual = quizQuestoes.value[quizIndex.value];
      if (questaoAtual) {
        selecionado.value = respostas.value[questaoAtual.id] ?? null;
        responded.value = selecionado.value !== null;
      }
      mostrarExplicacao.value = false;
    }
  }

  function voltarQuestao() {
    if (quizIndex.value > 0) {
      quizIndex.value--;
      const questaoAtual = quizQuestoes.value[quizIndex.value];
      if (questaoAtual) {
        selecionado.value = respostas.value[questaoAtual.id] ?? null;
        responded.value = selecionado.value !== null;
      }
      mostrarExplicacao.value = false;
    }
  }

  function finalizarQuiz() {
    modoQuiz.value = false;
    revisao.value = true;
  }

  function alternarFavorito(questaoId) {
    const index = favoritos.value.indexOf(questaoId);
    if (index > -1) {
      favoritos.value = [...favoritos.value.filter(id => id !== questaoId)];
    } else {
      favoritos.value = [...favoritos.value, questaoId];
    }
  }

  function toggleExplicacao() {
    mostrarExplicacao.value = !mostrarExplicacao.value;
  }

  function toggleRevisao() {
    revisao.value = !revisao.value;
  }

  watch(favoritos, (novoValor) => {
    Armazenamento.salvar('exercicios_favoritos', novoValor);
  }, { deep: true });

  instance = {
    filtroMateria, filtroGrupo, filtroDificuldade,
    modoQuiz, quizQuestoes, quizIndex, respostas,
    revisao, mostrarExplicacao, selecionado, favoritos, responded,
    materiasDisponiveis, gruposDisponiveis, questoesFiltradas,
    quizAtual, quizProgresso, quizAcertos, quizTotal, favoritosLista,
    iniciarQuiz, responderQuestao, proximaQuestao, voltarQuestao,
    finalizarQuiz, alternarFavorito, toggleExplicacao, toggleRevisao
  };
  return instance;
}
