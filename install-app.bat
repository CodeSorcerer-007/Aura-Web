@echo off
setlocal
title Aura - Installation & Setup

echo ========================================================
echo        AURA - 100%% Offline Mindful Productivity
echo ========================================================
echo.
echo Installing dependencies and preparing offline application...
echo.

cd /d "%~dp0"

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed. Please ensure Node.js is installed.
    pause
    exit /b 1
)

echo.
echo Building offline production bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)

echo.
echo Creating Desktop shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-shortcut.ps1"

echo.
echo ========================================================
echo [SUCCESS] Aura is installed and ready to use!
echo.
echo 1. A shortcut 'Aura' has been added to your Desktop and Start Menu.
echo 2. Double-click the Desktop shortcut to open Aura in full screen anytime!
echo ========================================================
echo.
pause
