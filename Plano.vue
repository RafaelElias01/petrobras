<script setup>
import { computed, onMounted, watch } from 'vue';
import { usePlano } from './usePlano.js';

const {
  planos, planoSelecionado, carregandoPlano,
  planoHtml, fetchPlanos, carregarPlano
} = usePlano();

function sanitizeHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const scripts = doc.querySelectorAll('script, iframe, object, embed, link[rel="import"]');
  scripts.forEach(el => el.remove());
  const allElements = doc.querySelectorAll('*');
  allElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on') || attr.value.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
}

const planosGrupos = computed(() => [...new Set(planos.value.map(p => p.grupo))]);
const planosFiltrados = (g) => planos.value.filter(p => p.grupo === g);

watch(planoSelecionado, (val) => {
  if (val) carregarPlano();
});

onMounted(async () => {
  await fetchPlanos();
  if (planos.value.length > 0 && !planoSelecionado.value) {
    planoSelecionado.value = planos.value[0].id;
  }
});
</script>

<template>
  <div>
    <div class="card" style="margin-bottom:16px;">
      <div class="card-titulo" style="margin-bottom:0;">
        <select v-model="planoSelecionado" style="flex:1;padding:10px 14px;border:1px solid var(--borda);border-radius:8px;font-size:14px;font-family:inherit;background:var(--card);color:var(--texto);outline:none;cursor:pointer;">
          <option value="" disabled>Selecione um documento...</option>
          <optgroup v-for="g in planosGrupos" :key="g" :label="g">
            <option v-for="p in planosFiltrados(g)" :key="p.id" :value="p.id">{{ p.nome }}</option>
          </optgroup>
        </select>
      </div>
    </div>
    <div class="card" v-if="carregandoPlano" style="text-align:center;padding:40px;color:var(--texto-sec);">Carregando...</div>
    <div class="card plano-conteudo" v-if="!carregandoPlano && planoHtml" v-html="sanitizeHTML(planoHtml)"></div>
    <div class="card" v-if="!carregandoPlano && !planoHtml" style="text-align:center;padding:40px;color:var(--texto-sec);">Selecione um documento acima para visualizar.</div>
  </div>
</template>
