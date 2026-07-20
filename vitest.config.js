import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Padrão continua 'node' (server.js). Composables em tests/composables/**
    // usam refs/computed/watch fora de componente + Armazenamento (localStorage), então
    // precisam de DOM — cada arquivo lá declara `// @vitest-environment jsdom` no topo
    // (environmentMatchGlobs não existe mais nesta versão do Vitest).
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
