<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import QRCode from 'qrcode';
import { gerarPayloadPix } from './pix.js';

import Login from './Login.vue';
import Dashboard from './Dashboard.vue';
import ErrorBoundary from './ErrorBoundary.vue';
import PremiumCheckout from './PremiumCheckout.vue';
import { carregarUsuarios, hashPassword, salvarUsuarios } from './usuarios.js';

const Checklist = defineAsyncComponent(() => import('./Checklist.vue'));
const Horas = defineAsyncComponent(() => import('./Horas.vue'));
const Ciclo = defineAsyncComponent(() => import('./Ciclo.vue'));
const Simulados = defineAsyncComponent(() => import('./Simulados.vue'));
const Erros = defineAsyncComponent(() => import('./Erros.vue'));
const Flashcards = defineAsyncComponent(() => import('./Flashcards.vue'));
const Diario = defineAsyncComponent(() => import('./Diario.vue'));
const Plano = defineAsyncComponent(() => import('./Plano.vue'));
const Relatorio = defineAsyncComponent(() => import('./Relatorio.vue'));
const Exercicios = defineAsyncComponent(() => import('./Exercicios.vue'));
const Admin = defineAsyncComponent(() => import('./Admin.vue'));

const SESSAO_KEY = 'petro_quimica_sessao';
function gerarToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(36).padStart(2, '0')).join('');
}

const usuarioAtual = ref(null);
const autenticado = ref(false);
const erroLogin = ref(false);
const erroMsg = ref('');

const FEATURES_BLOQUEADAS_DEMO = new Set([
  'ciclo', 'horas', 'simulados', 'erros',
  'diario', 'relatorio', 'exercicios', 'admin'
]);
const isDemo = computed(() =>
  usuarioAtual.value?.usuario === 'estudante' && usuarioAtual.value?.role !== 'admin'
);
function featureBloqueada(view) {
  return isDemo.value && FEATURES_BLOQUEADAS_DEMO.has(view);
}

// Limite de acesso demo: contado no servidor por sessão de login (ver
// POST /api/demo/incrementar em server.js), não mais em localStorage —
// evita burlar limpando storage ou trocando de navegador na mesma sessão.
function tokenSessaoAtual() {
  const bruto = localStorage.getItem(SESSAO_KEY);
  if (!bruto) return null;
  try { return JSON.parse(bruto).serverToken || null; } catch { return null; }
}

async function incrementarDemoCount() {
  if (!usuarioAtual.value || usuarioAtual.value.usuario !== 'estudante') return;
  const token = tokenSessaoAtual();
  if (!token) return;
  try {
    const res = await fetch('/api/demo/incrementar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.expirado) {
      logout();
      alert('Seu acesso de demonstração expirou. Crie sua conta ou assine o Premium para continuar.');
    }
  } catch { /* backend offline: nao bloqueia navegacao */ }
}

function handleDemoNavigation(novaView) {
  if (isDemo.value && FEATURES_BLOQUEADAS_DEMO.has(novaView)) {
    incrementarDemoCount();
  }
}

const carregando = ref(true);
const menuAberta = ref(false);
const view = ref('dashboard');
const tema = ref(localStorage.getItem('petro_tema') || 'dark');
const qrCodePremium = ref('');
const visitaRegistrada = ref(false);

async function registrarVisita() {
  if (visitaRegistrada.value) return;
  try {
    const usuario = usuarioAtual.value?.usuario || 'anônimo';
    await fetch('/api/visitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario })
    });
    visitaRegistrada.value = true;
  } catch {}
}

const titulos = {
  dashboard: { t: 'Dashboard', s: 'Visão geral do seu progresso' },
  checklist: { t: 'Conteúdos', s: 'Checklist de tópicos do edital' },
  ciclo: { t: 'Ciclo de Estudos', s: 'Metodologia de estudo rotativo' },
  horas: { t: 'Quadro de Horas', s: 'Controle seu tempo de estudo' },
  simulados: { t: 'Simulados', s: 'Acompanhe seu desempenho' },
  erros: { t: 'Caderno de Erros', s: 'Transforme falhas em aprendizado' },
  flashcards: { t: 'Flashcards', s: 'Revisão com repetição espaçada' },
  diario: { t: 'Diário de Bordo', s: 'Seu checklist de hábitos diários' },
  relatorio: { t: 'Relatório', s: 'Análise de desempenho e produtividade' },
  plano: { t: 'Plano de Estudos', s: 'Documentos e cronogramas' },
  exercicios: { t: 'Banco de Questões', s: 'Pratique com questões estilo Cesgranrio' },
  admin: { t: 'Administração', s: 'Gerenciar usuários da plataforma' },
};

