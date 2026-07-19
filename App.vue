<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import QRCode from 'qrcode';
import { gerarPayloadPix } from './pix.js';

import Login from './Login.vue';
import Dashboard from './Dashboard.vue'; // Importado estaticamente para performance inicial
import ErrorBoundary from './ErrorBoundary.vue';
import { autenticar, carregarUsuarios, hashPassword, salvarUsuarios } from './usuarios.js';

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
  const user = await autenticar(usuario, senha);
  if (user) {
    usuarioAtual.value = user;
    autenticado.value = true;
    erroLogin.value = false;
    const sessao = { user, token: gerarToken(), timestamp: Date.now() };
    sessionStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
    localStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
    registrarVisita();
  } else {
    erroLogin.value = true;
  }
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
  />

  <div v-else-if="carregando" class="loading-screen">
    Carregando...
  </div>
  <template v-else>
    <div class="sidebar-backdrop" :class="{ visivel: menuAberta }" @click="menuAberta = false"></div>
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
        <div v-if="featureBloqueada(view)" class="overlay-bloqueio" @click="irPara('dashboard')" @scroll.prevent @wheel.prevent @touchmove.prevent>
          <div class="overlay-card" @click.stop>
            <div class="login-card-header">
              <h2>Pagamento Premium</h2>
              <p>Escaneie o QR Code abaixo com o app do seu banco.</p>
            </div>
            <div class="instrucao-premium">
              <button class="btn-fechar" @click="irPara('dashboard')" aria-label="Fechar">✕</button>
              <div class="pix-qr-wrapper">
                <div class="pix-value">👑 Premium — R$ 49,90</div>
                <img v-if="qrCodePremium" :src="qrCodePremium" alt="QR Code PIX" class="pix-qr" />
                <div v-else class="pix-loading">Gerando QR Code...</div>
                <div class="pix-label">Escaneie com o app do seu banco</div>
              </div>
              <p class="pix-help">Após o pagamento, envie o comprovante no WhatsApp para receber seu acesso:</p>
              <a href="https://wa.me/5551983098650?text=Ol%C3%A1!%20Realizei%20o%20pagamento%20Premium%20(PIX)%20e%20gostaria%20de%20receber%20meu%20acesso." target="_blank" class="btn-whatsapp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Enviar Comprovante
              </a>
              <button @click="irPara('dashboard')" class="btn-voltar">← Voltar</button>
            </div>
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

.instrucao-premium {
  text-align: center;
  animation: fadeIn 0.5s ease;
}

.instrucao-premium p {
  color: var(--texto-sec);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.pix-qr-wrapper {
  text-align: center;
  padding: 8px 0 4px;
}

.pix-value {
  font-size: 20px;
  color: var(--texto);
  margin-bottom: 16px;
}

.pix-qr {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px;
  border-radius: 12px;
  background: #fff;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.pix-loading {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.06);
  border-radius: 12px;
  color: var(--texto-sec);
  font-size: 14px;
}

.pix-label {
  font-size: 13px;
  color: var(--texto-sec);
  margin-top: 8px;
  margin-bottom: 8px;
}

.pix-help {
  font-size: 13px;
  color: var(--texto-sec);
  margin-bottom: 12px;
  line-height: 1.5;
}

.btn-whatsapp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px;
  background: #25D366;
  color: #fff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
  font-family: inherit;
  border: none;
  cursor: pointer;
}

.btn-whatsapp:hover {
  background: #1ebe5d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37,211,102,0.35);
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

.btn-fechar {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  color: var(--texto);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.btn-fechar:hover {
  background: rgba(255,255,255,0.3);
}

.btn-voltar {
  background: none;
  border: none;
  color: var(--texto-sec);
  font-size: 13px;
  cursor: pointer;
  margin-top: 16px;
  margin-bottom: 8px;
  padding: 8px 16px;
  transition: color 0.2s;
  width: 100%;
  font-family: inherit;
}
.btn-voltar:hover {
  color: var(--texto);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 480px) {
  .overlay-card {
    padding: 32px 20px 28px;
    max-width: 90%;
  }
  .pix-qr {
    width: 160px;
    height: 160px;
  }
  .pix-value {
    font-size: 17px;
  }
}
</style>
