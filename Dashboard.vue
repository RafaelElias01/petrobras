<script setup>
import { useChecklist } from './useChecklist.js';
import { useHoras } from './useHoras.js';
import { useSimulados } from './useSimulados.js';
import { useErros } from './useErros.js';
import { useDiario } from './useDiario.js';
import { useCiclo } from './useCiclo.js';
import { CONTEUDOS, META_HORAS_SEMANA } from './dados.js';

const { progressoGeral, progressoMateria, itensConcluidos, totalItens, totalExerciciosSugeridos } = useChecklist();
const { horasSemanaAtual, metaSemanaCss } = useHoras();
const { simuladoStatus } = useSimulados();
const { totalErros } = useErros();
const { revisoesHoje } = useDiario();
const { cicloCompleto } = useCiclo();

const conteudos = CONTEUDOS;
const metaHoras = META_HORAS_SEMANA;
</script>

<template>
  <div>
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
      <div class="cartao-stat" style="border-top-color:#8b5cf6;">
        <div class="valor" style="font-size:20px;color:#8b5cf6;">{{ totalErros }}</div>
        <div class="rotulo">Erros no caderno</div>
      </div>
      <div class="cartao-stat" style="border-top-color:#8b5cf6;">
        <div class="valor" style="font-size:20px;color:#8b5cf6;">{{ cicloCompleto }}%</div>
        <div class="rotulo">Ciclo concluído</div>
      </div>
      <div class="cartao-stat" style="border-top-color:#f59e0b;">
        <div class="valor" style="font-size:20px;color:#f59e0b;">{{ totalExerciciosSugeridos }}</div>
        <div class="rotulo">Exercícios sugeridos</div>
      </div>
      <div class="cartao-stat" :class="revisoesHoje.length > 0 ? 'vermelho' : 'verde'">
        <div class="valor" style="font-size:20px;">{{ revisoesHoje.length }}</div>
        <div class="rotulo">Revisões hoje</div>
      </div>
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
      <div class="card-titulo">Resumo do Plano</div>
      <div style="font-size:14px;line-height:1.8;color:var(--texto-sec);">
        <strong style="color:var(--texto)">12 semanas</strong> de estudo ·
        <strong style="color:var(--texto)">{{ metaHoras }}h/semana</strong> ·
        <strong style="color:var(--texto)">60 questões</strong> (20 básicas eliminatórias + 40 específicas classificatórias)<br>
        Banca: <strong>Cesgranrio</strong> · Última prova referência: 2018
      </div>
    </div>
  </div>
</template>