const tituloView = computed(() => titulos[view.value]?.t || 'Dashboard');
const subtituloView = computed(() => titulos[view.value]?.s || '');

function irPara(novaView) {
  handleDemoNavigation(novaView);
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

async function handleLogin(usuario, senha) {
  // Autenticação exclusivamente via servidor (fonte de verdade; senhas em bcrypt).
  // O fallback client-side (autenticar() de usuarios.js) foi removido: dois
  // sistemas de login desconexos era uma inconsistência arquitetural (Fase 2
  // do roadmap de segurança). Usuários demo admin/estudante agora precisam
  // existir em dados/usuarios.json no servidor (ver server.js: seedUsuariosDemo).
  let user = null;
  let serverToken = null;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha }),
    });
    if (res.ok) {
      const data = await res.json();
      user = data.user;
      serverToken = data.token || null;
    }
  } catch { /* backend offline: login falha (sem fallback local) */ }

  if (user) {
    usuarioAtual.value = user;
    autenticado.value = true;
    erroLogin.value = false;
    const sessao = { user, token: gerarToken(), serverToken, timestamp: Date.now() };
    sessionStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
    localStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
    registrarVisita();
    if (user.usuario === 'estudante') {
      incrementarDemoCount();
    }
  } else {
    erroLogin.value = true;
  }
}

function handleRegisterSuccess(usuario, senha) {
  handleLogin(usuario, senha);
}

function logout() {
  usuarioAtual.value = null;
  autenticado.value = false;
  sessionStorage.removeItem(SESSAO_KEY);
  localStorage.removeItem(SESSAO_KEY);
  view.value = 'dashboard';
}

function verificarSessao() {
  const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  const local = localStorage.getItem(SESSAO_KEY);
  const session = sessionStorage.getItem(SESSAO_KEY);
  if (!session) {
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (!parsed?.user?.usuario) { logout(); return; }
        if (Date.now() - parsed.timestamp > SESSION_MAX_AGE) { logout(); return; }
        usuarioAtual.value = parsed.user;
        autenticado.value = true;
        sessionStorage.setItem(SESSAO_KEY, local);
      } catch { logout() }
    }
    return;
  }
  if (!local) { logout(); return; }
  try {
    const localParsed = JSON.parse(local);
    const sessionParsed = JSON.parse(session);
    if (!localParsed || !sessionParsed) { logout(); return; }
    if (localParsed.token !== sessionParsed.token) { logout(); return; }
    if (Date.now() - localParsed.timestamp > SESSION_MAX_AGE) { logout(); return; }
    usuarioAtual.value = localParsed.user;
    autenticado.value = true;
  } catch { logout() }
}

