# Memorias do Projeto - Estudo Petrobras

## Arquitetura (para tomada de decisao)

```
Vue 3 + Vite (SPA hash routing) ──build──► dist/
  │                                          │
  ├── Login.vue ─── POST /api/auth/* ────────┤
  ├── App.vue ───── GET /api/premium/status ─┤
  ├── *.vue ─────── POST /api/visitas ───────┤
  └── dados.js ──── (local state, no server) ┘
                                              │
Express server.js (porta 3000) ◄──────────────┘
  ├── serve dist/ (static)
  ├── GET /api/planos/*
  ├── POST /api/auth/register (dados/usuarios.json)
  ├── POST /api/mercadopago/preference
  ├── GET /api/premium/status/:usuario
  └── POST/GET /api/visitas (dados/visitas.json)
```

**Regra de ouro**: Toda feature que persiste dados precisa de 3 camadas:
1. Estado reativo (cache)
2. `localStorage` (`_salvarLocal()`)
3. Servidor (`_putToServer()` com debounce 1s)
Se pular uma delas, provavelmente é bug.

## Orquestracao: Quando tomar cada acao

**QUANDO** o usuario pedir algo sobre "conta", "cadastro", "login":
→ Login.vue (modoCadastro toggle) + server.js (POST /api/auth/register)
→ Validacoes: 3+ chars, senhas conferem, usuario unico
→ NAO hash senha (MVP texto plano)

**QUADNO** pedir "premium", "pagar", "comprar":
→ PremiumCheckout.vue (componente unificado)
→ Mercado Pago se logado, WhatsApp se nao
→ Preco fixo R$ 49,90, chave PIX +5551983098650

