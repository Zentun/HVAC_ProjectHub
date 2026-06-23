@echo off
chcp 65001 >nul

:: --- HVAC_ProjectHub ---
cd /d C:\Claude\HVAC_ProjectHub

echo [HVAC_ProjectHub] Valtozasok ellenorzese...
git status --short
echo.

git diff --quiet
if %errorlevel% == 0 (
    git diff --cached --quiet
    if %errorlevel% == 0 (
        echo [HVAC_ProjectHub] Nincs valtozas.
        goto dotfiles
    )
)

echo Commit uzenet (Enter = session frissites):
set /p MSG=""
if "%MSG%"=="" set MSG=Session frissites

git add -A
git commit -m "%MSG%"
git push origin main
echo.

:: --- dotfiles ---
:dotfiles
cd /d C:\Claude\claude-dotfiles

echo [dotfiles] Valtozasok ellenorzese...
git status --short
echo.

git diff --quiet
if %errorlevel% == 0 (
    git diff --cached --quiet
    if %errorlevel% == 0 (
        echo [dotfiles] Nincs valtozas.
        goto vege
    )
)

git add -A
git commit -m "dotfiles frissites"
git push origin master
echo.

:vege
echo Kesz!
pause
