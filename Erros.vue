<script setup>
import { onMounted } from 'vue';
import { useErros } from './useErros.js';

const {
  totalErros, errosAgrupados, editandoErro, carregarErros, agendarRevisao,
  novoErro, salvarErro, cancelarErro, editarErro, removerErro,
} = useErros();

onMounted(() => {
  carregarErros();
});
</script>

<template>
  <div class="grade-cartoes">
    <div class="cartao-stat vermelho">
      <div class="valor">{{ totalErros }}</div>
      <div class="rotulo">Total de erros registrados</div>
    </div>
    <div class="cartao-stat" v-for="(errList, mat) in errosAgrupados" :key="mat">
      <div class="valor" style="font-size:24px;">{{ errList.length }}</div>
      <div class="rotulo">{{ mat }}</div>
    </div>
  </div>

  <div class="card">
    <div class="card-titulo">
      <span>{{ editandoErro ? (editandoErro.id ? 'Editar Erro' : 'Novo Erro') : 'Caderno de Erros' }}</span>
    </div>
    <div v-if="editandoErro" class="form-simulado">
      <div>
        <label>Matéria</label>
        <select v-model="editandoErro.materia" style="width:100%;padding:8px 10px;border:1px solid var(--borda);border-radius:6px;font-size:14px;font-family:inherit;background:var(--card);color:var(--texto);">
          <option value="">Selecione...</option>
          <option>Português</option>
          <option>Matemática</option>
          <option>Química</option>
        </select>
      </div>
      <div>
        <label>Tópico</label>
        <input v-model="editandoErro.topico" placeholder="Ex: pH, Estequiometria">
      </div>
      <div>
        <label>O que pensei (erro)</label>
        <input v-model="editandoErro.pensamento" placeholder="Seu raciocínio na hora">
      </div>
      <div>
        <label>Resposta correta</label>
        <input v-model="editandoErro.respostaCorreta" placeholder="O que deveria ser">
      </div>
      <div>
        <label>Lacuna identificada</label>
        <input v-model="editandoErro.lacuna" placeholder="O que faltou saber">
      </div>
      <div>
        <label>Tipo de erro</label>
        <select v-model="editandoErro.tipo" style="width:100%;padding:8px 10px;border:1px solid var(--borda);border-radius:6px;font-size:14px;font-family:inherit;background:var(--card);color:var(--texto);">
          <option value="A">A - Desconhecimento</option>
          <option value="B">B - Confusão</option>
          <option value="C">C - Atenção</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;">
        <button @click="salvarErro" style="flex:1;">Salvar</button>
        <button @click="cancelarErro" style="flex:1;background:var(--texto-sec);">Cancelar</button>
      </div>
    </div>
    <div v-else>
      <button @click="novoErro" style="margin-bottom:16px;padding:8px 20px;background:var(--primaria);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-family:inherit;">+ Novo Erro</button>
      <div v-for="(errList, mat) in errosAgrupados" :key="mat" style="margin-bottom:20px;">
        <h4 style="font-size:14px;margin-bottom:8px;color:var(--texto-sec);text-transform:uppercase;">{{ mat }} ({{ errList.length }})</h4>
        <div v-if="errList.length === 0" style="font-size:13px;color:var(--texto-sec);padding:8px 0;">Nenhum erro registrado.</div>
        <div v-for="e in errList" :key="e.id" style="padding:12px;border:1px solid var(--borda);border-radius:8px;margin-bottom:8px;font-size:14px;">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:8px;">
            <div style="flex:1;">
              <strong>{{ e.topico }}</strong>
              <div style="margin-top:6px;font-size:13px;color:var(--texto-sec);">
                <div><strong>Pensei:</strong> {{ e.pensamento }}</div>
                <div><strong>Correto:</strong> {{ e.respostaCorreta }}</div>
                <div v-if="e.lacuna"><strong>Lacuna:</strong> {{ e.lacuna }}</div>
              </div>
            </div>
            <div style="display:flex;gap:4px;flex-shrink:0;">
              <button @click="agendarRevisao(e.topico, e.materia, e.data)" title="Agendar revisão espaçada">📅</button>
              <button @click="editarErro(e)" title="Editar">✏️</button>
              <button @click="removerErro(e.id)" title="Remover">✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>