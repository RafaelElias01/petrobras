import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { CONTEUDOS } from './dados.js';

let instance;

export function useErros() {
  if (instance) return instance;

  const erros = ref([]);
  const editandoErro = ref(null);
  const carregado = ref(false);
  const regrasDeOuro = ref(['', '', '', '', '']);

  const materias = CONTEUDOS.map(m => m.nome);

  async function carregarErros() {
    if (carregado.value) return;
    erros.value = await Armazenamento.carregar('erros', []);
    const regras = await Armazenamento.carregar('regrasDeOuro', null);
    if (regras) regrasDeOuro.value = regras;
    carregado.value = true;
  }

  watch(erros, (novoValor) => {
    if (!carregado.value) return;
    Armazenamento.salvar('erros', novoValor);
  }, { deep: true });

  watch(regrasDeOuro, (val) => {
    if (!carregado.value) return;
    Armazenamento.salvar('regrasDeOuro', val);
  }, { deep: true });

  const totalErros = computed(() => erros.value.length);

  const errosAgrupados = computed(() => {
    const grupos = Object.fromEntries(materias.map(m => [m, []]));
    erros.value.forEach(e => {
      if (grupos[e.materia]) grupos[e.materia].push(e);
    });
    return grupos;
  });

  const errosPorMateria = computed(() => {
    return materias.map(mat => {
      const lista = erros.value.filter(e => e.materia === mat);
      const total = lista.length;
      const A = lista.filter(e => (e.classificacao || e.tipo) === 'A').length;
      const B = lista.filter(e => (e.classificacao || e.tipo) === 'B').length;
      const C = lista.filter(e => (e.classificacao || e.tipo) === 'C').length;
      const revisados = lista.filter(e => e.revisado).length;
      return { materia: mat, total, A, B, C, revisados, pendentes: total - revisados };
    });
  });

  const errosFrequentes = computed(() => {
    return erros.value.filter(e => e.classificacao === 'A' || e.classificacao === 'B' || (e.tipo && e.tipo !== 'C'));
  });

  function novoErro() {
    const idx = erros.value.length + 1;
    editandoErro.value = { id: Date.now(), data: new Date().toISOString().slice(0, 10), materia: '', topico: '', questao: '', pensamento: '', respostaCorreta: '', lacuna: '', classificacao: 'A', revisado: false, revisaoD7: null, revisaoD30: null };
  }

  function salvarErro() {
    if (!editandoErro.value) return;
    const erro = { ...editandoErro.value };
    if (erro.id && erros.value.find(e => e.id === erro.id)) {
      const index = erros.value.findIndex(e => e.id === erro.id);
      if (index > -1) erros.value[index] = erro;
    } else {
      if (!erro.id) erro.id = Date.now();
      erros.value.push(erro);
    }
    editandoErro.value = null;
  }

  function removerErro(id) {
    erros.value = erros.value.filter(e => e.id !== id);
  }

  function registrarRevisao(id, prazo) {
    const e = erros.value.find(e => e.id === id);
    if (!e) return;
    if (prazo === 7) e.revisaoD7 = { data: new Date().toISOString().slice(0, 10), acertou: false };
    if (prazo === 30) e.revisaoD30 = { data: new Date().toISOString().slice(0, 10), acertou: false };
  }

  function marcarRevisaoAcertou(id, prazo) {
    const e = erros.value.find(e => e.id === id);
    if (!e) return;
    if (prazo === 7 && e.revisaoD7) e.revisaoD7.acertou = true;
    if (prazo === 30 && e.revisaoD30) e.revisaoD30.acertou = true;
  }

  instance = {
    erros, editandoErro, totalErros, errosAgrupados, errosPorMateria, errosFrequentes,
    regrasDeOuro,
    carregarErros, novoErro, salvarErro, cancelarErro: () => editandoErro.value = null,
    editarErro: (e) => editandoErro.value = { ...e },
    removerErro, registrarRevisao, marcarRevisaoAcertou
  };
  return instance;
}
