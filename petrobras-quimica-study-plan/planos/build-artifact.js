/**
 * Gera a versão web (Artifact) do cronograma a partir do MESMO markdown que a
 * versão impressa, para não haver duas fontes de verdade.
 *
 *   node planos/build-artifact.js
 *
 * Saída: planos/cronograma-16-semanas-web.html
 *
 * Usa marked.lexer + parseInline em vez de marked.parse: assim o HTML de bloco
 * é nosso (sections, eyebrows, wrappers de scroll) e só o inline vem do parser.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { CONTEUDOS, SEMANAS_PLANO, META_HORAS_DIA, META_HORAS_SEMANA } from '../../dados.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ORIGEM = path.join(AQUI, 'cronograma-16-semanas-completo.md');
const DESTINO = path.join(AQUI, 'cronograma-16-semanas-web.html');

const TOTAL_QUESTOES = CONTEUDOS.reduce((t, m) => t + m.questoes, 0);
const TOTAL_HORAS = SEMANAS_PLANO * META_HORAS_SEMANA;

// Blocos temáticos do plano. Derivado, não escrito no markdown, porque é
// estrutura de navegação — a sequência 1→16 é real, então numerar é honesto.
const BLOCOS = [
  { ate: 3, rotulo: 'Bloco I · Base de Química Geral' },
  { ate: 6, rotulo: 'Bloco II · Soluções e Equilíbrio' },
  { ate: 9, rotulo: 'Bloco III · Físico-Química e Orgânica' },
  { ate: 12, rotulo: 'Bloco IV · Analítica e Fechamento' },
  { ate: 16, rotulo: 'Bloco V · Revisão e Simulados' }
];
const blocoDe = (n) => BLOCOS.find(b => n <= b.ate).rotulo;

const BADGES = [
  [/🔴/g, '<b class="inc inc-a"><span aria-hidden="true">A</span><i>alta incidência</i></b>'],
  [/🟠/g, '<b class="inc inc-m"><span aria-hidden="true">M</span><i>média incidência</i></b>'],
  [/🟡/g, '<b class="inc inc-b"><span aria-hidden="true">B</span><i>baixa incidência</i></b>']
];

const inline = (md) => {
  let html = marked.parseInline(md ?? '', { gfm: true });
  for (const [de, para] of BADGES) html = html.replace(de, para);
  return html;
};

const escapaAttr = (s) => s
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;');

const slug = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ------------------------------------------------------------------ tabelas */

// Último título visto, para dar às tabelas um rótulo acessível com contexto em
// vez de 27 regiões todas chamadas "tabela".
let contexto = 'Resumo do plano';

function renderTabela(tok) {
  const cabecalhoVazio = tok.header.every(c => !c.text.trim());
  // A tabela de metadados do topo usa header vazio de propósito (é uma lista de
  // definições disfarçada). Sem thead ela para de ter uma faixa cinza morta.
  const classe = ['tabela'];
  if (cabecalhoVazio) classe.push('t-def');
  if (/^dia$/i.test(tok.header[0]?.text.trim())) classe.push('t-grade');

  const thead = cabecalhoVazio ? '' : `<thead><tr>${
    tok.header.map(c => `<th scope="col">${inline(c.text)}</th>`).join('')
  }</tr></thead>`;

  const tbody = `<tbody>${tok.rows.map(linha => {
    const [primeira, ...resto] = linha;
    const cabecaLinha = `<th scope="row">${inline(primeira.text)}</th>`;
    return `<tr>${cabecaLinha}${resto.map(c => `<td>${inline(c.text)}</td>`).join('')}</tr>`;
  }).join('')}</tbody>`;

  const rotulo = escapaAttr(contexto);
  return `<div class="rolagem" tabindex="0" role="region" aria-label="${rotulo}">`
    + `<table class="${classe.join(' ')}"><caption>${rotulo}</caption>`
    + `${thead}${tbody}</table></div>`;
}

/* ------------------------------------------------------------------- blocos */

