<script setup>
import { ref, onErrorCaptured } from 'vue';

const hasError = ref(false);

onErrorCaptured((err, instance, info) => {
  console.error("Um erro foi capturado pelo ErrorBoundary:", err, `no componente ${instance?.$options.name}`, info);
  hasError.value = true;
  // Retornar false impede que o erro se propague para os componentes pais.
  return false;
});
</script>

<template>
  <div v-if="hasError" class="error-boundary-fallback">
    <h3>Ocorreu um erro inesperado</h3>
    <p>
      Houve um problema ao carregar esta seção. Por favor, tente atualizar a página ou
      selecione outra opção no menu.
    </p>
  </div>
  <slot v-else></slot>
</template>

<style scoped>
.error-boundary-fallback {
  padding: 40px 20px;
  text-align: center;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: var(--erro);
  margin: 20px 0;
}
.error-boundary-fallback h3 {
  font-size: 20px;
  margin-bottom: 12px;
}
.error-boundary-fallback p {
  font-size: 14px;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  color: var(--texto-sec);
}
</style>