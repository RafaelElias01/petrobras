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
  const carregandoErros = ref(false);

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

  async function carregarErros() {
    if (erros.value.length > 0) return; // Evita recarregar se já tiver dados
    carregandoErros.value = true;
    erros.value = await Armazenamento.getErros();
    carregandoErros.value = false;
  }

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
    erros, formErro, editandoErro, errosAgrupados, totalErros, carregandoErros,
    novoErro, salvarErro, editarErro, removerErro, cancelarErro, carregarErros
  };
}

function useCiclo(cicloEstudosData) {
  const ciclo = ref({ posicao: 0, concluido: {} });
  const cicloExpandido = ref(false);

  const cicloPonderado = computed(() => {
    const arr = [];
    cicloEstudosData.forEach((item, idx) => {
      for (let w = 0; w < item.peso; w++) {
        arr.push({ ...item, idxOriginal: idx });
      }
    });
    return arr;
  });

  const totalPonderado = computed(() => cicloPonderado.value.length);

  const materiaAtual = computed(() => {
    const pond = cicloPonderado.value;
    if (pond.length === 0) return cicloEstudosData[0] || {};
    return pond[ciclo.value.posicao] || pond[0];
  });

  const idxOriginalAtual = computed(() => materiaAtual.value.idxOriginal ?? 0);

  const cicloCompleto = computed(() => {
    const total = totalPonderado.value;
    if (total === 0) return 0;
    const totalCompletions = Object.values(ciclo.value.concluido || {}).reduce((a, b) => a + b, 0);
    return Math.min(100, Math.round(totalCompletions / total * 100));
  });

  const completosPorItem = computed(() => {
    const map = {};
    cicloEstudosData.forEach((_, i) => {
      map[i] = ciclo.value.concluido[`item-${i}`] || 0;
    });
    return map;
  });

  async function avancarCiclo() {
    const item = cicloPonderado.value[ciclo.value.posicao];
    const novoCiclo = { ...ciclo.value, concluido: { ...(ciclo.value.concluido || {}) } };
    const chave = `item-${item.idxOriginal}`;
    novoCiclo.concluido[chave] = (novoCiclo.concluido[chave] || 0) + 1;
    novoCiclo.posicao = (ciclo.value.posicao + 1) % totalPonderado.value;
    ciclo.value = novoCiclo;
    await Armazenamento.salvarCiclo(novoCiclo);
  }

  async function reiniciarCiclo() {
    const novoCiclo = { posicao: 0, concluido: {} };
    ciclo.value = novoCiclo;
    await Armazenamento.salvarCiclo(novoCiclo);
  }

  return {
    ciclo, cicloExpandido, materiaAtual, idxOriginalAtual,
    cicloCompleto, completosPorItem, avancarCiclo, reiniciarCiclo
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

function useRevisoes(revisaoIntervalos) {
  const revisoes = ref([]);

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
    const novasRevisoes = [];
    for (const iv of revisaoIntervalos) {
      const dataRev = new Date(dt);
      dataRev.setDate(dataRev.getDate() + iv.dias);
      const rev = {
        id: `${topico}-${iv.id}-${Date.now()}`,
        topico, materia,
        data: dataRev.toISOString().slice(0, 10),
        intervalo: iv.rotulo,
        concluida: false
      };
      novasRevisoes.push(rev);
      await Armazenamento.salvarRevisao(rev); // Salva uma por uma
    }
    revisoes.value.push(...novasRevisoes); // Atualização reativa em massa
  }

  async function concluirRevisao(id) {
    const rev = revisoes.value.find(r => r.id === id);
    if (rev) {
      rev.concluida = true; // Atualização reativa
      await Armazenamento.salvarRevisao(rev);
    }
  }

  async function removerRevisao(id) {
    const idx = revisoes.value.findIndex(r => r.id === id);
    if (idx > -1) revisoes.value.splice(idx, 1); // Atualização reativa
    await Armazenamento.removerRevisao(id);
  }

  return { revisoes, revisoesPendentes, revisoesHoje, agendarRevisao, concluirRevisao, removerRevisao };
}

function useFlashcards() {
  const flashcards = ref([]);
  const formFlashcard = ref({ materia: '', frente: '', verso: '' });
  const editandoFlashcard = ref(null);
  const carregandoFlashcards = ref(false);
  
  // --- Estado do Modo de Revisão ---
  const modoRevisao = ref(false);
  const configurandoRevisao = ref(false);
  const deckRevisao = ref([]);
  const cardAtualIndex = ref(0);
  const opcoesRevisao = ref({ materias: [], numCards: 10, aleatorio: true });

  // Configuração do Sistema Leitner
  const LEITNER_BOXES = {
    1: 1,  // Revisar todo dia
    2: 3,  // A cada 3 dias
    3: 7,  // A cada 7 dias
    4: 14, // A cada 14 dias
    5: 30  // A cada 30 dias
  };
  const cardAtual = computed(() => deckRevisao.value[cardAtualIndex.value] || null);
  const progressoRevisao = computed(() => deckRevisao.value.length > 0 ? Math.round(((cardAtualIndex.value + 1) / deckRevisao.value.length) * 100) : 0);


  const flashcardsAgrupados = computed(() => {
    const grupos = {};
    const materias = ['Português', 'Matemática', 'Química'];
    materias.forEach(m => grupos[m] = []);
    flashcards.value.forEach(f => {
      if (grupos[f.materia]) grupos[f.materia].push(f);
    });
    return grupos;
  });

  async function carregarFlashcards() {
    if (flashcards.value.length > 0) return;
    carregandoFlashcards.value = true;
    flashcards.value = await Armazenamento.getFlashcards();
    carregandoFlashcards.value = false;
  }

  function novoFlashcard() {
    editandoFlashcard.value = { 
      id: Date.now(), 
      ...formFlashcard.value,
      box: 1, // Novos cards começam na caixa 1
      lastReviewed: null 
    };
  }

  async function salvarFlashcard() {
    if (!editandoFlashcard.value || !editandoFlashcard.value.materia) return;
    const cardSalvo = { box: 1, lastReviewed: null, ...editandoFlashcard.value };

    const idx = flashcards.value.findIndex(f => f.id === cardSalvo.id);
    if (idx >= 0) flashcards.value.splice(idx, 1, cardSalvo);
    else flashcards.value.push(cardSalvo);

    await Armazenamento.salvarFlashcard(cardSalvo);
    editandoFlashcard.value = null;
    formFlashcard.value = { materia: '', frente: '', verso: '' };
  }

  function editarFlashcard(card) {
    editandoFlashcard.value = { ...card };
  }

  async function removerFlashcard(id) {
    const idx = flashcards.value.findIndex(f => f.id === id);
    if (idx > -1) flashcards.value.splice(idx, 1);
    await Armazenamento.removerFlashcard(id);
  }

  function cancelarFlashcard() { 
    editandoFlashcard.value = null; 
  }

  // --- Métodos do Modo de Revisão ---
  function abrirConfiguracaoRevisao() {
    configurandoRevisao.value = true;
  }

  function iniciarRevisao() {
    configurandoRevisao.value = false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // 1. Seleciona os cards "vencidos" para revisão
    let dueCards = flashcards.value.filter(card => {
      if (!card.lastReviewed) return true; // Cards nunca revisados estão sempre vencidos
      const lastReviewed = new Date(card.lastReviewed);
      const interval = LEITNER_BOXES[card.box || 1] || 1;
      const dueDate = new Date(lastReviewed);
      dueDate.setDate(dueDate.getDate() + interval);
      return hoje >= dueDate;
    });

    // 2. Filtra por matéria, se o usuário selecionou alguma
    if (opcoesRevisao.value.materias.length > 0) {
      dueCards = dueCards.filter(card => opcoesRevisao.value.materias.includes(card.materia));
    }

    // 3. Embaralha o deck
    if (opcoesRevisao.value.aleatorio) {
      for (let i = dueCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dueCards[i], dueCards[j]] = [dueCards[j], dueCards[i]];
      }
    }

    // 4. Limita o número de cards e prepara para a revisão
    deckRevisao.value = dueCards.slice(0, opcoesRevisao.value.numCards).map(c => ({...c, virado: false}));
    cardAtualIndex.value = 0;
    modoRevisao.value = true;
  }

  function proximoCard() {
    if (cardAtualIndex.value < deckRevisao.value.length - 1) {
      cardAtualIndex.value++;
    } else {
      finalizarRevisao(); // Termina a revisão ao chegar no último card
    }
  }

  async function marcarResultado(acertou) {
    const card = cardAtual.value;
    if (!card) return;

    if (acertou) {
      card.box = Math.min((card.box || 1) + 1, 5); // Avança a caixa, máx 5
    } else {
      card.box = 1; // Errou, volta para a caixa 1
    }
    card.lastReviewed = new Date().toISOString().slice(0, 10);

    // Salva a alteração no card original
    const originalCard = flashcards.value.find(f => f.id === card.id);
    if (originalCard) {
      Object.assign(originalCard, { box: card.box, lastReviewed: card.lastReviewed });
      await Armazenamento.salvarFlashcard(originalCard);
    }
    proximoCard();
  }

  function finalizarRevisao() {
    modoRevisao.value = false;
  }

  function cancelarConfiguracaoRevisao() {
    configurandoRevisao.value = false;
  }

  return { flashcards, formFlashcard, editandoFlashcard, carregandoFlashcards, flashcardsAgrupados, carregarFlashcards, novoFlashcard, salvarFlashcard, editarFlashcard, removerFlashcard, cancelarFlashcard, modoRevisao, configurandoRevisao, deckRevisao, cardAtual, progressoRevisao, opcoesRevisao, abrirConfiguracaoRevisao, iniciarRevisao, proximoCard, marcarResultado, finalizarRevisao, cancelarConfiguracaoRevisao };
}

