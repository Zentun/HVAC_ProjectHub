# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

HVAC_ProjectHub is a project management hub for HVAC (Heating, Ventilation, and Air Conditioning) work. The repository is hosted at https://github.com/Zentun/HVAC_ProjectHub.

## Repository

- **Branch:** `main`
- **Remote:** `origin` → `https://github.com/Zentun/HVAC_ProjectHub.git`

## Általános szabályok

- Mindig magyarul válaszolj.
- **Session végén:** mindig frissítsd ezt a fájlt — jelöld meg az elvégzett feladatokat a "Következő lépések" szekcióban, és adj hozzá bármit, ami megváltozott (új fájlok, döntések, struktúraváltozások). Csak valóban megváltozott dolgokat írj bele.

## `end session` kulcsszó

Ha a beszélgetésben beírod: **`end session`**

Claude elvégzi a session lezárását:

1. Ellenőrzi a változásokat (`git status`) a `C:\Claude\HVAC_ProjectHub` mappában
2. Ha van változás: megkérdezi a commit üzenetet (alapértelmezett: `Session frissites`), majd `git add -A` + commit + `git push origin main`
3. Ellenőrzi a változásokat a `C:\Claude\claude-dotfiles` mappában
4. Ha ott is van változás: `git add -A` + commit -m `dotfiles frissites` + `git push origin master`
5. Ha sehol nincs változás: jelzi, hogy nincs teendő

## Tech stack

- **Adatbázis:** Google Sheets (egy spreadsheet, több fül)
- **Logika / UI:** Google Apps Script (JavaScript alapú makrók)
- **Nincs külön backend, szerver vagy webalkalmazás**

## Google Spreadsheet

- **URL:** https://docs.google.com/spreadsheets/d/1NRzPoGMrGA73iLObZBDAFU16fEJhAjrd5qR_BALXq2Y/edit
- **Neve:** HVAC_Adatbázis
- **Létrehozva:** 2026-06-12

## Adatstruktúra — táblák (fülek)

### Ügyfelek
| Oszlop | Típus | Megjegyzés |
|---|---|---|
| Ügyfél_ID | Szöveg | Auto-generált, pl. `U-0001` |
| Név | Szöveg | |
| Telefon | Szöveg | |
| Email | Szöveg | |
| Cím | Szöveg | |
| Létrehozva | Dátum | |
| Megjegyzés | Szöveg | |

### Projektek
| Oszlop | Típus | Megjegyzés |
|---|---|---|
| Projekt_ID | Szöveg | Auto-generált, pl. `P-2026-0001` |
| Ügyfél_ID | Szöveg | Kötelező |
| Leírás | Szöveg | Kötelező — projekt neve = Ügyfél neve + " - " + Leírás |
| Típus | Lista | telepítés / karbantartás / javítás |
| Státusz | Lista | megkeresés → felmérés → árajánlat → megrendelés → telepítés → lezárva |
| Létrehozva | Dátum | |
| Megjegyzés | Szöveg | |

### Felmérés
| Oszlop | Típus | Megjegyzés |
|---|---|---|
| Felmérés_ID | Szöveg | Auto-generált, pl. `F-0001` |
| Projekt_ID | Szöveg | |
| Dátum | Dátum | |
| Elképzelés | Szöveg | |
| Tervezett_anyagok | Szöveg | |
| Felmérte | Szöveg | |
| Megjegyzés | Szöveg | |

### Árajánlatok
| Oszlop | Típus | Megjegyzés |
|---|---|---|
| Árajánlat_ID | Szöveg | Auto-generált, pl. `A-0001` |
| Projekt_ID | Szöveg | |
| Dátum | Dátum | |
| Nettó_összeg | Szám | Számított (sorok összege) |
| ÁFA_% | Szám | pl. 27 |
| Bruttó_összeg | Szám | Számított |
| Státusz | Lista | elküldve / elfogadva / elutasítva |
| Megjegyzés | Szöveg | |

