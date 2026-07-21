import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { REVISAO_INTERVALOS } from './dados.js';
import { hojeLocalISO, dataLocalISO } from './dataLocal.js';
import { useHoras } from './useHoras.js';

let instance;

export function useDiario() {
  if (instance) {
    return instance;
  }

  const diario = ref(Armazenamento.carregar('diario', {}));

  const diarioData = ref(hojeLocalISO());

  watch(diario, (novoValor) => {
    Armazenamento.salvar('diario', novoValor);
  }, { deep: true });

  const diarioHoje = computed(() => diario.value[diarioData.value] || {});

  function alternarDiario(id) {
    const data = diarioData.value;
    if (!diario.value[data]) diario.value[data] = {};
    diario.value[data][id] = !diario.value[data][id];
  }

  const revisoes = ref(Armazenamento.carregar('revisoes', []));

  watch(revisoes, (novoValor) => {
    Armazenamento.salvar('revisoes', novoValor);
  }, { deep: true });

  // Não agenda revisão duplicada pro mesmo tópico se já existir uma pendente
  // (ex: usuário desmarca e marca o item de novo no mesmo dia).
  function agendarRevisao(topico, materia, dataOrigem) {
    const jaTemPendente = revisoes.value.some(r => r.topico === topico && r.materia === materia && !r.concluida);
    if (jaTemPendente) return;
    // new Date('YYYY-MM-DD') parseia como UTC meia-noite -- em fusos
    // negativos (Brasil) isso "volta" pro dia anterior em horário local,
    // fazendo `data.setDate(...)` operar sobre o dia errado. Constrói a data
    // a partir dos componentes explícitos (ano/mês/dia), sempre em horário
    // local, pra somar dias sem essa ambiguidade.
    const [ano, mes, dia] = dataOrigem.split('-').map(Number);
    REVISAO_INTERVALOS.forEach(intervalo => {
      const data = new Date(ano, mes - 1, dia + intervalo.dias);
      revisoes.value.push({
        id: Date.now() + Math.random(),
        topico,
        materia,
        data: dataLocalISO(data),
        intervalo: intervalo.rotulo,
        concluida: false
      });
    });
  }

  const revisoesPendentes = computed(() => revisoes.value.filter(r => !r.concluida && new Date(r.data) <= new Date(diarioData.value)));
  const revisoesHoje = computed(() => revisoes.value.filter(r => !r.concluida && r.data === hojeLocalISO()));

  function concluirRevisao(id) {
    const rev = revisoes.value.find(r => r.id === id);
    if (rev) rev.concluida = true;
  }

  // Dias consecutivos com pelo menos uma hora de estudo registrada, olhando
  // pra trás a partir de hoje até encontrar o primeiro dia sem registro.
  //
  // Antes isso lia de `diario`, que só é escrito por `alternarDiario` --
  // função que nenhum componente da UI chama em lugar nenhum do app (só o
  // teste unitário a exercita diretamente). Na prática `diario` nunca é
  // populado por uso real, então o streak sempre dava 0 no Dashboard, não
  // importa quanto o usuário estudasse. `horas` (useHoras.js) é a fonte real
  // de estudo do dia (escrita por adicionarHoras/setHora em Diario.vue,
  // Horas.vue, Ciclo.vue), então usamos ela aqui.
  const { horas } = useHoras();
  const diasEstudoConsecutivos = computed(() => {
    let streak = 0;
    const cursor = new Date();
    cursor.setMinutes(cursor.getMinutes() - cursor.getTimezoneOffset());
    for (let i = 0; i < 365; i++) {
      const chave = cursor.toISOString().slice(0, 10);
      const registros = horas.value[chave];
      const estudou = registros && Object.values(registros).some(v => v > 0);
      if (!estudou) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  });

  instance = { diarioData, diarioHoje, alternarDiario, revisoes, agendarRevisao, revisoesPendentes, revisoesHoje, concluirRevisao, diasEstudoConsecutivos, removerRevisao: (id) => revisoes.value = revisoes.value.filter(r => r.id !== id) };
  return instance;
}