function useCronograma(cronogramaData) {
  const progresso = ref({});
  const carregado = ref(false);

  const cronChave = (semana, dia, periodo) => `s${semana}_${dia}_${periodo}`;

  function slotConcluido(semana, dia, periodo) {
    return !!progresso.value[cronChave(semana, dia, periodo)];
  }

  const totalSlots = computed(() => {
    let total = 0;
    cronogramaData.forEach(sem => { sem.dias.forEach(d => { total += d.slots.length; }); });
    return total;
  });

  const totalConcluidos = computed(() => {
    return Object.values(progresso.value).filter(Boolean).length;
  });

  const progressoGeralCron = computed(() => {
    if (totalSlots.value === 0) return 0;
    return Math.round(totalConcluidos.value / totalSlots.value * 100);
  });

  const progressoSemana = (semana) => {
    const sem = cronogramaData[semana - 1];
    if (!sem) return 0;
    let total = 0, concluidos = 0;
    sem.dias.forEach(d => {
      d.slots.forEach(s => {
        total++;
        if (slotConcluido(semana, d.dia, s.periodo)) concluidos++;
      });
    });
    return total > 0 ? Math.round(concluidos / total * 100) : 0;
  };

  const totalSlotsSemana = (semana) => {
    const sem = cronogramaData[semana - 1];
    if (!sem) return 0;
    let total = 0;
    sem.dias.forEach(d => { total += d.slots.length; });
    return total;
  };

  const concluidosSemana = (semana) => {
    const sem = cronogramaData[semana - 1];
    if (!sem) return 0;
    let concluidos = 0;
    sem.dias.forEach(d => {
      d.slots.forEach(s => {
        if (slotConcluido(semana, d.dia, s.periodo)) concluidos++;
      });
    });
    return concluidos;
  };

  async function alternarSlot(semana, dia, periodo) {
    const chave = cronChave(semana, dia, periodo);
    const novoValor = !progresso.value[chave];
    progresso.value[chave] = novoValor;
    await Armazenamento.alternarCronograma(chave, novoValor);
  }

  async function carregarProgresso() {
    if (carregado.value) return;
    const dados = await Armazenamento.getCronograma();
    progresso.value = dados;
    carregado.value = true;
  }

  return {
    progresso, carregado,
    slotConcluido, alternarSlot,
    totalSlots, totalConcluidos, progressoGeralCron,
    progressoSemana, totalSlotsSemana, concluidosSemana,
    carregarProgresso
  };
}

// ===================================================================
//  BANCO DE QUESTÕES (Cesgranrio-style)
// ===================================================================

