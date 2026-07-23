// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { CONTEUDOS } from '../../dados.js';

// useChecklist() usa um singleton em nível de módulo (`let instance`), então cada
// teste precisa de vi.resetModules() + import dinâmico pra pegar estado limpo.
async function montarChecklist() {
  vi.resetModules();
  const { useChecklist } = await import('../../useChecklist.js');
  return useChecklist();
}

function contarTopicos(materia) {
  return materia.grupos.reduce((acc, g) => acc + g.topicos.length, 0);
}

describe('useChecklist', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicia com checklist vazia e progresso geral zero', async () => {
    const { checklist, progressoGeral, filtro } = await montarChecklist();

    expect(checklist.value).toEqual({});
    expect(progressoGeral.value).toBe(0);
    expect(filtro.value).toBe('');
  });

  it('retorna a mesma instância (singleton) entre chamadas dentro do mesmo módulo', async () => {
    vi.resetModules();
    const { useChecklist } = await import('../../useChecklist.js');
    const a = useChecklist();
    const b = useChecklist();
    expect(a).toBe(b);
  });

  it('alternarItem marca/desmarca um tópico e atualiza itensConcluidos/progressoMateria', async () => {
    const { alternarItem, itensConcluidos, progressoMateria } = await montarChecklist();
    const materia = CONTEUDOS[0];
    const grupo = materia.grupos[0];

    alternarItem(materia.id, grupo.nome, 0);

    expect(itensConcluidos(materia)).toBe(1);
    const total = contarTopicos(materia);
    expect(progressoMateria(materia)).toBe(Math.round((1 / total) * 100));

    // alternar de novo desmarca
    alternarItem(materia.id, grupo.nome, 0);
    expect(itensConcluidos(materia)).toBe(0);
  });

  it('alternarItem retorna o novo estado (true ao marcar, false ao desmarcar)', async () => {
    const { alternarItem } = await montarChecklist();
    const materia = CONTEUDOS[0];
    const grupo = materia.grupos[0];

    expect(alternarItem(materia.id, grupo.nome, 0)).toBe(true);
    expect(alternarItem(materia.id, grupo.nome, 0)).toBe(false);
  });

  it('totalGeral e totalConcluidoGeral somam todas as matérias de CONTEUDOS', async () => {
    const { totalGeral, totalConcluidoGeral, alternarItem } = await montarChecklist();
    const esperado = CONTEUDOS.reduce((acc, m) => acc + contarTopicos(m), 0);

    expect(totalGeral.value).toBe(esperado);
    expect(totalConcluidoGeral.value).toBe(0);

    const materia = CONTEUDOS[0];
    alternarItem(materia.id, materia.grupos[0].nome, 0);
    expect(totalConcluidoGeral.value).toBe(1);
  });

  it('itensConcluidosGrupo conta apenas os tópicos marcados dentro de um grupo específico', async () => {
    const { alternarItem, itensConcluidosGrupo } = await montarChecklist();
    const materia = CONTEUDOS[0];
    const grupo = materia.grupos[0];

    alternarItem(materia.id, grupo.nome, 0);
    alternarItem(materia.id, grupo.nome, 1);

    expect(itensConcluidosGrupo(materia.id, grupo)).toBe(2);
  });

  it('toggleGrupo abre e fecha um grupo (toggle booleano)', async () => {
    const { toggleGrupo, gruposAbertos } = await montarChecklist();
    const materia = CONTEUDOS[0];
    const grupo = materia.grupos[0];
    const chave = `${materia.id}-${grupo.nome}`;

    toggleGrupo(materia.id, grupo.nome);
    expect(gruposAbertos.value[chave]).toBe(true);

    toggleGrupo(materia.id, grupo.nome);
    expect(gruposAbertos.value[chave]).toBe(false);
  });

  it('expandirTudo abre todos os grupos e colapsarTudo limpa tudo', async () => {
    const { expandirTudo, colapsarTudo, gruposAbertos } = await montarChecklist();

    expandirTudo();
    const totalGrupos = CONTEUDOS.reduce((acc, m) => acc + m.grupos.length, 0);
    expect(Object.keys(gruposAbertos.value).length).toBe(totalGrupos);
    expect(Object.values(gruposAbertos.value).every(v => v === true)).toBe(true);

    colapsarTudo();
    expect(gruposAbertos.value).toEqual({});
  });

  it('conteudosFiltrados filtra tópicos por termo de busca (case-insensitive) preservando o idxOriginal de cada tópico', async () => {
    const { filtro, conteudosFiltrados } = await montarChecklist();
    const materia = CONTEUDOS[0];
    const grupo = materia.grupos[0];
    const idxOriginalEsperado = grupo.topicos.indexOf(grupo.topicos[0]);
    const topico = grupo.topicos[0];
    const termo = topico.slice(0, 10);

    filtro.value = termo.toUpperCase(); // maiúsculo de propósito: implementação faz toLowerCase() dos dois lados
    await nextTick();

    const materiaFiltrada = conteudosFiltrados.value.find(m => m.id === materia.id);
    expect(materiaFiltrada).toBeDefined();
    const grupoFiltrado = materiaFiltrada.grupos.find(g => g.nome === grupo.nome);
    // topicos filtrados carregam { texto, idxOriginal } -- idxOriginal precisa
    // continuar apontando pra posição na lista completa (não filtrada), senão
    // marcar um item da busca marca o tópico errado no checklist (bug real
    // corrigido: idx do array filtrado usado como chave de storage).
    expect(grupoFiltrado.topicos).toContainEqual({ texto: topico, idxOriginal: idxOriginalEsperado });

    // sem filtro, devolve todos os tópicos (com idxOriginal = posição natural)
    filtro.value = '';
    await nextTick();
    const materiaSemFiltro = conteudosFiltrados.value.find(m => m.id === materia.id);
    const grupoSemFiltro = materiaSemFiltro.grupos.find(g => g.nome === grupo.nome);
    expect(grupoSemFiltro.topicos).toEqual(grupo.topicos.map((t, idxOriginal) => ({ texto: t, idxOriginal })));
  });

  it('persiste checklist e gruposAbertos no Armazenamento (localStorage)', async () => {
    vi.useFakeTimers();
    try {
      const { alternarItem, toggleGrupo } = await montarChecklist();
      const materia = CONTEUDOS[0];
      const grupo = materia.grupos[0];

      alternarItem(materia.id, grupo.nome, 0);
      toggleGrupo(materia.id, grupo.nome);
      await nextTick();
      vi.advanceTimersByTime(1100);

      const { Armazenamento } = await import('../../armazenamento.js');
      const checklistSalva = Armazenamento.carregar('checklist', null);
      const gruposSalvos = Armazenamento.carregar('gruposAbertos', null);

      expect(checklistSalva[`${materia.id}-${grupo.nome}-0`]).toBe(true);
      expect(gruposSalvos[`${materia.id}-${grupo.nome}`]).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('totalExerciciosSugeridos soma exercicios_sugeridos de todos os grupos de todas as matérias', async () => {
    const { totalExerciciosSugeridos } = await montarChecklist();
    const esperado = CONTEUDOS.reduce((acc, m) =>
      acc + m.grupos.reduce((s, g) => s + (g.exercicios_sugeridos || 0), 0), 0);

    expect(totalExerciciosSugeridos.value).toBe(esperado);
    expect(totalExerciciosSugeridos.value).toBeGreaterThan(0);
  });
});
