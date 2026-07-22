// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, computed } from 'vue';

// useFlashcardReview() não é singleton (não usa `let instance`), recebe
// flashcards/cardsParaRevisar como parâmetros — então cada teste monta o
// estado a partir de refs próprias, sem precisar de vi.resetModules().
async function montarReview(cardsIniciais = []) {
  const { useFlashcardReview } = await import('../../useFlashcardReview.js');
  const flashcards = ref(cardsIniciais);
  const cardsParaRevisar = computed(() => flashcards.value);
  const api = useFlashcardReview(flashcards, cardsParaRevisar);
  return { ...api, flashcards, cardsParaRevisar };
}

function card(id, materia = 'Química', box = 1) {
  return { id, materia, frente: `frente ${id}`, verso: `verso ${id}`, box, lastReviewed: null };
}

describe('useFlashcardReview', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('estado inicial: fora do modo revisão, deck vazio, opções padrão', async () => {
    const { modoRevisao, configurandoRevisao, deckRevisao, cardAtual, opcoesRevisao } = await montarReview();
    expect(modoRevisao.value).toBe(false);
    expect(configurandoRevisao.value).toBe(false);
    expect(deckRevisao.value).toEqual([]);
    expect(cardAtual.value).toBeNull();
    expect(opcoesRevisao.value).toEqual({ materias: [], numCards: 10, aleatorio: true });
  });

  it('abrirConfiguracaoRevisao/cancelarConfiguracaoRevisao alternam a tela de configuração', async () => {
    const { abrirConfiguracaoRevisao, cancelarConfiguracaoRevisao, configurandoRevisao } = await montarReview();
    abrirConfiguracaoRevisao();
    expect(configurandoRevisao.value).toBe(true);
    cancelarConfiguracaoRevisao();
    expect(configurandoRevisao.value).toBe(false);
  });

  it('iniciarRevisao monta o deck a partir de cardsParaRevisar e entra em modoRevisao', async () => {
    const cards = [card(1), card(2), card(3)];
    const { iniciarRevisao, modoRevisao, deckRevisao, cardAtualIndex, configurandoRevisao } = await montarReview(cards);

    configurandoRevisao.value = true;
    iniciarRevisao();

    expect(modoRevisao.value).toBe(true);
    expect(configurandoRevisao.value).toBe(false);
    expect(deckRevisao.value.length).toBe(3);
    expect(cardAtualIndex.value).toBe(0);
    expect(deckRevisao.value.every(c => c.virado === false)).toBe(true);
  });

  it('iniciarRevisao respeita numCards, limitando o tamanho do deck', async () => {
    const cards = [card(1), card(2), card(3), card(4), card(5)];
    const { iniciarRevisao, deckRevisao, opcoesRevisao } = await montarReview(cards);

    opcoesRevisao.value.numCards = 2;
    opcoesRevisao.value.aleatorio = false;
    iniciarRevisao();

    expect(deckRevisao.value.length).toBe(2);
  });

  it('iniciarRevisao filtra por matérias selecionadas em opcoesRevisao.materias', async () => {
    const cards = [card(1, 'Química'), card(2, 'Matemática'), card(3, 'Química')];
    const { iniciarRevisao, deckRevisao, opcoesRevisao } = await montarReview(cards);

    opcoesRevisao.value.materias = ['Química'];
    opcoesRevisao.value.aleatorio = false;
    iniciarRevisao();

    expect(deckRevisao.value.length).toBe(2);
    expect(deckRevisao.value.every(c => c.materia === 'Química')).toBe(true);
  });

  it('iniciarRevisao com deck vazio (nenhum card pendente) não entra em erro, fica com deck vazio', async () => {
    const { iniciarRevisao, deckRevisao, modoRevisao, cardAtual } = await montarReview([]);
    iniciarRevisao();
    expect(modoRevisao.value).toBe(true);
    expect(deckRevisao.value).toEqual([]);
    expect(cardAtual.value).toBeNull();
  });

  it('progressoRevisao é 0 com deck vazio e cresce conforme avança pelo deck', async () => {
    const cards = [card(1), card(2), card(3), card(4)];
    const { iniciarRevisao, progressoRevisao, proximoCard, opcoesRevisao } = await montarReview(cards);
    opcoesRevisao.value.aleatorio = false;
    iniciarRevisao();

    expect(progressoRevisao.value).toBe(25); // (0+1)/4 = 25%
    proximoCard();
    expect(progressoRevisao.value).toBe(50);
  });

  it('proximoCard avança o índice e finaliza a revisão ao passar do último card', async () => {
    const cards = [card(1), card(2)];
    const { iniciarRevisao, proximoCard, cardAtualIndex, modoRevisao, opcoesRevisao } = await montarReview(cards);
    opcoesRevisao.value.aleatorio = false;
    iniciarRevisao();

    proximoCard();
    expect(cardAtualIndex.value).toBe(1);
    expect(modoRevisao.value).toBe(true);

    proximoCard(); // último card -> deveria finalizar
    expect(modoRevisao.value).toBe(false);
  });

  it('marcarResultado(true) aumenta o box do card (máx 5) e atualiza lastReviewed, propagando para o array original', async () => {
    vi.setSystemTime(new Date('2026-07-22T10:00:00-03:00'));
    try {
      const cards = [card(1, 'Química', 4)];
      const { flashcards, iniciarRevisao, marcarResultado, opcoesRevisao } = await montarReview(cards);
      opcoesRevisao.value.aleatorio = false;
      iniciarRevisao();

      await marcarResultado(true);

      expect(flashcards.value[0].box).toBe(5);
      expect(flashcards.value[0].lastReviewed).toBe('2026-07-22');
    } finally {
      vi.useRealTimers();
    }
  });

  it('marcarResultado(true) não ultrapassa box 5 mesmo se já estiver no máximo', async () => {
    const cards = [card(1, 'Química', 5)];
    const { flashcards, iniciarRevisao, marcarResultado, opcoesRevisao } = await montarReview(cards);
    opcoesRevisao.value.aleatorio = false;
    iniciarRevisao();

    await marcarResultado(true);

    expect(flashcards.value[0].box).toBe(5);
  });

  it('marcarResultado(false) reseta o box para 1, mesmo vindo de um box alto', async () => {
    const cards = [card(1, 'Química', 5)];
    const { flashcards, iniciarRevisao, marcarResultado, opcoesRevisao } = await montarReview(cards);
    opcoesRevisao.value.aleatorio = false;
    iniciarRevisao();

    await marcarResultado(false);

    expect(flashcards.value[0].box).toBe(1);
  });

  it('marcarResultado sem cardAtual (deck vazio) não lança erro', async () => {
    const { marcarResultado, cardAtual } = await montarReview([]);
    expect(cardAtual.value).toBeNull();
    await expect(marcarResultado(true)).resolves.toBeUndefined();
  });

  it('marcarResultado avança para o próximo card automaticamente', async () => {
    const cards = [card(1), card(2)];
    const { iniciarRevisao, marcarResultado, cardAtualIndex, opcoesRevisao } = await montarReview(cards);
    opcoesRevisao.value.aleatorio = false;
    iniciarRevisao();

    await marcarResultado(true);
    expect(cardAtualIndex.value).toBe(1);
  });

  it('finalizarRevisao encerra o modoRevisao diretamente', async () => {
    const cards = [card(1)];
    const { iniciarRevisao, finalizarRevisao, modoRevisao, opcoesRevisao } = await montarReview(cards);
    opcoesRevisao.value.aleatorio = false;
    iniciarRevisao();
    expect(modoRevisao.value).toBe(true);

    finalizarRevisao();
    expect(modoRevisao.value).toBe(false);
  });
});
