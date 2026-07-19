<script setup>
import { ref, computed } from 'vue';
import BaseInput from './BaseInput.vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
});

const emit = defineEmits(['update:modelValue']);

const mostrarSenha = ref(false);

const valor = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <BaseInput
    :id="id"
    :label="label"
    v-model="valor"
    :type="mostrarSenha ? 'text' : 'password'"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
  >
    <template #icon>
      <span class="input-icon">🔒</span>
    </template>
    <button
      type="button"
      class="olho-senha"
      @click="mostrarSenha = !mostrarSenha"
      :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
    >
      <svg
        class="olho-icon olho-aberto"
        :class="{ soma: mostrarSenha }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <svg
        class="olho-icon olho-fechado"
        :class="{ soma: !mostrarSenha }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    </button>
  </BaseInput>
</template>

<style scoped>
/* Estilos que antes estavam no Login.vue agora estão aqui, garantindo o encapsulamento */
.input-icon {
  position: absolute;
  left: 14px;
  bottom: 14px;
  font-size: 18px;
  opacity: 0.6;
  pointer-events: none;
}

.olho-senha {
  position: absolute;
  right: 10px;
  top: calc(50% + 10px); /* Ajusta o ponto de partida para o centro do input */
  transform: translateY(-50%); /* Centraliza o ícone a partir do novo ponto */
  background: none;
  border: none;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--c-text-medium);
  transition: color 0.2s, background 0.2s;
}

.olho-senha:hover {
  color: var(--c-text-light);
  background: rgba(255, 255, 255, 0.1);
}

.olho-icon {
  width: 20px;
  height: 20px;
  position: absolute;
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.olho-aberto { opacity: 0; transform: scale(0.5) rotate(-60deg); }
.olho-aberto.soma { opacity: 1; transform: scale(1) rotate(0deg); }
.olho-fechado { opacity: 0; transform: scale(0.5) rotate(60deg); }
.olho-fechado.soma { opacity: 1; transform: scale(1) rotate(0deg); }

@media (max-width: 600px) {
  .input-icon { bottom: 13px; }
  .olho-senha { right: 6px; width: 32px; height: 32px; }
  .olho-icon { width: 17px; height: 17px; }
}
@media (max-width: 360px) {
  .input-icon { left: 10px; bottom: 12px; font-size: 16px; }
  .olho-senha { right: 2px; width: 30px; height: 30px; }
  .olho-icon { width: 15px; height: 15px; }
}
</style>