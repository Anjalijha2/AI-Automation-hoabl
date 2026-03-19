@echo off
REM Run smoke test suite
cd /d "%~dp0.."
npx playwright test --project=smoke --headed --workers=1
pause
