<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import QRCode from 'qrcode';
import { gerarPayloadPix } from './pix.js';
import PremiumCheckout from './PremiumCheckout.vue';

const props = defineProps({
  erro: Boolean,
});

const emit = defineEmits(['tentativa-login']);

const usuarioDigitado = ref('');
const senhaDigitada = ref('');
const mostrarSenha = ref(false);
const mostrarSenhaCadastro = ref(false);
const instrucaoPremium = ref(false);
const qrCodeUrl = ref('');
const modoCadastro = ref(false);
const cadastroUsuario = ref('');
const cadastroNome = ref('');
const cadastroSenha = ref('');
const cadastroConfirmar = ref('');
const cadastroLoading = ref(false);
const cadastroErro = ref('');
const cadastroSucesso = ref('');

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
    nome: 'Juliana L.',
    cidade: 'Rio de Janeiro, RJ',
    texto: 'Já tinha feito 3 concursos sem passar. Sempre batia na trave nos específicos — Bloco II (soluções, eletroquímica, análise instrumental) era meu calcanhar de Aquiles. O ciclo de estudos organizou tudo por prioridade. 4 meses depois: aprovada para Técnica Química de Petróleo, regime administrativo. Minha filha vai usar o auxílio-ensino de R$ 1.750/mês.',
    estrelas: 5,
  },
  {
    nome: 'Pedro O.',
    cidade: 'São Paulo, SP',
    texto: 'Conciliei faculdade de engenharia química com os estudos pro concurso. A Cesgranrio não penaliza chute (múltipla escolha), então foquei em resolver questões. A plataforma me deu flexibilidade: flashcards no ônibus, simulados aos domingos. Passei em 2º lugar no meu polo, regime de embarque — R$ 17 mil líquido por mês. Minha família chorou quando soube.',
    estrelas: 5,
  },
  {
    nome: 'Kelly C.',
    cidade: 'Vitória, ES',
    texto: 'Comprei o plano desconfiada. Me surpreendi: os simulados são muito próximos da prova Cesgranrio — múltipla escolha, 60 questões, 4h de duração. Cheguei no dia da prova já sabendo o estilo. Aprovada com 82% de aproveitamento. O edital de 2023 foi prorrogado até 2027, então minha vaga está garantida. Melhor R$ 49,90 que já investi.',
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

async function handleRegister() {
  cadastroErro.value = '';
  cadastroSucesso.value = '';
  if (!cadastroUsuario.value.trim() || !cadastroNome.value.trim() || !cadastroSenha.value.trim()) {
    cadastroErro.value = 'Todos os campos são obrigatórios.';
    return;
  }
  if (cadastroUsuario.value.trim().length < 3) {
    cadastroErro.value = 'Usuário deve ter no mínimo 3 caracteres.';
    return;
  }
  if (cadastroSenha.value.length < 3) {
    cadastroErro.value = 'Senha deve ter no mínimo 3 caracteres.';
    return;
  }
  if (cadastroSenha.value !== cadastroConfirmar.value) {
    cadastroErro.value = 'Senhas não conferem.';
    return;
  }
  cadastroLoading.value = true;
  try {
    const r = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: cadastroUsuario.value.trim(),
        nome: cadastroNome.value.trim(),
        senha: cadastroSenha.value,
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      cadastroErro.value = data.erro || 'Erro ao cadastrar.';
      return;
    }
    cadastroSucesso.value = 'Conta criada! Faça login.';
    setTimeout(() => modoCadastro.value = false, 1500);
  } catch {
    cadastroErro.value = 'Erro de conexão com o servidor.';
  } finally {
    cadastroLoading.value = false;
  }
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
    <div class="login-bg">
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
      <div class="bg-shape bg-shape-3"></div>
    </div>
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
      <div class="login-right">
        <div class="login-card">
          <PremiumCheckout v-if="instrucaoPremium" :qrCode="qrCodeUrl" :onClose="voltarParaLogin" :onVoltar="voltarParaLogin" />

          <template v-else>
            <div class="login-tabs">
              <button class="login-tab" :class="{ active: !modoCadastro }" @click="modoCadastro = false">Entrar</button>
              <button class="login-tab" :class="{ active: modoCadastro }" @click="modoCadastro = true">Criar Conta</button>
            </div>

            <form v-if="!modoCadastro" @submit.prevent="submeter" class="login-form">
              <div class="input-group">
                <label for="usuario">Usuário</label>
                <input id="usuario" v-model="usuarioDigitado" type="text" placeholder="Seu nome de usuário" class="input-field" autofocus autocomplete="username" />
                <span class="input-icon">👤</span>
              </div>
              <div class="input-group">
                <label for="senha">Senha</label>
                <div class="campo-senha">
                  <span class="input-icon">🔒</span>
                  <input id="senha" v-model="senhaDigitada" :type="mostrarSenha ? 'text' : 'password'" placeholder="Sua senha" class="input-field" autocomplete="current-password" />
                  <button type="button" class="olho-senha" @click="mostrarSenha = !mostrarSenha" :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'">
                    <svg class="olho-icon olho-aberto" :class="{ soma: mostrarSenha }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg class="olho-icon olho-fechado" :class="{ soma: !mostrarSenha }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>
              <button type="submit" class="btn-entrar">
                <span>Entrar</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <p v-if="props.erro" class="msg-erro">⚠ Usuário ou senha inválidos. Tente novamente.</p>
            </form>

            <form v-else @submit.prevent="handleRegister" class="login-form">
              <div class="input-group">
                <label for="cad-usuario">Usuário</label>
                <input id="cad-usuario" v-model="cadastroUsuario" type="text" placeholder="Escolha um usuário" class="input-field" autocomplete="username" />
                <span class="input-icon">👤</span>
              </div>
              <div class="input-group">
                <label for="cad-nome">Nome</label>
                <input id="cad-nome" v-model="cadastroNome" type="text" placeholder="Seu nome completo" class="input-field" autocomplete="name" />
                <span class="input-icon">📝</span>
              </div>
              <div class="input-group">
                <label for="cad-senha">Senha</label>
                <div class="campo-senha">
                  <span class="input-icon">🔒</span>
                  <input id="cad-senha" v-model="cadastroSenha" :type="mostrarSenhaCadastro ? 'text' : 'password'" placeholder="Mínimo 3 caracteres" class="input-field" autocomplete="new-password" />
                  <button type="button" class="olho-senha" @click="mostrarSenhaCadastro = !mostrarSenhaCadastro" :aria-label="mostrarSenhaCadastro ? 'Ocultar senha' : 'Mostrar senha'">
                    <svg class="olho-icon olho-aberto" :class="{ soma: mostrarSenhaCadastro }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg class="olho-icon olho-fechado" :class="{ soma: !mostrarSenhaCadastro }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="input-group">
                <label for="cad-confirmar">Confirmar Senha</label>
                <div class="campo-senha">
                  <span class="input-icon">🔒</span>
                  <input id="cad-confirmar" v-model="cadastroConfirmar" type="password" placeholder="Repita a senha" class="input-field" />
                </div>
              </div>
              <button type="submit" class="btn-entrar" :disabled="cadastroLoading">
                <span>{{ cadastroLoading ? 'Cadastrando...' : 'Criar Conta' }}</span>
              </button>
              <p v-if="cadastroErro" class="msg-erro">{{ cadastroErro }}</p>
              <p v-if="cadastroSucesso" class="msg-sucesso">{{ cadastroSucesso }}</p>
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
      </div>
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
  position: relative;
  flex: 1; /* Faz o wrapper preencher o espaço vertical do #app */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  background: #0a0c14;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none; /* Garante que o fundo não intercepte cliques. */
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.bg-shape-1 {
  width: 600px;
  height: 600px;
  background: #6366f1;
  top: -200px;
  right: -200px;
  animation: float 8s ease-in-out infinite;
}

.bg-shape-2 {
  width: 400px;
  height: 400px;
  background: #2563eb;
  bottom: -100px;
  left: -100px;
  animation: float 6s ease-in-out infinite reverse;
}

.bg-shape-3 {
  width: 300px;
  height: 300px;
  background: #06b6d4;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.login-container {
  display: flex;
  align-items: flex-start;
  gap: 60px;
  position: relative;
  z-index: 1;
  padding: 40px;
  max-width: 1050px;
  width: 100%;
}

.login-right {
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}

.login-brand {
  flex: 1;
  color: #fff;
  animation: slideUp 0.8s ease-out;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(245,158,11,0.15);
  border: 1px solid rgba(245,158,11,0.3);
  color: #f59e0b;
  padding: 6px 14px;
  border-radius: 20px;
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
  margin-bottom: 6px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.brand-subtitle {
  font-size: 16px;
  color: rgba(255,255,255,0.65);
  margin-bottom: 24px;
}

.brand-highlight {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 28px;
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
  color: #10b981;
  margin-bottom: 2px;
}

.highlight-label {
  display: block;
  font-size: 11px;
  color: rgba(255,255,255,0.75);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.highlight-divider {
  width: 1px;
  height: 36px;
  background: rgba(255,255,255,0.1);
  flex-shrink: 0;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  animation: slideUp 0.8s ease-out forwards;
  opacity: 0;
}

.feature-item:nth-child(1) { animation-delay: 0.15s; }
.feature-item:nth-child(2) { animation-delay: 0.25s; }
.feature-item:nth-child(3) { animation-delay: 0.35s; }
.feature-item:nth-child(4) { animation-delay: 0.45s; }
.feature-item:nth-child(5) { animation-delay: 0.55s; }

.feature-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  flex-shrink: 0;
}

.login-card {
  width: 380px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
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
  color: rgba(255,255,255,0.8);
  margin-bottom: 6px;
}

.input-field {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.07);
  color: #fff;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: all 0.25s ease;
  box-sizing: border-box;
}

.input-field::placeholder {
  color: rgba(255,255,255,0.6);
}

.input-field:focus {
  border-color: #6366f1;
  background: rgba(99,102,241,0.1);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
}

.input-icon {
  position: absolute;
  left: 14px;
  bottom: 14px;
  font-size: 18px;
  opacity: 0.6;
  pointer-events: none;
}

.campo-senha {
  position: relative;
}

.olho-senha {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: rgba(255,255,255,0.7);
  transition: color 0.2s, background 0.2s;
}

.olho-senha:hover {
  color: rgba(255,255,255,0.85);
  background: rgba(255,255,255,0.1);
}

.olho-senha:active {
  background: rgba(255,255,255,0.1);
}

.olho-icon {
  width: 20px;
  height: 20px;
  position: absolute;
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.olho-aberto {
  opacity: 0;
  transform: scale(0.5) rotate(-60deg);
}

.olho-aberto.soma {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.olho-fechado {
  opacity: 0;
  transform: scale(0.5) rotate(60deg);
}

.olho-fechado.soma {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.btn-entrar {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
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
  box-shadow: 0 8px 25px rgba(99,102,241,0.35);
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
  color: #f87171;
  font-size: 13px;
  text-align: center;
  padding: 10px 14px;
  background: rgba(239,68,68,0.08);
  border-radius: 8px;
  border: 1px solid rgba(239,68,68,0.15);
}

.msg-sucesso {
  color: #10b981;
  font-size: 13px;
  text-align: center;
  padding: 10px 14px;
  background: rgba(16,185,129,0.08);
  border-radius: 8px;
  border: 1px solid rgba(16,185,129,0.15);
}

.login-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 4px;
}

.login-tab {
  flex: 1;
  padding: 12px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255,255,255,0.6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.login-tab.active {
  background: rgba(255,255,255,0.12);
  color: #fff;
  font-weight: 600;
}
.login-tab:hover {
  color: #fff;
}

.login-card-footer {
  margin-top: 24px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.login-premium-cta {
  margin-bottom: 20px;
}

.login-premium-link {
  width: 100%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 12px;
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
  color: rgba(255,255,255,0.75);
}

.login-card-footer p {
  font-size: 12px;
  color: rgba(255,255,255,0.75);
}

.login-card-footer strong {
  color: rgba(255,255,255,0.8);
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
}

.depoimentos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.depoimento-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 18px;
  transition: all 0.3s ease;
  animation: slideUp 0.6s ease-out both;
}

.depoimento-card:nth-child(1) { animation-delay: 0.1s; }
.depoimento-card:nth-child(2) { animation-delay: 0.2s; }
.depoimento-card:nth-child(3) { animation-delay: 0.3s; }
.depoimento-card:nth-child(4) { animation-delay: 0.4s; }

.depoimento-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.15);
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
  color: rgba(255,255,255,0.88);
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
  background: linear-gradient(135deg, rgba(99,102,241,0.5), rgba(37,99,235,0.5));
  border: 1px solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.depoimento-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.depoimento-info strong {
  font-size: 13px;
  color: rgba(255,255,255,0.85);
}

.depoimento-info span {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}

.social-notification {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(16,185,129,0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff;
  padding: 12px 20px;
  border-radius: 12px;
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
  .login-right {
    width: 340px;
  }
  .login-card {
    width: 340px;
    padding: 32px 28px;
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    gap: 32px;
    padding: 24px;
    align-items: center;
  }

  .login-brand {
    text-align: center;
  }

  .brand-title {
    font-size: 28px;
  }

  .brand-features {
    display: none;
  }

  .login-right {
    width: 100%;
    max-width: 400px;
  }

  .login-card {
    width: 100%;
    padding: 32px 24px;
  }

  .login-tab {
    padding: 14px 10px;
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
  .login-tab {
    padding: 14px 10px;
    font-size: 15px;
  }
  .input-field {
    padding: 12px 14px 12px 40px;
    font-size: 16px;
  }
  .input-icon {
    bottom: 13px;
  }
  .olho-senha {
    right: 6px;
    width: 32px;
    height: 32px;
  }
  .olho-icon {
    width: 17px;
    height: 17px;
  }
  .btn-entrar {
    padding: 14px 12px;
    font-size: 16px;
  }
  .login-premium-link {
    padding: 14px 12px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 10px;
    /* Removido min-height para permitir que o conteúdo defina a altura e seja rolado */
    /* min-height: 100vh; */
    gap: 16px;
    justify-content: flex-start;
    padding-top: 20px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  }
  .login-brand {
    display: none;
  }
  .login-wrapper {
    align-items: flex-start; /* Alinha o conteúdo ao topo em telas pequenas */
  }
  .login-right {
    max-width: 100%;
  }
  .login-card {
    padding: 20px 14px;
    border-radius: 14px;
  }
  .login-tabs {
    margin-bottom: 16px;
  }
  .login-tab {
    padding: 15px 10px;
    font-size: 16px;
  }
  .login-form {
    gap: 16px;
  }
  .input-field {
    padding: 12px 12px 12px 38px;
    font-size: 16px;
  }
  .input-icon {
    bottom: 13px;
    left: 12px;
  }
  .olho-senha {
    right: 4px;
    width: 32px;
    height: 32px;
  }
  .olho-icon {
    width: 17px;
    height: 17px;
  }
  .btn-entrar {
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
    border-radius: 12px;
  }
  .login-tab {
    padding: 14px 8px;
    font-size: 15px;
  }
  .login-form {
    gap: 12px;
  }
  .input-field {
    padding: 11px 10px 11px 34px;
    font-size: 16px;
  }
  .input-icon {
    left: 10px;
    bottom: 12px;
    font-size: 16px;
  }
  .olho-senha {
    right: 2px;
    width: 30px;
    height: 30px;
  }
  .olho-icon {
    width: 15px;
    height: 15px;
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
