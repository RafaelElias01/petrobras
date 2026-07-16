const { createApp, ref, computed, watch, onMounted } = Vue;

//  COMPOSABLES - Lógica de Negócio Modularizada
// ===================================================================

function useSimulados(semanasPlano) {
  const simulados = ref([]);
  const formSimulado = ref({ semana: 1, portugues: 0, matematica: 0, quimica: 0 });

  const simuladosOrdenados = computed(() => {
    return [...simulados.value]
      .sort((a, b) => a.semana - b.semana)
      .map(s => ({
        ...s,
        total: (s.portugues || 0) + (s.matematica || 0) + (s.quimica || 0),
        porcentagem: Math.round(((s.portugues || 0) + (s.matematica || 0) + (s.quimica || 0)) / 60 * 100)
      }));
  });

  const formSimuladoTotal = computed(() => {
    return (formSimulado.value.portugues || 0) +
           (formSimulado.value.matematica || 0) +
           (formSimulado.value.quimica || 0);
  });

  async function salvarSimulado() {
    const s = { ...formSimulado.value };
    if (!s.semana || s.semana < 1 || s.semana > semanasPlano) return;

    const novoSimulado = {
      semana: s.semana,
      portugues: Number(s.portugues) || 0,
      matematica: Number(s.matematica) || 0,
      quimica: Number(s.quimica) || 0
    };

    // Otimização: Atualiza a UI reativamente, sem re-fetch
    const idx = simulados.value.findIndex(item => item.semana === novoSimulado.semana);
    if (idx >= 0) {
      simulados.value.splice(idx, 1, novoSimulado);
    } else {
      simulados.value.push(novoSimulado);
    }

    await Armazenamento.salvarSimulado(novoSimulado);
    formSimulado.value = { semana: s.semana + 1, portugues: 0, matematica: 0, quimica: 0 };
  }

  async function removerSimulado(semana) {
    // Otimização: Atualiza a UI reativamente
    const idx = simulados.value.findIndex(item => item.semana === semana);
    if (idx >= 0) {
      simulados.value.splice(idx, 1);
    }
    await Armazenamento.removerSimulado(semana);
  }

  const simuladoStatus = computed(() => {
    if (simuladosOrdenados.value.length === 0) {
      return { texto: '—', classe: '' };
    }
    const ultimo = simuladosOrdenados.value[simuladosOrdenados.value.length - 1];
    return {
      texto: `${ultimo.porcentagem}%`,
      classe: ultimo.porcentagem >= 70 ? 'verde' : ultimo.porcentagem >= 50 ? 'laranja' : 'vermelho'
    };
  });

  return {
    simulados,
    formSimulado,
    simuladosOrdenados,
    formSimuladoTotal,
    salvarSimulado,
    removerSimulado,
    simuladoStatus
  };
}

function useErros() {
  const erros = ref([]);
  const formErro = ref({ materia: '', topico: '', descricao: '', pensamento: '', respostaCorreta: '', lacuna: '', tipo: 'B' });
  const editandoErro = ref(null);

  const errosAgrupados = computed(() => {
    const grupos = {};
    const materias = ['Português', 'Matemática', 'Química'];
    materias.forEach(m => grupos[m] = []);
    erros.value.forEach(e => {
      if (grupos[e.materia]) grupos[e.materia].push(e);
    });
    return grupos;
  });

  const totalErros = computed(() => erros.value.length);

  function novoErro() {
    editandoErro.value = { id: Date.now(), data: new Date().toISOString().slice(0, 10), ...formErro.value };
  }

  async function salvarErro() {
    if (!editandoErro.value || !editandoErro.value.materia || !editandoErro.value.topico) return;
    
    const erroSalvo = { ...editandoErro.value };

    // Otimização: Atualiza a UI reativamente
    const idx = erros.value.findIndex(e => e.id === erroSalvo.id);
    if (idx >= 0) {
      erros.value.splice(idx, 1, erroSalvo);
    } else {
      erros.value.push(erroSalvo);
    }

    await Armazenamento.salvarErro(erroSalvo);
    editandoErro.value = null;
    formErro.value = { materia: '', topico: '', descricao: '', pensamento: '', respostaCorreta: '', lacuna: '', tipo: 'B' };
  }

  function editarErro(e) {
    editandoErro.value = { ...e };
  }

  async function removerErro(id) {
    // Otimização: Atualiza a UI reativamente
    const idx = erros.value.findIndex(e => e.id === id);
    if (idx >= 0) {
      erros.value.splice(idx, 1);
    }
    await Armazenamento.removerErro(id);
  }

  function cancelarErro() {
    editandoErro.value = null;
  }

  return {
    erros, formErro, editandoErro, errosAgrupados, totalErros,
    novoErro, salvarErro, editarErro, removerErro, cancelarErro
  };
}

