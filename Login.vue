<script setup>
import { ref, onMounted } from 'vue';
import QRCode from 'qrcode';
import { gerarPayloadPix } from './pix.js';

const props = defineProps({
  erro: Boolean,
});

const emit = defineEmits(['tentativa-login']);

const usuarioDigitado = ref('');
const senhaDigitada = ref('');
const mostrarSenha = ref(false);
const instrucaoPremium = ref(false);
const qrCodeUrl = ref('');

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
});

function submeter() {
  emit('tentativa-login', usuarioDigitado.value, senhaDigitada.value);
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
        <div class="brand-icon">📘</div>
        <h1 class="brand-title">Petrobras 2026</h1>
        <p class="brand-subtitle">Técnico em Química • Cesgranrio</p>
        <div class="brand-features">
          <div class="feature-item">
            <span class="feature-icon">🎯</span>
            <span>Plano de estudos inteligente</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🧠</span>
            <span>Flashcards com revisão espaçada</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span>Métricas e relatórios de progresso</span>
          </div>
        </div>
      </div>
      <div class="login-card">
        <div class="login-card-header">
          <template v-if="!instrucaoPremium">
            <h2>Acessar Plataforma</h2>
            <p>Informe suas credenciais de acesso.</p>
          </template>
          <template v-else>
            <h2>Pagamento Premium</h2>
            <p>Escaneie o QR Code abaixo com o app do seu banco.</p>
          </template>
        </div>

        <div v-if="instrucaoPremium" class="instrucao-premium">
          <button @click="voltarParaLogin" class="btn-fechar" aria-label="Fechar">✕</button>
          <div class="pix-qr-wrapper">
            <div class="pix-value">👑 Premium — R$ 49,90</div>
            <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code PIX" class="pix-qr" />
            <div v-else class="pix-loading">Gerando QR Code...</div>
            <div class="pix-label">Escaneie com o app do seu banco</div>
          </div>
          <p class="pix-help">Após o pagamento, envie o comprovante no WhatsApp para receber seu acesso:</p>
          <a href="https://wa.me/5551983098650?text=Ol%C3%A1!%20Realizei%20o%20pagamento%20Premium%20(PIX)%20e%20gostaria%20de%20receber%20meu%20acesso." target="_blank" class="btn-whatsapp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Enviar Comprovante
          </a>
          <button @click="voltarParaLogin" class="btn-voltar">← Voltar para o Login</button>
        </div>

        <form v-else @submit.prevent="submeter" class="login-form">
          <div class="input-group">
            <label for="usuario">Usuário</label>
            <input
              id="usuario"
              v-model="usuarioDigitado"
              type="text"
              placeholder="Seu nome de usuário"
              class="input-field"
              autofocus
              autocomplete="username"
            />
            <span class="input-icon">👤</span>
          </div>
          <div class="input-group">
            <label for="senha">Senha</label>
            <div class="campo-senha">
              <input
                id="senha"
                v-model="senhaDigitada"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="Sua senha"
                class="input-field"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="olho-senha"
                @click="mostrarSenha = !mostrarSenha"
                :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
              >
                <svg class="olho-icon olho-aberto" :class="{ soma: mostrarSenha }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
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
          <p v-if="props.erro" class="msg-erro">
            ⚠ Usuário ou senha inválidos. Tente novamente.
          </p>
        </form>
        <div class="login-card-footer">
          <div v-if="!instrucaoPremium" class="login-premium-cta">
            <button @click="abrirLinkPremium" class="login-premium-link">
              👑 Seja Premium — <strong>R$ 49,90</strong>
            </button>
            <span class="login-premium-sub">Pagamento único • Acesso vitalício • Pix</span>
          </div>
          <p>Conta de demonstração: <strong>estudante</strong> / <strong>petro2026</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.instrucao-premium {
  padding: 16px 0 0;
  text-align: center;
  animation: fadeIn 0.5s ease;
  position: relative;
}

.instrucao-premium p {
  color: rgba(255,255,255,0.75);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.btn-fechar {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
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

.btn-voltar {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  cursor: pointer;
  margin-top: 16px;
  margin-bottom: 8px;
  padding: 8px 16px;
  transition: color 0.2s;
  width: 100%;
}
.btn-voltar:hover {
  color: #fff;
}

.pix-qr-wrapper {
  text-align: center;
  padding: 8px 0 4px;
}

.pix-value {
  font-size: 20px;
  color: #fff;
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
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  color: rgba(255,255,255,0.5);
  font-size: 14px;
}

.pix-label {
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  margin-top: 8px;
  margin-bottom: 8px;
}

.pix-help {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 12px;
  line-height: 1.5;
}

.login-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
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
  align-items: center;
  gap: 60px;
  position: relative;
  z-index: 1;
  padding: 40px;
  max-width: 960px;
  width: 100%;
}

.login-brand {
  flex: 1;
  color: #fff;
  animation: slideUp 0.8s ease-out;
}

.brand-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.brand-title {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 16px;
  color: rgba(255,255,255,0.65);
  margin-bottom: 40px;
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

.feature-item:nth-child(1) { animation-delay: 0.2s; }
.feature-item:nth-child(2) { animation-delay: 0.3s; }
.feature-item:nth-child(3) { animation-delay: 0.4s; }

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

.login-card-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-card-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
}

.login-card-header p {
  font-size: 14px;
  color: rgba(255,255,255,0.65);
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
  color: rgba(255,255,255,0.6);
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
  color: rgba(255,255,255,0.45);
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
  color: rgba(255,255,255,0.5);
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
  color: rgba(255,255,255,0.5);
}

.login-card-footer p {
  font-size: 12px;
  color: rgba(255,255,255,0.55);
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    gap: 32px;
    padding: 24px;
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

  .login-card {
    width: 100%;
    padding: 32px 24px;
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
  .login-card-header h2 {
    font-size: 18px;
  }
  .brand-title {
    font-size: 22px;
  }
  .brand-subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }
  .input-field {
    padding: 12px 14px 12px 40px;
    font-size: 14px;
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
    padding: 12px;
    font-size: 15px;
  }
}
</style>
