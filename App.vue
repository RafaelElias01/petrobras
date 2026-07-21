<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue';

import Login from './Login.vue';
import Dashboard from './Dashboard.vue';
import ErrorBoundary from './ErrorBoundary.vue';
import PremiumCheckout from './PremiumCheckout.vue';
import IconeNav from './IconeNav.vue';
import { Armazenamento } from './armazenamento.js';

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
// Mesmo bloqueio que a demo sempre teve, agora vale pra qualquer conta --
// só quem pagou (premium:true) ou é admin acessa essas features. Antes disso
// uma conta gratuita própria tinha acesso total, sem nunca precisar pagar.
const temAcessoPremium = computed(() =>
  usuarioAtual.value?.role === 'admin' || usuarioAtual.value?.premium === true
);
function featureBloqueada(view) {
  return FEATURES_BLOQUEADAS_DEMO.has(view) && !temAcessoPremium.value;
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
    if (res.status === 401 || res.status === 403) { sessaoExpiradaNoServidor(); return; }
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
const visitaRegistrada = ref(false);

async function registrarVisita() {
  if (visitaRegistrada.value) return;
  try {
    const usuario = usuarioAtual.value?.usuario || 'anônimo';
    await fetch('/api/visitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, pagina: view.value })
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
  if (window.location.hash.slice(1) !== novaView) {
    window.location.hash = novaView;
  }
}

function alternarTema() {
  tema.value = tema.value === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.tema = tema.value;
  localStorage.setItem('petro_tema', tema.value);
}

// Reage a mudanças de hash (F5, link compartilhado, botão voltar/avançar do
// navegador). NÃO delega para irPara: irPara conta como navegação ativa do
// usuário (incrementa acesso demo); carregar uma URL com #hash já na barra
// de endereço não deveria contar como clique em feature bloqueada.
function navegarHash() {
  const hash = window.location.hash.slice(1);
  if (hash && views[hash] && hash !== view.value) {
    view.value = hash;
    menuAberta.value = false;
  }
}

function handleNavegarEvent(e) {
  if (e.detail) irPara(e.detail);
}

function handleStorageEvent(e) {
  if (e.key === SESSAO_KEY) verificarSessao();
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
  // Dados de estudo (ciclo, horas, erros, flashcards, diário, checklist,
  // simulados, favoritos) ficam salvos sob uma chave global no localStorage,
  // sem isolamento por usuário -- em computador compartilhado, o próximo
  // login herdaria (e poderia sobrescrever) o progresso de quem saiu. Limpa
  // tudo e recarrega a página: o reload também garante que os composables
  // (que guardam estado em singleton por módulo) recomecem do zero pro
  // próximo usuário, em vez de manterem em memória os dados do anterior.
  Armazenamento.limparTudo();
  window.location.reload();
}

// Sessão local ainda parece válida, mas o servidor já não reconhece o token
// (expirou, ou o processo reiniciou e perdeu as sessões em memória). Sem
// isso, ações como pagamento falham com erro genérico e sem explicação.
function sessaoExpiradaNoServidor() {
  logout();
  alert('Sua sessão expirou. Faça login novamente.');
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

function persistirSessaoAtual() {
  const bruto = localStorage.getItem(SESSAO_KEY);
  if (!bruto) return;
  try {
    const sessao = JSON.parse(bruto);
    sessao.user = usuarioAtual.value;
    localStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
    sessionStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
  } catch { /* sessão inválida: próxima verificarSessao() já desloga */ }
}

// Consulta read-only (não ativa nada) -- quem ativa premium de verdade é o
// webhook do Mercado Pago (POST /api/premium/webhook, assinatura verificada).
async function atualizarStatusPremium() {
  if (!usuarioAtual.value || usuarioAtual.value.premium) return;
  try {
    const res = await fetch(`/api/premium/status/${encodeURIComponent(usuarioAtual.value.usuario)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.premium) {
      usuarioAtual.value = { ...usuarioAtual.value, premium: true };
      persistirSessaoAtual();
    }
  } catch { /* sem conexão: tentativa seguinte do polling resolve */ }
}

// O Mercado Pago acrescenta parâmetros (status=approved, payment_id, etc) na
// URL de retorno (back_urls.success). Quem ativa premium de fato é o webhook
// (assíncrono, server-to-server) -- aqui só ficamos de olho por alguns
// segundos pra refletir na sessão assim que ele processar, sem exigir F5.
async function verificarRetornoPagamento() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status') || params.get('collection_status');
  if (status !== 'approved') return;
  history.replaceState(null, '', window.location.pathname + window.location.hash);
  for (let tentativa = 0; tentativa < 6; tentativa++) {
    await atualizarStatusPremium();
    if (usuarioAtual.value?.premium) return;
    await new Promise(r => setTimeout(r, 2000));
  }
}

onMounted(async () => {
  document.documentElement.dataset.tema = tema.value;
  window.addEventListener('hashchange', navegarHash);
  window.addEventListener('navegar', handleNavegarEvent);
  window.addEventListener('storage', handleStorageEvent);
  verificarSessao();
  navegarHash();
  registrarVisita();
  if (autenticado.value) verificarRetornoPagamento();
  setTimeout(() => {
    carregando.value = false;
  }, 200);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', navegarHash);
  window.removeEventListener('navegar', handleNavegarEvent);
  window.removeEventListener('storage', handleStorageEvent);
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
  { view: 'dashboard', icon: 'dashboard', text: 'Dashboard' },
  { view: 'checklist', icon: 'checklist', text: 'Conteúdos' },
  { view: 'ciclo', icon: 'ciclo', text: 'Ciclo' },
  { view: 'horas', icon: 'horas', text: 'Horas' },
  { view: 'simulados', icon: 'simulados', text: 'Simulados' },
  { view: 'erros', icon: 'erros', text: 'Erros' },
  { view: 'flashcards', icon: 'flashcards', text: 'Flashcards' },
  { view: 'diario', icon: 'diario', text: 'Diário' },
  { view: 'relatorio', icon: 'relatorio', text: 'Relatório' },
  { view: 'exercicios', icon: 'exercicios', text: 'Questões' },
];

const planoLink = { view: 'plano', icon: 'plano', text: 'Plano de Estudos' };
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
          <span class="icone"><IconeNav :nome="link.icon" /></span> {{ link.text }}
          <span v-if="featureBloqueada(link.view)" class="icone-lock"><IconeNav nome="cadeado" /></span>
        </a>
        <a v-if="usuarioAtual?.role === 'admin'" href="#admin" class="nav-item nav-item-admin" :class="{ ativa: view === 'admin' }" @click.prevent="irPara('admin')">
          <span class="icone"><IconeNav nome="admin" /></span> Admin
          <span v-if="featureBloqueada('admin')" class="icone-lock"><IconeNav nome="cadeado" /></span>
        </a>
        <div class="nav-divisor"></div>
        <a :href="`#${planoLink.view}`" class="nav-item" :class="{ ativa: view === planoLink.view }" @click.prevent="irPara(planoLink.view)">
          <span class="icone"><IconeNav :nome="planoLink.icon" /></span> {{ planoLink.text }}
        </a>
      </nav>
      <div class="sidebar-rodape">
        <div class="sidebar-usuario">
          {{ usuarioAtual?.nome || 'Usuário' }}
          <span v-if="usuarioAtual?.role === 'admin'" class="badge-adm">ADM</span>
        </div>
        <button class="nav-item" @click="alternarTema">
          <span class="icone"><IconeNav :nome="tema === 'dark' ? 'sol' : 'lua'" /></span>
          {{ tema === 'dark' ? 'Tema Claro' : 'Tema Escuro' }}
        </button>
        <button class="nav-item nav-item-sair" @click="logout">
          <span class="icone"><IconeNav nome="sair" /></span> Sair
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
              :token="view === 'admin' ? tokenSessaoAtual() : undefined"
            />
          </transition>
        </ErrorBoundary>
        <div v-if="featureBloqueada(view)" class="overlay-bloqueio" @click="irPara('dashboard')" @keydown.escape="irPara('dashboard')" @scroll.prevent @wheel.prevent @touchmove.prevent>
          <div class="overlay-card" @click.stop>
            <div class="login-card-header">
              <h2>Recurso Premium</h2>
              <p>Assine o Premium pra desbloquear esse recurso.</p>
            </div>
            <PremiumCheckout :token="tokenSessaoAtual()" :onClose="() => irPara('dashboard')" :onSessaoExpirada="sessaoExpiradaNoServidor" />
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
  opacity: 0.5;
  width: 14px;
  height: 14px;
}

.nav-item-admin {
  border-top: 1px solid rgba(255,255,255,0.08);
  margin-top: 8px;
  padding-top: 12px;
}

.nav-divisor {
  border-top: 1px solid rgba(255,255,255,0.08);
  margin: 8px 16px;
}

.sidebar-rodape {
  padding: 12px 20px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.sidebar-usuario {
  font-size: 12px;
  color: var(--texto-sec);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-adm {
  font-size: 10px;
  background: var(--aviso);
  color: #1a1305;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.nav-item-sair {
  margin-top: 4px;
  color: var(--erro);
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
