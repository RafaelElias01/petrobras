<script setup>
import { ref } from 'vue';
import { useChecklist } from './useChecklist.js';
import { useDiario } from './useDiario.js';
import { hojeLocalISO } from './dataLocal.js';
import { CONTEUDOS } from './dados.js';
import IconeNav from './IconeNav.vue';

const {
  progressoMateria, totalConcluidoGeral, totalGeral, filtro,
  conteudosFiltrados, expandirTudo, colapsarTudo, itensConcluidos,
  totalItens, toggleGrupo, gruposAbertos, itensConcluidosGrupo,
  checklist, alternarItem
} = useChecklist();

const { agendarRevisao } = useDiario();

const conteudos = CONTEUDOS;

const abaAtiva = ref(null);

function toggleAba(id) {
  abaAtiva.value = abaAtiva.value === id ? null : id;
}

// Ao marcar (não desmarcar) um tópico como concluído, agenda a revisão
// espaçada dele (D+1/D+7/D+30) automaticamente.
function handleToggleItem(materia, topico, materiaId, grupoNome, idxOriginal) {
  const concluido = alternarItem(materiaId, grupoNome, idxOriginal);
  if (concluido) {
    agendarRevisao(topico, materia.nome, hojeLocalISO());
  }
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
        <IconeNav :nome="m.icone" /> {{ m.nome }}
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

      <div class="checklist-toolbar">
        <input v-model="filtro" type="text" placeholder="🔍 Buscar tópico..." aria-label="Buscar tópico no checklist" class="filtro-input">
        <button @click="expandirTudo" class="btn-expandir">📂 Expandir Tudo</button>
        <button @click="colapsarTudo" class="btn-colapsar">📁 Colapsar Tudo</button>
      </div>

      <div v-for="m in conteudosFiltrados.filter(c => !abaAtiva || c.id === abaAtiva)" :key="m.id" style="margin-bottom:24px;">
        <h3 style="font-size:16px;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--borda);">
          <IconeNav :nome="m.icone" /> {{ m.nome }}
          <span style="font-size:13px;color:var(--texto-sec);font-weight:400;">({{ itensConcluidos(m) }}/{{ totalItens(m) }})</span>
        </h3>
        <div v-for="g in m.grupos" :key="g.nome" class="grupo-checklist">
          <div class="grupo-titulo" role="button" tabindex="0"
            :aria-expanded="!!gruposAbertos[m.id+'-'+g.nome]"
            @click="toggleGrupo(m.id, g.nome)"
            @keydown.enter.prevent="toggleGrupo(m.id, g.nome)"
            @keydown.space.prevent="toggleGrupo(m.id, g.nome)">
            {{ gruposAbertos[m.id+'-'+g.nome] ? '▼' : '▶' }} {{ g.nome }}
            <span style="font-size:12px;color:var(--texto-sec);font-weight:400;">({{ itensConcluidosGrupo(m.id, g) }}/{{ g.topicos.length }})</span>
            <span v-if="g.exercicios_sugeridos" style="font-size:11px;color:var(--aviso);font-weight:400;margin-left:8px;">🎯 {{ g.exercicios_sugeridos }} exercícios</span>
          </div>
          <div v-show="gruposAbertos[m.id+'-'+g.nome]">
            <label v-for="t in g.topicos" :key="t.idxOriginal" class="item-check" :class="{ concluido: checklist[`${m.id}-${g.nome}-${t.idxOriginal}`] }">
              <input type="checkbox" :checked="checklist[`${m.id}-${g.nome}-${t.idxOriginal}`]" @change="handleToggleItem(m, t.texto, m.id, g.nome, t.idxOriginal)">
              <span class="texto">{{ t.texto }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checklist-toolbar {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.filtro-input {
  flex: 1;
  min-width: 140px;
  padding: 8px 12px;
  border: 1px solid var(--borda);
  border-radius: 4px;
  background: var(--fundo-sec);
  color: var(--texto);
  font-size: 14px;
  font-family: inherit;
  outline: none;
}
.btn-expandir {
  padding: 8px 12px;
  background: var(--primaria);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  white-space: nowrap;
}
.btn-colapsar {
  padding: 8px 12px;
  background: var(--texto-sec);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  white-space: nowrap;
}
@media (max-width: 768px) {
  .checklist-toolbar {
    flex-direction: column;
  }
  .checklist-toolbar .filtro-input {
    width: 100%;
  }
  .btn-expandir, .btn-colapsar {
    padding: 10px 12px;
    min-height: 44px;
    font-size: 16px;
    flex: 1;
  }
  .filtro-input {
    font-size: 16px;
    min-height: 44px;
  }
}
@media (max-width: 600px) {
  .btn-expandir, .btn-colapsar {
    font-size: 13px;
    padding: 10px 8px;
  }
  .filtro-input {
    font-size: 16px;
  }
}
@media (max-width: 480px) {
  .btn-expandir, .btn-colapsar {
    font-size: 12px;
    padding: 10px 6px;
  }
}
</style>
