@echo off
REM Debug a specific test — usage: debug-test.bat "TC_LOGIN_001"
cd /d "%~dp0.."
npx playwright test --debug -g "%~1"
pause
