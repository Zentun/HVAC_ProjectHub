function createHVACDatabase() {
  var ss = SpreadsheetApp.create("HVAC_Adatbázis");

  setupUgyfelek(ss);
  setupProjektek(ss);
  setupFelmeres(ss);
  setupArajanlatok(ss);
  setupArajanlatSorok(ss);
  setupArajanlatTetelek(ss);
  setupMunkalap(ss);
  setupSzamla(ss);

  // Az alapértelmezett "Munka1" fül törlése
  var defaultSheet = ss.getSheetByName("Munka1") || ss.getSheetByName("Sheet1");
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  Logger.log("Kész! A spreadsheet URL-je: " + ss.getUrl());
}

// ── Segédfüggvények ──────────────────────────────────────────

function formatSheet(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground("#1a73e8")
    .setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, headers.length, 160);
}

function addDropdown(sheet, col, lastRow, values) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, col, lastRow - 1, 1).setDataValidation(rule);
}

// ── Táblák ───────────────────────────────────────────────────

function setupUgyfelek(ss) {
  var sheet = ss.insertSheet("Ügyfelek");
  var headers = ["Ügyfél_ID", "Név", "Telefon", "Email", "Cím", "Létrehozva", "Megjegyzés"];
  formatSheet(sheet, headers);
  sheet.getRange("F2:F1000").setNumberFormat("yyyy-mm-dd");
}

function setupProjektek(ss) {
  var sheet = ss.insertSheet("Projektek");
  var headers = ["Projekt_ID", "Ügyfél_ID", "Típus", "Státusz", "Létrehozva", "Megjegyzés"];
  formatSheet(sheet, headers);
  addDropdown(sheet, 3, 1000, ["telepítés", "karbantartás", "javítás"]);
  addDropdown(sheet, 4, 1000, ["megkeresés", "felmérés", "árajánlat", "megrendelés", "telepítés", "lezárva"]);
  sheet.getRange("E2:E1000").setNumberFormat("yyyy-mm-dd");
}

function setupFelmeres(ss) {
  var sheet = ss.insertSheet("Felmérés");
  var headers = ["Felmérés_ID", "Projekt_ID", "Dátum", "Elképzelés", "Tervezett_anyagok", "Felmérte", "Megjegyzés"];
  formatSheet(sheet, headers);
  sheet.getRange("C2:C1000").setNumberFormat("yyyy-mm-dd");
  sheet.setColumnWidth(4, 250);
  sheet.setColumnWidth(5, 250);
}

function setupArajanlatok(ss) {
  var sheet = ss.insertSheet("Árajánlatok");
  var headers = ["Árajánlat_ID", "Projekt_ID", "Dátum", "Nettó_összeg", "ÁFA_%", "Bruttó_összeg", "Státusz", "Megjegyzés"];
  formatSheet(sheet, headers);
  sheet.getRange("C2:C1000").setNumberFormat("yyyy-mm-dd");
  sheet.getRange("D2:D1000").setNumberFormat("#,##0 Ft");
  sheet.getRange("F2:F1000").setNumberFormat("#,##0 Ft");
  addDropdown(sheet, 7, 1000, ["elküldve", "elfogadva", "elutasítva"]);
}

function setupArajanlatSorok(ss) {
  var sheet = ss.insertSheet("Árajánlat_sorok");
  var headers = ["Sor_ID", "Árajánlat_ID", "Tétel_ID", "Megnevezés", "Mennyiség", "Egység", "Egységár_nettó", "Összesen_nettó"];
  formatSheet(sheet, headers);
  addDropdown(sheet, 6, 1000, ["db", "m", "m²", "kg", "óra", "csomag"]);
  sheet.getRange("G2:G1000").setNumberFormat("#,##0 Ft");
  sheet.getRange("H2:H1000").setNumberFormat("#,##0 Ft");
  sheet.setColumnWidth(4, 220);
}

function setupArajanlatTetelek(ss) {
  var sheet = ss.insertSheet("Árajánlat_tételek");
  var headers = ["Tétel_ID", "Kategória", "Megnevezés", "Egység", "Egységár_nettó", "Megjegyzés"];
  formatSheet(sheet, headers);
  addDropdown(sheet, 2, 1000, ["berendezés", "szerelési anyag"]);
  addDropdown(sheet, 4, 1000, ["db", "m", "m²", "kg", "óra", "csomag"]);
  sheet.getRange("E2:E1000").setNumberFormat("#,##0 Ft");
  sheet.setColumnWidth(3, 220);
}

function setupMunkalap(ss) {
  var sheet = ss.insertSheet("Munkalap");
  var headers = ["Munkalap_ID", "Projekt_ID", "Dátum", "Elvégzett_munkák", "Felhasznált_anyagok", "Szerelő", "Változtatások", "Megjegyzés"];
  formatSheet(sheet, headers);
  sheet.getRange("C2:C1000").setNumberFormat("yyyy-mm-dd");
  sheet.setColumnWidth(4, 250);
  sheet.setColumnWidth(5, 250);
}

function setupSzamla(ss) {
  var sheet = ss.insertSheet("Számla");
  var headers = ["Számla_ID", "Projekt_ID", "Kiállítva", "Fizetési_határidő", "Nettó_összeg", "ÁFA_%", "Bruttó_összeg", "Státusz"];
  formatSheet(sheet, headers);
  sheet.getRange("C2:D1000").setNumberFormat("yyyy-mm-dd");
  sheet.getRange("E2:E1000").setNumberFormat("#,##0 Ft");
  sheet.getRange("G2:G1000").setNumberFormat("#,##0 Ft");
  addDropdown(sheet, 8, 1000, ["kiállítva", "fizetve", "késedelmes"]);
}
