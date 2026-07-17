<script setup>
import { useCiclo } from './useCiclo.js';

const {
  materiaAtual, cicloCompleto, cicloExpandido, ciclo,
  CICLO_ESTUDOS, avancarCiclo, reiniciarCiclo
} = useCiclo();
</script>

<template>
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
      <button @click="cicloExpandido = !cicloExpandido" style="background:none;border:1px solid var(--borda);border-radius:6px;padding:6px 14px;cursor:pointer;font-size:13px;">
        {{ cicloExpandido ? 'Recolher' : 'Expandir' }}
      </button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
      <div v-for="(m, i) in CICLO_ESTUDOS" :key="i"
        style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;font-size:13px;cursor:default;"
        :style="{
          background: i === ciclo.posicao ? '#8b5cf6' : ciclo.concluido[m.materia+'-c'+i] ? '#10b981' : 'var(--bg)',
          color: i === ciclo.posicao ? '#fff' : ciclo.concluido[m.materia+'-c'+i] ? '#fff' : 'var(--texto)',
          border: '1px solid ' + (i === ciclo.posicao ? '#8b5cf6' : 'var(--borda)')
        }">
        <span>{{ m.icone }}</span>
        <span>{{ m.materia }}</span>
        <span style="opacity:0.7;font-size:12px;">{{ m.tempo }}min</span>
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
</template>
