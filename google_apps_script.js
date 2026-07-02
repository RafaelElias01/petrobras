// ============================================================
// REGISTRO DE RECUSAS — Google Apps Script
// ============================================================

const MOTIVOS = [
  "Alteração laboratorial","Alteração morfológica","Alterações no tecido",
  "Antecedentes mórbidos","Cardiopatia - coronariopatia",
  "Cardiopatia - hipertensão arterial","Cardiopatia - miocardiopatia",
  "Cardiopatia - valvulopatia","Condições do Doador","Diabetes",
  "Distância","Droga vasopressora","Falta de cateterismo/eco","Idade",
  "Infecção","Instabilidade hemodinâmica","Lesão do órgão",
  "Má perfusão do órgão","Não ofertado","Preservação inadequada do órgão",
  "Ranking esgotado","SARS-CoV-2 Positivo","Sem equipe para transplante",
  "Sem receptores","Sorologia - Chagas","Sorologia - Hepatite B",
  "Sorologia - Hepatite C","Sorologia - HTLV I/II","Sorologia - Sífilis",
  "Sorologia - Toxoplasmose/Citomegalovirus","Sorologia não realizada",
  "Tamanho ou Peso","Tempo de isquemia fria",
  "Tempo prolongado de intubação/internação","Usuário de droga injetável",
  "Utilizado para pesquisa","Utilizado para transplante de ilhotas",
  "Utilizado para valvas cardíacas","Utilizado parente/cônjuge",
];

// ── Menu ─────────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚕ RECUSAS")
    .addItem("📋 Configurar aba RECUSAS", "montarAbaRecusas")
    .addSeparator()
    .addItem("➕ Registrar recusa", "abrirFormulario")
    .addToUi();
}

// ── Monta a aba RECUSAS ──────────────────────────────────────
// Estrutura (8 colunas, A-H):
//   A-D : OLHO DIREITO  → RGCT | NOME | MOTIVO DE RECUSA | EQUIPE
//   E-H : OLHO ESQUERDO → RGCT | NOME | MOTIVO DE RECUSA | EQUIPE
function montarAbaRecusas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let ws = ss.getSheetByName("RECUSAS");
  if (!ws) {
    ws = ss.insertSheet("RECUSAS");
    ws.setTabColor("#C00000");
  } else {
    ws.clearContents();
    ws.clearFormats();
  }

  // Linha 1 — título geral
  ws.getRange("A1:H1").merge()
    .setValue("RECUSAS DE CÓRNEAS")
    .setBackground("#C00000").setFontColor("#FFFFFF")
    .setFontWeight("bold").setFontSize(13)
    .setHorizontalAlignment("center");
  ws.setRowHeight(1, 32);

  // Linha 2 — subtítulos OD / OE
  ws.getRange("A2:D2").merge()
    .setValue("OLHO DIREITO")
    .setBackground("#1F4E79").setFontColor("#FFFFFF")
    .setFontWeight("bold").setFontSize(11)
    .setHorizontalAlignment("center");

  ws.getRange("E2:H2").merge()
    .setValue("OLHO ESQUERDO")
    .setBackground("#2E75B6").setFontColor("#FFFFFF")
    .setFontWeight("bold").setFontSize(11)
    .setHorizontalAlignment("center");
  ws.setRowHeight(2, 26);

  // Linha 3 — cabeçalhos das colunas
  const CABS = [
    "RGCT","NOME","MOTIVO DE RECUSA","EQUIPE",   // OD
    "RGCT","NOME","MOTIVO DE RECUSA","EQUIPE",   // OE
  ];
  const CORES = [
    "#244F7A","#244F7A","#C00000","#2E75B6",
    "#1A3A5C","#1A3A5C","#9B0000","#1F5C96",
  ];
  CABS.forEach((nome, i) => {
    ws.getRange(3, i + 1)
      .setValue(nome)
      .setBackground(CORES[i]).setFontColor("#FFFFFF")
      .setFontWeight("bold").setHorizontalAlignment("center");
  });
  ws.setRowHeight(3, 22);

  // Larguras
  [13, 22, 36, 28, 13, 22, 36, 28].forEach((w, i) =>
    ws.setColumnWidth(i + 1, w * 7));

  ws.setFrozenRows(3);

  SpreadsheetApp.getUi().alert(
    "✔ Aba RECUSAS montada!\n\n" +
    "Colunas A-D: OLHO DIREITO\n" +
    "Colunas E-H: OLHO ESQUERDO\n\n" +
    "Cada bloco: RGCT | NOME | MOTIVO | EQUIPE\n\n" +
    "Use ⚕ RECUSAS → Registrar recusa para adicionar."
  );
}

