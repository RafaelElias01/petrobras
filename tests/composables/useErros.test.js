// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { CONTEUDOS } from '../../dados.js';

// useErros() também usa singleton em nível de módulo — resetar módulos entre testes.
async function montarErros() {
  vi.resetModules();
  const { useErros } = await import('../../useErros.js');
  return useErros();
}

const MATERIA = CONTEUDOS[0].nome;

describe('useErros', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicia vazio e não carregado antes de carregarErros()', async () => {
    const { erros, carregarErros } = await montarErros();
    expect(erros.value).toEqual([]);
    // sanity: carregarErros existe e é chamável (usado nos demais testes)
    expect(typeof carregarErros).toBe('function');
  });

  it('novoErro() prepara um erro em edição com valores padrão', async () => {
    const { novoErro, editandoErro } = await montarErros();

    novoErro();

    expect(editandoErro.value).toMatchObject({
      materia: '', topico: '', questao: '', pensamento: '',
      respostaCorreta: '', lacuna: '', classificacao: 'A', revisado: false,
      revisaoD7: null, revisaoD30: null,
    });
    expect(typeof editandoErro.value.id).toBe('number');
  });

  it('salvarErro() adiciona um novo erro à lista e limpa editandoErro', async () => {
    const { carregarErros, novoErro, salvarErro, editandoErro, erros, totalErros } = await montarErros();
    await carregarErros();

    novoErro();
    editandoErro.value.materia = MATERIA;
    editandoErro.value.classificacao = 'A';
    salvarErro();

    expect(totalErros.value).toBe(1);
    expect(erros.value[0].materia).toBe(MATERIA);
    expect(editandoErro.value).toBeNull();
  });

  it('salvarErro() em um erro existente atualiza em vez de duplicar', async () => {
    const { carregarErros, novoErro, salvarErro, editandoErro, editarErro, erros } = await montarErros();
    await carregarErros();

    novoErro();
    editandoErro.value.materia = MATERIA;
    editandoErro.value.topico = 'original';
    salvarErro();
    const id = erros.value[0].id;

    editarErro(erros.value[0]);
    editandoErro.value.topico = 'editado';
    salvarErro();

    expect(erros.value.length).toBe(1);
    expect(erros.value[0].id).toBe(id);
    expect(erros.value[0].topico).toBe('editado');
  });

  it('removerErro() remove pelo id', async () => {
    const { carregarErros, novoErro, salvarErro, editandoErro, removerErro, erros } = await montarErros();
    await carregarErros();

    novoErro();
    editandoErro.value.materia = MATERIA;
    salvarErro();
    const id = erros.value[0].id;

    removerErro(id);

    expect(erros.value).toEqual([]);
  });

  it('registrarRevisao/marcarRevisaoAcertou controlam D7 e D30 de um erro', async () => {
    const { carregarErros, novoErro, salvarErro, editandoErro, registrarRevisao, marcarRevisaoAcertou, erros } = await montarErros();
    await carregarErros();

    novoErro();
    editandoErro.value.materia = MATERIA;
    salvarErro();
    const id = erros.value[0].id;

    registrarRevisao(id, 7);
    expect(erros.value[0].revisaoD7).toMatchObject({ acertou: false });
    expect(erros.value[0].revisaoD30).toBeNull();

    marcarRevisaoAcertou(id, 7);
    expect(erros.value[0].revisaoD7.acertou).toBe(true);

    registrarRevisao(id, 30);
    marcarRevisaoAcertou(id, 30);
    expect(erros.value[0].revisaoD30.acertou).toBe(true);
  });

  it('errosPorMateria agrega total, classificações A/B/C e pendentes por matéria', async () => {
    const { carregarErros, novoErro, salvarErro, editandoErro, errosPorMateria } = await montarErros();
    await carregarErros();

    novoErro();
    editandoErro.value.materia = MATERIA;
    editandoErro.value.classificacao = 'A';
    salvarErro();

    novoErro();
    // novoErro() usa Date.now() como id; força um id distinto pra não colidir
    // com o erro anterior quando os dois são criados na mesma janela de tempo.
    editandoErro.value.id += 1;
    editandoErro.value.materia = MATERIA;
    editandoErro.value.classificacao = 'B';
    editandoErro.value.revisado = true;
    salvarErro();

    const linha = errosPorMateria.value.find(l => l.materia === MATERIA);
    expect(linha).toMatchObject({ total: 2, A: 1, B: 1, C: 0, revisados: 1, pendentes: 1 });
  });

  it('errosFrequentes inclui apenas classificação A ou B, exclui C', async () => {
    const { carregarErros, novoErro, salvarErro, editandoErro, errosFrequentes } = await montarErros();
    await carregarErros();

    novoErro();
    editandoErro.value.materia = MATERIA;
    editandoErro.value.classificacao = 'C';
    salvarErro();

    novoErro();
    editandoErro.value.id += 1; // evita colisão de id com Date.now() do erro anterior
    editandoErro.value.materia = MATERIA;
    editandoErro.value.classificacao = 'B';
    salvarErro();

    expect(errosFrequentes.value.length).toBe(1);
    expect(errosFrequentes.value[0].classificacao).toBe('B');
  });

  it('errosAgrupados agrupa erros por matéria, cobrindo todas as matérias de CONTEUDOS mesmo sem erro', async () => {
    const { carregarErros, novoErro, salvarErro, editandoErro, errosAgrupados } = await montarErros();
    await carregarErros();

    novoErro();
    editandoErro.value.materia = MATERIA;
    salvarErro();

    const grupos = errosAgrupados.value;
    expect(Object.keys(grupos).length).toBe(CONTEUDOS.length);
    expect(grupos[MATERIA].length).toBe(1);
    const outraMateria = CONTEUDOS[1].nome;
    expect(grupos[outraMateria]).toEqual([]);
  });

  it('errosAgrupados ignora erro com matéria que não existe em CONTEUDOS (órfão)', async () => {
    const { carregarErros, erros, errosAgrupados } = await montarErros();
    await carregarErros();
    erros.value.push({ id: 1, materia: 'Matéria Inexistente', classificacao: 'A', revisado: false });

    const grupos = errosAgrupados.value;
    expect(grupos['Matéria Inexistente']).toBeUndefined();
  });

  it('cancelarErro limpa editandoErro sem alterar a lista de erros', async () => {
    const { carregarErros, novoErro, cancelarErro, editandoErro, erros } = await montarErros();
    await carregarErros();
    const totalAntes = erros.value.length;

    novoErro();
    cancelarErro();

    expect(editandoErro.value).toBeNull();
    expect(erros.value.length).toBe(totalAntes);
  });

  it('editarErro copia o erro pra edição (cópia, não referência ao original)', async () => {
    const { carregarErros, novoErro, salvarErro, editandoErro, editarErro, erros } = await montarErros();
    await carregarErros();
    novoErro();
    editandoErro.value.materia = MATERIA;
    editandoErro.value.topico = 'original';
    salvarErro();
    const original = erros.value[0];

    editarErro(original);
    editandoErro.value.topico = 'alterado só na cópia';

    expect(editandoErro.value).not.toBe(original);
    expect(original.topico).toBe('original');
  });

  it('persiste regrasDeOuro no Armazenamento somente após carregarErros()', async () => {
    vi.useFakeTimers();
    try {
      const { carregarErros, regrasDeOuro } = await montarErros();
      await carregarErros();

      regrasDeOuro.value[0] = 'Sempre ler o enunciado duas vezes';
      await nextTick();
      vi.advanceTimersByTime(1100);

      const { Armazenamento } = await import('../../armazenamento.js');
      const salvo = Armazenamento.carregar('regrasDeOuro', null);
      expect(salvo).not.toBeNull();
      expect(salvo[0]).toBe('Sempre ler o enunciado duas vezes');
    } finally {
      vi.useRealTimers();
    }
  });

  it('persiste erros no Armazenamento (localStorage) somente após carregarErros()', async () => {
    vi.useFakeTimers();
    try {
      const { carregarErros, novoErro, salvarErro, editandoErro } = await montarErros();
      await carregarErros();

      novoErro();
      editandoErro.value.materia = MATERIA;
      salvarErro();
      await nextTick();
      vi.advanceTimersByTime(1100);

      const { Armazenamento } = await import('../../armazenamento.js');
      const salvo = Armazenamento.carregar('erros', null);
      expect(salvo).not.toBeNull();
      expect(salvo.length).toBe(1);
      expect(salvo[0].materia).toBe(MATERIA);
    } finally {
      vi.useRealTimers();
    }
  });
});
