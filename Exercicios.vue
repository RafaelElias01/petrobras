<script setup>
import { useExercicios } from './useExercicios.js';

const {
  filtroMateria, filtroGrupo, filtroDificuldade,
  modoQuiz, quizQuestoes, quizIndex, respostas,
  revisao, mostrarExplicacao, selecionado, favoritos, responded,
  materiasDisponiveis, gruposDisponiveis, questoesFiltradas,
  quizAtual, quizProgresso, quizAcertos, quizTotal, favoritosLista,
  iniciarQuiz, responderQuestao, proximaQuestao, voltarQuestao,
  finalizarQuiz, alternarFavorito, toggleExplicacao, toggleRevisao
} = useExercicios();

function badgeStyle(dificuldade) {
  const cores = { facil: 'var(--sucesso)', medio: 'var(--aviso)', dificil: 'var(--erro)' };
  return { background: cores[dificuldade] || 'var(--texto-sec)' };
}
</script>

<template>
  <div>
    <template v-if="revisao">
      <div class="grade-cartoes">
        <div class="cartao-stat" :class="quizAcertos / quizTotal >= 0.7 ? 'verde' : quizAcertos / quizTotal >= 0.5 ? 'laranja' : 'vermelho'">
          <div class="valor">{{ quizAcertos }}/{{ quizTotal }}</div>
          <div class="rotulo">Você acertou {{ quizAcertos }} de {{ quizTotal }} questões ({{ quizTotal ? Math.round(quizAcertos / quizTotal * 100) : 0 }}%)</div>
        </div>
      </div>
      <div class="card">
        <div class="card-titulo">Revisão do Quiz</div>
        <div v-for="(q, i) in quizQuestoes" :key="q.id" class="revisao-card">
          <div class="revisao-header">
            <span class="revisao-icone">{{ respostas[q.id] === q.correta ? '✅' : '❌' }}</span>
            <span class="revisao-numero">Questão {{ i + 1 }}</span>
            <span class="badge-dificuldade" :style="badgeStyle(q.dificuldade)">{{ q.dificuldade }}</span>
          </div>
          <div class="revisao-enunciado">{{ q.enunciado }}</div>
          <div class="revisao-resposta">
            <div><strong>Sua resposta:</strong> {{ respostas[q.id] !== undefined ? q.alternativas[respostas[q.id]] : 'Não respondida' }}</div>
            <div><strong>Resposta correta:</strong> {{ q.alternativas[q.correta] }}</div>
          </div>
        </div>
        <div class="revisao-footer">
          <button @click="toggleRevisao" class="btn-voltar-exercicios">Voltar para exercícios</button>
        </div>
      </div>
    </template>

    <template v-else-if="modoQuiz">
      <div class="quiz-progresso-wrapper">
        <div class="quiz-progresso-header">
          <span class="quiz-progresso-label">Questão {{ quizIndex + 1 }} de {{ quizQuestoes.length }}</span>
          <span class="quiz-progresso-pct">{{ quizProgresso }}%</span>
        </div>
        <div class="barra-progresso">
          <div class="preenchimento" :style="{ width: quizProgresso + '%', background: 'var(--primaria)' }"></div>
        </div>
      </div>

      <div class="card" v-if="quizAtual">
        <div class="quiz-meta">
          <span class="badge-dificuldade" :style="badgeStyle(quizAtual.dificuldade)">{{ quizAtual.dificuldade }}</span>
          <span class="quiz-tag">{{ quizAtual.materia }}</span>
          <span class="quiz-grupo">{{ quizAtual.grupo }}</span>
        </div>
        <div class="quiz-enunciado">{{ quizAtual.enunciado }}</div>

        <div v-for="(alt, idx) in quizAtual.alternativas" :key="idx" class="alternativa"
          role="button"
          :tabindex="responded ? -1 : 0"
          :aria-pressed="selecionado === idx"
          :aria-disabled="responded"
          :class="{
            correct: responded && idx === quizAtual.correta,
            wrong: responded && idx === selecionado && idx !== quizAtual.correta,
            selected: selecionado === idx && !responded
          }"
          @click="!responded && responderQuestao(quizAtual.id, idx)"
          @keydown.enter.prevent="!responded && responderQuestao(quizAtual.id, idx)"
          @keydown.space.prevent="!responded && responderQuestao(quizAtual.id, idx)">
          <span class="alternativa-letra"
            :class="{
              'letra-certa': responded && idx === quizAtual.correta,
              'letra-errada': responded && idx === selecionado && idx !== quizAtual.correta
            }">{{ 'ABCDE'[idx] }}</span>
          <span>{{ alt }}</span>
        </div>

        <div v-if="responded" class="quiz-feedback">
          <div v-if="selecionado === quizAtual.correta" class="feedback-correto">✓ Correto!</div>
          <div v-else class="feedback-incorreto">✘ Incorreto. A resposta correta é {{ quizAtual.alternativas[quizAtual.correta] }}</div>
          <button @click="toggleExplicacao" class="btn-explicacao">
            {{ mostrarExplicacao ? 'Ocultar Explicação' : 'Ver Explicação' }}
          </button>
          <div v-if="mostrarExplicacao" class="explicacao-box">
            {{ quizAtual.explicacao }}
          </div>
        </div>

        <div class="quiz-actions">
          <div class="quiz-nav">
            <button @click="voltarQuestao" :disabled="quizIndex === 0" class="btn-nav" :class="{ 'btn-desabilitado': quizIndex === 0 }">← Voltar</button>
            <button @click="proximaQuestao" :disabled="quizIndex === quizQuestoes.length - 1" class="btn-nav" :class="{ 'btn-desabilitado': quizIndex === quizQuestoes.length - 1 }">Avançar →</button>
          </div>
          <button @click="finalizarQuiz" class="btn-finalizar">Finalizar Quiz</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="card">
        <div class="card-titulo">Filtros</div>
        <div class="filtros-grid">
          <div class="filtro-group">
            <label class="filtro-label">Matéria</label>
            <select v-model="filtroMateria" class="filtro-select" @change="filtroGrupo = ''">
              <option value="">Todas</option>
              <option v-for="m in materiasDisponiveis" :key="m.id" :value="m.id">{{ m.nome }}</option>
            </select>
          </div>
          <div class="filtro-group">
            <label class="filtro-label">Grupo</label>
            <select v-model="filtroGrupo" class="filtro-select">
              <option value="">Todos</option>
              <option v-for="g in gruposDisponiveis" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>
        </div>
        <div class="filtros-dificuldade">
          <button v-for="d in [{v:'',l:'Todas'},{v:'facil',l:'Fácil'},{v:'medio',l:'Médio'},{v:'dificil',l:'Difícil'}]" :key="d.v"
            @click="filtroDificuldade = d.v"
            class="btn-dificuldade"
            :class="{ 'btn-dificuldade-ativa': filtroDificuldade === d.v }">{{ d.l }}</button>
        </div>
      </div>

      <div class="questoes-toolbar">
        <div class="questoes-info">
          <span class="questoes-count">{{ questoesFiltradas.length }} questões encontradas</span>
          <button @click="filtroMateria = filtroMateria === 'favoritos' ? '' : 'favoritos'; filtroGrupo = ''; filtroDificuldade = ''" class="btn-favoritos-toolbar">
            ★ Favoritos ({{ favoritosLista.length }})
          </button>
        </div>
        <button @click="iniciarQuiz(questoesFiltradas)" :disabled="questoesFiltradas.length === 0"
          class="btn-iniciar-quiz"
          :class="{ 'btn-desabilitado': questoesFiltradas.length === 0 }">Iniciar Quiz com {{ questoesFiltradas.length }} questões</button>
      </div>

      <div v-if="filtroMateria === 'favoritos'">
        <div v-if="favoritosLista.length === 0" class="empty-card">Nenhum favorito ainda.</div>
        <div v-for="(q, i) in favoritosLista" :key="q.id" class="card questao-card">
          <div class="questao-header">
            <span class="questao-numero">{{ i + 1 }}</span>
            <span class="badge-dificuldade" :style="badgeStyle(q.dificuldade)">{{ q.dificuldade }}</span>
            <span class="questao-tag">{{ q.materia }}</span>
            <span class="questao-grupo">{{ q.grupo }}</span>
          </div>
          <div class="questao-enunciado">{{ q.enunciado }}</div>
          <div class="questao-alternativas-count">{{ q.alternativas.length }} alternativas</div>
          <button @click="alternarFavorito(q.id)" class="btn-favorito" aria-label="Remover dos favoritos" aria-pressed="true">★</button>
        </div>
      </div>

      <div v-else>
        <div v-for="(q, i) in questoesFiltradas" :key="q.id" class="card questao-card">
          <div class="questao-header">
            <span class="questao-numero">{{ i + 1 }}</span>
            <span class="badge-dificuldade" :style="badgeStyle(q.dificuldade)">{{ q.dificuldade }}</span>
            <span class="questao-tag">{{ q.materia }}</span>
            <span class="questao-grupo">{{ q.grupo }}</span>
          </div>
          <div class="questao-enunciado">{{ q.enunciado }}</div>
          <div class="questao-alternativas-count">{{ q.alternativas.length }} alternativas</div>
          <button @click="alternarFavorito(q.id)" class="btn-favorito"
            :aria-label="favoritos.includes(q.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
            :aria-pressed="favoritos.includes(q.id)">{{ favoritos.includes(q.id) ? '★' : '☆' }}</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.badge-dificuldade {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}

