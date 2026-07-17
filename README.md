# Estudo Petrobras — Técnico em Química

App para plano de estudos do concurso Petrobras (Cesgranrio).  
Duas implementações: **Vue 3 + Vite** (desenvolvimento) e **site estático** (produção via GitHub Pages).

---

## Estrutura do Projeto

```
/
├── App.vue                          # Raiz Vue (sidebar + roteamento hash)
├── main.js                          # Entry point Vite
├── index.html                       # Shell Vite
├── vite.config.js                   # Proxy /api → localhost:3000
├── dados.js                         # CONTEUDOS, CICLO_ESTUDOS, metas, CICLO_MAP
├── armazenamento.js                 # localStorage (prefixo petrobras_quimica_)
├── estilo.css                       # CSS global (variáveis, tema escuro, responsivo)
├── use*.js                          # Composables (Checklist, Horas, Ciclo, etc.)
├── *.{vue}                          # Componentes de tela
│
├── petrobras-quimica-study-plan/    # Site estático + servidor Express
│   ├── server.js                    # Express (porta 3000, serve site/ + API REST)
│   ├── start.sh                     # Auto-instala deps e sobe servidor
│   ├── dados/                       # Persistência JSON no servidor
│   ├── site/
│   │   ├── index.html               # SPA completa (Vue CDN, sem build)
│   │   ├── css/estilo.css
│   │   └── js/
│   │       ├── app.js               # Instância Vue + todos os composables
│   │       ├── dados.js             # Dados (idêntico ao root)
│   │       ├── armazenamento.js     # localStorage + server API com debounce
│   │       └── ...
│   └── planos/                      # Documentos .md de estudo
│
├── .github/workflows/deploy.yml     # CI: deploy site/ → gh-pages
└── AGENTS.md                        # Memórias do projeto
```

---

## Funcionalidades

| Recurso          | Telas                                    | Persistência            |
|------------------|------------------------------------------|-------------------------|
| Dashboard        | `#dashboard`                             | —                       |
| Checklist        | `#checklist`                             | localStorage + servidor |
| Grade de Horas   | `#horas`                                 | localStorage + servidor |
| Ciclo de Estudos | `#ciclo`, `#diario`, `#relatorio`        | localStorage + servidor |
| Diário           | `#diario`                                | localStorage + servidor |
| Simulados        | `#simulados`                             | localStorage + servidor |
| Caderno de Erros | `#erros`                                 | localStorage + servidor |
| Revisões         | `#diario`                                | localStorage + servidor |
| Flashcards       | `#flashcards` (novo)                     | localStorage + servidor |
| Relatório        | `#relatorio`                             | leitura                |
| Cronograma       | `#cronograma`                            | localStorage + servidor |
| Planos           | `#plano`                                 | —                       |

### Ciclo de Estudos (Rotação Ponderada)

O ciclo segue o **Método dos Aprovados** — fila circular com pesos:

- `CICLO_PONDERADO` expande cada matéria pelo campo `peso`:
  - Português (peso 4) → 4 ocorrências
  - Matemática (peso 3) → 3 ocorrências
  - Química Substâncias (peso 1) → 1 ocorrência
  - Total: **24 slots**
- `posicao` avança pelos 24 slots com wrap
- `concluido` usa chave `item-{idxOriginal}` com **contador** (múltiplas voltas)
- `cicloCompleto` = total de conclusões / 24, **limitado a 100%**

### Persistência

Toda interação salva em **3 camadas**:
1. **Cache** — estado reativo em memória
2. **localStorage** — prefixo `petrobras_quimica_` (sobrevive a refresh)
3. **Servidor** — PUT `/api/dados/{nome}.json` com debounce de 1s

Ao carregar: servidor → localStorage → merge (local sobrescreve).

---

## Comandos

| Comando              | O que faz                              |
|----------------------|----------------------------------------|
| `npm run dev`        | Vite dev server (porta 5173)           |
| `npm start`          | Express server (porta 3000)            |
| `npm run build`      | Build Vite de produção                 |
| `bash start.sh`      | Auto-instala + sobe Express            |
| `start.ps1`          | Express + Vite juntos (PowerShell)     |

---

## CI/CD

GitHub Action em `.github/workflows/deploy.yml`:

- Dispara em push no `main`
- Copia `petrobras-quimica-study-plan/site/` para a raiz
- Faz deploy no branch `gh-pages`
- Site publicado em: **https://rafaelioppi.github.io/dados/**

---

## Convenções

- `use[Nome].js` — composables singleton
- `<style scoped>` em componentes Vue
- Variáveis CSS: `--primaria`, `--bg`, `--card`, `--texto`, `--borda`, `--sucesso`, `--erro`, `--aviso`
- 3 breakpoints: 1024px, 768px, 600px
- `color-mix()` para backgrounds com opacidade
- Routes hash-based (sem Vue Router)