function renderBlocos(tokens) {
  let out = '';
  for (const tok of tokens) {
    switch (tok.type) {
      case 'paragraph': out += `<p>${inline(tok.text)}</p>`; break;
      case 'table': out += renderTabela(tok); break;
      case 'blockquote':
        out += `<aside class="nota">${renderBlocos(tok.tokens)}</aside>`;
        break;
      case 'list': {
        const tag = tok.ordered ? 'ol' : 'ul';
        const itens = tok.items.map(i => `<li>${inline(i.text)}</li>`).join('');
        out += `<${tag} class="lista">${itens}</${tag}>`;
        break;
      }
      case 'heading': out += renderHeading(tok); break;
      case 'hr': case 'space': break;
      default:
        if (tok.text) out += `<p>${inline(tok.text)}</p>`;
    }
  }
  return out;
}

function renderHeading(tok) {
  const texto = tok.text;
  const id = slug(texto);
  contexto = texto.replace(/\*\*/g, '');

  // "### SEMANA 7 — Termoquímica e Eletroquímica"
  const semana = texto.match(/^SEMANA (\d+)\s*[—–-]\s*(.+)$/);
  if (semana) {
    const [, n, titulo] = semana;
    return `</section><section class="semana" id="semana-${n}">`
      + `<header class="semana-cab">`
      + `<p class="trilha"><span class="num">${String(n).padStart(2, '0')}</span>`
      + `<span class="barra" aria-hidden="true"></span>`
      + `<span class="bloco">${blocoDe(Number(n))}</span></p>`
      + `<h3>${inline(titulo)}</h3>`
      + `</header>`;
  }

  // "## 3. Semanas 1 a 12 — Conteúdo novo"
  const numerada = texto.match(/^(\d+)\.\s+(.+)$/);
  if (tok.depth === 2) {
    const rotulo = numerada ? numerada[1].padStart(2, '0') : '';
    const titulo = numerada ? numerada[2] : texto;
    return `</section><section class="secao" id="${id}">`
      + `<h2>${rotulo ? `<span class="secao-num">${rotulo}</span>` : ''}${inline(titulo)}</h2>`;
  }

  return `<h${tok.depth} id="${id}">${inline(texto)}</h${tok.depth}>`;
}

/* --------------------------------------------------------------------- css */

