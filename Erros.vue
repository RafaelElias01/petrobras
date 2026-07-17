<script setup>
import { onMounted, ref } from 'vue';
import { useErros } from './useErros.js';

const {
  totalErros, erros, errosPorMateria, errosFrequentes,
  editandoErro, regrasDeOuro,
  carregarErros, novoErro, salvarErro, cancelarErro, editarErro, removerErro,
  registrarRevisao, marcarRevisaoAcertou
} = useErros();

onMounted(() => {
  carregarErros();
});

function tipoLabel(t) {
  if (t === 'A') return 'A - Desconhecimento';
  if (t === 'B') return 'B - Confusão';
  if (t === 'C') return 'C - Atenção';
  return '';
}
</script>

<template>
  <div class="erros-page">
    <div class="card caderno-header">
      <h1 class="caderno-titulo">Caderno de Erros — Petrobras 2026</h1>
      <p class="caderno-subtitulo">Preencha imediatamente após cada correção de exercícios ou simulados. Cada erro preenchido é um ponto garantido na prova.</p>
      <div class="caderno-stats">
        <span class="stat-badge vermelho">{{ totalErros }} erros registrados</span>
        <span class="stat-badge azul">{{ errosPorMateria.filter(m => m.revisados > 0).length }} matérias com revisão</span>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">
        <span>Registro de Erros</span>
        <button class="btn-add" @click="novoErro">+ Novo Erro</button>
      </div>

      <div class="tabela-wrapper">
        <table class="caderno-tabela">
          <thead>
            <tr>
              <th class="col-num">#</th>
              <th class="col-data">Data</th>
              <th class="col-mat">Matéria</th>
              <th class="col-top">Tópico</th>
              <th class="col-quest">Questão</th>
              <th class="col-pensei">O que pensei</th>
              <th class="col-resp">Resposta correta</th>
              <th class="col-lacuna">Lacuna identificada</th>
              <th class="col-class">Class</th>
              <th class="col-acoes"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(e, idx) in erros" :key="e.id" class="erro-linha">
              <td class="col-num">{{ idx + 1 }}</td>
              <td class="col-data">{{ e.data }}</td>
              <td class="col-mat"><span class="tag-materia">{{ e.materia }}</span></td>
              <td class="col-top">{{ e.topico }}</td>
              <td class="col-quest">{{ e.questao || '-' }}</td>
              <td class="col-pensei">{{ e.pensamento || '-' }}</td>
              <td class="col-resp">{{ e.respostaCorreta || '-' }}</td>
              <td class="col-lacuna">{{ e.lacuna || '-' }}</td>
              <td class="col-class">
                <span class="tag-class" :class="'class-' + (e.classificacao || e.tipo)">{{ e.classificacao || e.tipo }}</span>
              </td>
              <td class="col-acoes">
                <button class="btn-acao" @click="editarErro(e)" title="Editar">✏️</button>
                <button class="btn-acao" @click="removerErro(e.id)" title="Remover">🗑️</button>
              </td>
            </tr>
            <tr v-if="erros.length === 0">
              <td colspan="10" class="empty-cell">Nenhum erro registrado ainda. Clique em "+ Novo Erro" para começar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="editandoErro" class="card">
      <div class="card-titulo">
        <span>{{ editandoErro.id && erros.find(e => e.id === editandoErro.id) ? 'Editar Erro' : 'Novo Erro' }}</span>
      </div>
      <div class="form-erro">
        <div class="form-grid">
          <div class="form-grupo">
            <label>Matéria</label>
            <select v-model="editandoErro.materia">
              <option value="">Selecione...</option>
              <option>Português</option>
              <option>Matemática</option>
              <option>Química</option>
            </select>
          </div>
          <div class="form-grupo">
            <label>Data</label>
            <input type="date" v-model="editandoErro.data">
          </div>
          <div class="form-grupo">
            <label>Tópico</label>
            <input v-model="editandoErro.topico" placeholder="Ex: pH, Estequiometria">
          </div>
          <div class="form-grupo">
            <label>Questão (número ou enunciado curto)</label>
            <input v-model="editandoErro.questao" placeholder="Ex: Q42 do simulado 3">
          </div>
          <div class="form-grupo full-width">
            <label>O que pensei</label>
            <textarea v-model="editandoErro.pensamento" placeholder="Seu raciocínio na hora do erro" rows="2"></textarea>
          </div>
          <div class="form-grupo full-width">
            <label>Resposta correta</label>
            <textarea v-model="editandoErro.respostaCorreta" placeholder="O que deveria ser" rows="2"></textarea>
          </div>
          <div class="form-grupo full-width">
            <label>Lacuna identificada</label>
            <textarea v-model="editandoErro.lacuna" placeholder="O que faltou saber/estudar" rows="2"></textarea>
          </div>
          <div class="form-grupo">
            <label>Classificação do erro</label>
            <select v-model="editandoErro.classificacao">
              <option value="A">A – Desconhecimento</option>
              <option value="B">B – Confusão</option>
              <option value="C">C – Atenção</option>
            </select>
          </div>
          <div class="form-grupo">
            <label>Revisado?</label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="editandoErro.revisado">
              <span>Sim, já revisei este erro</span>
            </label>
          </div>
        </div>
        <div class="form-botoes">
          <button class="btn-salvar" @click="salvarErro">Salvar</button>
          <button class="btn-cancelar" @click="cancelarErro">Cancelar</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">
        <span>Classificação do Erro</span>
      </div>
      <div class="class-legend">
        <div class="class-item"><span class="tag-class class-A">A</span> Desconhecimento — conteúdo não estudado</div>
        <div class="class-item"><span class="tag-class class-B">B</span> Confusão — conteúdo estudado mas confundido com outro</div>
        <div class="class-item"><span class="tag-class class-C">C</span> Atenção — domina o conteúdo, errou por distração</div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">
        <span>Erros por Matéria</span>
      </div>
      <div class="tabela-wrapper">
        <table class="caderno-tabela">
          <thead>
            <tr>
              <th>Matéria</th>
              <th>Total erros</th>
              <th>A – Desconhecimento</th>
              <th>B – Confusão</th>
              <th>C – Atenção</th>
              <th>Revisados</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in errosPorMateria" :key="m.materia">
              <td><strong>{{ m.materia }}</strong></td>
              <td class="num">{{ m.total }}</td>
              <td class="num">{{ m.A }}</td>
              <td class="num">{{ m.B }}</td>
              <td class="num">{{ m.C }}</td>
              <td class="num">{{ m.revisados }}/{{ m.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">
        <span>Erros Frequentes (refazer 7 dias depois)</span>
      </div>
      <div class="tabela-wrapper">
        <table class="caderno-tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Data original</th>
              <th>Matéria</th>
              <th>Tópico</th>
              <th>Refiz D+7</th>
              <th>Acertou?</th>
              <th>Refiz D+30</th>
              <th>Acertou?</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(e, idx) in errosFrequentes" :key="e.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ e.data }}</td>
              <td>{{ e.materia }}</td>
              <td>{{ e.topico }}</td>
              <td>
                <button v-if="!e.revisaoD7" class="btn-revisar" @click="registrarRevisao(e.id, 7)">Refazer</button>
                <span v-else class="revisao-feita">{{ e.revisaoD7.data }}</span>
              </td>
              <td>
                <span v-if="!e.revisaoD7">–</span>
                <button v-else-if="!e.revisaoD7.acertou" class="btn-sim" @click="marcarRevisaoAcertou(e.id, 7)">✅ Sim</button>
                <span v-else class="text-sucesso">Sim ✓</span>
              </td>
              <td>
                <button v-if="!e.revisaoD30" class="btn-revisar" @click="registrarRevisao(e.id, 30)">Refazer</button>
                <span v-else class="revisao-feita">{{ e.revisaoD30.data }}</span>
              </td>
              <td>
                <span v-if="!e.revisaoD30">–</span>
                <button v-else-if="!e.revisaoD30.acertou" class="btn-sim" @click="marcarRevisaoAcertou(e.id, 30)">✅ Sim</button>
                <span v-else class="text-sucesso">Sim ✓</span>
              </td>
            </tr>
            <tr v-if="errosFrequentes.length === 0">
              <td colspan="8" class="empty-cell">Nenhum erro classificado como A ou B registrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">
        <span>Regras de Ouro (aprendidas com os erros)</span>
      </div>
      <div class="regras-lista">
        <div v-for="(r, idx) in regrasDeOuro" :key="idx" class="regra-item">
          <span class="regra-num">{{ idx + 1 }}.</span>
          <input v-model="regrasDeOuro[idx]" :placeholder="'Digite sua regra de ouro #' + (idx + 1)" class="regra-input">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.erros-page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.caderno-header {
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, var(--card), color-mix(in srgb, var(--card) 95%, #ef4444));
  border: 1px solid var(--borda);
}

.caderno-titulo {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--texto);
}

