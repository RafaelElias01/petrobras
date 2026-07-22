// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONTEUDOS, SEMANAS_PLANO, META_HORAS_SEMANA } from '../../dados.js';
import { hojeLocalISO } from '../../dataLocal.js';

// useRelatorio() não é singleton em si, mas agrega vários composables que SÃO
// singletons (useChecklist, useHoras, useSimulados, useErros, useDiario,
// useCiclo) -- por isso resetamos módulos e importamos tudo de novo a cada
// teste, igual aos outros composables que compartilham estado module-level.
async function montarRelatorio() {
  vi.resetModules();
  const { useRelatorio } = await import('../../useRelatorio.js');
  return useRelatorio();
}

async function montarHoras() {
  const { useHoras } = await import('../../useHoras.js');
  return useHoras();
}

describe('useRelatorio', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('resumo com nenhum dado registrado retorna tudo zerado sem lançar erro', async () => {
    const { resumo } = await montarRelatorio();
    expect(resumo.value.totalHoras).toBe(0);
    expect(resumo.value.horasSemana).toBe(0);
    expect(resumo.value.metaSemana).toBe(META_HORAS_SEMANA);
    expect(resumo.value.totalErros).toBe(0);
    expect(resumo.value.totalSimulados).toBe(0);
  });

  it('recomendacoes mostra apenas a mensagem de "comece a estudar" quando totalHoras é 0', async () => {
    const { recomendacoes } = await montarRelatorio();
    expect(recomendacoes.value.length).toBe(1);
    expect(recomendacoes.value[0].texto).toMatch(/Comece a registrar/);
  });

  it('horasPorMateria cobre todas as matérias de CONTEUDOS, mesmo sem horas registradas', async () => {
    const { horasPorMateria } = await montarRelatorio();
    expect(horasPorMateria.value.length).toBe(CONTEUDOS.length);
    horasPorMateria.value.forEach(m => expect(m.horas).toBe(0));
  });

  it('horasPorMateria reflete horas registradas via useHoras (setHora, por semana) e ordena da maior para a menor', async () => {
    // horasPorMateria soma via totalMateriaSemana/horasSemana, que leem do
    // namespace por-semana (horas.value[sem][dia][mat]) -- é por isso que o
    // teste usa setHora(semana, dia, materia, valor) e não adicionarHoras(),
    // que grava num namespace por-data (horas.value[data][materia]) usado só
    // por totalHoje/registrosHoje.
    vi.resetModules();
    const { useHoras } = await import('../../useHoras.js');
    const horas = useHoras();
    horas.setHora(1, 'seg', 'quimica', 5);
    horas.setHora(1, 'ter', 'portugues', 1);

    const { useRelatorio } = await import('../../useRelatorio.js');
    const { horasPorMateria } = useRelatorio();

    expect(horasPorMateria.value[0].id).toBe('quimica');
    expect(horasPorMateria.value[0].horas).toBe(5);
    const portugues = horasPorMateria.value.find(m => m.id === 'portugues');
    expect(portugues.horas).toBe(1);
  });

  it('consistenciaSemanal começa vazio quando nenhuma semana tem horas registradas', async () => {
    const { consistenciaSemanal } = await montarRelatorio();
    expect(consistenciaSemanal.value).toEqual([]);
  });

  it('consistenciaSemanal inclui a semana com horas e calcula pct em relação à meta', async () => {
    vi.resetModules();
    const { useHoras } = await import('../../useHoras.js');
    const horas = useHoras();
    horas.setHora(2, 'seg', 'quimica', META_HORAS_SEMANA / 2);

    const { useRelatorio } = await import('../../useRelatorio.js');
    const { consistenciaSemanal } = useRelatorio();

    const semana2 = consistenciaSemanal.value.find(s => s.semana === 2);
    expect(semana2).toBeTruthy();
    expect(semana2.pct).toBe(50);
  });

  it('consistenciaSemanal não lista semanas futuras (sem dados ainda) como se tivessem 0% de meta falhada', async () => {
    vi.resetModules();
    const { useHoras } = await import('../../useHoras.js');
    const horas = useHoras();
    horas.setHora(1, 'seg', 'quimica', META_HORAS_SEMANA); // só a semana 1 tem dados

    const { useRelatorio } = await import('../../useRelatorio.js');
    const { consistenciaSemanal } = useRelatorio();

    // Antes do fix, o loop ia até SEMANAS_PLANO inteiro assim que a 1ª semana
    // com dados aparecia, listando as semanas 2..12 (futuras) como 0%.
    expect(consistenciaSemanal.value.length).toBe(1);
    expect(consistenciaSemanal.value[0].semana).toBe(1);
  });

  it('resumo.horasSemana reflete a última semana com dados, não a semana 1 fixa (semanaAtual de useHoras nunca muda sozinha)', async () => {
    vi.resetModules();
    const { useHoras } = await import('../../useHoras.js');
    const horas = useHoras();
    horas.setHora(1, 'seg', 'quimica', META_HORAS_SEMANA); // semana 1: meta batida
    horas.setHora(5, 'seg', 'quimica', 2); // semana 5 (mais recente): só 2h

    const { useRelatorio } = await import('../../useRelatorio.js');
    const { resumo } = useRelatorio();

    // Antes do fix, resumo.horasSemana vinha de horas.horasSemanaAtual (presa
    // na semana 1 por padrão), mostrando a meta como batida mesmo a semana
    // real (5) estando muito atrás.
    expect(resumo.value.horasSemana).toBe(2);
  });

  it('diasRecentes sempre retorna exatamente 7 dias, terminando em hoje', async () => {
    const { diasRecentes } = await montarRelatorio();
    expect(diasRecentes.value.length).toBe(7);
    expect(diasRecentes.value.at(-1).data).toBe(hojeLocalISO());
  });

  it('diasRecentes marca atingiuMeta corretamente conforme META_HORAS_DIA', async () => {
    vi.resetModules();
    const { useHoras } = await import('../../useHoras.js');
    const horas = useHoras();
    horas.adicionarHoras(hojeLocalISO(), 'quimica', 100); // bem acima de qualquer meta razoável

    const { useRelatorio } = await import('../../useRelatorio.js');
    const { diasRecentes } = useRelatorio();

    const hoje = diasRecentes.value.at(-1);
    expect(hoje.atingiuMeta).toBe(true);
    expect(hoje.total).toBe(100);
  });

  it('cicloDetalhado tem uma entrada por item do ciclo e concluida=false por padrão', async () => {
    const { cicloDetalhado } = await montarRelatorio();
    expect(cicloDetalhado.value.length).toBeGreaterThan(0);
    expect(cicloDetalhado.value.every(c => c.concluida === false)).toBe(true);
  });

  it('cicloDetalhado sinaliza horasCompartilhadas quando vários itens do ciclo mapeiam pro mesmo materiaId (ex: subtópicos de Química)', async () => {
    const { cicloDetalhado } = await montarRelatorio();
    const itensQuimica = cicloDetalhado.value.filter(c => /química/i.test(c.materia));
    expect(itensQuimica.length).toBeGreaterThan(1); // pré-condição: há >1 subtópico de Química no ciclo
    expect(itensQuimica.every(c => c.horasCompartilhadas === true)).toBe(true);

    const portugues = cicloDetalhado.value.find(c => /português/i.test(c.materia));
    expect(portugues.horasCompartilhadas).toBe(false);
  });

  it('recomendacoes acusa desequilíbrio quando uma matéria muito estudada ofusca outra pouco estudada', async () => {
    vi.resetModules();
    const { useHoras } = await import('../../useHoras.js');
    const horas = useHoras();
    // Estuda todas as matérias, uma com 20h e as demais com 1h cada, pra não
    // cair no caso "0 horas" que dispara uma mensagem diferente ('ainda não
    // estudou'). Usa setHora() (namespace por-semana), a mesma fonte que
    // horasPorMateria/recomendacoes leem via totalMateriaSemana --
    // adicionarHoras() grava num namespace por-data separado que essas telas
    // não enxergam.
    CONTEUDOS.forEach((m, idx) => {
      horas.setHora(1, 'seg', m.id, idx === 0 ? 20 : 1);
    });

    const { useRelatorio } = await import('../../useRelatorio.js');
    const { recomendacoes } = useRelatorio();

    const temAlertaDesequilibrio = recomendacoes.value.some(r => /Desequilíbrio/.test(r.texto));
    expect(temAlertaDesequilibrio).toBe(true);
  });

  it('ultimaSemanaComDados retorna 0 quando nenhuma semana tem horas', async () => {
    const { ultimaSemanaComDados } = await montarRelatorio();
    expect(ultimaSemanaComDados.value).toBe(0);
  });

  it('ultimaSemanaComDados retorna a semana mais recente (maior número) com horas > 0', async () => {
    vi.resetModules();
    const { useHoras } = await import('../../useHoras.js');
    const horas = useHoras();
    horas.setHora(1, 'seg', 'quimica', 1);
    horas.setHora(3, 'seg', 'quimica', 1);

    const { useRelatorio } = await import('../../useRelatorio.js');
    const { ultimaSemanaComDados } = useRelatorio();

    expect(ultimaSemanaComDados.value).toBe(3);
  });

  it('mediaDiaria é 0 quando nenhum dos últimos 7 dias tem horas', async () => {
    const { mediaDiaria } = await montarRelatorio();
    expect(mediaDiaria.value).toBe(0);
  });

  it('mediaDiaria calcula a média só sobre os dias que tiveram estudo (ignora dias com 0h)', async () => {
    vi.resetModules();
    const { useHoras } = await import('../../useHoras.js');
    const horas = useHoras();
    horas.adicionarHoras(hojeLocalISO(), 'quimica', 4); // só hoje tem horas, dos últimos 7 dias

    const { useRelatorio } = await import('../../useRelatorio.js');
    const { mediaDiaria } = useRelatorio();

    expect(mediaDiaria.value).toBe(4); // média só do único dia com estudo, não dividida por 7
  });
});