### Árajánlat_sorok
| Oszlop | Típus | Megjegyzés |
|---|---|---|
| Sor_ID | Szöveg | Auto-generált, pl. `AS-0001` |
| Árajánlat_ID | Szöveg | |
| Tétel_ID | Szöveg | Opcionális — üres, ha ad-hoc tétel |
| Megnevezés | Szöveg | Katalógusból töltve vagy kézzel |
| Mennyiség | Szám | |
| Egység | Szöveg | db / m / m² / kg / óra / csomag |
| Egységár_nettó | Szám | Katalógusból töltve vagy kézzel |
| Összesen_nettó | Szám | Számított: Mennyiség × Egységár |

### Árajánlat_tételek (katalógus)
| Oszlop | Típus | Megjegyzés |
|---|---|---|
| Tétel_ID | Szöveg | Auto-generált, pl. `T-0001` |
| Kategória | Lista | berendezés / szerelési anyag |
| Megnevezés | Szöveg | |
| Egység | Szöveg | db / m / m² / kg / óra / csomag |
| Egységár_nettó | Szám | |
| Megjegyzés | Szöveg | |

### Munkalap
| Oszlop | Típus | Megjegyzés |
|---|---|---|
| Munkalap_ID | Szöveg | Auto-generált, pl. `M-0001` |
| Projekt_ID | Szöveg | |
| Dátum | Dátum | |
| Elvégzett_munkák | Szöveg | |
| Felhasznált_anyagok | Szöveg | |
| Szerelő | Szöveg | |
| Változtatások | Szöveg | |
| Megjegyzés | Szöveg | |

### Számla
| Oszlop | Típus | Megjegyzés |
|---|---|---|
| Számla_ID | Szöveg | Auto-generált, pl. `SZ-2026-0001` |
| Projekt_ID | Szöveg | |
| Kiállítva | Dátum | |
| Fizetési_határidő | Dátum | |
| Nettó_összeg | Szám | |
| ÁFA_% | Szám | |
| Bruttó_összeg | Szám | Számított |
| Státusz | Lista | kiállítva / fizetve / késedelmes |

## Táblakapcsolatok

```
Ügyfelek
Projektek            → Ügyfél_ID
Felmérés             → Projekt_ID
Árajánlatok          → Projekt_ID
Árajánlat_sorok      → Árajánlat_ID, (Tétel_ID opcionális)
Árajánlat_tételek    (katalógus, standalone)
Munkalap             → Projekt_ID
Számla               → Projekt_ID
```

## Fájlok a repositoryban

- `CLAUDE.md` — ez a fájl
- `README.md` — projekt leírás placeholder
- `Ugyfelnyilvantarto_WorkDiary.docx` — eredeti tervezési dokumentum
- `createHVACDatabase.gs` — létrehozza az adatbázis spreadsheet összes fülét
- `bevitel.gs` — beviteli lapok és mentési makrók (ügyfél + projekt)
- `projekt_nezet.gs` — projekt nézet lap: adatok, státusz pipeline, kapcsolódó rekordok
- `triggers.gs` — onEdit trigger: Művelet dropdown cellák kezelik a beviteli és nézet lapok akcióit
- `start_claude.bat` — Claude Code indítása üdvözlő prompttal

## Elvégzett feladatok

- [x] Adatbázis struktúra tervezése (összes fül, oszlopok, kapcsolatok)
- [x] `createHVACDatabase.gs` megírva és futtatva — spreadsheet létrehozva
- [x] `bevitel.gs` megírva: `Bevitel_Ügyfél` és `Bevitel_Projekt` lapok, ID auto-generálás, mentési makrók
- [x] `end_session.bat` és `start_claude.bat` létrehozva

## Következő lépések

- [x] `setupBevitelSheetsek()` futtatása a spreadsheet-ben (beviteli lapok létrehozása)
- [x] Gombok helyett lenyíló menük (dropdown) a beviteli lapokon — `triggers.gs` kezeli az `onEdit` triggerrel
- [x] `projekt_nezet.gs` megírva — Projekt_Nézet lap, státusz pipeline, kapcsolódó rekordok
- [x] `triggers.gs` megírva — onEdit trigger, minden Művelet dropdown kezelése
- `triggers.gs` + `projekt_nezet.gs` Apps Script szerkesztőbe másolása, `setupProjektNezet()` futtatása
- `setupBevitelSheetsek()` újrafuttatása (dropdown frissítés) + triggers.gs telepítése után tesztelés
- Dashboard fül tervezése és megírása
