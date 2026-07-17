<script setup>
import { ref } from 'vue';

defineProps({
  erro: Boolean,
});

const emit = defineEmits(['tentativa-login']);

const usuarioDigitado = ref('');
const senhaDigitada = ref('');

function submeter() {
  emit('tentativa-login', usuarioDigitado.value, senhaDigitada.value);
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="sidebar-logo">
        <h1>Petrobras 2026</h1>
        <span>Técnico em Química • Cesgranrio</span>
      </div>
      <p class="instrucao">
        Informe usuário e senha para acessar.
      </p>
      <form @submit.prevent="submeter">
        <input
          v-model="usuarioDigitado"
          type="text"
          placeholder="Usuário"
          class="input-senha"
          autofocus
          autocomplete="username"
        />
        <input
          v-model="senhaDigitada"
          type="password"
          placeholder="Senha"
          class="input-senha"
          autocomplete="current-password"
        />
        <button type="submit" class="btn-entrar">Entrar</button>
        <p v-if="erro" class="msg-erro">
          Usuário ou senha inválidos.
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--fundo);
  padding: 20px;
}
.login-box {
  width: 100%;
  max-width: 380px;
  padding: 32px;
  background-color: var(--fundo-sec);
  border-radius: 8px;
  border: 1px solid var(--borda);
  text-align: center;
}
.instrucao {
  color: var(--texto-sec);
  margin-top: 8px;
  margin-bottom: 24px;
  font-size: 14px;
}
.input-senha {
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--borda);
  background-color: var(--fundo);
  color: var(--texto);
  font-size: 16px;
  margin-bottom: 16px;
  box-sizing: border-box;
}
.btn-entrar {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  background-color: var(--primaria);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
.msg-erro {
  color: #ef4444;
  font-size: 13px;
  margin-top: 12px;
}
.sidebar-logo {
  border-bottom: none;
  padding-bottom: 0;
}
</style>
