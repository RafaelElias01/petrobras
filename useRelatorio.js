import { computed } from 'vue';
import { useChecklist } from './useChecklist.js';
import { useHoras } from './useHoras.js';
import { useSimulados } from './useSimulados.js';
import { useErros } from './useErros.js';
import { useDiario } from './useDiario.js';
import { useCiclo } from './useCiclo.js';
import {
  CONTEUDOS, CICLO_ESTUDOS, SEMANAS_PLANO,
  META_HORAS_SEMANA, META_HORAS_DIA,
  mapCicloParaMateriaId
} from './dados.js';

export function useRelatorio() {
  const checklist = useChecklist();
  const horas = useHoras();
  const simulados = useSimulados();
  const erros = useErros();
  const diario = useDiario();
  const ciclo = useCiclo();

  const resumo = computed(() => ({
    totalHoras: horas.totalHorasAcumuladas.value,
    horasSemana: horas.horasSemanaAtual.value,
    metaSemana: META_HORAS_SEMANA,
    conteudoProgresso: checklist.progressoGeral.value,
    cicloProgresso: ciclo.cicloCompleto.value,
    totalRevisoes: diario.revisoes.value.length,
    revisoesPendentes: diario.revisoesPendentes.value.length,
    totalErros: erros.totalErros.value,
    totalSimulados: simulados.simuladosOrdenados.value.length,
    ultimoSimulado: simulados.simuladoStatus.value.texto
  }));

  const horasPorMateria = computed(() => {
    return CONTEUDOS.map(m => {
      let total = 0;
      for (let s = 1; s <= SEMANAS_PLANO; s++) {
        total += horas.totalMateriaSemana(s, m.id);
      }
      return {
        id: m.id,
        nome: m.nome,
        icone: m.icone,
        cor: m.cor,
        horas: Math.round(total * 10) / 10,
        progresso: checklist.progressoMateria(m),
        itens: checklist.itensConcluidos(m),
        totalItens: checklist.totalItens(m)
      };
    }).sort((a, b) => b.horas - a.horas);
  });

  const consistenciaSemanal = computed(() => {
    const semanas = [];
    for (let s = 1; s <= SEMANAS_PLANO; s++) {
      const total = horas.horasSemana(s);
      if (total > 0 || semanas.length > 0) {
        semanas.push({
          semana: s,
          horas: total,
          meta: META_HORAS_SEMANA,
          pct: Math.round((total / META_HORAS_SEMANA) * 100)
        });
      }
    }
    return semanas;
  });

  const diasRecentes = computed(() => {
    const dias = [];
    const hoje = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      const dataStr = d.toISOString().slice(0, 10);
      const registros = horas.horas.value[dataStr] || {};
      const total = Object.values(registros).reduce((acc, v) => acc + v, 0);
      const nomes = Object.keys(registros)
        .filter(id => registros[id] > 0)
        .map(id => {
          const m = CONTEUDOS.find(c => c.id === id);
          return m ? m.icone + ' ' + m.nome : id;
        });
      const diaSemana = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      dias.push({
        data: dataStr,
        rotulo: diaSemana + ' ' + d.getDate() + '/' + (d.getMonth() + 1),
        total,
        materias: nomes,
        atingiuMeta: total >= META_HORAS_DIA
      });
    }
    return dias;
  });

  const cicloDetalhado = computed(() => {
    return CICLO_ESTUDOS.map((item, idx) => {
      const concluida = (ciclo.ciclo.value.concluido[`item-${idx}`] || 0) > 0;
      const materiaId = mapCicloParaMateriaId(item.materia);
      let horasEstudadas = 0;
      for (let s = 1; s <= SEMANAS_PLANO; s++) {
        horasEstudadas += horas.totalMateriaSemana(s, materiaId);
      }
      return {
        materia: item.materia,
        icone: item.icone,
        tempo: item.tempo,
        concluida,
        horasEstudadas: Math.round(horasEstudadas * 10) / 10,
        idx
      };
    });
  });

  const recomendacoes = computed(() => {
    const recs = [];
    const r = resumo.value;

    if (r.totalHoras === 0) {
      recs.push({ tipo: 'alerta', icon: '🚀', texto: 'Comece a registrar suas horas de estudo para ver análises personalizadas.' });
      return recs;
    }

    const horasSemanaAtual = r.horasSemana;

    if (horasSemanaAtual < META_HORAS_SEMANA * 0.5) {
      recs.push({ tipo: 'alerta', icon: '⚠️', texto: `Você está com ${horasSemanaAtual}h nesta semana. A meta é ${META_HORAS_SEMANA}h. Tente aumentar o ritmo.` });
    } else if (horasSemanaAtual >= META_HORAS_SEMANA) {
      recs.push({ tipo: 'sucesso', icon: '🎉', texto: `Meta semanal atingida! ${horasSemanaAtual}h de ${META_HORAS_SEMANA}h.` });
    } else {
      recs.push({ tipo: 'info', icon: '📊', texto: `Progresso semanal: ${horasSemanaAtual}h de ${META_HORAS_SEMANA}h (${Math.round(horasSemanaAtual / META_HORAS_SEMANA * 100)}%).` });
    }

    const materiasOrdenadas = horasPorMateria.value;
    if (materiasOrdenadas.length > 0) {
      const maisEstudada = materiasOrdenadas[0];
      const menosEstudada = materiasOrdenadas[materiasOrdenadas.length - 1];
      if (maisEstudada.horas > 0) {
        recs.push({ tipo: 'info', icon: maisEstudada.icone, texto: `Matéria mais estudada: ${maisEstudada.nome} (${maisEstudada.horas}h).` });
      }
      if (menosEstudada.horas === 0 && maisEstudada.horas > 0) {
        recs.push({ tipo: 'alerta', icon: '📌', texto: `Você ainda não estudou ${menosEstudada.nome}. Considere incluir no seu ciclo.` });
      } else if (menosEstudada.horas > 0 && maisEstudada.horas / Math.max(menosEstudada.horas, 1) > 5) {
        recs.push({ tipo: 'alerta', icon: '⚖️', texto: `Desequilíbrio: ${maisEstudada.nome} tem ${maisEstudada.horas}h, mas ${menosEstudada.nome} só ${menosEstudada.horas}h. Tente equilibrar.` });
      }
    }

    if (r.conteudoProgresso < 30 && r.totalHoras > 5) {
      recs.push({ tipo: 'info', icon: '✅', texto: `${r.conteudoProgresso}% do conteúdo concluído. Use o checklist para marcar tópicos estudados.` });
    } else if (r.conteudoProgresso > 70) {
      recs.push({ tipo: 'sucesso', icon: '🏆', texto: `${r.conteudoProgresso}% do conteúdo concluído! Foco nas revisões e simulados.` });
    }

    if (r.revisoesPendentes > 5) {
      recs.push({ tipo: 'alerta', icon: '🔴', texto: `${r.revisoesPendentes} revisões pendentes acumuladas. Reserve um tempo para colocá-las em dia.` });
    }

    if (r.totalSimulados === 0 && r.totalHoras > 20) {
      recs.push({ tipo: 'info', icon: '📋', texto: 'Você já tem horas de estudo, mas ainda não registrou nenhum simulado. Experimente fazer um.' });
    }

    if (r.cicloProgresso < 20 && r.totalHoras > 10) {
      recs.push({ tipo: 'info', icon: '🔄', texto: 'Use a página Ciclo para registrar o avanço no seu ciclo de estudos.' });
    }

    return recs;
  });

  const ultimaSemanaComDados = computed(() => {
    for (let s = SEMANAS_PLANO; s >= 1; s--) {
      if (horas.horasSemana(s) > 0) return s;
    }
    return 0;
  });

  const mediaDiaria = computed(() => {
    const dias = diasRecentes.value;
    const comEstudo = dias.filter(d => d.total > 0);
    if (comEstudo.length === 0) return 0;
    return Math.round((comEstudo.reduce((acc, d) => acc + d.total, 0) / comEstudo.length) * 10) / 10;
  });

  return {
    resumo,
    horasPorMateria,
    consistenciaSemanal,
    diasRecentes,
    cicloDetalhado,
    recomendacoes,
    ultimaSemanaComDados,
    mediaDiaria,
    CONTEUDOS, SEMANAS_PLANO, META_HORAS_SEMANA, META_HORAS_DIA
  };
}
