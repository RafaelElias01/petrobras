<script setup>
import { ref } from 'vue';
import { useChecklist } from './useChecklist.js';
import { CONTEUDOS } from './dados.js';

const {
  progressoMateria, totalConcluidoGeral, totalGeral, filtro,
  conteudosFiltrados, expandirTudo, colapsarTudo, itensConcluidos,
  totalItens, toggleGrupo, gruposAbertos, itensConcluidosGrupo,
  checklist, alternarItem
} = useChecklist();

const conteudos = CONTEUDOS;

const abaAtiva = ref(null);

function toggleAba(id) {
  abaAtiva.value = abaAtiva.value === id ? null : id;
}
</script>

<template>
  <div>
    <div class="checklist-tabs">
      <button class="checklist-tab" :class="{ active: abaAtiva === null }" @click="abaAtiva = null">
        📋 Todas
        <span class="tab-progress">{{ totalConcluidoGeral }}/{{ totalGeral }}</span>
      </button>
      <button v-for="m in conteudos" :key="m.id" class="checklist-tab" :class="{ active: abaAtiva === m.id }"
        :style="abaAtiva === m.id ? { borderBottomColor: m.cor, color: m.cor } : {}" @click="toggleAba(m.id)">
        {{ m.icone }} {{ m.nome }}
        <span class="tab-progress">{{ progressoMateria(m) }}%</span>
      </button>
    </div>

    <div class="card">
      <div class="card-titulo">
        <span>Conteúdos Detalhados</span>
        <span style="font-size:14px;color:var(--texto-sec);font-weight:400;">
          {{ totalConcluidoGeral }}/{{ totalGeral }} concluídos
        </span>
      </div>

      <div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <input v-model="filtro" type="text" placeholder="🔍 Buscar tópico..."
          style="flex:1;min-width:140px;padding:8px 12px;border:1px solid var(--borda);border-radius:4px;background:var(--fundo-sec);color:var(--texto);font-size:13px;">
        <button @click="expandirTudo" style="padding:8px 12px;background:var(--primaria);color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;font-weight:500;">📂 Expandir Tudo</button>
        <button @click="colapsarTudo" style="padding:8px 12px;background:var(--texto-sec);color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;font-weight:500;">📁 Colapsar Tudo</button>
      </div>

      <div v-for="m in (filtro ? conteudosFiltrados : conteudos).filter(c => !abaAtiva || c.id === abaAtiva)" :key="m.id" style="margin-bottom:24px;">
        <h3 style="font-size:16px;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--borda);">
          {{ m.icone }} {{ m.nome }}
          <span style="font-size:13px;color:var(--texto-sec);font-weight:400;">({{ itensConcluidos(m) }}/{{ totalItens(m) }})</span>
        </h3>
        <div v-for="g in m.grupos" :key="g.nome" class="grupo-checklist">
          <div class="grupo-titulo" @click="toggleGrupo(m.id, g.nome)">
            {{ gruposAbertos[m.id+'-'+g.nome] ? '▼' : '▶' }} {{ g.nome }}
            <span style="font-size:12px;color:var(--texto-sec);font-weight:400;">({{ itensConcluidosGrupo(m.id, g) }}/{{ g.topicos.length }})</span>
            <span v-if="g.exercicios_sugeridos" style="font-size:11px;color:var(--aviso);font-weight:400;margin-left:8px;">🎯 {{ g.exercicios_sugeridos }} exercícios</span>
          </div>
          <div v-show="gruposAbertos[m.id+'-'+g.nome]">
            <label v-for="(t, idx) in g.topicos" :key="t" class="item-check" :class="{ concluido: checklist[`${m.id}-${g.nome}-${idx}`] }">
              <input type="checkbox" :checked="checklist[`${m.id}-${g.nome}-${idx}`]" @change="alternarItem(m.id, g.nome, idx)">
              <span class="texto">{{ t }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
