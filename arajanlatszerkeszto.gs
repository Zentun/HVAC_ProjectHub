// ── Árajánlat Szerkesztő ──────────────────────────────────────

var SOROK_KEZDETE = 13;
var SOROK_SZAMA   = 30;

function setupArajanlatSzerkeszto() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Árajánlat_Szerkesztő") || ss.insertSheet("Árajánlat_Szerkesztő");
  sheet.clear();

  // Fejléc
  sheet.getRange("A1:F1").merge()
    .setValue("ÁRAJÁNLAT SZERKESZTŐ")
    .setFontSize(16).setFontWeight("bold")
    .setBackground("#f9ab00").setFontColor("#ffffff")
    .setHorizontalAlignment("center");

  // ── Bal oldal: fejléc adatok ────────────────────────────────
  sheet.getRange("A3").setValue("Projekt:").setFontWeight("bold");
  var projektSheet = ss.getSheetByName("Projektek");
  var projektRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(projektSheet.getRange("H2:H1000"), true)
    .setAllowInvalid(false).build();
  sheet.getRange("B3").setDataValidation(projektRule)
    .setBackground("#f8f9fa").setBorder(true, true, true, true, false, false);

  sheet.getRange("A4").setValue("ÁFA %:").setFontWeight("bold");
  sheet.getRange("B4").setValue(27)
    .setBackground("#f8f9fa").setBorder(true, true, true, true, false, false);

  sheet.getRange("A5").setValue("Státusz:").setFontWeight("bold");
  var statuszRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["elküldve", "elfogadva", "elutasítva"], true)
    .setAllowInvalid(false).build();
  sheet.getRange("B5").setValue("elküldve")
    .setDataValidation(statuszRule)
    .setBackground("#f8f9fa").setBorder(true, true, true, true, false, false);

  sheet.getRange("A6").setValue("Megjegyzés:").setFontWeight("bold");
  sheet.getRange("B6").setBackground("#f8f9fa").setBorder(true, true, true, true, false, false);

  sheet.getRange("A7").setValue("Művelet:").setFontWeight("bold");
  var muveletRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["— Válassz műveletet —", "Árajánlat mentése", "Sorok törlése"], true)
    .setAllowInvalid(false).build();
  sheet.getRange("B7").setValue("— Válassz műveletet —")
    .setDataValidation(muveletRule)
    .setBackground("#f8f9fa").setBorder(true, true, true, true, false, false);

  // ── Jobb oldal: live összesítő ──────────────────────────────
  var osszesenOszlop = "F";
  var sorTol = SOROK_KEZDETE;
  var sorIg  = SOROK_KEZDETE + SOROK_SZAMA - 1;

  sheet.getRange("D3").setValue("ÖSSZESÍTŐ")
    .setFontWeight("bold").setFontSize(11).setFontColor("#e37400");

  sheet.getRange("D4").setValue("Nettó összeg:").setFontWeight("bold").setFontColor("#444444");
  sheet.getRange("E4")
    .setFormula("=IFERROR(SUM(" + osszesenOszlop + sorTol + ":" + osszesenOszlop + sorIg + "),0)")
    .setNumberFormat("#,##0 Ft").setBackground("#fff8e1").setFontWeight("bold");

  sheet.getRange("D5").setValue("ÁFA összeg:").setFontWeight("bold").setFontColor("#444444");
  sheet.getRange("E5")
    .setFormula("=IFERROR(E4*B4/100,0)")
    .setNumberFormat("#,##0 Ft").setBackground("#fff8e1");

  sheet.getRange("D6").setValue("Bruttó összeg:").setFontWeight("bold").setFontColor("#444444");
  sheet.getRange("E6")
    .setFormula("=IFERROR(E4+E5,0)")
    .setNumberFormat("#,##0 Ft").setBackground("#fff3e0").setFontWeight("bold");

  // ── Tételek táblázat ────────────────────────────────────────
  var fejlecSor = SOROK_KEZDETE - 1;
  var fejlecek = ["Katalógus tétel", "Megnevezés *", "Mennyiség", "Egység", "Egységár nettó", "Összesen"];
  for (var c = 0; c < fejlecek.length; c++) {
    sheet.getRange(fejlecSor, c + 1)
      .setValue(fejlecek[c])
      .setFontWeight("bold").setBackground("#f1f3f4").setFontColor("#333333")
      .setBorder(true, true, true, true, false, false);
  }

  var tetelSheet = ss.getSheetByName("Árajánlat_tételek");
  var tetelRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(tetelSheet.getRange("C2:C1000"), true)
    .setAllowInvalid(true).build();

  var egysegRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["db", "m", "m²", "kg", "óra", "csomag"], true)
    .setAllowInvalid(false).build();

  for (var r = SOROK_KEZDETE; r < SOROK_KEZDETE + SOROK_SZAMA; r++) {
    sheet.getRange(r, 1).setDataValidation(tetelRule).setBackground("#fafafa");
    sheet.getRange(r, 2).setBackground("#fafafa");
    sheet.getRange(r, 3).setBackground("#fafafa").setNumberFormat("0.##");
    sheet.getRange(r, 4).setDataValidation(egysegRule).setBackground("#fafafa");
    sheet.getRange(r, 5).setBackground("#fafafa").setNumberFormat("#,##0");
    sheet.getRange(r, 6)
      .setFormula("=IF(OR(C" + r + "=\"\",E" + r + "=\"\"),\"\",C" + r + "*E" + r + ")")
      .setBackground("#f0f4ff").setNumberFormat("#,##0 Ft");
  }

  // Alternatív sorok halvány csíkozása
  for (var r = SOROK_KEZDETE; r < SOROK_KEZDETE + SOROK_SZAMA; r += 2) {
    sheet.getRange(r, 1, 1, 5).setBackground("#f5f5f5");
    sheet.getRange(r, 6).setBackground("#eaefff");
  }

  // Oszlopszélességek
  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(3, 80);
  sheet.setColumnWidth(4, 80);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 130);

  sheet.setFrozenRows(fejlecSor);

  ss.toast("Árajánlat_Szerkesztő lap létrehozva!", "Kész", 4);
}