**QUANDO** for tela nova:
→ Criar .vue com scoped CSS (nunca inline styles)
→ Adicionar rota no App.vue (hash #nomedarota)
→ Sidebar item em App.vue
→ Se precisar de dados, seguir padrao 3-camadas
→ Responsivo nos 4 breakpoints (1024/768/600/480)

**QUANDO** editar CSS de componente:
→ Sempre `<style scoped>` — nunca inline ou global
→ **Breakpoints obrigatorios nos 4 tamanhos**: 1024, 768, 600, 480 — SEMPRE verificar cada um
→ Touch targets >= 44px em < 768px
→ iOS: font-size >= 16px em inputs
→ **REGRA DE OURO**: responsividade é PRIORIDADE #1. Nunca modificar CSS/HTML sem verificar os 4 breakpoints. Qualquer alteracao visual exige teste nos 4 tamanhos.

**QUANDO** o server.js crashar na VM:
→ `ssh -i ~/.ssh/saur_oracle ubuntu@163.176.163.213`
→ Checar `journalctl -u petrobras.service -n 20`
→ Se `ERR_MODULE_NOT_FOUND`: `npm install <pacote>`
→ Se syntax error: server.js foi sobrescrito sem CI — copiar manual do repo

**QUANDO** editar API endpoint:
→ server.js tem rate-limit 200/15min no /api/ — testar com --rate limit nao vai bloquear dev
→ Validar input em TODOS os POST (nunca confiar no client)
→ Path traversal: usar `path.resolve` com `basePath` check
→ Nao esquecer de `npm install express-rate-limit` se adicionar ao server.js (VM precisa)

**QUANDO** deploy falhar:
→ CI faz: build → gh-pages → rsync pra VM → restart petrobras.service
→ Se rsync falhar: GH secrets VM_SSH_KEY, VM_HOST, VM_USER estao configuradas?
→ Se restart falhar: servidor crashou — checar logs
→ Fallback manual: `.\deploy.ps1` (precisa rsync local)

## Acoplamento: O que quebra quando toco em X

| Arquivo | Impacto | Sincronizar com |
|---------|---------|-----------------|
| `Login.vue` | Fluxo de auth, premium checkout, criar conta | `PremiumCheckout.vue`, `server.js`, `App.vue` (sidebar) |
| `PremiumCheckout.vue` | Telas de login e premium overlay | `Login.vue`, `App.vue` |
| `server.js` | Toda API (auth, premium, visitas, planos) | `dados/` diretorio na VM, `package.json` (deps) |
| `estilo.css` | Todas as paginas internas | `main.js` (import obrigatorio) |
| `.github/workflows/deploy.yml` | CI inteiro | Secrets do GitHub, VM systemd service |
| `usuarios.js` | Autenticacao local + admin hash | `Login.vue`, `App.vue` |
| `armazenamento.js` | Toda persistencia local | NENHUM outro arquivo — singleton puro |
| `dados.js` | Conteudos, ciclo, materias | `use*.js` composables |

## Diagnosticos Rapidos (sintoma → causa → conserto)

**"login nao funciona / 401"**
→ Admin hash mudou? `carregarUsuarios()` detecta e forca update
→ Sessao expirou? Token tem 7-day TTL
→ Outra aba? `storage` event faz logout automatico

**"pagina sem estilo"**
→ `estilo.css` nao importado em `main.js` — causa #1 de CSS quebrado
→ Verificar se `import './estilo.css'` existe

**"Property not defined on instance"**
→ `ref()` criada no setup mas nao retornada no `return {}`

**"Identifier 'server' has already been declared"**
→ `const server` usado duas vezes em `armazenamento.js` — renomear segunda para `serverData`

**"Popup bloqueado no login"**
→ Usou `<a href>` em vez de `<button @click>` no footer premium

**"Contador de visitantes zerado"**
→ `Math.max(32, valor)` — nunca deixa mostrar abaixo de 32

**"Express na VM crashou"**
→ `ERR_MODULE_NOT_FOUND`: npm install faltando
→ `npm install <pacote>` em /opt/petrobras/

**"Ciclo nao expande 24 slots"**
→ `CICLO_PONDERADO` expande por `peso`. `posicao` indexa com wrap. `concluido` usa `item-{idx}`

**"Deploy.ps1 falha no Windows"**
→ `$host` é reservado no PowerShell — usar `$vmHost`
→ rsync nao existe no Windows — usar CI ou scp manual

## Padroes de Codigo (nao inventar moda)

**Componente Vue novo**:
```vue
<script setup>
import { ref, ... } from 'vue'
// estado, funcoes
</script>
<template>
  <div class="nome-componente">
    ...
  </div>
</template>
<style scoped>
.nome-componente { ... }
/* breakpoints: 1024, 768, 600, 480 */
</style>
```

**CSS**:
- Nunca inline styles
- Scoped sempre
- Variaveis CSS do :root (nao hardcoded colors)
- Glassmorphism: `rgba(255,255,255,0.05)` + `backdrop-filter`
- Focus apenas com `:focus-visible` (nao `:focus`)
- Touch targets >= 44px em <768px
- Inputs com `font-size: 16px` (iOS)

**Eventos de teclado**:
- `@keydown.escape` para fechar modais/overlays
- `@keydown.enter` para submeter formularios
- `confirm()` antes de delete/reset

**Navegacao entre telas**:
- Usar `window.dispatchEvent(new CustomEvent('navegar'))`
- NAO usar `window.location.hash = view`

**Seguranca server.js**:
- Todo POST: validar tipo, tamanho, campos obrigatorios
- Path: `path.resolve` + check `basePath` prefix
- CSP + HSTS via helmet
- Nao confiar em nada do client

## VM (so com permissao explicita)

- Host: `163.176.163.213`
- User: `ubuntu`
- Key: `~/.ssh/saur_oracle`
- Path: `/opt/petrobras/`
- Service: `petrobras.service` (systemd, node server.js)
- Logs: `journalctl -u petrobras.service -n 20`
- PWD no servidor: `/opt/petrobras/`
- NAO tem git — deploy via rsync/scp ou CI
- Se CI falhar, copiar manual: scp dist/ server.js planos/ → restart

## Memorias Fixas (nao errar de novo)

- **🚨 VM**: nunca mexer em nginx, systemd, firewall, portas, SSL sem permissao. Nao tem git la — deploy via CI ou scp manual.
- **🚨 VM sempre atualizada**: apos qualquer alteracao de codigo, fazer build + scp pra VM + restart. CI faz automaticamente no push, mas sempre verificar se o servico rodou sem erros (`journalctl -u petrobras.service -n 20`).
- **CI**: .github/workflows/deploy.yml faz build + gh-pages + VM. Se adicionar dep npm no server, VM precisa `npm install`.
- **site/index.html**: `<script src="cdn/vue@3">` ANTES dos scripts locais. Vite root nao precisa.
- **Cache busting CSS/JS**: `?v=YYYYMMDDa`
- **PowerShell**: `$host` é reservado — usar `$vmHost`
- **armazenamento.js**: `const server` apenas 1 vez — segunda vira `serverData`
- **Dashboard contador**: `Math.max(32, valor)`, animar com `requestAnimationFrame`
- **Login footer**: `<button @click>`, nunca `<a href>`
- **Depoimentos**: glassmorphism, exibir `cidade`