onMounted(async () => {
  document.documentElement.dataset.tema = tema.value;
  window.addEventListener('hashchange', navegarHash);
  window.addEventListener('navegar', (e) => { if (e.detail) irPara(e.detail); });
  window.addEventListener('storage', (e) => {
    if (e.key === SESSAO_KEY) verificarSessao();
  });
  verificarSessao();
  navegarHash();
  registrarVisita();
  setTimeout(() => {
    carregando.value = false;
  }, 200);
  const payload = gerarPayloadPix({
    chave: '+5551983098650',
    nome: 'PETROBRAS ACADEMY',
    cidade: 'SAO PAULO',
    valor: 49.90,
  });
  qrCodePremium.value = await QRCode.toDataURL(payload, {
    width: 280,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
});

const views = {
  dashboard: Dashboard,
  checklist: Checklist,
  horas: Horas,
  ciclo: Ciclo,
  simulados: Simulados,
  erros: Erros,
  flashcards: Flashcards,
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
  { view: 'flashcards', icon: '🃏', text: 'Flashcards' },
  { view: 'diario', icon: '📌', text: 'Diário' },
  { view: 'relatorio', icon: '📊', text: 'Relatório' },
  { view: 'exercicios', icon: '📝', text: 'Questões' },
];

const planoLink = { view: 'plano', icon: '📖', text: 'Plano de Estudos' };
</script>

<template>
  <Login
    v-if="!autenticado"
    :erro="erroLogin"
    @tentativa-login="handleLogin"
    @registro-sucesso="handleRegisterSuccess"
  />

  <div v-else-if="carregando" class="loading-screen">
    Carregando...
  </div>
  <template v-else>
    <div class="sidebar-backdrop" :class="{ visivel: menuAberta }" @click="menuAberta = false" @keydown.escape="menuAberta = false"></div>
    <aside class="sidebar" :class="{ aberta: menuAberta }">
      <div class="sidebar-logo">
        <h1>Petrobras 2026</h1>
        <span>Técnico em Química • Cesgranrio</span>
      </div>
      <nav class="sidebar-nav">
        <a v-for="link in navLinks" :key="link.view" :href="`#${link.view}`" class="nav-item" :class="{ ativa: view === link.view }" @click.prevent="irPara(link.view)">
          <span class="icone">{{ link.icon }}</span> {{ link.text }}
          <span v-if="featureBloqueada(link.view)" class="icone-lock">🔒</span>
        </a>
        <a v-if="usuarioAtual?.role === 'admin'" href="#admin" class="nav-item" :class="{ ativa: view === 'admin' }" @click.prevent="irPara('admin')" style="border-top:1px solid rgba(255,255,255,0.08);margin-top:8px;padding-top:12px;">
          <span class="icone">⚙️</span> Admin
          <span v-if="featureBloqueada('admin')" class="icone-lock">🔒</span>
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

      <div class="view-wrapper" :class="{ 'view-bloqueada': featureBloqueada(view) }">
        <ErrorBoundary :key="view">
          <transition name="fade" mode="out-in">
            <component
              :is="views[view]"
              :key="view"
              :usuarioLogado="view === 'admin' ? usuarioAtual?.usuario : undefined"
            />
          </transition>
        </ErrorBoundary>
        <div v-if="featureBloqueada(view)" class="overlay-bloqueio" @click="irPara('dashboard')" @keydown.escape="irPara('dashboard')" @scroll.prevent @wheel.prevent @touchmove.prevent>
          <div class="overlay-card" @click.stop>
            <div class="login-card-header">
              <h2>Pagamento Premium</h2>
              <p>Escaneie o QR Code abaixo com o app do seu banco.</p>
            </div>
            <PremiumCheckout :qrCode="qrCodePremium" :token="tokenSessaoAtual()" :onClose="() => irPara('dashboard')" />
          </div>
        </div>
      </div>
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

.view-wrapper {
  position: relative;
  min-height: 300px;
}

.view-wrapper.view-bloqueada {
  overflow: hidden;
  max-height: 100vh;
}

.overlay-bloqueio {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  cursor: default;
}

.overlay-card {
  background: color-mix(in srgb, var(--card) 85%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--borda);
  border-radius: 20px;
  padding: 36px 36px 32px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  animation: overlayIn 0.4s ease-out;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
  position: relative;
}



@keyframes overlayIn {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(0,0,0,0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
.sidebar-backdrop.visivel {
  opacity: 1;
  pointer-events: auto;
}

.icone-lock {
  margin-left: auto;
  font-size: 12px;
  opacity: 0.5;
}

.login-card-header {
  text-align: center;
  margin-bottom: 24px;
}
.login-card-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--texto);
  margin-bottom: 6px;
}
.login-card-header p {
  font-size: 14px;
  color: var(--texto-sec);
}

@media (max-width: 1024px) {
  .overlay-card {
    padding: 32px 24px;
  }
  .login-card-header h2 {
    font-size: 20px;
  }
}
@media (max-width: 768px) {
  .overlay-card {
    padding: 28px 20px 24px;
  }
  .login-card-header h2 {
    font-size: 18px;
  }
  .login-card-header p {
    font-size: 13px;
  }
}
@media (max-width: 600px) {
  .overlay-card {
    padding: 24px 16px 20px;
    max-width: 95%;
  }
}
@media (max-width: 480px) {
  .overlay-card {
    padding: 32px 20px 28px;
    max-width: 90%;
  }
}
</style>
