<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import BaseInput from './BaseInput.vue';
import PasswordInput from './PasswordInput.vue';
import PremiumCheckout from './PremiumCheckout.vue';
import FaqSection from './FaqSection.vue';
import HowItWorks from './HowItWorks.vue';
import IconeNav from './IconeNav.vue';

const props = defineProps({
  erro: String, // '' = sem erro; senão, mensagem a exibir (ver App.vue: handleLogin)
});
const emit = defineEmits(['tentativa-login', 'registro-sucesso']);

const usuarioDigitado = ref('');
const senhaDigitada = ref('');

const modoCadastro = ref(false);
const nomeCadastro = ref('');
const emailCadastro = ref('');
const confirmarSenhaCadastro = ref('');
const aceitaNewsletter = ref(true);
const cadastroCarregando = ref(false);
const cadastroErro = ref('');
const cadastroSucesso = ref('');
let cadastroTimeout = null;

const leadMagnetEmail = ref('');
const leadMagnetNome = ref('');
const leadMagnetCarregando = ref(false);
const leadMagnetSucesso = ref(false);
const leadMagnetErro = ref('');

const instrucaoPremium = ref(false);

const estudantesOnline = ref(32);
let animFrameId = null;

const notificacao = ref(null);
let notifTimer = null;

const depoimentos = [
  {
    nome: 'Carlos M.',
    cidade: 'Macaé, RJ',
    resultado: { valor: '38% → 82%', rotulo: 'acerto em 3 meses' },
    texto: 'Estudava 2h por dia depois do trabalho no turno 12x36. Minha maior dificuldade era o Bloco I — orgânica e eletromagnetismo. O ciclo ponderado organizou os estudos por peso de matéria. Em 3 meses fui de 38% para 82% nos simulados. Passei em 12º para Técnico Químico de Petróleo. Hoje tiro R$ 14 mil líquido por mês.',
    estrelas: 5,
  },
  {
    nome: 'Ana J.',
    cidade: 'Salvador, BA',
    resultado: { valor: '6º lugar', rotulo: 'PLR de R$ 52 mil no 1º ano' },
    texto: 'Reações orgânicas era meu pesadelo. Com 40 questões de específicas e 60% do peso na prova, não dava pra errar. Os flashcards com revisão espaçada foram meu divisor de águas — repetia as reações todo dia no ônibus. Na prova, caiu exatamente o que mais revisei. Aprovada em 6º lugar. PLR de R$ 52 mil no primeiro ano.',
    estrelas: 5,
  },
  {
    nome: 'Rafael S.',
    cidade: 'Belo Horizonte, MG',
    resultado: { valor: 'R$ 10 mil+', rotulo: 'com benefícios' },
    texto: 'O relatório de horas mostrou: eu estudava 3h por dia mas só 45min era produtivo. Ajustei minha rotina com base nos dados da plataforma. Português e Matemática são 40% da prova — gabaritei as duas. Isso fez toda diferença na classificação. Passei pra Química de Petróleo. Salário base R$ 6.636, com benefícios passa de R$ 10 mil.',
    estrelas: 5,
  },
  {
    nome: 'Mariana C.',
    cidade: 'Duque de Caxias, RJ',
    resultado: { valor: 'Aprovada', rotulo: 'Técnica de Operação' },
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
  { nome: 'Rodrigo B.', cidade: 'Fortaleza, CE' },
  { nome: 'Juliana C.', cidade: 'Belém, PA' },
  { nome: 'Bruno L.', cidade: 'Betim, MG' },
  { nome: 'Aline P.', cidade: 'Vitória, ES' },
  { nome: 'Diego R.', cidade: 'Goiânia, GO' },
  { nome: 'Beatriz S.', cidade: 'Duque de Caxias, RJ' },
  { nome: 'Felipe A.', cidade: 'São Luís, MA' },
  { nome: 'Larissa M.', cidade: 'Natal, RN' },
  { nome: 'Eduardo T.', cidade: 'Macaé, RJ' },
  { nome: 'Vanessa G.', cidade: 'Salvador, BA' },
  { nome: 'André F.', cidade: 'Joinville, SC' },
  { nome: 'Priscila H.', cidade: 'Uberlândia, MG' },
  { nome: 'Ricardo N.', cidade: 'Campo Grande, MS' },
  { nome: 'Tatiane D.', cidade: 'João Pessoa, PB' },
  { nome: 'Marcelo V.', cidade: 'Londrina, PR' },
  { nome: 'Renata K.', cidade: 'Aracaju, SE' },
  { nome: 'Alexandre J.', cidade: 'Cuiabá, MT' },
  { nome: 'Simone W.', cidade: 'Maceió, AL' },
  { nome: 'Fábio Q.', cidade: 'Ribeirão Preto, SP' },
  { nome: 'Débora Z.', cidade: 'Sorocaba, SP' },
  { nome: 'Leandro X.', cidade: 'Florianópolis, SC' },
  { nome: 'Cristina Y.', cidade: 'Teresina, PI' },
  { nome: 'Rafael O.', cidade: 'Porto Velho, RO' },
  { nome: 'Mônica U.', cidade: 'Caxias do Sul, RS' },
  { nome: 'Vitor E.', cidade: 'Juiz de Fora, MG' },
  { nome: 'Sandra I.', cidade: 'Bauru, SP' },
  { nome: 'Paulo K.', cidade: 'Contagem, MG' },
  { nome: 'Isabela L.', cidade: 'Anápolis, GO' },
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
  notifInterval = setInterval(mostrarNotificacao, 25000 + Math.random() * 20000);
}

function animarContador(novoValor) {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  const inicio = estudantesOnline.value;
  const delta = novoValor - inicio;
  const duracao = 800;
  const inicioTempo = performance.now();
  function passo(agora) {
    const progresso = Math.min(1, (agora - inicioTempo) / duracao);
    estudantesOnline.value = Math.floor(inicio + delta * progresso);
    if (progresso < 1) animFrameId = requestAnimationFrame(passo);
    else estudantesOnline.value = novoValor;
  }
  animFrameId = requestAnimationFrame(passo);
}

const ONLINE_MIN = 28;
const ONLINE_MAX = 47;
let onlineInterval = null;

function proximoOnlineAleatorio() {
  return ONLINE_MIN + Math.floor(Math.random() * (ONLINE_MAX - ONLINE_MIN + 1));
}

onMounted(() => {
  animarContador(proximoOnlineAleatorio());
  onlineInterval = setInterval(() => {
    animarContador(proximoOnlineAleatorio());
  }, 5 * 60 * 1000);
  iniciarSocialProof();
});

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (onlineInterval) clearInterval(onlineInterval);
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

function alternarModo() {
  if (cadastroTimeout) { clearTimeout(cadastroTimeout); cadastroTimeout = null; }
  modoCadastro.value = !modoCadastro.value;
  cadastroErro.value = '';
  cadastroSucesso.value = '';
  cadastroCarregando.value = false;
}

async function handleRegister() {
  cadastroErro.value = '';
  cadastroCarregando.value = true;

  if (!nomeCadastro.value.trim() || nomeCadastro.value.trim().length < 2) {
    cadastroErro.value = 'Nome deve ter no mínimo 2 caracteres';
    cadastroCarregando.value = false;
    return;
  }
  if (!emailCadastro.value.trim() || !emailCadastro.value.includes('@')) {
    cadastroErro.value = 'Informe um email válido';
    cadastroCarregando.value = false;
    return;
  }
  if (!usuarioDigitado.value.trim() || usuarioDigitado.value.trim().length < 3) {
    cadastroErro.value = 'Usuário deve ter no mínimo 3 caracteres';
    cadastroCarregando.value = false;
    return;
  }
  if (!senhaDigitada.value || senhaDigitada.value.length < 3) {
    cadastroErro.value = 'Senha deve ter no mínimo 3 caracteres';
    cadastroCarregando.value = false;
    return;
  }
  if (senhaDigitada.value !== confirmarSenhaCadastro.value) {
    cadastroErro.value = 'Senhas não conferem';
    cadastroCarregando.value = false;
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: usuarioDigitado.value.trim(),
        nome: nomeCadastro.value.trim(),
        email: emailCadastro.value.trim(),
        senha: senhaDigitada.value,
      })
    });
    const data = await res.json();
    if (!res.ok) {
      cadastroErro.value = data.erro || 'Erro ao cadastrar';
      cadastroCarregando.value = false;
      return;
    }

    if (aceitaNewsletter.value) {
      try {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailCadastro.value.trim(),
            nome: nomeCadastro.value.trim(),
          })
        });
      } catch {}
    }

    cadastroCarregando.value = false;
    cadastroSucesso.value = `Conta criada com sucesso! Seja bem-vindo, ${nomeCadastro.value.trim()}. Entrando no dashboard...`;
    cadastroTimeout = setTimeout(() => {
      cadastroSucesso.value = '';
      emit('registro-sucesso', usuarioDigitado.value.trim(), senhaDigitada.value);
    }, 2500);
  } catch (e) {
    if (cadastroTimeout) { clearTimeout(cadastroTimeout); cadastroTimeout = null; }
    cadastroErro.value = 'Erro de conexão com o servidor. Tente novamente.';
    cadastroCarregando.value = false;
  }
}

