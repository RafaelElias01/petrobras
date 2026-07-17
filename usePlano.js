import { ref, onMounted } from 'vue';
import { marked } from 'marked';

let instance;

export function usePlano() {
  if (instance) {
    return instance;
  }

  const planos = ref([]);
  const planoSelecionado = ref('cronograma-12-semanas-provas');
  const planoHtml = ref('');
  const carregandoPlano = ref(false);

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
    carregandoPlano.value = true;
    planoHtml.value = '';
    try {
      const res = await fetch(`/api/plano/${planoSelecionado.value}`);
      if (res.ok) {
        const md = await res.text();
        planoHtml.value = marked.parse(md);
      }
    } catch (e) {
      console.error("Falha ao carregar plano", e);
    } finally {
      carregandoPlano.value = false;
    }
  }

  onMounted(async () => {
    await fetchPlanos();
    await carregarPlano();
  });

  instance = { planos, planoSelecionado, planoHtml, carregandoPlano, carregarPlano };
  return instance;
}
