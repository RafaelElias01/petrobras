// ============================================================
// REGISTRO DE RECUSAS — Google Apps Script
// Menu: ⚕ RECUSAS → Registrar Recusa
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

// ── Abre o formulário popup ───────────────────────────────────
function abrirFormulario() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const wsEq  = ss.getSheetByName("EQUIPES");
  const equipes = wsEq
    ? wsEq.getRange(3, 1, Math.max(wsEq.getLastRow() - 2, 1), 1)
           .getValues().flat().filter(String)
    : [];

  const html = HtmlService.createHtmlOutput(formHtml(equipes))
    .setWidth(440)
    .setHeight(420);

  SpreadsheetApp.getUi().showModalDialog(html, "Registrar Recusa");
}

// ── Salva a recusa na aba RECUSAS ────────────────────────────
function salvarRecusa(dados) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   wsRec = ss.getSheetByName("RECUSAS");
  if (!wsRec) montarAbaRecusas();
  wsRec = ss.getSheetByName("RECUSAS");

  const proxima = Math.max(wsRec.getLastRow() + 1, 3);
  wsRec.getRange(proxima, 1, 1, 5).setValues([[
    dados.rgct,
    dados.nome,
    dados.olho,
    dados.mr,
    dados.equipe
  ]]);

  // Fundo alternado para facilitar leitura
  const bg = proxima % 2 === 0 ? "#FFF2CC" : "#FFFFFF";
  wsRec.getRange(proxima, 1, 1, 5).setBackground(bg);
}

// ── Monta a aba RECUSAS ──────────────────────────────────────
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

  ws.getRange("A1:E1").merge()
    .setValue("RECUSAS DE CÓRNEAS")
    .setBackground("#C00000").setFontColor("#FFFFFF")
    .setFontWeight("bold").setFontSize(13)
    .setHorizontalAlignment("center");
  ws.setRowHeight(1, 32);

  const CABS  = ["RGCT","NOME","OLHO","MOTIVO DE RECUSA","EQUIPE"];
  const CORES = ["#1F4E79","#1F4E79","#1F4E79","#C00000","#2E75B6"];
  CABS.forEach((nome, i) => {
    ws.getRange(2, i + 1)
      .setValue(nome)
      .setBackground(CORES[i]).setFontColor("#FFFFFF")
      .setFontWeight("bold").setHorizontalAlignment("center");
  });
  ws.setRowHeight(2, 24);

  [14, 20, 8, 38, 30].forEach((w, i) => ws.setColumnWidth(i + 1, w * 7));
  ws.setFrozenRows(2);
}

// ── HTML do formulário ───────────────────────────────────────
function formHtml(equipes) {
  const opcoesEq = equipes.map(e =>
    `<option value="${e}">${e}</option>`).join("");

  const opcoesMR = MOTIVOS.map(m =>
    `<option value="${m}">${m}</option>`).join("");

  return `
<style>
  body { font-family: Arial, sans-serif; font-size: 13px; padding: 16px; }
  label { display: block; margin-top: 10px; font-weight: bold; color: #1F4E79; }
  input, select {
    width: 100%; padding: 6px; margin-top: 4px;
    border: 1px solid #ccc; border-radius: 4px; font-size: 13px;
  }
  .row2 { display: flex; gap: 10px; }
  .row2 > div { flex: 1; }
  button {
    margin-top: 18px; width: 100%; padding: 10px;
    background: #C00000; color: #fff; border: none;
    border-radius: 4px; font-size: 14px; font-weight: bold; cursor: pointer;
  }
  button:hover { background: #9B0000; }
</style>

<div class="row2">
  <div>
    <label>RGCT</label>
    <input id="rgct" type="text" placeholder="Ex: 510686-143">
  </div>
  <div>
    <label>NOME</label>
    <input id="nome" type="text" placeholder="Nome do doador">
  </div>
</div>

<label>OLHO</label>
<select id="olho">
  <option value="">— selecione —</option>
  <option value="OD">OD — Olho Direito</option>
  <option value="OE">OE — Olho Esquerdo</option>
</select>

<label>MOTIVO DE RECUSA</label>
<select id="mr">
  <option value="">— selecione —</option>
  ${opcoesMR}
</select>

<label>EQUIPE</label>
<select id="equipe">
  <option value="">— selecione (opcional) —</option>
  ${opcoesEq}
</select>

<button onclick="enviar()">REGISTRAR RECUSA</button>

<script>
function enviar() {
  var rgct     = document.getElementById('rgct').value.trim();
  var nome     = document.getElementById('nome').value.trim();
  var olho     = document.getElementById('olho').value;
  var mr       = document.getElementById('mr').value;
  var equipe   = document.getElementById('equipe').value;

  if (!rgct)     { alert('Informe o RGCT.'); return; }
  if (!olho)     { alert('Selecione o olho (OD ou OE).'); return; }
  if (!mr)       { alert('Selecione o motivo de recusa.'); return; }

  google.script.run
    .withSuccessHandler(function() {
      document.querySelector('button').textContent = '✔ Salvo!';
      document.querySelector('button').style.background = '#107c41';
      setTimeout(function(){ resetForm(); }, 1200);
    })
    .salvarRecusa({ rgct, nome, olho, mr, equipe });
}

function resetForm() {
  document.getElementById('rgct').value = '';
  document.getElementById('nome').value = '';
  document.getElementById('olho').value = '';
  document.getElementById('mr').value = '';
  document.getElementById('equipe').value = '';
  document.querySelector('button').textContent = 'REGISTRAR RECUSA';
  document.querySelector('button').style.background = '#C00000';
}
<\/script>`;
}
