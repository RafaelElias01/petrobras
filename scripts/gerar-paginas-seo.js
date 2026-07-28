/**
 * Gera as páginas públicas de conteúdo a partir de dados.js.
 *
 *   node scripts/gerar-paginas-seo.js
 *
 * Saída: public/estudar/ (o Vite copia public/ para dist/, e o Express serve
 * dist/ como estático — então as páginas ficam em /estudar/... sem SSR).
 *
 * Por que existe: até hoje o sitemap tinha UMA url (a home). Todo o conteúdo
 * programático — centenas de tópicos com peso — estava dentro do app, atrás do
 * login, invisível para o Google. Cada grupo de matéria vira uma página que
 * responde uma busca real de quem já decidiu prestar a prova.
 *
 * As páginas trazem JSON-LD (FAQPage + BreadcrumbList) e um parágrafo de
 * resposta direta logo abaixo de cada H1/H2, que é o formato que o Google usa
 * para montar destaque/rich result.
 *
 * REGRA: todo número aqui sai de dados.js. Nada de estatística inventada sobre
 * resultado de aluno -- ver .claude/agents/marketing-petrobras.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTEUDOS, SEMANAS_PLANO, META_HORAS_SEMANA } from '../dados.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');
const SAIDA = path.join(RAIZ, 'public', 'estudar');
const SITE = 'https://www.petrobrasacademy.com.br';

const TOTAL_QUESTOES = CONTEUDOS.reduce((t, m) => t + m.questoes, 0);
const TOTAL_HORAS = SEMANAS_PLANO * META_HORAS_SEMANA;

/* --------------------------------------------------------------- utilidades */

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const slug = (s) => s
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^\w\s-]/g, '').trim().toLowerCase()
  .replace(/\s+/g, '-').replace(/-+/g, '-');

const pct = (n) => Math.round((n / TOTAL_QUESTOES) * 100);

// Incidência do grupo dentro da matéria, derivada de exercicios_sugeridos --
// o mesmo critério usado no cronograma de 16 semanas.
function incidencia(grupo, materia) {
  const pesos = materia.grupos.map(g => g.exercicios_sugeridos || 1);
  const max = Math.max(...pesos);
  const p = grupo.exercicios_sugeridos || 1;
  if (p >= max * 0.8) return { nivel: 'alta', rotulo: 'Alta incidência' };
  if (p >= max * 0.5) return { nivel: 'media', rotulo: 'Média incidência' };
  return { nivel: 'baixa', rotulo: 'Baixa incidência' };
}

/* -------------------------------------------------------------------- layout */

