<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import QRCode from 'qrcode';
import { gerarPayloadPix } from './pix.js';
import BaseInput from './BaseInput.vue';
import PasswordInput from './PasswordInput.vue';
import PremiumCheckout from './PremiumCheckout.vue';
import FaqSection from './FaqSection.vue';
import HowItWorks from './HowItWorks.vue';

const props = defineProps({
  erro: Boolean,
});
const emit = defineEmits(['tentativa-login']);

const usuarioDigitado = ref('');
const senhaDigitada = ref('');
const instrucaoPremium = ref(false);
const qrCodeUrl = ref('');

const notificacao = ref(null);
let notifTimer = null;

const depoimentos = [
  {
    nome: 'Carlos M.',
    cidade: 'Macaé, RJ',
    texto: 'Estudava 2h por dia depois do trabalho no turno 12x36. Minha maior dificuldade era o Bloco I — orgânica e eletromagnetismo. O ciclo ponderado organizou os estudos por peso de matéria. Em 3 meses fui de 38% para 82% nos simulados. Passei em 12º para Técnico Químico de Petróleo. Hoje tiro R$ 14 mil líquido por mês.',
    estrelas: 5,
  },
  {
    nome: 'Ana J.',
    cidade: 'Salvador, BA',
    texto: 'Reações orgânicas era meu pesadelo. Com 40 questões de específicas e 60% do peso na prova, não dava pra errar. Os flashcards com revisão espaçada foram meu divisor de águas — repetia as reações todo dia no ônibus. Na prova, caiu exatamente o que mais revisei. Aprovada em 6º lugar. PLR de R$ 52 mil no primeiro ano.',
    estrelas: 5,
  },
  {
    nome: 'Rafael S.',
    cidade: 'Belo Horizonte, MG',
    texto: 'O relatório de horas mostrou: eu estudava 3h por dia mas só 45min era produtivo. Ajustei minha rotina com base nos dados da plataforma. Português e Matemática são 40% da prova — gabaritei as duas. Isso fez toda diferença na classificação. Passei pra Química de Petróleo. Salário base R$ 6.636, com benefícios passa de R$ 10 mil.',
    estrelas: 5,
  },
  {
    nome: 'Mariana C.',
    cidade: 'Duque de Caxias, RJ',
    texto: 'Sou mãe e trabalho o dia todo. Só tinha a noite para estudar. Os flashcards foram perfeitos para revisar no pouco tempo livre. O ciclo de estudos me mostrou onde focar minha energia. Passei para Técnica de Operação. Meu filho agora diz que quer trabalhar na Petrobras também. Isso não tem preço.',
    estrelas: 5,
  },
  {
    nome: 'Bruno P.',
    cidade: 'Betim, MG',
    texto: 'Sempre fui péssimo em matemática, que vale 20% da prova. Achei que não ia dar. As questões da plataforma, com explicação detalhada, me fizeram entender a lógica da Cesgranrio. Fui de 3 para 8 acertos nos simulados. Essa diferença me colocou dentro das vagas. Nunca imaginei que diria isso, mas até peguei gosto pelos cálculos.',
    estrelas: 5,
  },
  {
    nome: 'Livia S.',
    cidade: 'Cubatão, SP',
    texto: 'Eu tinha todos os livros, mas estava completamente perdida, sem saber por onde começar. O ciclo de estudos da plataforma foi meu guia. Ele me dizia exatamente o que estudar a cada dia. Parei de perder tempo e meu rendimento decolou. Passei de primeira. Os R$ 49,90 me economizaram meses de estudo perdido.',
    estrelas: 5,
  },
];

const notificacoes = [
  { nome: 'João V.', cidade: 'Santos, SP' },
  { nome: 'Marina F.', cidade: 'Niterói, RJ' },
  { nome: 'Lucas A.', cidade: 'Campinas, SP' },
  { nome: 'Fernanda R.', cidade: 'Recife, PE' },
  { nome: 'Gabriel S.', cidade: 'Brasília, DF' },
  { nome: 'Camila T.', cidade: 'Curitiba, PR' },
  { nome: 'Thiago M.', cidade: 'Manaus, AM' },
  { nome: 'Patrícia N.', cidade: 'Porto Alegre, RS' },
];
let notifInterval = null;

function mostrarNotificacao() {
  const item = notificacoes[Math.floor(Math.random() * notificacoes.length)];
  notificacao.value = `${item.nome} (${item.cidade}) acabou de adquirir o Premium!`;
  if (notifTimer) clearTimeout(notifTimer);
  notifTimer = setTimeout(() => { notificacao.value = null; }, 5000);
}