async function handleLeadMagnet() {
  leadMagnetErro.value = '';
  leadMagnetCarregando.value = true;

  if (!leadMagnetNome.value.trim() || leadMagnetNome.value.trim().length < 2) {
    leadMagnetErro.value = 'Informe seu nome';
    leadMagnetCarregando.value = false;
    return;
  }
  if (!leadMagnetEmail.value.trim() || !leadMagnetEmail.value.includes('@')) {
    leadMagnetErro.value = 'Informe um email válido';
    leadMagnetCarregando.value = false;
    return;
  }

  try {
    await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: leadMagnetEmail.value.trim(),
        nome: leadMagnetNome.value.trim(),
      })
    });
    leadMagnetSucesso.value = true;
    leadMagnetCarregando.value = false;
  } catch {
    leadMagnetErro.value = 'Erro de conexão';
    leadMagnetCarregando.value = false;
  }
}
</script>

<template>
  <main class="login-wrapper">
    <div class="login-container">
      <div class="login-brand">
        <div class="brand-badge">🔥 Edital 2026</div>
        <h1 class="brand-title">Petrobras<br>Técnico em Química</h1>
        <p class="brand-subtitle">Cesgranrio • 1.000+ vagas previstas</p>
        <p class="brand-outcome">De <strong>38% a 82%</strong> de acerto em 3 meses de ciclo certo</p>
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
        <div class="visit-counter">
          <span class="visit-counter-icon">🔥</span>
          <span class="visit-counter-text"><strong>{{ estudantesOnline.toLocaleString('pt-BR') }}</strong> estudantes online agora</span>
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
        <PremiumCheckout v-if="instrucaoPremium" :onClose="voltarParaLogin" :onVoltar="voltarParaLogin" />

        <template v-else>
          <div class="login-tabs">
            <button class="tab-btn" :class="{ ativo: !modoCadastro }" @click="modoCadastro = false; cadastroErro = ''; cadastroSucesso = ''; if (cadastroTimeout) { clearTimeout(cadastroTimeout); cadastroTimeout = null; }">Entrar</button>
            <button class="tab-btn" :class="{ ativo: modoCadastro }" @click="modoCadastro = true; cadastroErro = ''; cadastroSucesso = ''; if (cadastroTimeout) { clearTimeout(cadastroTimeout); cadastroTimeout = null; }">Criar Conta</button>
          </div>

          <form v-if="!modoCadastro" @submit.prevent="submeter" class="login-form">
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
            <p v-if="props.erro" class="msg-erro">⚠ {{ props.erro }}</p>
          </form>

          <form v-else @submit.prevent="handleRegister" class="login-form">
            <BaseInput
              id="nome-cadastro"
              label="Nome completo"
              v-model="nomeCadastro"
              placeholder="Seu nome completo"
              autocomplete="name"
              :autofocus="true"
            >
              <template #icon>
                <span class="input-icon">👤</span>
              </template>
            </BaseInput>
            <BaseInput
              id="email-cadastro"
              label="Email"
              v-model="emailCadastro"
              placeholder="seu@email.com"
              autocomplete="email"
              type="email"
            >
              <template #icon>
                <span class="input-icon">📧</span>
              </template>
            </BaseInput>
            <BaseInput
              id="usuario-cadastro"
              label="Usuário"
              v-model="usuarioDigitado"
              placeholder="Escolha um nome de usuário"
              autocomplete="username"
            >
              <template #icon>
                <span class="input-icon">🔑</span>
              </template>
            </BaseInput>
            <PasswordInput
              id="senha-cadastro"
              label="Senha"
              v-model="senhaDigitada"
              placeholder="Crie uma senha"
              autocomplete="new-password"
            />
            <PasswordInput
              id="confirmar-senha"
              label="Confirmar senha"
              v-model="confirmarSenhaCadastro"
              placeholder="Repita a senha"
              autocomplete="new-password"
            />
            <label class="newsletter-checkbox">
              <input type="checkbox" v-model="aceitaNewsletter" />
              <span>Quero receber dicas de estudo e novidades por email</span>
            </label>
            <button type="submit" class="btn-entrar" :disabled="cadastroCarregando">
              <span>{{ cadastroCarregando ? 'Cadastrando...' : 'Criar Conta' }}</span>
            </button>
            <p v-if="cadastroSucesso" class="msg-sucesso">✅ {{ cadastroSucesso }}</p>
            <p v-if="cadastroErro" class="msg-erro">⚠ {{ cadastroErro }}</p>
            <p class="cadastro-login-link">Já tem conta? <button type="button" class="link-btn" @click="alternarModo">Entrar</button></p>
          </form>

          <div class="login-card-footer">
            <div class="login-premium-cta">
              <button @click="abrirLinkPremium" class="login-premium-link">
                👑 Seja Premium — <strong>R$ 49,90</strong>
              </button>
              <span class="login-premium-sub">Pagamento único • Acesso vitalício • Pix</span>
              <span class="login-premium-selo">🛡️ Compra Garantida pelo Mercado Pago</span>
            </div>
            <p>Conta de demonstração: <strong>estudante</strong> / <strong>petro2026</strong></p>
            <a href="https://wa.me/5551983098650" target="_blank" rel="noopener" class="login-whatsapp-link">
              <IconeNav nome="whatsapp" /> Dúvidas? Fale com a gente no WhatsApp
            </a>
          </div>
        </template>
      </div>

      <div class="lead-magnet-section" :class="{ sucesso: leadMagnetSucesso }">
        <template v-if="!leadMagnetSucesso">
          <div class="lead-magnet-badge">🎁 Grátis</div>
          <h2 class="lead-magnet-title">Guia Definitivo de Estudos</h2>
          <p class="lead-magnet-subtitle">Baixe grátis o guia completo com o passo a passo para ser aprovado na Petrobras — cronograma, dicas da Cesgranrio e checklist de estudos.</p>
          <form @submit.prevent="handleLeadMagnet" class="lead-magnet-form">
            <label class="lead-magnet-label">Nome</label>
            <input v-model="leadMagnetNome" type="text" placeholder="Seu nome" class="lead-magnet-input" />
            <label class="lead-magnet-label">Email</label>
            <input v-model="leadMagnetEmail" type="email" placeholder="seu@email.com" class="lead-magnet-input" />
            <button type="submit" class="lead-magnet-btn" :disabled="leadMagnetCarregando">
              {{ leadMagnetCarregando ? 'Enviando...' : 'Baixar Guia Grátis' }}
            </button>
            <p v-if="leadMagnetErro" class="msg-erro">⚠ {{ leadMagnetErro }}</p>
          </form>
        </template>
        <template v-else>
          <div class="lead-magnet-success">
            <span class="lead-magnet-success-icon">✅</span>
            <h2>Guia enviado!</h2>
            <p>Verifique seu email para baixar o material. Enquanto isso, conheça a plataforma completa.</p>
            <button @click="abrirLinkPremium" class="login-premium-link">👑 Conhecer o Premium — R$ 49,90</button>
            <span class="login-premium-selo">🛡️ Compra Garantida pelo Mercado Pago</span>
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
            <div v-if="d.resultado" class="depoimento-resultado">
              <span class="resultado-valor">{{ d.resultado.valor }}</span>
              <span class="resultado-rotulo">{{ d.resultado.rotulo }}</span>
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
  </main>

  <transition name="notif">
    <div v-if="notificacao" class="social-notification">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>{{ notificacao }}</span>
    </div>
  </transition>
