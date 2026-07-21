<script setup>
import { useSimulados, SIMULADO_TOTAL_QUESTOES } from './useSimulados.js';
import { SEMANAS_PLANO } from './dados.js';

const {
  simuladosOrdenados, formSimulado, formSimuladoTotal,
  salvarSimulado, removerSimulado
} = useSimulados();

const semanasPlano = SEMANAS_PLANO;
const totalQuestoes = SIMULADO_TOTAL_QUESTOES;
</script>

<template>
  <div>
    <div class="grade-cartoes">
      <div class="cartao-stat" v-for="(s, i) in simuladosOrdenados" :key="s.semana"
        :class="s.porcentagem >= 70 ? 'verde' : s.porcentagem >= 50 ? 'laranja' : 'vermelho'">
        <div class="valor">{{ s.porcentagem }}%</div>
        <div class="rotulo">Simulado {{ i+1 }} (Semana {{ s.semana }})</div>
      </div>
      <div class="cartao-stat" v-if="simuladosOrdenados.length === 0">
        <div class="valor" style="font-size:20px;color:var(--texto-sec);">—</div>
        <div class="rotulo">Nenhum simulado registrado</div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">Registrar Simulado</div>
      <div class="form-simulado">
        <div>
          <label for="simulado-semana">Semana</label>
          <input id="simulado-semana" type="number" v-model.number="formSimulado.semana" min="1" :max="semanasPlano">
        </div>
        <div>
          <label for="simulado-portugues">Português (/10)</label>
          <input id="simulado-portugues" type="number" v-model.number="formSimulado.portugues" min="0" max="10">
        </div>
        <div>
          <label for="simulado-matematica">Matemática (/10)</label>
          <input id="simulado-matematica" type="number" v-model.number="formSimulado.matematica" min="0" max="10">
        </div>
        <div>
          <label for="simulado-quimica">Química (/38)</label>
          <input id="simulado-quimica" type="number" v-model.number="formSimulado.quimica" min="0" max="38">
        </div>
        <div>
          <label for="simulado-total">Total /{{ totalQuestoes }}</label>
          <input id="simulado-total" type="number" :value="formSimuladoTotal" disabled class="input-total-calculado">
        </div>
        <div>
          <label class="label-espacador" aria-hidden="true">&nbsp;</label>
          <button @click="salvarSimulado">Salvar</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">Histórico</div>
      <table class="tabela-simulados">
        <thead>
          <tr>
            <th>#</th><th>Semana</th><th>Português</th><th>Matemática</th><th>Química</th><th>Total</th><th>%</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in simuladosOrdenados" :key="s.semana">
            <td>{{ i+1 }}</td>
            <td>{{ s.semana }}</td>
            <td>{{ s.portugues }}/10</td>
            <td>{{ s.matematica }}/10</td>
            <td>{{ s.quimica }}/38</td>
            <td><strong>{{ s.total }}/{{ totalQuestoes }}</strong></td>
            <td :style="{ color: s.porcentagem >= 70 ? 'var(--sucesso)' : s.porcentagem >= 50 ? 'var(--aviso)' : 'var(--erro)', fontWeight: 700 }">{{ s.porcentagem }}%</td>
            <td><button @click="window.confirm('Remover este simulado?') && removerSimulado(s.semana)" style="background:none;border:none;cursor:pointer;color:var(--erro);font-size:16px;">✕</button></td>
          </tr>
          <tr v-if="simuladosOrdenados.length === 0">
            <td colspan="8" style="color:var(--texto-sec);padding:20px;">Nenhum simulado registrado ainda.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
