@echo off
chcp 65001 >nul

echo [dotfiles] Frissites githubrol...
cd /d "C:\Claude\claude-dotfiles"
git pull
echo.

echo [HVAC_ProjectHub] Frissites githubrol...
cd /d "C:\Claude\HVAC_ProjectHub"
git pull
echo.

powershell -NoExit -Command "Set-Location 'C:\Claude\HVAC_ProjectHub'; claude 'Olvasd el a CLAUDE.md-t, foglald ossze hol tartunk a projektben, es kerdezes meg mivel folytatjuk.'"
