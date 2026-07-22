// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EXERCICIOS } from '../../exercicios.js';

// useExercicios() usa singleton em nível de módulo, então cada teste precisa
// de vi.resetModules() + import dinâmico pra pegar estado limpo.
async function montarExercicios() {
  vi.resetModules();
  const { useExercicios } = await import('../../useExercicios.js');
  return useExercicios();
}

describe('useExercicios', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('materiasDisponiveis lista todas as matérias presentes em EXERCICIOS sem duplicar', async () => {
    const { materiasDisponiveis } = await montarExercicios();
    const idsEsperados = new Set(EXERCICIOS.map(q => q.materia));
    expect(materiasDisponiveis.value.length).toBe(idsEsperados.size);
    materiasDisponiveis.value.forEach(m => expect(idsEsperados.has(m.id)).toBe(true));
  });

  it('gruposDisponiveis sem filtro de matéria retorna todos os grupos únicos ordenados', async () => {
    const { gruposDisponiveis } = await montarExercicios();
    const esperado = [...new Set(EXERCICIOS.map(q => q.grupo))].sort();
    expect(gruposDisponiveis.value).toEqual(esperado);
  });

  it('gruposDisponiveis filtra grupos pela matéria selecionada', async () => {
    const { filtroMateria, gruposDisponiveis } = await montarExercicios();
    filtroMateria.value = 'quimica';
    const esperado = [...new Set(EXERCICIOS.filter(q => q.materia === 'quimica').map(q => q.grupo))].sort();
    expect(gruposDisponiveis.value).toEqual(esperado);
  });

  it('questoesFiltradas aplica filtro de matéria, grupo e dificuldade em conjunto', async () => {
    const { filtroMateria, filtroGrupo, filtroDificuldade, questoesFiltradas } = await montarExercicios();
    const amostra = EXERCICIOS.find(q => q.dificuldade === 'facil');
    filtroMateria.value = amostra.materia;
    filtroGrupo.value = amostra.grupo;
    filtroDificuldade.value = amostra.dificuldade;

    expect(questoesFiltradas.value.length).toBeGreaterThan(0);
    questoesFiltradas.value.forEach(q => {
      expect(q.materia).toBe(amostra.materia);
      expect(q.grupo).toBe(amostra.grupo);
      expect(q.dificuldade).toBe(amostra.dificuldade);
    });
  });

  it('questoesFiltradas retorna array vazio se nenhuma questão bater com os filtros', async () => {
    const { filtroMateria, filtroGrupo, questoesFiltradas } = await montarExercicios();
    filtroMateria.value = 'quimica';
    filtroGrupo.value = 'grupo-que-nao-existe-xyz';
    expect(questoesFiltradas.value).toEqual([]);
  });

  it('iniciarQuiz reseta todo o estado do quiz e entra em modoQuiz', async () => {
    const { iniciarQuiz, modoQuiz, quizQuestoes, quizIndex, respostas, revisao, mostrarExplicacao, selecionado, responded } = await montarExercicios();
    const questoes = EXERCICIOS.slice(0, 3);

    iniciarQuiz(questoes);

    expect(modoQuiz.value).toBe(true);
    expect(quizQuestoes.value).toEqual(questoes);
    expect(quizIndex.value).toBe(0);
    expect(respostas.value).toEqual({});
    expect(revisao.value).toBe(false);
    expect(mostrarExplicacao.value).toBe(false);
    expect(selecionado.value).toBeNull();
    expect(responded.value).toBe(false);
  });

  it('quizAtual é null fora do modoQuiz ou com quizQuestoes vazio', async () => {
    const { quizAtual, iniciarQuiz } = await montarExercicios();
    expect(quizAtual.value).toBeNull();
    iniciarQuiz([]);
    expect(quizAtual.value).toBeNull();
  });

  it('responderQuestao registra a resposta, marca selecionado e responded', async () => {
    const { iniciarQuiz, responderQuestao, respostas, selecionado, responded, quizAcertos, quizTotal } = await montarExercicios();
    const questoes = EXERCICIOS.slice(0, 2);
    iniciarQuiz(questoes);

    responderQuestao(questoes[0].id, questoes[0].correta);

    expect(respostas.value[questoes[0].id]).toBe(questoes[0].correta);
    expect(selecionado.value).toBe(questoes[0].correta);
    expect(responded.value).toBe(true);
    expect(quizAcertos.value).toBe(1);
    expect(quizTotal.value).toBe(1);
  });

  it('quizAcertos só conta respostas que batem com o índice correto', async () => {
    const { iniciarQuiz, responderQuestao, quizAcertos, quizTotal } = await montarExercicios();
    const questoes = EXERCICIOS.slice(0, 2);
    iniciarQuiz(questoes);

    responderQuestao(questoes[0].id, questoes[0].correta);
    const indiceErrado = (questoes[1].correta + 1) % questoes[1].alternativas.length;
    responderQuestao(questoes[1].id, indiceErrado);

    expect(quizAcertos.value).toBe(1);
    expect(quizTotal.value).toBe(2);
  });

  it('proximaQuestao avança o índice e restaura a resposta já dada para a próxima questão', async () => {
    const { iniciarQuiz, responderQuestao, proximaQuestao, quizIndex, selecionado, responded, quizProgresso } = await montarExercicios();
    const questoes = EXERCICIOS.slice(0, 3);
    iniciarQuiz(questoes);
    responderQuestao(questoes[1].id, questoes[1].correta);

    proximaQuestao();

    expect(quizIndex.value).toBe(1);
    expect(selecionado.value).toBe(questoes[1].correta);
    expect(responded.value).toBe(true);
    // quizIndex é 0-based (posição 1 = 2ª questão de 3) -- progresso usa
    // índice+1, senão a barra nunca chegaria a 100% na última questão.
    expect(quizProgresso.value).toBe(Math.round((2 / 3) * 100));
  });

  it('quizProgresso chega a 100% na última questão do quiz', async () => {
    const { iniciarQuiz, proximaQuestao, quizProgresso } = await montarExercicios();
    const questoes = EXERCICIOS.slice(0, 4);
    iniciarQuiz(questoes);

    proximaQuestao();
    proximaQuestao();
    proximaQuestao();

    expect(quizProgresso.value).toBe(100);
  });

  it('proximaQuestao não avança além da última questão', async () => {
    const { iniciarQuiz, proximaQuestao, quizIndex } = await montarExercicios();
    const questoes = EXERCICIOS.slice(0, 2);
    iniciarQuiz(questoes);

    proximaQuestao();
    proximaQuestao();
    proximaQuestao(); // tentativa extra além do limite

    expect(quizIndex.value).toBe(1);
  });

  it('voltarQuestao retrocede o índice e restaura seleção da questão anterior', async () => {
    const { iniciarQuiz, responderQuestao, proximaQuestao, voltarQuestao, quizIndex, selecionado, responded } = await montarExercicios();
    const questoes = EXERCICIOS.slice(0, 3);
    iniciarQuiz(questoes);
    responderQuestao(questoes[0].id, questoes[0].correta);
    proximaQuestao();

    voltarQuestao();

    expect(quizIndex.value).toBe(0);
    expect(selecionado.value).toBe(questoes[0].correta);
    expect(responded.value).toBe(true);
  });

  it('voltarQuestao não retrocede antes da primeira questão', async () => {
    const { iniciarQuiz, voltarQuestao, quizIndex } = await montarExercicios();
    iniciarQuiz(EXERCICIOS.slice(0, 2));

    voltarQuestao();

    expect(quizIndex.value).toBe(0);
  });

  it('voltarQuestao para uma questão ainda não respondida limpa seleção e responded', async () => {
    const { iniciarQuiz, responderQuestao, proximaQuestao, voltarQuestao, selecionado, responded } = await montarExercicios();
    const questoes = EXERCICIOS.slice(0, 2);
    iniciarQuiz(questoes);
    proximaQuestao(); // avança sem responder a questão 0
    voltarQuestao();

    expect(selecionado.value).toBeNull();
    expect(responded.value).toBe(false);
  });

  it('finalizarQuiz sai do modoQuiz e entra em modo revisão', async () => {
    const { iniciarQuiz, finalizarQuiz, modoQuiz, revisao } = await montarExercicios();
    iniciarQuiz(EXERCICIOS.slice(0, 1));

    finalizarQuiz();

    expect(modoQuiz.value).toBe(false);
    expect(revisao.value).toBe(true);
  });

  it('alternarFavorito adiciona e depois remove um id da lista de favoritos', async () => {
    const { alternarFavorito, favoritos, favoritosLista } = await montarExercicios();
    const questao = EXERCICIOS[0];

    alternarFavorito(questao.id);
    expect(favoritos.value).toContain(questao.id);
    expect(favoritosLista.value.map(q => q.id)).toContain(questao.id);

    alternarFavorito(questao.id);
    expect(favoritos.value).not.toContain(questao.id);
  });

  it('toggleExplicacao e toggleRevisao alternam seus respectivos booleanos', async () => {
    const { toggleExplicacao, toggleRevisao, mostrarExplicacao, revisao } = await montarExercicios();
    expect(mostrarExplicacao.value).toBe(false);
    toggleExplicacao();
    expect(mostrarExplicacao.value).toBe(true);
    toggleExplicacao();
    expect(mostrarExplicacao.value).toBe(false);

    expect(revisao.value).toBe(false);
    toggleRevisao();
    expect(revisao.value).toBe(true);
  });

  it('favoritos persiste no Armazenamento (localStorage) via watch', async () => {
    vi.useFakeTimers();
    try {
      const { alternarFavorito } = await montarExercicios();
      const questao = EXERCICIOS[0];
      alternarFavorito(questao.id);
      await vi.advanceTimersByTimeAsync(1100);

      const { Armazenamento } = await import('../../armazenamento.js');
      const salvo = Armazenamento.carregar('exercicios_favoritos', []);
      expect(salvo).toContain(questao.id);
    } finally {
      vi.useRealTimers();
    }
  });

  it('favoritos carrega do Armazenamento na inicialização (persistência entre sessões)', async () => {
    const { Armazenamento } = await import('../../armazenamento.js');
    const questao = EXERCICIOS[0];
    localStorage.setItem('petrobras_quimica_exercicios_favoritos', JSON.stringify([questao.id]));

    const { favoritos } = await montarExercicios();

    expect(favoritos.value).toEqual([questao.id]);
  });
});