</template>

<style scoped>
.login-wrapper {
  --c-brand-primary: #d9743a;
  --c-brand-primary-dark: #b5561f;
  --c-brand-secondary: #4fa5a5;
  --c-brand-accent: #e0ac4c;
  --c-brand-accent-dark: #c98a1f;
  --c-success: #5cb875;
  --c-error: #e0765f;
  --c-text-light: rgba(255, 255, 255, 0.9);
  --c-text-medium: rgba(255, 255, 255, 0.75);
  --c-text-dark: rgba(255, 255, 255, 0.6);
  --c-bg-main: #100d09;
  --c-bg-card: rgba(255, 255, 255, 0.08);
  --c-bg-input: rgba(255, 255, 255, 0.07);
  --c-border: rgba(255, 255, 255, 0.12);
  --radius-lg: 20px;
  --radius-md: 14px;
  --radius-sm: 12px;
}
.login-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
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
  margin-bottom: 12px;
}

.brand-outcome {
  font-size: 15px;
  color: var(--c-text-medium);
  margin-bottom: 24px;
}
.brand-outcome strong {
  color: var(--c-brand-accent);
  font-weight: 700;
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

.visit-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-lg);
  padding: 12px 20px;
  margin-bottom: 20px;
  animation: slideUp 0.8s ease-out 0.05s both;
}
.visit-counter-icon {
  font-size: 18px;
}
.visit-counter-text {
  font-size: 14px;
  color: var(--c-text-medium);
}
.visit-counter-text strong {
  color: var(--c-text-light);
  font-weight: 700;
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
.feature-item:nth-child(5) { animation-delay: 0.55s; }

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

.login-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 28px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--c-border);
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  color: var(--c-text-medium);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.tab-btn.ativo {
  background: var(--c-brand-primary-dark);
  color: #fff;
}