const EXERCICIOS = [
  // ---- PORTUGUÊS (12) ----
  { id: 1, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Fácil',
    enunciado: 'No trecho "A ciência avança a passos largos, mas a humanidade nem sempre a acompanha", a conjunção "mas" estabelece uma relação de:',
    alternativas: ['A) Adição', 'B) Oposição', 'C) Alternância', 'D) Conclusão', 'E) Explicação'],
    correta: 1, explicacao: '"Mas" é uma conjunção adversativa que expressa oposição ou contraste entre as ideias apresentadas.' },
  { id: 2, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Médio',
    enunciado: 'Assinale a opção em que a palavra destacada NÃO é um advérbio:',
    alternativas: ['A) Ela falou BASTANTE durante a reunião.', 'B) Ele chegou CEDO ao trabalho.', 'C) O professor é MUITO dedicado.', 'D) A prova será AMANHÃ.', 'E) Este é um livro MEU.'],
    correta: 4, explicacao: '"Meu" é um pronome possessivo, não um advérbio. As demais palavras são advérbios (de intensidade, tempo, etc.).' },
  { id: 3, materia: 'Português', grupo: 'Ortografia e Acentuação', dificuldade: 'Fácil',
    enunciado: 'Assinale a palavra que deve receber acento gráfico:',
    alternativas: ['A) Feira', 'B) Grama', 'C) Rubrica', 'D) Item', 'E) Ideia'],
    correta: 2, explicacao: '"Rubrica" é uma paroxítona terminada em "a", mas não leva acento. No entanto, segundo o novo acordo ortográfico, "ideia" perdeu o acento. "Rubrica" é pronunciada como paroxítona (ru-BRI-ca), sem acento. Nenhuma das palavras da lista exige acento gráfico.' },
  { id: 4, materia: 'Português', grupo: 'Morfologia', dificuldade: 'Médio',
    enunciado: 'Em "Os alunos ESTUDAVAM com dedicação", a forma verbal destacada indica:',
    alternativas: ['A) Pretérito perfeito do indicativo', 'B) Pretérito imperfeito do indicativo', 'C) Pretérito mais-que-perfeito do indicativo', 'D) Futuro do pretérito do indicativo', 'E) Presente do indicativo'],
    correta: 1, explicacao: '"Estudavam" está no pretérito imperfeito do indicativo (3ª pessoa do plural), indicando uma ação contínua no passado.' },
  { id: 5, materia: 'Português', grupo: 'Sintaxe', dificuldade: 'Médio',
    enunciado: 'Na oração "O técnico responsável analisou as amostras", o termo "as amostras" exerce função sintática de:',
    alternativas: ['A) Sujeito', 'B) Predicativo do sujeito', 'C) Objeto direto', 'D) Objeto indireto', 'E) Adjunto adverbial'],
    correta: 2, explicacao: '"as amostras" complementa o verbo "analisou" sem preposição obrigatória, funcionando como objeto direto.' },
  { id: 6, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Difícil',
    enunciado: 'Leia: "O petróleo é uma fonte de energia não renovável cuja exploração requer tecnologias cada vez mais sofisticadas." O pronome "cuja" estabelece relação de:',
    alternativas: ['A) Posse entre "exploração" e "tecnologias"', 'B) Posse entre "petróleo" e "exploração"', 'C) Posse entre "fonte de energia" e "tecnologias"', 'D) Explicação entre "petróleo" e "fonte de energia"', 'E) Consequência entre "exploração" e "tecnologias"'],
    correta: 1, explicacao: '"Cuja" é pronome relativo que indica posse. Refere-se a "petróleo" e estabelece relação de posse com "exploração" (exploração do petróleo).' },
  { id: 7, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Fácil',
    enunciado: 'O texto dissertativo-argumentativo tem como principal característica:',
    alternativas: ['A) Narração de fatos em sequência cronológica', 'B) Apresentação de uma tese com argumentos', 'C) Descrição detalhada de pessoas e lugares', 'D) Instruções para execução de tarefas', 'E) Diálogo entre personagens'],
    correta: 1, explicacao: 'O texto dissertativo-argumentativo visa defender um ponto de vista (tese) por meio de argumentos lógicos.' },
  { id: 8, materia: 'Português', grupo: 'Ortografia e Acentuação', dificuldade: 'Médio',
    enunciado: 'Segundo o Novo Acordo Ortográfico, assinale a palavra grafada INCORRETAMENTE:',
    alternativas: ['A) Autoavaliação', 'B) Contra-ataque', 'C) Micro-ondas', 'D) Antessala', 'E) Paraquedas'],
    correta: 2, explicacao: 'O correto é "micro-ondas" (com hífen) pois o segundo elemento começa com "o", mesma vogal do prefixo. Todas as demais estão corretas.' },
  { id: 9, materia: 'Português', grupo: 'Morfologia', dificuldade: 'Difícil',
    enunciado: 'Na frase "Ela mesma resolveu o problema", a palavra "mesma" classifica-se como:',
    alternativas: ['A) Adjetivo', 'B) Advérbio', 'C) Pronome demonstrativo', 'D) Pronome de tratamento', 'E) Pronome reflexivo'],
    correta: 2, explicacao: '"Mesma" é um pronome demonstrativo (reforço), equivalendo a "própria". Indica identidade ou ênfase.' },
  { id: 10, materia: 'Português', grupo: 'Sintaxe', dificuldade: 'Médio',
    enunciado: 'Em "Necessitamos DE PROFISSIONAIS qualificados", o termo destacado é:',
    alternativas: ['A) Objeto direto', 'B) Objeto indireto', 'C) Complemento nominal', 'D) Adjunto adnominal', 'E) Agente da passiva'],
    correta: 1, explicacao: '"Necessitar" exige preposição "de", logo "de profissionais" é objeto indireto. O verbo "necessitar" é transitivo indireto.' },
  { id: 11, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Fácil',
    enunciado: 'A figura de linguagem presente em "O céu está chorando" é:',
    alternativas: ['A) Metáfora', 'B) Prosopopeia', 'C) Hipérbole', 'D) Eufemismo', 'E) Antítese'],
    correta: 1, explicacao: 'Prosopopeia (ou personificação) atribui ações humanas a seres inanimados. "Chorar" é ação humana atribuída ao céu.' },
  { id: 12, materia: 'Português', grupo: 'Sintaxe', dificuldade: 'Difícil',
    enunciado: 'Assinale a alternativa em que a concordância verbal está INCORRETA:',
    alternativas: ['A) Haviam muitos candidatos na sala.', 'B) Faz dois anos que trabalhamos aqui.', 'C) Mais de um técnico participou da análise.', 'D) Os Estados Unidos é um país desenvolvido.', 'E) 40% dos funcionários aprovaram a mudança.'],
    correta: 0, explicacao: '"Haver" no sentido de "existir" é impessoal e permanece no singular: "Havia muitos candidatos na sala."' },

  // ---- MATEMÁTICA (12) ----
  { id: 13, materia: 'Matemática', grupo: 'Aritmética', dificuldade: 'Fácil',
    enunciado: 'Uma refinaria produz 2.400 barris de petróleo por dia. Se a produção aumentar 15%, quantos barris serão produzidos diariamente?',
    alternativas: ['A) 2.520', 'B) 2.640', 'C) 2.760', 'D) 2.840', 'E) 3.000'],
    correta: 2, explicacao: '15% de 2.400 = 360. Total = 2.400 + 360 = 2.760 barris.' },
  { id: 14, materia: 'Matemática', grupo: 'Aritmética', dificuldade: 'Médio',
    enunciado: 'Em uma prova de 60 questões, um candidato acertou 42. Qual foi seu percentual de acertos?',
    alternativas: ['A) 60%', 'B) 65%', 'C) 70%', 'D) 75%', 'E) 80%'],
    correta: 2, explicacao: '42/60 = 0,70 = 70% de acertos.' },
  { id: 15, materia: 'Matemática', grupo: 'Geometria', dificuldade: 'Médio',
    enunciado: 'Um tanque cilíndrico tem 2 m de raio e 5 m de altura. Qual é o seu volume em m³? (Considere π = 3,14)',
    alternativas: ['A) 31,4', 'B) 62,8', 'C) 78,5', 'D) 125,6', 'E) 157,0'],
    correta: 1, explicacao: 'V = π·r²·h = 3,14 × 4 × 5 = 62,8 m³.' },
  { id: 16, materia: 'Matemática', grupo: 'Geometria', dificuldade: 'Fácil',
    enunciado: 'A área de um triângulo com base 12 cm e altura 8 cm é:',
    alternativas: ['A) 24 cm²', 'B) 36 cm²', 'C) 48 cm²', 'D) 60 cm²', 'E) 96 cm²'],
    correta: 2, explicacao: 'Área = (base × altura) / 2 = (12 × 8) / 2 = 48 cm².' },
  { id: 17, materia: 'Matemática', grupo: 'Estatística', dificuldade: 'Fácil',
    enunciado: 'A média aritmética dos números 8, 10, 12, 15 e 20 é:',
    alternativas: ['A) 11', 'B) 12', 'C) 13', 'D) 14', 'E) 15'],
    correta: 2, explicacao: 'Soma = 8+10+12+15+20 = 65. Média = 65/5 = 13.' },
  { id: 18, materia: 'Matemática', grupo: 'Estatística', dificuldade: 'Médio',
    enunciado: 'Em um conjunto de dados, a mediana dos valores {3, 7, 8, 12, 15, 18, 21} é:',
    alternativas: ['A) 7', 'B) 8', 'C) 12', 'D) 15', 'E) 18'],
    correta: 2, explicacao: 'O conjunto tem 7 elementos (ímpar). A mediana é o 4º elemento (posição central): 12.' },
  { id: 19, materia: 'Matemática', grupo: 'Probabilidade', dificuldade: 'Médio',
    enunciado: 'Uma urna contém 6 bolas vermelhas e 4 azuis. Retirando-se uma bola ao acaso, qual a probabilidade de ela ser azul?',
    alternativas: ['A) 10%', 'B) 20%', 'C) 30%', 'D) 40%', 'E) 50%'],
    correta: 3, explicacao: 'Total = 10 bolas. Azuis = 4. P = 4/10 = 0,40 = 40%.' },
  { id: 20, materia: 'Matemática', grupo: 'Aritmética', dificuldade: 'Difícil',
    enunciado: 'Uma empresa investiu R$ 50.000,00 a juros simples de 1,5% ao mês. Após 8 meses, o montante será:',
    alternativas: ['A) R$ 54.000,00', 'B) R$ 55.000,00', 'C) R$ 56.000,00', 'D) R$ 57.000,00', 'E) R$ 58.000,00'],
    correta: 2, explicacao: 'J = C·i·t = 50.000 × 0,015 × 8 = 6.000. M = 50.000 + 6.000 = 56.000.' },
  { id: 21, materia: 'Matemática', grupo: 'Aritmética', dificuldade: 'Fácil',
    enunciado: 'Se 3 operários realizam um serviço em 8 dias, em quantos dias 6 operários, com a mesma eficiência, realizarão o mesmo serviço?',
    alternativas: ['A) 2 dias', 'B) 3 dias', 'C) 4 dias', 'D) 6 dias', 'E) 16 dias'],
    correta: 2, explicacao: 'Grandezas inversamente proporcionais: 3 × 8 = 6 × d → d = 24/6 = 4 dias.' },
  { id: 22, materia: 'Matemática', grupo: 'Funções', dificuldade: 'Médio',
    enunciado: 'O zero da função f(x) = 2x - 8 é:',
    alternativas: ['A) -4', 'B) -2', 'C) 2', 'D) 4', 'E) 8'],
    correta: 3, explicacao: '2x - 8 = 0 → 2x = 8 → x = 4.' },
  { id: 23, materia: 'Matemática', grupo: 'Geometria', dificuldade: 'Difícil',
    enunciado: 'Um hexágono regular tem lado igual a 4 cm. Qual é a sua área? (Considere √3 = 1,73)',
    alternativas: ['A) 20,76 cm²', 'B) 24,48 cm²', 'C) 41,52 cm²', 'D) 48,32 cm²', 'E) 82,56 cm²'],
    correta: 2, explicacao: 'Área do hexágono regular = (3·L²·√3)/2 = (3 × 16 × 1,73)/2 = (83,04)/2 = 41,52 cm².' },
  { id: 24, materia: 'Matemática', grupo: 'Probabilidade', dificuldade: 'Difícil',
    enunciado: 'Uma moeda é lançada 4 vezes. Qual a probabilidade de obter exatamente 3 caras?',
    alternativas: ['A) 1/4', 'B) 1/8', 'C) 3/16', 'D) 1/6', 'E) 5/16'],
    correta: 0, explicacao: 'P = C(4,3) × (1/2)⁴ = 4 × 1/16 = 4/16 = 1/4.' },

  // ---- QUÍMICA GERAL (14) ----
  { id: 25, materia: 'Química', grupo: 'Estequiometria', dificuldade: 'Fácil',
    enunciado: 'Quantos mols de H₂O existem em 36 gramas de água? (Massas molares: H=1, O=16)',
    alternativas: ['A) 1 mol', 'B) 2 mols', 'C) 3 mols', 'D) 4 mols', 'E) 0,5 mol'],
    correta: 1, explicacao: 'Massa molar da H₂O = 18 g/mol. n = 36/18 = 2 mols.' },
  { id: 26, materia: 'Química', grupo: 'Estequiometria', dificuldade: 'Médio',
    enunciado: 'Na reação 2 H₂ + O₂ → 2 H₂O, quantos gramas de água são produzidos a partir de 4 g de H₂? (Massas molares: H=1, O=16)',
    alternativas: ['A) 18 g', 'B) 24 g', 'C) 30 g', 'D) 36 g', 'E) 48 g'],
    correta: 3, explicacao: '2 mol H₂ (4g) → 2 mol H₂O (36g). Proporção 1:1 em mols. 4g H₂ = 2 mol H₂ → 2 mol H₂O = 36g.' },
  { id: 27, materia: 'Química', grupo: 'Soluções', dificuldade: 'Fácil',
    enunciado: 'Qual é a concentração em g/L de uma solução contendo 20 g de NaCl dissolvidos em 500 mL de água?',
    alternativas: ['A) 10 g/L', 'B) 20 g/L', 'C) 30 g/L', 'D) 40 g/L', 'E) 50 g/L'],
    correta: 1, explicacao: 'C = massa/volume(L) = 20g/0,5L = 40 g/L.' },
  { id: 28, materia: 'Química', grupo: 'Soluções', dificuldade: 'Médio',
    enunciado: 'O pH de uma solução 0,001 mol/L de HCl (ácido forte) é:',
    alternativas: ['A) 1', 'B) 2', 'C) 3', 'D) 4', 'E) 5'],
    correta: 2, explicacao: 'pH = -log[H⁺] = -log(10⁻³) = 3.' },
  { id: 29, materia: 'Química', grupo: 'Termoquímica', dificuldade: 'Médio',
    enunciado: 'Em uma reação exotérmica, a entalpia dos produtos é:',
    alternativas: ['A) Maior que a dos reagentes', 'B) Menor que a dos reagentes', 'C) Igual à dos reagentes', 'D) Zero', 'E) Inversamente proporcional à temperatura'],
    correta: 1, explicacao: 'Em reações exotérmicas, ΔH < 0, ou seja, a entalpia dos produtos é menor que a dos reagentes, liberando calor.' },
  { id: 30, materia: 'Química', grupo: 'Tabela Periódica', dificuldade: 'Fácil',
    enunciado: 'O elemento químico de número atômico 17 pertence à família dos:',
    alternativas: ['A) Metais alcalinos', 'B) Metais alcalino-terrosos', 'C) Halogênios', 'D) Gases nobres', 'E) Calcogênios'],
    correta: 2, explicacao: 'O elemento de Z=17 é o cloro (Cl), pertencente à família 17 (halogênios).' },
  { id: 31, materia: 'Química', grupo: 'Ligações Químicas', dificuldade: 'Fácil',
    enunciado: 'Qual tipo de ligação química ocorre entre átomos de sódio e cloro?',
    alternativas: ['A) Ligação covalente pura', 'B) Ligação covalente polar', 'C) Ligação iônica', 'D) Ligação metálica', 'E) Ligação de hidrogênio'],
    correta: 2, explicacao: 'Na (metal) doa um elétron para Cl (não-metal), formando cátion Na⁺ e ânion Cl⁻. A ligação iônica ocorre por atração eletrostática.' },
  { id: 32, materia: 'Química', grupo: 'Reações Inorgânicas', dificuldade: 'Médio',
    enunciado: 'Na reação HCl + NaOH → NaCl + H₂O, qual tipo de reação inorgânica está representado?',
    alternativas: ['A) Síntese', 'B) Análise', 'C) Simples troca', 'D) Dupla troca (neutralização)', 'E) Oxirredução'],
    correta: 3, explicacao: 'É uma reação de neutralização (ácido + base → sal + água), que é um tipo de dupla troca.' },
  { id: 33, materia: 'Química', grupo: 'Gases Ideais', dificuldade: 'Difícil',
    enunciado: 'Um gás ideal ocupa 10 L a 27°C e 2 atm. Se a temperatura for elevada para 127°C e a pressão reduzida para 1 atm, o novo volume será:',
    alternativas: ['A) 10,0 L', 'B) 13,3 L', 'C) 20,0 L', 'D) 26,7 L', 'E) 30,0 L'],
    correta: 3, explicacao: 'P₁V₁/T₁ = P₂V₂/T₂. T₁ = 300K, T₂ = 400K. 2×10/300 = 1×V₂/400 → V₂ = 20×400/300 = 26,7 L.' },
  { id: 34, materia: 'Química', grupo: 'Eletroquímica', dificuldade: 'Médio',
    enunciado: 'Em uma pilha galvânica, o eletrodo onde ocorre a oxidação é chamado de:',
    alternativas: ['A) Cátodo', 'B) Ânodo', 'C) Eletrólito', 'D) Ponte salina', 'E) Dreno'],
    correta: 1, explicacao: 'No ânodo ocorre a oxidação (perda de elétrons). No cátodo ocorre a redução (ganho de elétrons).' },
  { id: 35, materia: 'Química', grupo: 'Cinética Química', dificuldade: 'Médio',
    enunciado: 'Um catalisador atua em uma reação química:',
    alternativas: ['A) Aumentando a energia de ativação', 'B) Diminuindo a energia de ativação', 'C) Aumentando a entalpia dos produtos', 'D) Alterando o equilíbrio da reação', 'E) Consumindo-se durante a reação'],
    correta: 1, explicacao: 'O catalisador diminui a energia de ativação, acelerando a reação sem ser consumido e sem alterar o equilíbrio.' },
  { id: 36, materia: 'Química', grupo: 'Estequiometria', dificuldade: 'Difícil',
    enunciado: 'Na combustão completa do metano (CH₄ + 2 O₂ → CO₂ + 2 H₂O), quantos litros de CO₂ são produzidos nas CNTP a partir de 32 g de CH₄? (Massa molar CH₄ = 16 g/mol, volume molar = 22,4 L/mol)',
    alternativas: ['A) 11,2 L', 'B) 22,4 L', 'C) 33,6 L', 'D) 44,8 L', 'E) 67,2 L'],
    correta: 3, explicacao: '32g CH₄ = 2 mols. Proporção 1:1 com CO₂ → 2 mol CO₂ = 2×22,4 = 44,8 L nas CNTP.' },
  { id: 37, materia: 'Química', grupo: 'Termoquímica', dificuldade: 'Fácil',
    enunciado: 'Uma reação que absorve calor do ambiente é classificada como:',
    alternativas: ['A) Exotérmica', 'B) Endotérmica', 'C) Isotérmica', 'D) Adiabática', 'E) Isobárica'],
    correta: 1, explicacao: 'Reação endotérmica absorve calor (ΔH > 0). Exotérmica libera calor (ΔH < 0).' },
  { id: 38, materia: 'Química', grupo: 'Ligações Químicas', dificuldade: 'Difícil',
    enunciado: 'A molécula de CO₂ apresenta geometria molecular:',
    alternativas: ['A) Angular', 'B) Trigonal plana', 'C) Tetraédrica', 'D) Linear', 'E) Piramidal'],
    correta: 3, explicacao: 'CO₂ tem duas ligações duplas C=O e nenhum par de elétrons livre no carbono central, resultando em geometria linear.' },

  // ---- QUÍMICA ORGÂNICA (8) ----
  { id: 39, materia: 'Química', grupo: 'Química Orgânica', dificuldade: 'Fácil',
    enunciado: 'Qual a fórmula molecular do propano?',
    alternativas: ['A) C₂H₆', 'B) C₃H₈', 'C) C₄H₁₀', 'D) C₃H₆', 'E) C₂H₄'],
    correta: 1, explicacao: 'Alcanos seguem a fórmula geral CₙH₂ₙ₊₂. Para n=3: C₃H₈.' },
  { id: 40, materia: 'Química', grupo: 'Química Orgânica', dificuldade: 'Médio',
    enunciado: 'A função orgânica presente nos álcoois é caracterizada pelo grupo:',
    alternativas: ['A) C=O', 'B) OH ligado a carbono saturado', 'C) COOH', 'D) NH₂', 'E) CHO'],
    correta: 1, explicacao: 'O grupo funcional dos álcoois é a hidroxila (-OH) ligada a um carbono com hibridação sp³ (saturado).' },
  { id: 41, materia: 'Química', grupo: 'Química Orgânica', dificuldade: 'Médio',
    enunciado: 'Isômeros são compostos que apresentam:',
    alternativas: ['A) Mesma fórmula molecular e mesma estrutura', 'B) Mesma fórmula estrutural e diferentes massas', 'C) Mesma fórmula molecular e diferentes estruturas', 'D) Diferentes fórmulas moleculares', 'E) Mesma massa molar e mesma estrutura'],
    correta: 2, explicacao: 'Isômeros possuem a mesma fórmula molecular, mas diferentes arranjos estruturais (isomeria plana) ou espaciais (estereoisomeria).' },
  { id: 42, materia: 'Química', grupo: 'Química Orgânica', dificuldade: 'Difícil',
    enunciado: 'Na reação de substituição eletrofílica aromática do benzeno com HNO₃ na presença de H₂SO₄, o produto formado é:',
    alternativas: ['A) Fenol', 'B) Anilina', 'C) Nitrobenzeno', 'D) Ácido benzoico', 'E) Clorobenzeno'],
    correta: 2, explicacao: 'A nitração do benzeno (HNO₃/H₂SO₄) produz nitrobenzeno (C₆H₅NO₂) por substituição eletrofílica aromática.' },
  { id: 43, materia: 'Química', grupo: 'Química Orgânica', dificuldade: 'Fácil',
    enunciado: 'O petróleo é separado em suas frações através do processo de:',
    alternativas: ['A) Filtração', 'B) Destilação fracionada', 'C) Extração por solvente', 'D) Cristalização', 'E) Centrifugação'],
    correta: 1, explicacao: 'O petróleo é separado por destilação fracionada, onde os componentes são separados com base em seus diferentes pontos de ebulição.' },
  { id: 44, materia: 'Química', grupo: 'Química Orgânica', dificuldade: 'Fácil',
    enunciado: 'O nome oficial (IUPAC) do composto CH₃CH₂CH₂CH₃ é:',
    alternativas: ['A) Butano', 'B) Propano', 'C) Pentano', 'D) Hexano', 'E) Metano'],
    correta: 0, explicacao: 'Cadeia com 4 carbonos saturada → butano.' },
  { id: 45, materia: 'Química', grupo: 'Química Orgânica', dificuldade: 'Médio',
    enunciado: 'Qual dos seguintes compostos é um hidrocarboneto aromático?',
    alternativas: ['A) Hexano', 'B) Benzeno', 'C) Etanol', 'D) Ácido acético', 'E) Cloreto de sódio'],
    correta: 1, explicacao: 'O benzeno (C₆H₆) é o hidrocarboneto aromático mais simples, caracterizado pelo anel com ligações conjugadas.' },
  { id: 46, materia: 'Química', grupo: 'Química Orgânica', dificuldade: 'Difícil',
    enunciado: 'Na reação de adição de HBr ao propeno, seguindo a regra de Markovnikov, o produto principal é:',
    alternativas: ['A) 1-bromopropano', 'B) 2-bromopropano', 'C) 1,2-dibromopropano', 'D) 1,3-dibromopropano', 'E) Brometo de propila'],
    correta: 1, explicacao: 'Pela regra de Markovnikov, o H se liga ao carbono mais hidrogenado e o Br ao carbono menos hidrogenado, formando 2-bromopropano.' },

  // ---- FÍSICO-QUÍMICA (8) ----
  { id: 47, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Médio',
    enunciado: 'Para a reação A + B ⇌ C + D, o Kc é 4,0 a certa temperatura. Se [A] = [B] = 1,0 M, qual a concentração de C no equilíbrio?',
    alternativas: ['A) 0,5 M', 'B) 1,0 M', 'C) 2,0 M', 'D) 0,67 M', 'E) 1,5 M'],
    correta: 3, explicacao: 'Kc = [C][D]/[A][B] = 4. Se x reage: (x·x)/((1-x)(1-x)) = 4 → x/(1-x) = 2 → x = 2/3 ≈ 0,67 M.' },
  { id: 48, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Fácil',
    enunciado: 'O Princípio de Le Chatelier afirma que, quando um sistema em equilíbrio sofre uma perturbação, ele se desloca para:',
    alternativas: ['A) Aumentar a perturbação', 'B) Minimizar o efeito da perturbação', 'C) Permanecer inalterado', 'D) Atingir o equilíbrio instantaneamente', 'E) Formar sempre mais produtos'],
    correta: 1, explicacao: 'Le Chatelier: o sistema busca minimizar o efeito da perturbação, deslocando-se no sentido que contrarie a alteração.' },
  { id: 49, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Difícil',
    enunciado: 'O produto de solubilidade (Kps) do CaF₂ é 3,2 × 10⁻¹¹. Qual a solubilidade molar do sal em água pura?',
    alternativas: ['A) 1,0 × 10⁻⁴ M', 'B) 2,0 × 10⁻⁴ M', 'C) 3,0 × 10⁻⁴ M', 'D) 4,0 × 10⁻⁴ M', 'E) 5,0 × 10⁻⁴ M'],
    correta: 1, explicacao: 'CaF₂ ⇌ Ca²⁺ + 2F⁻. Kps = s·(2s)² = 4s³. s³ = 3,2×10⁻¹¹/4 = 8×10⁻¹². s = 2×10⁻⁴ M.' },
  { id: 50, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Médio',
    enunciado: 'Em uma célula eletrolítica, a redução ocorre no:',
    alternativas: ['A) Ânodo', 'B) Cátodo', 'C) Eletrólito', 'D) Ponte salina', 'E) Circuito externo'],
    correta: 1, explicacao: 'Na eletrólise, o cátodo é o polo negativo onde ocorre a redução. O ânodo é o polo positivo onde ocorre a oxidação.' },
  { id: 51, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Médio',
    enunciado: 'A pressão osmótica de uma solução 0,1 M de NaCl a 27°C (considerando dissociação total e R=0,082 L·atm/mol·K) é aproximadamente:',
    alternativas: ['A) 2,46 atm', 'B) 4,92 atm', 'C) 3,28 atm', 'D) 1,23 atm', 'E) 6,56 atm'],
    correta: 1, explicacao: 'π = i·M·R·T. NaCl dissocia em 2 íons: i=2. π = 2 × 0,1 × 0,082 × 300 = 4,92 atm.' },
  { id: 52, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Fácil',
    enunciado: 'A velocidade de uma reação química é influenciada por todos os fatores EXCETO:',
    alternativas: ['A) Temperatura', 'B) Concentração dos reagentes', 'C) Pressão (para gases)', 'D) Superfície de contato', 'E) Cor da solução'],
    correta: 4, explicacao: 'A cor não afeta a velocidade da reação. Temperatura, concentração, pressão e superfície de contato são fatores que influenciam a cinética.' },
  { id: 53, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Difícil',
    enunciado: 'Para uma reação de primeira ordem com constante de velocidade k=0,693 h⁻¹, o tempo de meia-vida é:',
    alternativas: ['A) 0,5 h', 'B) 1,0 h', 'C) 1,5 h', 'D) 2,0 h', 'E) 3,0 h'],
    correta: 1, explicacao: 't₁/₂ = ln2/k = 0,693/0,693 = 1,0 h.' },
  { id: 54, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Médio',
    enunciado: 'O abaixamento da temperatura de solidificação de um solvente puro pela adição de um soluto é explicado pela propriedade coligativa chamada:',
    alternativas: ['A) Tonoscopia', 'B) Ebulioscopia', 'C) Crioscopia', 'D) Osmose', 'E) Pressão de vapor'],
    correta: 2, explicacao: 'Crioscopia é o estudo do abaixamento da temperatura de congelamento (solidificação) causado pela adição de soluto não volátil.' },

  // ---- QUÍMICA ANALÍTICA (6) ----
  { id: 55, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Fácil',
    enunciado: 'Na volumetria de neutralização, o ponto onde a quantidade de titulante adicionada é exatamente a necessária para reagir com o titulado é chamado de:',
    alternativas: ['A) Ponto final', 'B) Ponto de equivalência', 'C) Ponto de inflexão', 'D) Ponto de viragem', 'E) Ponto de saturação'],
    correta: 1, explicacao: 'O ponto de equivalência é quando titulante e titulado estão em proporção estequiométrica. O ponto final é quando o indicador muda de cor.' },
  { id: 56, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Médio',
    enunciado: 'Em uma titulação de 50 mL de HCl 0,1 M com NaOH 0,1 M, o pH no ponto de equivalência será:',
    alternativas: ['A) 1', 'B) 3', 'C) 5', 'D) 7', 'E) 9'],
    correta: 3, explicacao: 'Ácido forte + base forte → pH = 7 no ponto de equivalência, pois o sal formado (NaCl) não sofre hidrólise.' },
  { id: 57, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Difícil',
    enunciado: 'Qual indicador ácido-base é mais adequado para titular ácido acético (Ka=1,8×10⁻⁵) com NaOH?',
    alternativas: ['A) Azul de bromotimol (faixa 6,0-7,6)', 'B) Fenolftaleína (faixa 8,2-10,0)', 'C) Alaranjado de metila (faixa 3,1-4,4)', 'D) Vermelho de metila (faixa 4,4-6,2)', 'E) Azul de timol (faixa 8,0-9,6)'],
    correta: 1, explicacao: 'Titulação de ácido fraco/base forte tem ponto de equivalência em pH > 7 (≈8,7). Fenolftaleína (8,2-10,0) é o indicador adequado.' },
  { id: 58, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Fácil',
    enunciado: 'Na análise gravimétrica, o processo de aquecimento do precipitado até massa constante é chamado de:',
    alternativas: ['A) Digestão', 'B) Calcinação', 'C) Filtração', 'D) Secagem', 'E) Precipitação'],
    correta: 1, explicacao: 'A calcinação é o aquecimento do precipitado até massa constante para determinar sua massa exata na gravimetria.' },
  { id: 59, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Médio',
    enunciado: 'Para preparar 500 mL de uma solução 0,2 M de H₂SO₄ a partir de ácido concentrado (18 M), o volume necessário é:',
    alternativas: ['A) 2,78 mL', 'B) 5,56 mL', 'C) 11,1 mL', 'D) 16,7 mL', 'E) 22,2 mL'],
    correta: 1, explicacao: 'C₁V₁ = C₂V₂ → 18 × V₁ = 0,2 × 500 → V₁ = 100/18 = 5,56 mL.' },
  { id: 60, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Difícil',
    enunciado: 'Na volumetria de complexação com EDTA, qual dos seguintes metais pode ser titulado diretamente?',
    alternativas: ['A) Na⁺', 'B) K⁺', 'C) Ca²⁺', 'D) Li⁺', 'E) Cs⁺'],
    correta: 2, explicacao: 'O EDTA forma complexos estáveis com cátions divalentes e trivalentes como Ca²⁺, Mg²⁺, Zn²⁺, etc. Metais alcalinos formam complexos instáveis.' },

  // ---- ANÁLISE INSTRUMENTAL (4) ----
  { id: 61, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Fácil',
    enunciado: 'A espectrofotometria UV-Vis baseia-se na:',
    alternativas: ['A) Absorção de radiação eletromagnética por átomos no estado gasoso', 'B) Absorção de luz visível e ultravioleta por moléculas em solução', 'C) Emissão de radiação por amostras aquecidas', 'D) Difração de raios X por cristais', 'E) Separação de íons por campo elétrico'],
    correta: 1, explicacao: 'A espectrofotometria UV-Vis mede a absorbância de luz na faixa UV-Visível por moléculas em solução, seguindo a Lei de Beer-Lambert.' },
  { id: 62, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Médio',
    enunciado: 'Na cromatografia gasosa, a separação dos componentes de uma mistura baseia-se principalmente na diferença de:',
    alternativas: ['A) Carga elétrica', 'B) Polaridade e ponto de ebulição', 'C) Tamanho molecular', 'D) pH', 'E) Condutividade'],
    correta: 1, explicacao: 'A separação em CG depende da volatilidade (ponto de ebulição) e da interação diferencial dos analitos com a fase estacionária (polaridade).' },
  { id: 63, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Fácil',
    enunciado: 'O eletrodo de vidro é utilizado em qual técnica instrumental?',
    alternativas: ['A) Condutometria', 'B) Potenciometria', 'C) Voltametria', 'D) Cromatografia', 'E) Espectrometria'],
    correta: 1, explicacao: 'A potenciometria utiliza eletrodos seletivos (como o eletrodo de vidro para pH) para medir o potencial elétrico de uma solução.' },
  { id: 64, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Médio',
    enunciado: 'A condutimetria mede:',
    alternativas: ['A) A absorbância de luz pela amostra', 'B) A capacidade da solução em conduzir corrente elétrica', 'C) O potencial de um eletrodo seletivo', 'D) A massa de íons precipitados', 'E) O volume de gás produzido em uma reação'],
    correta: 1, explicacao: 'A condutimetria mede a condutividade elétrica de soluções iônicas, relacionada à concentração e mobilidade dos íons presentes.' },
];

