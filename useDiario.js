import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { REVISAO_INTERVALOS } from './dados.js';

let instance;

export function useDiario() {
  if (instance) {
    return instance;
  }

  const diario = ref(Armazenamento.carregar('diario', {}));

  function hojeLocalISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

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

  function agendarRevisao(topico, materia, dataOrigem) {
    REVISAO_INTERVALOS.forEach(intervalo => {
      const data = new Date(dataOrigem);
      data.setDate(data.getDate() + intervalo.dias);
      revisoes.value.push({
        id: Date.now() + Math.random(),
        topico,
        materia,
        data: data.toISOString().slice(0, 10),
        intervalo: intervalo.rotulo,
        concluida: false
      });
    });
    alert(`${REVISAO_INTERVALOS.length} revisões agendadas para '${topico}'!`);
  }

  const revisoesPendentes = computed(() => revisoes.value.filter(r => !r.concluida && new Date(r.data) <= new Date(diarioData.value)));
  const revisoesHoje = computed(() => revisoes.value.filter(r => !r.concluida && r.data === hojeLocalISO()));

  function concluirRevisao(id) {
    const rev = revisoes.value.find(r => r.id === id);
    if (rev) rev.concluida = true;
  }

  // Dias consecutivos com pelo menos um item do diário concluído, olhando
  // pra trás a partir de hoje até encontrar o primeiro dia sem registro.
  const diasEstudoConsecutivos = computed(() => {
    let streak = 0;
    const cursor = new Date();
    cursor.setMinutes(cursor.getMinutes() - cursor.getTimezoneOffset());
    for (let i = 0; i < 365; i++) {
      const chave = cursor.toISOString().slice(0, 10);
      const dia = diario.value[chave];
      const estudou = dia && Object.values(dia).some(Boolean);
      if (!estudou) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  });

  instance = { diarioData, diarioHoje, alternarDiario, revisoes, agendarRevisao, revisoesPendentes, revisoesHoje, concluirRevisao, diasEstudoConsecutivos, removerRevisao: (id) => revisoes.value = revisoes.value.filter(r => r.id !== id) };
  return instance;
}
