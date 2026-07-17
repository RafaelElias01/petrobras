<script setup>
import { useDiario } from './useDiario.js';
import { useCiclo } from './useCiclo.js';
import { useHoras } from './useHoras.js';
import { CONTEUDOS, CICLO_MAP, mapCicloParaMateriaId } from './dados.js';
import { ref } from 'vue';

const {
  revisoesHoje, diarioData, revisoesPendentes,
  concluirRevisao, removerRevisao
} = useDiario();

const { materiaAtual, avancarCiclo } = useCiclo();
const {
  horaValor, totalHoje, registrosHoje,
  adicionarHoras, removerMateria, META_HORAS_DIA
} = useHoras();

const hoje = new Date().toISOString().slice(0, 10);

function navegarPara(view) {
  window.location.hash = view;
}

const materiasVisiveis = CONTEUDOS;
const addSelecionado = ref(null);
const addHoras = ref(1);

function adicionarNovaMateria() {
  if (addSelecionado.value) {
    adicionarHoras(hoje, addSelecionado.value, addHoras.value);
    addSelecionado.value = null;
    addHoras.value = 1;
  }
}

function estudarCiclo(incremento) {
  const id = mapCicloParaMateriaId(materiaAtual.value.materia);
  adicionarHoras(hoje, id, incremento);
}

function pctDiario() {
  return Math.min(100, Math.round((totalHoje.value / META_HORAS_DIA) * 100));
}

function formatarHoras(h) {
  const inteiro = Math.floor(h);
  const decimal = h - inteiro;
  if (inteiro === 0 && decimal > 0) return `${decimal * 60}min`;
  if (decimal === 0) return `${inteiro}h`;
  return `${inteiro}h${decimal * 60}`;
}
</script>

<template>
  <div>

    <div class="grade-cartoes">
      <div class="cartao-stat">
        <div class="valor valor-medio">{{ revisoesHoje.length }}</div>
        <div class="rotulo">Revisões pendentes hoje</div>
      </div>
      <div class="cartao-stat cartao-materia">
        <div class="valor valor-medio cor-materia">{{ materiaAtual.materia }}</div>
        <div class="rotulo">Próxima matéria do ciclo</div>
      </div>
    </div>

    <div class="card card-dia">
      <div class="card-titulo">
        <span>📋 Registro do Dia</span>
        <span class="total-dia">{{ totalHoje.toFixed(1) }}h / {{ META_HORAS_DIA }}h</span>
      </div>

      <div class="barra-progresso barra-dia">
        <div class="preenchimento" :style="{ width: pctDiario() + '%', background: pctDiario() >= 100 ? 'var(--sucesso)' : 'var(--primaria)' }"></div>
      </div>
      <div class="meta-label">{{ pctDiario() }}% da meta diária</div>

      <div v-if="registrosHoje.length > 0" class="log-hoje">
        <div class="log-label">Estudou hoje</div>
        <div v-for="r in registrosHoje" :key="r.id" class="item-log">
          <span class="log-icone">{{ r.icone }}</span>
          <span class="log-nome">{{ r.nome }}</span>
          <span class="log-horas">{{ formatarHoras(r.horas) }}</span>
          <div class="log-ajuste">
            <button class="btn-ajuste" @click="adicionarHoras(hoje, r.id, -0.5)" :disabled="r.horas <= 0.25">−</button>
            <button class="btn-ajuste" @click="adicionarHoras(hoje, r.id, 0.5)">+</button>
          </div>
          <button class="btn-log-remover" @click="removerMateria(hoje, r.id)" title="Remover">✕</button>
        </div>
      </div>

      <div class="add-materia">
        <div class="add-label">
          <span v-if="registrosHoje.length > 0">Adicionar outra matéria</span>
          <span v-else>O que você estudou hoje?</span>
        </div>
        <div class="grade-materias">
          <button
            v-for="m in materiasVisiveis"
            :key="m.id"
            class="btn-materia"
            :class="{ ativa: addSelecionado === m.id }"
            :style="{ '--cor': m.cor }"
            @click="addSelecionado = addSelecionado === m.id ? null : m.id"
          >
            <span class="btn-materia-icone">{{ m.icone }}</span>
            <span class="btn-materia-nome">{{ m.nome.replace(/^[^\s]+\s/, '') }}</span>
          </button>
        </div>
        <transition name="fade">
          <div v-if="addSelecionado" class="add-painel">
            <span class="add-painel-info">
              {{ materiasVisiveis.find(m => m.id === addSelecionado)?.icone }}
              {{ materiasVisiveis.find(m => m.id === addSelecionado)?.nome }}
            </span>
            <div class="add-presets">
              <button v-for="h in [0.5, 1, 1.5, 2, 2.5, 3]" :key="h"
                class="btn-preset"
                :class="{ ativo: addHoras === h }"
                @click="addHoras = h"
              >{{ formatarHoras(h) }}</button>
            </div>
            <button class="btn-add-confirmar" @click="adicionarNovaMateria">
              + Adicionar
            </button>
          </div>
        </transition>
      </div>

      <div class="ciclo-sugestao">
        <div class="ciclo-sugestao-icone">🎯</div>
        <div class="ciclo-sugestao-info">
          <strong>Ciclo: {{ materiaAtual.materia }}</strong>
          <span>{{ materiaAtual.tempo }}min sugeridos</span>
        </div>
        <div class="ciclo-sugestao-acoes">
          <button class="secao-acao" @click="estudarCiclo(1)">+1h</button>
          <button class="secao-acao secao-acao-secundaria" @click="estudarCiclo(materiaAtual.tempo / 60)">+{{ formatarHoras(materiaAtual.tempo / 60) }}</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">Revisões Agendadas (Revisão Espaçada)</div>
      <div v-if="revisoesPendentes.length === 0" class="sem-revisoes">Nenhuma revisão pendente.</div>
      <div v-for="r in revisoesPendentes" :key="r.id" class="item-revisao">
        <div class="revisao-info">
          <strong>{{ r.topico }}</strong>
          <span class="revisao-meta">{{ r.materia }} · {{ r.intervalo }}</span>
          <span v-if="r.data === hoje" class="revisao-hoje">🔴 Hoje!</span>
        </div>
        <div class="revisao-acoes">
          <button @click="concluirRevisao(r.id)" class="btn-concluir">✓ Concluída</button>
          <button @click="removerRevisao(r.id)" class="btn-remover">✕</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">Ações Rápidas</div>
      <div class="acoes-rapidas-grid">
        <button @click="navegarPara('horas')" class="secao-acao-secundaria acao-larga">⏱ Ver grade de horas</button>
        <button @click="navegarPara('ciclo')" class="secao-acao-secundaria acao-larga">🔄 Gerenciar ciclo</button>
        <button @click="navegarPara('erros')" class="secao-acao-secundaria acao-larga">📕 Caderno de Erros</button>
        <button @click="navegarPara('simulados')" class="secao-acao-secundaria acao-larga">📊 Registrar Simulado</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.valor-medio { font-size: 20px !important; }
