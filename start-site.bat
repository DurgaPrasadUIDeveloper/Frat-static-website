@echo off
rem Starts a local web server for this site so the YouTube video can play inside the page.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
echo.
pause
