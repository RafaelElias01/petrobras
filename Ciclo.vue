<script setup>
import { useCiclo } from './useCiclo.js';

const {
  materiaAtual, cicloCompleto, cicloExpandido, ciclo,
  CICLO_ESTUDOS, idxOriginalAtual, completosPorItem, totalPonderado,
  avancarCiclo, reiniciarCiclo
} = useCiclo();
</script>

<template>
  <div>
    <div class="grade-cartoes">
      <div class="cartao-stat" :style="{ borderTopColor: '#8b5cf6' }">
        <div class="valor" style="font-size:24px;color:#8b5cf6;">{{ materiaAtual.materia }}</div>
        <div class="rotulo">Próxima matéria do ciclo</div>
      </div>
      <div class="cartao-stat" :style="{ borderTopColor: '#8b5cf6' }">
        <div class="valor" style="font-size:24px;color:#8b5cf6;">{{ materiaAtual.tempo }} min</div>
        <div class="rotulo">Tempo sugerido para hoje</div>
      </div>
      <div class="cartao-stat" :class="cicloCompleto >= 100 ? 'verde' : ''">
        <div class="valor">{{ cicloCompleto }}%</div>
        <div class="rotulo">Ciclo completo</div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">
        <span>Sequência do Ciclo</span>
        <span style="font-size:13px;color:var(--texto-sec);font-weight:400;">
          ({{ ciclo.posicao + 1 }} de {{ totalPonderado }}) ponderado por peso
        </span>
        <button @click="cicloExpandido = !cicloExpandido" style="background:none;border:1px solid var(--borda);border-radius:6px;padding:6px 14px;cursor:pointer;font-size:13px;">
          {{ cicloExpandido ? 'Recolher' : 'Expandir' }}
        </button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
        <div v-for="(m, i) in CICLO_ESTUDOS" :key="i"
          style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;font-size:13px;cursor:default;"
          :style="{
            background: i === idxOriginalAtual ? '#8b5cf6' : completosPorItem[i] > 0 ? '#10b981' : 'var(--bg)',
            color: i === idxOriginalAtual || completosPorItem[i] > 0 ? '#fff' : 'var(--texto)',
            border: '1px solid ' + (i === idxOriginalAtual ? '#8b5cf6' : 'var(--borda)')
          }">
          <span>{{ m.icone }}</span>
          <span>{{ m.materia }}</span>
          <span style="opacity:0.7;font-size:12px;">{{ completosPorItem[i] }}/{{ m.peso }}</span>
        </div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button @click="avancarCiclo" style="padding:10px 24px;background:#8b5cf6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-family:inherit;">
          Concluí esta matéria → Avançar
        </button>
        <button @click="reiniciarCiclo" style="padding:10px 24px;background:transparent;color:var(--texto-sec);border:1px solid var(--borda);border-radius:8px;cursor:pointer;font-size:14px;font-family:inherit;">
          Reiniciar Ciclo
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">Metodologia da Sessão</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;font-size:14px;">
        <div style="padding:12px;background:var(--bg);border-radius:8px;">
          <strong style="color:var(--primaria);display:block;margin-bottom:4px;">0-25 min</strong>
          Teoria / Videoaula
        </div>
        <div style="padding:12px;background:var(--bg);border-radius:8px;">
          <strong style="color:var(--aviso);display:block;margin-bottom:4px;">25-30 min</strong>
          Pausa
        </div>
        <div style="padding:12px;background:var(--bg);border-radius:8px;">
          <strong style="color:var(--sucesso);display:block;margin-bottom:4px;">30-55 min</strong>
          Active Recall + Questões
        </div>
        <div style="padding:12px;background:var(--bg);border-radius:8px;">
          <strong style="color:var(--erro);display:block;margin-bottom:4px;">55-60 min</strong>
          Pausa
        </div>
        <div style="padding:12px;background:var(--bg);border-radius:8px;">
          <strong style="color:#8b5cf6;display:block;margin-bottom:4px;">60-80 min</strong>
          Correção + Caderno de Erros
        </div>
      </div>
      <div style="margin-top:16px;padding:16px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e;">
        💡 <strong>Tática dos 60%:</strong> Na prova, resolva primeiro as questões mais rápidas e fáceis de cada matéria. Deixe as longas e complexas para o final.
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 600px) {
  .cartao-stat .valor[style*="font-size:24px"] {
    font-size: 18px !important;
  }
}
</style>
