@echo off
cd /d "%~dp0"
node scripts\testC63RouteReadiness.mjs
set EXITCODE=%ERRORLEVEL%
echo.
if not "%EXITCODE%"=="0" echo FAILED: send a screenshot of this window.
if "%EXITCODE%"=="0" echo PASS: C63 readiness logic. Browser traversal still pending.
pause
exit /b %EXITCODE%
