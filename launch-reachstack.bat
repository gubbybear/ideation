@echo off
REM Launch the ReachStack front-end mockup in a browser.
REM Double-click this file from Windows File Explorer.

setlocal EnableDelayedExpansion
title ReachStack launcher

echo === ReachStack launcher ===
echo Script folder: %~dp0
echo.

cd /d "%~dp0ReachStack"
if errorlevel 1 (
  echo [ERROR] Could not change directory to "%~dp0ReachStack".
  goto :end
)
echo Working directory: %CD%
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found on PATH.
  echo Install Node.js from https://nodejs.org and try again.
  goto :end
)

if not exist "node_modules" (
  echo node_modules not found. Running "npm install" ^(first run only, can take a few minutes^)...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed. See messages above.
    goto :end
  )
) else (
  echo Dependencies already installed.
)

echo.
echo Starting Next.js dev server on http://localhost:3000
echo Press Ctrl+C in this window to stop the server.
echo A browser tab will open in a few seconds.
echo.

start "" /min cmd /c "timeout /t 5 >nul && start http://localhost:3000"

call npm run dev

echo.
echo Dev server exited.

:end
echo.
echo Press any key to close this window...
pause >nul
endlocal
