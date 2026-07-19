<script setup>
import { ref, computed } from 'vue';

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
  <div class="input-group">
    <label :for="id">{{ label }}</label>
    <span class="input-icon">🔒</span>
    <input
      :id="id"
      v-model="valor"
      :type="mostrarSenha ? 'text' : 'password'"
      :placeholder="placeholder"
      class="input-field"
      :autocomplete="autocomplete"
    />
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
  </div>
</template>

<style scoped>
/* Os estilos relevantes de .input-group, .campo-senha, .olho-senha, etc.
   do Login.vue devem ser movidos para cá ou, idealmente, para um arquivo CSS global
   se forem usados em mais lugares. Para este exemplo, assumimos que eles
   permanecem no Login.vue e são aplicados globalmente ou via 'deep' seletor.
   Se não, copie os estilos relevantes para cá. */
</style>