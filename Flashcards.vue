<script setup>
import { onMounted, computed } from 'vue';
import { useFlashcards } from './useFlashcards.js';
import { useFlashcardReview } from './useFlashcardReview.js';

const {
  flashcards, editandoFlashcard, flashcardsAgrupados, carregarFlashcards,
  novoFlashcard, salvarFlashcard, editarFlashcard, removerFlashcard, cancelarFlashcard,
  cardsParaRevisar, MATERIAS,
} = useFlashcards();

const {
  modoRevisao, configurandoRevisao, deckRevisao, cardAtual, progressoRevisao, opcoesRevisao,
  abrirConfiguracaoRevisao, iniciarRevisao, proximoCard, marcarResultado, finalizarRevisao,
  cancelarConfiguracaoRevisao
} = useFlashcardReview(flashcards, cardsParaRevisar);

const totalCards = computed(() => flashcards.value.length);

onMounted(() => {
  carregarFlashcards();
});

// `window` não está na lista de globais que o compilador do Vue resolve
// dentro de expressões de template -- usado direto no @click, vira
// `_ctx.window.confirm` e quebra em produção ("Cannot read properties of
// undefined (reading 'confirm')"). Precisa estar aqui no <script setup>.
function handleRemoverFlashcard(id) {
  if (window.confirm('Remover este flashcard?')) {
    removerFlashcard(id);
  }
}
</script>

<template>
  <div class="flashcards-page">
    <div v-if="modoRevisao" class="revisao-mode">
      <div class="grade-cartoes">
        <div class="cartao-stat azul">
          <div class="valor">{{ progressoRevisao }}%</div>
          <div class="rotulo">Progresso da revisão</div>
        </div>
        <div class="cartao-stat">
          <div class="valor" style="font-size:20px;">{{ deckRevisao.length - (cardAtual ? deckRevisao.indexOf(cardAtual) : 0) }} / {{ deckRevisao.length }}</div>
          <div class="rotulo">Restantes</div>
        </div>
      </div>

      <div class="flashcard-review" v-if="cardAtual">
        <div class="flashcard-materia">{{ cardAtual.materia }}</div>
        <div class="flashcard-card" :class="{ virado: cardAtual.virado }" @click="!cardAtual.virado && (cardAtual.virado = true)">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="flashcard-label">PERGUNTA</div>
              <div class="flashcard-text">{{ cardAtual.frente }}</div>
              <div class="flashcard-hint">Clique para ver a resposta</div>
            </div>
            <div class="flashcard-back">
              <div class="flashcard-label">RESPOSTA</div>
              <div class="flashcard-text">{{ cardAtual.verso }}</div>
            </div>
          </div>
        </div>

        <transition name="slide-up">
          <div v-if="cardAtual.virado" class="flashcard-actions">
            <p class="flashcard-ask">Como foi sua resposta?</p>
            <div class="flashcard-buttons">
              <button class="btn-acertou" @click="marcarResultado(true)">
                <span class="btn-icon">✓</span>
                <span class="btn-label">Acertei</span>
              </button>
              <button class="btn-errei" @click="marcarResultado(false)">
                <span class="btn-icon">✕</span>
                <span class="btn-label">Errei</span>
              </button>
            </div>
          </div>
        </transition>
      </div>

      <div class="revisao-footer">
        <button class="btn-encerrar" @click="finalizarRevisao">Encerrar revisão</button>
      </div>
    </div>

    <div v-else>
      <div class="grade-cartoes">
        <div class="cartao-stat azul">
          <div class="valor">{{ totalCards }}</div>
          <div class="rotulo">Total de flashcards</div>
        </div>
        <div class="cartao-stat" style="border-top-color:#f59e0b;">
          <div class="valor" style="color:#f59e0b;">{{ cardsParaRevisar.length }}</div>
          <div class="rotulo">Pendentes de revisão</div>
        </div>
        <div class="cartao-stat verde" v-if="totalCards > 0">
          <div class="valor">{{ Math.round((totalCards - cardsParaRevisar.length) / totalCards * 100) }}%</div>
          <div class="rotulo">Dominados (fora da revisão)</div>
        </div>
      </div>

      <div class="card" v-if="editandoFlashcard">
        <div class="card-titulo">
          <span>{{ editandoFlashcard.id ? '✏️ Editar Flashcard' : '➕ Novo Flashcard' }}</span>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label for="flashcard-materia">Matéria</label>
            <select id="flashcard-materia" v-model="editandoFlashcard.materia">
              <option value="">Selecione...</option>
              <option v-for="m in MATERIAS" :key="m">{{ m }}</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label for="flashcard-frente">Frente (pergunta)</label>
            <textarea id="flashcard-frente" v-model="editandoFlashcard.frente" placeholder="Ex: O que é pH?" rows="3"></textarea>
          </div>
          <div class="form-group full-width">
            <label for="flashcard-verso">Verso (resposta)</label>
            <textarea id="flashcard-verso" v-model="editandoFlashcard.verso" placeholder="Ex: Potencial hidrogeniônico..." rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button class="btn-primary" @click="salvarFlashcard">💾 Salvar</button>
            <button class="btn-secondary" @click="cancelarFlashcard">Cancelar</button>
          </div>
        </div>
      </div>

      <div class="card" v-else>
        <div class="card-titulo">
          <span>📚 Flashcards</span>
          <span class="card-count">{{ totalCards }} cards</span>
        </div>

        <div class="flashcard-toolbar">
          <button class="btn-primary" @click="novoFlashcard">➕ Novo Flashcard</button>
          <button class="btn-revisar" @click="abrirConfiguracaoRevisao" :disabled="totalCards === 0">
            ▶ Iniciar Revisão
          </button>
        </div>

        <div v-if="configurandoRevisao" class="config-revisao">
          <h4>Configurar Revisão</h4>
          <div class="config-row">
            <label>Matérias (deixe vazio para todas)</label>
            <div class="config-checkboxes">
              <label v-for="m in MATERIAS" :key="m" class="config-check">
                <input type="checkbox" :value="m" v-model="opcoesRevisao.materias"> {{ m }}
              </label>
            </div>
          </div>
          <div class="config-row">
            <label for="flashcard-num-cards">Número de cards</label>
            <input id="flashcard-num-cards" type="number" v-model.number="opcoesRevisao.numCards" min="1" max="100" class="config-input">
          </div>
          <div class="config-row">
            <label class="config-check">
              <input type="checkbox" v-model="opcoesRevisao.aleatorio"> Aleatório
            </label>
          </div>
          <div class="config-actions">
            <button class="btn-primary" @click="iniciarRevisao">Iniciar</button>
            <button class="btn-secondary" @click="cancelarConfiguracaoRevisao">Cancelar</button>
          </div>
        </div>

        <div v-for="(cards, materia) in flashcardsAgrupados" :key="materia" class="materia-group">
          <h4 class="materia-header">{{ materia }} <span class="materia-count">{{ cards.length }}</span></h4>
          <div v-if="cards.length === 0" class="empty-state">Nenhum flashcard nesta matéria.</div>
          <div v-for="card in cards" :key="card.id" class="flashcard-item">
            <div class="flashcard-item-content">
              <div class="flashcard-item-front">{{ card.frente }}</div>
              <div class="flashcard-item-meta">
                <span class="box-indicator" :class="'box-' + (card.box || 1)">Caixa {{ card.box || 1 }}</span>
                <span class="review-info">Última revisão: {{ card.lastReviewed || 'Nunca' }}</span>
              </div>
            </div>
            <div class="flashcard-item-actions">
              <button class="btn-icon-only" @click="editarFlashcard(card)" title="Editar">✏️</button>
              <button class="btn-icon-only btn-danger" @click="handleRemoverFlashcard(card.id)" title="Remover">✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flashcards-page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== REVISION MODE ===== */
