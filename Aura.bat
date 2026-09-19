@echo off
cd /d "%~dp0"

:: Check if preview server is already running on port 4173
powershell -Command "try { $t = Test-NetConnection -ComputerName localhost -Port 4173 -WarningAction SilentlyContinue; exit ($t.TcpTestSucceeded ? 0 : 1) } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    start /B npm run preview >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Launch browser in borderless standalone app mode
where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start msedge --app=http://localhost:4173/
    exit /b 0
)

where chrome >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start chrome --app=http://localhost:4173/
    exit /b 0
)

:: Fallback
start http://localhost:4173/
exit /b 0
