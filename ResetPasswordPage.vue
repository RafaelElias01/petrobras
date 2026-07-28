<script setup>
import { ref, onMounted } from 'vue';
import PasswordInput from './PasswordInput.vue';

const novaSenha = ref('');
const confirmarSenha = ref('');
const carregando = ref(false);
const erro = ref('');
const sucesso = ref('');
const tokenValido = ref(false);
const token = ref('');

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  token.value = params.get('token') || '';
  if (token.value) {
    tokenValido.value = true;
  } else {
    erro.value = 'Token de reset não encontrado na URL';
  }
});

async function handleResetPassword() {
  erro.value = '';

  if (!novaSenha.value || novaSenha.value.length < 3) {
    erro.value = 'Senha deve ter no mínimo 3 caracteres';
    return;
  }

  if (novaSenha.value !== confirmarSenha.value) {
    erro.value = 'As senhas não conferem';
    return;
  }

  carregando.value = true;

  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.value,
        novaSenha: novaSenha.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      erro.value = data.erro || 'Erro ao redefinir senha';
      carregando.value = false;
      return;
    }

    sucesso.value = 'Senha redefinida com sucesso! Você será redirecionado para o login...';
    carregando.value = false;

    setTimeout(() => {
      window.location.hash = '';
      window.location.reload();
    }, 2000);
  } catch {
    erro.value = 'Erro de conexão. Tente novamente.';
    carregando.value = false;
  }
}
</script>

<template>
  <div class="reset-password-page">
    <div class="reset-container">
      <div class="reset-header">
        <h1>🔐 Redefinir Senha</h1>
        <p>Crie uma nova senha para sua conta</p>
      </div>

      <div v-if="!tokenValido" class="reset-error-box">
        <p>{{ erro }}</p>
        <p style="margin-top: 16px; font-size: 13px;">
          <a href="#" style="color: var(--primaria); text-decoration: none;">← Voltar ao login</a>
        </p>
      </div>

      <form v-else @submit.prevent="handleResetPassword" class="reset-form">
        <PasswordInput
          id="nova-senha"
          label="Nova Senha"
          v-model="novaSenha"
          placeholder="Crie uma nova senha"
          autocomplete="new-password"
          :autofocus="true"
        />

        <PasswordInput
          id="confirmar-senha"
          label="Confirmar Senha"
          v-model="confirmarSenha"
          placeholder="Repita a senha"
          autocomplete="new-password"
        />

        <button type="submit" class="btn-reset" :disabled="carregando">
          {{ carregando ? 'Redefinindo...' : 'Redefinir Senha' }}
        </button>

        <p v-if="erro" class="msg-erro">⚠ {{ erro }}</p>
        <p v-if="sucesso" class="msg-sucesso">✅ {{ sucesso }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.reset-password-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.08));
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.reset-container {
  background: var(--card);
  border: 1px solid var(--borda);
  border-radius: 16px;
  padding: 40px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.reset-header {
  text-align: center;
  margin-bottom: 32px;
}

.reset-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--texto);
  margin-bottom: 8px;
}

.reset-header p {
  font-size: 14px;
  color: var(--texto-sec);
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-reset {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  margin-top: 8px;
}

.btn-reset:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.btn-reset:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.msg-erro {
  color: var(--erro);
  font-size: 13px;
  text-align: center;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.15);
  margin-top: 8px;
}

.msg-sucesso {
  color: var(--sucesso);
  font-size: 13px;
  text-align: center;
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.15);
  margin-top: 8px;
}

.reset-error-box {
  text-align: center;
  padding: 20px;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.reset-error-box p {
  color: var(--erro);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .reset-container {
    padding: 24px;
  }

  .reset-header h1 {
    font-size: 20px;
  }

  .btn-reset {
    padding: 12px;
    font-size: 14px;
  }
}
</style>