const CSS = `
:root{--paper:#EFF1F0;--surface:#fff;--surface-2:#E5E9E8;--ink:#141B20;--ink-2:#45555C;
--ink-3:#6E8189;--rule:#C7D0CE;--accent:#1F5C63;--accent-ink:#fff;--accent-fraco:#DDE8E7;
--alta:#A8321E;--media:#8A6210;--baixa:#5C6E75;
--f-tit:"Bahnschrift SemiCondensed",Bahnschrift,"Segoe UI Semibold","Segoe UI",system-ui,sans-serif;
--f-corpo:"Segoe UI",-apple-system,system-ui,sans-serif;
--f-dado:"Cascadia Mono",Consolas,ui-monospace,monospace}
@media(prefers-color-scheme:dark){:root{--paper:#0E1417;--surface:#151D21;--surface-2:#1D272B;
--ink:#E7EDEB;--ink-2:#A6B5B8;--ink-3:#7C8E92;--rule:#2B373B;--accent:#63C2C6;--accent-ink:#0E1417;
--accent-fraco:#17282B;--alta:#E9775F;--media:#DCB055;--baixa:#90A2A7}}
*{box-sizing:border-box}
body{margin:0;padding:0 20px 80px;background:var(--paper);color:var(--ink);
font:16px/1.65 var(--f-corpo);-webkit-font-smoothing:antialiased}
.wrap{max-width:760px;margin:0 auto}
a{color:var(--accent)}
nav.trilha{font:12px/1.4 var(--f-dado);letter-spacing:.06em;text-transform:uppercase;
color:var(--ink-3);padding:24px 0 0}
nav.trilha a{color:var(--ink-3)}
h1{font-family:var(--f-tit);font-weight:600;font-size:clamp(1.9rem,5vw,2.9rem);line-height:1.05;
letter-spacing:-.015em;margin:14px 0 16px;text-wrap:balance}
h2{font-family:var(--f-tit);font-weight:600;font-size:1.45rem;line-height:1.15;margin:44px 0 10px;
padding-bottom:8px;border-bottom:1px solid var(--rule);text-wrap:balance}
h3{font-size:1.05rem;margin:26px 0 6px}
p{margin:0 0 15px}
.resposta{font-size:1.08rem;color:var(--ink);background:var(--accent-fraco);
border-left:3px solid var(--accent);padding:14px 16px;margin:0 0 22px}
.selo{display:inline-block;font:600 11px/1 var(--f-dado);letter-spacing:.1em;text-transform:uppercase;
padding:6px 9px;border-radius:2px;color:#fff;margin-bottom:6px}
.selo.alta{background:var(--alta)}.selo.media{background:var(--media)}
.selo.baixa{background:var(--baixa)}
table{width:100%;border-collapse:collapse;font-size:.92rem;margin:0 0 24px;
background:var(--surface);border:1px solid var(--rule)}
th,td{padding:10px 13px;text-align:left;border-bottom:1px solid var(--rule);vertical-align:top}
th{background:var(--surface-2);font:600 11px/1.3 var(--f-dado);letter-spacing:.09em;
text-transform:uppercase;color:var(--ink-2)}
tr:last-child td{border-bottom:0}
ul{padding-left:20px;margin:0 0 20px}li{margin-bottom:7px}
.cta{display:block;background:var(--accent);color:var(--accent-ink);padding:22px;margin:44px 0;
border-radius:3px;text-decoration:none}
.cta strong{display:block;font-family:var(--f-tit);font-size:1.3rem;margin-bottom:6px}
.cta span{opacity:.9;font-size:.95rem}
.relacionados{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;
margin:0 0 24px;padding:0;list-style:none}
.relacionados li{margin:0}
.relacionados a{display:block;background:var(--surface);border:1px solid var(--rule);
padding:12px 14px;text-decoration:none;font-size:.92rem;border-radius:3px}
footer{margin-top:56px;padding-top:20px;border-top:1px solid var(--rule);
color:var(--ink-3);font-size:.85rem}
`;

