import { ref, computed } from 'vue';

export function useFlashcardReview(flashcards, cardsParaRevisar) {
  const modoRevisao = ref(false);
  const configurandoRevisao = ref(false);
  const deckRevisao = ref([]);
  const cardAtualIndex = ref(0);
  const opcoesRevisao = ref({ materias: [], numCards: 10, aleatorio: true });

  const cardAtual = computed(() => deckRevisao.value[cardAtualIndex.value] || null);

  const progressoRevisao = computed(() =>
    deckRevisao.value.length > 0
      ? Math.round(((cardAtualIndex.value + 1) / deckRevisao.value.length) * 100)
      : 0
  );

  function abrirConfiguracaoRevisao() {
    configurandoRevisao.value = true;
  }

  function cancelarConfiguracaoRevisao() {
    configurandoRevisao.value = false;
  }

  function iniciarRevisao() {
    configurandoRevisao.value = false;
    let dueCards = [...cardsParaRevisar.value];

    if (opcoesRevisao.value.materias.length > 0) {
      dueCards = dueCards.filter(c => opcoesRevisao.value.materias.includes(c.materia));
    }

    if (opcoesRevisao.value.aleatorio) {
      for (let i = dueCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dueCards[i], dueCards[j]] = [dueCards[j], dueCards[i]];
      }
    }

    deckRevisao.value = dueCards.slice(0, opcoesRevisao.value.numCards).map(c => ({ ...c, virado: false }));
    cardAtualIndex.value = 0;
    modoRevisao.value = true;
  }

  function proximoCard() {
    if (cardAtualIndex.value < deckRevisao.value.length - 1) {
      cardAtualIndex.value++;
    } else {
      finalizarRevisao();
    }
  }

  async function marcarResultado(acertou) {
    const card = cardAtual.value;
    if (!card) return;

    if (acertou) card.box = Math.min((card.box || 1) + 1, 5);
    else card.box = 1;
    card.lastReviewed = new Date().toISOString().slice(0, 10);

    const original = flashcards.value.find(f => f.id === card.id);
    if (original) Object.assign(original, { box: card.box, lastReviewed: card.lastReviewed });

    proximoCard();
  }

  function finalizarRevisao() {
    modoRevisao.value = false;
  }

  return {
    modoRevisao, configurandoRevisao, deckRevisao, cardAtualIndex, opcoesRevisao,
    cardAtual, progressoRevisao,
    abrirConfiguracaoRevisao, cancelarConfiguracaoRevisao, iniciarRevisao, proximoCard, marcarResultado, finalizarRevisao
  };
}