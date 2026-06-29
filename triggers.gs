// ── onEdit trigger — Művelet dropdownok kezelése ───────────────
// Ez a függvény automatikusan lefut minden cellaváltáskor.
// Figyeli a három Művelet dropdown cellát és elindítja a megfelelő scriptet.

var PLACEHOLDER = "— Válassz műveletet —";

function onEdit(e) {
  var value = e.value;
  if (!value || value === PLACEHOLDER) return;

  var sheet = e.source.getActiveSheet();
  var cell  = e.range.getA1Notation();
  var name  = sheet.getName();

  if (name === "Bevitel_Ügyfél" && cell === "B9") {
    e.range.setValue(PLACEHOLDER);
    if (value === "Ügyfél mentése") mentesUgyfelet();
  }

  if (name === "Bevitel_Projekt" && cell === "B9") {
    e.range.setValue(PLACEHOLDER);
    if (value === "Projekt mentése")          mentesProjektet();
    if (value === "→ Új ügyfél létrehozása")  navigalUgyfelBevitelre();
  }

  if (name === "Bevitel_Tétel" && cell === "B9") {
    e.range.setValue(PLACEHOLDER);
    if (value === "Tétel mentése") mentesTetel();
  }

  if (name === "Projekt_Nézet" && cell === "B4") {
    e.range.setValue(PLACEHOLDER);
    if (value === "Projekt betöltése")    frissitProjektNezet();
    if (value === "→ Következő státusz") kovetkezoStatusz();
  }

  if (name === "Ügyfél_Nézet" && cell === "B4") {
    e.range.setValue(PLACEHOLDER);
    if (value === "Ügyfél betöltése") frissitUgyfelNezet();
  }

  if (name === "Árajánlat_Szerkesztő" && cell === "B7") {
    e.range.setValue(PLACEHOLDER);
    if (value === "Árajánlat mentése") mentesArajanlat();
    if (value === "Sorok törlése")     torleArajanlatSorok();
  }

  // Katalógus auto-fill: ha a szerkesztőben az A oszlop valamelyik sorában választ
  if (name === "Árajánlat_Szerkesztő") {
    var sor = e.range.getRow();
    var col = e.range.getColumn();
    if (col === 1 && sor >= SOROK_KEZDETE && sor < SOROK_KEZDETE + SOROK_SZAMA && value) {
      tetelAutoFill(e.source, sheet, sor, value);
    }
  }
}
