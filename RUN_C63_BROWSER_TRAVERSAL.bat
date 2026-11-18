@echo off
setlocal
cd /d "%~dp0"
if not exist package.json (
 echo ERROR: Extract this package into the BLOB-HOST-CORE root next to package.json.
 pause
 exit /b 1
)
if not exist scripts\testC63RouteReadiness.mjs (
 echo ERROR: C63 route-readiness script missing. Install the earlier C63 test package first.
 pause
 exit /b 1
)
if not exist C63_TRAVERSAL_RESULTS mkdir C63_TRAVERSAL_RESULTS
node scripts\checkC63HubRouteAccess.mjs > C63_TRAVERSAL_RESULTS\static.txt 2>&1
if errorlevel 1 (echo Static test failed. See C63_TRAVERSAL_RESULTS\static.txt & pause & exit /b 1)
node scripts\testC63RouteReadiness.mjs > C63_TRAVERSAL_RESULTS\readiness.txt 2>&1
if errorlevel 1 (echo Readiness test failed. See C63_TRAVERSAL_RESULTS\readiness.txt & pause & exit /b 1)
echo Static and readiness checks passed.
echo.
echo Opening local game in your default browser.
echo IMPORTANT: This is a supervised traversal, not an automated browser test.
echo Keep this window open while testing. Use C63_TRAVERSAL_CHECKLIST.md to record findings.
start "" "http://127.0.0.1:5173"
call npm run dev
pause
