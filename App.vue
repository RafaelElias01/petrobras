<script setup>
import { ref, computed, onMounted } from 'vue';

import Login from './Login.vue';
import Dashboard from './Dashboard.vue';
import Checklist from './Checklist.vue';
import Horas from './Horas.vue';
import Ciclo from './Ciclo.vue';
import Simulados from './Simulados.vue';
import Erros from './Erros.vue';
import Diario from './Diario.vue';
import Plano from './Plano.vue';
import Relatorio from './Relatorio.vue';
import Exercicios from './Exercicios.vue';
import Admin from './Admin.vue';
import { autenticar } from './usuarios.js';

const usuarioAtual = ref(JSON.parse(sessionStorage.getItem('petro_usuario') || 'null'));
const autenticado = ref(!!usuarioAtual.value);
const erroLogin = ref(false);

const carregando = ref(true);
const menuAberta = ref(false);
const view = ref('dashboard');
const tema = ref(localStorage.getItem('petro_tema') || 'dark');

const titulos = {
  dashboard: { t: 'Dashboard', s: 'Visão geral do seu progresso' },
  checklist: { t: 'Conteúdos', s: 'Checklist de tópicos do edital' },
  ciclo: { t: 'Ciclo de Estudos', s: 'Metodologia de estudo rotativo' },
  horas: { t: 'Quadro de Horas', s: 'Controle seu tempo de estudo' },
  simulados: { t: 'Simulados', s: 'Acompanhe seu desempenho' },
  erros: { t: 'Caderno de Erros', s: 'Transforme falhas em aprendizado' },
  diario: { t: 'Diário de Bordo', s: 'Seu checklist de hábitos diários' },
  relatorio: { t: 'Relatório', s: 'Análise de desempenho e produtividade' },
  plano: { t: 'Plano de Estudos', s: 'Documentos e cronogramas' },
  exercicios: { t: 'Banco de Questões', s: 'Pratique com questões estilo Cesgranrio' },
  admin: { t: 'Administração', s: 'Gerenciar usuários da plataforma' },
};

const tituloView = computed(() => titulos[view.value]?.t || 'Dashboard');
const subtituloView = computed(() => titulos[view.value]?.s || '');

function irPara(novaView) {
  view.value = novaView;
  menuAberta.value = false;
  window.scrollTo(0, 0);
  window.location.hash = novaView;
}

function alternarTema() {
  tema.value = tema.value === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.tema = tema.value;
  localStorage.setItem('petro_tema', tema.value);
}

function navegarHash() {
  const hash = window.location.hash.slice(1);
  if (hash && views[hash]) view.value = hash;
}

function handleLogin(usuario, senha) {
  const user = autenticar(usuario, senha);
  if (user) {
    usuarioAtual.value = user;
    autenticado.value = true;
    erroLogin.value = false;
    sessionStorage.setItem('petro_usuario', JSON.stringify(user));
  } else {
    erroLogin.value = true;
  }
}

function logout() {
  usuarioAtual.value = null;
  autenticado.value = false;
  sessionStorage.removeItem('petro_usuario');
  view.value = 'dashboard';
}

onMounted(() => {
  document.documentElement.dataset.tema = tema.value;
  window.addEventListener('hashchange', navegarHash);
  navegarHash();
  setTimeout(() => {
    carregando.value = false;
  }, 200);
});

const views = {
  dashboard: Dashboard,
  checklist: Checklist,
  horas: Horas,
  ciclo: Ciclo,
  simulados: Simulados,
  erros: Erros,
  diario: Diario,
  relatorio: Relatorio,
  plano: Plano,
  exercicios: Exercicios,
  admin: Admin,
};

const navLinks = [
  { view: 'dashboard', icon: '📊', text: 'Dashboard' },
  { view: 'checklist', icon: '✅', text: 'Conteúdos' },
  { view: 'ciclo', icon: '🔄', text: 'Ciclo' },
  { view: 'horas', icon: '⏱', text: 'Horas' },
  { view: 'simulados', icon: '📋', text: 'Simulados' },
  { view: 'erros', icon: '📕', text: 'Erros' },
  { view: 'diario', icon: '📌', text: 'Diário' },
  { view: 'relatorio', icon: '📊', text: 'Relatório' },
  { view: 'exercicios', icon: '📝', text: 'Questões' },
];

const planoLink = { view: 'plano', icon: '📖', text: 'Plano de Estudos' };
</script>

<template>
  <Login v-if="!autenticado" :erro="erroLogin" @tentativa-login="handleLogin" />

  <div v-else-if="carregando" class="loading-screen">
    Carregando...
  </div>
  <template v-else>
    <aside class="sidebar" :class="{ aberta: menuAberta }">
      <div class="sidebar-logo">
        <h1>Petrobras 2026</h1>
        <span>Técnico em Química • Cesgranrio</span>
      </div>
      <nav class="sidebar-nav">
        <a v-for="link in navLinks" :key="link.view" :href="`#${link.view}`" class="nav-item" :class="{ ativa: view === link.view }" @click.prevent="irPara(link.view)">
          <span class="icone">{{ link.icon }}</span> {{ link.text }}
        </a>
        <a v-if="usuarioAtual?.role === 'admin'" href="#admin" class="nav-item" :class="{ ativa: view === 'admin' }" @click.prevent="irPara('admin')" style="border-top:1px solid rgba(255,255,255,0.08);margin-top:8px;padding-top:12px;">
          <span class="icone">⚙️</span> Admin
        </a>
        <div style="border-top:1px solid rgba(255,255,255,0.08);margin:8px 16px;"></div>
        <a :href="`#${planoLink.view}`" class="nav-item" :class="{ ativa: view === planoLink.view }" @click.prevent="irPara(planoLink.view)">
          <span class="icone">{{ planoLink.icon }}</span> {{ planoLink.text }}
        </a>
      </nav>
      <div style="padding: 12px 20px; border-top: 1px solid rgba(255,255,255,0.08);">
        <div style="font-size:12px;color:var(--texto-sec);margin-bottom:8px;display:flex;align-items:center;gap:6px;">
          <span style="opacity:0.7;">👤</span> {{ usuarioAtual?.nome || 'Usuário' }}
          <span v-if="usuarioAtual?.role === 'admin'" style="font-size:10px;background:#f59e0b;color:#000;padding:1px 6px;border-radius:3px;font-weight:600;">ADM</span>
        </div>
        <button class="nav-item" @click="alternarTema" style="font-size:13px;">
          <span class="icone">{{ tema === 'dark' ? '☀️' : '🌙' }}</span>
          {{ tema === 'dark' ? 'Tema Claro' : 'Tema Escuro' }}
        </button>
        <button class="nav-item" @click="logout" style="font-size:13px;margin-top:4px;color:var(--erro);">
          <span class="icone">🚪</span> Sair
        </button>
      </div>
    </aside>

    <main class="conteudo">
      <div class="topo">
        <div>
          <button class="menu-toggle" @click="menuAberta = !menuAberta" aria-label="Alternar menu">☰</button>
          <h2>{{ tituloView }}</h2>
          <span class="sub">{{ subtituloView }}</span>
        </div>
      </div>

      <transition name="fade" mode="out-in">
        <component
          :is="views[view]"
          :key="view"
          :usuarioLogado="view === 'admin' ? usuarioAtual?.usuario : undefined"
        />
      </transition>
    </main>
  </template>
</template>

<style scoped>
.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  font-size: 18px;
  color: var(--texto-sec);
}
</style>
