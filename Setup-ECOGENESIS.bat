@echo off
setlocal
cd /d "%~dp0"
title ECOGENESIS First-Time Setup
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install Node.js 22.16 or newer from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)
node scripts\setup.mjs --start
if errorlevel 1 (
  echo.
  echo Setup did not complete. Read the error above, correct it, and run this file again.
  pause
  exit /b 1
)
endlocal
