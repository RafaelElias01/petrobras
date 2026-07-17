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
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#fff',
    background: cores[dificuldade] || 'var(--texto-sec)'
  };
}

function materiaCor(nome) {
  const cores = {
    quimica: '#10b981',
    portugues: '#2563eb',
    matematica: '#f59e0b'
  };
  return cores[nome] || '#6b7280';
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
        <div v-for="(q, i) in quizQuestoes" :key="q.id" style="padding:16px;border:1px solid var(--borda);border-radius:8px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:18px;">{{ respostas[q.id] === q.correta ? '✅' : '❌' }}</span>
            <span style="font-size:12px;font-weight:600;color:var(--texto-sec);">Questão {{ i + 1 }}</span>
            <span :style="badgeStyle(q.dificuldade)">{{ q.dificuldade }}</span>
          </div>
          <div style="margin-bottom:8px;font-size:14px;line-height:1.5;">{{ q.enunciado }}</div>
          <div style="font-size:13px;color:var(--texto-sec);">
            <div><strong>Sua resposta:</strong> {{ respostas[q.id] !== undefined ? q.alternativas[respostas[q.id]] : 'Não respondida' }}</div>
            <div><strong>Resposta correta:</strong> {{ q.alternativas[q.correta] }}</div>
          </div>
        </div>
        <div style="text-align:center;margin-top:16px;">
          <button @click="toggleRevisao" style="padding:10px 24px;background:var(--primaria);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-family:inherit;font-weight:500;">Voltar para exercícios</button>
        </div>
      </div>
    </template>

    <template v-else-if="modoQuiz">
      <div style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:14px;font-weight:600;">Questão {{ quizIndex + 1 }} de {{ quizQuestoes.length }}</span>
          <span style="font-size:13px;color:var(--texto-sec);">{{ quizProgresso }}%</span>
        </div>
        <div class="barra-progresso">
          <div class="preenchimento" :style="{ width: quizProgresso + '%', background: 'var(--primaria)' }"></div>
        </div>
      </div>

      <div class="card" v-if="quizAtual">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
          <span :style="badgeStyle(quizAtual.dificuldade)">{{ quizAtual.dificuldade }}</span>
          <span style="font-size:12px;font-weight:600;color:var(--texto-sec);background:var(--bg);padding:2px 8px;border-radius:4px;">{{ quizAtual.materia }}</span>
          <span style="font-size:12px;color:var(--texto-sec);">{{ quizAtual.grupo }}</span>
        </div>
        <div style="font-size:15px;line-height:1.6;margin-bottom:20px;">{{ quizAtual.enunciado }}</div>

        <div v-for="(alt, idx) in quizAtual.alternativas" :key="idx" class="alternativa"
          :class="{
            correct: responded && idx === quizAtual.correta,
            wrong: responded && idx === selecionado && idx !== quizAtual.correta
          }"
          @click="!responded && responderQuestao(quizAtual.id, idx)"
          style="padding:12px 16px;margin-bottom:8px;border:2px solid var(--borda);border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;transition:all 0.2s ease;"
          :style="responded && idx === quizAtual.correta ? { borderColor: 'var(--sucesso)', background: 'color-mix(in srgb, var(--sucesso) 10%, transparent)' } : responded && idx === selecionado && idx !== quizAtual.correta ? { borderColor: 'var(--erro)', background: 'color-mix(in srgb, var(--erro) 10%, transparent)' } : selecionado === idx && !responded ? { borderColor: 'var(--primaria)', background: 'color-mix(in srgb, var(--primaria) 10%, transparent)' } : {}">
          <span style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;"
            :style="responded && idx === quizAtual.correta ? { background: 'var(--sucesso)', color: '#fff' } : responded && idx === selecionado && idx !== quizAtual.correta ? { background: 'var(--erro)', color: '#fff' } : { background: 'var(--bg)', color: 'var(--texto-sec)' }">{{ 'ABCDE'[idx] }}</span>
          <span>{{ alt }}</span>
        </div>

        <div v-if="responded" style="margin-top:16px;">
          <div v-if="selecionado === quizAtual.correta" style="padding:12px;background:color-mix(in srgb, var(--sucesso) 10%, transparent);border-radius:8px;font-size:14px;color:var(--sucesso);font-weight:600;margin-bottom:12px;">✓ Correto!</div>
          <div v-else style="padding:12px;background:color-mix(in srgb, var(--erro) 10%, transparent);border-radius:8px;font-size:14px;color:var(--erro);font-weight:600;margin-bottom:12px;">✘ Incorreto. A resposta correta é {{ quizAtual.alternativas[quizAtual.correta] }}</div>
          <button @click="toggleExplicacao" style="padding:8px 16px;background:none;border:1px solid var(--primaria);color:var(--primaria);border-radius:6px;cursor:pointer;font-size:13px;font-family:inherit;margin-bottom:12px;">
            {{ mostrarExplicacao ? 'Ocultar Explicação' : 'Ver Explicação' }}
          </button>
          <div v-if="mostrarExplicacao" style="padding:16px;background:var(--bg);border-radius:8px;font-size:14px;line-height:1.6;border-left:4px solid var(--primaria);margin-bottom:12px;">
            {{ quizAtual.explicacao }}
          </div>
        </div>

        <div style="display:flex;gap:8px;justify-content:space-between;margin-top:16px;flex-wrap:wrap;">
          <div style="display:flex;gap:8px;">
            <button @click="voltarQuestao" :disabled="quizIndex === 0"
              style="padding:8px 16px;border:1px solid var(--borda);background:var(--card);border-radius:6px;cursor:pointer;font-size:13px;font-family:inherit;transition:all 0.2s ease;"
              :style="quizIndex === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}">← Voltar</button>
            <button @click="proximaQuestao" :disabled="quizIndex === quizQuestoes.length - 1"
              style="padding:8px 16px;border:1px solid var(--borda);background:var(--card);border-radius:6px;cursor:pointer;font-size:13px;font-family:inherit;transition:all 0.2s ease;"
              :style="quizIndex === quizQuestoes.length - 1 ? { opacity: 0.4, cursor: 'not-allowed' } : {}">Avançar →</button>
          </div>
          <button @click="finalizarQuiz" style="padding:8px 20px;background:var(--erro);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-family:inherit;">Finalizar Quiz</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="card">
        <div class="card-titulo">Filtros</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:end;">
          <div style="flex:1;min-width:160px;">
            <label style="font-size:13px;color:var(--texto-sec);display:block;margin-bottom:4px;">Matéria</label>
            <select v-model="filtroMateria" style="width:100%;padding:8px 10px;border:1px solid var(--borda);border-radius:6px;font-size:14px;font-family:inherit;background:var(--card);color:var(--texto);" @change="filtroGrupo = ''">
              <option value="">Todas</option>
              <option v-for="m in materiasDisponiveis" :key="m.id" :value="m.id">{{ m.nome }}</option>
            </select>
          </div>
          <div style="flex:1;min-width:160px;">
            <label style="font-size:13px;color:var(--texto-sec);display:block;margin-bottom:4px;">Grupo</label>
            <select v-model="filtroGrupo" style="width:100%;padding:8px 10px;border:1px solid var(--borda);border-radius:6px;font-size:14px;font-family:inherit;background:var(--card);color:var(--texto);">
              <option value="">Todos</option>
              <option v-for="g in gruposDisponiveis" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;">
          <button v-for="d in [{v:'',l:'Todas'},{v:'facil',l:'Fácil'},{v:'medio',l:'Médio'},{v:'dificil',l:'Difícil'}]" :key="d.v"
            @click="filtroDificuldade = d.v"
            style="padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;font-family:inherit;border:1px solid var(--borda);transition:all 0.2s ease;"
            :style="filtroDificuldade === d.v ? { background: 'var(--primaria)', color: '#fff', borderColor: 'var(--primaria)' } : { background: 'var(--card)', color: 'var(--texto)' }">{{ d.l }}</button>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:15px;font-weight:600;">{{ questoesFiltradas.length }} questões encontradas</span>
          <button @click="filtroMateria = filtroMateria === 'favoritos' ? '' : 'favoritos'; filtroGrupo = ''; filtroDificuldade = ''" style="padding:6px 14px;background:none;border:1px solid var(--aviso);color:var(--aviso);border-radius:6px;cursor:pointer;font-size:13px;font-family:inherit;">
            ★ Favoritos ({{ favoritosLista.length }})
          </button>
        </div>
        <button @click="iniciarQuiz(questoesFiltradas)" :disabled="questoesFiltradas.length === 0"
          style="padding:10px 24px;background:var(--primaria);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-family:inherit;font-weight:500;"
          :style="questoesFiltradas.length === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}">Iniciar Quiz com {{ questoesFiltradas.length }} questões</button>
      </div>

      <div v-if="filtroMateria === 'favoritos'">
        <div v-if="favoritosLista.length === 0" class="card" style="text-align:center;color:var(--texto-sec);">Nenhum favorito ainda.</div>
        <div v-for="(q, i) in favoritosLista" :key="q.id" class="card" style="position:relative;">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
            <span style="background:var(--primaria);color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">{{ i + 1 }}</span>
            <span :style="badgeStyle(q.dificuldade)">{{ q.dificuldade }}</span>
            <span style="font-size:12px;font-weight:600;color:var(--texto-sec);background:var(--bg);padding:2px 8px;border-radius:4px;">{{ q.materia }}</span>
            <span style="font-size:12px;color:var(--texto-sec);">{{ q.grupo }}</span>
          </div>
          <div style="font-size:14px;line-height:1.5;margin-bottom:8px;">{{ q.enunciado }}</div>
          <div style="font-size:13px;color:var(--texto-sec);">{{ q.alternativas.length }} alternativas</div>
          <button @click="alternarFavorito(q.id)" style="position:absolute;top:16px;right:16px;background:none;border:none;cursor:pointer;font-size:20px;color:var(--aviso);">★</button>
        </div>
      </div>

      <div v-else>
        <div v-for="(q, i) in questoesFiltradas" :key="q.id" class="card" style="position:relative;">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
            <span style="background:var(--primaria);color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">{{ i + 1 }}</span>
            <span :style="badgeStyle(q.dificuldade)">{{ q.dificuldade }}</span>
            <span style="font-size:12px;font-weight:600;color:var(--texto-sec);background:var(--bg);padding:2px 8px;border-radius:4px;">{{ q.materia }}</span>
            <span style="font-size:12px;color:var(--texto-sec);">{{ q.grupo }}</span>
          </div>
          <div style="font-size:14px;line-height:1.5;margin-bottom:8px;">{{ q.enunciado }}</div>
          <div style="font-size:13px;color:var(--texto-sec);">{{ q.alternativas.length }} alternativas</div>
          <button @click="alternarFavorito(q.id)" style="position:absolute;top:16px;right:16px;background:none;border:none;cursor:pointer;font-size:20px;color:var(--aviso);">{{ favoritos.includes(q.id) ? '★' : '☆' }}</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
@media (max-width: 600px) {
  .alternativa {
    padding: 10px 12px !important;
    font-size: 13px !important;
  }
}
</style>
