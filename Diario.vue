<script setup>
import { useDiario } from './useDiario.js';
import { useCiclo } from './useCiclo.js';
import { useHoras } from './useHoras.js';
import { CONTEUDOS } from './dados.js';

const {
  revisoesHoje, diarioData, revisoesPendentes,
  concluirRevisao, removerRevisao
} = useDiario();

const { materiaAtual, avancarCiclo } = useCiclo();
const { horaValor, setHora } = useHoras();

const hoje = new Date().toISOString().slice(0, 10);

function navegarPara(view) {
  window.location.hash = view;
}
</script>

<template>
  <div class="grade-cartoes">
    <div class="cartao-stat">
      <div class="valor" style="font-size:20px;">{{ revisoesHoje.length }}</div>
      <div class="rotulo">Revisões pendentes hoje</div>
    </div>
    <div class="cartao-stat" :style="{ borderTopColor: '#8b5cf6' }">
      <div class="valor" style="font-size:20px;color:#8b5cf6;">{{ materiaAtual.materia }}</div>
      <div class="rotulo">Próxima matéria do ciclo</div>
    </div>
  </div>

  <div class="card">
    <div class="card-titulo">
      Painel de Bordo do Dia
      <input type="date" v-model="diarioData" style="padding:8px 12px;border:1px solid var(--borda);border-radius:6px;font-size:14px;font-family:inherit;">
    </div>

    <div class="painel-secao">
      <div class="secao-icone">🔄</div>
      <div class="secao-conteudo">
        <h3>Ciclo de Estudos</h3>
        <p>Sua próxima matéria é <strong>{{ materiaAtual.materia }}</strong> ({{ materiaAtual.tempo }} min).</p>
      </div>
      <button @click="avancarCiclo" class="secao-acao">Concluir e Avançar →</button>
    </div>

    <div class="painel-secao">
      <div class="secao-icone">⏱</div>
      <div class="secao-conteudo">
        <h3>Registro Rápido de Horas</h3>
        <p>Adicione as horas estudadas hoje ({{ hoje }}).</p>
        <div class="horas-rapidas">
          <div v-for="materia in CONTEUDOS" :key="materia.id" class="input-horas-diario">
            <label>{{ materia.nome }}</label>
            <div class="input-horas">
              <button @click="setHora(hoje, materia.id, (horaValor(hoje, materia.id) || 0) - 0.5)">-</button>
              <span>{{ horaValor(hoje, materia.id) || 0 }}</span>
              <button @click="setHora(hoje, materia.id, (horaValor(hoje, materia.id) || 0) + 0.5)">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="painel-secao">
      <div class="secao-icone">⚡</div>
      <div class="secao-conteudo">
        <h3>Ações Rápidas</h3>
        <p>Acesse outras áreas importantes do seu plano.</p>
      </div>
      <div class="secao-acoes-rapidas">
        <button @click="navegarPara('erros')" class="secao-acao-secundaria">Caderno de Erros</button>
        <button @click="navegarPara('simulados')" class="secao-acao-secundaria">Registrar Simulado</button>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-titulo">Revisões Agendadas (Revisão Espaçada)</div>
    <div v-if="revisoesPendentes.length === 0" style="font-size:13px;color:var(--texto-sec);padding:8px 0;">Nenhuma revisão pendente.</div>
    <div v-for="r in revisoesPendentes" :key="r.id" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--borda);font-size:14px;">
      <div>
        <strong>{{ r.topico }}</strong>
        <span style="color:var(--texto-sec);font-size:12px;margin-left:8px;">{{ r.materia }} · {{ r.intervalo }}</span>
        <span v-if="r.data === hoje" style="color:var(--erro);font-size:12px;margin-left:8px;">🔴 Hoje!</span>
      </div>
      <div style="display:flex;gap:4px;">
        <button @click="concluirRevisao(r.id)" style="background:var(--sucesso);color:#fff;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:12px;">✓ Concluída</button>
        <button @click="removerRevisao(r.id)" style="background:none;border:none;cursor:pointer;font-size:14px;color:var(--erro);">✕</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.painel-secao {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--borda);
}
.painel-secao:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}
.secao-icone {
  font-size: 24px;
  background-color: var(--bg);
  border-radius: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.secao-conteudo {
  flex: 1;
}
.secao-conteudo h3 {
  font-size: 16px;
  margin: 0 0 4px;
}
.secao-conteudo p {
  font-size: 14px;
  color: var(--texto-sec);
  margin: 0;
}
.secao-acao {
  padding: 8px 16px;
  background: var(--primaria);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  align-self: center;
}
.secao-acoes-rapidas {
  display: flex;
  gap: 8px;
  align-self: center;
}
.secao-acao-secundaria {
  padding: 8px 16px;
  background: var(--bg);
  color: var(--texto);
  border: 1px solid var(--borda);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.horas-rapidas {
  display: flex;
  gap: 24px;
  margin-top: 12px;
}
.input-horas-diario label {
  font-size: 13px;
  color: var(--texto-sec);
  display: block;
  margin-bottom: 4px;
}
</style>
