import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { CONTEUDOS } from './dados.js';
import { useDiario } from './useDiario.js';

let instance;

export function useErros() {
  if (instance) {
    return instance;
  }

  const { agendarRevisao } = useDiario();

  const erros = ref([]);
  const editandoErro = ref(null);
  const carregado = ref(false);

  const materias = CONTEUDOS.map(m => m.nome);

  async function carregarErros() {
    if (carregado.value) return;
    erros.value = await Armazenamento.carregar('erros', []);
    carregado.value = true;
  }

  watch(erros, (novoValor) => {
    if (!carregado.value) return;
    Armazenamento.salvar('erros', novoValor);
  }, { deep: true });

  const totalErros = computed(() => erros.value.length);

  const errosAgrupados = computed(() => {
    const grupos = Object.fromEntries(materias.map(m => [m, []]));
    erros.value.forEach(e => {
      if (grupos[e.materia]) grupos[e.materia].push(e);
    });
    return grupos;
  });

  function novoErro() {
    editandoErro.value = { id: null, data: new Date().toISOString().slice(0, 10), tipo: 'A' };
  }

  function salvarErro() {
    if (!editandoErro.value) return;
    const erro = { ...editandoErro.value };
    if (erro.id) {
      const index = erros.value.findIndex(e => e.id === erro.id);
      if (index > -1) erros.value[index] = erro;
    } else {
      erro.id = Date.now();
      erros.value.push(erro);
    }
    editandoErro.value = null;
  }

  function removerErro(id) {
    erros.value = erros.value.filter(e => e.id !== id);
  }

  instance = { erros, editandoErro, totalErros, errosAgrupados, carregarErros, novoErro, salvarErro, cancelarErro: () => editandoErro.value = null, editarErro: (e) => editandoErro.value = { ...e }, removerErro, agendarRevisao };
  return instance;
}
