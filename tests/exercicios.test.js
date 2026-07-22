import { describe, it, expect } from 'vitest';
import { EXERCICIOS } from '../exercicios.js';
import { CONTEUDOS } from '../dados.js';

// Testes de integridade de dados para o banco de questões (EXERCICIOS).
// Objetivo: pegar automaticamente erros de conteúdo (ids duplicados, índice
// de resposta correta fora do array de alternativas, alternativas vazias ou
// duplicadas na mesma questão, matéria órfã, campos obrigatórios faltando)
// antes que cheguem em produção.

const MATERIAS_VALIDAS = new Set(CONTEUDOS.map(c => c.id));

describe('integridade de dados: EXERCICIOS', () => {
  it('EXERCICIOS não está vazio', () => {
    expect(EXERCICIOS.length).toBeGreaterThan(0);
  });

  it('nenhum id de questão está duplicado', () => {
    const ids = EXERCICIOS.map(q => q.id);
    const duplicados = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    expect(duplicados).toEqual([]);
  });

  it('toda questão tem os campos obrigatórios preenchidos (enunciado, alternativas, correta, explicacao, materia)', () => {
    const faltando = [];
    EXERCICIOS.forEach(q => {
      if (!q.enunciado || typeof q.enunciado !== 'string' || !q.enunciado.trim()) faltando.push(`#${q.id} enunciado`);
      if (!Array.isArray(q.alternativas) || q.alternativas.length === 0) faltando.push(`#${q.id} alternativas`);
      if (q.correta === undefined || q.correta === null) faltando.push(`#${q.id} correta`);
      if (!q.explicacao || typeof q.explicacao !== 'string' || !q.explicacao.trim()) faltando.push(`#${q.id} explicacao`);
      if (!q.materia || typeof q.materia !== 'string' || !q.materia.trim()) faltando.push(`#${q.id} materia`);
    });
    expect(faltando).toEqual([]);
  });

  it('campo "correta" é sempre um índice válido dentro de "alternativas"', () => {
    const invalidas = EXERCICIOS.filter(q => {
      return !Number.isInteger(q.correta) || q.correta < 0 || q.correta >= q.alternativas.length;
    }).map(q => q.id);
    expect(invalidas).toEqual([]);
  });

  it('toda questão tem "materia" que existe em CONTEUDOS (dados.js)', () => {
    const orfas = EXERCICIOS.filter(q => !MATERIAS_VALIDAS.has(q.materia)).map(q => ({ id: q.id, materia: q.materia }));
    expect(orfas).toEqual([]);
  });

  it('nenhuma questão tem alternativa vazia (string vazia ou só espaços)', () => {
    const comAlternativaVazia = EXERCICIOS.filter(q =>
      q.alternativas.some(a => typeof a !== 'string' || a.trim() === '')
    ).map(q => q.id);
    expect(comAlternativaVazia).toEqual([]);
  });

  it('nenhuma questão tem alternativas duplicadas entre si (mesmo texto repetido na mesma questão)', () => {
    // Regressão real encontrada: questões #28 e #256 tinham duas alternativas
    // com o texto exatamente igual (uma delas sendo, inclusive, a resposta
    // "correta" duplicada como distratora) — isso deixa a questão com menos
    // opções realmente distintas do que aparenta e pode confundir quem responde.
    const comDuplicata = EXERCICIOS.filter(q => {
      const textos = q.alternativas.map(a => a.trim());
      return new Set(textos).size !== textos.length;
    }).map(q => q.id);
    expect(comDuplicata).toEqual([]);
  });

  it('cada questão tem pelo menos 2 alternativas', () => {
    const poucas = EXERCICIOS.filter(q => q.alternativas.length < 2).map(q => q.id);
    expect(poucas).toEqual([]);
  });

  it('todo "grupo" é uma string não vazia', () => {
    const semGrupo = EXERCICIOS.filter(q => !q.grupo || typeof q.grupo !== 'string' || !q.grupo.trim()).map(q => q.id);
    expect(semGrupo).toEqual([]);
  });

  it('todo "dificuldade" é um dos valores esperados (facil, medio, dificil)', () => {
    const validas = new Set(['facil', 'medio', 'dificil']);
    const invalidas = EXERCICIOS.filter(q => !validas.has(q.dificuldade)).map(q => ({ id: q.id, dificuldade: q.dificuldade }));
    expect(invalidas).toEqual([]);
  });

  it('todos os ids são números inteiros positivos', () => {
    const invalidos = EXERCICIOS.filter(q => !Number.isInteger(q.id) || q.id <= 0).map(q => q.id);
    expect(invalidos).toEqual([]);
  });
});