.revisao-mode {
  animation: fadeIn 0.3s ease;
}

.flashcard-review {
  margin-bottom: 20px;
}

.flashcard-materia {
  font-size: 13px;
  color: var(--texto-sec);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.flashcard-card {
  perspective: 1000px;
  cursor: pointer;
  min-height: 260px;
  max-width: 560px;
  margin: 0 auto;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  min-height: 260px;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.flashcard-card.virado .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: var(--card);
  border-radius: 16px;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid var(--borda);
}

.flashcard-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #1a1d29, #252b3d);
  border-color: #6366f1;
}

[data-tema="dark"] .flashcard-back {
  background: linear-gradient(135deg, #1a1d29, #0f1117);
}

.flashcard-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 16px;
  color: #6366f1;
}

.flashcard-back .flashcard-label {
  color: #818cf8;
}

.flashcard-text {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  line-height: 1.5;
  color: var(--texto);
  max-width: 100%;
  word-break: break-word;
}

.flashcard-back .flashcard-text {
  color: #e5e7eb;
}

.flashcard-hint {
  margin-top: 24px;
  font-size: 13px;
  color: var(--texto-sec);
  opacity: 0.6;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.flashcard-actions {
  text-align: center;
  margin-top: 16px;
}

.flashcard-ask {
  font-size: 14px;
  color: var(--texto-sec);
  margin-bottom: 16px;
  font-weight: 500;
}

.flashcard-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-acertou, .btn-errei {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
}

.btn-acertou {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
}

.btn-acertou:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16,185,129,0.3);
}

.btn-errei {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
}

.btn-errei:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239,68,68,0.3);
}

.btn-icon {
  font-size: 18px;
}

.revisao-footer {
  text-align: center;
  margin-top: 12px;
}

.btn-encerrar {
  background: none;
  border: 1px solid var(--erro);
  color: var(--erro);
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-encerrar:hover {
  background: rgba(239,68,68,0.08);
}

/* ===== LIST MODE ===== */
.flashcard-toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.btn-primary {
  padding: 10px 24px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.25s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99,102,241,0.3);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-revisar {
  padding: 10px 24px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.25s ease;
}

.btn-revisar:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(139,92,246,0.3);
}

.btn-revisar:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  padding: 10px 24px;
  background: var(--texto-sec);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  opacity: 0.9;
}