function useCiclo(cicloEstudosData) {
  const ciclo = ref({ posicao: 0, concluido: {} });
  const cicloExpandido = ref(false);

  const materiaAtual = computed(() => {
    return cicloEstudosData[ciclo.value.posicao] || cicloEstudosData[0];
  });

  const cicloCompleto = computed(() => {
    const total = cicloEstudosData.length;
    if (total === 0) return 0;
    const concluidos = Object.keys(ciclo.value.concluido || {}).length;
    return Math.round(concluidos / total * 100);
  });

  async function avancarCiclo() {
    const novoCiclo = { ...ciclo.value };
    const materia = cicloEstudosData[novoCiclo.posicao];
    const chave = `${materia.materia}-c${novoCiclo.posicao}`;
    novoCiclo.concluido = { ...(novoCiclo.concluido || {}), [chave]: true };
    novoCiclo.posicao = (novoCiclo.posicao + 1) % cicloEstudosData.length;
    
    ciclo.value = novoCiclo; // Atualização reativa imediata
    await Armazenamento.salvarCiclo(novoCiclo);
  }

  async function reiniciarCiclo() {
    const novoCiclo = { posicao: 0, concluido: {} };
    ciclo.value = novoCiclo; // Atualização reativa imediata
    await Armazenamento.salvarCiclo(novoCiclo);
  }

  return {
    ciclo, cicloExpandido, materiaAtual, cicloCompleto, avancarCiclo, reiniciarCiclo
  };
}

function useDiario(checklistItens) {
  const diario = ref({});
  const diarioData = ref(new Date().toISOString().slice(0, 10));

  const diarioHoje = computed(() => {
    return diario.value[diarioData.value] || {};
  });

  const diarioProgresso = computed(() => {
    const items = diarioHoje.value;
    const total = checklistItens.length;
    if (total === 0) return 0;
    const feitos = checklistItens.filter(i => items[i.id]).length;
    return Math.round(feitos / total * 100);
  });

  async function alternarDiario(itemId) {
    // Garante que o objeto para a data de hoje exista
    if (!diario.value[diarioData.value]) {
      diario.value[diarioData.value] = {};
    }

    // Atualização reativa e imediata
    const hoje = diario.value[diarioData.value];
    hoje[itemId] = !hoje[itemId];

    // Persiste a alteração em segundo plano
    await Armazenamento.salvarDiario(diarioData.value, hoje);
  }

  return {
    diario, diarioData, diarioHoje, diarioProgresso, alternarDiario
  };
}

