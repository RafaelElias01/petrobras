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

  it('revisoesHoje só inclui revisões não concluídas com data exatamente igual a hoje', async () => {
    vi.setSystemTime(new Date('2026-07-22T10:00:00-03:00'));
    try {
      const { agendarRevisao, revisoesHoje } = await montarDiario();
      // D+1 a partir de 21/07 cai em 22/07 -- exatamente "hoje" no relógio simulado.
      agendarRevisao('pH', 'Química', '2026-07-21');

      expect(revisoesHoje.value.length).toBe(1);
      expect(revisoesHoje.value[0].intervalo).toBe('D+1 (24h)');
    } finally {
      vi.useRealTimers();
    }
  });

  it('revisoesHoje exclui revisões já concluídas mesmo se a data bater com hoje', async () => {
    vi.setSystemTime(new Date('2026-07-22T10:00:00-03:00'));
    try {
      const { agendarRevisao, revisoes, revisoesHoje, concluirRevisao } = await montarDiario();
      agendarRevisao('pH', 'Química', '2026-07-21');
      const revisaoDeHoje = revisoes.value.find(r => r.data === '2026-07-22');
      concluirRevisao(revisaoDeHoje.id);

      expect(revisoesHoje.value.length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('diasEstudoConsecutivos é 0 quando não há nenhuma hora registrada', async () => {
    const { diasEstudoConsecutivos } = await montarDiario();
    expect(diasEstudoConsecutivos.value).toBe(0);
  });

  it('diasEstudoConsecutivos conta a sequência de dias com horas > 0 a partir de hoje, parando no primeiro buraco', async () => {
    vi.resetModules();
    vi.setSystemTime(new Date('2026-07-22T10:00:00-03:00'));
    try {
      const { useHoras } = await import('../../useHoras.js');
      const horas = useHoras();
      // Grava direto no namespace por-data (chave usada por diasEstudoConsecutivos),
      // simulando 3 dias seguidos de estudo (20, 21, 22) e um buraco em 19.
      horas.horas.value['2026-07-22'] = { quimica: 2 };
      horas.horas.value['2026-07-21'] = { quimica: 1 };
      horas.horas.value['2026-07-20'] = { portugues: 1 };
      horas.horas.value['2026-07-18'] = { quimica: 5 }; // antes do buraco em 19, não deve contar

      const { useDiario } = await import('../../useDiario.js');
      const { diasEstudoConsecutivos } = useDiario();

      expect(diasEstudoConsecutivos.value).toBe(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('diasEstudoConsecutivos ignora um dia cujo registro existe mas com todas as horas zeradas', async () => {
    vi.resetModules();
    vi.setSystemTime(new Date('2026-07-22T10:00:00-03:00'));
    try {
      const { useHoras } = await import('../../useHoras.js');
      const horas = useHoras();
      horas.horas.value['2026-07-22'] = { quimica: 0, portugues: 0 };

      const { useDiario } = await import('../../useDiario.js');
      const { diasEstudoConsecutivos } = useDiario();

      expect(diasEstudoConsecutivos.value).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