/* Config Review */
.config-revisao {
  padding: 20px;
  background: var(--bg);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid var(--borda);
}

.config-revisao h4 {
  margin: 0 0 16px;
  font-size: 15px;
  color: var(--texto);
}

.config-row {
  margin-bottom: 14px;
}

.config-row label {
  font-size: 13px;
  color: var(--texto-sec);
  display: block;
  margin-bottom: 6px;
}

.config-checkboxes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.config-check {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
  color: var(--texto);
}

.config-check input[type="checkbox"] {
  accent-color: #6366f1;
  width: 16px;
  height: 16px;
}

.config-input {
  width: 80px;
  padding: 8px 12px;
  border: 1px solid var(--borda);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: var(--card);
  color: var(--texto);
  outline: none;
}

.config-input:focus {
  border-color: #6366f1;
}

.config-actions {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

/* Materia Groups */
.materia-group {
  margin-bottom: 24px;
}

.materia-header {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--texto-sec);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--borda);
  display: flex;
  align-items: center;
  gap: 8px;
}

.materia-count {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  background: rgba(99,102,241,0.1);
  padding: 2px 10px;
  border-radius: 20px;
}

.empty-state {
  font-size: 13px;
  color: var(--texto-sec);
  padding: 12px 0;
}

.flashcard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--borda);
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  background: var(--card);
}

.flashcard-item:hover {
  border-color: #6366f1;
  box-shadow: 0 2px 12px rgba(99,102,241,0.08);
}

.flashcard-item-content {
  flex: 1;
  min-width: 0;
}

.flashcard-item-front {
  font-weight: 600;
  font-size: 14px;
  color: var(--texto);
  margin-bottom: 6px;
}

.flashcard-item-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.box-indicator {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 20px;
}

.box-indicator.box-1 { background: #fef3c7; color: #92400e; }
.box-indicator.box-2 { background: #dbeafe; color: #1e40af; }
.box-indicator.box-3 { background: #e0e7ff; color: #3730a3; }
.box-indicator.box-4 { background: #ede9fe; color: #5b21b6; }
.box-indicator.box-5 { background: #10b981; color: #fff; }

[data-tema="dark"] .box-indicator.box-1 { background: rgba(251,191,36,0.15); color: #fbbf24; }
[data-tema="dark"] .box-indicator.box-2 { background: rgba(59,130,246,0.15); color: #60a5fa; }
[data-tema="dark"] .box-indicator.box-3 { background: rgba(99,102,241,0.15); color: #a5b4fc; }
[data-tema="dark"] .box-indicator.box-4 { background: rgba(139,92,246,0.15); color: #c4b5fd; }

.review-info {
  font-size: 12px;
  color: var(--texto-sec);
}

.flashcard-item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.btn-icon-only {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  background: transparent;
  color: var(--texto-sec);
  transition: all 0.2s ease;
}

.btn-icon-only:hover {
  background: var(--bg);
  color: var(--texto);
}

.btn-danger:hover {
  background: rgba(239,68,68,0.1);
  color: var(--erro);
}

/* Form */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 13px;
  color: var(--texto-sec);
  font-weight: 500;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--borda);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: var(--card);
  color: var(--texto);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group select:focus,
.form-group textarea:focus {
  border-color: #6366f1;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-leave-active {
  transition: all 0.2s ease-in;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 1024px) {
  .flashcard-card {
    max-width: 480px;
  }
  .flashcard-front, .flashcard-back {
    padding: 32px 28px;
  }
}
@media (max-width: 768px) {
  .flashcard-front,
  .flashcard-back {
    padding: 28px 24px;
  }

  .flashcard-text {
    font-size: 18px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn-primary, .form-actions .btn-secondary {
    width: 100%;
  }

  .config-input {
    font-size: 16px;
    min-height: 44px;
  }
  .form-group select,
  .form-group textarea {
    font-size: 16px;
  }
  .btn-primary, .btn-secondary, .btn-revisar {
    padding: 12px 24px;
    min-height: 44px;
    font-size: 16px;
  }
  .btn-icon-only {
    width: 44px;
    height: 44px;
  }
  .btn-encerrar {
    padding: 12px 24px;
    min-height: 44px;
    font-size: 16px;
  }
}

@media (max-width: 600px) {
  .flashcard-front,
  .flashcard-back {
    padding: 24px 20px;
  }

  .flashcard-text {
    font-size: 16px;
  }

  .flashcard-buttons {
    flex-direction: column;
  }

  .btn-acertou, .btn-errei {
    width: 100%;
    justify-content: center;
  }
  .btn-acertou, .btn-errei {
    padding: 14px 24px;
    min-height: 44px;
  }

  .flashcard-ask {
    display: none;
  }
}

@media (max-width: 480px) {
  .flashcard-front,
  .flashcard-back {
    padding: 20px 16px;
  }
  .flashcard-text {
    font-size: 15px;
  }
  .flashcard-toolbar {
    flex-direction: column;
  }
  .flashcard-toolbar button {
    width: 100%;
    justify-content: center;
  }
  .flashcard-progresso {
    font-size: 12px;
  }
}
</style>
