<script setup>
defineProps({
  nome: { type: String, required: true },
});

// Ícones estilo line (24x24, stroke 2), inspirados no set Lucide — desenhados
// aqui para não adicionar dependência externa só por ~14 ícones da sidebar.
const PATHS = {
  dashboard: 'M3 3h7v9H3V3zm11 0h7v5h-7V3zm0 9h7v9h-7v-9zM3 16h7v5H3v-5z',
  checklist: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  ciclo: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  horas: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  simulados: 'M9 11H3v9h6v-9zM21 4h-6v16h6V4zM15 8H9v12h6V8z',
  erros: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z',
  flashcards: 'M2 7a2 2 0 0 1 2-2h13l5 5v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7zM16 3v6h6',
  diario: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  relatorio: 'M3 3v18h18M7 15l4-6 3 3 5-8',
  exercicios: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M9 13h6M9 17h6M9 9h1',
  plano: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  admin: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  sol: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  lua: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  sair: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  cadeado: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  whatsapp: 'M3 21l1.65-4.95A9 9 0 1 1 8.05 19.5L3 21zM8.5 8.5c0 4 3 7 7 7 .8 0 1.5-.7 1.5-1.5v-.7a.9.9 0 0 0-.6-.85l-1.75-.65a.9.9 0 0 0-1 .3l-.4.5a6 6 0 0 1-2.85-2.85l.5-.4a.9.9 0 0 0 .3-1l-.65-1.75a.9.9 0 0 0-.85-.6H9c-.8 0-1.5.7-1.5 1.5z',
  'materia-portugues': 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  'materia-matematica': 'M4 4h16v16H4zM8 8h.01M16 8h.01M8 16l8-8M8 16h.01M16 16h.01',
  'materia-quimica': 'M9 3h6M10 3v6.5L5.5 18a1 1 0 0 0 .87 1.5h11.26a1 1 0 0 0 .87-1.5L14 9.5V3M8.5 14h7',
  'materia-petroleo': 'M12 2v4M12 2c-3 3-5 6-5 10a5 5 0 0 0 10 0c0-4-2-7-5-10zM9 14a3 3 0 0 0 3 3',
  'materia-seguranca': 'M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z',
  'materia-metrologia': 'M12 3v18M5 8l-3 6a3 3 0 0 0 6 0l-3-6zM19 8l-3 6a3 3 0 0 0 6 0l-3-6zM5 8h14M12 3l-4 5h8l-4-5z',
};
</script>

<template>
  <svg class="icone-nav" viewBox="0 0 24 24" fill="none" :stroke="'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="PATHS[nome] || PATHS.dashboard" />
  </svg>
</template>

<style scoped>
.icone-nav {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>
