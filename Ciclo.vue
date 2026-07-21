<script setup>
import { useCiclo } from './useCiclo.js';
import IconeNav from './IconeNav.vue';

const {
  materiaAtual, cicloCompleto, cicloExpandido, ciclo,
  CICLO_ESTUDOS, idxOriginalAtual, completosPorItem, totalPonderado,
  avancarCiclo, reiniciarCiclo
} = useCiclo();
</script>

<template>
  <div>
    <div class="grade-cartoes">
      <div class="cartao-stat roxo">
        <div class="valor">{{ materiaAtual.materia }}</div>
        <div class="rotulo">Próxima matéria do ciclo</div>
      </div>
      <div class="cartao-stat roxo">
        <div class="valor">{{ materiaAtual.tempo }} min</div>
        <div class="rotulo">Tempo sugerido para hoje</div>
      </div>
      <div class="cartao-stat" :class="{ verde: cicloCompleto >= 100 }">
        <div class="valor">{{ cicloCompleto }}%</div>
        <div class="rotulo">Ciclo completo</div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">
        <div>
          <span>Sequência do Ciclo</span>
          <span class="card-subtitulo">
            ({{ ciclo.posicao + 1 }} de {{ totalPonderado }}) ponderado por peso
          </span>
        </div>
        <button @click="cicloExpandido = !cicloExpandido" class="btn-toggle">
          {{ cicloExpandido ? 'Recolher' : 'Expandir' }}
        </button>
      </div>
      <div class="ciclo-lista">
        <div v-for="(m, i) in CICLO_ESTUDOS" :key="i"
          class="ciclo-item"
          :class="{
            atual: i === idxOriginalAtual,
            completo: completosPorItem[i] > 0 && i !== idxOriginalAtual
          }"
        >
          <span class="ciclo-item-icone"><IconeNav :nome="m.icone" /></span>
          <span>{{ m.materia }}</span>
          <span class="ciclo-item-peso">{{ completosPorItem[i] }}/{{ m.peso }}</span>
        </div>
      </div>
      <div class="ciclo-actions">
        <button @click="avancarCiclo" class="btn-avancar">
          Concluí esta matéria → Avançar
        </button>
        <button @click="window.confirm('Tem certeza? Isso vai resetar todo o ciclo.') && reiniciarCiclo()" class="btn-reiniciar">
          Reiniciar Ciclo
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">Metodologia da Sessão (Pomodoro +)</div>
      <div class="metodologia-grid">
        <div class="metodologia-item"><strong class="c-primaria">0-25 min</strong> Teoria / Videoaula</div>
        <div class="metodologia-item"><strong class="c-aviso">25-30 min</strong> Pausa</div>
        <div class="metodologia-item"><strong class="c-sucesso">30-55 min</strong> Active Recall + Questões</div>
        <div class="metodologia-item"><strong class="c-erro">55-60 min</strong> Pausa</div>
        <div class="metodologia-item"><strong class="c-roxo">60-80 min</strong> Correção + Caderno de Erros</div>
      </div>
      <div class="tactic-box">
        💡 <strong>Tática dos 60%:</strong> Na prova, resolva primeiro as questões mais rápidas e fáceis de cada matéria. Deixe as longas e complexas para o final.
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-subtitulo {
  font-size: 13px;
  color: var(--texto-sec);
  font-weight: 400;
  margin-left: 8px;
}

.btn-toggle {
  background: none;
  border: 1px solid var(--borda);
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  color: var(--texto-sec);
  transition: all 0.2s;
}

.btn-toggle:hover {
  background: var(--bg);
  color: var(--texto);
}

.cartao-stat.roxo {
  border-top-color: #8b5cf6;
}
.cartao-stat.roxo .valor {
  color: #8b5cf6;
}

.cartao-stat .valor {
  font-size: 24px;
}

.ciclo-lista {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.ciclo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: default;
  background: var(--bg);
  color: var(--texto);
  border: 1px solid var(--borda);
  transition: all 0.2s ease;
}

.ciclo-item-icone {
  display: inline-flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.ciclo-item.atual {
  background: #8b5cf6;
  color: #fff;
  border-color: #8b5cf6;
}

.ciclo-item.completo {
  background: #10b981;
  color: #fff;
  border-color: #10b981;
}

.ciclo-item-peso {
  opacity: 0.7;
  font-size: 12px;
}

.ciclo-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-avancar {
  padding: 10px 24px;
  background: #8b5cf6;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}
.btn-avancar:hover {
  opacity: 0.9;
}

.btn-reiniciar {
  padding: 10px 24px;
  background: transparent;
  color: var(--texto-sec);
  border: 1px solid var(--borda);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}
.btn-reiniciar:hover {
  background: var(--bg);
  border-color: var(--texto-sec);
}

.metodologia-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  font-size: 14px;
}

.metodologia-item {
  padding: 12px;
  background: var(--bg);
  border-radius: 8px;
}

.metodologia-item strong {
  display: block;
  margin-bottom: 4px;
}

.tactic-box {
  margin-top: 16px;
  padding: 16px;
  background: #fef3c7;
  border-radius: 8px;
  font-size: 13px;
  color: #92400e;
}
[data-tema="dark"] .tactic-box {
  background: rgba(224,172,76,0.12);
  color: var(--texto);
}

@media (max-width: 1024px) {
  .metodologia-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}
@media (max-width: 768px) {
  .btn-toggle {
    padding: 10px 14px;
    min-height: 44px;
    font-size: 14px;
  }
  .btn-avancar, .btn-reiniciar {
    padding: 12px 24px;
    min-height: 44px;
    font-size: 16px;
  }
  .ciclo-actions {
    flex-direction: column;
  }
  .ciclo-actions button {
    width: 100%;
  }
  .metodologia-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .cartao-stat .valor {
    font-size: 18px;
  }
  .btn-toggle, .btn-avancar, .btn-reiniciar {
    min-height: 44px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .cartao-stat .valor {
    font-size: 16px;
  }
  .ciclo-item {
    font-size: 11px;
    padding: 6px 10px;
  }
}
</style>