function useHoras(semanasPlano, diasSemana, metaHoras) {
  const horas = ref({});

  function horaValor(semana, dia, materia) {
    return horas.value[semana]?.[dia]?.[materia] || 0;
  }

  async function setHora(semana, dia, materia, valor) {
    // Otimização: Atualização reativa e imediata da UI
    if (!horas.value[semana]) {
      horas.value[semana] = {};
    }
    if (!horas.value[semana][dia]) {
      horas.value[semana][dia] = {};
    }
    horas.value[semana][dia][materia] = Number(valor) || 0;

    // Persiste a alteração em segundo plano
    await Armazenamento.salvarHora(semana, dia, materia, valor);
  }

  function totalDia(semana, dia) {
    return ['portugues', 'matematica', 'quimica']
      .reduce((acc, m) => acc + horaValor(semana, dia, m), 0);
  }

  function totalMateriaSemana(semana, materia) {
    return diasSemana.reduce((acc, d) => acc + horaValor(semana, d.valor, materia), 0);
  }

  function horasSemana(semana) {
    return ['portugues', 'matematica', 'quimica']
      .reduce((acc, m) => acc + totalMateriaSemana(semana, m), 0);
  }

  function totalAcumulado(materia) {
    let total = 0;
    for (let s = 1; s <= semanasPlano; s++) {
      total += totalMateriaSemana(s, materia);
    }
    return Math.round(total * 10) / 10;
  }

  const totalHorasAcumuladas = computed(() => {
    return Math.round(
      ['portugues', 'matematica', 'quimica']
        .reduce((acc, m) => acc + totalAcumulado(m), 0) * 10
    ) / 10;
  });

  return {
    horas, horaValor, setHora, totalDia, totalMateriaSemana, horasSemana,
    totalAcumulado, totalHorasAcumuladas
  };
}

function useChecklist(conteudosData) {
  const checklist = ref({});
  const gruposAbertos = ref({});
  const filtro = ref('');

  // Initialize all groups as open by default
  conteudosData.forEach(m => {
    m.grupos.forEach(g => {
      gruposAbertos.value[m.id + '-' + g.nome] = true;
    });
  });

  function chaveItem(materiaId, grupoNome, idx) {
    return `${materiaId}::${grupoNome}::${idx}`;
  }

  function checkId(materiaId, grupoNome, idx) {
    return !!checklist.value[chaveItem(materiaId, grupoNome, idx)];
  }

  async function alternarItem(materiaId, grupoNome, idx) {
    const k = chaveItem(materiaId, grupoNome, idx);
    // Instant reactive UI update
    checklist.value[k] = !checklist.value[k];
    // Persist change in the background
    await Armazenamento.salvarChecklist(k, checklist.value[k]);
  }

  function toggleGrupo(materiaId, grupoNome) {
    const k = materiaId + '-' + grupoNome;
    gruposAbertos.value[k] = !gruposAbertos.value[k];
  }

  function totalItens(materia) {
    return materia.grupos.reduce((acc, g) => acc + g.topicos.length, 0);
  }

  function itensConcluidos(materia) {
    let count = 0;
    materia.grupos.forEach(g => {
      g.topicos.forEach((_, idx) => {
        if (checkId(materia.id, g.nome, idx)) count++;
      });
    });
    return count;
  }

  function itensConcluidosGrupo(materiaId, grupo) {
    let count = 0;
    grupo.topicos.forEach((_, idx) => {
      if (checkId(materiaId, grupo.nome, idx)) count++;
    });
    return count;
  }

  function progressoMateria(materia) {
    const total = totalItens(materia);
    if (total === 0) return 0;
    return Math.round(itensConcluidos(materia) / total * 100);
  }

  const totalGeral = computed(() => conteudosData.reduce((acc, m) => acc + totalItens(m), 0));
  const totalConcluidoGeral = computed(() => conteudosData.reduce((acc, m) => acc + itensConcluidos(m), 0));
  const progressoGeral = computed(() => {
    if (totalGeral.value === 0) return 0;
    return Math.round(totalConcluidoGeral.value / totalGeral.value * 100);
  });

  const conteudosFiltrados = computed(() => {
    if (!filtro.value.trim()) return conteudosData;
    const termo = filtro.value.toLowerCase();
    return conteudosData.map(materia => ({
      ...materia,
      grupos: materia.grupos.map(grupo => ({
        ...grupo,
        topicos: grupo.topicos.filter(topico => topico.toLowerCase().includes(termo))
      })).filter(grupo => grupo.topicos.length > 0)
    })).filter(materia => materia.grupos.length > 0);
  });

  function expandirTudo() { Object.keys(gruposAbertos.value).forEach(k => gruposAbertos.value[k] = true); }
  function colapsarTudo() { Object.keys(gruposAbertos.value).forEach(k => gruposAbertos.value[k] = false); }

  return {
    checklist, gruposAbertos, filtro,
    chaveItem, checkId, alternarItem, toggleGrupo,
    totalItens, itensConcluidos, itensConcluidosGrupo, progressoMateria,
    totalGeral, totalConcluidoGeral, progressoGeral,
    conteudosFiltrados, expandirTudo, colapsarTudo
  };
}

