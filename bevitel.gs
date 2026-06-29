// ── Beviteli lapok létrehozása ─────────────────────────────────

function setupBevitelSheetsek() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupBevitelUgyfél_(ss);
  setupBevitelProjekt_(ss);
  ss.toast("Beviteli lapok frissítve!", "Kész", 4);
}

function setupBevitelUgyfél_(ss) {
  var sheet = ss.getSheetByName("Bevitel_Ügyfél") || ss.insertSheet("Bevitel_Ügyfél");
  sheet.clear();

  // Fejléc
  sheet.getRange("A1:B1").merge()
    .setValue("ÚJ ÜGYFÉL")
    .setFontSize(14).setFontWeight("bold")
    .setBackground("#1a73e8").setFontColor("#ffffff")
    .setHorizontalAlignment("center");

  // Mezők
  var mezok = ["Név *", "Telefon", "Email", "Cím", "Megjegyzés"];
  for (var i = 0; i < mezok.length; i++) {
    var row = i + 3;
    sheet.getRange(row, 1).setValue(mezok[i]).setFontWeight("bold");
    sheet.getRange(row, 2)
      .setBackground("#f8f9fa")
      .setBorder(true, true, true, true, false, false);
  }

  // Művelet dropdown
  sheet.getRange("A9").setValue("Művelet:").setFontWeight("bold");
  var muveletRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["— Válassz műveletet —", "Ügyfél mentése"], true)
    .setAllowInvalid(false).build();
  sheet.getRange("B9")
    .setValue("— Válassz műveletet —")
    .setDataValidation(muveletRule)
    .setBackground("#f8f9fa")
    .setBorder(true, true, true, true, false, false);

  // Státusz sor (visszajelzés makró futás után)
  sheet.getRange("A11").setValue("Státusz:").setFontColor("#888888").setFontStyle("italic");
  sheet.getRange("B11").setValue("—").setFontColor("#888888");

  // Utoljára mentve
  sheet.getRange("A12").setValue("Utoljára mentve:").setFontColor("#888888").setFontStyle("italic");
  sheet.getRange("B12").setValue("—").setFontColor("#888888");

  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 300);
  sheet.setFrozenRows(1);
}

function setupBevitelProjekt_(ss) {
  var sheet = ss.getSheetByName("Bevitel_Projekt") || ss.insertSheet("Bevitel_Projekt");
  sheet.clear();
  var ugyfelSheet = ss.getSheetByName("Ügyfelek");

  // Fejléc
  sheet.getRange("A1:B1").merge()
    .setValue("ÚJ PROJEKT")
    .setFontSize(14).setFontWeight("bold")
    .setBackground("#1a73e8").setFontColor("#ffffff")
    .setHorizontalAlignment("center");

  // Ügyfél dropdown (élő lista az Ügyfelek fülből)
  sheet.getRange("A3").setValue("Ügyfél *").setFontWeight("bold");
  var ugyfelRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(ugyfelSheet.getRange("B2:B1000"), true)
    .setAllowInvalid(false).build();
  sheet.getRange("B3")
    .setDataValidation(ugyfelRule)
    .setBackground("#f8f9fa")
    .setBorder(true, true, true, true, false, false);

  // Ügyfél_ID (automatikus, képlettel — belső mező, nem megjelenített)
  sheet.getRange("A4").setValue("Ügyfél_ID").setFontWeight("bold").setFontColor("#888888");
  sheet.getRange("B4")
    .setFormula('=IFERROR(INDEX(Ügyfelek!A:A,MATCH(B3,Ügyfelek!B:B,0)),"")')
    .setBackground("#e8eaed").setFontColor("#888888");

  // Típus dropdown
  sheet.getRange("A5").setValue("Típus *").setFontWeight("bold");
  var tipusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["telepítés", "karbantartás", "javítás"], true)
    .setAllowInvalid(false).build();
  sheet.getRange("B5")
    .setDataValidation(tipusRule)
    .setBackground("#f8f9fa")
    .setBorder(true, true, true, true, false, false);

  // Leírás (kötelező — ebből képződik a projekt neve)
  sheet.getRange("A6").setValue("Leírás *").setFontWeight("bold");
  sheet.getRange("B6")
    .setBackground("#f8f9fa")
    .setBorder(true, true, true, true, false, false);

  // Megjegyzés
  sheet.getRange("A7").setValue("Megjegyzés").setFontWeight("bold");
  sheet.getRange("B7")
    .setBackground("#f8f9fa")
    .setBorder(true, true, true, true, false, false);

  // Művelet dropdown
  sheet.getRange("A9").setValue("Művelet:").setFontWeight("bold");
  var muveletRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["— Válassz műveletet —", "Projekt mentése", "→ Új ügyfél létrehozása"], true)
    .setAllowInvalid(false).build();
  sheet.getRange("B9")
    .setValue("— Válassz műveletet —")
    .setDataValidation(muveletRule)
    .setBackground("#f8f9fa")
    .setBorder(true, true, true, true, false, false);

  // Státusz sor
  sheet.getRange("A12").setValue("Státusz:").setFontColor("#888888").setFontStyle("italic");
  sheet.getRange("B12").setValue("—").setFontColor("#888888");

  // Utoljára mentve
  sheet.getRange("A13").setValue("Utoljára mentve:").setFontColor("#888888").setFontStyle("italic");
  sheet.getRange("B13").setValue("—").setFontColor("#888888");

  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 300);
  sheet.setFrozenRows(1);
}

