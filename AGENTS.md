# Memorias do Projeto - Estudo Petrobras

## Visao Geral
App para concurso Petrobras - Tecnico em Quimica. Duas implementacoes:
- **Vue 3 + Vite** (`/workspaces/dados/`) — desenvolvimento, roteamento hash, singleton pattern
- **Site estatico** (`petrobras-quimica-study-plan/site/`) — producao (servido por Express ou GitHub Pages)
- Armazenamento localStorage com prefixo `petrobras_quimica_` + API REST `/api/dados/{nome}.json`

## Comandos
- `npm run dev` — Vite dev server (porta 5173)
- `npm run build` — Build Vite de producao
- `npm start` — Backend Express (porta 3000, serve site/ + API)
- `bash start.sh` — Auto-instala deps + sobe Express
- `start.ps1` — Backend + frontend juntos

## Estrutura
```
/                                # Vue/Vite (root)
├── App.vue, main.js, index.html, vite.config.js
├── dados.js                     # CONTEUDOS, CICLO_ESTUDOS, metas, CICLO_MAP, mapCicloParaMateriaId
├── armazenamento.js             # localStorage (prefixo petrobras_quimica_)
├── use*.js                      # Composables (Checklist, Horas, Ciclo, etc.)
├── *.vue                        # Componentes (Dashboard, Ciclo, Diario, Relatorio, etc.)
├── estilo.css                   # CSS global
├── .github/workflows/deploy.yml # CI: deploy site/ → gh-pages
│
petrobras-quimica-study-plan/    # Site estatico + servidor
├── server.js                    # Express (porta 3000)
├── start.sh
├── dados/                       # JSON files (persistencia servidor)
├── site/
│   ├── index.html               # SPA (Vue CDN)
│   ├── css/estilo.css
│   └── js/
│       ├── app.js               # Instancia Vue + composables
│       ├── dados.js             # Dados (identico ao root)
│       └── armazenamento.js     # localStorage + API com debounce
└── planos/                      # Documentos .md
```

## Persistencia (toda feature)
1. **Cache** — estado reativo
2. **localStorage** — `_salvarLocal()` com prefixo
3. **Servidor** — `_putToServer()` com debounce 1s

## Ciclo de Estudos
- `CICLO_PONDERADO` expande por `peso` (total 24 slots)
- `posicao` indexa nos 24, wrap no fim
- `concluido` usa `item-{idx}` com contador
- `cicloCompleto` limitado a 100%
- `CICLO_MAP` em `dados.js` mapeia nome da materia para ID de CONTEUDOS
- `idxOriginalAtual` e `completosPorItem` expostos para UI

## Telas
| Rota | Arquivo | Proposito |
|------|---------|-----------|
| `#dashboard` | Dashboard.vue | Visao geral |
| `#checklist` | Checklist.vue | Topicos do edital |
| `#ciclo` | Ciclo.vue | Ciclo de estudos (ponderado) |
| `#horas` | Horas.vue | Grade de horas |
| `#simulados` | Simulados.vue | Desempenho |
| `#erros` | Erros.vue | Caderno de erros |
| `#diario` | Diario.vue | Registro do Dia + Revisoes |
| `#relatorio` | Relatorio.vue | Analise de produtividade |
| `#plano` | Plano.vue | Documentos |
| `#cronograma` | Cronograma.vue / cronograma in site/ | Cronograma semanal interativo |
| `#flashcards` | Flashcards.vue | Revisao com flashcards |

## Padroes
- `use[Nome].js` — Composables singleton
- `<style scoped>` em cada componente
- Variaveis CSS: `--primaria`, `--bg`, `--card`, `--texto`, `--borda`, `--sucesso`, `--erro`, `--aviso`
- 3 breakpoints: 1024px, 768px, 600px
- `color-mix()` para backgrounds (fallback implicito)
- Rotas hash-based (sem Vue Router)
- GPG signing ativado no git — commitar com `-c commit.gpgsign=false`

## CI/CD
- `.github/workflows/deploy.yml` — push no main → copia site/ → deploy no gh-pages
- URL: https://rafaelioppi.github.io/dados/
- Persistencia no Pages funciona via localStorage apenas (fallback offline)
