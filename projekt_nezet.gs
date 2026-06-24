// ── Projekt Nézet ──────────────────────────────────────────────

var STATUSZ_LISTA = ["megkeresés", "felmérés", "árajánlat", "megrendelés", "telepítés", "lezárva"];

function setupProjektNezet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Projekt_Nézet") || ss.insertSheet("Projekt_Nézet");
  sheet.clear();

  // Fejléc
  sheet.getRange("A1:F1").merge()
    .setValue("PROJEKT NÉZET")
    .setFontSize(16).setFontWeight("bold")
    .setBackground("#1a73e8").setFontColor("#ffffff")
    .setHorizontalAlignment("center");

  // Projekt kiválasztó sor
  sheet.getRange("A3").setValue("Projekt ID:").setFontWeight("bold");
  var projektSheet = ss.getSheetByName("Projektek");
  var projektRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(projektSheet.getRange("A2:A1000"), true)
    .setAllowInvalid(false).build();
  sheet.getRange("B3")
    .setDataValidation(projektRule)
    .setBackground("#f8f9fa")
    .setBorder(true, true, true, true, false, false);

  // Művelet dropdown
  sheet.getRange("A4").setValue("Művelet:").setFontWeight("bold");
  var muveletRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["— Válassz műveletet —", "Projekt betöltése", "→ Következő státusz"], true)
    .setAllowInvalid(false).build();
  sheet.getRange("B4")
    .setValue("— Válassz műveletet —")
    .setDataValidation(muveletRule)
    .setBackground("#f8f9fa")
    .setBorder(true, true, true, true, false, false);

  // Placeholder
  sheet.getRange("A6").setValue("← Válassz projektet (B3), majd Művelet → Projekt betöltése")
    .setFontColor("#888888").setFontStyle("italic");

  // Oszlopszélességek
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 210);
  sheet.setColumnWidth(3, 30);  // elválasztó
  sheet.setColumnWidth(4, 160);
  sheet.setColumnWidth(5, 210);
  sheet.setColumnWidth(6, 120);

  sheet.setFrozenRows(4);

  ss.toast("Projekt_Nézet lap létrehozva!", "Kész", 4);
}

