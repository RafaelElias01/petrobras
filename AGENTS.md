# Memorias do Projeto - Estudo Petrobras

## Visao Geral
App para concurso Petrobras - Tecnico em Quimica. Duas implementacoes:
- **Vue 3 + Vite** (raiz) — desenvolvimento, roteamento hash, singleton pattern
- **Site estatico** (`petrobras-quimica-study-plan/site/`) — producao (servido por Express ou GitHub Pages)
- Armazenamento localStorage com prefixo `petrobras_quimica_` + API REST `/api/dados/{nome}.json`
- Remote: `git@github.com:RafaelEliasIoppi/petrobras.git` (SSH)

## Comandos
- `npm run dev` — Vite dev server (porta 5173)
- `npm run build` — Build Vite de producao
- `npm start` — Backend Express (porta 3000, serve site/ + API)
- `bash start.sh` — Auto-instala deps + sobe Express
- `.\start.ps1` — Mata porta 3000, instala deps, sobe Express + abre browser

## Estrutura
```
/                                # Vue/Vite (root)
├── App.vue, main.js, index.html, vite.config.js
├── dados.js                     # CONTEUDOS, CICLO_ESTUDOS, metas, CICLO_MAP, mapCicloParaMateriaId
├── armazenamento.js             # localStorage (prefixo petrobras_quimica_)
├── usuarios.js                  # Autenticacao + gerarTokenSessao
├── use*.js                      # Composables (Checklist, Horas, Ciclo, etc.)
├── *.vue                        # Componentes (Dashboard, Ciclo, Diario, Relatorio, etc.)
├── Login.vue                    # Tela de login com toggle senha (icone 🔒/👁)
├── estilo.css                   # CSS global
├── .github/workflows/deploy.yml # CI: deploy site/ → gh-pages
├── start.ps1                    # Script PowerShell pra subir Express
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
│       ├── usuarios.js          # Autenticacao
│       └── armazenamento.js     # localStorage + API com debounce
└── planos/                      # Documentos .md
```

## Seguranca - Sessao Unica
- `localStorage` + `sessionStorage` com token aleatorio (`petro_quimica_sessao`)
- Ao logar, salva `{ user, token, timestamp }` em ambos
- `storage` event listener detecta login em outra aba → faz logout automatico
- `verificarSessao()` restaura sessao do localStorage ao recarregar

## Conta Demo
- Usuario `estudante` / senha `petro2026`
- Recursos **bloqueados** com overlay marketing (👑 Versao Premium):
  - Ciclo, Horas, Simulados, Erros, Diario, Relatorio, Questoes, Admin
- Recursos **liberados**: Dashboard, Conteudos, Flashcards, Plano de Estudos
- Overlay cobre a tela com backdrop blur, impede interacao/scroll
- Sidebar mostra 🔒 nos itens bloqueados
- Sidebar mostra badge `R$49,90` no item Premium se `!isPremium`

## Persistencia (toda feature)
1. **Cache** — estado reativo
2. **localStorage** — `_salvarLocal()` com prefixo `petrobras_quimica_`
3. **Servidor** — `_putToServer()` com debounce 1s

## Memorias Fixas (nao errar de novo)
- **Site estatico** (`site/index.html`): SEMPRE incluir `<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js"></script>` ANTES dos scripts locais (dados.js, armazenamento.js, app.js). A versao Vite (raiz) nao precisa, mas o site estatico sim.
- **Cache busting**: ao alterar CSS/JS, atualizar `?v=` nos links. Usar data + letra (ex: `20260718a`).
- **Variáveis Vue no template**: qualquer `ref()` criada em app.js precisa estar no `return {}` do `setup()`, senao dá `Property not defined on instance`.
- **armazenamento.js**: nao usar `const server` duas vezes no mesmo escopo (erro `Identifier 'server' has already been declared`). Renomear para `serverData` na segunda.
- **Depoimentos**: usar glassmorphism (`rgba(255,255,255,0.05)`, `backdrop-filter`) no lugar de `var(--card)` pra fundo escuro. Exibir `cidade` junto com `nome`.
- **Contador visitantes**: sempre aplicar `Math.max(32, valor)` pra nunca ficar abaixo de 32. Usar `requestAnimationFrame` pra animacao suave.
- **Comprar Premium**: se `usuarioAtual` for null (tela de login), redirecionar pra WhatsApp. Se logado, criar preference no Mercado Pago.
- **Login footer**: usar `<button @click>` em vez de `<a href>` pra evitar popup blocker e garantir que o clique sempre dispare acao.
- **Ciclo de Estudos**: `CICLO_PONDERADO` expande por `peso` (total 24 slots). `posicao` indexa nos 24, wrap no fim. `concluido` usa `item-{idx}` com contador.

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
| `#premium` | index.html/app.js | Tela de compra Premium 👑 |

## Login e Cadastro
- **Abas "Entrar" / "Criar Conta"** no formulário de login (alterna `modoCadastro`)
- `handleRegister()` envia POST `/api/auth/register` → salva em `dados/usuarios.json`
- `handleLogin()` melhorado: chama `autenticar()` + `verificarPremium()` após login
- Senhas em texto plano (MVP), podem ser hashadas depois

## Premium / Pagamento
- **Preço**: R$ 49,90 (pagamento único, acesso vitalício)
- **Gateway**: Mercado Pago (`mercadopago` SDK)
- `comprarPremium()` → POST `/api/mercadopago/preference` → redireciona ao checkout MP
- Webhook `/api/mercadopago/webhook` atualiza `dados/premium.json`
- `verificarPremium()` → GET `/api/premium/status/:usuario` → libera recursos
- Sidebar mostra badge `R$49,90` se `!isPremium`
- Premium libera: Ciclo, Horas, Simulados, Erros, Diario, Relatorio, Questoes, Admin

## Provas Sociais
- `notificacoes` — notificações flutuantes estilo "João acabou de comprar o Premium!"
- `iniciarSocialProof()` — intervalo aleatório 4-8s, notificação some após 5s
- `depoimentos` — array de 10 depoimentos com nome, avatar, texto e estrelas
- Exibidos na tela de login (grade 4 cards) e na página Premium (grade completa)

## Padroes

## CI/CD
- `.github/workflows/deploy.yml` — push no main → copia site/ → deploy no gh-pages
- URL: https://rafaeleliasioppi.github.io/petrobras/
- Persistencia no Pages funciona via localStorage apenas (fallback offline)
