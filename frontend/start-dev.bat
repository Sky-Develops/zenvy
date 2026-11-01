@echo off
title ZENVY Frontend Dev Server
echo ========================================================
echo Starting ZENVY Frontend Development Server...
echo ========================================================
set PATH=C:\laragon\bin\nodejs\node-v20;%PATH%

cd /d "%~dp0"
call npm run dev
pause

