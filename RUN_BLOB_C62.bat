@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\connection62\run-local.ps1"
echo.
echo Press any key to close this window.
pause >nul
