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
const { revisoesHoje, diasEstudoConsecutivos } = useDiario();
const { cicloCompleto } = useCiclo();

const conteudos = CONTEUDOS;
const metaHoras = META_HORAS_SEMANA;
</script>

<template>
  <div>
    <div v-if="diasEstudoConsecutivos > 0" class="streak-card">
      <span class="streak-icone">🔥</span>
      <div>
        <div class="streak-numero">{{ diasEstudoConsecutivos }} {{ diasEstudoConsecutivos === 1 ? 'dia' : 'dias' }}</div>
        <div class="streak-rotulo">de estudo consecutivo</div>
      </div>
    </div>

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
      <div class="cartao-stat roxo compacto">
        <div class="valor">{{ totalErros }}</div>
        <div class="rotulo">Erros no caderno</div>
      </div>
      <div class="cartao-stat roxo compacto">
        <div class="valor">{{ cicloCompleto }}%</div>
        <div class="rotulo">Ciclo concluído</div>
      </div>
      <div class="cartao-stat laranja compacto">
        <div class="valor">{{ totalExerciciosSugeridos }}</div>
        <div class="rotulo">Exercícios sugeridos</div>
      </div>
      <div class="cartao-stat compacto" :class="revisoesHoje.length > 0 ? 'vermelho' : 'verde'">
        <div class="valor">{{ revisoesHoje.length }}</div>
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
      <p class="resumo-plano">
        <strong>12 semanas</strong> de estudo ·
        <strong>{{ metaHoras }}h/semana</strong> ·
        <strong>60 questões</strong> (20 básicas eliminatórias + 40 específicas classificatórias)<br>
        Banca: <strong>Cesgranrio</strong> · Última prova referência: 2018
      </p>
    </div>
  </div>
</template>

<style scoped>
.streak-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--card);
  border: 1px solid var(--borda);
  border-radius: var(--raio);
  padding: 16px 20px;
  margin-bottom: 20px;
}

.streak-icone { font-size: 30px; line-height: 1; }
.streak-numero { font-family: var(--fonte-display); font-size: 24px; font-weight: 700; color: var(--primaria); }
.streak-rotulo { font-size: 13px; color: var(--texto-sec); }

.resumo-plano {
  font-size: 14px;
  line-height: 1.8;
  color: var(--texto-sec);
}
.resumo-plano strong { color: var(--texto); }

@media (max-width: 480px) {
  .streak-card { padding: 12px 16px; gap: 10px; }
  .streak-icone { font-size: 24px; }
  .streak-numero { font-size: 20px; }
}
</style>