// ===================================================================
//  COMPOSABLE - Banco de Questões (Exercicios)
// ===================================================================

function useExercicios() {
  const filtroMateria = ref('');
  const filtroGrupo = ref('');
  const filtroDificuldade = ref('');
  const mostrarFavoritos = ref(false);

  const modoQuiz = ref(false);
  const quizQuestoes = ref([]);
  const quizIndex = ref(0);
  const respostas = ref({});
  const responded = ref(false);
  const selecionado = ref(-1);
  const mostrarExplicacao = ref(false);

  const revisao = ref(false);
  const favoritos = ref([]);

  const materiasDisponiveis = computed(() => {
    const set = new Set(EXERCICIOS.map(q => q.materia));
    return [...set];
  });

  const gruposDisponiveis = computed(() => {
    const set = new Set(EXERCICIOS.map(q => q.grupo));
    return [...set];
  });

  const questoesFiltradas = computed(() => {
    let qs = [...EXERCICIOS];
    if (filtroMateria.value) qs = qs.filter(q => q.materia === filtroMateria.value);
    if (filtroGrupo.value) qs = qs.filter(q => q.grupo === filtroGrupo.value);
    if (filtroDificuldade.value) qs = qs.filter(q => q.dificuldade === filtroDificuldade.value);
    if (mostrarFavoritos.value) qs = qs.filter(q => favoritos.value.includes(q.id));
    return qs;
  });

  const quizAtual = computed(() => quizQuestoes.value[quizIndex.value] || null);

  const quizProgresso = computed(() => {
    if (quizQuestoes.value.length === 0) return 0;
    return Math.round(((quizIndex.value + 1) / quizQuestoes.value.length) * 100);
  });

  const quizAcertos = computed(() => {
    return quizQuestoes.value.filter((q, i) => respostas.value[i] === q.correta).length;
  });

  const quizTotal = computed(() => quizQuestoes.value.length);

  const favoritosLista = computed(() => {
    return EXERCICIOS.filter(q => favoritos.value.includes(q.id));
  });

  function iniciarQuiz() {
    const pool = [...questoesFiltradas.value];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    quizQuestoes.value = pool;
    quizIndex.value = 0;
    respostas.value = {};
    responded.value = false;
    selecionado.value = -1;
    mostrarExplicacao.value = false;
    revisao.value = false;
    modoQuiz.value = true;
  }

  function responderQuestao(idx) {
    if (responded.value) return;
    selecionado.value = idx;
    respostas.value[quizIndex.value] = idx;
    responded.value = true;
  }

  function proximaQuestao() {
    if (quizIndex.value < quizQuestoes.value.length - 1) {
      quizIndex.value++;
      responded.value = typeof respostas.value[quizIndex.value] !== 'undefined';
      selecionado.value = responded.value ? respostas.value[quizIndex.value] : -1;
      mostrarExplicacao.value = false;
    }
  }

  function voltarQuestao() {
    if (quizIndex.value > 0) {
      quizIndex.value--;
      responded.value = typeof respostas.value[quizIndex.value] !== 'undefined';
      selecionado.value = responded.value ? respostas.value[quizIndex.value] : -1;
      mostrarExplicacao.value = false;
    }
  }

  function finalizarQuiz() {
    revisao.value = true;
    modoQuiz.value = false;
    quizIndex.value = 0;
    responded.value = typeof respostas.value[0] !== 'undefined';
    selecionado.value = responded.value ? respostas.value[0] : -1;
    mostrarExplicacao.value = false;
  }

  function alternarFavorito(id) {
    const idx = favoritos.value.indexOf(id);
    if (idx >= 0) {
      favoritos.value.splice(idx, 1);
    } else {
      favoritos.value.push(id);
    }
    Armazenamento._salvarLocal('exercicios_favoritos', [...favoritos.value]);
  }

  function toggleExplicacao() {
    mostrarExplicacao.value = !mostrarExplicacao.value;
  }

  function toggleRevisao() {
    revisao.value = !revisao.value;
  }

  async function carregarFavoritos() {
    const saved = Armazenamento._carregarLocal('exercicios_favoritos', []);
    favoritos.value = saved;
  }

  return {
    filtroMateria, filtroGrupo, filtroDificuldade, mostrarFavoritos,
    modoQuiz, quizQuestoes, quizIndex, respostas, responded, selecionado, mostrarExplicacao,
    revisao, favoritos,
    materiasDisponiveis, gruposDisponiveis, questoesFiltradas,
    quizAtual, quizProgresso, quizAcertos, quizTotal, favoritosLista,
    iniciarQuiz, responderQuestao, proximaQuestao, voltarQuestao, finalizarQuiz,
    alternarFavorito, toggleExplicacao, toggleRevisao, carregarFavoritos
  };
}