function iniciarSocialProof() {
  mostrarNotificacao();
  notifInterval = setInterval(mostrarNotificacao, 4000 + Math.random() * 4000);
}

const PIX_KEY = '+5551983098650';
const PIX_NOME = 'PETROBRAS ACADEMY';
const PIX_CIDADE = 'SAO PAULO';
const PIX_VALOR = 49.90;

onMounted(async () => {
  const payload = gerarPayloadPix({
    chave: PIX_KEY,
    nome: PIX_NOME,
    cidade: PIX_CIDADE,
    valor: PIX_VALOR,
  });
  qrCodeUrl.value = await QRCode.toDataURL(payload, {
    width: 280,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
  iniciarSocialProof();
});

onUnmounted(() => {
  if (notifInterval) clearInterval(notifInterval);
  if (notifTimer) clearTimeout(notifTimer);
});

function submeter() {
  emit('tentativa-login', usuarioDigitado.value.trim(), senhaDigitada.value.trim());
}

function abrirLinkPremium() {
  instrucaoPremium.value = true;
}

function voltarParaLogin() {
  instrucaoPremium.value = false;
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-brand">
        <div class="brand-badge">🔥 Edital 2026</div>
        <h1 class="brand-title">Petrobras<br>Técnico em Química</h1>
        <p class="brand-subtitle">Cesgranrio • 1.000+ vagas previstas</p>
        <div class="brand-highlight">
          <div class="highlight-item">
            <span class="highlight-value">R$ 6.638</span>
            <span class="highlight-label">Salário inicial</span>
          </div>
          <div class="highlight-divider"></div>
          <div class="highlight-item">
            <span class="highlight-value">+ Benefícios</span>
            <span class="highlight-label">PLR, VA, VT, saúde</span>
          </div>
          <div class="highlight-divider"></div>
          <div class="highlight-item">
            <span class="highlight-value">Até R$ 11.300</span>
            <span class="highlight-label">Com adicional de turno</span>
          </div>
        </div>
        <div class="brand-features">
          <div class="feature-item">
            <span class="feature-icon">🧪</span>
            <span><strong>Conteúdo específico</strong> — Bloco I, II e III de Química</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🧠</span>
            <span><strong>Flashcards inteligentes</strong> — Revisão espaçada das reações</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span><strong>Métricas de performance</strong> — Seu progresso em tempo real</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎯</span>
            <span><strong>Simulados Cesgranrio</strong> — Mesmo estilo da prova oficial</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📕</span>
            <span><strong>Caderno de Erros</strong> — Transforme falhas em acertos</span>
          </div>
        </div>
      </div>
      <div class="login-card">
        <PremiumCheckout v-if="instrucaoPremium" :qrCode="qrCodeUrl" :onClose="voltarParaLogin" :onVoltar="voltarParaLogin" />

        <template v-else>
          <form @submit.prevent="submeter" class="login-form">
            <BaseInput
              id="usuario"
              label="Usuário"
              v-model="usuarioDigitado"
              placeholder="Seu nome de usuário"
              autocomplete="username"
              :autofocus="true"
            >
              <template #icon>
                <span class="input-icon">👤</span>
              </template>
            </BaseInput>
            <PasswordInput
              id="senha"
              label="Senha"
              v-model="senhaDigitada"
              placeholder="Sua senha"
              autocomplete="current-password"
            />
            <button type="submit" class="btn-entrar">
              <span>Entrar</span>
              <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <p v-if="props.erro" class="msg-erro">⚠ Usuário ou senha inválidos. Tente novamente.</p>
          </form>

          <div class="login-card-footer">
            <div class="login-premium-cta">
              <button @click="abrirLinkPremium" class="login-premium-link">
                👑 Seja Premium — <strong>R$ 49,90</strong>
              </button>
              <span class="login-premium-sub">Pagamento único • Acesso vitalício • Pix</span>
            </div>
            <p>Conta de demonstração: <strong>estudante</strong> / <strong>petro2026</strong></p>
          </div>
        </template>
      </div>

      <HowItWorks />

      <div class="depoimentos-section">
        <div class="depoimentos-grid">
          <div v-for="(d, i) in depoimentos.slice(0, 4)" :key="i" class="depoimento-card">
            <div class="depoimento-stars">
              <svg v-for="s in d.estrelas" :key="s" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <p class="depoimento-texto">"{{ d.texto }}"</p>
            <div class="depoimento-footer">
              <div class="depoimento-avatar">{{ d.nome.charAt(0) }}</div>
              <div class="depoimento-info">
                <strong>{{ d.nome }}</strong>
                <span>{{ d.cidade }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FaqSection />
    </div>
  </div>

  <transition name="notif">
    <div v-if="notificacao" class="social-notification">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>{{ notificacao }}</span>
    </div>
  </transition>
</template>

<style scoped>
.login-wrapper {
  /* === CSS Custom Properties (Variáveis) === */
  --c-brand-primary: #6366f1;
  --c-brand-primary-dark: #4f46e5;
  --c-brand-secondary: #06b6d4;
  --c-brand-accent: #f59e0b;
  --c-brand-accent-dark: #d97706;
  --c-success: #10b981;
  --c-error: #f87171;
  --c-text-light: rgba(255, 255, 255, 0.9);
  --c-text-medium: rgba(255, 255, 255, 0.75);
  --c-text-dark: rgba(255, 255, 255, 0.6);
  --c-bg-main: #0a0c14;
  --c-bg-card: rgba(255, 255, 255, 0.08);
  --c-bg-input: rgba(255, 255, 255, 0.07);
  --c-border: rgba(255, 255, 255, 0.12);
  --radius-lg: 20px;
  --radius-md: 14px;
  --radius-sm: 12px;
}
.login-wrapper {
  position: relative;
  flex: 1; /* Faz o wrapper preencher o espaço vertical do #app */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* --- Novo Fundo de Gradiente Animado --- */
  background: 
    radial-gradient(circle at 15% 25%, rgba(99, 102, 241, 0.18), transparent 35%),
    radial-gradient(circle at 85% 35%, rgba(6, 182, 212, 0.15), transparent 40%),
    radial-gradient(circle at 60% 80%, rgba(79, 70, 229, 0.18), transparent 50%),
    var(--c-bg-main);
  background-size: 250% 250%;
  animation: gradient-flow 25s ease-in-out infinite;
}

@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  position: relative;
  z-index: 1;
  padding: 40px;
  max-width: 800px;
  width: 100%;
}

.login-brand {
  flex: 1;
  color: var(--c-text-light);
  animation: slideUp 0.8s ease-out;
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--c-brand-accent);
  padding: 6px 14px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  animation: slideUp 0.8s ease-out;
}

.brand-title {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 6px;  background: linear-gradient(135deg, var(--c-brand-primary), var(--c-brand-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.brand-subtitle {
  font-size: 16px;
  color: var(--c-text-dark);
  margin-bottom: 24px;
}

.brand-highlight {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  margin-bottom: 28px;
  justify-content: space-around;
  animation: slideUp 0.8s ease-out 0.1s both;
}

.highlight-item {
  flex: 1;
  text-align: center;
}

.highlight-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--c-success);
  margin-bottom: 2px;
}

.highlight-label {
  display: block;
  font-size: 11px;
  color: var(--c-text-medium);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.highlight-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--c-text-light);
  animation: slideUp 0.8s ease-out forwards;
  opacity: 0;
}

.feature-item:nth-child(1) { animation-delay: 0.15s; }
.feature-item:nth-child(2) { animation-delay: 0.25s; }
.feature-item:nth-child(3) { animation-delay: 0.35s; }
.feature-item:nth-child(4) { animation-delay: 0.45s; }

.feature-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--c-bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 40px 36px;
  animation: slideUp 0.8s ease-out 0.1s both;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
}

.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-light);
  margin-bottom: 6px;
}