.cartao-materia { border-top-color: #8b5cf6 !important; }
.cor-materia { color: #8b5cf6 !important; }

/* Card do Dia */
.card-dia .card-titulo {
  margin-bottom: 12px;
}
.total-dia {
  font-size: 20px;
  font-weight: 700;
  color: var(--primaria);
}
.barra-dia {
  margin-top: 0;
  margin-bottom: 4px;
  height: 10px;
  border-radius: 5px;
}
.meta-label {
  font-size: 12px;
  color: var(--texto-sec);
  margin-bottom: 16px;
}

/* Log de Hoje */
.log-hoje {
  margin-bottom: 16px;
}
.log-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--texto-sec);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.item-log {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg);
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background var(--transicao);
}
.item-log:hover {
  background: #e8ecf1;
}
.log-icone { font-size: 18px; }
.log-nome { flex: 1; font-size: 14px; font-weight: 500; }
.log-horas {
  font-size: 14px;
  font-weight: 700;
  color: var(--primaria);
  min-width: 48px;
  text-align: right;
}
.log-ajuste {
  display: flex;
  gap: 2px;
}
.btn-ajuste {
  width: 26px;
  height: 26px;
  border: 1px solid var(--borda);
  border-radius: 4px;
  background: var(--card);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--texto);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transicao);
}
.btn-ajuste:hover:not(:disabled) { background: var(--primaria); color: #fff; border-color: var(--primaria); }
.btn-ajuste:disabled { opacity: 0.3; cursor: default; }
.btn-log-remover {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--erro);
  padding: 4px 6px;
  opacity: 0.5;
  transition: opacity var(--transicao);
}
.btn-log-remover:hover { opacity: 1; }

