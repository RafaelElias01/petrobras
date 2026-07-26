/**
 * Gera a versão para impressão (A4) do cronograma a partir do markdown.
 *
 *   node planos/build-impresso.js
 *
 * Saída: planos/cronograma-16-semanas-impresso.html — abrir no navegador e Ctrl+P.
 * O CSS é otimizado para papel: sem tema escuro, uma semana por página,
 * cabeçalho de tabela repetido a cada quebra e badges de incidência que
 * continuam legíveis em impressão preto e branco.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

// O package.json da raiz declara "type": "module", então este arquivo é ESM
// e não tem __dirname — daí o fileURLToPath.
const AQUI = path.dirname(fileURLToPath(import.meta.url));

const ORIGEM = path.join(AQUI, 'cronograma-16-semanas-completo.md');
// Fica em planos/ de propósito, não em public/: public/ é copiado para dist/ e
// iria ao ar em produção, e o cronograma completo é conteúdo do produto.
// scanDir do /api/planos só lista .md, então o .html não polui a lista do app.
const DESTINO = path.join(AQUI, 'cronograma-16-semanas-impresso.html');

// Emoji imprime como bolinha cinza indistinguível em B&W. Vira badge com letra.
const BADGES = [
  [/🔴/g, '<span class="inc inc-a" title="Alta incidência">A</span>'],
  [/🟠/g, '<span class="inc inc-m" title="Média incidência">M</span>'],
  [/🟡/g, '<span class="inc inc-b" title="Baixa incidência">B</span>']
];

const CSS = `
  @page { size: A4 portrait; margin: 14mm 12mm 16mm; }

  :root { --tinta: #111; --fraca: #666; --linha: #bbb; --zebra: #f4f4f4; }

  * { box-sizing: border-box; }

  body {
    font: 10pt/1.45 "Segoe UI", Calibri, system-ui, sans-serif;
    color: var(--tinta);
    background: #fff;
    max-width: 190mm;
    margin: 0 auto;
    padding: 8mm;
  }

  h1 {
    font-size: 20pt;
    line-height: 1.15;
    margin: 0 0 2mm;
    border-bottom: 2.5pt solid var(--tinta);
    padding-bottom: 2mm;
  }
  h2 {
    font-size: 14pt;
    margin: 0 0 4mm;
    padding-bottom: 1.5mm;
    border-bottom: 1pt solid var(--linha);
    page-break-before: always;
    page-break-after: avoid;
  }
  h3 {
    font-size: 11.5pt;
    margin: 6mm 0 2.5mm;
    padding: 1.5mm 2.5mm;
    background: #ececec;
    border-left: 3pt solid var(--tinta);
    page-break-after: avoid;
  }
  /* Cada SEMANA começa em página nova; as demais h3 seguem o fluxo. */
  h3.semana { page-break-before: always; }
  h1 + p, h2 + p, h3 + p { margin-top: 0; }

  p, li { orphans: 3; widows: 3; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 5mm;
    font-size: 8.5pt;
    page-break-inside: auto;
  }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; page-break-after: auto; }
  th, td {
    border: 0.5pt solid var(--linha);
    padding: 1.4mm 2mm;
    text-align: left;
    vertical-align: top;
  }
  th { background: #e4e4e4; font-weight: 700; }
  tbody tr:nth-child(even) td { background: var(--zebra); }
  /* Coluna do dia da semana: estreita e destacada. */
  td:first-child { white-space: nowrap; font-weight: 700; width: 16mm; }

  blockquote {
    margin: 0 0 5mm;
    padding: 2mm 3mm;
    border-left: 2.5pt solid var(--fraca);
    background: #f7f7f7;
    font-size: 9pt;
    page-break-inside: avoid;
  }
  blockquote p { margin: 0; }

  ol, ul { margin: 0 0 5mm; padding-left: 6mm; }
  li { margin-bottom: 1.5mm; }

  code {
    font: 8.5pt "Consolas", monospace;
    background: #eee;
    padding: 0 1mm;
    border-radius: 1pt;
  }

  hr { display: none; }

  /* Badges de incidência — leem em cores e em preto e branco. */
  .inc {
    display: inline-block;
    min-width: 4.2mm;
    padding: 0 0.6mm;
    margin-right: 0.8mm;
    font-size: 7pt;
    font-weight: 700;
    text-align: center;
    line-height: 4.2mm;
    border-radius: 50%;
    border: 0.7pt solid var(--tinta);
  }
  .inc-a { background: #000; color: #fff; }
  .inc-m { background: #9a9a9a; color: #fff; }
  .inc-b { background: #fff; color: #000; }

  /* Barra de ajuda: só na tela, nunca no papel. */
  .dica-impressao {
    margin: 0 0 6mm;
    padding: 3mm 4mm;
    background: #fff8e1;
    border: 1pt solid #e0c060;
    border-radius: 2pt;
    font-size: 9.5pt;
  }
  @media print { .dica-impressao { display: none; } }
`;

function build() {
  let md = fs.readFileSync(ORIGEM, 'utf8');

  marked.setOptions({ gfm: true, breaks: false });
  let corpo = marked.parse(md);

  for (const [de, para] of BADGES) corpo = corpo.replace(de, para);

  // Marca só os h3 de semana, para que a quebra de página caia neles e não
  // nas subseções ("Como usar cada bloco", "Legenda de incidência", ...).
  corpo = corpo.replace(
    /<h3([^>]*)>(SEMANA \d+)/g,
    '<h3$1 class="semana">$2'
  );

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cronograma 16 Semanas — Petrobras Técnico de Química</title>
<style>${CSS}</style>
</head>
<body>
<div class="dica-impressao">
  <strong>Para imprimir:</strong> Ctrl+P → papel A4, orientação retrato, margens
  padrão e <strong>marque "Gráficos de segundo plano"</strong> (senão os cabeçalhos
  de tabela e os badges de incidência saem em branco). Para salvar em PDF, escolha
  "Microsoft Print to PDF" ou "Salvar como PDF" na lista de impressoras.
  Esta caixa não sai na impressão.
</div>
${corpo}
</body>
</html>
`;

  fs.mkdirSync(path.dirname(DESTINO), { recursive: true });
  fs.writeFileSync(DESTINO, html, 'utf8');

  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(0);
  console.log(`OK  ${path.relative(process.cwd(), DESTINO)}  (${kb} KB)`);
}

build();
