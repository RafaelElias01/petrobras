<script setup>
import { useChecklist } from './useChecklist.js';
import { useHoras } from './useHoras.js';
import { useSimulados } from './useSimulados.js';
import { useErros } from './useErros.js';
import { useDiario } from './useDiario.js';
import { useCiclo } from './useCiclo.js';
import { CONTEUDOS, META_HORAS_SEMANA } from './dados.js';

// O Dashboard precisa de um pouco de cada composable para exibir os status.
const { progressoGeral, progressoMateria, itensConcluidos, totalItens } = useChecklist();
const { horasSemanaAtual, metaSemanaCss } = useHoras();
const { simuladoStatus } = useSimulados();
const { totalErros } = useErros();
const { revisoesHoje } = useDiario();
const { cicloCompleto } = useCiclo();

const conteudos = CONTEUDOS;
const metaHoras = META_HORAS_SEMANA;
</script>

<template>
  <!-- Todo o HTML a seguir foi copiado do seu index.html original -->
  <div class="grade-cartoes">
    <div class="cartao-stat verde">
      <div class="valor">{{ progressoGeral }}%</div>
      <div class="rotulo">Conteúdo Estudado</div>
    </div>
    <div class="cartao-stat">
      <div class="valor">{{ horasSemanaAtual }}</div>
      <div class="rotulo">h nesta semana</div>
    </div>
    <div class="cartao-stat" :class="metaSemanaCss">
      <div class="valor">{{ horasSemanaAtual }}/{{ metaHoras }}</div>
      <div class="rotulo">Meta semanal (h)</div>
    </div>
    <div class="cartao-stat" :class="simuladoStatus.classe">
      <div class="valor">{{ simuladoStatus.texto }}</div>
      <div class="rotulo">Último simulado</div>
    </div>
  </div>

  <div class="grade-cartoes">
    <!-- ... (O restante dos cartões do dashboard) ... -->
  </div>

  <div class="card">
    <div class="card-titulo">Progresso por Matéria</div>
    <div v-for="m in conteudos" :key="m.id" class="materia-progresso">
      <div class="cabecalho">
        <span class="nome">{{ m.icone }} {{ m.nome }}</span>
        <span class="pct">{{ progressoMateria(m) }}% ({{ itensConcluidos(m) }}/{{ totalItens(m) }})</span>
      </div>
      <div class="barra-progresso">
        <div class="preenchimento" :style="{ width: progressoMateria(m) + '%', background: m.cor }"></div>
      </div>
    </div>
  </div>

  <div class="card">
    <!-- ... (O card "Resumo do Plano") ... -->
  </div>
</template>