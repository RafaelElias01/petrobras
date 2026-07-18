<script setup>
import { ref, onErrorCaptured } from 'vue';

const error = ref(null);

onErrorCaptured((err) => {
  error.value = err;
  console.error('[ErrorBoundary] Captured:', err);
  return false;
});
</script>

<template>
  <div v-if="error" class="error-boundary">
    <p>⚠️ Algo deu errado.</p>
    <button @click="error = null">Tentar novamente</button>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  text-align: center;
  padding: 40px;
  color: var(--erro, #ef4444);
}
</style>
