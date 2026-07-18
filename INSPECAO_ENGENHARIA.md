# INSPEÇÃO DE ENGENHARIA DE SOFTWARE — PETROBRAS TÉCNICO EM QUÍMICA

**Data:** 17/07/2026  
**Arquivos inspecionados:** 38 (14 .vue, 18 .js, 4 config, 2 .html)  
**Modo:** Análise estática + dinâmica de arquivos  

---

## 1. SEGURANÇA [CRITICAL]

### 🔴 C01 — Senhas em texto plano no código fonte
**Arquivo:** `usuarios.js:4-5`  
**Problema:** `admin123` e `petro2026` hardcoded. Armazenadas em `localStorage` sem hash.  
**Impacto:** Qualquer pessoa com acesso ao device ou via XSS obtém todas as senhas.  
**Fix:** Usar hash SHA-256 na senha (Web Crypto API) ou autenticação server-side.

### 🔴 C02 — XSS via v-html
**Arquivo:** `Plano.vue:38`  
```js
<div v-html="planoHtml"></div>
```
**Problema:** Renderiza HTML do servidor sem sanitização. Se `server.js` for comprometido ou um arquivo .md malicioso for carregado, scripts arbitrários executam no contexto do usuário.  
**Impacto:** Roubo de sessão, exfiltração de dados do localStorage.  
**Fix:** Sanitizar com DOMPurify antes de atribuir:
```js
import DOMPurify from 'dompurify';
planoHtml.value = DOMPurify.sanitize(html);
```

### 🔴 C03 — CSP ausente em produção
**Arquivo:** `server.js`  
**Problema:** Nenhum header CSP. O CSP definido em `vite.config.js:9` só funciona no dev server.  
**Impacto:** Qualquer XSS é executável sem restrição.  
**Fix:** Adicionar middleware Express com headers CSP.

### 🔴 C04 — localStorage sem criptografia
**Arquivo:** `armazenamento.js:27`  
**Problema:** Dados sensíveis (senhas, tokens de sessão) salvos em texto plano.  
**Impacto:** Acesso físico ao device → dados expostos.  
**Fix:** Criptografar com Web Crypto API (AES-GCM) antes de salvar.

---

## 2. BUGS [HIGH]

### 🟠 B01 — Recursão infinita em verificarSessao
**Arquivo:** `App.vue:112`  
```js
catch { verificarSessao() }
```
**Problema:** Se `JSON.parse(local)` lançar erro, `verificarSessao()` é chamada novamente → loop infinito.  
**Impacto:** Stack overflow, travamento total.  
**Fix:** 
```js
catch { /* ignorar dados corrompidos */ }
```

### 🟠 B02 — Argumento trocado em setHora (modo data)
**Arquivo:** `useHoras.js:36`  
```js
horas.value[data][materia] = Math.max(0, Number(mat) || 0);
```
**Problema:** Quando `sem.includes('-')` (modo data), os parâmetros são `(sem, dia, mat, val)`, mas ele usa `dia` como valor via `Number(mat)` — deveria ser `Number(val)`. O parâmetro `mat` é o nome da matéria (string), não o valor.  
**Impacto:** Horas registradas via data são NaN ou 0.  
**Fix:** `Number(val)`

### 🟠 B03 — Template literal ineficiente no Exercicios.vue
**Arquivo:** `Exercicios.vue:91-92`  
**Problema:** Expressão ternária enorme inline no `v-for` que sobrescreve o `:style` estático. A lógica de estilo está duplicada entre o objeto estático e o ternário.  
**Impacto:** Em re-renderizações, o Vue recalcula todo o objeto de estilo.  
**Fix:** Extrair para método `getAlternativaStyle(responded, idx)`.

### 🟠 B04 — Mutação de ref fora do reactive context
**Arquivo:** `useCiclo.js:24-26`  
```js
if (ciclo.value.posicao >= totalPonderado.value) {
  ciclo.value.posicao = 0;
}
```
**Problema:** `totalPonderado` é `computed`, mas essa verificação executa no escopo do módulo (setup), antes do `watch` ser registrado. A mutação de `ciclo.value.posicao` não dispara salvamento.  
**Impacto:** Posição do ciclo pode permanecer inválida sem persistir.  
**Fix:** Usar `watchEffect` ou mover para dentro de `avancarCiclo`/`reiniciarCiclo`.