// ===================================================================
//  APLICAÇÃO VUE - O Orquestrador
// ===================================================================

const app = createApp({
  setup() {
    // --- Estado da UI e Navegação ---
    const view = ref('dashboard');
    const menuAberta = ref(false);
    const semanaAtual = ref(1);
    const carregando = ref(true);
    const tema = ref('light');

    // --- Estado Global da Aplicação ---
    const saveStatus = Armazenamento.status;

    // --- Constantes e Dados Estáticos ---
    const semanasPlano = SEMANAS_PLANO;
    const metaHoras = META_HORAS_SEMANA;

    // --- Estado Reativo das Features (delegado para composables quando complexo) ---
    const revisoes = ref([]);

    // --- Usando o Composable para a feature de Simulados ---
    const { simulados, formSimulado, simuladosOrdenados, formSimuladoTotal, salvarSimulado, removerSimulado, simuladoStatus } = useSimulados(semanasPlano);

    // --- Usando o Composable para a feature de Caderno de Erros ---
    const { erros, formErro, editandoErro, errosAgrupados, totalErros, novoErro, salvarErro, editarErro, removerErro, cancelarErro } = useErros();

    // --- Usando o Composable para a feature de Ciclo de Estudos ---
    const { ciclo, cicloExpandido, materiaAtual, cicloCompleto, avancarCiclo, reiniciarCiclo } = useCiclo(CICLO_ESTUDOS);

    // --- Usando o Composable para a feature de Diário de Estudos ---
    const CHECKLIST_ITENS = [
      { id: 'ciclo', texto: 'Defini a próxima matéria do ciclo' },
      { id: 'teoria', texto: 'Estudei teoria (máx 25 min por Pomodoro)' },
      { id: 'recall', texto: 'Fiz Active Recall (fechei e tentei lembrar)' },
      { id: 'questoes', texto: 'Resolvi questões do tópico' },
      { id: 'correcao', texto: 'Corrigi e registrei erros no caderno' },
      { id: 'flashcards', texto: 'Revisei flashcards pendentes (10-15 min)' },
      { id: 'checklist', texto: 'Marquei progresso no checklist de conteúdos' },
      { id: 'horas', texto: 'Registrei horas no quadro de horas' }
    ];
    const { diario, diarioData, diarioHoje, diarioProgresso, alternarDiario } = useDiario(CHECKLIST_ITENS);

    // --- Usando o Composable para a feature de Quadro de Horas ---
    const { horas, horaValor, setHora, totalDia, totalMateriaSemana, horasSemana, totalAcumulado, totalHorasAcumuladas } = useHoras(semanasPlano, DIAS_SEMANA, metaHoras);

    // --- Usando o Composable para a feature de Checklist de Conteúdos ---
    const { checklist, gruposAbertos, filtro, chaveItem, checkId, alternarItem, toggleGrupo,
            totalItens, itensConcluidos, itensConcluidosGrupo, progressoMateria,
            totalGeral, totalConcluidoGeral, progressoGeral,
            conteudosFiltrados, expandirTudo, colapsarTudo } = useChecklist(CONTEUDOS);


    const horasSemanaAtual = computed(() => horasSemana(semanaAtual.value));
    const metaSemanaCss = computed(() => {
      const h = horasSemanaAtual.value;
      return h >= metaHoras ? 'verde' : h >= metaHoras * 0.5 ? 'laranja' : 'vermelho';
    });

    const diasSemana = [
      { valor: 'seg', rotulo: 'Segunda' },
      { valor: 'ter', rotulo: 'Terça' },
      { valor: 'qua', rotulo: 'Quarta' },
      { valor: 'qui', rotulo: 'Quinta' },
      { valor: 'sex', rotulo: 'Sexta' }
    ];

    // Inicialização assíncrona
    onMounted(async () => {
      carregando.value = true;
      const config = await Armazenamento.getConfig();
      tema.value = config.tema || 'light';
      document.documentElement.setAttribute('data-tema', tema.value);

      checklist.value = await Armazenamento.getChecklist();
      horas.value = await Armazenamento.getHoras(); // Exemplo de como outras features seriam carregadas
      simulados.value = await Armazenamento.getSimulados();
      erros.value = await Armazenamento.getErros();
      diario.value = await Armazenamento.getDiario();
      revisoes.value = await Armazenamento.getRevisoes();
      ciclo.value = await Armazenamento.getCiclo();
      initPlanos();
      carregando.value = false;
    });

    const tituloView = computed(() => ({
      dashboard: 'Dashboard',
      checklist: 'Conteúdos',
      ciclo: 'Ciclo de Estudos',
      horas: 'Quadro de Horas',
      simulados: 'Simulados',
      erros: 'Caderno de Erros',
      diario: 'Diário de Estudos',
      plano: 'Plano de Estudos'
    })[view.value]);

    const subtituloView = computed(() => ({
      dashboard: 'Visão geral do seu progresso',
      checklist: 'Marque os tópicos já estudados',
      ciclo: 'Sua próxima matéria no ciclo de estudos',
      horas: 'Registre suas horas de estudo',
      simulados: 'Acompanhe seu desempenho nos simulados',
      erros: 'Caderno de Erros — cada erro é um ponto garantido',
      diario: 'Checklist diário do concurseiro aprovado',
      plano: 'Consulte o cronograma e conteúdos programáticos'
    })[view.value]);

    // --- Computeds Globais ---
    const totalMeta = computed(() => semanasPlano * metaHoras);

    // --- Plano ---
    const planoSelecionado = ref('');
    const planoHtml = ref('');
    const carregandoPlano = ref(false);
    const planosDisponiveis = ref([]);

    const planosGrupos = computed(() => {
      const grupos = [...new Set(planosDisponiveis.value.map(p => p.grupo))];
      return grupos;
    });

    function planosFiltrados(grupo) {
      return planosDisponiveis.value.filter(p => p.grupo === grupo);
    }

    async function carregarPlano() {
      if (!planoSelecionado.value) return;
      carregandoPlano.value = true;
      try {
        const r = await fetch(`/api/plano/${planoSelecionado.value}`);
        if (!r.ok) throw new Error('Não encontrado');
        const md = await r.text();
        if (typeof marked !== 'undefined') {
          planoHtml.value = marked.parse(md, { breaks: true, gfm: true });
        } else {
          planoHtml.value = `<pre style="white-space:pre-wrap;font-size:13px;">${md.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        }
      } catch {
        planoHtml.value = '<p style="color:var(--erro)">Erro ao carregar o documento.</p>';
      }
      carregandoPlano.value = false;
    }

    async function initPlanos() {
      try {
        const r = await fetch('/api/planos');
        if (r.ok) {
          planosDisponiveis.value = await r.json();
        }
      } catch {}
    }

    // --- Revisões ---
    const revisoesPendentes = computed(() => {
      const hoje = new Date();
      return revisoes.value.filter(r => new Date(r.data) <= hoje && !r.concluida);
    });

    const revisoesHoje = computed(() => {
      const hoje = new Date().toISOString().slice(0, 10);
      return revisoesPendentes.value.filter(r => r.data === hoje);
    });

    async function agendarRevisao(topico, materia, dataEstudo) {
      const dt = new Date(dataEstudo);
      REVISAO_INTERVALOS.forEach(async iv => {
        const dataRev = new Date(dt);
        dataRev.setDate(dataRev.getDate() + iv.dias);
        const rev = {
          id: `${topico}-${iv.id}-${Date.now()}`,
          topico,
          materia,
          data: dataRev.toISOString().slice(0, 10),
          intervalo: iv.rotulo,
          concluida: false
        };
        await Armazenamento.salvarRevisao(rev);
      });
      revisoes.value = await Armazenamento.getRevisoes();
    }

    async function concluirRevisao(id) {
      const lista = await Armazenamento.getRevisoes();
      const rev = lista.find(r => r.id === id);
      if (rev) {
        rev.concluida = true;
        await Armazenamento.salvarRevisao(rev);
      }
      revisoes.value = await Armazenamento.getRevisoes();
    }

    async function removerRevisao(id) {
      await Armazenamento.removerRevisao(id);
      revisoes.value = await Armazenamento.getRevisoes();
    }

    // --- Nav ---
    function irPara(v) {
      view.value = v;
      menuAberta.value = false;
      if (v === 'plano' && !planoSelecionado.value && planosDisponiveis.value.length > 0) {
        planoSelecionado.value = planosDisponiveis.value[0].id;
        carregarPlano();
      }
    }

    async function alternarTema() {
      tema.value = tema.value === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-tema', tema.value);
      await Armazenamento.salvarConfig({ tema: tema.value });
    }

    return {
      view, menuAberta, semanaAtual,
      tema, diasSemana, carregando, saveStatus,
      tituloView, subtituloView,
      semanasPlano, metaHoras, totalMeta,
      conteudos: CONTEUDOS,
      // Expondo tudo do Composable de Checklist
      checklist, gruposAbertos, filtro, chaveItem, checkId, alternarItem, toggleGrupo,
      totalItens, itensConcluidos, itensConcluidosGrupo, progressoMateria,
      totalGeral, totalConcluidoGeral, progressoGeral,
      // Expondo tudo do Composable de Horas
      horas,
      horaValor, setHora, totalDia, totalMateriaSemana, horasSemana,
      totalAcumulado, totalHorasAcumuladas, horasSemanaAtual, metaSemanaCss,
      // Expondo tudo do Composable de Simulados
      simulados, formSimulado, simuladosOrdenados, formSimuladoTotal,
      salvarSimulado, removerSimulado, simuladoStatus,
      planoSelecionado, planoHtml, carregandoPlano,
      planosDisponiveis, planosGrupos, planosFiltrados,
      carregarPlano,
      irPara, alternarTema,
      // Expondo tudo do Composable de Erros
      erros, formErro, editandoErro, errosAgrupados, totalErros,
      novoErro, salvarErro, editarErro, removerErro, cancelarErro,
      // Expondo tudo do Composable de Diário
      CHECKLIST_ITENS, diario, diarioData, diarioHoje, diarioProgresso, alternarDiario,
      // Expondo tudo do Composable de Ciclo de Estudos
      revisoes, revisoesPendentes, revisoesHoje,
      agendarRevisao, concluirRevisao, removerRevisao,
      ciclo, materiaAtual, cicloCompleto, cicloExpandido,
      avancarCiclo, reiniciarCiclo,
      CICLO_ESTUDOS, REVISAO_INTERVALOS, DIAS_SEMANA,
      conteudosFiltrados, expandirTudo, colapsarTudo
    };
  }
});

app.mount('#app');