// ===================================================================
//  APLICAÇÃO VUE - O Orquestrador
// ===================================================================

const app = createApp({
  setup() {
    // --- Autenticação ---
    const usuarioAtual = ref(null);
    const autenticado = ref(false);
    const erroLogin = ref(false);
    const loginUsuario = ref('');
    const loginSenha = ref('');

    function handleLogin(usuario, senha) {
      const user = autenticar(usuario, senha);
      if (user) {
        usuarioAtual.value = user;
        autenticado.value = true;
        erroLogin.value = false;
        sessionStorage.setItem('petro_usuario', JSON.stringify(user));
      } else {
        erroLogin.value = true;
      }
    }

    function logout() {
      usuarioAtual.value = null;
      autenticado.value = false;
      sessionStorage.removeItem('petro_usuario');
      view.value = 'dashboard';
    }

    const usuarioLogado = computed(() => usuarioAtual.value?.nome || 'Usuário');

    // --- Estado da UI e Navegação ---
    const view = ref('dashboard');
    const menuAberta = ref(false);
    const semanaAtual = ref(1);
    const carregando = ref(true);
    const tema = ref('light');

    // --- Constantes e Dados Estáticos ---
    const semanasPlano = SEMANAS_PLANO;
    const metaHoras = META_HORAS_SEMANA;

    // --- Usando o Composable para a feature de Simulados ---
    const { simulados, formSimulado, simuladosOrdenados, formSimuladoTotal, salvarSimulado, removerSimulado, simuladoStatus } = useSimulados(semanasPlano);

    // --- Usando o Composable para a feature de Caderno de Erros ---
    const { erros, formErro, editandoErro, errosAgrupados, totalErros, carregandoErros, novoErro, salvarErro, editarErro, removerErro, cancelarErro, carregarErros } = useErros();

    // --- Usando o Composable para a feature de Ciclo de Estudos ---
    const { ciclo, cicloExpandido, materiaAtual, idxOriginalAtual, cicloCompleto, completosPorItem, avancarCiclo, reiniciarCiclo } = useCiclo(CICLO_ESTUDOS);

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

    // --- Usando o Composable para a feature de Revisões ---
    const { revisoes, revisoesPendentes, revisoesHoje, agendarRevisao, concluirRevisao, removerRevisao } = useRevisoes(REVISAO_INTERVALOS);

    // --- Usando o Composable para a feature de Flashcards ---
    const { flashcards, formFlashcard, editandoFlashcard, carregandoFlashcards, flashcardsAgrupados, carregarFlashcards, novoFlashcard, salvarFlashcard, editarFlashcard, removerFlashcard, cancelarFlashcard, modoRevisao, configurandoRevisao, deckRevisao, cardAtual, progressoRevisao, opcoesRevisao, abrirConfiguracaoRevisao, iniciarRevisao, proximoCard, marcarResultado, finalizarRevisao, cancelarConfiguracaoRevisao } = useFlashcards();

    // --- Usando o Composable para a feature de Questões ---
    const exercicios = useExercicios();

    const horasSemanaAtual = computed(() => horasSemana(semanaAtual.value));
    const metaSemanaCss = computed(() => {
      const h = horasSemanaAtual.value;
      return h >= metaHoras ? 'verde' : h >= metaHoras * 0.5 ? 'laranja' : 'vermelho';
    });

    const diasSemana = DIAS_SEMANA.filter(d => d.valor !== 'sab' && d.valor !== 'dom');

    // Inicialização assíncrona
    onMounted(async () => {
      const sessao = sessionStorage.getItem('petro_usuario');
      if (sessao) {
        const user = JSON.parse(sessao);
        if (user) {
          usuarioAtual.value = user;
          autenticado.value = true;
        }
      }

      carregando.value = true;
      const config = await Armazenamento.getConfig();
      tema.value = config.tema || 'light';
      document.documentElement.setAttribute('data-tema', tema.value);

      checklist.value = await Armazenamento.getChecklist();
      horas.value = await Armazenamento.getHoras(); // Exemplo de como outras features seriam carregadas
      simulados.value = await Armazenamento.getSimulados();
      // erros.value = await Armazenamento.getErros(); // << REMOVIDO DAQUI
      diario.value = await Armazenamento.getDiario();
      revisoes.value = await Armazenamento.getRevisoes();
      ciclo.value = await Armazenamento.getCiclo();
      exercicios.carregarFavoritos();
      await carregarProgresso();
      initPlanos();
      carregando.value = false;
    });

    // Observador para carregar dados sob demanda (Lazy Loading)
    watch(view, (novaView) => {
      if (novaView === 'erros') {
        carregarErros();
      }
      if (novaView === 'flashcards') {
        carregarFlashcards();
      }
      if (novaView === 'exercicios') {
        exercicios.carregarFavoritos();
      }
    });

    const tituloView = computed(() => ({
      login: 'Login',
      dashboard: 'Dashboard',
      checklist: 'Conteúdos',
      ciclo: 'Ciclo de Estudos',
      horas: 'Quadro de Horas',
      simulados: 'Simulados',
      erros: 'Caderno de Erros',
      flashcards: 'Flashcards',
      diario: 'Diário de Estudos',
      cronograma: 'Cronograma Semanal',
      exercicios: 'Banco de Questões',
      plano: 'Plano de Estudos'
    })[view.value]);

    const subtituloView = computed(() => ({
      dashboard: 'Visão geral do seu progresso',
      checklist: 'Marque os tópicos já estudados',
      ciclo: 'Sua próxima matéria no ciclo de estudos',
      horas: 'Registre suas horas de estudo',
      simulados: 'Acompanhe seu desempenho nos simulados',
      erros: 'Caderno de Erros — cada erro é um ponto garantido',
      flashcards: 'Crie e revise seus flashcards',
      diario: 'Checklist diário do concurseiro aprovado',
      cronograma: 'Cronograma detalhado semana a semana',
      exercicios: 'Pratique com questões estilo Cesgranrio',
      plano: 'Consulte o cronograma e conteúdos programáticos'
    })[view.value]);

    // --- Computeds Globais ---
    const totalMeta = computed(() => semanasPlano * metaHoras);

    // --- Cronograma ---
    const periodos = ['08h-10h', '13h-15h', '20h-22h'];
    const cronSemana = ref(1);
    const cronograma = CRONOGRAMA_SEMANAL;
    const {
      slotConcluido, alternarSlot,
      totalSlots, totalConcluidos, progressoGeralCron,
      progressoSemana, totalSlotsSemana, concluidosSemana,
      carregarProgresso
    } = useCronograma(cronograma);

    const semanaAtualDias = computed(() => {
      const s = cronograma[cronSemana.value - 1];
      return s ? s.dias : [];
    });

    function materiaInfo(cod) { return MATERIA_MAP[cod] || { nome: cod, icone: '\uD83D\uDCD8', cor: '#6b7280' }; }

    const materiasList = computed(() => {
      const seen = {};
      if (!semanaAtualDias.value) return [];
      semanaAtualDias.value.forEach(d => d.slots.forEach(s => { seen[s.cod] = MATERIA_MAP[s.cod]; }));
      return Object.entries(seen).map(([cod, info]) => ({ cod, ...info }));
    });

    // --- Plano ---
    const PLANOS_LISTA = [
      { id: 'caderno-erros', nome: 'Caderno de Erros', grupo: 'Cronogramas e Planos' },
      { id: 'checklist-conteudos', nome: 'Checklist de Conteúdos', grupo: 'Cronogramas e Planos' },
      { id: 'ciclo-estudos', nome: 'Ciclo de Estudos', grupo: 'Cronogramas e Planos' },
      { id: 'conteudo-programatico', nome: 'Conteúdo Programático', grupo: 'Cronogramas e Planos' },
      { id: 'cronograma-12-semanas-provas', nome: 'Cronograma 12 Semanas (Provas)', grupo: 'Cronogramas e Planos' },
      { id: 'cronograma-cesgranrio', nome: 'Cronograma Cesgranrio', grupo: 'Cronogramas e Planos' },
      { id: 'cronograma-completo', nome: 'Cronograma Completo', grupo: 'Cronogramas e Planos' },
      { id: 'metodologia-estudo', nome: 'Metodologia de Estudo', grupo: 'Cronogramas e Planos' },
      { id: 'quadro-horas', nome: 'Quadro de Horas', grupo: 'Cronogramas e Planos' },
      { id: 'relatorio-metodos-concurseiros', nome: 'Relatório — Métodos de Concurseiros', grupo: 'Cronogramas e Planos' },
      { id: 'revisoes-simulados', nome: 'Revisões e Simulados', grupo: 'Cronogramas e Planos' },
      { id: 'materias/portugues', nome: 'Português', grupo: 'Matérias' },
      { id: 'materias/matematica', nome: 'Matemática', grupo: 'Matérias' },
      { id: 'materias/quimica-geral', nome: 'Química Geral', grupo: 'Matérias' },
      { id: 'materias/quimica-analitica', nome: 'Química Analítica', grupo: 'Matérias' },
      { id: 'materias/quimica-organica', nome: 'Química Orgânica', grupo: 'Matérias' },
      { id: 'materias/fisico-quimica', nome: 'Físico-Química', grupo: 'Matérias' },
      { id: 'materias/analise-instrumental', nome: 'Análise Instrumental', grupo: 'Matérias' },
      { id: 'materias/metrologia-estatistica', nome: 'Metrologia e Estatística', grupo: 'Matérias' },
      { id: 'resumos/analise-geral', nome: 'Análise Geral', grupo: 'Resumos' },
      { id: 'resumos/portugues', nome: 'Português', grupo: 'Resumos' },
      { id: 'resumos/matematica', nome: 'Matemática', grupo: 'Resumos' },
      { id: 'resumos/quimica-geral', nome: 'Química Geral', grupo: 'Resumos' },
      { id: 'resumos/quimica-organica', nome: 'Química Orgânica', grupo: 'Resumos' },
      { id: 'resumos/fisico-quimica', nome: 'Físico-Química', grupo: 'Resumos' },
      { id: 'resumos/tecnicas-laboratorio', nome: 'Técnicas de Laboratório', grupo: 'Resumos' },
      { id: 'simulados/simulado-01', nome: 'Simulado 01', grupo: 'Simulados' },
      { id: 'simulados/simulado-02', nome: 'Simulado 02', grupo: 'Simulados' },
      { id: 'simulados/simulado-03', nome: 'Simulado 03', grupo: 'Simulados' },
    ];

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
        let md;
        const apiUrl = `/api/plano/${planoSelecionado.value}`;
        const staticUrl = `planos/${planoSelecionado.value}.md`;
        const r = await fetch(apiUrl, { cache: 'no-store' });
        if (r.ok) {
          md = await r.text();
        } else {
          const r2 = await fetch(staticUrl, { cache: 'no-store' });
          if (!r2.ok) {
            const r3 = await fetch(`/${staticUrl}`, { cache: 'no-store' });
            if (!r3.ok) throw new Error('Não encontrado');
            md = await r3.text();
          } else {
            md = await r2.text();
          }
        }
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
          return;
        }
      } catch {}
      planosDisponiveis.value = PLANOS_LISTA;
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
      usuarioAtual, autenticado, erroLogin, usuarioLogado,
      handleLogin, logout, loginUsuario, loginSenha,
      view, menuAberta, semanaAtual,
      tema, diasSemana, carregando,
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
      carregandoErros, novoErro, salvarErro, editarErro, removerErro, cancelarErro,
      // Expondo tudo do Composable de Diário
      CHECKLIST_ITENS, diario, diarioData, diarioHoje, diarioProgresso, alternarDiario,
      // Expondo tudo do Composable de Revisões
      revisoes, revisoesPendentes, revisoesHoje,
      agendarRevisao, concluirRevisao, removerRevisao,
      // Expondo tudo do Composable de Flashcards
      flashcards, formFlashcard, editandoFlashcard, carregandoFlashcards, flashcardsAgrupados,
      novoFlashcard, salvarFlashcard, editarFlashcard, removerFlashcard, cancelarFlashcard,
      modoRevisao, configurandoRevisao, deckRevisao, cardAtual, progressoRevisao, opcoesRevisao, 
      abrirConfiguracaoRevisao, iniciarRevisao, proximoCard, marcarResultado, finalizarRevisao, cancelarConfiguracaoRevisao,
      // Expondo tudo do Composable de Ciclo de Estudos
      ciclo, materiaAtual, idxOriginalAtual, cicloCompleto, cicloExpandido, completosPorItem,
      avancarCiclo, reiniciarCiclo,
      CICLO_ESTUDOS, REVISAO_INTERVALOS, DIAS_SEMANA,
      conteudosFiltrados, expandirTudo, colapsarTudo,
      // Cronograma
      periodos, cronSemana, cronograma, semanaAtualDias, materiaInfo, materiasList,
      slotConcluido, alternarSlot, totalSlots, totalConcluidos, progressoGeralCron,
      progressoSemana, totalSlotsSemana, concluidosSemana,
      // Expondo tudo do Composable de Questões
      filtroMateria: exercicios.filtroMateria,
      filtroGrupo: exercicios.filtroGrupo,
      filtroDificuldade: exercicios.filtroDificuldade,
      mostrarFavoritos: exercicios.mostrarFavoritos,
      modoQuiz: exercicios.modoQuiz,
      quizQuestoes: exercicios.quizQuestoes,
      quizIndex: exercicios.quizIndex,
      respostas: exercicios.respostas,
      responded: exercicios.responded,
      selecionado: exercicios.selecionado,
      mostrarExplicacao: exercicios.mostrarExplicacao,
      revisao: exercicios.revisao,
      favoritos: exercicios.favoritos,
      materiasDisponiveis: exercicios.materiasDisponiveis,
      gruposDisponiveis: exercicios.gruposDisponiveis,
      questoesFiltradas: exercicios.questoesFiltradas,
      quizAtual: exercicios.quizAtual,
      quizProgresso: exercicios.quizProgresso,
      quizAcertos: exercicios.quizAcertos,
      quizTotal: exercicios.quizTotal,
      favoritosLista: exercicios.favoritosLista,
      iniciarQuiz: exercicios.iniciarQuiz,
      responderQuestao: exercicios.responderQuestao,
      proximaQuestao: exercicios.proximaQuestao,
      voltarQuestao: exercicios.voltarQuestao,
      finalizarQuiz: exercicios.finalizarQuiz,
      alternarFavorito: exercicios.alternarFavorito,
      toggleExplicacao: exercicios.toggleExplicacao,
      toggleRevisao: exercicios.toggleRevisao,
      EXERCICIOS: EXERCICIOS
    };
  }
});

app.mount('#app');