.input-icon {
  position: absolute;
  left: 14px;
  bottom: 14px;
  font-size: 18px;
  opacity: 0.6;
  pointer-events: none;
}

.btn-entrar {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--c-brand-primary), var(--c-brand-primary-dark));
  color: var(--c-text-light);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s ease;
  font-family: inherit;
}

.btn-entrar:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
}

.btn-entrar:active {
  transform: translateY(0);
}

.btn-arrow {
  width: 20px;
  height: 20px;
  transition: transform 0.25s ease;
}

.btn-entrar:hover .btn-arrow {
  transform: translateX(4px);
}

.msg-erro {
  color: var(--c-error);
  font-size: 13px;
  text-align: center;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 8px;  border: 1px solid rgba(239, 68, 68, 0.15);
}

.msg-sucesso {
  color: var(--c-success);
  font-size: 13px;
  text-align: center;
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 8px;  border: 1px solid rgba(16, 185, 129, 0.15);
}

.login-card-footer {
  margin-top: 24px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.login-premium-cta {
  margin-bottom: 20px;
}

.login-premium-link {
  width: 100%;
  background: linear-gradient(135deg, var(--c-brand-accent), var(--c-brand-accent-dark));
  color: var(--c-text-light);
  border: none;
  padding: 14px;
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  pointer-events: all; /* Garante que este botão seja clicável */
}

.login-premium-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
}

.login-premium-sub {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--c-text-medium);
}

.login-card-footer p {
  font-size: 12px;
  color: var(--c-text-medium);
}

