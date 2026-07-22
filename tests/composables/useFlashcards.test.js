// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// useFlashcards() usa singleton em nível de módulo (`let instance`), então cada
// teste precisa de vi.resetModules() + import dinâmico pra pegar estado limpo.
async function montarFlashcards() {
  vi.resetModules();
  const { useFlashcards } = await import('../../useFlashcards.js');
  return useFlashcards();
}

describe('useFlashcards', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('carregarFlashcards popula com o deck padrão quando não há dados salvos', async () => {
    const { flashcards, carregarFlashcards } = await montarFlashcards();
    await carregarFlashcards();
    expect(flashcards.value.length).toBeGreaterThan(0);
    expect(flashcards.value[0].box).toBe(1);
  });

  it('card nunca revisado (lastReviewed null) está sempre pendente de revisão', async () => {
    const { flashcards, carregarFlashcards, cardsParaRevisar } = await montarFlashcards();
    await carregarFlashcards();
    expect(cardsParaRevisar.value.length).toBe(flashcards.value.length);
  });

  it('card revisado HOJE não está pendente de revisão hoje mesmo', async () => {
    vi.setSystemTime(new Date('2026-07-21T10:00:00-03:00')); // 21/07 de manhã, horário de Brasília
    try {
      const { flashcards, carregarFlashcards, cardsParaRevisar } = await montarFlashcards();
      await carregarFlashcards();

      const card = flashcards.value[0];
      card.box = 1; // intervalo de 1 dia (LEITNER_BOXES[1] = 1)
      card.lastReviewed = '2026-07-21'; // revisado "hoje" (mesma data do relógio simulado)

      const pendente = cardsParaRevisar.value.some(c => c.id === card.id);
      expect(pendente).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('card revisado ontem, com intervalo de 1 dia, está pendente de revisão hoje', async () => {
    vi.setSystemTime(new Date('2026-07-21T10:00:00-03:00'));
    try {
      const { flashcards, carregarFlashcards, cardsParaRevisar } = await montarFlashcards();
      await carregarFlashcards();

      const card = flashcards.value[0];
      card.box = 1;
      card.lastReviewed = '2026-07-20';

      const pendente = cardsParaRevisar.value.some(c => c.id === card.id);
      expect(pendente).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('novoFlashcard + salvarFlashcard adiciona um card novo ao deck', async () => {
    const { flashcards, carregarFlashcards, novoFlashcard, editandoFlashcard, salvarFlashcard } = await montarFlashcards();
    await carregarFlashcards();
    const totalAntes = flashcards.value.length;

    novoFlashcard();
    editandoFlashcard.value.materia = 'Química';
    editandoFlashcard.value.frente = 'Pergunta teste';
    editandoFlashcard.value.verso = 'Resposta teste';
    salvarFlashcard();

    expect(flashcards.value.length).toBe(totalAntes + 1);
    expect(flashcards.value.at(-1).frente).toBe('Pergunta teste');
    expect(editandoFlashcard.value).toBe(null);
  });

  it('salvarFlashcard não adiciona nada se a matéria estiver vazia', async () => {
    const { flashcards, carregarFlashcards, novoFlashcard, salvarFlashcard } = await montarFlashcards();
    await carregarFlashcards();
    const totalAntes = flashcards.value.length;

    novoFlashcard();
    salvarFlashcard();

    expect(flashcards.value.length).toBe(totalAntes);
  });

  it('removerFlashcard remove o card pelo id', async () => {
    const { flashcards, carregarFlashcards, removerFlashcard } = await montarFlashcards();
    await carregarFlashcards();
    const idParaRemover = flashcards.value[0].id;
    const totalAntes = flashcards.value.length;

    removerFlashcard(idParaRemover);

    expect(flashcards.value.length).toBe(totalAntes - 1);
    expect(flashcards.value.find(f => f.id === idParaRemover)).toBeUndefined();
  });

  it('editarFlashcard copia o card pra edição (cópia, não referência ao original)', async () => {
    const { flashcards, carregarFlashcards, editarFlashcard, editandoFlashcard } = await montarFlashcards();
    await carregarFlashcards();
    const original = flashcards.value[0];

    editarFlashcard(original);
    editandoFlashcard.value.frente = 'Alterado só na cópia';

    expect(editandoFlashcard.value).not.toBe(original);
    expect(original.frente).not.toBe('Alterado só na cópia');
  });

  it('cancelarFlashcard limpa editandoFlashcard sem alterar o deck', async () => {
    const { flashcards, carregarFlashcards, novoFlashcard, cancelarFlashcard, editandoFlashcard } = await montarFlashcards();
    await carregarFlashcards();
    const totalAntes = flashcards.value.length;

    novoFlashcard();
    cancelarFlashcard();

    expect(editandoFlashcard.value).toBeNull();
    expect(flashcards.value.length).toBe(totalAntes);
  });

  it('salvarFlashcard com id existente atualiza o card em vez de duplicar', async () => {
    const { flashcards, carregarFlashcards, editarFlashcard, editandoFlashcard, salvarFlashcard } = await montarFlashcards();
    await carregarFlashcards();
    const alvo = flashcards.value[0];
    const totalAntes = flashcards.value.length;

    editarFlashcard(alvo);
    editandoFlashcard.value.verso = 'Resposta atualizada';
    salvarFlashcard();

    expect(flashcards.value.length).toBe(totalAntes);
    expect(flashcards.value.find(f => f.id === alvo.id).verso).toBe('Resposta atualizada');
  });

  it('flashcardsAgrupados cobre TODAS as matérias de CONTEUDOS, mesmo as sem nenhum card', async () => {
    vi.resetModules();
    const { CONTEUDOS } = await import('../../dados.js');
    const { useFlashcards } = await import('../../useFlashcards.js');
    const { flashcards, carregarFlashcards, flashcardsAgrupados, novoFlashcard, editandoFlashcard, salvarFlashcard } = useFlashcards();
    await carregarFlashcards();

    // esvazia o deck e insere um único card, só pra confirmar que uma matéria
    // sem NENHUM flashcard ainda aparece como chave (array vazio) no agrupamento.
    flashcards.value.length = 0;
    novoFlashcard();
    editandoFlashcard.value.materia = CONTEUDOS[0].nome;
    editandoFlashcard.value.frente = 'x';
    editandoFlashcard.value.verso = 'y';
    salvarFlashcard();

    const grupos = flashcardsAgrupados.value;
    expect(Object.keys(grupos).length).toBe(CONTEUDOS.length);
    expect(grupos[CONTEUDOS[0].nome].length).toBe(1);
    if (CONTEUDOS.length > 1) {
      expect(grupos[CONTEUDOS[1].nome]).toEqual([]);
    }
  });

  it('flashcardsAgrupados ignora cards com matéria que não existe em CONTEUDOS (órfãos)', async () => {
    vi.resetModules();
    const { useFlashcards } = await import('../../useFlashcards.js');
    const { flashcards, carregarFlashcards, flashcardsAgrupados } = useFlashcards();
    await carregarFlashcards();

    flashcards.value.push({ id: 999999, materia: 'Matéria Inexistente', frente: 'x', verso: 'y', box: 1, lastReviewed: null });

    const grupos = flashcardsAgrupados.value;
    expect(grupos['Matéria Inexistente']).toBeUndefined();
    const totalAgrupado = Object.values(grupos).reduce((acc, arr) => acc + arr.length, 0);
    expect(totalAgrupado).toBe(flashcards.value.length - 1); // o órfão não aparece em nenhum grupo
  });
});
