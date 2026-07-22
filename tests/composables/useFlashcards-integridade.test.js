// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONTEUDOS } from '../../dados.js';

// FLASHCARDS_PADRAO não é exportado diretamente de useFlashcards.js, então
// pegamos o deck padrão através de carregarFlashcards() com localStorage
// vazio (é exatamente esse o caminho que popula flashcards.value com o
// deck padrão na primeira visita do usuário).
async function carregarDeckPadrao() {
  vi.resetModules();
  localStorage.clear();
  const { useFlashcards } = await import('../../useFlashcards.js');
  const { flashcards, carregarFlashcards } = useFlashcards();
  await carregarFlashcards();
  return flashcards.value;
}

const NOMES_MATERIAS_VALIDOS = new Set(CONTEUDOS.map(c => c.nome));

describe('integridade de dados: FLASHCARDS_PADRAO (via deck padrão de useFlashcards)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('o deck padrão não está vazio', async () => {
    const deck = await carregarDeckPadrao();
    expect(deck.length).toBeGreaterThan(0);
  });

  it('nenhum id de flashcard está duplicado', async () => {
    const deck = await carregarDeckPadrao();
    const ids = deck.map(f => f.id);
    const duplicados = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    expect(duplicados).toEqual([]);
  });

  it('toda "materia" de cada flashcard bate EXATAMENTE com algum "nome" em CONTEUDOS (dados.js)', async () => {
    // Regressão real: um flashcard já usou "Português" enquanto dados.js
    // tinha "Língua Portuguesa" como nome oficial da matéria, e o card ficava
    // órfão do agrupamento (flashcardsAgrupados só reconhece o nome exato).
    // Este teste pega automaticamente qualquer flashcard cuja matéria não
    // bata caractere-a-caractere com um nome de CONTEUDOS.
    const deck = await carregarDeckPadrao();
    const orfaos = deck
      .filter(f => !NOMES_MATERIAS_VALIDOS.has(f.materia))
      .map(f => ({ id: f.id, materia: f.materia }));
    expect(orfaos).toEqual([]);
  });

  it('todas as matérias de CONTEUDOS têm pelo menos 1 flashcard no deck padrão', async () => {
    const deck = await carregarDeckPadrao();
    const materiasComCard = new Set(deck.map(f => f.materia));
    const semCard = CONTEUDOS.map(c => c.nome).filter(nome => !materiasComCard.has(nome));
    expect(semCard).toEqual([]);
  });

  it('todo flashcard tem frente e verso não vazios', async () => {
    const deck = await carregarDeckPadrao();
    const incompletos = deck.filter(f =>
      !f.frente || typeof f.frente !== 'string' || !f.frente.trim() ||
      !f.verso || typeof f.verso !== 'string' || !f.verso.trim()
    ).map(f => f.id);
    expect(incompletos).toEqual([]);
  });

  it('todo flashcard começa com box 1 e lastReviewed null', async () => {
    const deck = await carregarDeckPadrao();
    const foraDoPadrao = deck.filter(f => f.box !== 1 || f.lastReviewed !== null).map(f => f.id);
    expect(foraDoPadrao).toEqual([]);
  });

  it('todos os ids são números inteiros positivos', async () => {
    const deck = await carregarDeckPadrao();
    const invalidos = deck.filter(f => !Number.isInteger(f.id) || f.id <= 0).map(f => f.id);
    expect(invalidos).toEqual([]);
  });
});
