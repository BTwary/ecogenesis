@echo off
setlocal
cd /d "%~dp0"
title ECOGENESIS
if not exist ".env" (
  echo No .env file found. Run Setup-ECOGENESIS.bat first.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo Dependencies are not installed. Run Setup-ECOGENESIS.bat first.
  pause
  exit /b 1
)
node scripts\doctor.mjs
if errorlevel 1 (
  pause
  exit /b 1
)
echo.
echo Starting ECOGENESIS at http://localhost:3000
start "" http://localhost:3000
npm run dev
endlocal