const CSS = `
:root {
  color-scheme: light dark;

  --paper:     #EFF1F0;
  --surface:   #FFFFFF;
  --surface-2: #E5E9E8;
  --ink:       #141B20;
  --ink-2:     #45555C;
  --ink-3:     #6E8189;
  --rule:      #C7D0CE;
  --rule-forte:#9FADAB;
  --accent:    #1F5C63;
  --accent-ink:#FFFFFF;
  --accent-fraco: #DDE8E7;
  --alta:      #A8321E;
  --media:     #8A6210;
  --baixa:     #5C6E75;

  --f-display: "Bahnschrift SemiCondensed", "Bahnschrift", "DIN Alternate",
               "Segoe UI Semibold", "Segoe UI", system-ui, sans-serif;
  --f-corpo:   "Segoe UI", -apple-system, system-ui, "Helvetica Neue", sans-serif;
  --f-dado:    "Cascadia Mono", "Cascadia Code", Consolas, ui-monospace,
               "SF Mono", Menlo, monospace;

  --largura-texto: 68ch;
  --largura-pagina: 1180px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper:     #0E1417;
    --surface:   #151D21;
    --surface-2: #1D272B;
    --ink:       #E7EDEB;
    --ink-2:     #A6B5B8;
    --ink-3:     #7C8E92;
    --rule:      #2B373B;
    --rule-forte:#3E4E53;
    --accent:    #63C2C6;
    --accent-ink:#0E1417;
    --accent-fraco: #17282B;
    --alta:      #E9775F;
    --media:     #DCB055;
    --baixa:     #90A2A7;
  }
}

/* O toggle do visualizador estampa data-theme na raiz e precisa vencer a
   media query nos dois sentidos — daí redefinir os tokens outra vez. */
:root[data-theme="dark"] {
  --paper:     #0E1417;
  --surface:   #151D21;
  --surface-2: #1D272B;
  --ink:       #E7EDEB;
  --ink-2:     #A6B5B8;
  --ink-3:     #7C8E92;
  --rule:      #2B373B;
  --rule-forte:#3E4E53;
  --accent:    #63C2C6;
  --accent-ink:#0E1417;
  --accent-fraco: #17282B;
  --alta:      #E9775F;
  --media:     #DCB055;
  --baixa:     #90A2A7;
}
:root[data-theme="light"] {
  --paper:     #EFF1F0;
  --surface:   #FFFFFF;
  --surface-2: #E5E9E8;
  --ink:       #141B20;
  --ink-2:     #45555C;
  --ink-3:     #6E8189;
  --rule:      #C7D0CE;
  --rule-forte:#9FADAB;
  --accent:    #1F5C63;
  --accent-ink:#FFFFFF;
  --accent-fraco: #DDE8E7;
  --alta:      #A8321E;
  --media:     #8A6210;
  --baixa:     #5C6E75;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0 24px 96px;
  background: var(--paper);
  color: var(--ink);
  font: 400 16px/1.6 var(--f-corpo);
  -webkit-font-smoothing: antialiased;
}

.pagina {
  max-width: var(--largura-pagina);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ---------------------------------------------------------------- cabeçalho */

.capa {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 56px 0 32px;
  border-bottom: 2px solid var(--ink);
}

.eyebrow {
  margin: 0;
  font: 600 12px/1 var(--f-dado);
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--accent);
}

.capa h1 {
  margin: 0;
  font-family: var(--f-display);
  font-weight: 600;
  font-size: clamp(2.4rem, 6vw, 4.1rem);
  line-height: .98;
  letter-spacing: -.015em;
  text-wrap: balance;
}

.capa .sub {
  margin: 0;
  max-width: var(--largura-texto);
  color: var(--ink-2);
  font-size: 1.05rem;
}

.painel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: 1px;
  background: var(--rule);
  border: 1px solid var(--rule);
  margin-top: 8px;
}
.painel div {
  background: var(--surface);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.painel dt {
  font: 600 11px/1 var(--f-dado);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.painel dd {
  margin: 0;
  font-family: var(--f-display);
  font-weight: 600;
  font-size: 1.85rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.painel dd small {
  font-family: var(--f-corpo);
  font-size: .78rem;
  font-weight: 400;
  color: var(--ink-2);
}

/* ------------------------------------------------------------------ seções */

.secao, .semana { display: flow-root; }

.secao {
  padding-top: 56px;
}

.secao > h2 {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--rule);
  font-family: var(--f-display);
  font-weight: 600;
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  line-height: 1.05;
  letter-spacing: -.01em;
  text-wrap: balance;
}
.secao-num {
  flex: 0 0 auto;
  font: 600 .8rem/1 var(--f-dado);
  letter-spacing: .08em;
  color: var(--accent-ink);
  background: var(--accent);
  padding: 6px 8px;
  font-variant-numeric: tabular-nums;
}

h3 {
  margin: 0;
  font-family: var(--f-display);
  font-weight: 600;
  font-size: 1.32rem;
  line-height: 1.12;
  letter-spacing: -.005em;
  text-wrap: balance;
}
.secao > h3 { margin: 36px 0 14px; }

h4 {
  margin: 32px 0 12px;
  font: 600 12px/1 var(--f-dado);
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ink-3);
}

p { margin: 0 0 16px; max-width: var(--largura-texto); }
.secao > p:last-child, .semana > p:last-child { margin-bottom: 0; }

a { color: var(--accent); text-underline-offset: .18em; }

strong { font-weight: 600; }

code {
  font: .86em var(--f-dado);
  background: var(--surface-2);
  padding: .08em .35em;
  border-radius: 2px;
}

/* -------------------------------------------------------- cabeça de semana */

.semana { padding-top: 44px; }

.semana-cab {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--ink);
}

.trilha {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  max-width: none;
}
.trilha .num {
  font-family: var(--f-display);
  font-weight: 600;
  font-size: 2.6rem;
  line-height: .85;
  letter-spacing: -.02em;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.trilha .barra {
  flex: 0 0 auto;
  width: 1px;
  height: 26px;
  background: var(--rule-forte);
}
.trilha .bloco {
  font: 600 11px/1.3 var(--f-dado);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink-3);
}

/* ----------------------------------------------------------------- tabelas */

.rolagem {
  overflow-x: auto;
  margin: 0 0 22px;
  border: 1px solid var(--rule);
  background: var(--surface);
}
.rolagem:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* A legenda nomeia a tabela para leitor de tela; o título logo acima já diz o
   mesmo visualmente, então some da tela sem sair da árvore de acessibilidade. */
caption {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: .875rem;
  min-width: 640px;
}
.t-def { min-width: 0; }

thead th {
  position: sticky;
  top: 0;
  background: var(--surface-2);
  font: 600 11px/1.3 var(--f-dado);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink-2);
  text-align: left;
  padding: 10px 14px;
  border-bottom: 1px solid var(--rule-forte);
  white-space: nowrap;
}

tbody th, tbody td {
  padding: 11px 14px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--rule);
  font-weight: 400;
}
tbody tr:last-child th, tbody tr:last-child td { border-bottom: 0; }

tbody th {
  font: 600 12px/1.4 var(--f-dado);
  letter-spacing: .04em;
  color: var(--ink);
  white-space: nowrap;
  background: color-mix(in srgb, var(--surface-2) 45%, transparent);
  border-right: 1px solid var(--rule);
}

/* Grade dia × turno: 3 colunas iguais de conteúdo, coluna do dia estreita. */
.t-grade { min-width: 860px; }
.t-grade tbody th { width: 5.5rem; }
.t-grade td { width: calc((100% - 5.5rem) / 3); }

/* Números em coluna alinham. */
.t-def tbody th { width: 12rem; white-space: normal; }

/* ------------------------------------------------------------------ badges */

.inc {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.15em;
  height: 1.15em;
  margin-right: .35em;
  border-radius: 50%;
  font: 700 .68em/1 var(--f-dado);
  vertical-align: .02em;
  color: var(--paper);
  background: var(--baixa);
  flex: 0 0 auto;
}
.inc i {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.inc-a { background: var(--alta); }
.inc-m { background: var(--media); }
.inc-b { background: transparent; color: var(--baixa); box-shadow: inset 0 0 0 1.5px var(--baixa); }

/* -------------------------------------------------------------------- nota */

.nota {
  margin: 0 0 22px;
  padding: 16px 18px;
  max-width: var(--largura-texto);
  background: var(--accent-fraco);
  border-left: 3px solid var(--accent);
  font-size: .94rem;
}
.nota p { margin: 0; max-width: none; }
.nota p + p { margin-top: 10px; }

/* ------------------------------------------------------------------ listas */

.lista {
  max-width: var(--largura-texto);
  margin: 0 0 20px;
  padding-left: 0;
  list-style: none;
  counter-reset: regra;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
ol.lista > li {
  counter-increment: regra;
  position: relative;
  padding-left: 42px;
}
ol.lista > li::before {
  content: counter(regra, decimal-leading-zero);
  position: absolute;
  left: 0;
  top: .1em;
  font: 600 .8rem/1.5 var(--f-dado);
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
ul.lista > li { padding-left: 20px; position: relative; }
ul.lista > li::before {
  content: "";
  position: absolute;
  left: 0; top: .62em;
  width: 8px; height: 1px;
  background: var(--rule-forte);
}

/* ------------------------------------------------------------------- rodapé */

.rodape {
  margin-top: 64px;
  padding-top: 20px;
  border-top: 1px solid var(--rule);
  color: var(--ink-3);
  font-size: .85rem;
}
.rodape p { max-width: none; }

/* ---------------------------------------------------------------- responsivo */

@media (max-width: 700px) {
  body { padding: 0 16px 64px; }
  .capa { padding-top: 36px; }
  .trilha .num { font-size: 2rem; }
  .painel dd { font-size: 1.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}

:where(a, [tabindex]):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* -------------------------------------------------------------- impressão */

@page { size: A4 portrait; margin: 14mm 11mm; }

@media print {
  :root {
    --paper: #fff; --surface: #fff; --surface-2: #ededed;
    --ink: #000; --ink-2: #333; --ink-3: #555;
    --rule: #bbb; --rule-forte: #888;
    --accent: #000; --accent-ink: #fff; --accent-fraco: #f4f4f4;
    --alta: #000; --media: #7a7a7a; --baixa: #fff;
  }
  body { padding: 0; font-size: 9.4pt; background: #fff; }
  .semana { page-break-before: always; padding-top: 0; }
  .secao { page-break-before: always; padding-top: 0; }
  .capa { padding-top: 0; }
  table { min-width: 0 !important; font-size: 8pt; }
  thead { display: table-header-group; }
  thead th { position: static; }
  tr { page-break-inside: avoid; }
  .rolagem { overflow: visible; }
  .nota, .semana-cab { page-break-inside: avoid; }
  .inc-b { box-shadow: inset 0 0 0 1pt #000; color: #000; }
}
`;

