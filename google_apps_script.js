// ============================================================
// OFERTAS DE CÓRNEAS — Google Apps Script
// Cola este código no editor e salva (Ctrl+S)
// O menu "OFERTAS" aparecerá na planilha automaticamente
// ============================================================

const ABA_OFERTAS  = "OFERTAS";
const ABA_RECUSAS  = "RECUSAS";
const ABA_LISTAS   = "LISTAS";
const LINHA_INI    = 3;   // primeira linha de dados
const LINHA_FIM    = 14;  // última linha da seção de ofertas
const COL_EXPORTAR = 14;  // coluna N = 14

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

// ── Cria o menu ao abrir a planilha ─────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚕ OFERTAS")
    .addItem("📋 Configurar planilha (dropdowns + abas)", "configurarPlanilha")
    .addSeparator()
    .addItem("🔴 Exportar recusas marcadas com X", "exportarRecusas")
    .addToUi();
}

// ============================================================
// CONFIGURAR — cria LISTAS, RECUSAS e adiciona dropdowns
// ============================================================
function configurarPlanilha() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Aba LISTAS (oculta) com os motivos
  let wsL = ss.getSheetByName(ABA_LISTAS);
  if (!wsL) wsL = ss.insertSheet(ABA_LISTAS);
  wsL.clearContents();
  MOTIVOS.forEach((m, i) => wsL.getRange(i + 1, 1).setValue(m));
  wsL.hideSheet();

  // 2. Dropdowns nas colunas MR da aba OFERTAS
  const wsOf = ss.getSheetByName(ABA_OFERTAS);
  if (!wsOf) { SpreadsheetApp.getUi().alert("Aba 'OFERTAS' não encontrada!"); return; }

  const regraMotivo = SpreadsheetApp.newDataValidation()
    .requireValueInRange(wsL.getRange(1, 1, MOTIVOS.length, 1), true)
    .setAllowInvalid(false)
    .build();

  // OD: colunas D(4) a G(7)
  wsOf.getRange(LINHA_INI, 4, LINHA_FIM - LINHA_INI + 1, 4).setDataValidation(regraMotivo);
  // OE: colunas J(10) a M(13)
  wsOf.getRange(LINHA_INI, 10, LINHA_FIM - LINHA_INI + 1, 4).setDataValidation(regraMotivo);

  // 3. Coluna N — cabeçalho + instrução
  wsOf.getRange(1, COL_EXPORTAR)
      .setValue("→ Digite X para exportar a linha")
      .setFontColor("#C00000").setFontStyle("italic")
      .setFontSize(8).setHorizontalAlignment("center");

  wsOf.getRange(2, COL_EXPORTAR)
      .setValue("EXPORTAR")
      .setBackground("#C00000").setFontColor("#FFFFFF")
      .setFontWeight("bold").setHorizontalAlignment("center");

  // Formatar células de dados N3:N14
  wsOf.getRange(LINHA_INI, COL_EXPORTAR, LINHA_FIM - LINHA_INI + 1, 1)
      .setBackground("#FFCCCC").setFontColor("#C00000")
      .setFontWeight("bold").setFontSize(12).setHorizontalAlignment("center");

  wsOf.setColumnWidth(COL_EXPORTAR, 100);

  // 4. Criar aba RECUSAS se não existir
  garantirAbaRecusas_(ss);

  SpreadsheetApp.getUi().alert(
    "✔ Configuração concluída!\n\n" +
    "• Dropdowns MR nas colunas D-G e J-M (linhas 3-14)\n" +
    "• Coluna N (EXPORTAR) configurada\n" +
    "• Aba RECUSAS pronta\n\n" +
    "Para exportar: digite X na coluna N da linha desejada\n" +
    "e use o menu ⚕ OFERTAS → Exportar recusas."
  );
}

// ============================================================
// EXPORTAR — move linhas marcadas com X para RECUSAS
// ============================================================
function exportarRecusas() {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const wsOf = ss.getSheetByName(ABA_OFERTAS);
  if (!wsOf) { SpreadsheetApp.getUi().alert("Aba 'OFERTAS' não encontrada!"); return; }

  const wsRec    = garantirAbaRecusas_(ss);
  let proximaRec = Math.max(wsRec.getLastRow() + 1, 3);
  const agora    = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
  let exportadas = 0;

  for (let linha = LINHA_INI; linha <= LINHA_FIM; linha++) {
    const marcador = String(wsOf.getRange(linha, COL_EXPORTAR).getValue()).trim();
    if (marcador === "") continue;

    // Copiar colunas A:M (1-13) para RECUSAS
    const dados = wsOf.getRange(linha, 1, 1, 13).getValues();
    wsRec.getRange(proximaRec, 1, 1, 13).setValues(dados);
    wsRec.getRange(proximaRec, 14).setValue(agora);
    wsRec.getRange(proximaRec, 1, 1, 14).setBackground("#FFCCCC");

    // Apagar MRs (mantém A-C: RGCT, nome, hospital)
    wsOf.getRange(linha, 4, 1, 4).clearContent();   // D-G OD
    wsOf.getRange(linha, 10, 1, 4).clearContent();  // J-M OE
    wsOf.getRange(linha, COL_EXPORTAR).clearContent(); // X

    proximaRec++;
    exportadas++;
  }

  if (exportadas === 0) {
    SpreadsheetApp.getUi().alert(
      "Nenhuma linha marcada.\n\nPreencha a coluna N (linhas 3 a 14) e tente novamente."
    );
  } else {
    SpreadsheetApp.getUi().alert(
      `✔ ${exportadas} recusa(s) exportada(s) para RECUSAS.\nMRs apagados da OFERTAS.`
    );
    ss.setActiveSheet(wsRec);
  }
}

// ── Helper: garante aba RECUSAS com cabeçalho ───────────────
function garantirAbaRecusas_(ss) {
  let wsRec = ss.getSheetByName(ABA_RECUSAS);
  if (!wsRec) { wsRec = ss.insertSheet(ABA_RECUSAS); wsRec.setTabColor("#C00000"); }

  if (!wsRec.getRange("A1").getValue()) {
    wsRec.getRange("A1:N1").merge()
         .setValue("RECUSAS EXPORTADAS")
         .setBackground("#C00000").setFontColor("#FFFFFF")
         .setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");
    wsRec.setRowHeight(1, 30);

    ["RGCT","OFERTA OD","HOSPITAL OD","MR-1 OD","MR-2 OD","MR-3 OD","MR-4 OD",
     "OFERTA OE","HOSPITAL OE","MR-1 OE","MR-2 OE","MR-3 OE","MR-4 OE","—","DATA EXPORTAÇÃO"]
    .forEach((nome, i) => {
      wsRec.getRange(2, i + 1)
           .setValue(nome)
           .setBackground("#1F4E79").setFontColor("#FFFFFF")
           .setFontWeight("bold").setHorizontalAlignment("center");
    });
    wsRec.setRowHeight(2, 22);
  }
  return wsRec;
}
