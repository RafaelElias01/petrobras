<script setup>
import { computed } from 'vue';
import { usePlano } from './usePlano.js';

const {
  planos, planoSelecionado, carregandoPlano,
  planoHtml, carregarPlano
} = usePlano();

const planosGrupos = computed(() => [...new Set(planos.value.map(p => p.grupo))]);
const planosFiltrados = (g) => planos.value.filter(p => p.grupo === g);
</script>

<template>
  <div class="card" style="margin-bottom:16px;">
    <div class="card-titulo" style="margin-bottom:0;">
      <select v-model="planoSelecionado" @change="carregarPlano" style="flex:1;padding:10px 14px;border:1px solid var(--borda);border-radius:8px;font-size:14px;font-family:inherit;background:var(--card);color:var(--texto);outline:none;cursor:pointer;">
        <optgroup v-for="g in planosGrupos" :key="g" :label="g">
          <option v-for="p in planosFiltrados(g)" :key="p.id" :value="p.id">{{ p.nome }}</option>
        </optgroup>
      </select>
    </div>
  </div>
  <div class="card" v-if="carregandoPlano" style="text-align:center;padding:40px;color:var(--texto-sec);">Carregando...</div>
  <div class="card plano-conteudo" v-if="!carregandoPlano && planoHtml" v-html="planoHtml"></div>
  <div class="card" v-if="!carregandoPlano && !planoHtml" style="text-align:center;padding:40px;color:var(--texto-sec);">Selecione um documento acima para visualizar.</div>
</template>