### 🟠 B05 — Erros.vue:85 referência falsa
**Arquivo:** `Erros.vue:85`  
```js
{{ editandoErro.id && erros.find(e => e.id === editandoErro.id) ? 'Editar Erro' : 'Novo Erro' }}
```
**Problema:** `editandoErro.value` pode ter `id` mas não estar no array `erros.value` (se o erro foi removido ou ainda não salvo). O texto fica inconsistente.  
**Impacto:** UX confuso — mostra "Editar" para erros que não existem mais.  
**Fix:** Checar existência no array primeiro.

---

## 3. ARQUITETURA [MEDIUM]

### 🟡 A01 — Singleton em composables (anti-pattern)
**Arquivos:** Todos os `use*.js`  
**Problema:** Padrão singleton manual (`if (instance) return instance`) impede testes unitários, SSR, e múltiplas instâncias. Estado global implícito.  
**Impacto:** Impossível testar componentes isoladamente.  
**Fix:** Usar `provide/inject` do Vue ou Pinia para estado global.

### 🟡 A02 — ~10k linhas de código duplicado
**Pastas:** `root/` vs `petrobras-quimica-study-plan/site/js/`  
**Problema:** Dois codebases quase idênticos (ESM modules root, CommonJS site). Qualquer correção precisa ser aplicada em ambos.  
**Impacto:** Alto custo de manutenção, bugs não replicados entre versões.  
**Fix:** Consolidar em módulo compartilhado, usar bundler para gerar ambas as versões.

### 🟡 A03 — Roteamento manual frágil
**Arquivo:** `App.vue:62-67`  
**Problema:** `irPara()` e `navegarHash()` gerenciam rota manualmente via hash. Não há lazy loading de componentes. Todos os componentes são carregados no bundle inicial.  
**Impacto:** Bundle size desnecessariamente grande.  
**Fix:** Usar `defineAsyncComponent` para lazy loading.

### 🟡 A04 — Sem boundary de erros
**Problema:** Nenhum componente usa `onErrorCaptured`. Se qualquer componente filho lançar erro, toda a app quebra (tela branca).  
**Impacto:** Qualquer bug em um componente derruba tudo.  
**Fix:**
```vue
<ErrorBoundary>
  <component :is="views[view]" />
</ErrorBoundary>
```

---

## 4. PERFORMANCE [MEDIUM]

### 🟡 P01 — Deep watchers sem debounce em todos os composables
**Exemplo:** `useChecklist.js:16-18`, `useHoras.js:15-17`, `useSimulados.js:14-16`  
**Problema:** `watch` com `{ deep: true }` serializa o objeto inteiro a cada mudança. Em objetos grandes (checklist com 180 tópicos), cada toggle dispara serialização JSON completa.  
**Impacto:** Latência perceptível em toggle rápido.  
**Fix:** Usar `watch` com throttle/debounce ou deep watcher seletivo.

### 🟡 P02 — Recomputação desnecessária de arrays
**Arquivo:** `useSimulados.js:22-29`  
```js
const simuladosOrdenados = computed(() => {
  return [...simulados.value].map(s => ({...})).sort((a,b) => ...)
});
```
**Problema:** Cria array novo + map + sort a cada acesso. Como é computed, isso roda em toda re-renderização que acessa.  
**Impacto:** Cálculo O(n log n) em cada frame.  
**Fix:** Usar `computed` com cache adequado ou `useMemo`.

### 🟡 P03 — Nenhum lazy loading
**Arquivo:** `App.vue:137-150`  
**Problema:** Todos os 13 componentes são importados estaticamente e carregados no bundle principal.  
**Impacto:** Bundle inicial ~200KB+ mesmo que usuário só veja Login.  
**Fix:** `const Dashboard = defineAsyncComponent(() => import('./Dashboard.vue'))`

### 🟡 P04 — 100 flashcards hardcoded no composable
**Arquivo:** `useFlashcards.js:47-148`  
**Problema:** 100 objetos de flashcard inline no `useFlashcards.js`. Não podem ser traduzidos/editados sem modificar código.  
**Impacto:** Infla o bundle, difícil de manter.  
**Fix:** Mover para JSON externo (`flashcards.json`).

---

## 5. ACESSIBILIDADE [LOW-MEDIUM]

