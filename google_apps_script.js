// ============================================================
// MONTA ABA RECUSAS — uma linha por recusa
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

function montarAbaRecusas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── Aba LISTAS (oculta) com os 39 motivos ───────────────
  let wsL = ss.getSheetByName("LISTAS");
  if (!wsL) wsL = ss.insertSheet("LISTAS");
  wsL.clearContents();
  MOTIVOS.forEach((m, i) => wsL.getRange(i + 1, 1).setValue(m));
  wsL.hideSheet();

  // ── Aba RECUSAS ──────────────────────────────────────────
  let ws = ss.getSheetByName("RECUSAS");
  if (!ws) {
    ws = ss.insertSheet("RECUSAS");
    ws.setTabColor("#C00000");
  } else {
    ws.clearContents();
    ws.clearFormats();
  }

  // Linha 1: título
  ws.getRange("A1:E1").merge()
    .setValue("RECUSAS DE CÓRNEAS")
    .setBackground("#C00000")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(13)
    .setHorizontalAlignment("center");
  ws.setRowHeight(1, 32);

  // Linha 2: cabeçalhos
  const CABS = ["RGCT", "HOSPITAL", "OLHO", "MOTIVO DE RECUSA", "EQUIPE"];
  const CORES = ["#1F4E79","#1F4E79","#1F4E79","#C00000","#2E75B6"];

  CABS.forEach((nome, i) => {
    ws.getRange(2, i + 1)
      .setValue(nome)
      .setBackground(CORES[i])
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
  });
  ws.setRowHeight(2, 24);

  // Larguras
  [14, 20, 8, 38, 30].forEach((w, i) => ws.setColumnWidth(i + 1, w * 7));

  // ── Dropdowns nas linhas de dados (3 a 1000) ────────────
  const MAX_LINHAS = 998; // linhas 3 a 1000

  // Coluna C: OLHO — OD ou OE
  const regraOlho = SpreadsheetApp.newDataValidation()
    .requireValueInList(["OD", "OE"], true)
    .setAllowInvalid(false)
    .build();
  ws.getRange(3, 3, MAX_LINHAS, 1).setDataValidation(regraOlho);

  // Coluna D: MOTIVO DE RECUSA — 39 motivos SNT
  const regraMR = SpreadsheetApp.newDataValidation()
    .requireValueInRange(wsL.getRange(1, 1, MOTIVOS.length, 1), true)
    .setAllowInvalid(false)
    .build();
  ws.getRange(3, 4, MAX_LINHAS, 1).setDataValidation(regraMR);

  // Coluna E: EQUIPE — da aba EQUIPES
  const wsEq = ss.getSheetByName("EQUIPES");
  if (wsEq && wsEq.getLastRow() >= 3) {
    const regraEq = SpreadsheetApp.newDataValidation()
      .requireValueInRange(wsEq.getRange(3, 1, wsEq.getLastRow() - 2, 1), true)
      .setAllowInvalid(false)
      .build();
    ws.getRange(3, 5, MAX_LINHAS, 1).setDataValidation(regraEq);
  }

  // Congela cabeçalho
  ws.setFrozenRows(2);

  SpreadsheetApp.getUi().alert(
    "✔ Aba RECUSAS montada!\n\n" +
    "Estrutura: uma linha por recusa\n" +
    "  A: RGCT\n" +
    "  B: HOSPITAL\n" +
    "  C: OLHO (dropdown OD/OE)\n" +
    "  D: MOTIVO DE RECUSA (dropdown 39 motivos)\n" +
    "  E: EQUIPE (dropdown aba EQUIPES)\n\n" +
    "Sem limite de linhas — pode ter 100 recusas por RGCT."
  );
}