// ── ID generálás ───────────────────────────────────────────────

function generateUgyfelId_(ss) {
  var sheet = ss.getSheetByName("Ügyfelek");
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return "U-0001";
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var max = 0;
  for (var i = 0; i < ids.length; i++) {
    var num = parseInt(ids[i][0].toString().replace("U-", ""));
    if (!isNaN(num) && num > max) max = num;
  }
  return "U-" + String(max + 1).padStart(4, "0");
}

function generateProjektId_(ss) {
  var sheet = ss.getSheetByName("Projektek");
  var year = new Date().getFullYear();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return "P-" + year + "-0001";
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var max = 0;
  for (var i = 0; i < ids.length; i++) {
    var parts = ids[i][0].toString().split("-");
    if (parts.length === 3 && parts[1] == year) {
      var num = parseInt(parts[2]);
      if (!isNaN(num) && num > max) max = num;
    }
  }
  return "P-" + year + "-" + String(max + 1).padStart(4, "0");
}

// ── Mentési makrók ─────────────────────────────────────────────

function mentesUgyfelet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bevitel = ss.getSheetByName("Bevitel_Ügyfél");
  var ugyfelek = ss.getSheetByName("Ügyfelek");

  var nev = bevitel.getRange("B3").getValue().toString().trim();
  if (!nev) {
    bevitel.getRange("B11").setValue("HIBA: A Név mező kitöltése kötelező!").setFontColor("#d93025");
    return;
  }

  var id = generateUgyfelId_(ss);
  var ma = Utilities.formatDate(new Date(), "Europe/Budapest", "yyyy-MM-dd");

  ugyfelek.appendRow([
    id,
    nev,
    bevitel.getRange("B4").getValue(),
    bevitel.getRange("B5").getValue(),
    bevitel.getRange("B6").getValue(),
    ma,
    bevitel.getRange("B7").getValue()
  ]);

  bevitel.getRange("B12").setValue(id + " — " + nev).setFontColor("#0d652d");
  bevitel.getRange("B11").setValue("OK — sikeresen mentve").setFontColor("#0d652d");
  bevitel.getRange("B3:B7").clearContent();

  ss.toast(id + " — " + nev, "Ügyfél mentve ✓", 5);
}

function mentesProjektet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bevitel = ss.getSheetByName("Bevitel_Projekt");
  var projektek = ss.getSheetByName("Projektek");

  var ugyfelNev = bevitel.getRange("B3").getValue().toString().trim();
  var ugyfelId  = bevitel.getRange("B4").getValue().toString().trim();
  var tipus     = bevitel.getRange("B5").getValue().toString().trim();
  var leiras    = bevitel.getRange("B6").getValue().toString().trim();
  var megjegyzes = bevitel.getRange("B7").getValue();

  if (!ugyfelNev || !ugyfelId) {
    bevitel.getRange("B12").setValue("HIBA: Ügyfél kiválasztása kötelező!").setFontColor("#d93025");
    return;
  }
  if (!tipus) {
    bevitel.getRange("B12").setValue("HIBA: A Típus mező kitöltése kötelező!").setFontColor("#d93025");
    return;
  }
  if (!leiras) {
    bevitel.getRange("B12").setValue("HIBA: A Leírás mező kitöltése kötelező!").setFontColor("#d93025");
    return;
  }

  var id = generateProjektId_(ss);
  var ma = Utilities.formatDate(new Date(), "Europe/Budapest", "yyyy-MM-dd");
  var projektNev = ugyfelNev + " - " + tipus + " - " + leiras;

  projektek.appendRow([
    id,
    ugyfelId,
    leiras,
    tipus,
    "megkeresés",
    ma,
    megjegyzes,
    projektNev
  ]);

  bevitel.getRange("B13").setValue(projektNev).setFontColor("#0d652d");
  bevitel.getRange("B12").setValue("OK — sikeresen mentve").setFontColor("#0d652d");
  bevitel.getRange("B3").clearContent();
  bevitel.getRange("B5:B7").clearContent();

  ss.toast(id + " — " + projektNev, "Projekt mentve ✓", 5);
}

function navigalUgyfelBevitelre() {
  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Bevitel_Ügyfél").activate();
}

function navigalProjektBevitelre() {
  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Bevitel_Projekt").activate();
}