### 🔵 A11Y01 — Indicadores exclusivamente por cor
**Exemplo:** `Simulados.vue:17`, `Dashboard.vue:55`  
**Problema:** "verde/vermelho/laranja" são as únicas formas de indicar status. Usuários daltônicos (8% da população) não distinguem.  
**Fix:** Adicionar ícones, padrões ou texto além da cor.

### 🔵 A11Y02 — Botões sem aria-label
**Exemplo:** `App.vue:212` `@click="menuAberta = !menuAberta"` sem `aria-label` ou `aria-expanded`.  
**Impacto:** Leitores de tela não entendem o propósito.  
**Fix:** `aria-label="Abrir menu de navegação" aria-expanded="menuAberta"`

### 🔵 A11Y03 — Overlay sem gerenciamento de foco
**Arquivo:** `App.vue:226-239`  
**Problema:** Overlay premium não prende foco. Usuário de teclado pode tabear para fora.  
**Fix:** Usar `focus-trap` ou gerenciar `tabindex`.

---

## 6. QUALIDADE DE CÓDIGO [LOW]

### 📝 Q01 — Inline styles misturados com scoped CSS
**Arquivos:** `Checklist.vue`, `Simulados.vue`, `Admin.vue`, `Erros.vue`  
**Problema:** Uso extensivo de `<tag :style="{...}">` combinado com classes CSS. Estilos inline não respeitam `scoped`, não podem ser sobrescritos, e são mais lentos.  
**Fix:** Extrair para classes CSS.

### 📝 Q02 — `exercicios.js` linhas desformatadas
**Arquivo:** `exercicios.js:962+`  
**Problema:** Linhas gigantes sem quebra (ex: linha 962 tem ~15 objetos em uma linha).  
**Fix:** Quebrar em múltiplas linhas para legibilidade.

### 📝 Q03 — console.error sem tratamento
**Arquivo:** `armazenamento.js:13,30`  
**Problema:** `console.error` em produção não informa usuário final. Falha de localStorage silenciosa.  
**Fix:** Mostrar feedback visual ao usuário.

### 📝 Q04 — Mixed template units (h vs min)
**Arquivo:** `useCiclo.js` usa tempo em `minutos`, `useHoras.js` usa `horas`. Conversões manuais espalhadas.  
**Impacto:** Erro de fator de conversão em `Diario.vue:140` (`materiaAtual.tempo / 60`).  
**Fix:** Centralizar em uma função `formatTime(min)`.

---

## 7. TESTES [CRITICAL GAP]

### ⚪ T01 — Zero testes automatizados
**`package.json`:** nenhum test runner configurado.  
**Impacto:** Qualquer refatoração ou correção pode quebrar funcionalidades sem detecção.  
**Sugestão:** Vitest (já usa Vite). Testes mínimos:
- Unitários para `useChecklist`, `useCiclo`, `armazenamento.js`
- Component tests para `Login.vue`, `Dashboard.vue`
- Integration para fluxo de login → persistência

---

## 8. CONSOLIDAÇÃO — DUPLICAÇÃO ROOT vs SITE

### ~8.000 linhas duplicadas

| Arquivo | Root (ESM) | Site (IIFE) | 
|---------|-----------|-------------|
| dados.js | ✅ | ✅ idêntico |
| armazenamento.js | 38 linhas | 332 linhas (mais completo) |
| usuarios.js | ✅ | ✅ similar |
| app.js | App.vue (Vite) | app.js (CDN) inline |
| estilo.css | ✅ | ✅ similar |

**Recomendação:** Extrair `dados.js` e `usuarios.js` para módulo compartilhado. Manter `armazenamento.js` do site como versão melhorada e migrar root para usar mesma implementação.

---

## 9. PRIORIDADE DE CORREÇÃO

```
CRITICAL (corrigir IMEDIATAMENTE):
  C01 → hash de senhas
  C02 → sanitizar v-html
  C03 → CSP em produção
  C04 → criptografar localStorage
  B01 → recursão infinita

HIGH (corrigir nesta semana):
  B02 → argumento trocado setHora
  B04 → mutação reactive context
  T01 → setup de testes

MEDIUM (corrigir no próximo ciclo):
  A01 → refatorar singletons
  A04 → error boundary
  P01 → debounce deep watchers
  P03 → lazy loading
  A11Y01-03

LOW (corrigir quando conveniente):
  Q01-Q04 → code style
  P02 → performance arrays
```