function frissitProjektNezet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Projekt_Nézet");

  var projektId = sheet.getRange("B3").getValue().toString().trim();
  if (!projektId) {
    ss.toast("Válassz projektet!", "Figyelem", 3);
    return;
  }

  // Régi adatok törlése (6. sortól — 1-4: fejléc+selector+művelet, 5: frozen)
  var lastRow = Math.max(sheet.getLastRow(), 60);
  if (lastRow >= 6) sheet.getRange(6, 1, lastRow - 5, 6).clearContent().clearFormat();

  // Projekt sor keresése
  var projektSheet = ss.getSheetByName("Projektek");
  var projektData = projektSheet.getDataRange().getValues();
  var projektRow = null;
  for (var i = 1; i < projektData.length; i++) {
    if (projektData[i][0] == projektId) { projektRow = projektData[i]; break; }
  }
  if (!projektRow) {
    sheet.getRange("A5").setValue("Nem található: " + projektId).setFontColor("#d93025");
    return;
  }

  var ugyfelId   = projektRow[1];
  var leiras     = projektRow[2];
  var tipus      = projektRow[3];
  var statusz    = projektRow[4];
  var letrehozva = projektRow[5] instanceof Date
    ? Utilities.formatDate(projektRow[5], "Europe/Budapest", "yyyy-MM-dd")
    : projektRow[5];
  var megjegyzes = projektRow[6];

  // Ügyfél sor keresése
  var ugyfelSheet = ss.getSheetByName("Ügyfelek");
  var ugyfelData = ugyfelSheet.getDataRange().getValues();
  var ugyfelRow = null;
  for (var i = 1; i < ugyfelData.length; i++) {
    if (ugyfelData[i][0] == ugyfelId) { ugyfelRow = ugyfelData[i]; break; }
  }

  var row = 6;

  var projektNev = ugyfelRow ? ugyfelRow[1] + " - " + leiras : leiras;

  // ── PROJEKT ADATOK ──────────────────────────────────────────
  _szekcioFejlec(sheet, row, "PROJEKT ADATOK", "#e8f0fe", "#1a73e8"); row++;
  _adatSor(sheet, row, "Projekt neve", projektNev,  "",           "");         row++;
  _adatSor(sheet, row, "Típus",        tipus,        "Létrehozva", letrehozva); row++;
  _adatSor(sheet, row, "Státusz",      statusz,      "",           "");         row++;
  if (megjegyzes) { _adatSor(sheet, row, "Megjegyzés", megjegyzes, "", ""); row++; }
  row++;

  // ── ÜGYFÉL ADATOK ───────────────────────────────────────────
  _szekcioFejlec(sheet, row, "ÜGYFÉL ADATOK", "#e6f4ea", "#137333"); row++;
  if (ugyfelRow) {
    _adatSor(sheet, row, "Név",     ugyfelRow[1], "Telefon", ugyfelRow[2]); row++;
    _adatSor(sheet, row, "Email",   ugyfelRow[3], "Cím",     ugyfelRow[4]); row++;
  } else {
    sheet.getRange(row, 2).setValue("Nem található: " + ugyfelId).setFontColor("#d93025");
    row++;
  }
  row++;

  // ── STÁTUSZ PIPELINE ────────────────────────────────────────
  _szekcioFejlec(sheet, row, "STÁTUSZ PIPELINE", "#fce8e6", "#c5221f"); row++;
  _statuszPipeline(sheet, row, statusz); row += 2;

  // ── ÁRAJÁNLATOK ─────────────────────────────────────────────
  var arajanlatSheet = ss.getSheetByName("Árajánlatok");
  var arajanlatRows = _szurAdatokat(arajanlatSheet, projektId, 1);

  _szekcioFejlec(sheet, row, "ÁRAJÁNLATOK (" + arajanlatRows.length + ")", "#fff8e1", "#f9ab00"); row++;
  if (arajanlatRows.length > 0) {
    _tablazatFejlec(sheet, row, ["Árajánlat_ID", "Dátum", "Nettó (Ft)", "Bruttó (Ft)", "Státusz"]); row++;
    for (var i = 0; i < arajanlatRows.length; i++) {
      var r = arajanlatRows[i];
      sheet.getRange(row, 1, 1, 5).setValues([[r[0], _datum(r[2]), r[3], r[5], r[6]]]);
      row++;
    }
  } else {
    _uresSzekció(sheet, row); row++;
  }
  row++;

  // ── SZÁMLÁK ─────────────────────────────────────────────────
  var szamlaSheet = ss.getSheetByName("Számla");
  var szamlaRows = _szurAdatokat(szamlaSheet, projektId, 1);

  _szekcioFejlec(sheet, row, "SZÁMLÁK (" + szamlaRows.length + ")", "#f3e8ff", "#7b1fa2"); row++;
  if (szamlaRows.length > 0) {
    _tablazatFejlec(sheet, row, ["Számla_ID", "Kiállítva", "Fiz. határidő", "Bruttó (Ft)", "Státusz"]); row++;
    for (var i = 0; i < szamlaRows.length; i++) {
      var r = szamlaRows[i];
      sheet.getRange(row, 1, 1, 5).setValues([[r[0], _datum(r[2]), _datum(r[3]), r[6], r[7]]]);
      row++;
    }
  } else {
    _uresSzekció(sheet, row); row++;
  }
  row++;

  // ── MUNKALAPOK ──────────────────────────────────────────────
  var munkalapSheet = ss.getSheetByName("Munkalap");
  var munkalapRows = _szurAdatokat(munkalapSheet, projektId, 1);

  _szekcioFejlec(sheet, row, "MUNKALAPOK (" + munkalapRows.length + ")", "#e8f5e9", "#2e7d32"); row++;
  if (munkalapRows.length > 0) {
    _tablazatFejlec(sheet, row, ["Munkalap_ID", "Dátum", "Elvégzett munkák", "Szerelő"]); row++;
    for (var i = 0; i < munkalapRows.length; i++) {
      var r = munkalapRows[i];
      sheet.getRange(row, 1, 1, 4).setValues([[r[0], _datum(r[2]), r[3], r[5]]]);
      row++;
    }
  } else {
    _uresSzekció(sheet, row); row++;
  }
  row++;

  // ── FELMÉRÉSEK ──────────────────────────────────────────────
  var felmeresSheet = ss.getSheetByName("Felmérés");
  var felmeresRows = _szurAdatokat(felmeresSheet, projektId, 1);

  _szekcioFejlec(sheet, row, "FELMÉRÉSEK (" + felmeresRows.length + ")", "#e3f2fd", "#0d47a1"); row++;
  if (felmeresRows.length > 0) {
    _tablazatFejlec(sheet, row, ["Felmérés_ID", "Dátum", "Elképzelés", "Felmérte"]); row++;
    for (var i = 0; i < felmeresRows.length; i++) {
      var r = felmeresRows[i];
      sheet.getRange(row, 1, 1, 4).setValues([[r[0], _datum(r[2]), r[3], r[5]]]);
      row++;
    }
  } else {
    _uresSzekció(sheet, row); row++;
  }

  ss.toast(projektId + " betöltve", "Projekt Nézet ✓", 3);
}