// ── Abre o formulário popup ───────────────────────────────────
function abrirFormulario() {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const wsEq = ss.getSheetByName("EQUIPES");
  const equipes = wsEq
    ? wsEq.getRange(3, 1, Math.max(wsEq.getLastRow() - 2, 1), 1)
           .getValues().flat().filter(String)
    : [];

  const html = HtmlService.createHtmlOutput(formHtml(equipes))
    .setWidth(500).setHeight(560);

  SpreadsheetApp.getUi().showModalDialog(html, "Registrar Recusa");
}

// ── Salva a recusa na aba RECUSAS ────────────────────────────
function salvarRecusa(dados) {
  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  let wsRec = ss.getSheetByName("RECUSAS");
  if (!wsRec) { montarAbaRecusas(); wsRec = ss.getSheetByName("RECUSAS"); }

  const proxima = Math.max(wsRec.getLastRow() + 1, 4);

  wsRec.getRange(proxima, 1, 1, 8).setValues([[
    dados.rgct_od, dados.nome_od, dados.mr_od, dados.eq_od,
    dados.rgct_oe, dados.nome_oe, dados.mr_oe, dados.eq_oe,
  ]]);

  const bg = proxima % 2 === 0 ? "#EBF3FB" : "#FFFFFF";
  wsRec.getRange(proxima, 1, 1, 8).setBackground(bg);
}

// ── HTML do formulário ───────────────────────────────────────
function formHtml(equipes) {
  const opEq = equipes.map(e => `<option value="${e}">${e}</option>`).join("");
  const opMR = MOTIVOS.map(m => `<option value="${m}">${m}</option>`).join("");

  return `
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; padding: 14px; margin: 0; }
  h3 { margin: 0 0 8px; padding: 6px 10px; color: #fff; border-radius: 4px; font-size: 13px; }
  .od { background: #1F4E79; }
  .oe { background: #2E75B6; }
  .bloco { border: 1px solid #ccc; border-radius: 6px; padding: 10px; margin-bottom: 12px; }
  label { display: block; margin-top: 8px; font-weight: bold; color: #333; font-size: 12px; }
  input, select { width: 100%; padding: 5px; margin-top: 3px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; }
  .row2 { display: flex; gap: 8px; }
  .row2 > div { flex: 1; }
  button {
    margin-top: 12px; width: 100%; padding: 10px;
    background: #C00000; color: #fff; border: none;
    border-radius: 4px; font-size: 14px; font-weight: bold; cursor: pointer;
  }
  button:hover { background: #9B0000; }
</style>

<div class="bloco">
  <h3 class="od">👁 OLHO DIREITO</h3>
  <div class="row2">
    <div><label>RGCT</label><input id="rgct_od" placeholder="Ex: 510686-143"></div>
    <div><label>NOME</label><input id="nome_od" placeholder="Nome do doador"></div>
  </div>
  <label>MOTIVO DE RECUSA</label>
  <select id="mr_od"><option value="">— selecione —</option>${opMR}</select>
  <label>EQUIPE</label>
  <select id="eq_od"><option value="">— selecione (opcional) —</option>${opEq}</select>
</div>

<div class="bloco">
  <h3 class="oe">👁 OLHO ESQUERDO</h3>
  <div class="row2">
    <div><label>RGCT</label><input id="rgct_oe" placeholder="Ex: 510686-143"></div>
    <div><label>NOME</label><input id="nome_oe" placeholder="Nome do doador"></div>
  </div>
  <label>MOTIVO DE RECUSA</label>
  <select id="mr_oe"><option value="">— selecione —</option>${opMR}</select>
  <label>EQUIPE</label>
  <select id="eq_oe"><option value="">— selecione (opcional) —</option>${opEq}</select>
</div>

<button onclick="enviar()">REGISTRAR RECUSA</button>

<script>
function g(id) { return document.getElementById(id).value.trim(); }

function enviar() {
  var od_ok = g('rgct_od') && g('mr_od');
  var oe_ok = g('rgct_oe') && g('mr_oe');
  if (!od_ok && !oe_ok) {
    alert('Preencha ao menos um olho (RGCT + Motivo).');
    return;
  }
  var dados = {
    rgct_od: g('rgct_od'), nome_od: g('nome_od'),
    mr_od:   g('mr_od'),   eq_od:   g('eq_od'),
    rgct_oe: g('rgct_oe'), nome_oe: g('nome_oe'),
    mr_oe:   g('mr_oe'),   eq_oe:   g('eq_oe'),
  };
  var btn = document.querySelector('button');
  btn.textContent = 'Salvando...';
  google.script.run
    .withSuccessHandler(function() {
      btn.textContent = '✔ Salvo!';
      btn.style.background = '#107c41';
      setTimeout(resetForm, 1400);
    })
    .salvarRecusa(dados);
}

function resetForm() {
  ['rgct_od','nome_od','mr_od','eq_od','rgct_oe','nome_oe','mr_oe','eq_oe']
    .forEach(function(id){ document.getElementById(id).value = ''; });
  var btn = document.querySelector('button');
  btn.textContent = 'REGISTRAR RECUSA';
  btn.style.background = '#C00000';
}
<\/script>`;
}
