@echo off
setlocal
cd /d "%~dp0"
set "ROOT=%~dp0"
for %%I in ("%ROOT%.") do set "ROOT=%%~fI"
for /f "usebackq delims=" %%F in (`powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; $d=New-Object System.Windows.Forms.OpenFileDialog; $d.Filter='ZIP files (*.zip)|*.zip'; $d.Title='Select original Connection 61 ZIP'; if($d.ShowDialog() -eq 'OK'){$d.FileName}"`) do set "BASE=%%F"
if not defined BASE (echo No ZIP selected.& pause & exit /b 1)
py -3 "%~dp0check_normalized.py" "%BASE%" "%ROOT%" > "%~dp0C62_NORMALIZED_REPORT.json"
if errorlevel 1 python "%~dp0check_normalized.py" "%BASE%" "%ROOT%" > "%~dp0C62_NORMALIZED_REPORT.json"
echo Report: %~dp0C62_NORMALIZED_REPORT.json
pause
