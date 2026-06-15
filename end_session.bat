@echo off
chcp 65001 >nul
cd /d C:\Claude\HVAC_ProjectHub

echo Valtozasok ellenorzese...
git status --short
echo.

git diff --quiet
if %errorlevel% == 0 (
    git diff --cached --quiet
    if %errorlevel% == 0 (
        echo Nincs valtozas, nincs mit commitolni.
        pause
        exit /b 0
    )
)

echo Commit uzenet (Enter = session frissites):
set /p MSG=""
if "%MSG%"=="" set MSG=Session frissites

git add -A
git commit -m "%MSG%"
git push origin main

echo.
echo Kesz! Commitolva es pusholva.
pause