.login-card-footer strong {
  color: var(--c-text-light);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.depoimentos-section {
  width: 100%;
  max-width: 800px;
}

.depoimentos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.depoimento-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 18px;
  transition: all 0.3s ease;
  animation: slideUp 0.6s ease-out both;
}

.depoimento-card:nth-child(1) { animation-delay: 0.1s; }
.depoimento-card:nth-child(2) { animation-delay: 0.2s; }
.depoimento-card:nth-child(3) { animation-delay: 0.3s; }
.depoimento-card:nth-child(4) { animation-delay: 0.4s; }

.depoimento-card:hover {
  background: var(--c-bg-card);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.depoimento-stars {
  display: flex;
  gap: 2px;
  margin-bottom: 10px;
}

.depoimento-texto {
  font-size: 13px;
  line-height: 1.6;
  color: var(--c-text-light);
  margin-bottom: 14px;
  font-style: italic;
}

.depoimento-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.depoimento-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(37, 99, 235, 0.5));
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-light);
  flex-shrink: 0;
}

.depoimento-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.depoimento-info strong {
  font-size: 13px;
  color: var(--c-text-light);
}

.depoimento-info span {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.social-notification {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(16, 185, 129, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--c-border);
  color: var(--c-text-light);
  padding: 12px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  white-space: nowrap;
}

.notif-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.notif-leave-active {
  transition: all 0.3s ease;
}
.notif-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
.notif-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

@media (max-width: 1024px) {
  .login-container {
    gap: 40px;
    padding: 32px;
  }
  .brand-title {
    font-size: 30px;
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    gap: 32px;
    padding: 24px;
  }

  .brand-title {
    font-size: 28px;
  }

  .input-field {
    font-size: 16px;
  }

  .login-premium-link {
    padding: 14px 12px;
  }

  .bg-shape-1 { width: 300px; height: 300px; }
  .bg-shape-2 { width: 200px; height: 200px; }
  .bg-shape-3 { width: 150px; height: 150px; }
}

@media (max-width: 600px) {
  .login-container {
    padding: 16px;
    gap: 24px;
  }
  .login-card {
    padding: 24px 16px;
  }
  .brand-title {
    font-size: 22px;
  }
  .brand-subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }
  .input-icon {
    bottom: 13px;
  }
  .btn-entrar {
    padding: 14px 12px;
    font-size: 16px;
  }
  .login-premium-link {
    padding: 14px 12px;
  }
}

@media (max-width: 768px) {
  .login-wrapper {
    align-items: flex-start;
    overflow-y: auto;
    min-height: 0;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 10px;
    gap: 16px;
    padding-top: 20px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  }
  .login-brand {
    display: none;
  }
  .login-card {
    padding: 20px 14px;
    border-radius: var(--radius-md);
  }
  .login-form {
    gap: 16px;
  }
  .input-icon {
    bottom: 13px;
    left: 12px;
  }
  .olho-senha {
    padding: 14px 12px;
    font-size: 16px;
  }
  .msg-erro, .msg-sucesso {
    font-size: 12px;
    padding: 8px 12px;
  }
  .login-premium-link {
    padding: 14px 12px;
    font-size: 16px;
  }
  .login-premium-sub {
    font-size: 11px;
  }
  .login-card-footer p {
    font-size: 12px;
  }
  .social-notification {
    white-space: normal;
    max-width: calc(100vw - 32px);
    font-size: 12px;
    padding: 10px 14px;
    bottom: 16px;
    text-align: center;
  }
  .depoimentos-grid {
    grid-template-columns: 1fr;
  }
  .depoimento-card {
    padding: 14px;
  }
  .depoimento-texto {
    font-size: 13px;
  }
  .depoimentos-section {
    padding-bottom: env(safe-area-inset-bottom, 16px);
  }
  .bg-shape-1 { width: 200px; height: 200px; }
  .bg-shape-2 { width: 140px; height: 140px; }
  .bg-shape-3 { width: 100px; height: 100px; }
}

@media (max-width: 360px) {
  .login-container {
    padding: 6px;
    gap: 12px;
    padding-top: 12px;
  }
  .login-card {
    padding: 16px 10px;
    border-radius: var(--radius-sm);
  }
  .login-form {
    gap: 12px;
  }
  .input-icon {
    left: 10px;
    bottom: 12px;
    font-size: 16px;
  }
  .btn-entrar {
    padding: 13px 10px;
    font-size: 16px;
  }
  .login-premium-link {
    padding: 13px 10px;
    font-size: 15px;
  }
  .depoimento-card {
    padding: 12px;
  }
  .depoimento-texto {
    font-size: 12px;
  }
}
</style>