.caderno-subtitulo {
  font-size: 14px;
  color: var(--texto-sec);
  margin: 0 0 16px;
  line-height: 1.5;
}

.caderno-stats {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.stat-badge.vermelho {
  background: rgba(239,68,68,0.1);
  color: #ef4444;
}

.stat-badge.azul {
  background: rgba(99,102,241,0.1);
  color: #6366f1;
}

.tabela-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.caderno-tabela {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 900px;
}

.caderno-tabela th {
  text-align: left;
  padding: 10px 8px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--texto-sec);
  border-bottom: 2px solid var(--borda);
  white-space: nowrap;
}

.caderno-tabela td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--borda);
  vertical-align: top;
}

.caderno-tabela tbody tr:hover {
  background: var(--fundo-sec);
}

.col-num { width: 40px; text-align: center; }
.col-data { width: 100px; white-space: nowrap; }
.col-mat { width: 100px; }
.col-top { min-width: 120px; }
.col-quest { min-width: 100px; }
.col-pensei, .col-resp, .col-lacuna { min-width: 130px; }
.col-class { width: 60px; text-align: center; }
.col-acoes { width: 70px; text-align: center; white-space: nowrap; }

.tag-materia {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: var(--fundo-sec);
  color: var(--texto-sec);
}

.tag-class {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

.class-A { background: #fef3c7; color: #92400e; }
.class-B { background: #dbeafe; color: #1e40af; }
.class-C { background: #fce7f3; color: #9d174d; }

[data-tema="dark"] .class-A { background: rgba(251,191,36,0.2); color: #fbbf24; }
[data-tema="dark"] .class-B { background: rgba(59,130,246,0.2); color: #60a5fa; }
[data-tema="dark"] .class-C { background: rgba(236,72,153,0.2); color: #f472b6; }

.empty-cell {
  text-align: center;
  padding: 32px 16px !important;
  color: var(--texto-sec);
  font-style: italic;
}

.btn-add {
  padding: 6px 16px;
  background: var(--primaria);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #4f46e5;
}

.btn-acao {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-acao:hover { opacity: 1; }

.form-erro {
  padding: 16px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-grupo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-grupo.full-width {
  grid-column: 1 / -1;
}

.form-grupo label {
  font-size: 12px;
  font-weight: 600;
  color: var(--texto-sec);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-grupo input,
.form-grupo select,
.form-grupo textarea {
  padding: 10px 12px;
  border: 1px solid var(--borda);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: var(--card);
  color: var(--texto);
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.form-grupo input:focus,
.form-grupo select:focus,
.form-grupo textarea:focus {
  outline: none;
  border-color: #6366f1;
}

.form-grupo textarea {
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--texto);
  cursor: pointer;
  padding-top: 4px;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-botoes {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-salvar, .btn-cancelar {
  padding: 10px 28px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.btn-salvar {
  background: var(--primaria);
  color: #fff;
}

.btn-salvar:hover {
  background: #4f46e5;
}

.btn-cancelar {
  background: var(--texto-sec);
  color: #fff;
}

.btn-cancelar:hover {
  opacity: 0.8;
}

.class-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;
}

.class-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--texto);
}

.num {
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.btn-revisar {
  padding: 4px 12px;
  border: 1px solid var(--primaria);
  background: transparent;
  color: var(--primaria);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.btn-revisar:hover {
  background: var(--primaria);
  color: #fff;
}

.revisao-feita {
  font-size: 12px;
  color: var(--texto-sec);
  white-space: nowrap;
}

.btn-sim {
  padding: 2px 8px;
  border: 1px solid #10b981;
  background: transparent;
  color: #10b981;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.btn-sim:hover {
  background: #10b981;
  color: #fff;
}

.text-sucesso {
  color: #10b981;
  font-weight: 600;
  font-size: 13px;
}

.regras-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;
}

.regra-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.regra-num {
  font-weight: 700;
  font-size: 16px;
  color: var(--primaria);
  min-width: 24px;
}

.regra-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--borda);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: var(--card);
  color: var(--texto);
  transition: border-color 0.2s;
}

.regra-input:focus {
  outline: none;
  border-color: #6366f1;
}

.regra-input::placeholder {
  color: var(--texto-sec);
  opacity: 0.5;
}

@media (max-width: 768px) {
  .caderno-tabela { min-width: 700px; font-size: 12px; }
  .caderno-tabela th,
  .caderno-tabela td { padding: 8px 6px; }
  .form-grid { grid-template-columns: 1fr; }
  .caderno-titulo { font-size: 18px; }
}

@media (max-width: 600px) {
  .caderno-tabela { min-width: 600px; font-size: 11px; }
}
</style>
