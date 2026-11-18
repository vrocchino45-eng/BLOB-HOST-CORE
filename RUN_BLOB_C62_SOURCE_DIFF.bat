@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
  py -3 "tools\connection62\source_diff.py"
) else (
  python "tools\connection62\source_diff.py"
)
echo.
echo Upload C62_SOURCE_DIFF_RESULTS.zip to ChatGPT.
pause
