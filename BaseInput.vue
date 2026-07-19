<script setup>
defineProps({
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
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="input-group">
    <label :for="id">{{ label }}</label>
    <slot name="icon"></slot>
    <input
      :id="id"
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      :type="type"
      :placeholder="placeholder"
      class="input-field"
      :autofocus="autofocus"
      :autocomplete="autocomplete"
    />
    <slot></slot>
  </div>
</template>

<style>
/* Estilos globais para input-field, para serem compartilhados.
   A tag <style> não é 'scoped' de propósito. */
@import './input-field.css';
</style>