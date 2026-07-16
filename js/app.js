const { createApp, ref, computed, watch, onMounted } = Vue;

const app = createApp({
  setup() {
    const view = ref('dashboard');
    const menuAberta = ref(false);
    const semanaAtual = ref(1);
    const gruposAbertos = ref({});
    const formSimulado = ref({ semana: 1, portugues: 0, matematica: 0, quimica: 0 });
    const erros = ref([]);
    const formErro = ref({ materia: '', topico: '', descricao: '', pensamento: '', respostaCorreta: '', lacuna: '', tipo: 'B' });
    const editandoErro = ref(null);
    const diario = ref({});
    const diarioData = ref(new Date().toISOString().slice(0, 10));
    const revisoes = ref([]);
    const ciclo = ref({ posicao: 0, concluido: {} });
    const cicloExpandido = ref(false);

    const tema = ref('light');
    const checklist = ref({});
    const horas = ref({});
    const simulados = ref([]);
    const carregando = ref(true);
    const filtro = ref(''); // P1: Busca/filtro de tópicos

    const diasSemana = [
      { valor: 'seg', rotulo: 'Segunda' },
      { valor: 'ter', rotulo: 'Terça' },
      { valor: 'qua', rotulo: 'Quarta' },
      { valor: 'qui', rotulo: 'Quinta' },
      { valor: 'sex', rotulo: 'Sexta' }
    ];

    // Inicialização assíncrona
    onMounted(async () => {
      const config = await Armazenamento.getConfig();
      tema.value = config.tema || 'light';
      document.documentElement.setAttribute('data-tema', tema.value);

      checklist.value = await Armazenamento.getChecklist();
      horas.value = await Armazenamento.getHoras();
      simulados.value = await Armazenamento.getSimulados();
      erros.value = await Armazenamento.getErros();
      diario.value = await Armazenamento.getDiario();
      revisoes.value = await Armazenamento.getRevisoes();
      ciclo.value = await Armazenamento.getCiclo();
      initPlanos();
      carregando.value = false;
    });

    // Abrir todos os grupos por padrão
    CONTEUDOS.forEach(m => {
      m.grupos.forEach(g => {
        gruposAbertos.value[m.id + '-' + g.nome] = true;
      });
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

    const semanasPlano = SEMANAS_PLANO;
    const metaHoras = META_HORAS_SEMANA;
    const totalMeta = computed(() => semanasPlano * metaHoras);

    // --- CheckList ---
    function chaveItem(materiaId, grupoNome, idx) {
      return `${materiaId}::${grupoNome}::${idx}`;
    }

    function checkId(materiaId, grupoNome, idx) {
      return !!checklist.value[chaveItem(materiaId, grupoNome, idx)];
    }

    async function alternarItem(materiaId, grupoNome, idx) {
      const k = chaveItem(materiaId, grupoNome, idx);
      checklist.value[k] = !checklist.value[k];
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

    const totalGeral = computed(() => {
      return CONTEUDOS.reduce((acc, m) => acc + totalItens(m), 0);
    });

    const totalConcluidoGeral = computed(() => {
      return CONTEUDOS.reduce((acc, m) => acc + itensConcluidos(m), 0);
    });

    const progressoGeral = computed(() => {
      if (totalGeral.value === 0) return 0;
      return Math.round(totalConcluidoGeral.value / totalGeral.value * 100);
    });

    // --- Horas ---
    function horaValor(semana, dia, materia) {
      return horas.value[semana]?.[dia]?.[materia] || 0;
    }

    async function setHora(semana, dia, materia, valor) {
      await Armazenamento.salvarHora(semana, dia, materia, valor);
      horas.value = await Armazenamento.getHoras();
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

    const horasSemanaAtual = computed(() => horasSemana(semanaAtual.value));

    const metaSemanaCss = computed(() => {
      const h = horasSemanaAtual.value;
      if (h >= metaHoras) return 'verde';
      if (h >= metaHoras * 0.5) return 'laranja';
      return 'vermelho';
    });

    // --- Simulados ---
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
      const s = formSimulado.value;
      if (!s.semana || s.semana < 1 || s.semana > semanasPlano) return;
      await Armazenamento.salvarSimulado({
        semana: s.semana,
        portugues: Number(s.portugues) || 0,
        matematica: Number(s.matematica) || 0,
        quimica: Number(s.quimica) || 0
      });
      simulados.value = await Armazenamento.getSimulados();
      formSimulado.value = { semana: s.semana + 1, portugues: 0, matematica: 0, quimica: 0 };
    }

    async function removerSimulado(semana) {
      await Armazenamento.removerSimulado(semana);
      simulados.value = await Armazenamento.getSimulados();
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

    // --- Erros (Caderno de Erros) ---
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
      if (!editandoErro.value) return;
      if (!editandoErro.value.materia || !editandoErro.value.topico) return;
      await Armazenamento.salvarErro(editandoErro.value);
      erros.value = await Armazenamento.getErros();
      editandoErro.value = null;
      formErro.value = { materia: '', topico: '', descricao: '', pensamento: '', respostaCorreta: '', lacuna: '', tipo: 'B' };
    }

    function editarErro(e) {
      editandoErro.value = { ...e };
    }

    async function removerErro(id) {
      await Armazenamento.removerErro(id);
      erros.value = await Armazenamento.getErros();
    }

    function cancelarErro() {
      editandoErro.value = null;
    }

    // --- Diário (Daily Checklist) ---
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

    const diarioHoje = computed(() => {
      return diario.value[diarioData.value] || {};
    });

    const diarioProgresso = computed(() => {
      const items = diarioHoje.value;
      const total = CHECKLIST_ITENS.length;
      const feitos = CHECKLIST_ITENS.filter(i => items[i.id]).length;
      return total > 0 ? Math.round(feitos / total * 100) : 0;
    });

    async function alternarDiario(itemId) {
      const hoje = { ...(diario.value[diarioData.value] || {}) };
      hoje[itemId] = !hoje[itemId];
      await Armazenamento.salvarDiario(diarioData.value, hoje);
      diario.value = await Armazenamento.getDiario();
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

    // --- Ciclo de Estudos ---
    const materiaAtual = computed(() => {
      return CICLO_ESTUDOS[ciclo.value.posicao] || CICLO_ESTUDOS[0];
    });

    const cicloCompleto = computed(() => {
      const total = CICLO_ESTUDOS.length;
      const concluidos = Object.keys(ciclo.value.concluido || {}).length;
      return Math.round(concluidos / total * 100);
    });

    async function avancarCiclo() {
      const c = { ...ciclo.value };
      const materia = CICLO_ESTUDOS[c.posicao];
      const chave = `${materia.materia}-c${c.posicao}`;
      c.concluido = { ...(c.concluido || {}), [chave]: true };
      c.posicao = (c.posicao + 1) % CICLO_ESTUDOS.length;
      await Armazenamento.salvarCiclo(c);
      ciclo.value = c;
    }

    async function reiniciarCiclo() {
      const c = { posicao: 0, concluido: {} };
      await Armazenamento.salvarCiclo(c);
      ciclo.value = c;
    }

    // --- P1: Busca e Expandir/Colapsar Tudo ---
    const conteudosFiltrados = computed(() => {
      if (!filtro.value.trim()) return CONTEUDOS;
      
      const termo = filtro.value.toLowerCase();
      return CONTEUDOS.map(materia => ({
        ...materia,
        grupos: materia.grupos.map(grupo => ({
          ...grupo,
          topicos: grupo.topicos.filter(topico =>
            topico.toLowerCase().includes(termo)
          )
        })).filter(grupo => grupo.topicos.length > 0)
      })).filter(materia => materia.grupos.length > 0);
    });

    function expandirTudo() {
      CONTEUDOS.forEach(m => {
        m.grupos.forEach(g => {
          gruposAbertos.value[m.id + '-' + g.nome] = true;
        });
      });
    }

    function colapsarTudo() {
      CONTEUDOS.forEach(m => {
        m.grupos.forEach(g => {
          gruposAbertos.value[m.id + '-' + g.nome] = false;
        });
      });
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
      view, menuAberta, semanaAtual, gruposAbertos, formSimulado,
      tema, diasSemana, carregando,
      tituloView, subtituloView,
      semanasPlano, metaHoras, totalMeta,
      conteudos: CONTEUDOS,
      checklist,
      chaveItem, checkId, alternarItem, toggleGrupo,
      totalItens, itensConcluidos, itensConcluidosGrupo, progressoMateria,
      totalGeral, totalConcluidoGeral, progressoGeral,
      horas,
      horaValor, setHora, totalDia, totalMateriaSemana, horasSemana,
      totalAcumulado, totalHorasAcumuladas, horasSemanaAtual, metaSemanaCss,
      simulados, simuladosOrdenados, formSimuladoTotal,
      salvarSimulado, removerSimulado, simuladoStatus,
      planoSelecionado, planoHtml, carregandoPlano,
      planosDisponiveis, planosGrupos, planosFiltrados,
      carregarPlano,
      irPara, alternarTema,
      erros, formErro, editandoErro, errosAgrupados, totalErros,
      novoErro, salvarErro, editarErro, removerErro, cancelarErro,
      CHECKLIST_ITENS, diario, diarioData, diarioHoje, diarioProgresso, alternarDiario,
      revisoes, revisoesPendentes, revisoesHoje,
      agendarRevisao, concluirRevisao, removerRevisao,
      ciclo, materiaAtual, cicloCompleto, cicloExpandido,
      avancarCiclo, reiniciarCiclo,
      CICLO_ESTUDOS, REVISAO_INTERVALOS, DIAS_SEMANA,
      filtro, conteudosFiltrados, expandirTudo, colapsarTudo // P1
    };
  }
});

app.mount('#app');
