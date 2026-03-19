@echo off
REM Run full regression suite
cd /d "%~dp0.."
npx playwright test --project=regression --headed --workers=1
pause
