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
  const editandoErro = ref(null);
  const carregandoErros = ref(false);
  const regrasDeOuro = ref(['', '', '', '', '']);

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

  const errosPorMateria = computed(() => {
    const materias = ['Português', 'Matemática', 'Química'];
    return materias.map(mat => {
      const lista = erros.value.filter(e => e.materia === mat);
      const total = lista.length;
      const A = lista.filter(e => (e.classificacao || e.tipo) === 'A').length;
      const B = lista.filter(e => (e.classificacao || e.tipo) === 'B').length;
      const C = lista.filter(e => (e.classificacao || e.tipo) === 'C').length;
      const revisados = lista.filter(e => e.revisado).length;
      return { materia: mat, total, A, B, C, revisados, pendentes: total - revisados };
    });
  });

  const errosFrequentes = computed(() => {
    return erros.value.filter(e => e.classificacao === 'A' || e.classificacao === 'B' || (e.tipo && e.tipo !== 'C'));
  });

  async function carregarErros() {
    if (erros.value.length > 0) return;
    carregandoErros.value = true;
    erros.value = await Armazenamento.getErros();
    const regras = await Armazenamento._getData('regrasDeOuro', null);
    if (regras) regrasDeOuro.value = regras;
    carregandoErros.value = false;
  }

  function novoErro() {
    editandoErro.value = { id: Date.now(), data: new Date().toISOString().slice(0, 10), materia: '', topico: '', questao: '', pensamento: '', respostaCorreta: '', lacuna: '', classificacao: 'A', revisado: false, revisaoD7: null, revisaoD30: null };
  }

  async function salvarErro() {
    if (!editandoErro.value) return;
    const erroSalvo = { ...editandoErro.value };
    const idx = erros.value.findIndex(e => e.id === erroSalvo.id);
    if (idx >= 0) {
      erros.value.splice(idx, 1, erroSalvo);
    } else {
      erros.value.push(erroSalvo);
    }
    await Armazenamento.salvarErro(erroSalvo);
    editandoErro.value = null;
  }

  function editarErro(e) {
    editandoErro.value = { ...e };
  }

  async function removerErro(id) {
    const idx = erros.value.findIndex(e => e.id === id);
    if (idx >= 0) erros.value.splice(idx, 1);
    await Armazenamento.removerErro(id);
  }

  function cancelarErro() {
    editandoErro.value = null;
  }

  function registrarRevisao(id, prazo) {
    const e = erros.value.find(e => e.id === id);
    if (!e) return;
    if (prazo === 7) e.revisaoD7 = { data: new Date().toISOString().slice(0, 10), acertou: false };
    if (prazo === 30) e.revisaoD30 = { data: new Date().toISOString().slice(0, 10), acertou: false };
    Armazenamento.salvarErro(e);
  }

  function marcarRevisaoAcertou(id, prazo) {
    const e = erros.value.find(e => e.id === id);
    if (!e) return;
    if (prazo === 7 && e.revisaoD7) e.revisaoD7.acertou = true;
    if (prazo === 30 && e.revisaoD30) e.revisaoD30.acertou = true;
    Armazenamento.salvarErro(e);
  }

  watch(regrasDeOuro, (val) => {
    if (carregandoErros.value) return;
    Armazenamento._salvarLocal('regrasDeOuro', val);
    Armazenamento._putToServer('regrasDeOuro', val);
  }, { deep: true });

  return {
    erros, editandoErro, errosAgrupados, totalErros, carregandoErros,
    errosPorMateria, errosFrequentes, regrasDeOuro,
    novoErro, salvarErro, editarErro, removerErro, cancelarErro, carregarErros,
    registrarRevisao, marcarRevisaoAcertou
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
  const gruposAbertos = ref(Armazenamento._carregarLocal('gruposAbertos', {}));
  const filtro = ref('');
  const abaAtiva = ref(null);
  function toggleAba(id) { abaAtiva.value = abaAtiva.value === id ? null : id; }

  // Initialize all groups as open by default if not loaded from storage
  if (Object.keys(gruposAbertos.value).length === 0) {
    conteudosData.forEach(m => {
      m.grupos.forEach(g => {
        gruposAbertos.value[m.id + '-' + g.nome] = true;
      });
    });
  }

  function chaveItem(materiaId, grupoNome, idx) {
    return `${materiaId}-${grupoNome}-${idx}`;
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

  watch(gruposAbertos, (val) => {
    Armazenamento._salvarLocal('gruposAbertos', val);
  }, { deep: true });

  return {
    checklist, gruposAbertos, filtro, abaAtiva, toggleAba,
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
    if (flashcards.value.length === 0) {
      flashcards.value = FLASHCARDS_PADRAO.map(c => ({ ...c }));
      Armazenamento._cache['flashcards'] = flashcards.value;
      Armazenamento._salvarLocal('flashcards', flashcards.value);
    }
    carregandoFlashcards.value = false;
  }

  const FLASHCARDS_PADRAO = [
    {id:1,materia:"Português",frente:"O que é fonética?",verso:"Estudo dos sons da fala (fonemas).",box:1,lastReviewed:null},
    {id:2,materia:"Português",frente:"O que é fonologia?",verso:"Estudo da função dos sons em uma língua.",box:1,lastReviewed:null},
    {id:3,materia:"Português",frente:"Diferencie fonema de letra.",verso:"Fonema = som; letra = representação gráfica. Ex: 'táxi' tem 4 fonemas e 4 letras; 'hoje' tem 3 fonemas e 4 letras.",box:1,lastReviewed:null},
    {id:4,materia:"Português",frente:"O que é encontro consonantal?",verso:"Sequência de duas ou mais consoantes sem vogal entre elas. Ex: 'prato' (pr), 'flor' (fl).",box:1,lastReviewed:null},
    {id:5,materia:"Português",frente:"O que é dígrafo?",verso:"Duas letras representando um único fonema. Ex: 'ch', 'lh', 'nh', 'qu', 'gu', 'ss', 'rr', 'sc'.",box:1,lastReviewed:null},
    {id:6,materia:"Português",frente:"O que é ditongo?",verso:"Encontro de duas vogais na mesma sílaba. Ex: 'cai-xa', 'herói'.",box:1,lastReviewed:null},
    {id:7,materia:"Português",frente:"O que é hiato?",verso:"Encontro de duas vogais em sílabas diferentes. Ex: 'sa-ú-de', 'po-é-ti-co'.",box:1,lastReviewed:null},
    {id:8,materia:"Português",frente:"Regra de acentuação: paroxítonas",verso:"Acentuam-se paroxítonas terminadas em: l, n, r, x, i, is, us, um, uns, ão, ãos, ei, eis, ps. Ex: 'fácil', 'hífen', 'tórax'.",box:1,lastReviewed:null},
    {id:9,materia:"Português",frente:"Regra de acentuação: proparoxítonas",verso:"Todas as proparoxítonas são acentuadas. Ex: 'médico', 'página', 'lâmpada'.",box:1,lastReviewed:null},
    {id:10,materia:"Português",frente:"Regra de acentuação: oxítonas",verso:"Acentuam-se oxítonas terminadas em: a, e, o, em, ens. Ex: 'sofá', 'café', 'armazém'.",box:1,lastReviewed:null},
    {id:11,materia:"Português",frente:"Por que 'ideia' não leva mais acento?",verso:"Pelo Novo Acordo Ortográfico, ditongos abertos 'ei' e 'oi' em paroxítonas perderam o acento.",box:1,lastReviewed:null},
    {id:12,materia:"Português",frente:"Classes gramaticais: substantivo",verso:"Palavra que nomeia seres, objetos, sentimentos, etc. Ex: 'casa', 'amor', 'Petrobras'.",box:1,lastReviewed:null},
    {id:13,materia:"Português",frente:"Classes gramaticais: adjetivo",verso:"Palavra que caracteriza o substantivo. Ex: 'grande', 'eficiente', 'químico'.",box:1,lastReviewed:null},
    {id:14,materia:"Português",frente:"Classes gramaticais: verbo",verso:"Palavra que indica ação, estado ou fenômeno. Ex: 'analisar', 'ser', 'chover'.",box:1,lastReviewed:null},
    {id:15,materia:"Português",frente:"O que é sujeito?",verso:"Termo sobre o qual se declara algo. Ex: 'O técnico analisou a amostra' → sujeito: 'O técnico'.",box:1,lastReviewed:null},
    {id:16,materia:"Português",frente:"O que é predicado?",verso:"Tudo que se declara sobre o sujeito. Ex: 'O técnico analisou a amostra' → predicado: 'analisou a amostra'.",box:1,lastReviewed:null},
    {id:17,materia:"Português",frente:"O que é objeto direto?",verso:"Complemento verbal sem preposição obrigatória. Ex: 'Ele comprou um livro'. 'um livro' = OD.",box:1,lastReviewed:null},
    {id:18,materia:"Português",frente:"O que é objeto indireto?",verso:"Complemento verbal com preposição obrigatória. Ex: 'Preciso de ajuda'. 'de ajuda' = OI.",box:1,lastReviewed:null},
    {id:19,materia:"Português",frente:"O que é adjunto adverbial?",verso:"Termo que indica circunstância (tempo, lugar, modo, etc.). Ex: 'Chegou cedo'. 'cedo' = adj. adverbial de tempo.",box:1,lastReviewed:null},
    {id:20,materia:"Português",frente:"O que é crase?",verso:"Fusão da preposição 'a' com o artigo 'a' ou com o 'a' de pronomes. Usa-se acento grave (`). Ex: 'Vou à escola'.",box:1,lastReviewed:null},
    {id:21,materia:"Português",frente:"Quando usar 'mal' e 'mau'?",verso:"'Mal' = advérbio (opõe-se a 'bem'). 'Mau' = adjetivo (opõe-se a 'bom'). Ex: 'Ele está mal' / 'Ele é um mau profissional'.",box:1,lastReviewed:null},
    {id:22,materia:"Português",frente:"Quando usar 'mais' e 'mas'?",verso:"'Mas' = conjunção adversativa (oposição). 'Mais' = advérbio de intensidade. Ex: 'Estudou, mas não passou' / 'Quero mais tempo'.",box:1,lastReviewed:null},
    {id:23,materia:"Português",frente:"O que é figura de linguagem?",verso:"Recurso estilístico para dar expressividade ao texto. Ex: metáfora, metonímia, hipérbole, antítese.",box:1,lastReviewed:null},
    {id:24,materia:"Português",frente:"O que é metáfora?",verso:"Figura de palavra que emprega um termo com significado diferente do usual, por comparação implícita. Ex: 'Ele é um leão'.",box:1,lastReviewed:null},
    {id:25,materia:"Português",frente:"O que é concordância verbal?",verso:"O verbo concorda com o sujeito em número e pessoa. Ex: 'O aluno estudou' / 'Os alunos estudaram'.",box:1,lastReviewed:null},
    {id:26,materia:"Português",frente:"O que é regência verbal?",verso:"Relação entre o verbo e seus complementos (com ou sem preposição). Ex: 'Assistir ao filme' (OI) / 'Assistir o professor' (OD).",box:1,lastReviewed:null},
    {id:27,materia:"Português",frente:"O que é período composto?",verso:"Frase com mais de uma oração. Ex: 'Estudou muito, mas não passou'.",box:1,lastReviewed:null},
    {id:28,materia:"Português",frente:"O que é oração subordinada?",verso:"Oração que depende de outra (principal). Ex: 'Preciso que você estude' → 'que você estude' é subordinada.",box:1,lastReviewed:null},
    {id:29,materia:"Português",frente:"O que são conectivos?",verso:"Palavras que ligam orações ou termos. Ex: conjunções (e, mas, porque, quando), preposições, pronomes relativos.",box:1,lastReviewed:null},
    {id:30,materia:"Português",frente:"Funções da linguagem: função referencial",verso:"Foco na informação, no contexto. Ex: notícias, manuais técnicos. Predomina a 3ª pessoa.",box:1,lastReviewed:null},
    {id:31,materia:"Português",frente:"Funções da linguagem: função emotiva",verso:"Foco no emissor, expressão de sentimentos. Ex: poemas, diários. Predomina a 1ª pessoa.",box:1,lastReviewed:null},
    {id:32,materia:"Português",frente:"Funções da linguagem: função conativa",verso:"Foco no receptor, intenção de convencer. Ex: propagandas, discursos políticos. Uso de imperativo.",box:1,lastReviewed:null},
    {id:33,materia:"Português",frente:"Funções da linguagem: função fática",verso:"Foco no canal de comunicação. Ex: 'Alô?', 'Entendeu?', 'Está me ouvindo?'.",box:1,lastReviewed:null},
    {id:34,materia:"Matemática",frente:"O que é regra de três simples?",verso:"Método para resolver problemas com grandezas proporcionais. Se A está para B assim como C está para D, então A×D = B×C.",box:1,lastReviewed:null},
    {id:35,materia:"Matemática",frente:"O que é porcentagem?",verso:"Razão com denominador 100. Ex: 25% = 25/100 = 0,25.",box:1,lastReviewed:null},
    {id:36,materia:"Matemática",frente:"Fórmula do montante de juros simples",verso:"M = C + J = C(1 + i×t). Onde C=capital, i=taxa, t=tempo.",box:1,lastReviewed:null},
    {id:37,materia:"Matemática",frente:"Fórmula do montante de juros compostos",verso:"M = C(1 + i)^t. Onde C=capital, i=taxa, t=tempo.",box:1,lastReviewed:null},
    {id:38,materia:"Matemática",frente:"Área do triângulo",verso:"A = (b × h) / 2. Onde b = base, h = altura.",box:1,lastReviewed:null},
    {id:39,materia:"Matemática",frente:"Área do círculo",verso:"A = π × r². Onde r = raio, π ≈ 3,14.",box:1,lastReviewed:null},
    {id:40,materia:"Matemática",frente:"Comprimento da circunferência",verso:"C = 2πr. Onde r = raio.",box:1,lastReviewed:null},
    {id:41,materia:"Matemática",frente:"Volume do cilindro",verso:"V = π × r² × h. Onde r = raio da base, h = altura.",box:1,lastReviewed:null},
    {id:42,materia:"Matemática",frente:"Volume do cubo",verso:"V = a³. Onde a = aresta.",box:1,lastReviewed:null},
    {id:43,materia:"Matemática",frente:"O que é média aritmética?",verso:"Soma dos valores dividida pela quantidade. Ex: média de 5, 7, 9 = (5+7+9)/3 = 7.",box:1,lastReviewed:null},
    {id:44,materia:"Matemática",frente:"O que é mediana?",verso:"Valor central de um conjunto ordenado. Se ímpar: termo central. Se par: média dos dois centrais.",box:1,lastReviewed:null},
    {id:45,materia:"Matemática",frente:"O que é moda?",verso:"Valor que mais se repete em um conjunto. Ex: {2,3,3,5,7} → moda = 3.",box:1,lastReviewed:null},
    {id:46,materia:"Matemática",frente:"O que é probabilidade?",verso:"P = (casos favoráveis) / (casos possíveis). Valor entre 0 e 1.",box:1,lastReviewed:null},
    {id:47,materia:"Matemática",frente:"O que são eventos mutuamente exclusivos?",verso:"Eventos que não podem ocorrer simultaneamente. P(A ∪ B) = P(A) + P(B).",box:1,lastReviewed:null},
    {id:48,materia:"Matemática",frente:"O que é função do 1º grau?",verso:"f(x) = ax + b, com a ≠ 0. Gráfico é uma reta. a = coeficiente angular, b = linear.",box:1,lastReviewed:null},
    {id:49,materia:"Matemática",frente:"O que é função do 2º grau?",verso:"f(x) = ax² + bx + c, com a ≠ 0. Gráfico é uma parábola.",box:1,lastReviewed:null},
    {id:50,materia:"Matemática",frente:"Fórmula de Bhaskara",verso:"x = (-b ± √Δ) / 2a, onde Δ = b² - 4ac.",box:1,lastReviewed:null},
    {id:51,materia:"Matemática",frente:"O que é logaritmo?",verso:"log_a b = x ⇔ a^x = b. Condições: a > 0, a ≠ 1, b > 0.",box:1,lastReviewed:null},
    {id:52,materia:"Matemática",frente:"Teorema de Pitágoras",verso:"a² = b² + c², onde 'a' é a hipotenusa, 'b' e 'c' são os catetos.",box:1,lastReviewed:null},
    {id:53,materia:"Matemática",frente:"Razão entre grandezas: direta vs inversa",verso:"Direta: uma aumenta, a outra aumenta na mesma proporção. Inversa: uma aumenta, a outra diminui.",box:1,lastReviewed:null},
    {id:54,materia:"Matemática",frente:"O que é análise combinatória?",verso:"Ramo que estuda formas de agrupar elementos. Principais: arranjo, combinação, permutação.",box:1,lastReviewed:null},
    {id:55,materia:"Matemática",frente:"Fórmula da combinação",verso:"C(n,p) = n! / [p!(n-p)!]. Não importa a ordem dos elementos.",box:1,lastReviewed:null},
    {id:56,materia:"Matemática",frente:"Fórmula do arranjo",verso:"A(n,p) = n! / (n-p)!. A ordem dos elementos importa.",box:1,lastReviewed:null},
    {id:57,materia:"Matemática",frente:"O que é progressão aritmética (PA)?",verso:"Sequência onde cada termo é o anterior somado a uma constante (razão r). Termo geral: a_n = a₁ + (n-1)r.",box:1,lastReviewed:null},
    {id:58,materia:"Matemática",frente:"Soma dos termos de uma PA",verso:"S_n = (a₁ + a_n) × n / 2.",box:1,lastReviewed:null},
    {id:59,materia:"Matemática",frente:"O que é progressão geométrica (PG)?",verso:"Sequência onde cada termo é o anterior multiplicado por uma constante (razão q). Termo geral: a_n = a₁ × q^(n-1).",box:1,lastReviewed:null},
    {id:60,materia:"Matemática",frente:"Soma dos termos de uma PG finita",verso:"S_n = a₁(q^n - 1) / (q - 1), para q ≠ 1.",box:1,lastReviewed:null},
    {id:61,materia:"Matemática",frente:"Soma dos termos de uma PG infinita",verso:"S = a₁ / (1 - q), para |q| < 1.",box:1,lastReviewed:null},
    {id:62,materia:"Matemática",frente:"O que é matriz?",verso:"Tabela de elementos dispostos em linhas e colunas. Ordem m×n (m linhas, n colunas).",box:1,lastReviewed:null},
    {id:63,materia:"Matemática",frente:"O que é determinante?",verso:"Número associado a uma matriz quadrada. Para matriz 2×2: det = ad - bc.",box:1,lastReviewed:null},
    {id:64,materia:"Matemática",frente:"O que é sistema linear?",verso:"Conjunto de equações lineares com variáveis em comum. Pode ser SPD, SPI ou SI.",box:1,lastReviewed:null},
    {id:65,materia:"Matemática",frente:"O que é geometria analítica?",verso:"Ramo que estuda figuras geométricas usando coordenadas e equações.",box:1,lastReviewed:null},
    {id:66,materia:"Química",frente:"O que é matéria?",verso:"Tudo que tem massa e ocupa lugar no espaço.",box:1,lastReviewed:null},
    {id:67,materia:"Química",frente:"O que é átomo?",verso:"Menor partícula que mantém as propriedades de um elemento químico.",box:1,lastReviewed:null},
    {id:68,materia:"Química",frente:"Partes do átomo",verso:"Núcleo (prótons + nêutrons) e eletrosfera (elétrons). Próton: carga +; elétron: carga -; nêutron: neutro.",box:1,lastReviewed:null},
    {id:69,materia:"Química",frente:"O que é número atômico (Z)?",verso:"Quantidade de prótons no núcleo. Identifica o elemento químico.",box:1,lastReviewed:null},
    {id:70,materia:"Química",frente:"O que é número de massa (A)?",verso:"Soma de prótons e nêutrons: A = Z + N.",box:1,lastReviewed:null},
    {id:71,materia:"Química",frente:"O que são isótopos?",verso:"Átomos do mesmo elemento (mesmo Z) com diferentes números de massa (nêutrons). Ex: C-12, C-13, C-14.",box:1,lastReviewed:null},
    {id:72,materia:"Química",frente:"O que é ligação iônica?",verso:"Transferência definitiva de elétrons entre metal e não-metal. Formam-se íons. Ex: NaCl.",box:1,lastReviewed:null},
    {id:73,materia:"Química",frente:"O que é ligação covalente?",verso:"Compartilhamento de pares de elétrons entre não-metais. Ex: H₂O, CO₂.",box:1,lastReviewed:null},
    {id:74,materia:"Química",frente:"O que é ligação metálica?",verso:"Atração entre cátions metálicos e elétrons livres (mar de elétrons). Ex: Fe, Cu, Al.",box:1,lastReviewed:null},
    {id:75,materia:"Química",frente:"O que é pH?",verso:"Potencial hidrogeniônico. pH = -log[H⁺]. Escala 0-14. pH < 7 = ácido; pH > 7 = básico; pH = 7 = neutro.",box:1,lastReviewed:null},
    {id:76,materia:"Química",frente:"O que é solução?",verso:"Mistura homogênea de duas ou mais substâncias. Ex: água + sal.",box:1,lastReviewed:null},
    {id:77,materia:"Química",frente:"Fórmula da concentração comum",verso:"C = m/V. Onde m = massa do soluto (g), V = volume da solução (L). Unidade: g/L.",box:1,lastReviewed:null},
    {id:78,materia:"Química",frente:"O que é mol?",verso:"Quantidade de matéria que contém 6,02×10²³ entidades (Número de Avogadro).",box:1,lastReviewed:null},
    {id:79,materia:"Química",frente:"O que é massa molar?",verso:"Massa de 1 mol de uma substância, em g/mol. Soma das massas atômicas dos elementos.",box:1,lastReviewed:null},
    {id:80,materia:"Química",frente:"O que é estequiometria?",verso:"Cálculo das quantidades de reagentes e produtos em uma reação química, baseado nas proporções molares.",box:1,lastReviewed:null},
    {id:81,materia:"Química",frente:"O que é reação exotérmica?",verso:"Reação que libera calor para o ambiente. ΔH < 0. Ex: combustão.",box:1,lastReviewed:null},
    {id:82,materia:"Química",frente:"O que é reação endotérmica?",verso:"Reação que absorve calor do ambiente. ΔH > 0. Ex: fotossíntese.",box:1,lastReviewed:null},
    {id:83,materia:"Química",frente:"O que é catálise?",verso:"Aumento da velocidade de uma reação por um catalisador, que diminui a energia de ativação sem ser consumido.",box:1,lastReviewed:null},
    {id:84,materia:"Química",frente:"O que é equilíbrio químico?",verso:"Estado onde as velocidades das reações direta e inversa se igualam. As concentrações permanecem constantes.",box:1,lastReviewed:null},
    {id:85,materia:"Química",frente:"Princípio de Le Chatelier",verso:"Quando um sistema em equilíbrio sofre uma perturbação, ele se desloca para minimizar o efeito.",box:1,lastReviewed:null},
    {id:86,materia:"Química",frente:"Fórmula da constante de equilíbrio Kc",verso:"Kc = [produtos]^coeficientes / [reagentes]^coeficientes (para reações em solução).",box:1,lastReviewed:null},
    {id:87,materia:"Química",frente:"O que é oxidação?",verso:"Perda de elétrons. Aumento do número de oxidação (NOX).",box:1,lastReviewed:null},
    {id:88,materia:"Química",frente:"O que é redução?",verso:"Ganho de elétrons. Diminuição do número de oxidação (NOX).",box:1,lastReviewed:null},
    {id:89,materia:"Química",frente:"O que é eletrólise?",verso:"Processo não espontâneo que usa corrente elétrica para promover uma reação química.",box:1,lastReviewed:null},
    {id:90,materia:"Química",frente:"O que é destilação fracionada?",verso:"Separação de líquidos miscíveis com diferentes pontos de ebulição. Ex: separação do petróleo.",box:1,lastReviewed:null},
    {id:91,materia:"Química",frente:"O que é cromatografia?",verso:"Técnica de separação baseada na diferença de afinidade dos componentes por uma fase estacionária e uma fase móvel.",box:1,lastReviewed:null},
    {id:92,materia:"Química",frente:"O que é espectrofotometria UV-Vis?",verso:"Técnica que mede a absorção de luz UV-Visível, baseada na Lei de Beer-Lambert: A = εbc.",box:1,lastReviewed:null},
    {id:93,materia:"Química",frente:"O que é titulação?",verso:"Técnica volumétrica onde uma solução de concentração conhecida reage com uma de concentração desconhecida.",box:1,lastReviewed:null},
    {id:94,materia:"Química",frente:"O que é ponto de equivalência?",verso:"Ponto onde a quantidade de titulante adicionada é estequiometricamente equivalente ao titulado.",box:1,lastReviewed:null},
    {id:95,materia:"Química",frente:"Fórmula geral dos alcanos",verso:"CₙH₂ₙ₊₂. Hidrocarbonetos saturados com ligações simples. Ex: metano CH₄, etano C₂H₆.",box:1,lastReviewed:null},
    {id:96,materia:"Química",frente:"O que são isômeros?",verso:"Compostos com mesma fórmula molecular, mas diferentes estruturas ou arranjos espaciais.",box:1,lastReviewed:null},
    {id:97,materia:"Química",frente:"Grupo funcional dos álcoois",verso:"OH (hidroxila) ligado a carbono saturado. Ex: etanol CH₃CH₂OH.",box:1,lastReviewed:null},
    {id:98,materia:"Química",frente:"Grupo funcional dos ácidos carboxílicos",verso:"COOH (carboxila). Ex: ácido acético CH₃COOH.",box:1,lastReviewed:null},
    {id:99,materia:"Química",frente:"O que é polimerização?",verso:"Processo de formação de polímeros a partir de monômeros. Ex: polietileno a partir do eteno.",box:1,lastReviewed:null},
    {id:100,materia:"Química",frente:"Regra de Markovnikov",verso:"Em adição a alceno, o H se liga ao carbono mais hidrogenado; o halogênio ao menos hidrogenado.",box:1,lastReviewed:null},
  ];

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

  async function reiniciarFlashcards() {
    if (!confirm('Tem certeza? Todos os flashcards serão resetados para o padrão.')) return;
    flashcards.value = FLASHCARDS_PADRAO.map(c => ({ ...c }));
    Armazenamento._cache['flashcards'] = flashcards.value;
    Armazenamento._salvarLocal('flashcards', flashcards.value);
    await Armazenamento._putToServer('flashcards', flashcards.value);
  }

  return { flashcards, formFlashcard, editandoFlashcard, carregandoFlashcards, flashcardsAgrupados, carregarFlashcards, novoFlashcard, salvarFlashcard, editarFlashcard, removerFlashcard, cancelarFlashcard, modoRevisao, configurandoRevisao, deckRevisao, cardAtualIndex, cardAtual, progressoRevisao, opcoesRevisao, abrirConfiguracaoRevisao, iniciarRevisao, proximoCard, marcarResultado, finalizarRevisao, cancelarConfiguracaoRevisao, reiniciarFlashcards };
}

function useAdmin() {
  const usuarios = ref([]);
  const editandoUsuario = ref(null);

  const totalUsuarios = computed(() => usuarios.value.length);
  const admins = computed(() => usuarios.value.filter(u => u.role === 'admin'));
  const usuariosComuns = computed(() => usuarios.value.filter(u => u.role !== 'admin'));

  async function carregarAdmin() {
    if (usuarios.value.length > 0) return;
    usuarios.value = await Armazenamento.getAdminUsuarios();
  }

  function novoUsuario() {
    editandoUsuario.value = { usuario: '', senha: '', nome: '', role: 'user' };
  }

  function editarUsuario(u) {
    editandoUsuario.value = { ...u };
  }

  async function salvarUsuario() {
    if (!editandoUsuario.value) return;
    const u = editandoUsuario.value;
    if (!u.usuario || !u.senha || u.senha.length < 3 || !u.nome) return;

    const idx = usuarios.value.findIndex(x => x.usuario === u.usuario);
    if (idx >= 0) {
      usuarios.value.splice(idx, 1, { ...u });
    } else {
      usuarios.value.push({ ...u });
    }
    await Armazenamento.salvarAdminUsuarios([...usuarios.value]);
    editandoUsuario.value = null;
  }

  async function removerUsuario(usuario) {
    const idx = usuarios.value.findIndex(u => u.usuario === usuario);
    if (idx >= 0) {
      usuarios.value.splice(idx, 1);
      await Armazenamento.salvarAdminUsuarios([...usuarios.value]);
    }
  }

  function cancelarEdicao() {
    editandoUsuario.value = null;
  }

  return {
    usuarios, editandoUsuario, totalUsuarios, admins, usuariosComuns,
    novoUsuario, editarUsuario, salvarUsuario, removerUsuario, cancelarEdicao, carregarAdmin
  };
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
  { id: 65, materia: 'Química', grupo: 'Reações Inorgânicas', dificuldade: 'Médio',
    enunciado: 'Na reação 2 Mg + O₂ → 2 MgO, o magnésio (Mg) sofre:',
    alternativas: ['Redução, pois ganha elétrons', 'Oxidação, pois perde elétrons', 'Redução, pois perde oxigênio', 'Oxidação, pois ganha hidrogênio', 'Neutralização'],
    correta: 1, explicacao: 'O magnésio metálico (Mg⁰) perde dois elétrons para se tornar Mg²⁺ no MgO. Perda de elétrons = oxidação. O magnésio é o agente redutor, e o oxigênio é o agente oxidante.' },
  { id: 66, materia: 'Química', grupo: 'Estequiometria', dificuldade: 'Fácil',
    enunciado: 'Quantas moléculas de água existem em 18 g de H₂O? (Dado: Número de Avogadro = 6,02×10²³, massas molares: H=1, O=16)',
    alternativas: ['3,01×10²³', '6,02×10²³', '9,03×10²³', '1,20×10²⁴', '1,80×10²⁴'],
    correta: 1, explicacao: 'Massa molar da H₂O = 18 g/mol. 18 g = 1 mol. 1 mol contém 6,02×10²³ moléculas (Número de Avogadro).' },
  { id: 67, materia: 'Química', grupo: 'Estequiometria', dificuldade: 'Fácil',
    enunciado: 'Na reação 2 H₂ + O₂ → 2 H₂O, se 4 g de H₂ reagem com 32 g de O₂, qual é a massa de água formada? (Massas molares: H=1, O=16)',
    alternativas: ['18 g', '36 g', '40 g', '64 g', '72 g'],
    correta: 1, explicacao: 'Pela lei de conservação das massas (Lavoisier): massa total dos reagentes = massa total dos produtos. 4 g + 32 g = 36 g de H₂O.' },
  { id: 68, materia: 'Química', grupo: 'Soluções', dificuldade: 'Médio',
    enunciado: 'Um técnico preparou 250 mL de uma solução aquosa de NaCl 0,5 mol/L. A massa de NaCl utilizada foi de aproximadamente: (Dado: massa molar NaCl = 58,5 g/mol)',
    alternativas: ['7,31 g', '14,63 g', '29,25 g', '58,50 g', '117,0 g'],
    correta: 0, explicacao: 'M = n/V → n = M × V = 0,5 × 0,25 = 0,125 mol. Massa = n × MM = 0,125 × 58,5 = 7,3125 g ≈ 7,31 g.' },
  { id: 69, materia: 'Química', grupo: 'Soluções', dificuldade: 'Médio',
    enunciado: 'Para diluir uma solução de HCl 2,0 mol/L para 0,5 mol/L, um técnico precisa preparar 500 mL da solução diluída. O volume de solução concentrada necessário é:',
    alternativas: ['50 mL', '75 mL', '100 mL', '125 mL', '150 mL'],
    correta: 2, explicacao: 'Usando C₁V₁ = C₂V₂: 2,0 × V₁ = 0,5 × 500 → V₁ = 250/2 = 125 mL.' },
  { id: 70, materia: 'Química', grupo: 'Termoquímica', dificuldade: 'Fácil',
    enunciado: 'Em uma reação química, a variação de entalpia (ΔH) é negativa. Isso significa que a reação é:',
    alternativas: ['Endotérmica, absorve calor', 'Exotérmica, libera calor', 'Isotérmica, não troca calor', 'Adiabática, sem troca com o meio', 'Espontânea em qualquer temperatura'],
    correta: 1, explicacao: 'ΔH < 0 indica reação exotérmica, onde há liberação de calor para o ambiente. A entalpia dos produtos é menor que a dos reagentes.' },
  { id: 71, materia: 'Química', grupo: 'Termoquímica', dificuldade: 'Médio',
    enunciado: 'A entalpia de combustão do metano (CH₄) é -890 kJ/mol. Quantos kJ são liberados na combustão de 32 g de metano? (Massa molar CH₄ = 16 g/mol)',
    alternativas: ['-890 kJ', '-1.780 kJ', '-2.670 kJ', '-3.560 kJ', '-4.450 kJ'],
    correta: 1, explicacao: '32 g de CH₄ = 2 mols (32/16 = 2). Energia liberada = 2 × (-890) = -1.780 kJ.' },
  { id: 72, materia: 'Química', grupo: 'Cinética Química', dificuldade: 'Médio',
    enunciado: 'A velocidade de uma reação química depende de vários fatores. Assinale a alternativa que NÃO influencia a velocidade da reação:',
    alternativas: ['Temperatura', 'Concentração dos reagentes', 'Superfície de contato', 'Entalpia dos produtos', 'Presença de catalisador'],
    correta: 3, explicacao: 'A entalpia dos produtos não influencia a velocidade da reação (cinética). Temperatura, concentração, superfície de contato e catalisadores afetam a velocidade.' },
  { id: 73, materia: 'Química', grupo: 'Cinética Química', dificuldade: 'Médio',
    enunciado: 'Um catalisador aumenta a velocidade de uma reação porque:',
    alternativas: ['Aumenta a energia de ativação', 'Diminui a energia de ativação', 'Aumenta a temperatura do sistema', 'Consome-se durante a reação', 'Altera o equilíbrio químico'],
    correta: 1, explicacao: 'O catalisador diminui a energia de ativação da reação, permitindo que mais moléculas tenham energia suficiente para reagir. Ele não é consumido e não altera o equilíbrio.' },
  { id: 74, materia: 'Química', grupo: 'Equilíbrio Químico', dificuldade: 'Fácil',
    enunciado: 'Para a reação H₂(g) + I₂(g) ⇌ 2 HI(g) em equilíbrio, se a concentração de H₂ for aumentada, o sistema:',
    alternativas: ['Desloca para a direita (forma mais HI)', 'Desloca para a esquerda (forma mais H₂ e I₂)', 'Permanecerá inalterado', 'A temperatura aumenta', 'Formará mais I₂'],
    correta: 0, explicacao: 'Pelo princípio de Le Chatelier, ao aumentar a concentração de um reagente (H₂), o equilíbrio se desloca no sentido de consumi-lo, ou seja, para a direita, formando mais HI.' },
  { id: 75, materia: 'Química', grupo: 'Equilíbrio Químico', dificuldade: 'Fácil',
    enunciado: 'O produto iônico da água (Kw) a 25°C é 1,0×10⁻¹⁴. Em uma solução neutra a 25°C, as concentrações de H⁺ e OH⁻ são:',
    alternativas: ['[H⁺] = 10⁻⁷ M, [OH⁻] = 10⁻⁷ M', '[H⁺] = 10⁻¹⁴ M, [OH⁻] = 10⁰ M', '[H⁺] = 10⁰ M, [OH⁻] = 10⁻¹⁴ M', '[H⁺] = 10⁻⁵ M, [OH⁻] = 10⁻⁹ M', '[H⁺] = 10⁻¹⁰ M, [OH⁻] = 10⁻⁴ M'],
    correta: 0, explicacao: 'Em solução neutra, [H⁺] = [OH⁻]. Como Kw = [H⁺][OH⁻] = 1,0×10⁻¹⁴, temos [H⁺]² = 1,0×10⁻¹⁴, logo [H⁺] = [OH⁻] = 10⁻⁷ M.' },
  { id: 76, materia: 'Química', grupo: 'Eletroquímica', dificuldade: 'Fácil',
    enunciado: 'Em uma pilha galvânica, a oxidação ocorre no:',
    alternativas: ['Cátodo', 'Ânodo', 'Ponte salina', 'Eletrólito', 'Circuito externo'],
    correta: 1, explicacao: 'No ânodo ocorre a oxidação (perda de elétrons). No cátodo ocorre a redução (ganho de elétrons). A ponte salina permite o fluxo de íons entre as semicélulas.' },
  { id: 77, materia: 'Química', grupo: 'Eletroquímica', dificuldade: 'Médio',
    enunciado: 'Na eletrólise da água, os gases produzidos no cátodo e no ânodo são, respectivamente:',
    alternativas: ['Oxigênio e hidrogênio', 'Hidrogênio e oxigênio', 'Hidrogênio e cloro', 'Oxigênio e nitrogênio', 'Nitrogênio e hidrogênio'],
    correta: 1, explicacao: 'Na eletrólise da água, no cátodo ocorre redução: 2 H₂O + 2e⁻ → H₂ + 2 OH⁻ (produz H₂). No ânodo ocorre oxidação: 2 H₂O → O₂ + 4 H⁺ + 4e⁻ (produz O₂).' },
  { id: 78, materia: 'Química', grupo: 'Química Orgânica - Nomenclatura', dificuldade: 'Médio',
    enunciado: 'A fórmula molecular do 2-metilpentano é:',
    alternativas: ['C₅H₁₂', 'C₆H₁₄', 'C₇H₁₆', 'C₆H₁₂', 'C₅H₁₀'],
    correta: 1, explicacao: '2-metilpentano é um alcano com 6 carbonos (cadeia principal de 5 + 1 metil). Fórmula geral dos alcanos: CₙH₂ₙ₊₂. Para n=6: C₆H₁₄.' },
  { id: 79, materia: 'Química', grupo: 'Química Orgânica - Nomenclatura', dificuldade: 'Fácil',
    enunciado: 'O grupo funcional dos ésteres é caracterizado pelo grupo:',
    alternativas: ['-OH', '-CHO', '-COO-', '-COOH', '-NH₂'],
    correta: 2, explicacao: 'O grupo funcional dos ésteres é -COO- (carboxilato de alquila), resultante da reação de esterificação entre ácido carboxílico e álcool.' },
  { id: 80, materia: 'Química', grupo: 'Química Orgânica - Reações', dificuldade: 'Médio',
    enunciado: 'A reação de substituição eletrofílica aromática do benzeno com Br₂ na presença de FeBr₃ produz:',
    alternativas: ['Bromocicloexano', 'Bromobenzeno', '1,2-dibromobenzeno', 'Ácido benzênico', 'Fenol'],
    correta: 1, explicacao: 'O benzeno reage com Br₂ na presença de catalisador FeBr₃ (halogenação) formando bromobenzeno por substituição eletrofílica aromática.' },
  { id: 81, materia: 'Química', grupo: 'Química Orgânica - Reações', dificuldade: 'Difícil',
    enunciado: 'Na reação de oxidação de um álcool primário, o produto formado é:',
    alternativas: ['Cetona', 'Ácido carboxílico', 'Éster', 'Éter', 'Aldeído (e depois ácido carboxílico)'],
    correta: 4, explicacao: 'A oxidação de álcool primário produz primeiramente aldeído, que pode ser oxidado posteriormente a ácido carboxílico. Já álcool secundário produz cetona.' },
  { id: 82, materia: 'Química', grupo: 'Química Orgânica - Isomeria', dificuldade: 'Difícil',
    enunciado: 'O composto 2-butanol (CH₃-CHOH-CH₂-CH₃) apresenta isomeria óptica porque possui:',
    alternativas: ['Um carbono quiral (assimétrico)', 'Dupla ligação', 'Ligação dupla conjugada', 'Anel aromático', 'Isomeria geométrica (cis-trans)'],
    correta: 0, explicacao: 'O carbono 2 do 2-butanol está ligado a quatro grupos diferentes (H, OH, CH₃, C₂H₅), sendo um centro quiral (assimétrico). Moléculas com um carbono quiral apresentam isomeria óptica (enantiômeros).' },
  { id: 83, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Difícil',
    enunciado: 'A pressão osmótica de uma solução 0,2 M de glicose (C₆H₁₂O₆) a 27°C é aproximadamente: (R = 0,082 L·atm/mol·K)',
    alternativas: ['2,46 atm', '4,92 atm', '7,38 atm', '9,84 atm', '12,3 atm'],
    correta: 1, explicacao: 'π = M·R·T (glicose não dissocia, i=1). T = 27 + 273 = 300 K. π = 0,2 × 0,082 × 300 = 4,92 atm.' },
  { id: 84, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Médio',
    enunciado: 'Qual propriedade coligativa é utilizada para determinar a massa molar de macromoléculas?',
    alternativas: ['Tonoscopia', 'Ebulioscopia', 'Crioscopia', 'Osmoscopia', 'Pressão de vapor'],
    correta: 3, explicacao: 'A osmoscopia (pressão osmótica) é a propriedade coligativa mais sensível, sendo utilizada para determinar massas molares de macromoléculas como proteínas e polímeros.' },
  { id: 85, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Médio',
    enunciado: 'Em uma titulação de oxirredução, o ponto final é detectado por:',
    alternativas: ['Mudança de cor do indicador ácido-base', 'Mudança de cor do indicador redox', 'Formação de precipitado', 'Mudança de pH', 'Condutividade elétrica'],
    correta: 1, explicacao: 'Titulações de oxirredução utilizam indicadores redox, que mudam de cor quando o potencial do sistema atinge o potencial de equivalência. Ex: difenilamina, ferroína.' },
  { id: 86, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Médio',
    enunciado: 'Na gravimetria, o processo de aquecer o precipitado até massa constante para remover água e compostos voláteis é chamado de:',
    alternativas: ['Digestão', 'Filtração', 'Calcinação', 'Secagem', 'Precipitação'],
    correta: 2, explicacao: 'A calcinação é o aquecimento do precipitado a altas temperaturas até massa constante, eliminando água e componentes voláteis, antes da pesagem final.' },
  { id: 87, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Médio',
    enunciado: 'Em espectroscopia de absorção atômica (AA), a atomização da amostra ocorre geralmente em:',
    alternativas: ['Chama ou forno de grafite', 'Coluna cromatográfica', 'Célula eletroquímica', 'Cubeta de quartzo', 'Eletrodo de vidro'],
    correta: 0, explicacao: 'Na absorção atômica, a amostra é atomizada em chama (ar-acetileno, N₂O-acetileno) ou em forno de grafite aquecido eletricamente, transformando os analitos em átomos livres no estado gasoso.' },
  { id: 88, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Médio',
    enunciado: 'A cromatografia em fase gasosa (GC) é mais adequada para analisar compostos que:',
    alternativas: ['São iônicos e polares', 'São voláteis e termicamente estáveis', 'Têm alta massa molecular', 'São insolúveis em solventes orgânicos', 'São sólidos à temperatura ambiente'],
    correta: 1, explicacao: 'A GC é adequada para compostos voláteis (ou que podem ser volatilizados sem decomposição) e termicamente estáveis. Compostos não voláteis ou termolábeis requerem HPLC.' },
  { id: 89, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Fácil',
    enunciado: 'Texto: \'A química analítica é fundamental para o controle de qualidade na indústria do petróleo. Através de técnicas precisas, é possível determinar a composição de amostras e garantir que os produtos atendam às especificações técnicas.\' O texto tem como objetivo principal:',
    alternativas: ['Criticar os métodos analíticos', 'Explicar a importância da química analítica', 'Descrever técnicas de refino', 'Comparar métodos instrumentais', 'Apresentar dados estatísticos'],
    correta: 1, explicacao: 'O texto destaca a importância da química analítica no controle de qualidade da indústria do petróleo, afirmando que técnicas precisas permitem determinar a composição e garantir especificações.' },
  { id: 90, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Fácil',
    enunciado: 'Considere a frase: \'O técnico em química desempenha um papel crucial na indústria, pois é responsável pela realização de análises que garantem a qualidade dos produtos.\' A palavra \'crucial\' pode ser substituída, sem alteração de sentido, por:',
    alternativas: ['Opcional', 'Secundário', 'Fundamental', 'Periférico', 'Supérfluo'],
    correta: 2, explicacao: '\'Crucial\' significa \'decisivo\', \'fundamental\', \'essencial\'. A substituição por \'fundamental\' preserva o sentido original da frase.' },
  { id: 91, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Médio',
    enunciado: 'Na frase \'Embora o experimento tenha sido bem planejado, os resultados não foram conclusivos\', a conjunção \'embora\' expressa uma ideia de:',
    alternativas: ['Causa', 'Consequência', 'Concessão', 'Condição', 'Finalidade'],
    correta: 2, explicacao: '\'Embora\' é uma conjunção concessiva, indicando um fato que se contrapõe à ideia principal, mas não a impede. Expressa concessão (oposição com quebra de expectativa).' },
  { id: 92, materia: 'Português', grupo: 'Ortografia e Acentuação', dificuldade: 'Médio',
    enunciado: 'Assinale a alternativa em que há erro de ortografia:',
    alternativas: ['Análise', 'Parâmetro', 'Excessão', 'Item', 'Técnico'],
    correta: 2, explicacao: 'A grafia correta é \'exceção\' (com \'ç\', não \'ss\'). \'Excesso\' é uma palavra diferente (que significa abundância). \'Exceção\' deriva de \'exceção\' do verbo \'exceder\'.' },
  { id: 93, materia: 'Português', grupo: 'Ortografia e Acentuação', dificuldade: 'Médio',
    enunciado: 'Assinale a alternativa em que ambas as palavras são acentuadas por serem proparoxítonas:',
    alternativas: ['Análise e sólido', 'Fácil e caráter', 'Álcool e nível', 'Útil e tórax', 'Próton e nuvem'],
    correta: 0, explicacao: '\'Análise\' e \'sólido\' são proparoxítonas (antepenúltima sílaba tônica). \'Fácil\' e \'caráter\' são paroxítonas. \'Álcool\' é paroxítona. \'Útil\' é paroxítona. \'Próton\' é paroxítona. \'Nuvem\' não recebe acento.' },
  { id: 94, materia: 'Português', grupo: 'Morfologia', dificuldade: 'Fácil',
    enunciado: 'Na frase \'O trabalho do técnico é muito importante para a segurança do processo\', a palavra \'importante\' é classificada como:',
    alternativas: ['Substantivo', 'Advérbio', 'Adjetivo', 'Verbo', 'Preposição'],
    correta: 2, explicacao: '\'Importante\' caracteriza o substantivo \'trabalho\', atribuindo-lhe uma qualidade. Portanto, é um adjetivo.' },
  { id: 95, materia: 'Português', grupo: 'Morfologia', dificuldade: 'Médio',
    enunciado: 'Em \'O técnico realizou a análise cuidadosamente\', a palavra \'cuidadosamente\' é formada pelo processo de:',
    alternativas: ['Derivação prefixal', 'Derivação sufixal', 'Derivação parassintética', 'Composição por justaposição', 'Composição por aglutinação'],
    correta: 1, explicacao: '\'Cuidadosamente\' é formada por derivação sufixal: adiciona-se o sufixo \'-mente\' ao adjetivo \'cuidadoso\' (que já deriva de \'cuidado\' + sufixo \'-oso\').' },
  { id: 96, materia: 'Português', grupo: 'Sintaxe', dificuldade: 'Difícil',
    enunciado: 'Assinale a alternativa em que o termo destacado exerce função de adjunto adnominal:',
    alternativas: ['O técnico **da Petrobras** é qualificado', 'Precisamos **de técnicos** especializados', 'O laboratório **tem equipamentos** modernos', 'Os frascos **estão** limpos', 'A análise **foi concluída** com sucesso'],
    correta: 0, explicacao: '\'da Petrobras\' é adjunto adnominal, pois caracteriza o substantivo \'técnico\', indicando a qual empresa pertence. Adjunto adnominal acompanha o substantivo concreto ou abstrato.' },
  { id: 97, materia: 'Português', grupo: 'Sintaxe', dificuldade: 'Difícil',
    enunciado: 'Na frase \'O supervisor solicitou ao técnico que refizesse a análise\', a oração \'que refizesse a análise\' classifica-se como:',
    alternativas: ['Oração subordinada substantiva objetiva direta', 'Oração subordinada substantiva objetiva indireta', 'Oração subordinada substantiva completiva nominal', 'Oração subordinada adjetiva explicativa', 'Oração subordinada adverbial final'],
    correta: 0, explicacao: 'O verbo \'solicitar\' é transitivo direto e indireto (solicitar algo a alguém). \'que refizesse a análise\' é o objeto direto (completa o verbo sem preposição), funcionando como oração subordinada substantiva objetiva direta.' },
  { id: 98, materia: 'Português', grupo: 'Pontuação', dificuldade: 'Médio',
    enunciado: 'Assinale a alternativa em que o uso dos dois-pontos está correto:',
    alternativas: ['O técnico trouxe: os equipamentos e as amostras', 'O laboratório possui: vidrarias, reagentes e equipamentos', 'O resultado foi: conclusivo', 'O técnico perguntou: a análise está correta?', 'São necessários: precisão e cuidado nas análises'],
    correta: 3, explicacao: 'Os dois-pontos são usados corretamente para introduzir uma fala ou citação (discurso direto). Nas demais opções, os dois-pontos são desnecessários ou incorretos.' },
  { id: 99, materia: 'Português', grupo: 'Concordância e Regência', dificuldade: 'Difícil',
    enunciado: 'Assinale a alternativa correta quanto à regência verbal:',
    alternativas: ['Assistiu o filme com atenção', 'Preferiu estudar química do que matemática', 'Custou a entender o procedimento', 'Obedece o regulamento da empresa', 'Aspirou o cargo de supervisor'],
    correta: 2, explicacao: 'O verbo \'custar\' no sentido de \'ser difícil\' rege preposição \'a\': \'Custou a entender\'. \'Assistir\' no sentido de \'ver\' rege \'a\': \'Assistiu ao filme\'. \'Preferir\' não admite \'do que\': \'Preferiu estudar química a matemática\'. \'Obedecer\' rege \'a\'. \'Aspirar\' no sentido de \'almejar\' rege \'a\'.' },
  { id: 100, materia: 'Português', grupo: 'Concordância e Regência', dificuldade: 'Difícil',
    enunciado: 'Assinale a alternativa em que a concordância nominal está correta:',
    alternativas: ['É proibido a entrada de pessoas estranhas', 'É necessária paciência para fazer análises', 'Há menas pessoas hoje no laboratório', 'As amostras estão incluso no relatório', 'São bastantes as análises realizadas'],
    correta: 4, explicacao: '\'Bastantes\' (plural) concorda com \'análises\' - está correto quando significa \'suficientes\' ou \'muitas\'. \'É proibido\' fica invariável sem artigo. \'É necessária\' varia com artigo - correto seria \'É necessária a paciência\'. \'Menos\' é invariável. \'Incluso\' concorda: \'inclusas\'.' },
  { id: 101, materia: 'Matemática', grupo: 'Aritmética e Problemas', dificuldade: 'Médio',
    enunciado: 'Em uma indústria, 3 máquinas produzem 1200 peças em 4 horas. Quantas peças 5 máquinas produzirão em 6 horas, mantendo o mesmo ritmo de produção?',
    alternativas: ['2.000', '2.400', '3.000', '3.600', '4.800'],
    correta: 2, explicacao: 'Regra de três composta: 3 máqu × 4 h = 1200 peças; 5 máq × 6 h = X. X = 1200 × (5/3) × (6/4) = 1200 × 5/3 × 3/2 = 1200 × 5/2 = 3000 peças.' },
  { id: 102, materia: 'Matemática', grupo: 'Aritmética e Problemas', dificuldade: 'Difícil',
    enunciado: 'Um tanque de 5.000 L é preenchido por duas torneiras. A primeira enche o tanque em 5 horas e a segunda em 8 horas. Se as duas torneiras forem abertas simultaneamente, em quanto tempo o tanque estará cheio?',
    alternativas: ['2h08min', '3h05min', '3h25min', '4h00min', '6h30min'],
    correta: 0, explicacao: 'Vazão: T1 = 5000/5 = 1000 L/h, T2 = 5000/8 = 625 L/h. Vazão total = 1625 L/h. Tempo = 5000/1625 = 3,0769 h = 3h + 0,0769×60 = 3h04,6min ≈ 3h05min.' },
  { id: 103, materia: 'Matemática', grupo: 'Geometria', dificuldade: 'Médio',
    enunciado: 'Uma empresa precisa pintar um reservatório esférico de raio 3 m. Qual é a área da superfície a ser pintada? (Use π = 3,14)',
    alternativas: ['84,78 m²', '113,04 m²', '150,72 m²', '200,96 m²', '254,34 m²'],
    correta: 1, explicacao: 'Área da superfície esférica: A = 4πr² = 4 × 3,14 × 9 = 4 × 28,26 = 113,04 m².' },
  { id: 104, materia: 'Matemática', grupo: 'Geometria', dificuldade: 'Médio',
    enunciado: 'Um técnico precisa calcular o volume de um cone com raio da base 4 cm e altura 12 cm. O volume é: (Use π = 3,14)',
    alternativas: ['100,48 cm³', '150,72 cm³', '200,96 cm³', '251,20 cm³', '301,44 cm³'],
    correta: 2, explicacao: 'Volume do cone: V = (1/3) × π × r² × h = (1/3) × 3,14 × 16 × 12 = (1/3) × 602,88 = 200,96 cm³.' },
  { id: 105, materia: 'Matemática', grupo: 'Estatística', dificuldade: 'Fácil',
    enunciado: 'As temperaturas máximas registradas em uma semana foram: 28°C, 30°C, 27°C, 31°C, 29°C, 28°C, 32°C. A amplitude térmica dessa semana é:',
    alternativas: ['3°C', '4°C', '5°C', '6°C', '7°C'],
    correta: 2, explicacao: 'Amplitude = valor máximo - valor mínimo = 32 - 27 = 5°C.' },
  { id: 106, materia: 'Matemática', grupo: 'Estatística', dificuldade: 'Médio',
    enunciado: 'O desvio padrão de um conjunto de dados mede:',
    alternativas: ['A média dos valores', 'O valor central', 'A dispersão dos dados em relação à média', 'O valor mais frequente', 'A diferença entre máximo e mínimo'],
    correta: 2, explicacao: 'O desvio padrão é uma medida de dispersão que quantifica o quanto os valores de um conjunto se afastam da média aritmética. Quanto maior o desvio padrão, maior a variabilidade dos dados.' },
  { id: 107, materia: 'Matemática', grupo: 'Probabilidade', dificuldade: 'Fácil',
    enunciado: 'Em um lote de 50 amostras, 5 estão contaminadas. Se um técnico escolher uma amostra ao acaso, a probabilidade de ela estar contaminada é:',
    alternativas: ['5%', '8%', '10%', '12%', '15%'],
    correta: 2, explicacao: 'Probabilidade = casos favoráveis / casos possíveis = 5/50 = 0,10 = 10%.' },
  { id: 108, materia: 'Matemática', grupo: 'Probabilidade', dificuldade: 'Médio',
    enunciado: 'Uma moeda é lançada três vezes. A probabilidade de obter exatamente duas caras é:',
    alternativas: ['1/8', '3/8', '1/2', '5/8', '3/4'],
    correta: 1, explicacao: 'Total de resultados possíveis: 2³ = 8. Resultados com exatamente 2 caras: C C K, C K C, K C C (3 combinações). Probabilidade = 3/8.' },
  { id: 109, materia: 'Matemática', grupo: 'Funções', dificuldade: 'Fácil',
    enunciado: 'O domínio da função real f(x) = 1/(x-3) é:',
    alternativas: ['Todos os números reais', 'Todos os reais exceto x = 0', 'Todos os reais exceto x = 3', 'Todos os reais exceto x = -3', 'Apenas x > 3'],
    correta: 2, explicacao: 'O denominador não pode ser zero: x - 3 ≠ 0 → x ≠ 3. Portanto, o domínio é ℝ - {3}.' },
  { id: 110, materia: 'Matemática', grupo: 'Funções', dificuldade: 'Médio',
    enunciado: 'Se f(x) = 2x + 5 e g(x) = x², então f(g(3)) é igual a:',
    alternativas: ['11', '14', '18', '23', '36'],
    correta: 3, explicacao: 'g(3) = 3² = 9. f(g(3)) = f(9) = 2×9 + 5 = 18 + 5 = 23.' },
  { id: 111, materia: 'Matemática', grupo: 'Matemática Financeira', dificuldade: 'Médio',
    enunciado: 'Um equipamento de laboratório custa R$ 50.000,00 à vista. Se for financiado em 12 parcelas mensais iguais a uma taxa de juros simples de 2% ao mês, o valor de cada parcela será:',
    alternativas: ['R$ 4.166,67', 'R$ 5.000,00', 'R$ 5.166,67', 'R$ 6.000,00', 'R$ 6.200,00'],
    correta: 2, explicacao: 'Juros totais: J = C×i×t = 50.000 × 0,02 × 12 = 12.000. Montante = 50.000 + 12.000 = 62.000. Parcela = 62.000 / 12 = 5.166,67.' },
  { id: 112, materia: 'Matemática', grupo: 'Matemática Financeira', dificuldade: 'Médio',
    enunciado: 'Um investimento de R$ 10.000,00 a juros compostos de 5% ao ano durante 2 anos gerará um montante de:',
    alternativas: ['R$ 11.000,00', 'R$ 11.025,00', 'R$ 11.250,00', 'R$ 12.000,00', 'R$ 12.500,00'],
    correta: 1, explicacao: 'M = C(1+i)^t = 10.000 × (1+0,05)² = 10.000 × 1,1025 = 11.025,00.' },
  { id: 113, materia: 'Química', grupo: 'Exploração e Produção', dificuldade: 'Médio',
    enunciado: 'No método de recuperação secundária de petróleo, utiliza-se a injeção de:',
    alternativas: ['Ácido clorídrico para dissolver rochas', 'Água ou gás para manter a pressão do reservatório', 'Vapor d\'água para aquecer o óleo', 'Polímeros para aumentar a viscosidade do óleo', 'Solventes orgânicos para diluir o petróleo'],
    correta: 1, explicacao: 'A recuperação secundária envolve a injeção de água (waterflooding) ou gás natural para manter a pressão do reservatório e deslocar o óleo em direção aos poços produtores.' },
  { id: 114, materia: 'Química', grupo: 'Processamento Primário', dificuldade: 'Médio',
    enunciado: 'A função dos separadores gás-líquido no processamento primário do petróleo é:',
    alternativas: ['Aquecer o petróleo para destilação', 'Separar o gás natural do óleo e da água', 'Remover enxofre do gás natural', 'Comprimir o gás para transporte', 'Fracionar o petróleo em derivados'],
    correta: 1, explicacao: 'Os separadores gás-líquido são vasos de pressão que separam a fase gasosa das fases líquidas (óleo e água) por diferença de densidade, logo após a extração do petróleo.' },
  { id: 115, materia: 'Química', grupo: 'Refino - Operações Básicas', dificuldade: 'Fácil',
    enunciado: 'Na torre de destilação atmosférica, o resíduo atmosférico é retirado:',
    alternativas: ['Do topo da torre', 'Do meio da torre', 'Do fundo da torre', 'De um estágio intermediário', 'De laterais da torre'],
    correta: 2, explicacao: 'O resíduo atmosférico é a fração mais pesada, com maior ponto de ebulição, sendo retirada do fundo da torre de destilação atmosférica.' },
  { id: 116, materia: 'Química', grupo: 'Refino - Conversão', dificuldade: 'Médio',
    enunciado: 'O processo de reforma catalítica tem como objetivo principal:',
    alternativas: ['Produzir diesel de alta qualidade', 'Aumentar o número de octano da gasolina', 'Remover enxofre dos derivados', 'Craquear moléculas pesadas', 'Produzir GLP'],
    correta: 1, explicacao: 'A reforma catalítica converte nafta de baixa octanagem em gasolina de alta octanagem, através de reações de desidrogenação, isomerização e ciclização de hidrocarbonetos.' },
  { id: 117, materia: 'Química', grupo: 'Blend de Produtos', dificuldade: 'Fácil',
    enunciado: 'O diesel S-10 e S-500 diferem principalmente no teor de:',
    alternativas: ['Enxofre', 'Nitrogênio', 'Oxigênio', 'Carbono', 'Hidrogênio'],
    correta: 0, explicacao: 'S-10 significa teor máximo de 10 ppm de enxofre, enquanto S-500 tem até 500 ppm. A redução do enxofre no diesel visa diminuir emissões poluentes e atender às legislações ambientais.' },
  { id: 118, materia: 'Química', grupo: 'Legislação de SSH', dificuldade: 'Médio',
    enunciado: 'A NR-20 estabelece requisitos para segurança no trabalho com:',
    alternativas: ['Produtos químicos em geral', 'Inflamáveis e combustíveis', 'Eletricidade', 'Máquinas e equipamentos', 'Trabalho em altura'],
    correta: 1, explicacao: 'A NR-20 dispõe sobre segurança e saúde no trabalho com inflamáveis e combustíveis, abrangendo armazenamento, manuseio e transporte desses produtos.' },
  { id: 119, materia: 'Química', grupo: 'Identificação de Riscos', dificuldade: 'Fácil',
    enunciado: 'O Mapa de Riscos é uma representação gráfica dos riscos presentes em cada setor de trabalho. Os riscos biológicos são representados pela cor:',
    alternativas: ['Verde', 'Vermelha', 'Marrom', 'Amarela', 'Azul'],
    correta: 2, explicacao: 'Convenção do Mapa de Riscos: verde = físico, vermelho = químico, marrom = biológico, amarelo = ergonômico, azul = mecânico/acidente.' },
  { id: 120, materia: 'Química', grupo: 'Controle e Mitigação', dificuldade: 'Médio',
    enunciado: 'No combate a incêndios, a extinção por abafamento consiste em:',
    alternativas: ['Resfriar o combustível', 'Retirar o oxigênio do ambiente', 'Retirar o material combustível', 'Interromper a reação em cadeia', 'Aumentar a concentração de oxigênio'],
    correta: 1, explicacao: 'O método de abafamento remove o oxigênio (comburente) do tetraedro do fogo, impedindo a combustão. Ex: uso de extintores de CO₂ ou espuma mecânica.' },
  { id: 121, materia: 'Química', grupo: 'Saúde Ocupacional', dificuldade: 'Difícil',
    enunciado: 'O Programa de Prevenção de Riscos Ambientais (PPRA) foi substituído pelo:',
    alternativas: ['PCMSO', 'PGR (Programa de Gerenciamento de Riscos)', 'LTCAT', 'DSQ', 'E-Social'],
    correta: 1, explicacao: 'A NR-01 (2022) substituiu o PPRA pelo PGR (Programa de Gerenciamento de Riscos), que integra a gestão de riscos ocupacionais em um documento único e interligado.' },
  { id: 122, materia: 'Química', grupo: 'Sistemas de Gestão SSH', dificuldade: 'Fácil',
    enunciado: 'A norma ISO 14001 trata do sistema de gestão:',
    alternativas: ['Da qualidade', 'Ambiental', 'De saúde e segurança', 'De energia', 'De responsabilidade social'],
    correta: 1, explicacao: 'A ISO 14001 estabelece requisitos para um Sistema de Gestão Ambiental (SGA), ajudando organizações a melhorar seu desempenho ambiental.' },
  { id: 123, materia: 'Química', grupo: 'Fundamentos de Metrologia', dificuldade: 'Difícil',
    enunciado: 'A rastreabilidade metrológica é a propriedade de um resultado de medição que permite sua relação com um:',
    alternativas: ['Valor médio do laboratório', 'Padrão primário ou referência nacional/internacional', 'Resultado de outra medição qualquer', 'Valor nominal do instrumento', 'Limite de tolerância do processo'],
    correta: 1, explicacao: 'Rastreabilidade metrológica é a propriedade do resultado de uma medição que o relaciona a uma referência estabelecida (padrão primário), através de uma cadeia contínua de comparações.' },
  { id: 124, materia: 'Química', grupo: 'Instrumentação Analítica', dificuldade: 'Fácil',
    enunciado: 'O princípio de funcionamento do espectrofotômetro UV-Vis baseia-se na:',
    alternativas: ['Emissão de luz pela amostra', 'Absorção de luz pela amostra', 'Reflexão de luz pela amostra', 'Difração de luz pela amostra', 'Refração de luz pela amostra'],
    correta: 1, explicacao: 'O espectrofotômetro UV-Vis mede a quantidade de luz absorvida pela amostra em diferentes comprimentos de onda, seguindo a lei de Beer-Lambert.' },
  { id: 125, materia: 'Química', grupo: 'Instrumentação Analítica', dificuldade: 'Médio',
    enunciado: 'A calibração de um termômetro envolve:',
    alternativas: ['Ajustar o ponteiro para zero', 'Comparar suas indicações com um padrão de referência', 'Trocar o sensor de temperatura', 'Limpar o bulbo do termômetro', 'Aquecer até a temperatura máxima'],
    correta: 1, explicacao: 'Calibração é o processo de comparação das indicações de um instrumento com um padrão de referência, documentando as diferenças (correções) para garantir a precisão das medições.' },
  { id: 126, materia: 'Química', grupo: 'Controle de Qualidade em Processo', dificuldade: 'Médio',
    enunciado: 'Um gráfico de controle para monitorar a média de um processo é chamado de gráfico:',
    alternativas: ['Gráfico p', 'Gráfico c', 'Gráfico X-barra', 'Gráfico u', 'Gráfico np'],
    correta: 2, explicacao: 'O gráfico X-barra (x̄) é utilizado para monitorar a média de uma característica de qualidade de um processo ao longo do tempo. Os limites são baseados na distribuição das médias amostrais.' },
  { id: 127, materia: 'Química', grupo: 'Estatística aplicada à Qualidade', dificuldade: 'Difícil',
    enunciado: 'A capacidade de um processo (Cp) é calculada como:',
    alternativas: ['(LSC - LIC) / 6σ', '(LSE - LIE) / 6σ', '(média - LIE) / 3σ', '(LSE - média) / 3σ', '6σ / (LSE - LIE)'],
    correta: 1, explicacao: 'Cp = (LSE - LIE) / 6σ, onde LSE = limite superior de especificação, LIE = limite inferior de especificação, σ = desvio padrão do processo. Cp > 1 indica processo capaz.' },
  { id: 128, materia: 'Química', grupo: 'Sistemas de Qualidade (ISO)', dificuldade: 'Médio',
    enunciado: 'Na ISO 9001:2015, a abordagem baseada em risco significa:',
    alternativas: ['Eliminar todos os riscos do processo', 'Identificar e tratar riscos que possam afetar a conformidade dos produtos', 'Ignorar riscos com baixa probabilidade', 'Terceirizar atividades de risco', 'Aumentar o número de auditorias'],
    correta: 1, explicacao: 'A abordagem baseada em risco na ISO 9001:2015 requer que a organização identifique riscos e oportunidades relacionados ao SGQ, implementando ações para tratar esses riscos.' },
  { id: 129, materia: 'Química', grupo: 'Técnicas de Laboratório', dificuldade: 'Médio',
    enunciado: 'Para medir com precisão 25,0 mL de uma solução, o instrumento mais adequado é:',
    alternativas: ['Béquer de 50 mL', 'Proveta de 50 mL', 'Pipeta volumétrica de 25 mL', 'Balão volumétrico de 25 mL', 'Erlenmeyer de 125 mL'],
    correta: 2, explicacao: 'A pipeta volumétrica (ou pipeta de transferência) é o instrumento mais preciso para medir volumes fixos de líquidos. Provetas são menos precisas. Balões volumétricos são para preparo de soluções, não para transferência.' },
  { id: 130, materia: 'Química', grupo: 'Técnicas de Laboratório', dificuldade: 'Fácil',
    enunciado: 'Ao utilizar uma balança analítica, o técnico deve:',
    alternativas: ['Pesar diretamente sobre o prato sem recipiente', 'Fechar as portas da câmara de pesagem antes de ler', 'Tocar os pesos com as mãos diretamente', 'Pesar substâncias quentes', 'Usar a balança sem nivelamento'],
    correta: 1, explicacao: 'Ao usar balança analítica, deve-se fechar as portas da câmara para evitar correntes de ar que afetam a leitura. A amostra deve estar em recipiente adequado, à temperatura ambiente, e a balança deve estar nivelada.' },
  { id: 131, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Fácil',
    enunciado: 'Texto: \'A segurança em laboratórios químicos não é apenas uma exigência legal, mas um compromisso ético do profissional. Cada procedimento deve ser executado com consciência dos riscos envolvidos.\' A ideia principal do texto é que a segurança:',
    alternativas: ['É opcional em laboratórios', 'É apenas uma exigência burocrática', 'Deve ser tratada como compromisso ético e técnico', 'Limita a produtividade do laboratório', 'É responsabilidade exclusiva do supervisor'],
    correta: 2, explicacao: 'O texto afirma que a segurança é \'não apenas uma exigência legal, mas um compromisso ético\', destacando que cada procedimento deve ser executado com consciência dos riscos.' },
  { id: 132, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Médio',
    enunciado: 'Na frase \'O técnico não apenas realizou as análises, como também registrou os resultados no sistema\', a expressão \'não apenas... como também\' estabelece relação de:',
    alternativas: ['Alternância', 'Adição', 'Oposição', 'Conclusão', 'Explicação'],
    correta: 1, explicacao: 'A expressão \'não apenas... como também\' é uma conjunção correlativa que indica adição de informações, equivalendo a \'e\', \'além disso\'.' },
  { id: 133, materia: 'Matemática', grupo: 'Geometria', dificuldade: 'Médio',
    enunciado: 'Um engenheiro precisa calcular a área de um triângulo equilátero com lado igual a 10 cm. Qual é a área desse triângulo? (Use √3 = 1,73)',
    alternativas: ['40,25 cm²', '43,25 cm²', '48,50 cm²', '50,00 cm²', '86,50 cm²'],
    correta: 1, explicacao: 'Área do triângulo equilátero: A = (L²√3)/4 = (100 × 1,73)/4 = 173/4 = 43,25 cm².' },
  { id: 134, materia: 'Matemática', grupo: 'Estatística', dificuldade: 'Médio',
    enunciado: 'O coeficiente de variação (CV) de um conjunto de dados com média 50 e desvio padrão 10 é:',
    alternativas: ['10%', '20%', '25%', '40%', '50%'],
    correta: 1, explicacao: 'CV = (desvio padrão / média) × 100% = (10/50) × 100% = 20%. O CV é uma medida de dispersão relativa.' },
  { id: 135, materia: 'Química', grupo: 'Soluções', dificuldade: 'Fácil',
    enunciado: 'Uma solução de HNO₃ 0,01 mol/L tem pH aproximadamente igual a:',
    alternativas: ['1', '2', '3', '4', '5'],
    correta: 1, explicacao: 'HNO₃ é ácido forte, dissocia-se completamente. [H⁺] = 0,01 M = 10⁻² M. pH = -log(10⁻²) = 2.' },
  { id: 136, materia: 'Química', grupo: 'Equilíbrio Químico', dificuldade: 'Difícil',
    enunciado: 'O Kps do AgCl é 1,8×10⁻¹⁰ a 25°C. A solubilidade molar do AgCl em água pura é aproximadamente:',
    alternativas: ['1,3×10⁻⁵ M', '1,8×10⁻¹⁰ M', '9,0×10⁻⁶ M', '1,8×10⁻⁵ M', '3,6×10⁻¹⁰ M'],
    correta: 0, explicacao: 'AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq). Kps = s² → s = √Kps = √(1,8×10⁻¹⁰) = 1,34×10⁻⁵ M ≈ 1,3×10⁻⁵ M.' },
  { id: 137, materia: 'Química', grupo: 'Termoquímica', dificuldade: 'Médio',
    enunciado: 'Dada a reação: C(s) + O₂(g) → CO₂(g) ΔH = -393,5 kJ. Qual é a entalpia de formação do CO₂?',
    alternativas: ['Zero', '+393,5 kJ/mol', '-393,5 kJ/mol', '-196,75 kJ/mol', '+196,75 kJ/mol'],
    correta: 2, explicacao: 'A entalpia de formação do CO₂ é a variação de entalpia na formação de 1 mol de CO₂ a partir de seus elementos no estado padrão, que é exatamente -393,5 kJ/mol.' },
  { id: 138, materia: 'Química', grupo: 'Exploração e Produção', dificuldade: 'Difícil',
    enunciado: 'A perfilagem de poços é uma técnica utilizada para:',
    alternativas: ['Perfurar o poço até o reservatório', 'Obter informações geológicas e físicas das formações atravessadas', 'Cimentar o revestimento do poço', 'Instalar a árvore de natal', 'Realizar testes de produção'],
    correta: 1, explicacao: 'A perfilagem (well logging) consiste no registro contínuo de propriedades físicas das rochas ao longo do poço, fornecendo dados sobre litologia, porosidade, saturação de fluidos, etc.' },
  { id: 139, materia: 'Química', grupo: 'Identificação de Riscos', dificuldade: 'Fácil',
    enunciado: 'A FISPQ (Ficha de Informações de Segurança de Produtos Químicos) contém informações sobre:',
    alternativas: ['Apenas o preço do produto químico', 'Riscos, manuseio, armazenamento e medidas de emergência', 'A data de fabricação do produto', 'O nome do fabricante somente', 'A composição nutricional'],
    correta: 1, explicacao: 'A FISPQ (ou SDS - Safety Data Sheet) é um documento que fornece informações completas sobre os perigos de um produto químico, incluindo riscos à saúde, medidas de primeiros socorros, combate a incêndio, armazenamento, etc.' },
  { id: 140, materia: 'Química', grupo: 'Fundamentos de Metrologia', dificuldade: 'Médio',
    enunciado: 'A resolução de um instrumento de medição é:',
    alternativas: ['A menor divisão da escala do instrumento', 'O erro máximo permitido', 'A faixa de medição do instrumento', 'A precisão do operador', 'O tempo de resposta do instrumento'],
    correta: 0, explicacao: 'Resolução é a menor variação do mensurando que causa uma variação perceptível na indicação do instrumento. Geralmente é a menor divisão da escala ou o menor dígito significativo do display.' },
  { id: 141, materia: 'Química', grupo: 'Reações Inorgânicas', dificuldade: 'Difícil',
    enunciado: 'Na reação de decomposição: 2 KClO₃(s) → 2 KCl(s) + 3 O₂(g), o cloro (Cl) sofre:',
    alternativas: ['Oxidação', 'Redução', 'Não altera seu NOX', 'Sublimação', 'Neutralização'],
    correta: 2, explicacao: 'No KClO₃, o NOX do Cl é +5. No KCl, o NOX do Cl é -1. O NOX do Cl diminui de +5 para -1, indicando redução. O oxigênio oxida de -2 para 0.' },
  { id: 142, materia: 'Química', grupo: 'Química Orgânica - Nomenclatura', dificuldade: 'Médio',
    enunciado: 'O composto CH₃-CH₂-CH(CH₃)-CH₂-CH₃ é chamado de:',
    alternativas: ['Heptano', '3-metilexano', '3-metilpentano', '2-metilexano', '2-metilpentano'],
    correta: 1, explicacao: 'A cadeia principal tem 6 carbonos (hexano) com um grupamento metil no carbono 3. O nome IUPAC é 3-metilexano.' },
  { id: 143, materia: 'Química', grupo: 'Cinética Química', dificuldade: 'Difícil',
    enunciado: 'Para uma reação de ordem zero, a velocidade da reação:',
    alternativas: ['Aumenta com o tempo', 'Diminui com o tempo', 'É constante e independente da concentração', 'Depende da concentração ao quadrado', 'Depende do ln da concentração'],
    correta: 2, explicacao: 'Em reações de ordem zero, a velocidade é constante e não depende da concentração dos reagentes. A lei de velocidade é v = k, onde k é a constante de velocidade.' },
  { id: 144, materia: 'Português', grupo: 'Concordância e Regência', dificuldade: 'Médio',
    enunciado: 'Assinale a alternativa INCORRETA quanto à concordância:',
    alternativas: ['A maioria dos técnicos aprovou a mudança', 'Havia muitos problemas no relatório', 'Fazem três anos que ele trabalha aqui', 'Existem várias alternativas viáveis', 'Bastaram algumas horas para concluir'],
    correta: 2, explicacao: 'O verbo \'fazer\' indicando tempo decorrido é impessoal, permanecendo no singular: \'Faz três anos que ele trabalha aqui\'.' },
  { id: 145, materia: 'Matemática', grupo: 'Aritmética e Problemas', dificuldade: 'Fácil',
    enunciado: 'Uma liga metálica contém cobre e zinco na proporção de 3:2. Se a massa total da liga é 250 g, a massa de cobre presente é:',
    alternativas: ['100 g', '125 g', '150 g', '175 g', '200 g'],
    correta: 2, explicacao: 'Total de partes = 3 + 2 = 5. Cada parte corresponde a 250/5 = 50 g. Massa de cobre = 3 × 50 = 150 g.' },
  { id: 146, materia: 'Química', grupo: 'Eletroquímica', dificuldade: 'Médio',
    enunciado: 'Na corrosão do ferro (ferrugem), o ferro metálico sofre:',
    alternativas: ['Redução, formando Fe²⁺', 'Oxidação, formando Fe²⁺ ou Fe³⁺', 'Redução, formando Fe⁰', 'Sublimação', 'Neutralização'],
    correta: 1, explicacao: 'Na corrosão, o ferro metálico (Fe⁰) perde elétrons, sofrendo oxidação para formar íons Fe²⁺ ou Fe³⁺, que posteriormente reagem com oxigênio e água formando os óxidos de ferro (ferrugem).' },
  { id: 147, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Difícil',
    enunciado: 'A tensão superficial da água é maior que a do etanol porque:',
    alternativas: ['A água tem menor massa molar', 'A água forma ligações de hidrogênio mais intensas', 'O etanol é apolar', 'A água tem menor ponto de ebulição', 'O etanol tem maior viscosidade'],
    correta: 1, explicacao: 'A água possui ligações de hidrogênio muito intensas entre suas moléculas, resultando em alta tensão superficial. O etanol também forma ligações de hidrogênio, mas estas são menos intensas devido à cadeia carbônica.' },
  { id: 148, materia: 'Química', grupo: 'Refino - Conversão', dificuldade: 'Médio',
    enunciado: 'A hidrodessulfurização (HDS) é um processo que:',
    alternativas: ['Adiciona enxofre aos derivados', 'Remove enxofre dos derivados de petróleo na presença de hidrogênio', 'Converte diesel em gasolina', 'Separa frações por ponto de ebulição', 'Produz lubrificantes'],
    correta: 1, explicacao: 'A HDS remove enxofre dos derivados de petróleo (especialmente diesel e gasolina) através da reação com hidrogênio a altas temperaturas e pressões, formando H₂S que é posteriormente removido.' },
  { id: 149, materia: 'Química', grupo: 'Saúde Ocupacional', dificuldade: 'Médio',
    enunciado: 'A NR-07 estabelece a obrigatoriedade de:',
    alternativas: ['Programa de Conservação Auditiva', 'Programa de Controle Médico de Saúde Ocupacional', 'Programa de Proteção Respiratória', 'Programa de Prevenção de Riscos', 'Análise Ergonômica do Trabalho'],
    correta: 1, explicacao: 'A NR-07 (PCMSO - Programa de Controle Médico de Saúde Ocupacional) estabelece a obrigatoriedade de realização de exames médicos admissionais, periódicos, de retorno ao trabalho, de mudança de função e demissionais.' },
  { id: 150, materia: 'Química', grupo: 'Sistemas de Qualidade (ISO)', dificuldade: 'Fácil',
    enunciado: 'A melhoria contínua, princípio fundamental das normas ISO, é operacionalizada através do ciclo:',
    alternativas: ['PDCA (Plan-Do-Check-Act)', '5W2H', 'SWOT', 'Brainstorming', 'Benchmarking'],
    correta: 0, explicacao: 'O ciclo PDCA (Planejar, Executar, Verificar, Agir) é a ferramenta básica para implementar a melhoria contínua nos sistemas de gestão, conforme as normas ISO 9001, 14001 e 45001.' },
  { id: 151, materia: 'Química', grupo: 'Química Orgânica - Isomeria', dificuldade: 'Médio',
    enunciado: 'Os compostos cis-2-buteno e trans-2-buteno são exemplos de:',
    alternativas: ['Isômeros de cadeia', 'Isômeros de posição', 'Isômeros de função', 'Isômeros geométricos', 'Isômeros ópticos'],
    correta: 3, explicacao: 'Isomeria geométrica (cis-trans) ocorre em compostos com dupla ligação onde cada carbono da dupla está ligado a dois substituintes diferentes. A diferença está na disposição espacial dos grupos.' },
  { id: 152, materia: 'Matemática', grupo: 'Análise Combinatória e Probabilidade', dificuldade: 'Médio',
    enunciado: 'Quantos anagramas diferentes podem ser formados com as letras da palavra \'TÉCNICO\'?',
    alternativas: ['720', '1.260', '2.520', '5.040', '10.080'],
    correta: 2, explicacao: 'TÉCNICO tem 7 letras, com repetição de C (2x). Anagramas = 7!/2! = 5040/2 = 2520.' },
  { id: 153, materia: 'Português', grupo: 'Morfologia', dificuldade: 'Difícil',
    enunciado: 'Na frase \'O técnico está meio cansado após o plantão\', a palavra \'meio\' é classificada como:',
    alternativas: ['Numeral', 'Substantivo', 'Advérbio', 'Adjetivo', 'Pronome'],
    correta: 2, explicacao: '\'Meio\' modifica o adjetivo \'cansado\', indicando intensidade (parcialmente). Nesse caso, é advérbio de intensidade e permanece invariável.' },
  { id: 154, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Médio',
    enunciado: 'Na potenciometria, o eletrodo de referência mais comumente utilizado é o:',
    alternativas: ['Eletrodo de vidro', 'Eletrodo de calomelano saturado (ECS)', 'Eletrodo de platina', 'Eletrodo de cobre', 'Eletrodo de ouro'],
    correta: 1, explicacao: 'O eletrodo de calomelano saturado (ECS) ou o eletrodo de prata/cloreto de prata (Ag/AgCl) são os eletrodos de referência mais utilizados em potenciometria.' },
  { id: 155, materia: 'Química', grupo: 'Substâncias e Propriedades', dificuldade: 'Fácil',
    enunciado: 'A água destilada é considerada:',
    alternativas: ['Uma mistura homogênea', 'Uma substância pura', 'Um coloide', 'Uma mistura heterogênea', 'Uma solução'],
    correta: 1, explicacao: 'A água destilada é uma substância pura (composta), pois contém apenas moléculas de H₂O, sem íons dissolvidos ou impurezas.' },
  { id: 156, materia: 'Matemática', grupo: 'Funções', dificuldade: 'Fácil',
    enunciado: 'A função f(x) = x² - 6x + 8 tem raízes:',
    alternativas: ['1 e 8', '2 e 4', '-2 e -4', '3 e 5', '0 e 6'],
    correta: 1, explicacao: 'x² - 6x + 8 = 0. Δ = 36 - 32 = 4. x = (6 ± 2)/2 → x₁ = 4, x₂ = 2.' },
  { id: 157, materia: 'Português', grupo: 'Reescritura e Problemas da Língua', dificuldade: 'Médio',
    enunciado: 'Transformando a frase \'O técnico resolveu o problema\' para a voz passiva analítica, obtém-se:',
    alternativas: ['O problema foi resolvido pelo técnico', 'O problema é resolvido pelo técnico', 'O problema será resolvido pelo técnico', 'O técnico foi resolvido pelo problema', 'Resolveu-se o problema pelo técnico'],
    correta: 0, explicacao: 'Voz passiva analítica: sujeito paciente (o problema) + verbo auxiliar (foi) + particípio (resolvido) + agente da passiva (pelo técnico).' },
  { id: 158, materia: 'Química', grupo: 'Estequiometria', dificuldade: 'Médio',
    enunciado: 'Na reação N₂ + 3 H₂ → 2 NH₃, qual a massa de amônia produzida a partir de 28 g de N₂? (Massas molares: N=14, H=1)',
    alternativas: ['17 g', '34 g', '51 g', '68 g', '85 g'],
    correta: 1, explicacao: '28 g N₂ = 1 mol (MM=28). Proporção: 1 mol N₂ → 2 mol NH₃. 2 mol NH₃ = 2 × 17 = 34 g de amônia.' },
  { id: 159, materia: 'Química', grupo: 'Soluções', dificuldade: 'Médio',
    enunciado: 'Uma solução 0,5 mol/L de H₂SO₄ tem concentração de íons H⁺ igual a:',
    alternativas: ['0,25 mol/L', '0,5 mol/L', '0,75 mol/L', '1,0 mol/L', '2,0 mol/L'],
    correta: 3, explicacao: 'H₂SO₄ é um ácido diprótico forte, cada molécula libera 2 H⁺. [H⁺] = 2 × 0,5 = 1,0 mol/L.' },
  { id: 160, materia: 'Química', grupo: 'Sistemas de Gestão SSH', dificuldade: 'Fácil',
    enunciado: 'A ISO 45001 é a norma internacional para:',
    alternativas: ['Gestão da Qualidade', 'Gestão Ambiental', 'Gestão de Saúde e Segurança Ocupacional', 'Gestão de Energia', 'Gestão de Risco'],
    correta: 2, explicacao: 'A ISO 45001:2018 estabelece requisitos para um Sistema de Gestão de Saúde e Segurança Ocupacional (SGSST), substituindo a OHSAS 18001.' },
  // ---- QUÍMICA (80 novas) ----
  { id: 161, materia: 'Química', grupo: 'Substâncias e Propriedades', dificuldade: 'Médio',
    enunciado: 'Um técnico recebeu uma amostra líquida incolor com densidade 0,79 g/mL, ponto de ebulição 78,5°C e ponto de fusão -114°C. Esses dados são compatíveis com:',
    alternativas: ['Água destilada', 'Etanol anidro', 'Acetona', 'Ácido sulfúrico diluído', 'Clorofórmio'],
    correta: 1, explicacao: 'O etanol anidro apresenta densidade 0,79 g/mL, ponto de ebulição 78,5°C e ponto de fusão -114°C, valores que correspondem exatamente aos medidos pelo técnico.' },
  { id: 162, materia: 'Química', grupo: 'Substâncias e Propriedades', dificuldade: 'Médio',
    enunciado: 'A cromatografia em camada delgada (CCD) é uma técnica de separação baseada principalmente na:',
    alternativas: ['Diferença de tamanho das partículas', 'Diferença de polaridade entre os compostos', 'Diferença de densidade', 'Volatilidade dos compostos', 'Condutividade elétrica'],
    correta: 1, explicacao: 'A CCD separa os compostos com base em suas diferentes polaridades e afinidades pela fase estacionária (sílica gel) e pela fase móvel (solvente).' },
  { id: 163, materia: 'Química', grupo: 'Substâncias e Propriedades', dificuldade: 'Fácil',
    enunciado: 'Uma substância que sublima à pressão atmosférica, passando diretamente do estado sólido para o gasoso, é:',
    alternativas: ['Gelo seco (CO₂ sólido)', 'Cloreto de sódio', 'Sacarose', 'Areia', 'Ferro'],
    correta: 0, explicacao: 'O gelo seco (CO₂ sólido) sublima a -78,5°C à pressão atmosférica, passando diretamente de sólido para gás sem passar pelo estado líquido.' },
  { id: 164, materia: 'Química', grupo: 'Substâncias e Propriedades', dificuldade: 'Difícil',
    enunciado: 'A viscosidade de um líquido diminui com o aumento da temperatura porque:',
    alternativas: ['As moléculas se tornam mais polares', 'As forças intermoleculares se enfraquecem com o aumento da energia cinética', 'A massa molar do líquido diminui', 'O líquido se expande e aumenta de volume', 'A tensão superficial aumenta'],
    correta: 1, explicacao: 'Com o aumento da temperatura, as moléculas adquirem maior energia cinética, superando mais facilmente as forças intermoleculares, o que reduz a viscosidade.' },
  { id: 165, materia: 'Química', grupo: 'Substâncias e Propriedades', dificuldade: 'Médio',
    enunciado: 'Um técnico precisa purificar um composto orgânico sólido que contém impurezas solúveis em água. O método mais adequado é:',
    alternativas: ['Destilação simples', 'Filtração a vácuo', 'Recristalização', 'Extração líquido-líquido', 'Cromatografia gasosa'],
    correta: 2, explicacao: 'A recristalização é o método mais adequado para purificar sólidos, baseando-se na diferença de solubilidade do composto e das impurezas em um solvente apropriado.' },
  { id: 166, materia: 'Química', grupo: 'Funções Inorgânicas', dificuldade: 'Fácil',
    enunciado: 'O ácido nítrico (HNO₃) é classificado, quanto à força, como:',
    alternativas: ['Ácido fraco, pois não ioniza completamente', 'Ácido forte, pois ioniza completamente em água', 'Ácido moderado', 'Ácido neutro', 'Hidrácido'],
    correta: 1, explicacao: 'O HNO₃ é um ácido forte, ionizando-se completamente em água: HNO₃ -> H⁺ + NO₃⁻. É classificado como oxiácido e monoácido.' },
  { id: 167, materia: 'Química', grupo: 'Funções Inorgânicas', dificuldade: 'Médio',
    enunciado: 'Qual das seguintes substâncias é um óxido anfótero?',
    alternativas: ['Na₂O', 'Al₂O₃', 'SO₃', 'CaO', 'CO₂'],
    correta: 1, explicacao: 'O Al₂O₃ (óxido de alumínio) é anfótero, pois reage tanto com ácidos (formando sal e água) quanto com bases (formando aluminato e água).' },
  { id: 168, materia: 'Química', grupo: 'Funções Inorgânicas', dificuldade: 'Fácil',
    enunciado: 'A reação de neutralização entre um ácido e uma base produz:',
    alternativas: ['Sal e gás hidrogênio', 'Sal e água', 'Sal e oxigênio', 'Base e água', 'Ácido e gás carbônico'],
    correta: 1, explicacao: 'A reação de neutralização ocorre entre um ácido e uma base, formando sal e água. Exemplo: HCl + NaOH -> NaCl + H₂O.' },
  { id: 169, materia: 'Química', grupo: 'Funções Inorgânicas', dificuldade: 'Fácil',
    enunciado: 'O hidróxido de sódio (NaOH) é classificado como:',
    alternativas: ['Base fraca e solúvel', 'Base forte e solúvel', 'Base fraca e insolúvel', 'Base forte e insolúvel', 'Óxido básico'],
    correta: 1, explicacao: 'O NaOH é uma base forte (dissocia-se completamente em água) e solúvel, sendo um dos hidróxidos mais utilizados em laboratório e indústria.' },
  { id: 170, materia: 'Química', grupo: 'Funções Inorgânicas', dificuldade: 'Médio',
    enunciado: 'Uma solução aquosa de Na₂CO₃ (carbonato de sódio) apresenta pH:',
    alternativas: ['Menor que 7', 'Igual a 7', 'Maior que 7', 'Zero', 'Neutro'],
    correta: 2, explicacao: 'O Na₂CO₃ é um sal proveniente de ácido fraco (H₂CO₃) e base forte (NaOH). Sofre hidrólise, liberando íons OH⁻ no meio, resultando em pH maior que 7.' },
  { id: 171, materia: 'Química', grupo: 'Reações Inorgânicas', dificuldade: 'Médio',
    enunciado: 'Na reação Fe + CuSO₄ -> FeSO₄ + Cu, o ferro metálico sofre:',
    alternativas: ['Redução, pois ganha elétrons', 'Oxidação, pois perde elétrons', 'Neutralização', 'Precipitação', 'Sublimação'],
    correta: 1, explicacao: 'O ferro metálico (Fe⁰) passa a Fe²⁺ no FeSO₄, perdendo 2 elétrons. Perda de elétrons caracteriza oxidação. O ferro é o agente redutor.' },
  { id: 172, materia: 'Química', grupo: 'Reações Inorgânicas', dificuldade: 'Fácil',
    enunciado: 'A reação 2 H₂O₂ -> 2 H₂O + O₂ é classificada como:',
    alternativas: ['Síntese ou adição', 'Análise ou decomposição', 'Simples troca ou deslocamento', 'Dupla troca', 'Combustão'],
    correta: 1, explicacao: 'É uma reação de decomposição (ou análise), onde uma substância composta (H₂O₂) se decompõe em duas substâncias mais simples (H₂O e O₂).' },
  { id: 173, materia: 'Química', grupo: 'Reações Inorgânicas', dificuldade: 'Médio',
    enunciado: 'Na reação AgNO₃ + NaCl -> AgCl↓ + NaNO₃, a formação do precipitado branco caracteriza:',
    alternativas: ['Uma reação de oxirredução', 'Uma reação de dupla troca com formação de composto insolúvel', 'Uma reação de síntese', 'Uma reação de análise', 'Uma reação de deslocamento'],
    correta: 1, explicacao: 'É uma reação de dupla troca onde os cátions e ânions trocam de par. O AgCl é insolúvel, formando o precipitado branco característico.' },
  { id: 174, materia: 'Química', grupo: 'Reações Inorgânicas', dificuldade: 'Fácil',
    enunciado: 'A combustão completa do gás metano (CH₄) em presença de oxigênio suficiente produz:',
    alternativas: ['CO e H₂O', 'CO₂ e H₂O', 'C e H₂', 'CO₂ e H₂', 'CH₃OH'],
    correta: 1, explicacao: 'A combustão completa do metano: CH₄ + 2 O₂ -> CO₂ + 2 H₂O. Os produtos são dióxido de carbono e água.' },
  { id: 175, materia: 'Química', grupo: 'Reações Inorgânicas', dificuldade: 'Fácil',
    enunciado: 'Na reação Zn + 2 HCl -> ZnCl₂ + H₂, o gás liberado é identificado como:',
    alternativas: ['Cloro', 'Oxigênio', 'Hidrogênio', 'Nitrogênio', 'Gás carbônico'],
    correta: 2, explicacao: 'O zinco metálico reage com ácido clorídrico produzindo cloreto de zinco e gás hidrogênio (H₂). O teste do hidrogênio é feito com um fósforo, produzindo estalo.' },
  { id: 176, materia: 'Química', grupo: 'Estequiometria', dificuldade: 'Fácil',
    enunciado: 'Considerando massas atômicas H=1 e O=16, a massa correspondente a 3 mols de H₂O é:',
    alternativas: ['18 g', '36 g', '54 g', '72 g', '90 g'],
    correta: 2, explicacao: 'Massa molar da H₂O = 18 g/mol. Massa = n x MM = 3 x 18 = 54 g.' },
  { id: 177, materia: 'Química', grupo: 'Estequiometria', dificuldade: 'Fácil',
    enunciado: 'Na reação 2 H₂ + O₂ -> 2 H₂O, quantos mols de O₂ são necessários para reagir completamente com 8 mols de H₂?',
    alternativas: ['1 mol', '2 mols', '4 mols', '6 mols', '8 mols'],
    correta: 2, explicacao: 'Pela estequiometria da reação: 2 mols de H₂ reagem com 1 mol de O₂. Proporção 2:1. Para 8 mols de H₂: 8/2 = 4 mols de O₂.' },
  { id: 178, materia: 'Química', grupo: 'Estequiometria', dificuldade: 'Fácil',
    enunciado: 'Quantos átomos existem em 12 g de carbono-12? (Dado: Número de Avogadro = 6,02×10²³)',
    alternativas: ['3,01×10²³', '6,02×10²³', '1,20×10²⁴', '1,80×10²⁴', '2,41×10²⁴'],
    correta: 1, explicacao: '12 g de carbono-12 correspondem a exatamente 1 mol de átomos. 1 mol contém 6,02×10²³ átomos (Número de Avogadro).' },
  { id: 179, materia: 'Química', grupo: 'Estequiometria', dificuldade: 'Médio',
    enunciado: 'Qual a massa de NaOH (MM=40 g/mol) necessária para preparar 500 mL de solução 0,2 mol/L?',
    alternativas: ['2,0 g', '4,0 g', '8,0 g', '10,0 g', '20,0 g'],
    correta: 1, explicacao: 'n = M x V = 0,2 x 0,5 = 0,1 mol. m = n x MM = 0,1 x 40 = 4,0 g de NaOH.' },
  { id: 180, materia: 'Química', grupo: 'Estequiometria', dificuldade: 'Médio',
    enunciado: 'Na decomposição térmica: CaCO₃ -> CaO + CO₂, a massa de CaO (MM=56 g/mol) obtida a partir de 200 g de CaCO₃ (MM=100 g/mol) é:',
    alternativas: ['56 g', '84 g', '100 g', '112 g', '200 g'],
    correta: 3, explicacao: '200 g de CaCO₃ = 2 mols. Proporção 1:1. 2 mols de CaO = 2 x 56 = 112 g.' },
  { id: 181, materia: 'Química', grupo: 'Soluções', dificuldade: 'Fácil',
    enunciado: 'Uma solução de HCl 0,001 mol/L tem pH aproximadamente igual a:',
    alternativas: ['1', '2', '3', '4', '5'],
    correta: 2, explicacao: 'HCl é ácido forte, [H⁺] = 0,001 M = 10⁻³ M. pH = -log(10⁻³) = 3.' },
  { id: 182, materia: 'Química', grupo: 'Soluções', dificuldade: 'Fácil',
    enunciado: 'A concentração em g/L de uma solução que contém 20 g de NaCl dissolvidos em 500 mL de solução é:',
    alternativas: ['10 g/L', '20 g/L', '30 g/L', '40 g/L', '50 g/L'],
    correta: 3, explicacao: 'C = massa/volume(L) = 20 g / 0,5 L = 40 g/L.' },
  { id: 183, materia: 'Química', grupo: 'Soluções', dificuldade: 'Médio',
    enunciado: 'Uma solução de KOH 0,05 mol/L tem pOH aproximadamente igual a:',
    alternativas: ['0,05', '0,3', '1,3', '2,0', '12,7'],
    correta: 2, explicacao: 'KOH é base forte. [OH⁻] = 0,05 M = 5x10⁻² M. pOH = -log(5x10⁻²) = 2 - log5 = 2 - 0,7 = 1,3.' },
  { id: 184, materia: 'Química', grupo: 'Soluções', dificuldade: 'Médio',
    enunciado: 'Qual volume de água deve ser adicionado a 200 mL de solução de NaOH 1,0 mol/L para obter uma solução 0,25 mol/L?',
    alternativas: ['200 mL', '400 mL', '600 mL', '800 mL', '1000 mL'],
    correta: 2, explicacao: 'C₁V₁ = C₂V₂ -> 1,0 x 200 = 0,25 x V₂ -> V₂ = 800 mL. Volume adicionado = 800 - 200 = 600 mL.' },
  { id: 185, materia: 'Química', grupo: 'Soluções', dificuldade: 'Difícil',
    enunciado: 'A fração molar do soluto em uma solução aquosa 1,0 mol/L de glicose (considere 1 L de solução ~ 1000 g de água) é aproximadamente:',
    alternativas: ['0,018', '0,037', '0,055', '0,10', '0,50'],
    correta: 0, explicacao: 'n_glicose = 1,0 mol. n_água = 1000/18 = 55,56 mols. X_glicose = 1,0 / (1,0 + 55,56) = 1,0 / 56,56 = 0,018.' },
  { id: 186, materia: 'Química', grupo: 'Termoquímica', dificuldade: 'Fácil',
    enunciado: 'Em uma reação exotérmica, a entalpia dos produtos é:',
    alternativas: ['Maior que a dos reagentes', 'Menor que a dos reagentes', 'Igual à dos reagentes', 'Zero', 'Igual à energia de ativação'],
    correta: 1, explicacao: 'Em reações exotérmicas, o sistema libera calor para a vizinhança, portanto a entalpia final (produtos) é menor que a inicial (reagentes), resultando em deltaH < 0.' },
  { id: 187, materia: 'Química', grupo: 'Termoquímica', dificuldade: 'Médio',
    enunciado: 'A entalpia de formação da H₂O(l) é -286 kJ/mol. A energia liberada na formação de 36 g de água líquida é:',
    alternativas: ['-286 kJ', '-572 kJ', '-858 kJ', '-1144 kJ', '-1430 kJ'],
    correta: 1, explicacao: '36 g de H₂O = 2 mols (MM=18). Energia = 2 x (-286) = -572 kJ.' },
  { id: 188, materia: 'Química', grupo: 'Termoquímica', dificuldade: 'Difícil',
    enunciado: 'Dadas as entalpias de ligação: H-H = 436 kJ/mol, Cl-Cl = 243 kJ/mol, H-Cl = 432 kJ/mol. A variação de entalpia da reação H₂ + Cl₂ -> 2 HCl é:',
    alternativas: ['-185 kJ', '-92,5 kJ', '+185 kJ', '+92,5 kJ', '-432 kJ'],
    correta: 0, explicacao: 'deltaH = Soma(H_rompidas) - Soma(H_formadas) = (436 + 243) - (2 x 432) = 679 - 864 = -185 kJ.' },
  { id: 189, materia: 'Química', grupo: 'Termoquímica', dificuldade: 'Médio',
    enunciado: 'A Lei de Hess estabelece que:',
    alternativas: ['A entalpia depende do caminho da reação', 'A variação de entalpia depende apenas dos estados inicial e final', 'A entalpia é sempre positiva', 'Reações exotérmicas têm deltaH positivo', 'A entalpia de formação do O₂ é -393 kJ/mol'],
    correta: 1, explicacao: 'A Lei de Hess afirma que a variação de entalpia de uma reação depende apenas dos estados inicial e final, independentemente do número de etapas ou do caminho percorrido.' },
  { id: 190, materia: 'Química', grupo: 'Termoquímica', dificuldade: 'Médio',
    enunciado: 'A combustão de 1 mol de carbono grafite libera 393,5 kJ. A massa de carbono necessária para liberar 787 kJ é:',
    alternativas: ['12 g', '24 g', '36 g', '48 g', '60 g'],
    correta: 1, explicacao: '787 / 393,5 = 2 mols. 2 mols de C = 2 x 12 = 24 g.' },
  { id: 191, materia: 'Química', grupo: 'Cinética Química', dificuldade: 'Difícil',
    enunciado: 'A lei de velocidade para uma reação elementar A + 2B -> C é:',
    alternativas: ['v = k[A][B]', 'v = k[A][B]²', 'v = k[A]²[B]', 'v = k[C]', 'v = k[A]⁰[B]²'],
    correta: 1, explicacao: 'Para reações elementares, a lei de velocidade é diretamente determinada pelos coeficientes estequiométricos: v = k[A]¹[B]².' },
  { id: 192, materia: 'Química', grupo: 'Cinética Química', dificuldade: 'Médio',
    enunciado: 'O aumento da temperatura em 10°C geralmente dobra a velocidade de uma reação porque:',
    alternativas: ['Aumenta a energia de ativação', 'Aumenta o número de moléculas com energia suficiente para reagir', 'Diminui a concentração dos reagentes', 'Altera o equilíbrio químico', 'Consome o catalisador'],
    correta: 1, explicacao: 'O aumento da temperatura desloca a distribuição de energia das moléculas para valores mais altos, aumentando significativamente a fração de moléculas com energia igual ou superior à energia de ativação.' },
  { id: 193, materia: 'Química', grupo: 'Cinética Química', dificuldade: 'Médio',
    enunciado: 'Um catalisador acelera uma reação porque:',
    alternativas: ['Aumenta a energia de ativação', 'Diminui a energia de ativação', 'Aumenta a temperatura do sistema', 'É consumido durante a reação', 'Altera o deltaH da reação'],
    correta: 1, explicacao: 'O catalisador fornece um caminho alternativo com menor energia de ativação, permitindo que mais moléculas tenham energia para reagir em um dado intervalo de tempo.' },
  { id: 194, materia: 'Química', grupo: 'Cinética Química', dificuldade: 'Difícil',
    enunciado: 'Em uma reação de primeira ordem, o tempo de meia-vida é:',
    alternativas: ['Diretamente proporcional à concentração inicial', 'Independente da concentração inicial', 'Inversamente proporcional à temperatura', 'Igual ao tempo de reação completa', 'Maior que a meia-vida de ordem zero'],
    correta: 1, explicacao: 'Para reações de primeira ordem, o tempo de meia-vida (t½ = ln2/k) é constante e independente da concentração inicial do reagente.' },
  { id: 195, materia: 'Química', grupo: 'Cinética Química', dificuldade: 'Médio',
    enunciado: 'O aumento da superfície de contato dos reagentes acelera a reação porque:',
    alternativas: ['Aumenta a energia de ativação', 'Aumenta a frequência de colisões efetivas', 'Diminui a concentração', 'Altera o estado físico', 'Remove o catalisador'],
    correta: 1, explicacao: 'Quanto maior a superfície de contato, maior a área disponível para as colisões entre as moléculas dos reagentes, aumentando a frequência de colisões efetivas.' },
  { id: 196, materia: 'Química', grupo: 'Equilíbrio Químico', dificuldade: 'Médio',
    enunciado: 'Para a reação N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g) deltaH = -92 kJ, o aumento da temperatura desloca o equilíbrio para:',
    alternativas: ['A direita, formando mais NH₃', 'A esquerda, formando mais N₂ e H₂', 'Não altera o equilíbrio', 'A direita, consumindo N₂', 'A esquerda, formando mais NH₃'],
    correta: 1, explicacao: 'Pelo princípio de Le Chatelier, o aumento da temperatura favorece a reação endotérmica. A reação direta é exotérmica (-92 kJ), então o equilíbrio desloca para a esquerda (sentido endotérmico).' },
  { id: 197, materia: 'Química', grupo: 'Equilíbrio Químico', dificuldade: 'Difícil',
    enunciado: 'A constante de equilíbrio Kc para a reação H₂ + I₂ ⇌ 2 HI é 49 a certa temperatura. Se [H₂] = [I₂] = 0,2 M no equilíbrio, a concentração de HI é:',
    alternativas: ['0,2 M', '0,7 M', '1,0 M', '1,4 M', '2,0 M'],
    correta: 3, explicacao: 'Kc = [HI]²/([H₂][I₂]) -> 49 = [HI]²/(0,2 x 0,2) -> [HI]² = 49 x 0,04 = 1,96 -> [HI] = raiz(1,96) = 1,4 M.' },
  { id: 198, materia: 'Química', grupo: 'Equilíbrio Químico', dificuldade: 'Fácil',
    enunciado: 'O princípio de Le Chatelier afirma que, quando um sistema em equilíbrio sofre uma perturbação, ele:',
    alternativas: ['Mantém-se inalterado', 'Desloca-se no sentido de minimizar a perturbação', 'Aumenta a temperatura', 'Forma mais produtos', 'Sempre desloca para a direita'],
    correta: 1, explicacao: 'O princípio de Le Chatelier estabelece que o sistema em equilíbrio se desloca no sentido de contrariar (minimizar) o efeito de qualquer perturbação externa aplicada.' },
  { id: 199, materia: 'Química', grupo: 'Equilíbrio Químico', dificuldade: 'Médio',
    enunciado: 'Em uma reação exotérmica em equilíbrio, a diminuição da temperatura:',
    alternativas: ['Desloca o equilíbrio para a direita (forma mais produtos)', 'Desloca o equilíbrio para a esquerda', 'Não altera o equilíbrio', 'Inverte o sinal do deltaH', 'Aumenta a constante de velocidade'],
    correta: 0, explicacao: 'Em reações exotérmicas, a diminuição da temperatura favorece a reação direta (libera calor), deslocando o equilíbrio para a direita.' },
  { id: 200, materia: 'Química', grupo: 'Equilíbrio Químico', dificuldade: 'Médio',
    enunciado: 'A expressão da constante de equilíbrio Kc para a reação CaCO₃(s) ⇌ CaO(s) + CO₂(g) é:',
    alternativas: ['Kc = [CaO][CO₂]/[CaCO₃]', 'Kc = [CO₂]', 'Kc = [CaO][CO₂]', 'Kc = 1/[CO₂]', 'Kc = [CaCO₃]/[CaO]'],
    correta: 1, explicacao: 'Sólidos puros não entram na expressão de Kc, pois suas concentrações são constantes. Portanto, Kc = [CO₂].' },
  { id: 201, materia: 'Química', grupo: 'Eletroquímica', dificuldade: 'Fácil',
    enunciado: 'Em uma célula eletroquímica, o cátodo é o eletrodo onde ocorre:',
    alternativas: ['Oxidação', 'Redução', 'Sublimação', 'Precipitação', 'Neutralização'],
    correta: 1, explicacao: 'No cátodo ocorre a redução (ganho de elétrons). No ânodo ocorre a oxidação (perda de elétrons).' },
  { id: 202, materia: 'Química', grupo: 'Eletroquímica', dificuldade: 'Médio',
    enunciado: 'Na pilha de Daniell (Zn/Cu²⁺), o zinco metálico funciona como:',
    alternativas: ['Cátodo, sofrendo redução', 'Ânodo, sofrendo oxidação', 'Cátodo, sofrendo oxidação', 'Ânodo, sofrendo redução', 'Eletrólito'],
    correta: 1, explicacao: 'Na pilha de Daniell, o zinco metálico é o ânodo e sofre oxidação: Zn(s) -> Zn²⁺(aq) + 2e⁻. O cobre é o cátodo, onde ocorre redução: Cu²⁺ + 2e⁻ -> Cu(s).' },
  { id: 203, materia: 'Química', grupo: 'Eletroquímica', dificuldade: 'Médio',
    enunciado: 'Na eletrólise ígnea do NaCl, os produtos formados no cátodo e ânodo são, respectivamente:',
    alternativas: ['Cl₂ e Na', 'Na e Cl₂', 'Na e O₂', 'H₂ e Cl₂', 'Na e H₂'],
    correta: 1, explicacao: 'Na eletrólise ígnea do NaCl fundido: cátodo: Na⁺ + e⁻ -> Na(s); ânodo: 2Cl⁻ -> Cl₂(g) + 2e⁻. Produz sódio metálico e gás cloro.' },
  { id: 204, materia: 'Química', grupo: 'Eletroquímica', dificuldade: 'Médio',
    enunciado: 'A série de reatividade dos metais indica que:',
    alternativas: ['Metais mais reativos sofrem redução mais facilmente', 'Metais menos reativos sofrem oxidação mais facilmente', 'Um metal mais reativo pode reduzir o cátion de um metal menos reativo', 'A reatividade não influencia as reações redox', 'Todos os metais têm o mesmo potencial de redução'],
    correta: 2, explicacao: 'Metais mais reativos (como Zn, Mg) têm maior tendência a oxidar (perder elétrons), podendo reduzir os cátions de metais menos reativos (como Cu²⁺, Ag⁺).' },
  { id: 205, materia: 'Química', grupo: 'Eletroquímica', dificuldade: 'Médio',
    enunciado: 'A ponte salina em uma pilha galvânica tem a função de:',
    alternativas: ['Fornecer elétrons para o circuito', 'Permitir o fluxo de íons entre as semicélulas', 'Aumentar a diferença de potencial', 'Atuar como eletrodo de referência', 'Isolar eletricamente as semicélulas'],
    correta: 1, explicacao: 'A ponte salina permite a migração de íons entre as duas semicélulas, mantendo o equilíbrio de cargas e fechando o circuito elétrico sem misturar as soluções.' },
  { id: 206, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Fácil',
    enunciado: 'A pressão máxima de vapor de um líquido:',
    alternativas: ['Aumenta com a temperatura', 'Diminui com a temperatura', 'É independente da temperatura', 'É igual à pressão atmosférica', 'É máxima no ponto de fusão'],
    correta: 0, explicacao: 'A pressão máxima de vapor de um líquido aumenta com a temperatura, pois mais moléculas adquirem energia suficiente para escapar da fase líquida para a fase gasosa.' },
  { id: 207, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Médio',
    enunciado: 'Uma solução aquosa de NaCl 0,1 mol/L tem ponto de congelamento:',
    alternativas: ['Igual ao da água pura', 'Menor que o da água pura', 'Maior que o da água pura', 'Igual a 0°C', 'Impossível de determinar'],
    correta: 1, explicacao: 'O efeito crioscópico (abaixamento do ponto de congelamento) é uma propriedade coligativa. Soluções têm menor ponto de congelamento que o solvente puro.' },
  { id: 208, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Difícil',
    enunciado: 'Considerando o fator de Van\'t Hoff (i), uma solução 0,1 mol/L de CaCl₂ tem concentração efetiva de partículas de:',
    alternativas: ['0,1 mol/L', '0,2 mol/L', '0,3 mol/L', '0,4 mol/L', '0,5 mol/L'],
    correta: 2, explicacao: 'CaCl₂ dissocia-se em 3 íons: Ca²⁺ + 2Cl⁻, portanto i = 3. Concentração efetiva = 0,1 x 3 = 0,3 mol/L.' },
  { id: 209, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Difícil',
    enunciado: 'A lei de Raoult para soluções ideais relaciona:',
    alternativas: ['A pressão de vapor da solução à fração molar do solvente', 'A temperatura de ebulição à concentração', 'A osmose à concentração', 'O pH à concentração de H⁺', 'A solubilidade à temperatura'],
    correta: 0, explicacao: 'A Lei de Raoult estabelece que a pressão parcial de vapor de um componente em uma solução ideal é igual ao produto da sua fração molar pela pressão de vapor do componente puro.' },
  { id: 210, materia: 'Química', grupo: 'Físico-Química', dificuldade: 'Médio',
    enunciado: 'A osmose reversa é um processo utilizado para:',
    alternativas: ['Concentrar soluções por evaporação', 'Separar solvente de soluto aplicando pressão superior à osmótica', 'Medir a pressão de vapor', 'Determinar massas molares', 'Cromatografar compostos'],
    correta: 1, explicacao: 'Na osmose reversa, aplica-se uma pressão superior à pressão osmótica para forçar o solvente a passar da solução mais concentrada para a menos concentrada, purificando o solvente.' },
  { id: 211, materia: 'Química', grupo: 'Química Orgânica - Nomenclatura', dificuldade: 'Médio',
    enunciado: 'O nome IUPAC do composto CH₃-CH₂-CH₂-CH(CH₃)-CH₂-CH₃ é:',
    alternativas: ['Heptano', '3-metilexano', '2-metilexano', '3-metil-heptano', '2-metil-heptano'],
    correta: 1, explicacao: 'A cadeia principal tem 6 carbonos (hexano) com um radical metil no carbono 3. O nome é 3-metilexano.' },
  { id: 212, materia: 'Química', grupo: 'Química Orgânica - Nomenclatura', dificuldade: 'Fácil',
    enunciado: 'O composto CH₃-CH₂-CH₂-OH é classificado como:',
    alternativas: ['Aldeído', 'Cetona', 'Álcool primário', 'Álcool secundário', 'Álcool terciário'],
    correta: 2, explicacao: 'O grupo OH está ligado a um carbono primário (ligado a apenas um outro carbono). Portanto, é um álcool primário (propan-1-ol).' },
  { id: 213, materia: 'Química', grupo: 'Química Orgânica - Nomenclatura', dificuldade: 'Fácil',
    enunciado: 'A fórmula geral dos aldeídos é:',
    alternativas: ['R-OH', 'R-CHO', 'R-COOH', 'R-CO-R\'', 'R-O-R\''],
    correta: 1, explicacao: 'Aldeídos têm o grupo funcional carbonila (C=O) ligado a pelo menos um átomo de hidrogênio: R-CHO.' },
  { id: 214, materia: 'Química', grupo: 'Química Orgânica - Nomenclatura', dificuldade: 'Médio',
    enunciado: 'O 2-metilpropano é um isômero do:',
    alternativas: ['Butano', 'Pentano', 'Propano', 'Hexano', 'Metilpropano'],
    correta: 0, explicacao: 'O 2-metilpropano (C₄H₁₀) é um isômero de cadeia do butano (C₄H₁₀). Ambos têm a mesma fórmula molecular mas diferentes estruturas.' },
  { id: 215, materia: 'Química', grupo: 'Química Orgânica - Nomenclatura', dificuldade: 'Fácil',
    enunciado: 'A nomenclatura IUPAC do ácido etanoico (ácido acético) é derivada do número de carbonos igual a:',
    alternativas: ['1', '2', '3', '4', '5'],
    correta: 1, explicacao: 'Ácido etanoico: prefixo "etan" = 2 carbonos, sufixo "oico" indica ácido carboxílico. Fórmula: CH₃-COOH.' },
  { id: 216, materia: 'Química', grupo: 'Química Orgânica - Reações', dificuldade: 'Médio',
    enunciado: 'A reação de esterificação entre ácido acético e etanol produz:',
    alternativas: ['Álcool e água', 'Éster e água', 'Éter e água', 'Sal e água', 'Aldeído e água'],
    correta: 1, explicacao: 'A esterificação (ou esterificação de Fischer) é a reação entre ácido carboxílico e álcool, formando éster e água.' },
  { id: 217, materia: 'Química', grupo: 'Química Orgânica - Reações', dificuldade: 'Médio',
    enunciado: 'A hidrólise ácida de um éster produz:',
    alternativas: ['Álcool e ácido carboxílico', 'Aldeído e cetona', 'Éter e água', 'Dois álcoois', 'Ácido e base'],
    correta: 0, explicacao: 'A hidrólise ácida de éster é a reação inversa da esterificação: éster + água -> ácido carboxílico + álcool.' },
  { id: 218, materia: 'Química', grupo: 'Química Orgânica - Reações', dificuldade: 'Médio',
    enunciado: 'A oxidação de um álcool secundário com KMnO₄ produz:',
    alternativas: ['Aldeído', 'Cetona', 'Ácido carboxílico', 'Éster', 'Éter'],
    correta: 1, explicacao: 'A oxidação de álcool secundário produz cetona. Ex: CH₃-CHOH-CH₃ (isopropanol) -> CH₃-CO-CH₃ (acetona).' },
  { id: 219, materia: 'Química', grupo: 'Química Orgânica - Reações', dificuldade: 'Médio',
    enunciado: 'A halogenação do benzeno (C₆H₆ + Cl₂) na presença de FeCl₃ como catalisador é um exemplo de reação de:',
    alternativas: ['Adição', 'Substituição eletrofílica aromática', 'Oxidação', 'Redução', 'Eliminação'],
    correta: 1, explicacao: 'A halogenação do benzeno é uma reação de substituição eletrofílica aromática (SEA), onde um átomo de hidrogênio do anel é substituído por um halogênio.' },
  { id: 220, materia: 'Química', grupo: 'Química Orgânica - Reações', dificuldade: 'Difícil',
    enunciado: 'Na reação de adição de HBr ao propeno (CH₃-CH=CH₂), o produto principal, segundo a regra de Markovnikov, é:',
    alternativas: ['1-bromopropano', '2-bromopropano', '1,2-dibromopropano', '3-bromopropeno', 'Propano'],
    correta: 1, explicacao: 'Pela regra de Markovnikov, o hidrogênio do HBr se liga ao carbono mais hidrogenado da dupla, e o bromo ao carbono menos hidrogenado. Produto: CH₃-CHBr-CH₃ (2-bromopropano).' },
  { id: 221, materia: 'Química', grupo: 'Química Orgânica - Isomeria', dificuldade: 'Fácil',
    enunciado: 'Os compostos butano (C₄H₁₀) e 2-metilpropano (C₄H₁₀) são exemplos de:',
    alternativas: ['Isomeria de função', 'Isomeria de cadeia', 'Isomeria de posição', 'Isomeria geométrica', 'Isomeria óptica'],
    correta: 1, explicacao: 'Butano e 2-metilpropano têm a mesma fórmula molecular (C₄H₁₀) mas diferentes cadeias carbônicas (normal e ramificada). Isso caracteriza isomeria de cadeia.' },
  { id: 222, materia: 'Química', grupo: 'Química Orgânica - Isomeria', dificuldade: 'Médio',
    enunciado: 'O 1-butanol e o 2-butanol são isômeros de:',
    alternativas: ['Cadeia', 'Função', 'Posição', 'Compensação', 'Tautomeria'],
    correta: 2, explicacao: 'Ambos são álcoois com 4 carbonos, diferindo na posição do grupo OH (carbono 1 e carbono 2). Isso caracteriza isomeria de posição.' },
  { id: 223, materia: 'Química', grupo: 'Química Orgânica - Isomeria', dificuldade: 'Médio',
    enunciado: 'A condição necessária para que uma molécula apresente isomeria óptica é:',
    alternativas: ['Possuir dupla ligação', 'Possuir carbono quiral (assimétrico)', 'Ser um alcano', 'Ser um composto aromático', 'Ter fórmula cíclica'],
    correta: 1, explicacao: 'A isomeria óptica requer a presença de pelo menos um carbono quiral (assimétrico), ou seja, um carbono ligado a quatro grupos diferentes.' },
  { id: 224, materia: 'Química', grupo: 'Química Orgânica - Isomeria', dificuldade: 'Médio',
    enunciado: 'Álcool etílico (C₂H₅OH) e éter dimetílico (CH₃-O-CH₃) são isômeros de:',
    alternativas: ['Cadeia', 'Posição', 'Função', 'Geométrica', 'Óptica'],
    correta: 2, explicacao: 'Ambos têm fórmula molecular C₂H₆O, mas pertencem a funções químicas diferentes (álcool e éter). Isso caracteriza isomeria de função.' },
  { id: 225, materia: 'Química', grupo: 'Química Orgânica - Isomeria', dificuldade: 'Difícil',
    enunciado: 'O ácido maleico e o ácido fumárico são exemplos clássicos de isômeros:',
    alternativas: ['De cadeia', 'De posição', 'Geométricos (cis-trans)', 'Ópticos', 'De função'],
    correta: 2, explicacao: 'Ácido maleico (cis) e ácido fumárico (trans) são isômeros geométricos, diferindo na disposição espacial dos grupos em torno da dupla ligação.' },
  { id: 226, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Fácil',
    enunciado: 'Na cromatografia líquida de alta eficiência (HPLC), a fase móvel é:',
    alternativas: ['Um gás inerte', 'Um líquido solvente', 'Um sólido adsorvente', 'Um gás reativo', 'Uma resina de troca iônica'],
    correta: 1, explicacao: 'No HPLC, a fase móvel é um líquido (solvente ou mistura de solventes) que percorre a coluna cromatográfica carregando os analitos.' },
  { id: 227, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Médio',
    enunciado: 'Na espectroscopia no infravermelho (IV), a absorção de radiação está associada a:',
    alternativas: ['Transições eletrônicas', 'Vibrações moleculares', 'Transições nucleares', 'Rotação de elétrons', 'Difração de raios X'],
    correta: 1, explicacao: 'A espectroscopia IV mede as vibrações moleculares (estiramento e deformação de ligações), fornecendo informações sobre os grupos funcionais presentes na molécula.' },
  { id: 228, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Médio',
    enunciado: 'A lei de Beer-Lambert é expressa por A = εbc, onde ε representa:',
    alternativas: ['Absorbância', 'Concentração', 'Absortividade molar', 'Caminho óptico', 'Transmitância'],
    correta: 2, explicacao: 'Na lei de Beer-Lambert (A = εbc), ε é a absortividade molar (ou coeficiente de extinção molar), b é o caminho óptico e c é a concentração.' },
  { id: 229, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Médio',
    enunciado: 'Na análise por espectrometria de massas (MS), os íons são separados com base em sua:',
    alternativas: ['Carga elétrica', 'Razão massa/carga (m/z)', 'Tamanho', 'Polaridade', 'Volatilidade'],
    correta: 1, explicacao: 'No espectrômetro de massas, os íons são separados de acordo com sua relação massa/carga (m/z), gerando um espectro de massas característico.' },
  { id: 230, materia: 'Química', grupo: 'Análise Instrumental', dificuldade: 'Difícil',
    enunciado: 'O detector mais comum em cromatografia gasosa (GC) é o:',
    alternativas: ['Detector de ionização em chama (FID)', 'Detector de arranjo de diodos (DAD)', 'Detector de fluorescência', 'Espectrômetro de massas', 'Detector condutimétrico'],
    correta: 0, explicacao: 'O FID (Flame Ionization Detector) é o detector mais universal e utilizado em GC, respondendo a compostos orgânicos pela ionização em chama de hidrogênio/ar.' },
  { id: 231, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Médio',
    enunciado: 'Em uma titulação ácido-base, o ponto de equivalência é:',
    alternativas: ['O ponto onde o indicador muda de cor', 'O ponto onde a quantidade de ácido é igual à de base estequiometricamente', 'O final da titulação', 'O ponto onde o pH é 7', 'O ponto onde a solução fica incolor'],
    correta: 1, explicacao: 'O ponto de equivalência é o ponto teórico onde a quantidade de titulante adicionada é quimicamente equivalente à quantidade de titulado, segundo a estequiometria da reação.' },
  { id: 232, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Difícil',
    enunciado: 'Em uma titulação de precipitação pelo método de Mohr, utiliza-se como indicador:',
    alternativas: ['Fenolftaleína', 'Alaranjado de metila', 'Cromato de potássio (K₂CrO₄)', 'Amido', 'Difenilamina'],
    correta: 2, explicacao: 'O método de Mohr para determinação de cloretos usa K₂CrO₄ como indicador. O ponto final é detectado pela formação de Ag₂CrO₄ (precipitado vermelho-tijolo).' },
  { id: 233, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Médio',
    enunciado: 'Na análise gravimétrica, a etapa de calcinação do precipitado tem como objetivo:',
    alternativas: ['Dissolver o precipitado', 'Eliminar água e componentes voláteis', 'Formar o precipitado', 'Lavar o precipitado', 'Secar o papel de filtro'],
    correta: 1, explicacao: 'A calcinação é o aquecimento do precipitado a altas temperaturas para eliminar água residual, compostos voláteis e converter o precipitado em uma forma química estável para pesagem.' },
  { id: 234, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Fácil',
    enunciado: 'O indicador fenolftaleína em meio ácido apresenta-se:',
    alternativas: ['Vermelho', 'Azul', 'Amarelo', 'Incolor', 'Verde'],
    correta: 3, explicacao: 'A fenolftaleína é incolor em meio ácido (pH < 8,2) e rósea/violeta em meio básico (pH > 10,0). Transita entre 8,2 e 10,0.' },
  { id: 235, materia: 'Química', grupo: 'Química Analítica', dificuldade: 'Médio',
    enunciado: 'A padronização de uma solução de NaOH é geralmente feita com:',
    alternativas: ['NaCl', 'Biftalato de potássio (KHC₈H₄O₄)', 'HCl concentrado', 'Água destilada', 'Indicador universal'],
    correta: 1, explicacao: 'O biftalato de potássio é um padrão primário amplamente utilizado para padronizar soluções de NaOH, por ser estável, não higroscópico e ter alta massa molar.' },
  { id: 236, materia: 'Química', grupo: 'Técnicas de Laboratório', dificuldade: 'Médio',
    enunciado: 'Para preparar 100 mL de solução de NaCl 0,1 mol/L, o técnico deve utilizar:',
    alternativas: ['Béquer e proveta', 'Balão volumétrico de 100 mL e pipeta', 'Balança, béquer, funil e balão volumétrico de 100 mL', 'Erlenmeyer e bastão de vidro', 'Kitassato e trompa de vácuo'],
    correta: 2, explicacao: 'Para preparar solução: pesa-se o soluto (balança), transfere-se para balão volumétrico de 100 mL usando funil, dissolve-se em béquer e completa-se o volume com água.' },
  { id: 237, materia: 'Química', grupo: 'Técnicas de Laboratório', dificuldade: 'Médio',
    enunciado: 'A vidraria utilizada para filtração a vácuo é:',
    alternativas: ['Funil de vidro comum', 'Funil de Büchner acoplado a kitassato', 'Balão de fundo redondo', 'Condensador de Liebig', 'Pipeta volumétrica'],
    correta: 1, explicacao: 'A filtração a vácuo utiliza funil de Büchner (ou placa porosa) acoplado a um kitassato, conectado a uma trompa d\'água ou bomba de vácuo.' },
  { id: 238, materia: 'Química', grupo: 'Técnicas de Laboratório', dificuldade: 'Fácil',
    enunciado: 'O equipamento utilizado para medir a densidade de líquidos é o:',
    alternativas: ['Termômetro', 'Picnômetro', 'Condutivímetro', 'Espectrofotômetro', 'Potenciômetro'],
    correta: 1, explicacao: 'O picnômetro (ou densímetro) é o instrumento específico para medir a densidade de líquidos com precisão.' },
  { id: 239, materia: 'Química', grupo: 'Técnicas de Laboratório', dificuldade: 'Fácil',
    enunciado: 'Para aquecer um líquido em laboratório de forma uniforme e controlada, utiliza-se:',
    alternativas: ['Bico de Bunsen diretamente', 'Chapa aquecedora com agitador magnético', 'Estufa', 'Autoclave', 'Forno mufla'],
    correta: 1, explicacao: 'A chapa aquecedora com agitador magnético permite aquecimento controlado e uniforme, sendo ideal para aquecer líquidos em laboratório.' },
  { id: 240, materia: 'Química', grupo: 'Técnicas de Laboratório', dificuldade: 'Médio',
    enunciado: 'A destilação fracionada é utilizada para separar misturas de líquidos:',
    alternativas: ['Miscíveis com pontos de ebulição próximos', 'Imiscíveis', 'Sólido-líquido', 'Gasosas', 'De cores diferentes'],
    correta: 0, explicacao: 'A destilação fracionada é empregada para separar líquidos miscíveis com pontos de ebulição próximos (diferença menor que 25°C), utilizando uma coluna de fracionamento.' },
  // ---- PORTUGUÊS (20 novas) ----
  { id: 241, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Fácil',
    enunciado: 'Texto: "O controle de qualidade em laboratórios químicos é essencial para garantir a confiabilidade dos resultados. Cada etapa do processo analítico deve ser validada e documentada." A palavra "confiabilidade" pode ser substituída, sem alteração de sentido, por:',
    alternativas: ['Dúvida', 'Incerteza', 'Credibilidade', 'Variabilidade', 'Complexidade'],
    correta: 2, explicacao: 'Confiabilidade significa qualidade do que é confiável, ou seja, merece crédito. "Credibilidade" é o sinônimo mais adequado no contexto.' },
  { id: 242, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Médio',
    enunciado: 'Na frase "Embora o equipamento seja moderno, o técnico prefere o método clássico", a oração destacada expressa ideia de:',
    alternativas: ['Causa', 'Consequência', 'Concessão', 'Condição', 'Finalidade'],
    correta: 2, explicacao: '"Embora" é uma conjunção concessiva, indicando uma oposição ou quebra de expectativa entre o fato expresso na oração concessiva e a oração principal.' },
  { id: 243, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Médio',
    enunciado: 'Considere o texto: "A análise cromatográfica revelou a presença de contaminantes na amostra. Diante disso, o lote foi reprovado pelo controle de qualidade." A expressão "diante disso" estabelece relação de:',
    alternativas: ['Adição', 'Oposição', 'Conclusão', 'Alternância', 'Explicação'],
    correta: 2, explicacao: '"Diante disso" é um conectivo conclusivo, indicando que a reprovação do lote é uma conclusão lógica do resultado da análise cromatográfica.' },
  { id: 244, materia: 'Português', grupo: 'Interpretação de Textos', dificuldade: 'Fácil',
    enunciado: 'Leia a frase: "O técnico não só realizou os testes, mas também interpretou os resultados." A expressão "não só... mas também" indica:',
    alternativas: ['Alternância entre ações', 'Adição de informações', 'Oposição entre ideias', 'Conclusão de um raciocínio', 'Explicação de um termo'],
    correta: 1, explicacao: 'A expressão "não só... mas também" é uma conjunção correlativa aditiva, que acrescenta informações, equivalendo a "e", "além disso".' },
  { id: 245, materia: 'Português', grupo: 'Ortografia e Acentuação', dificuldade: 'Fácil',
    enunciado: 'Assinale a alternativa em que todas as palavras estão grafadas corretamente:',
    alternativas: ['Analise, parâmetro, excessão', 'Análise, parâmetro, exceção', 'Análise, parametro, exceção', 'Analise, parâmetro, exceção', 'Análise, parâmetro, excessão'],
    correta: 1, explicacao: 'As grafias corretas são: "análise" (com acento, proparoxítona), "parâmetro" (com acento, proparoxítona) e "exceção" (com ç, não ss).' },
  { id: 246, materia: 'Português', grupo: 'Ortografia e Acentuação', dificuldade: 'Médio',
    enunciado: 'Segundo o Novo Acordo Ortográfico, a palavra "ideia" NÃO recebe acento porque:',
    alternativas: ['É uma palavra oxítona', 'É uma paroxítona terminada em "a"', 'É uma paroxítona com ditongo aberto "ei"', 'É uma proparoxítona', 'É um monossílabo'],
    correta: 2, explicacao: 'Pelo Novo Acordo Ortográfico (em vigor desde 2009), o acento agudo em ditongos abertos "ei" e "oi" de paroxítonas foi abolido. Ex: ideia, assembleia, heroico.' },
  { id: 247, materia: 'Português', grupo: 'Ortografia e Acentuação', dificuldade: 'Difícil',
    enunciado: 'Assinale a alternativa em que o uso do hífen está correto:',
    alternativas: ['Auto-estima', 'Anti-inflamatório', 'Bemvindo', 'Super-homem', 'Microondas'],
    correta: 1, explicacao: '"Anti-inflamatório" mantém o hífen quando o prefixo termina com a mesma vogal que inicia a palavra. As formas corretas: autoestima, bem-vindo, super-homem, micro-ondas.' },
  { id: 248, materia: 'Português', grupo: 'Morfologia', dificuldade: 'Médio',
    enunciado: 'Na frase "O técnico trabalhou bastante durante o plantão", a palavra "bastante" é classificada como:',
    alternativas: ['Adjetivo', 'Substantivo', 'Advérbio', 'Pronome', 'Numeral'],
    correta: 2, explicacao: '"Bastante" modifica o verbo "trabalhou", indicando intensidade. Nesse caso, é advérbio de intensidade e permanece invariável.' },
  { id: 249, materia: 'Português', grupo: 'Morfologia', dificuldade: 'Difícil',
    enunciado: 'A palavra "deslealdade" é formada pelo processo de:',
    alternativas: ['Derivação prefixal', 'Derivação sufixal', 'Derivação prefixal e sufixal', 'Composição por justaposição', 'Parassíntese'],
    correta: 2, explicacao: '"Deslealdade" é formada por derivação prefixal e sufixal: prefixo "des-" + "leal" + sufixo "-dade".' },
  { id: 250, materia: 'Português', grupo: 'Morfologia', dificuldade: 'Fácil',
    enunciado: 'Em "O técnico falou calmamente com a equipe", a palavra "calmamente" é:',
    alternativas: ['Adjetivo', 'Substantivo', 'Advérbio de modo', 'Verbo', 'Preposição'],
    correta: 2, explicacao: '"Calmamente" é um advérbio de modo, formado pela adição do sufixo "-mente" ao adjetivo "calma". Indica a maneira como a ação foi realizada.' },
  { id: 251, materia: 'Português', grupo: 'Sintaxe', dificuldade: 'Médio',
    enunciado: 'Na oração "O técnico entregou os relatórios ao supervisor", o termo "ao supervisor" exerce função de:',
    alternativas: ['Objeto direto', 'Objeto indireto', 'Adjunto adnominal', 'Complemento nominal', 'Adjunto adverbial'],
    correta: 1, explicacao: '"Ao supervisor" complementa o verbo "entregou" com preposição "a", funcionando como objeto indireto. "Os relatórios" é o objeto direto.' },
  { id: 252, materia: 'Português', grupo: 'Sintaxe', dificuldade: 'Médio',
    enunciado: 'Assinale a alternativa em que o termo destacado exerce função de adjunto adverbial:',
    alternativas: ['O técnico da manhã chegou cedo', 'O laboratório estava limpo', 'Ontem, a análise foi concluída', 'Os equipamentos novos foram instalados', 'A amostra do cliente chegou'],
    correta: 2, explicacao: '"Ontem" é um adjunto adverbial de tempo, indicando quando a ação de concluir a análise ocorreu.' },
  { id: 253, materia: 'Português', grupo: 'Sintaxe', dificuldade: 'Difícil',
    enunciado: 'Na frase "O supervisor pediu que o técnico refizesse a análise", a oração "que o técnico refizesse a análise" é:',
    alternativas: ['Oração subordinada substantiva subjetiva', 'Oração subordinada substantiva objetiva direta', 'Oração subordinada adjetiva restritiva', 'Oração subordinada adverbial causal', 'Oração coordenada sindética'],
    correta: 1, explicacao: 'O verbo "pedir" é transitivo direto (pedir algo). A oração completa o sentido do verbo como objeto direto, sendo uma oração subordinada substantiva objetiva direta.' },
  { id: 254, materia: 'Português', grupo: 'Concordância e Regência', dificuldade: 'Médio',
    enunciado: 'Assinale a alternativa correta quanto à regência do verbo "assistir" no sentido de "ver, presenciar":',
    alternativas: ['O técnico assistiu o filme', 'O técnico assistiu ao filme', 'O técnico assistiu pelo filme', 'O técnico assistiu no filme', 'O técnico assistiu com o filme'],
    correta: 1, explicacao: 'No sentido de "ver, presenciar", o verbo "assistir" rege a preposição "a": assistir a algo. Portanto: "O técnico assistiu ao filme".' },
  { id: 255, materia: 'Português', grupo: 'Concordância e Regência', dificuldade: 'Médio',
    enunciado: 'Assinale a alternativa INCORRETA quanto à concordância verbal:',
    alternativas: ['A maioria dos técnicos aprovou a decisão', 'Fazem cinco anos que ele trabalha aqui', 'Havia muitos problemas no procedimento', 'Existem várias alternativas viáveis', 'Devem haver soluções para o problema'],
    correta: 1, explicacao: 'O verbo "fazer" com sentido de tempo decorrido é impessoal, permanecendo no singular: "Faz cinco anos que ele trabalha aqui".' },
  { id: 256, materia: 'Português', grupo: 'Concordância e Regência', dificuldade: 'Médio',
    enunciado: 'A regência correta do verbo "preferir" é:',
    alternativas: ['Prefiro química do que matemática', 'Prefiro mais química a matemática', 'Prefiro química a matemática', 'Prefiro antes química do que matemática', 'Prefiro química do que matemática'],
    correta: 2, explicacao: 'O verbo "preferir" não aceita termos intensificadores ("mais", "antes") nem a expressão "do que". Sua regência correta é: preferir algo a algo.' },
  { id: 257, materia: 'Português', grupo: 'Pontuação', dificuldade: 'Médio',
    enunciado: 'Assinale a alternativa em que o uso da vírgula está correto:',
    alternativas: ['O técnico, chegou cedo ao laboratório', 'O laboratório, que tem equipamentos modernos, foi reformado', 'O técnico analisou, a amostra com cuidado', 'O resultado, foi positivo', 'O técnico disse, que a análise estava correta'],
    correta: 1, explicacao: 'As vírgulas isolam corretamente uma oração intercalada (explicativa): "que tem equipamentos modernos". Nas demais, a vírgula separa incorretamente sujeito e verbo.' },
  { id: 258, materia: 'Português', grupo: 'Pontuação', dificuldade: 'Médio',
    enunciado: 'O ponto e vírgula (;) é utilizado para:',
    alternativas: ['Separar orações coordenadas extensas ou que já contêm vírgulas', 'Indicar o final de uma frase', 'Introduzir uma citação', 'Separar sujeito e verbo', 'Indicar uma pausa curta'],
    correta: 0, explicacao: 'O ponto e vírgula é usado para separar orações coordenadas extensas, especialmente quando já há vírgulas no interior delas, e para separar itens de uma enumeração.' },
  { id: 259, materia: 'Português', grupo: 'Reescritura e Problemas da Língua', dificuldade: 'Médio',
    enunciado: 'Transformando a frase "O controle de qualidade aprovou o lote" para a voz passiva analítica, obtém-se:',
    alternativas: ['O lote aprovou o controle de qualidade', 'O lote foi aprovado pelo controle de qualidade', 'O lote é aprovado pelo controle de qualidade', 'O lote será aprovado pelo controle de qualidade', 'Aprovou-se o lote pelo controle de qualidade'],
    correta: 1, explicacao: 'Voz passiva analítica: sujeito paciente (o lote) + verbo auxiliar (foi) + particípio (aprovado) + agente da passiva (pelo controle de qualidade).' },
  { id: 260, materia: 'Português', grupo: 'Reescritura e Problemas da Língua', dificuldade: 'Difícil',
    enunciado: 'A frase "É necessário paciência para realizar análises" apresenta erro de:',
    alternativas: ['Ortografia', 'Concordância nominal', 'Regência verbal', 'Pontuação', 'Acentuação'],
    correta: 1, explicacao: 'O correto é "É necessária paciência" porque o adjetivo "necessária" concorda com o substantivo "paciência" quando este vem acompanhado de artigo (a paciência). Sem artigo, "é necessário" fica invariável.' },
  // ---- MATEMÁTICA (10 novas) ----
  { id: 261, materia: 'Matemática', grupo: 'Aritmética e Problemas', dificuldade: 'Médio',
    enunciado: 'Um técnico precisa diluir um produto químico na proporção de 1:4 (produto:água). Se ele possui 500 mL do produto, qual o volume total de solução preparada?',
    alternativas: ['1.000 mL', '1.500 mL', '2.000 mL', '2.500 mL', '3.000 mL'],
    correta: 2, explicacao: 'Proporção 1:4 significa 1 parte de produto para 4 partes de água. Volume de água = 4 x 500 = 2000 mL. Volume total = 500 + 2000 = 2500 mL.' },
  { id: 262, materia: 'Matemática', grupo: 'Aritmética e Problemas', dificuldade: 'Difícil',
    enunciado: 'Em um laboratório, 4 analistas realizam 120 análises em 6 horas. Quantos analistas são necessários para realizar 180 análises em 4 horas?',
    alternativas: ['6', '7', '8', '9', '10'],
    correta: 2, explicacao: 'Regra de três composta: 4 analistas x 6 h = 120 análises; X analistas x 4 h = 180 análises. X = 4 x (180/120) x (6/4) = 4 x 1,5 x 1,5 = 9 analistas.' },
  { id: 263, materia: 'Matemática', grupo: 'Geometria', dificuldade: 'Médio',
    enunciado: 'Um reservatório cilíndrico tem raio da base 2 m e altura 5 m. O volume máximo de líquido que pode ser armazenado é: (Use pi = 3,14)',
    alternativas: ['31,4 m³', '62,8 m³', '94,2 m³', '125,6 m³', '157,0 m³'],
    correta: 1, explicacao: 'Volume do cilindro: V = pi x r² x h = 3,14 x 4 x 5 = 3,14 x 20 = 62,8 m³.' },
  { id: 264, materia: 'Matemática', grupo: 'Geometria', dificuldade: 'Fácil',
    enunciado: 'Um técnico precisa calcular a área total de um cubo cuja aresta mede 4 cm. A área total é:',
    alternativas: ['64 cm²', '80 cm²', '96 cm²', '100 cm²', '120 cm²'],
    correta: 2, explicacao: 'Área total do cubo = 6 x a² = 6 x 4² = 6 x 16 = 96 cm².' },
  { id: 265, materia: 'Matemática', grupo: 'Funções', dificuldade: 'Fácil',
    enunciado: 'Se f(x) = 3x - 5, o valor de f(4) - f(2) é:',
    alternativas: ['3', '4', '5', '6', '7'],
    correta: 3, explicacao: 'f(4) = 3x4 - 5 = 12 - 5 = 7. f(2) = 3x2 - 5 = 6 - 5 = 1. f(4) - f(2) = 7 - 1 = 6.' },
  { id: 266, materia: 'Matemática', grupo: 'Funções', dificuldade: 'Fácil',
    enunciado: 'O zero da função f(x) = -2x + 8 é:',
    alternativas: ['-4', '-2', '2', '4', '8'],
    correta: 3, explicacao: 'O zero da função é o valor de x que torna f(x) = 0. -2x + 8 = 0 -> 2x = 8 -> x = 4.' },
  { id: 267, materia: 'Matemática', grupo: 'Estatística', dificuldade: 'Fácil',
    enunciado: 'Em um conjunto de dados, a mediana é o valor que:',
    alternativas: ['Aparece com maior frequência', 'Divide o conjunto em duas partes iguais', 'É a média entre o maior e o menor valor', 'É a raiz quadrada da variância', 'É a soma de todos os valores dividida pelo número de elementos'],
    correta: 1, explicacao: 'A mediana é o valor central de um conjunto de dados ordenado, dividindo-o em duas metades com o mesmo número de elementos.' },
  { id: 268, materia: 'Matemática', grupo: 'Probabilidade', dificuldade: 'Fácil',
    enunciado: 'Em uma caixa há 5 bolas vermelhas, 3 azuis e 2 verdes. Retirando-se uma bola ao acaso, a probabilidade de ela ser azul é:',
    alternativas: ['10%', '20%', '30%', '40%', '50%'],
    correta: 2, explicacao: 'Total de bolas = 5 + 3 + 2 = 10. Probabilidade = 3/10 = 0,30 = 30%.' },
  { id: 269, materia: 'Matemática', grupo: 'Matemática Financeira', dificuldade: 'Médio',
    enunciado: 'Um equipamento de laboratório sofre depreciação linear de 10% ao ano sobre o valor inicial. Se foi comprado por R$ 30.000,00, qual será seu valor após 3 anos?',
    alternativas: ['R$ 21.000,00', 'R$ 24.000,00', 'R$ 25.000,00', 'R$ 27.000,00', 'R$ 30.000,00'],
    correta: 0, explicacao: 'Depreciação anual = 10% de 30.000 = R$ 3.000,00. Em 3 anos = 3 x 3.000 = R$ 9.000,00. Valor após 3 anos = 30.000 - 9.000 = R$ 21.000,00.' },
  { id: 270, materia: 'Matemática', grupo: 'Análise Combinatória e Probabilidade', dificuldade: 'Médio',
    enunciado: 'De quantas maneiras diferentes um técnico pode escolher 3 amostras de um lote de 8 amostras para análise?',
    alternativas: ['24', '56', '112', '168', '336'],
    correta: 1, explicacao: 'Combinação de 8 elementos tomados 3 a 3: C(8,3) = 8!/(3!x5!) = (8x7x6)/(3x2x1) = 336/6 = 56.' },
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
    const SESSAO_KEY = 'petro_quimica_sessao';
    function gerarToken() {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    const FEATURES_BLOQUEADAS_DEMO = new Set([
      'ciclo', 'horas', 'simulados', 'erros',
      'diario', 'relatorio', 'exercicios', 'admin'
    ]);
    const isDemo = computed(() =>
      usuarioAtual.value?.usuario === 'estudante' && usuarioAtual.value?.role !== 'admin'
    );
    function featureBloqueada(v) {
      return isDemo.value && FEATURES_BLOQUEADAS_DEMO.has(v);
    }

    const usuarioAtual = ref(null);
    const autenticado = ref(false);
    const erroLogin = ref(false);
    const loginUsuario = ref('');
    const loginSenha = ref('');
    const mostrarSenha = ref(false);
    const mensagemErro = ref('');
    const mostrarInfoPremium = ref(false);
    const isPremium = ref(false);
    const visitantesOnline = ref(0);
    const visitantesExibir = ref(32);
    let animFrameId = null;

    function animarNumero(alvo) {
      const seguro = Math.max(32, alvo);
      const inicio = visitantesExibir.value;
      const diff = seguro - inicio;
      const passos = 20;
      let passo = 0;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      function tick() {
        passo++;
        const progresso = Math.min(passo / passos, 1);
        const curvo = 1 - Math.pow(1 - progresso, 3);
        visitantesExibir.value = Math.round(inicio + diff * curvo);
        if (passo < passos) animFrameId = requestAnimationFrame(tick);
      }
      tick();
    }
    const visitasLista = ref([]);
    const carregandoVisitas = ref(false);
    const depoimentos = [
      { nome: 'Carlos S.', cidade: 'São Paulo, SP', texto: 'Material bem organizado e atualizado com o edital. Consegui estudar de forma consistente.', estrelas: 5 },
      { nome: 'Ana O.', cidade: 'Rio de Janeiro, RJ', texto: 'As questões são muito parecidas com o estilo Cesgranrio. Isso fez diferença na minha preparação.', estrelas: 5 },
      { nome: 'Pedro S.', cidade: 'Belo Horizonte, MG', texto: 'Custo-benefício excelente. Usei todos os dias até a prova.', estrelas: 5 },
      { nome: 'Juliana C.', cidade: 'Porto Alegre, RS', texto: 'O ciclo de estudos me ajudou a manter a disciplina. Recomendo.', estrelas: 5 },
      { nome: 'Marcos L.', cidade: 'Salvador, BA', texto: 'Plano de estudos bem estruturado, consegui organizar minha rotina.', estrelas: 5 },
      { nome: 'Fernanda R.', cidade: 'Curitiba, PR', texto: 'Conteúdo completo e direto ao ponto. Aprovada no concurso!', estrelas: 5 },
      { nome: 'Lucas P.', cidade: 'Brasília, DF', texto: 'Os flashcards são ótimos para revisão rápida. Usei muito.', estrelas: 5 },
      { nome: 'Camila S.', cidade: 'Florianópolis, SC', texto: 'Ótimo material de apoio para quem está começando do zero.', estrelas: 4 },
      { nome: 'Rafael C.', cidade: 'Recife, PE', texto: 'Valeu a pena o investimento. Conteúdo de qualidade.', estrelas: 5 },
      { nome: 'Beatriz M.', cidade: 'Fortaleza, CE', texto: 'Consegui ver meu progresso ao longo do tempo, muito motivador.', estrelas: 5 }
    ];

    function logout() {
      usuarioAtual.value = null;
      autenticado.value = false;
      sessionStorage.removeItem(SESSAO_KEY);
      localStorage.removeItem(SESSAO_KEY);
      view.value = 'dashboard';
    }

    function verificarSessao() {
      const local = localStorage.getItem(SESSAO_KEY);
      const session = sessionStorage.getItem(SESSAO_KEY);
      if (!session) {
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (!parsed?.user?.usuario) { logout(); return; }
            usuarioAtual.value = parsed.user;
            autenticado.value = true;
            sessionStorage.setItem(SESSAO_KEY, local);
          } catch { logout() }
        }
        return;
      }
      if (!local) { logout(); return; }
      try {
        const localParsed = JSON.parse(local);
        const sessionParsed = JSON.parse(session);
        if (!localParsed || !sessionParsed) { logout(); return; }
        if (localParsed.token !== sessionParsed.token) { logout(); return; }
        usuarioAtual.value = localParsed.user;
        autenticado.value = true;
      } catch { logout() }
    }

    async function handleLogin(usuario, senha) {
      const user = await autenticar(usuario, senha);
      if (user) {
        usuarioAtual.value = user;
        autenticado.value = true;
        erroLogin.value = false;
        const sessao = { user, token: gerarToken(), timestamp: Date.now() };
        sessionStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
        localStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
        verificarPremium();
      } else {
        erroLogin.value = true;
        mensagemErro.value = 'Usuario ou senha invalidos';
      }
    }

    async function comprarPremium() {
      if (!usuarioAtual.value) {
        window.open('https://wa.me/5551983098650?text=Ol%C3%A1!%20Quero%20adquirir%20o%20Premium%20da%20Petrobras%20Academy%20por%20R%24%2049%2C90', '_blank');
        return;
      }
      try {
        const r = await fetch('/api/mercadopago/preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario: usuarioAtual.value.usuario })
        });
        const data = await r.json();
        if (data.init_point) window.location.href = data.init_point;
        else alert('Erro ao gerar pagamento. Tente novamente.');
      } catch {
        alert('Erro de conexao. Tente novamente.');
      }
    }

    async function verificarPremium() {
      const user = usuarioAtual.value;
      if (!user) { isPremium.value = false; return; }
      try {
        const r = await fetch(`/api/premium/status/${user.usuario}`);
        const data = await r.json();
        isPremium.value = data.premium;
      } catch { isPremium.value = false; }
    }

    // === VISITAS ===
    async function registrarVisita() {
      try {
        const r = await fetch('/api/visitas/registrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAgent: navigator.userAgent, pagina: window.location.hash || '/' })
        });
        const data = await r.json();
        visitantesOnline.value = data.visitantesUnicos || data.total || 0;
        animarNumero(visitantesOnline.value);
      } catch { animarNumero(0); }
    }

    async function carregarVisitas() {
      carregandoVisitas.value = true;
      try {
        const r = await fetch('/api/visitas/total');
        const data = await r.json();
        visitantesOnline.value = data.visitantesUnicos || 0;
        animarNumero(visitantesOnline.value);
        visitasLista.value = data.visitas || [];
      } catch { animarNumero(0); }
      carregandoVisitas.value = false;
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
    const { erros, editandoErro, errosAgrupados, totalErros, carregandoErros, novoErro, salvarErro, editarErro, removerErro, cancelarErro, carregarErros, errosPorMateria, errosFrequentes, regrasDeOuro, registrarRevisao, marcarRevisaoAcertou } = useErros();

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
    const { checklist, gruposAbertos, filtro, abaAtiva, toggleAba, chaveItem, checkId, alternarItem, toggleGrupo,
            totalItens, itensConcluidos, itensConcluidosGrupo, progressoMateria,
            totalGeral, totalConcluidoGeral, progressoGeral,
            conteudosFiltrados, expandirTudo, colapsarTudo } = useChecklist(CONTEUDOS);

    // --- Usando o Composable para a feature de Revisões ---
    const { revisoes, revisoesPendentes, revisoesHoje, agendarRevisao, concluirRevisao, removerRevisao } = useRevisoes(REVISAO_INTERVALOS);

    // --- Usando o Composable para a feature de Flashcards ---
    const { flashcards, formFlashcard, editandoFlashcard, carregandoFlashcards, flashcardsAgrupados, carregarFlashcards, novoFlashcard, salvarFlashcard, editarFlashcard, removerFlashcard, cancelarFlashcard, modoRevisao, configurandoRevisao, deckRevisao, cardAtualIndex, cardAtual, progressoRevisao, opcoesRevisao, abrirConfiguracaoRevisao, iniciarRevisao, proximoCard, marcarResultado, finalizarRevisao, cancelarConfiguracaoRevisao, reiniciarFlashcards } = useFlashcards();

    // --- Usando o Composable para Admin ---
    const admin = useAdmin();

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
      window.addEventListener('storage', (e) => {
        if (e.key === SESSAO_KEY) verificarSessao();
      });
      verificarSessao();
      registrarVisita();

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
      if (novaView === 'admin') {
        admin.carregarAdmin();
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
      plano: 'Plano de Estudos',
      premium: 'Petrobras Academy Premium',
      admin: 'Administração'
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
      plano: 'Consulte o cronograma e conteúdos programáticos',
      premium: 'Desbloqueie todas as ferramentas de estudo',
      admin: 'Gerenciar usuários da plataforma'
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
      handleLogin, logout, loginUsuario, loginSenha, mostrarSenha, mensagemErro,
      comprarPremium, isPremium, mostrarInfoPremium, depoimentos,
      visitantesOnline, visitantesExibir, registrarVisita, carregarVisitas, carregandoVisitas,
      view, menuAberta, semanaAtual,
      tema, diasSemana, carregando,
      tituloView, subtituloView,
      semanasPlano, metaHoras, totalMeta,
      conteudos: CONTEUDOS,
      // Expondo tudo do Composable de Checklist
      checklist, gruposAbertos, filtro, abaAtiva, toggleAba, chaveItem, checkId, alternarItem, toggleGrupo,
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
      irPara, alternarTema, featureBloqueada,
      // Expondo tudo do Composable de Erros
      erros, editandoErro, errosAgrupados, totalErros,
      carregandoErros, novoErro, salvarErro, editarErro, removerErro, cancelarErro,
      errosPorMateria, errosFrequentes, regrasDeOuro, registrarRevisao, marcarRevisaoAcertou,
      // Expondo tudo do Composable de Diário
      CHECKLIST_ITENS, diario, diarioData, diarioHoje, diarioProgresso, alternarDiario,
      // Expondo tudo do Composable de Revisões
      revisoes, revisoesPendentes, revisoesHoje,
      agendarRevisao, concluirRevisao, removerRevisao,
      // Expondo tudo do Composable de Flashcards
      flashcards, formFlashcard, editandoFlashcard, carregandoFlashcards, flashcardsAgrupados,
      novoFlashcard, salvarFlashcard, editarFlashcard, removerFlashcard, cancelarFlashcard,
      modoRevisao, configurandoRevisao, deckRevisao, cardAtualIndex, cardAtual, progressoRevisao, opcoesRevisao, 
      abrirConfiguracaoRevisao, iniciarRevisao, proximoCard, marcarResultado, finalizarRevisao, cancelarConfiguracaoRevisao, reiniciarFlashcards,
      // Expondo tudo do Composable de Ciclo de Estudos
      ciclo, materiaAtual, idxOriginalAtual, cicloCompleto, cicloExpandido, completosPorItem,
      avancarCiclo, reiniciarCiclo,
      CICLO_ESTUDOS, REVISAO_INTERVALOS, DIAS_SEMANA,
      conteudosFiltrados, expandirTudo, colapsarTudo,
      // Admin
      adminUsuarios: admin.usuarios,
      adminEditando: admin.editandoUsuario,
      adminTotal: admin.totalUsuarios,
      adminAdmins: admin.admins,
      adminComuns: admin.usuariosComuns,
      adminNovo: admin.novoUsuario,
      adminEditar: admin.editarUsuario,
      adminSalvar: admin.salvarUsuario,
      adminRemover: admin.removerUsuario,
      adminCancelar: admin.cancelarEdicao,
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