function kovetkezoStatusz() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Projekt_Nézet");
  var projektId = sheet.getRange("B3").getValue().toString().trim();
  if (!projektId) { ss.toast("Nincs kiválasztott projekt!", "Figyelem", 3); return; }

  var projektSheet = ss.getSheetByName("Projektek");
  var data = projektSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == projektId) {
      var jelenlegi = data[i][4];
      var idx = STATUSZ_LISTA.indexOf(jelenlegi);
      if (idx < 0 || idx === STATUSZ_LISTA.length - 1) {
        ss.toast("A projekt már lezárva, vagy ismeretlen státuszban van.", "Figyelem", 4);
        return;
      }
      var ujStatusz = STATUSZ_LISTA[idx + 1];
      projektSheet.getRange(i + 1, 4).setValue(ujStatusz);
      ss.toast(jelenlegi + "  →  " + ujStatusz, "Státusz frissítve ✓", 4);
      frissitProjektNezet();
      return;
    }
  }
  ss.toast("Nem található: " + projektId, "Hiba", 3);
}

// ── Segédfüggvények ────────────────────────────────────────────

function _szekcioFejlec(sheet, row, text, bg, color) {
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue(text)
    .setFontWeight("bold").setFontSize(11)
    .setBackground(bg).setFontColor(color)
    .setHorizontalAlignment("left");
}

function _adatSor(sheet, row, label1, val1, label2, val2) {
  sheet.getRange(row, 1).setValue(label1).setFontWeight("bold").setFontColor("#444444");
  sheet.getRange(row, 2).setValue(val1);
  if (label2) {
    sheet.getRange(row, 4).setValue(label2).setFontWeight("bold").setFontColor("#444444");
    sheet.getRange(row, 5).setValue(val2);
  }
}

function _tablazatFejlec(sheet, row, headers) {
  for (var i = 0; i < headers.length; i++) {
    sheet.getRange(row, i + 1)
      .setValue(headers[i])
      .setFontWeight("bold")
      .setBackground("#f1f3f4")
      .setFontColor("#333333");
  }
}

function _uresSzekció(sheet, row) {
  sheet.getRange(row, 1).setValue("— nincs adat —")
    .setFontColor("#aaaaaa").setFontStyle("italic");
}

function _szurAdatokat(sheet, projektId, oszlop) {
  var data = sheet.getDataRange().getValues();
  var eredmeny = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][oszlop] == projektId) eredmeny.push(data[i]);
  }
  return eredmeny;
}

function _datum(val) {
  if (val instanceof Date) return Utilities.formatDate(val, "Europe/Budapest", "yyyy-MM-dd");
  return val;
}

function _statuszPipeline(sheet, row, aktiv) {
  var bgPassziv  = ["#e3f2fd", "#fff9c4", "#fff3e0", "#fce4ec", "#e8f5e9", "#ede7f6"];
  var bgAktiv    = ["#1565c0", "#f57f17", "#e65100", "#880e4f", "#1b5e20", "#4527a0"];

  for (var i = 0; i < STATUSZ_LISTA.length; i++) {
    var s = STATUSZ_LISTA[i];
    var cell = sheet.getRange(row, i + 1);
    if (s === aktiv) {
      cell.setValue("▶ " + s)
        .setBackground(bgAktiv[i]).setFontColor("#ffffff")
        .setFontWeight("bold").setHorizontalAlignment("center");
    } else {
      cell.setValue(s)
        .setBackground(bgPassziv[i]).setFontColor("#999999")
        .setFontWeight("normal").setHorizontalAlignment("center");
    }
  }
}