/* Grade de Matérias */
.add-materia {
  margin-bottom: 16px;
}
.add-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--texto-sec);
  margin-bottom: 10px;
}
.grade-materias {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 6px;
}
.btn-materia {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--borda);
  border-radius: 8px;
  background: var(--card);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  color: var(--texto);
  transition: all var(--transicao);
  text-align: left;
}
.btn-materia:hover { border-color: var(--cor, var(--primaria)); background: #f8f9ff; }
.btn-materia.ativa {
  border-color: var(--cor, var(--primaria));
  background: color-mix(in srgb, var(--cor, var(--primaria)) 8%, var(--card));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--cor, var(--primaria)) 20%, transparent);
}
.btn-materia-icone { font-size: 16px; }
.btn-materia-nome { font-weight: 500; }

/* Painel de Adição */
.add-painel {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 12px;
  background: var(--bg);
  border-radius: 8px;
  flex-wrap: wrap;
}
.add-painel-info {
  font-size: 14px;
  font-weight: 600;
  color: var(--texto);
  min-width: 140px;
}
.add-presets {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.btn-preset {
  padding: 6px 12px;
  border: 1px solid var(--borda);
  border-radius: 6px;
  background: var(--card);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  color: var(--texto);
  transition: all var(--transicao);
  font-weight: 500;
}
.btn-preset:hover { border-color: var(--primaria); color: var(--primaria); }
.btn-preset.ativo {
  background: var(--primaria);
  color: #fff;
  border-color: var(--primaria);
}
.btn-add-confirmar {
  padding: 6px 16px;
  background: var(--sucesso);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  transition: opacity var(--transicao);
  margin-left: auto;
}
.btn-add-confirmar:hover { opacity: 0.85; }

/* Sugestão do Ciclo */
.ciclo-sugestao {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
  border: 1px solid #e0e7ff;
  border-radius: 10px;
}
.ciclo-sugestao-icone { font-size: 24px; }
.ciclo-sugestao-info {
  flex: 1;
  min-width: 0;
}
.ciclo-sugestao-info strong {
  display: block;
  font-size: 14px;
  color: var(--texto);
}
.ciclo-sugestao-info span {
  font-size: 12px;
  color: var(--texto-sec);
}
.ciclo-sugestao-acoes {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.ciclo-sugestao-acoes .secao-acao {
  padding: 6px 14px;
  font-size: 13px;
}

/* Revisões */
.sem-revisoes {
  font-size: 13px;
  color: var(--texto-sec);
  padding: 8px 0;
}
.item-revisao {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--borda);
  font-size: 14px;
  gap: 12px;
}
.item-revisao:last-of-type { border-bottom: none; }
.revisao-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 8px;
  min-width: 0;
}
.revisao-meta { color: var(--texto-sec); font-size: 12px; }
.revisao-hoje { color: var(--erro); font-size: 12px; }
.revisao-acoes { display: flex; gap: 4px; flex-shrink: 0; }
.btn-concluir {
  background: var(--sucesso);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 12px;
  transition: opacity var(--transicao);
}
.btn-concluir:hover { opacity: 0.85; }
.btn-remover {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--erro);
  padding: 4px 6px;
  transition: opacity var(--transicao);
}
.btn-remover:hover { opacity: 0.7; }

.secao-acao {
  padding: 8px 16px;
  background: var(--primaria);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  font-family: inherit;
  transition: background var(--transicao);
}
.secao-acao:hover { background: var(--primaria-hover); }
.secao-acao-secundaria {
  padding: 8px 16px;
  background: var(--bg);
  color: var(--texto);
  border: 1px solid var(--borda);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  font-family: inherit;
  transition: all var(--transicao);
}
.secao-acao-secundaria:hover { border-color: var(--primaria); color: var(--primaria); }

.acoes-rapidas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}
.acao-larga {
  text-align: center;
  padding: 12px 16px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .grade-materias {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  .item-revisao {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .revisao-acoes { width: 100%; }
  .btn-concluir, .btn-remover { flex: 1; text-align: center; }
  .ciclo-sugestao {
    flex-wrap: wrap;
  }
  .ciclo-sugestao-acoes {
    width: 100%;
  }
  .ciclo-sugestao-acoes .secao-acao {
    flex: 1;
    text-align: center;
  }
  .acoes-rapidas-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .grade-materias {
    grid-template-columns: 1fr 1fr;
  }
  .add-painel {
    flex-direction: column;
    align-items: stretch;
  }
  .add-painel-info { min-width: auto; }
  .btn-add-confirmar { margin-left: 0; }
  .acoes-rapidas-grid {
    grid-template-columns: 1fr;
  }
  .item-log {
    flex-wrap: wrap;
    gap: 4px;
  }
  .log-nome { flex: 1 1 100%; order: -1; }
  .log-horas { min-width: auto; }
}
</style>
