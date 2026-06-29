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

  if (name === "Projekt_Nézet" && cell === "B4") {
    e.range.setValue(PLACEHOLDER);
    if (value === "Projekt betöltése")    frissitProjektNezet();
    if (value === "→ Következő státusz") kovetkezoStatusz();
  }

  if (name === "Ügyfél_Nézet" && cell === "B4") {
    e.range.setValue(PLACEHOLDER);
    if (value === "Ügyfél betöltése") frissitUgyfelNezet();
  }
}
