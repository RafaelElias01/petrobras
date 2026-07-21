// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hojeLocalISO } from '../../dataLocal.js';

// useDiario() usa singleton em nível de módulo (`let instance`), então cada
// teste precisa de vi.resetModules() + import dinâmico pra pegar estado limpo.
async function montarDiario() {
  vi.resetModules();
  const { useDiario } = await import('../../useDiario.js');
  return useDiario();
}

describe('useDiario', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('diarioData inicia com o dia de hoje (horário local)', async () => {
    const { diarioData } = await montarDiario();
    expect(diarioData.value).toBe(hojeLocalISO());
  });

  it('alternarDiario marca/desmarca um item no dia atual', async () => {
    const { alternarDiario, diarioHoje } = await montarDiario();
    alternarDiario('ciclo');
    expect(diarioHoje.value.ciclo).toBe(true);
    alternarDiario('ciclo');
    expect(diarioHoje.value.ciclo).toBe(false);
  });

  it('agendarRevisao cria 3 revisões (D+1, D+7, D+30) pro mesmo tópico', async () => {
    const { agendarRevisao, revisoes } = await montarDiario();
    agendarRevisao('Ligação iônica', 'Química', '2026-07-21');

    expect(revisoes.value.length).toBe(3);
    expect(revisoes.value.map(r => r.data)).toEqual(['2026-07-22', '2026-07-28', '2026-08-20']);
    expect(revisoes.value.every(r => r.topico === 'Ligação iônica' && r.materia === 'Química' && !r.concluida)).toBe(true);
  });

  it('agendarRevisao não duplica se já existir uma revisão pendente pro mesmo tópico', async () => {
    const { agendarRevisao, revisoes } = await montarDiario();
    agendarRevisao('Ligação iônica', 'Química', '2026-07-21');
    agendarRevisao('Ligação iônica', 'Química', '2026-07-21');

    expect(revisoes.value.length).toBe(3);
  });

  it('agendarRevisao cria uma nova leva se a anterior já estiver toda concluída', async () => {
    const { agendarRevisao, revisoes, concluirRevisao } = await montarDiario();
    agendarRevisao('Ligação iônica', 'Química', '2026-07-21');
    revisoes.value.forEach(r => concluirRevisao(r.id));

    agendarRevisao('Ligação iônica', 'Química', '2026-08-01');
    expect(revisoes.value.length).toBe(6);
  });

  it('concluirRevisao marca uma revisão específica como concluída', async () => {
    const { agendarRevisao, revisoes, concluirRevisao } = await montarDiario();
    agendarRevisao('pH', 'Química', '2026-07-21');
    const id = revisoes.value[0].id;

    concluirRevisao(id);

    expect(revisoes.value.find(r => r.id === id).concluida).toBe(true);
    expect(revisoes.value.filter(r => !r.concluida).length).toBe(2);
  });

  it('removerRevisao remove a revisão pelo id', async () => {
    const { agendarRevisao, revisoes, removerRevisao } = await montarDiario();
    agendarRevisao('pH', 'Química', '2026-07-21');
    const id = revisoes.value[0].id;

    removerRevisao(id);

    expect(revisoes.value.find(r => r.id === id)).toBeUndefined();
    expect(revisoes.value.length).toBe(2);
  });

  it('revisoesPendentes só inclui revisões não concluídas com data <= diarioData', async () => {
    const { agendarRevisao, revisoes, revisoesPendentes, diarioData } = await montarDiario();
    agendarRevisao('pH', 'Química', '2026-07-21');
    diarioData.value = '2026-07-22'; // só a revisão D+1 (22/07) já venceu

    expect(revisoesPendentes.value.length).toBe(1);
    expect(revisoesPendentes.value[0].intervalo).toBe('D+1 (24h)');
  });
});