.tab-btn:hover:not(.ativo) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--c-text-light);
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

.btn-entrar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.newsletter-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: var(--c-text-medium);
  cursor: pointer;
  line-height: 1.4;
}

.newsletter-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 1px;
  flex-shrink: 0;
  accent-color: var(--c-brand-primary);
  cursor: pointer;
}

.cadastro-login-link {
  font-size: 13px;
  color: var(--c-text-medium);
  text-align: center;
  margin-top: 4px;
}

.link-btn {
  background: none;
  border: none;
  color: var(--c-brand-secondary);
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  text-decoration: underline;
  font-family: inherit;
  padding: 0;
}

.link-btn:hover {
  color: var(--c-brand-primary);
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
  pointer-events: all;
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

.login-premium-selo {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--c-text-medium);
  opacity: 0.85;
}

.login-card-footer p {
  font-size: 12px;
  color: var(--c-text-medium);
}

.login-card-footer strong {
  color: var(--c-text-light);
}

.login-whatsapp-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #25d366;
  text-decoration: none;
  transition: color 0.2s;
}
.login-whatsapp-link svg {
  width: 18px;
  height: 18px;
}
.login-whatsapp-link:hover {
  color: #1da851;
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

.lead-magnet-section {
  width: 100%;
  max-width: 600px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.08));
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: var(--radius-lg);
  padding: 32px;
  text-align: center;
  animation: slideUp 0.8s ease-out 0.15s both;
}

