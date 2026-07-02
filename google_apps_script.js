// ============================================================
// MONTA ABA RECUSAS — cole no Google Apps Script e execute
// ============================================================

function montarAbaRecusas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Cria ou limpa aba RECUSAS
  let ws = ss.getSheetByName("RECUSAS");
  if (!ws) {
    ws = ss.insertSheet("RECUSAS");
    ws.setTabColor("#C00000");
  } else {
    ws.clearContents();
    ws.clearFormats();
  }

  // ── Linha 1: título ─────────────────────────────────────
  ws.getRange("A1:U1").merge()
    .setValue("RECUSAS EXPORTADAS")
    .setBackground("#C00000")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(13)
    .setHorizontalAlignment("center");
  ws.setRowHeight(1, 32);

  // ── Linha 2: cabeçalhos ──────────────────────────────────
  // Estrutura: RGCT | OFERTA OD | HOSP OD | MR-1 OD | EQ | MR-2 OD | EQ | MR-3 OD | EQ | MR-4 OD | EQ
  //          | OFERTA OE | HOSP OE | MR-1 OE | EQ | MR-2 OE | EQ | MR-3 OE | EQ | MR-4 OE | EQ | DATA
  const CABS = [
    // A  B                C           D        E         F        G         H        I         J        K
    "RGCT","OFERTA OD","HOSPITAL OD",
    "MR-1 OD","EQUIPE","MR-2 OD","EQUIPE","MR-3 OD","EQUIPE","MR-4 OD","EQUIPE",
    // L              M           N        O         P        Q         R        S         T        U
    "OFERTA OE","HOSPITAL OE",
    "MR-1 OE","EQUIPE","MR-2 OE","EQUIPE","MR-3 OE","EQUIPE","MR-4 OE","EQUIPE",
  ];

  CABS.forEach((nome, i) => {
    const isMR    = nome.startsWith("MR");
    const isEq    = nome === "EQUIPE";
    const isData  = nome === "DATA EXPORTAÇÃO";

    const bg = isMR   ? "#1F4E79"
             : isEq   ? "#2E75B6"
             : isData ? "#843C0C"
             :          "#1F4E79";

    ws.getRange(2, i + 1)
      .setValue(nome)
      .setBackground(bg)
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setWrap(true);
  });

  ws.setRowHeight(2, 40);

  // ── Larguras das colunas ─────────────────────────────────
  const larguras = [
    12,  // A RGCT
    22,  // B OFERTA OD
    14,  // C HOSPITAL OD
    30,  // D MR-1 OD
    20,  // E EQUIPE
    30,  // F MR-2 OD
    20,  // G EQUIPE
    30,  // H MR-3 OD
    20,  // I EQUIPE
    30,  // J MR-4 OD
    20,  // K EQUIPE
    22,  // L OFERTA OE
    14,  // M HOSPITAL OE
    30,  // N MR-1 OE
    20,  // O EQUIPE
    30,  // P MR-2 OE
    20,  // Q EQUIPE
    30,  // R MR-3 OE
    20,  // S EQUIPE
    30,  // T MR-4 OE
    20,  // U EQUIPE
  ];
  larguras.forEach((w, i) => ws.setColumnWidth(i + 1, w * 7));

  // ── Congela as 2 primeiras linhas ───────────────────────
  ws.setFrozenRows(2);

  SpreadsheetApp.getUi().alert("✔ Aba RECUSAS montada!\n\n21 colunas (A-U):\n• 4 blocos MR + EQUIPE para OD\n• 4 blocos MR + EQUIPE para OE");
}