function mentesArajanlat() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Árajánlat_Szerkesztő");

  var projektNev = sheet.getRange("B3").getValue().toString().trim();
  var afa        = Number(sheet.getRange("B4").getValue()) || 27;
  var statusz    = sheet.getRange("B5").getValue().toString().trim();
  var megjegyzes = sheet.getRange("B6").getValue();

  if (!projektNev) {
    ss.toast("Válassz projektet!", "Figyelem", 3);
    return;
  }

  // Projekt_ID keresése név alapján
  var projektSheet = ss.getSheetByName("Projektek");
  var projektData  = projektSheet.getDataRange().getValues();
  var projektId    = null;
  for (var i = 1; i < projektData.length; i++) {
    if (!projektData[i][0]) continue;
    if (projektData[i][7] == projektNev) { projektId = projektData[i][0]; break; }
  }
  if (!projektId) {
    ss.toast("Nem található projekt: " + projektNev, "Hiba", 3);
    return;
  }

  // Sorok batch olvasás (A-E oszlopok)
  var sorData = sheet.getRange(SOROK_KEZDETE, 1, SOROK_SZAMA, 5).getValues();
  var sorok = [];
  for (var i = 0; i < sorData.length; i++) {
    var megnev = sorData[i][1].toString().trim();
    var menny  = Number(sorData[i][2]);
    var egys   = sorData[i][3].toString().trim();
    var ar     = Number(sorData[i][4]);
    if (!megnev || !menny || !ar) continue;
    sorok.push([megnev, menny, egys, ar]);
  }

  if (sorok.length === 0) {
    ss.toast("Nincs kitöltött sor!", "Figyelem", 3);
    return;
  }

  // Összesítők
  var netto = 0;
  for (var i = 0; i < sorok.length; i++) netto += sorok[i][1] * sorok[i][3];
  var brutto = Math.round(netto * (1 + afa / 100));
  netto      = Math.round(netto);

  var ma            = Utilities.formatDate(new Date(), "Europe/Budapest", "yyyy-MM-dd");
  var arajanlatId   = generateArajanlatId_(ss);
  var arajanlatSheet = ss.getSheetByName("Árajánlatok");

  arajanlatSheet.appendRow([arajanlatId, projektId, ma, netto, afa, brutto, statusz, megjegyzes]);

  // Sorok mentése
  var sorSheet = ss.getSheetByName("Árajánlat_sorok");
  for (var i = 0; i < sorok.length; i++) {
    var sorId = generateArajanlatSorId_(ss, sorSheet);
    sorSheet.appendRow([
      sorId, arajanlatId, "",
      sorok[i][0], sorok[i][1], sorok[i][2], sorok[i][3],
      sorok[i][1] * sorok[i][3]
    ]);
  }

  // Form törlése
  sheet.getRange(SOROK_KEZDETE, 1, SOROK_SZAMA, 5).clearContent();
  sheet.getRange("B3:B4").clearContent();
  sheet.getRange("B5").setValue("elküldve");
  sheet.getRange("B6").clearContent();

  ss.toast(arajanlatId + " — " + sorok.length + " sor, " + netto.toLocaleString() + " Ft nettó", "Árajánlat mentve ✓", 6);
}

function torleArajanlatSorok() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName("Árajánlat_Szerkesztő")
    .getRange(SOROK_KEZDETE, 1, SOROK_SZAMA, 5).clearContent();
  ss.toast("Sorok törölve.", "Kész", 2);
}

function tetelAutoFill(ss, sheet, sor, megnev) {
  var tetelSheet = ss.getSheetByName("Árajánlat_tételek");
  var data = tetelSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] == megnev) {
      sheet.getRange(sor, 2).setValue(megnev);
      sheet.getRange(sor, 4).setValue(data[i][3]);
      sheet.getRange(sor, 5).setValue(data[i][4]);
      return;
    }
  }
}

// ── ID generálás ───────────────────────────────────────────────

function generateArajanlatId_(ss) {
  var sheet   = ss.getSheetByName("Árajánlatok");
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return "A-0001";
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var max = 0;
  for (var i = 0; i < ids.length; i++) {
    var num = parseInt(ids[i][0].toString().replace("A-", ""));
    if (!isNaN(num) && num > max) max = num;
  }
  return "A-" + String(max + 1).padStart(4, "0");
}

function generateArajanlatSorId_(ss, sorSheet) {
  var lastRow = sorSheet.getLastRow();
  if (lastRow < 2) return "AS-0001";
  var ids = sorSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var max = 0;
  for (var i = 0; i < ids.length; i++) {
    var num = parseInt(ids[i][0].toString().replace("AS-", ""));
    if (!isNaN(num) && num > max) max = num;
  }
  return "AS-" + String(max + 1).padStart(4, "0");
}
