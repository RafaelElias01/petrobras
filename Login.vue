<script setup>
import { ref } from 'vue';

defineProps({
  erro: Boolean,
});

const emit = defineEmits(['tentativa-login']);

const usuarioDigitado = ref('');
const senhaDigitada = ref('');
const mostrarSenha = ref(false);

function submeter() {
  emit('tentativa-login', usuarioDigitado.value, senhaDigitada.value);
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
          <h2>Acessar Plataforma</h2>
          <p>Informe suas credenciais</p>
        </div>
        <form @submit.prevent="submeter" class="login-form">
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
            <input
              id="senha"
              v-model="senhaDigitada"
              :type="mostrarSenha ? 'text' : 'password'"
              placeholder="Sua senha"
              class="input-field"
              autocomplete="current-password"
            />
            <span class="input-icon">🔒</span>
            <button type="button" class="btn-olho" @click="mostrarSenha = !mostrarSenha" tabindex="-1">
              {{ mostrarSenha ? '🙈' : '👁️' }}
            </button>
          </div>
          <button type="submit" class="btn-entrar">
            <span>Entrar</span>
            <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <p v-if="erro" class="msg-erro">
            ⚠ Usuário ou senha inválidos. Tente novamente.
          </p>
        </form>
        <div class="login-card-footer">
          <p>Conta de demonstração: <strong>estudante</strong> / <strong>petro2026</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  color: rgba(255,255,255,0.5);
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
  color: rgba(255,255,255,0.7);
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
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
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
  color: rgba(255,255,255,0.4);
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
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #fff;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: all 0.25s ease;
  box-sizing: border-box;
}

.input-field::placeholder {
  color: rgba(255,255,255,0.2);
}

.input-field:focus {
  border-color: #6366f1;
  background: rgba(99,102,241,0.06);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
}

.input-icon {
  position: absolute;
  left: 14px;
  bottom: 14px;
  font-size: 18px;
  opacity: 0.3;
  pointer-events: none;
}

.btn-olho {
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  opacity: 0.5;
  transition: opacity 0.2s;
  line-height: 1;
}

.btn-olho:hover { opacity: 1; }

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
  border-top: 1px solid rgba(255,255,255,0.06);
}

.login-card-footer p {
  font-size: 12px;
  color: rgba(255,255,255,0.3);
}

.login-card-footer strong {
  color: rgba(255,255,255,0.5);
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
  .btn-entrar {
    padding: 12px;
    font-size: 15px;
  }
}
</style>