.revisao-card {
  padding: 16px;
  border: 1px solid var(--borda);
  border-radius: 8px;
  margin-bottom: 12px;
}
.revisao-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.revisao-icone {
  font-size: 18px;
}
.revisao-numero {
  font-size: 12px;
  font-weight: 600;
  color: var(--texto-sec);
}
.revisao-enunciado {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
}
.revisao-resposta {
  font-size: 13px;
  color: var(--texto-sec);
}
.revisao-footer {
  text-align: center;
  margin-top: 16px;
}
.btn-voltar-exercicios {
  padding: 10px 24px;
  background: var(--primaria);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
}

.quiz-progresso-wrapper {
  margin-bottom: 20px;
}
.quiz-progresso-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.quiz-progresso-label {
  font-size: 14px;
  font-weight: 600;
}
.quiz-progresso-pct {
  font-size: 13px;
  color: var(--texto-sec);
}

.quiz-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.quiz-tag {
  font-size: 12px;
  font-weight: 600;
  color: var(--texto-sec);
  background: var(--bg);
  padding: 2px 8px;
  border-radius: 4px;
}
.quiz-grupo {
  font-size: 12px;
  color: var(--texto-sec);
}
.quiz-enunciado {
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.alternativa {
  padding: 12px 16px;
  margin-bottom: 8px;
  border: 2px solid var(--borda);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}
.alternativa:hover {
  border-color: var(--primaria);
}
.alternativa:focus-visible {
  outline: 3px solid var(--primaria);
  outline-offset: 2px;
}
.alternativa.selected {
  border-color: var(--primaria);
  background: color-mix(in srgb, var(--primaria) 10%, transparent);
}
.alternativa.correct {
  border-color: var(--sucesso);
  background: color-mix(in srgb, var(--sucesso) 10%, transparent);
}
.alternativa.wrong {
  border-color: var(--erro);
  background: color-mix(in srgb, var(--erro) 10%, transparent);
}

.alternativa-letra {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
  background: var(--bg);
  color: var(--texto-sec);
}
.alternativa-letra.letra-certa {
  background: var(--sucesso);
  color: #fff;
}
.alternativa-letra.letra-errada {
  background: var(--erro);
  color: #fff;
}

.quiz-feedback {
  margin-top: 16px;
}
.feedback-correto {
  padding: 12px;
  background: color-mix(in srgb, var(--sucesso) 10%, transparent);
  border-radius: 8px;
  font-size: 14px;
  color: var(--sucesso);
  font-weight: 600;
  margin-bottom: 12px;
}
.feedback-incorreto {
  padding: 12px;
  background: color-mix(in srgb, var(--erro) 10%, transparent);
  border-radius: 8px;
  font-size: 14px;
  color: var(--erro);
  font-weight: 600;
  margin-bottom: 12px;
}
.btn-explicacao {
  padding: 8px 16px;
  background: none;
  border: 1px solid var(--primaria);
  color: var(--primaria);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  margin-bottom: 12px;
}
.explicacao-box {
  padding: 16px;
  background: var(--bg);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  border-left: 4px solid var(--primaria);
  margin-bottom: 12px;
}

.quiz-actions {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  margin-top: 16px;
  flex-wrap: wrap;
}
.quiz-nav {
  display: flex;
  gap: 8px;
}
.btn-nav {
  padding: 8px 16px;
  border: 1px solid var(--borda);
  background: var(--card);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.2s ease;
}
.btn-nav:hover:not(:disabled) {
  border-color: var(--primaria);
  color: var(--primaria);
}
.btn-finalizar {
  padding: 8px 20px;
  background: var(--erro);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
}

.filtros-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: end;
}
.filtro-group {
  flex: 1;
  min-width: 160px;
}
.filtro-label {
  font-size: 13px;
  color: var(--texto-sec);
  display: block;
  margin-bottom: 4px;
}
.filtro-select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--borda);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: var(--card);
  color: var(--texto);
}
.filtros-dificuldade {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.btn-dificuldade {
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  border: 1px solid var(--borda);
  transition: all 0.2s ease;
  background: var(--card);
  color: var(--texto);
}
.btn-dificuldade-ativa {
  background: var(--primaria);
  color: #fff;
  border-color: var(--primaria);
}

.questoes-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.questoes-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.questoes-count {
  font-size: 15px;
  font-weight: 600;
}
.btn-favoritos-toolbar {
  padding: 6px 14px;
  background: none;
  border: 1px solid var(--aviso);
  color: var(--aviso);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
}
.btn-iniciar-quiz {
  padding: 10px 24px;
  background: var(--primaria);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
}

.empty-card {
  text-align: center;
  color: var(--texto-sec);
  padding: 20px;
}

.questao-card {
  position: relative;
}
.questao-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.questao-numero {
  background: var(--primaria);
  color: #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
.questao-tag {
  font-size: 12px;
  font-weight: 600;
  color: var(--texto-sec);
  background: var(--bg);
  padding: 2px 8px;
  border-radius: 4px;
}
.questao-grupo {
  font-size: 12px;
  color: var(--texto-sec);
}
.questao-enunciado {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}
.questao-alternativas-count {
  font-size: 13px;
  color: var(--texto-sec);
}
.btn-favorito {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: var(--aviso);
}
.btn-desabilitado {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .quiz-enunciado {
    font-size: 14px;
  }
  .filtros-grid {
    flex-direction: column;
  }
  .filtro-group {
    min-width: 100%;
  }
}
@media (max-width: 768px) {
  .alternativa {
    padding: 12px 14px;
    min-height: 44px;
    font-size: 16px;
  }
  .btn-explicacao {
    padding: 12px 16px;
    min-height: 44px;
    font-size: 16px;
  }
  .btn-nav {
    padding: 12px 16px;
    min-height: 44px;
    font-size: 16px;
    flex: 1;
  }
  .btn-finalizar {
    padding: 12px 20px;
    min-height: 44px;
    font-size: 16px;
  }
  .btn-iniciar-quiz {
    padding: 12px 24px;
    min-height: 44px;
    font-size: 16px;
  }
  .btn-voltar-exercicios {
    padding: 12px 24px;
    min-height: 44px;
    font-size: 16px;
  }
  .filtro-select {
    font-size: 16px;
    padding: 10px 12px;
    min-height: 44px;
  }
  .btn-dificuldade {
    padding: 10px 14px;
    min-height: 44px;
    font-size: 16px;
  }
  .btn-favoritos-toolbar {
    padding: 10px 14px;
    min-height: 44px;
    font-size: 16px;
  }
  .quiz-nav {
    width: 100%;
  }
}
@media (max-width: 600px) {
  .alternativa {
    padding: 10px 12px;
    font-size: 13px;
  }
  .filtros-grid {
    flex-direction: column;
  }
  .filtro-group {
    min-width: 100%;
  }
  .questoes-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .questoes-info {
    justify-content: center;
  }
  .btn-iniciar-quiz {
    width: 100%;
    text-align: center;
  }
  .quiz-actions {
    flex-direction: column;
  }
  .quiz-nav {
    justify-content: center;
  }
  .btn-finalizar {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .alternativa {
    padding: 8px 10px;
    font-size: 12px;
  }
  .btn-dificuldade {
    padding: 10px 14px;
    min-height: 44px;
  }
  .questao-card {
    padding: 12px;
  }
}
</style>