.lead-magnet-section.sucesso {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.lead-magnet-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--c-success);
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.lead-magnet-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--c-text-light);
  margin-bottom: 8px;
}

.lead-magnet-subtitle {
  font-size: 14px;
  color: var(--c-text-medium);
  margin-bottom: 20px;
  line-height: 1.5;
}

.lead-magnet-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  margin: 0 auto;
}

.lead-magnet-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-medium);
  text-align: left;
}

.lead-magnet-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--c-border);
  background: var(--c-bg-input);
  color: var(--c-text-light);
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.lead-magnet-input:focus {
  border-color: var(--c-brand-primary);
}

.lead-magnet-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--c-brand-accent), var(--c-brand-accent-dark));
  color: var(--c-text-light);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  margin-top: 4px;
}

.lead-magnet-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
}

.lead-magnet-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.lead-magnet-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.lead-magnet-success-icon {
  font-size: 48px;
}

.lead-magnet-success h3 {
  font-size: 22px;
  color: var(--c-text-light);
}

.lead-magnet-success p {
  font-size: 14px;
  color: var(--c-text-medium);
  line-height: 1.5;
  max-width: 400px;
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

.depoimento-resultado {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.resultado-valor {
  font-family: Georgia, 'Iowan Old Style', serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--c-brand-accent);
}

.resultado-rotulo {
  font-size: 11px;
  color: var(--c-text-dark);
  text-transform: uppercase;
  letter-spacing: 0.03em;
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
  .lead-magnet-title {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .login-wrapper {
    align-items: flex-start;
  }
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
  
  .lead-magnet-section {
    padding: 24px;
  }
  .lead-magnet-title {
    font-size: 18px;
  }
  .login-card {
    padding: 32px 28px;
  }
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
  .visit-counter {
    padding: 10px 14px;
  }
  .visit-counter-text {
    font-size: 13px;
  }
  .lead-magnet-section {
    padding: 20px;
  }
  .lead-magnet-title {
    font-size: 17px;
  }
  .lead-magnet-subtitle {
    font-size: 13px;
  }
  .lead-magnet-input {
    font-size: 16px;
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
    margin-bottom: 4px;
  }
  .brand-badge {
    padding: 5px 12px;
    font-size: 11px;
    margin-bottom: 12px;
  }
  .brand-title {
    font-size: 22px;
    margin-bottom: 4px;
  }
  .brand-subtitle {
    font-size: 13px;
    margin-bottom: 16px;
  }
  .brand-highlight {
    padding: 12px 10px;
    gap: 8px;
    margin-bottom: 16px;
  }
  .highlight-value {
    font-size: 13px;
  }
  .highlight-label {
    font-size: 9px;
  }
  .visit-counter {
    padding: 8px 12px;
    margin-bottom: 16px;
  }
  .visit-counter-text {
    font-size: 12px;
  }
  .brand-features {
    gap: 10px;
  }
  .feature-item {
    font-size: 12px;
    gap: 8px;
    text-align: left;
  }
  .feature-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  .login-card {
    padding: 20px 14px;
    border-radius: var(--radius-md);
  }
  .login-tabs {
    margin-bottom: 20px;
  }
  .tab-btn {
    padding: 10px;
    font-size: 13px;
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
  .lead-magnet-section {
    padding: 16px;
    border-radius: var(--radius-md);
  }
  .lead-magnet-badge {
    font-size: 10px;
  }
  .lead-magnet-title {
    font-size: 16px;
  }
  .lead-magnet-subtitle {
    font-size: 12px;
    margin-bottom: 16px;
  }
  .lead-magnet-input {
    font-size: 16px;
    padding: 11px 12px;
  }
  .lead-magnet-btn {
    padding: 14px 12px;
    font-size: 16px;
  }
  .lead-magnet-success h3 {
    font-size: 18px;
  }
  .lead-magnet-success .login-premium-link {
    font-size: 15px;
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
  .brand-title {
    font-size: 20px;
  }
  .brand-subtitle {
    font-size: 12px;
    margin-bottom: 12px;
  }
  .brand-highlight {
    flex-direction: column;
    gap: 10px;
    padding: 12px;
  }
  .highlight-divider {
    width: 60%;
    height: 1px;
  }
  .feature-item {
    font-size: 11px;
  }
  .login-card {
    padding: 16px 10px;
    border-radius: var(--radius-sm);
  }
  .login-tabs {
    margin-bottom: 16px;
  }
  .tab-btn {
    padding: 8px;
    font-size: 12px;
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
  .lead-magnet-section {
    padding: 14px;
  }
  .lead-magnet-title {
    font-size: 15px;
  }
  .lead-magnet-input {
    font-size: 16px;
    padding: 10px;
  }
  .lead-magnet-btn {
    padding: 13px 10px;
    font-size: 15px;
  }
}
</style>
