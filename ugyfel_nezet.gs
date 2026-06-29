// ── Ügyfél Nézet ──────────────────────────────────────────────

function setupUgyfelNezet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Ügyfél_Nézet") || ss.insertSheet("Ügyfél_Nézet");
  sheet.clear();

  // Fejléc
  sheet.getRange("A1:F1").merge()
    .setValue("ÜGYFÉL NÉZET")
    .setFontSize(16).setFontWeight("bold")
    .setBackground("#137333").setFontColor("#ffffff")
    .setHorizontalAlignment("center");

  // Ügyfél kiválasztó sor
  sheet.getRange("A3").setValue("Ügyfél:").setFontWeight("bold");
  var ugyfelSheet = ss.getSheetByName("Ügyfelek");
  var ugyfelRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(ugyfelSheet.getRange("B2:B1000"), true)
    .setAllowInvalid(false).build();
  sheet.getRange("B3")
    .setDataValidation(ugyfelRule)
    .setBackground("#f8f9fa")
    .setBorder(true, true, true, true, false, false);

  // Művelet dropdown
  sheet.getRange("A4").setValue("Művelet:").setFontWeight("bold");
  var muveletRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["— Válassz műveletet —", "Ügyfél betöltése"], true)
    .setAllowInvalid(false).build();
  sheet.getRange("B4")
    .setValue("— Válassz műveletet —")
    .setDataValidation(muveletRule)
    .setBackground("#f8f9fa")
    .setBorder(true, true, true, true, false, false);

  // Placeholder
  sheet.getRange("A6").setValue("← Válassz ügyfelet (B3 lenyíló), majd Művelet → Ügyfél betöltése")
    .setFontColor("#888888").setFontStyle("italic");

  // Oszlopszélességek
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 30);
  sheet.setColumnWidth(4, 130);
  sheet.setColumnWidth(5, 180);
  sheet.setColumnWidth(6, 120);

  sheet.setFrozenRows(4);

  ss.toast("Ügyfél_Nézet lap létrehozva!", "Kész", 4);
}

function frissitUgyfelNezet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Ügyfél_Nézet");

  var ugyfelNev = sheet.getRange("B3").getValue().toString().trim();
  if (!ugyfelNev) {
    ss.toast("Válassz ügyfelet!", "Figyelem", 3);
    return;
  }

  // Régi adatok törlése
  var lastRow = Math.max(sheet.getLastRow(), 60);
  if (lastRow >= 6) sheet.getRange(6, 1, lastRow - 5, 6).clearContent().clearFormat();

  // Ügyfél keresése név alapján
  var ugyfelSheet = ss.getSheetByName("Ügyfelek");
  var ugyfelData = ugyfelSheet.getDataRange().getValues();
  var ugyfelRow = null;
  var ugyfelId = null;
  for (var i = 1; i < ugyfelData.length; i++) {
    if (ugyfelData[i][1] == ugyfelNev) { ugyfelRow = ugyfelData[i]; ugyfelId = ugyfelData[i][0]; break; }
  }
  if (!ugyfelRow) {
    sheet.getRange("A5").setValue("Nem található: " + ugyfelNev).setFontColor("#d93025");
    return;
  }

  var letrehozva = ugyfelRow[5] instanceof Date
    ? Utilities.formatDate(ugyfelRow[5], "Europe/Budapest", "yyyy-MM-dd")
    : ugyfelRow[5];
  var megjegyzes = ugyfelRow[6];

  var row = 6;

  // ── ÜGYFÉL ADATOK ───────────────────────────────────────────
  _szekcioFejlec(sheet, row, "ÜGYFÉL ADATOK", "#e6f4ea", "#137333"); row++;
  _adatSor(sheet, row, "Név",        ugyfelRow[1], "Telefon", ugyfelRow[2]); row++;
  _adatSor(sheet, row, "Email",      ugyfelRow[3], "Cím",     ugyfelRow[4]); row++;
  _adatSor(sheet, row, "Létrehozva", letrehozva,   "",        "");           row++;
  if (megjegyzes) { _adatSor(sheet, row, "Megjegyzés", megjegyzes, "", ""); row++; }
  row++;

  // ── PROJEKTEK ───────────────────────────────────────────────
  var projektSheet = ss.getSheetByName("Projektek");
  var projektData = projektSheet.getDataRange().getValues();
  var projektRows = [];
  for (var i = 1; i < projektData.length; i++) {
    if (!projektData[i][0]) continue;
    if (projektData[i][1] == ugyfelId) projektRows.push(projektData[i]);
  }

  _szekcioFejlec(sheet, row, "PROJEKTEK (" + projektRows.length + ")", "#e8f0fe", "#1a73e8"); row++;
  if (projektRows.length > 0) {
    _tablazatFejlec(sheet, row, ["Projekt neve", "Típus", "Státusz", "Létrehozva"]); row++;
    for (var i = 0; i < projektRows.length; i++) {
      var r = projektRows[i];
      var pNev = r[7] || (r[3] + " - " + r[2]);
      sheet.getRange(row, 1, 1, 4).setValues([[pNev, r[3], r[4], _datum(r[5])]]);
      row++;
    }
  } else {
    _uresSzekció(sheet, row); row++;
  }

  ss.toast(ugyfelNev + " betöltve", "Ügyfél Nézet ✓", 3);
}
