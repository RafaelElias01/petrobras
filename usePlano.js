import { ref } from 'vue';
import { marked } from 'marked';

let instance;

export function usePlano() {
  if (instance) {
    return instance;
  }

  const planos = ref([]);
  const planoSelecionado = ref('');
  const planoHtml = ref('');
  const carregandoPlano = ref(false);
  let ultimaRequisicaoId = 0;

  async function fetchPlanos() {
    try {
      const res = await fetch('/api/planos');
      if (res.ok) planos.value = await res.json();
    } catch (e) {
      console.error("Falha ao buscar lista de planos", e);
    }
  }

  async function carregarPlano() {
    if (!planoSelecionado.value) return;
    const idRequisicao = ++ultimaRequisicaoId;
    carregandoPlano.value = true;
    planoHtml.value = '';
    try {
      const res = await fetch(`/api/plano/${planoSelecionado.value}`);
      if (res.ok) {
        const md = await res.text();
        if (idRequisicao === ultimaRequisicaoId) {
          planoHtml.value = marked.parse(md);
        }
      }
    } catch (e) {
      console.error("Falha ao carregar plano", e);
    } finally {
      if (idRequisicao === ultimaRequisicaoId) {
        carregandoPlano.value = false;
      }
    }
  }

  instance = { planos, planoSelecionado, planoHtml, carregandoPlano, fetchPlanos, carregarPlano };
  return instance;
}