function pagina({ titulo, descricao, url, corpo, jsonld }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="pt_BR">
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
<div class="wrap">
${corpo}
<footer>
  <p><a href="/estudar/">Todas as matérias</a> · <a href="/">Petrobras Academy</a></p>
  <p>Conteúdo programático de Técnico(a) de Química — banca Cesgranrio.
  Distribuição de questões conforme o mapeamento da plataforma.</p>
</footer>
</div>
</body>
</html>
`;
}

function breadcrumb(itens) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.nome, item: it.url
    }))
  };
}

function faqLd(perguntas) {
  return {
    '@type': 'FAQPage',
    mainEntity: perguntas.map(q => ({
      '@type': 'Question', name: q.p,
      acceptedAnswer: { '@type': 'Answer', text: q.r }
    }))
  };
}

const CTA = `<a class="cta" href="/">
  <strong>Monte esse plano em minutos, não em semanas</strong>
  <span>Cronograma de ${SEMANAS_PLANO} semanas com revisão espaçada, ciclo ponderado por peso de matéria e caderno de erros. Comece de graça.</span>
</a>`;

/* --------------------------------------------------------------- páginas */

const urls = [];

function grava(rel, html, prioridade) {
  const destino = path.join(SAIDA, rel);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html, 'utf8');

  // O sitemap tem que listar a MESMA url que a tag canonical da página, senão o
  // Search Console acusa canônica duplicada. Páginas de índice são servidas em
  // /estudar/ e /estudar/materia/ -- sem o "index.html".
  const publico = rel.replace(/\\/g, '/').replace(/index\.html$/, '');
  urls.push({ loc: `${SITE}/estudar/${publico}`, prioridade });
}

function paginaGrupo(materia, grupo, irmaos) {
  const inc = incidencia(grupo, materia);
  const mSlug = slug(materia.nome.replace(/[^\w\sÀ-ú-]/g, ''));
  const gSlug = slug(grupo.nome);
  const rel = `${mSlug}/${gSlug}.html`;
  const url = `${SITE}/estudar/${rel}`;
  const titulo = `${grupo.nome} — como cai no concurso Petrobras | Técnico de Química`;
  const nTopicos = grupo.topicos.length;

  const descricao = `${grupo.nome} em ${materia.nome} para o concurso Petrobras `
    + `(Técnico de Química, banca Cesgranrio): ${nTopicos} tópicos do conteúdo `
    + `programático e o peso da matéria na prova.`;

  const faq = [
    {
      p: `${grupo.nome} cai no concurso Petrobras?`,
      r: `Sim. ${grupo.nome} faz parte de ${materia.nome}, que vale ${materia.questoes} das `
        + `${TOTAL_QUESTOES} questões da prova (${pct(materia.questoes)}%). Dentro da matéria, `
        + `o tópico é de ${inc.rotulo.toLowerCase()}.`
    },
    {
      p: `Quantos tópicos de ${grupo.nome} preciso estudar?`,
      r: `O conteúdo programático mapeado tem ${nTopicos} tópicos em ${grupo.nome}. `
        + `A lista completa está nesta página.`
    },
    {
      p: `Quanto tempo dedicar a ${grupo.nome}?`,
      r: `No plano de ${SEMANAS_PLANO} semanas (${TOTAL_HORAS} horas), o tempo de cada tópico é `
        + `proporcional ao peso dele na prova, e não dividido igualmente entre as matérias.`
    }
  ];

  const corpo = `
<nav class="trilha"><a href="/estudar/">Estudar</a> ›
  <a href="/estudar/${mSlug}/">${esc(materia.nome)}</a> › ${esc(grupo.nome)}</nav>
<span class="selo ${inc.nivel}">${inc.rotulo}</span>
<h1>${esc(grupo.nome)}: como cai no concurso Petrobras</h1>

<p class="resposta"><strong>${esc(grupo.nome)}</strong> é um dos tópicos de
${esc(materia.nome)}, matéria que vale <strong>${materia.questoes} das ${TOTAL_QUESTOES}
questões</strong> da prova de Técnico(a) de Química (${pct(materia.questoes)}% do total).
São <strong>${nTopicos} tópicos</strong> do conteúdo programático, listados abaixo.</p>

<h2>O que o edital cobra em ${esc(grupo.nome)}</h2>
<p>Estes são os ${nTopicos} tópicos mapeados. Cada um vira um item verificável do seu
checklist — em vez de "estudar ${esc(grupo.nome.toLowerCase())}", que é vago demais para
virar tarefa de um dia.</p>
<ul>${grupo.topicos.map(t => `<li>${esc(t)}</li>`).join('')}</ul>

<h2>Quanto peso dar a este tópico</h2>
<p>A resposta curta: proporcional ao que ele vale na prova, não ao quanto você gosta dele.
${esc(materia.nome)} concentra ${pct(materia.questoes)}% das questões, e dentro dela
${esc(grupo.nome)} é de <strong>${inc.rotulo.toLowerCase()}</strong>.</p>
<table>
  <tr><th>Matéria</th><td>${esc(materia.nome)}</td></tr>
  <tr><th>Questões da matéria</th><td>${materia.questoes} de ${TOTAL_QUESTOES} (${pct(materia.questoes)}%)</td></tr>
  <tr><th>Incidência do tópico</th><td>${inc.rotulo}</td></tr>
  <tr><th>Tópicos mapeados</th><td>${nTopicos}</td></tr>
</table>

${CTA}

<h2>Perguntas frequentes</h2>
${faq.map(q => `<h3>${esc(q.p)}</h3><p>${esc(q.r)}</p>`).join('')}

<h2>Outros tópicos de ${esc(materia.nome)}</h2>
<ul class="relacionados">${irmaos.filter(g => g.nome !== grupo.nome).slice(0, 8)
  .map(g => `<li><a href="/estudar/${mSlug}/${slug(g.nome)}.html">${esc(g.nome)}</a></li>`).join('')}</ul>
`;

  grava(rel, pagina({
    titulo, descricao, url, corpo,
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        breadcrumb([
          { nome: 'Estudar', url: `${SITE}/estudar/` },
          { nome: materia.nome, url: `${SITE}/estudar/${mSlug}/` },
          { nome: grupo.nome, url }
        ]),
        faqLd(faq)
      ]
    }
  }), inc.nivel === 'alta' ? '0.8' : '0.6');
}

function paginaMateria(materia) {
  const mSlug = slug(materia.nome.replace(/[^\w\sÀ-ú-]/g, ''));
  const rel = `${mSlug}/index.html`;
  const url = `${SITE}/estudar/${mSlug}/`;
  const nTopicos = materia.grupos.reduce((t, g) => t + g.topicos.length, 0);
  const titulo = `${materia.nome} no concurso Petrobras: o que cai | Técnico de Química`;
  const descricao = `${materia.nome} vale ${materia.questoes} das ${TOTAL_QUESTOES} questões `
    + `(${pct(materia.questoes)}%) no concurso Petrobras Técnico de Química. `
    + `${materia.grupos.length} tópicos do edital, com incidência de cada um.`;

  const faq = [
    {
      p: `Quantas questões de ${materia.nome} caem na prova?`,
      r: `${materia.questoes} das ${TOTAL_QUESTOES} questões, ou ${pct(materia.questoes)}% da prova `
        + `de Técnico(a) de Química da Petrobras.`
    },
    {
      p: `Por onde começar a estudar ${materia.nome}?`,
      r: `Pelos tópicos de alta incidência. Nesta matéria eles são: `
        + materia.grupos.filter(g => incidencia(g, materia).nivel === 'alta')
            .map(g => g.nome).join(', ') + '.'
    }
  ];

  const linhas = materia.grupos.map(g => {
    const inc = incidencia(g, materia);
    return `<tr><td><a href="/estudar/${mSlug}/${slug(g.nome)}.html">${esc(g.nome)}</a></td>`
      + `<td><span class="selo ${inc.nivel}">${inc.rotulo.replace(' incidência', '')}</span></td>`
      + `<td>${g.topicos.length}</td></tr>`;
  }).join('');

  const corpo = `
<nav class="trilha"><a href="/estudar/">Estudar</a> › ${esc(materia.nome)}</nav>
<h1>${esc(materia.nome)} no concurso Petrobras</h1>

<p class="resposta"><strong>${esc(materia.nome)}</strong> vale
<strong>${materia.questoes} das ${TOTAL_QUESTOES} questões</strong> da prova de
Técnico(a) de Química (${pct(materia.questoes)}% do total), distribuídas em
<strong>${materia.grupos.length} tópicos</strong> e ${nTopicos} subtópicos do
conteúdo programático.</p>

<h2>Todos os tópicos, por incidência</h2>
<p>A coluna de incidência indica o peso relativo dentro da matéria — é por ela que
você decide o que estudar primeiro quando o tempo aperta.</p>
<table>
  <thead><tr><th>Tópico</th><th>Incidência</th><th>Subtópicos</th></tr></thead>
  <tbody>${linhas}</tbody>
</table>

${CTA}

<h2>Perguntas frequentes</h2>
${faq.map(q => `<h3>${esc(q.p)}</h3><p>${esc(q.r)}</p>`).join('')}

<h2>Outras matérias da prova</h2>
<ul class="relacionados">${CONTEUDOS.filter(m => m.id !== materia.id)
  .map(m => `<li><a href="/estudar/${slug(m.nome.replace(/[^\w\sÀ-ú-]/g, ''))}/">`
    + `${esc(m.nome)} — ${m.questoes} questões</a></li>`).join('')}</ul>
`;

  grava(rel, pagina({
    titulo, descricao, url, corpo,
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        breadcrumb([
          { nome: 'Estudar', url: `${SITE}/estudar/` },
          { nome: materia.nome, url }
        ]),
        faqLd(faq)
      ]
    }
  }), '0.9');

  materia.grupos.forEach(g => paginaGrupo(materia, g, materia.grupos));
}

function paginaIndice() {
  const url = `${SITE}/estudar/`;
  const totalGrupos = CONTEUDOS.reduce((t, m) => t + m.grupos.length, 0);
  const totalTopicos = CONTEUDOS.reduce((t, m) =>
    t + m.grupos.reduce((s, g) => s + g.topicos.length, 0), 0);

  const linhas = CONTEUDOS.map(m => {
    const s = slug(m.nome.replace(/[^\w\sÀ-ú-]/g, ''));
    return `<tr><td><a href="/estudar/${s}/">${esc(m.nome)}</a></td>`
      + `<td>${m.questoes}</td><td>${pct(m.questoes)}%</td><td>${m.grupos.length}</td></tr>`;
  }).join('');

  const faq = [
    {
      p: 'Quantas questões tem a prova de Técnico de Química da Petrobras?',
      r: `${TOTAL_QUESTOES} questões, distribuídas em ${CONTEUDOS.length} matérias: `
        + CONTEUDOS.map(m => `${m.nome} (${m.questoes})`).join(', ') + '.'
    },
    {
      p: 'Qual matéria mais cai no concurso Petrobras Técnico de Química?',
      r: (() => {
        const top = [...CONTEUDOS].sort((a, b) => b.questoes - a.questoes)[0];
        return `${top.nome}, com ${top.questoes} das ${TOTAL_QUESTOES} questões `
          + `(${pct(top.questoes)}% da prova) — quase metade do total.`;
      })()
    },
    {
      p: 'Quanto tempo preciso estudar para o concurso Petrobras?',
      r: `O plano de referência da plataforma é de ${SEMANAS_PLANO} semanas a `
        + `${META_HORAS_SEMANA} horas semanais, somando ${TOTAL_HORAS} horas.`
    }
  ];

  const corpo = `
<nav class="trilha">Estudar</nav>
<h1>O que cai no concurso Petrobras — Técnico de Química</h1>

<p class="resposta">A prova tem <strong>${TOTAL_QUESTOES} questões</strong> em
${CONTEUDOS.length} matérias, com <strong>${totalGrupos} tópicos</strong> e
${totalTopicos} subtópicos no conteúdo programático. Abaixo, o peso real de cada
matéria — e é esse peso que deve definir quanto tempo cada uma recebe.</p>

<h2>Distribuição das ${TOTAL_QUESTOES} questões</h2>
<table>
  <thead><tr><th>Matéria</th><th>Questões</th><th>% da prova</th><th>Tópicos</th></tr></thead>
  <tbody>${linhas}</tbody>
</table>

<h2>Por que estudar por peso muda o resultado</h2>
<p>A distribuição acima não é uniforme, mas a maioria dos cronogramas trata as matérias
como se fosse. Dar a mesma carga horária para uma matéria de
${Math.min(...CONTEUDOS.map(m => m.questoes))} questões e para outra de
${Math.max(...CONTEUDOS.map(m => m.questoes))} é jogar fora as horas em que você
mais podia pontuar.</p>

${CTA}

<h2>Perguntas frequentes</h2>
${faq.map(q => `<h3>${esc(q.p)}</h3><p>${esc(q.r)}</p>`).join('')}
`;

  grava('index.html', pagina({
    titulo: `O que cai no concurso Petrobras Técnico de Química — ${TOTAL_QUESTOES} questões mapeadas`,
    descricao: `As ${TOTAL_QUESTOES} questões da prova de Técnico(a) de Química da Petrobras `
      + `(Cesgranrio), matéria por matéria, com o peso real de cada uma e ${totalGrupos} tópicos do edital.`,
    url, corpo,
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        breadcrumb([{ nome: 'Estudar', url }]),
        faqLd(faq)
      ]
    }
  }), '0.9');
}

function gerarSitemap() {
  const hoje = new Date().toISOString().slice(0, 10);
  const entradas = [
    `  <url>\n    <loc>${SITE}/</loc>\n    <lastmod>${hoje}</lastmod>\n`
      + `    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ...urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${hoje}</lastmod>\n`
      + `    <changefreq>monthly</changefreq>\n    <priority>${u.prioridade}</priority>\n  </url>`)
  ];
  fs.writeFileSync(
    path.join(RAIZ, 'public', 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n`
    + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entradas.join('\n')}\n</urlset>\n`,
    'utf8'
  );
}

fs.rmSync(SAIDA, { recursive: true, force: true });
paginaIndice();
CONTEUDOS.forEach(paginaMateria);
gerarSitemap();

console.log(`OK  ${urls.length} páginas em public/estudar/`);
console.log(`OK  sitemap.xml com ${urls.length + 1} urls`);