/* -------------------------------------------------------------------- build */

function build() {
  const md = fs.readFileSync(ORIGEM, 'utf8');
  const tokens = marked.lexer(md, { gfm: true });

  // O h1 e os dois parágrafos de abertura viram a capa; o resto entra no fluxo.
  const iPrimeiraSecao = tokens.findIndex(t => t.type === 'heading' && t.depth === 2);
  const corpo = renderBlocos(tokens.slice(iPrimeiraSecao))
    .replace(/^<\/section>/, ''); // a primeira seção não fecha nada

  const html = `<div class="pagina">
<header class="capa">
  <p class="eyebrow">Plano de estudos · Banca Cesgranrio</p>
  <h1>Cronograma de ${SEMANAS_PLANO} Semanas</h1>
  <p class="sub">Petrobras — Técnico(a) de Química. Todo o conteúdo programático
  distribuído dia a dia em três blocos de 2h, com cada tópico marcado pela
  incidência real na prova.</p>
  <dl class="painel">
    <div><dt>Duração</dt><dd>${SEMANAS_PLANO}<small> semanas</small></dd></div>
    <div><dt>Por dia</dt><dd>${META_HORAS_DIA}<small> horas · 3 blocos</small></dd></div>
    <div><dt>Por semana</dt><dd>${META_HORAS_SEMANA}<small> horas</small></dd></div>
    <div><dt>Carga total</dt><dd>${TOTAL_HORAS}<small> horas</small></dd></div>
    <div><dt>Prova</dt><dd>${TOTAL_QUESTOES}<small> questões</small></dd></div>
  </dl>
</header>
${corpo}
</section>
<footer class="rodape">
  <p>Gerado a partir de <code>dados.js</code> — pesos por questão, tópicos de
  <code>CONTEUDOS</code> e as metas <code>SEMANAS_PLANO</code>,
  <code>META_HORAS_SEMANA</code> e <code>META_HORAS_DIA</code>. Imprime em A4
  com uma semana por página.</p>
</footer>
</div>
`;

  fs.writeFileSync(DESTINO, html, 'utf8');
  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(0);
  console.log(`OK  ${path.relative(process.cwd(), DESTINO)}  (${kb} KB)`);
}

// O <style> vai no próprio arquivo: o Artifact embrulha o conteúdo em
// doctype/head/body, então escrevemos só o conteúdo do body + o style inline.
function buildComEstilo() {
  build();
  const corpo = fs.readFileSync(DESTINO, 'utf8');
  fs.writeFileSync(
    DESTINO,
    `<title>Cronograma ${SEMANAS_PLANO} Semanas — Petrobras Técnico de Química</title>\n`
      + `<style>${CSS}</style>\n${corpo}`,
    'utf8'
  );
}

buildComEstilo();
