@echo off
REM Launch the ReachStack mockup in a browser.
REM Starts the FastAPI fixture backend and the Next.js front end.
REM Double-click this file from Windows File Explorer.

setlocal EnableDelayedExpansion
title ReachStack launcher

echo === ReachStack launcher ===
echo Script folder: %~dp0
echo.

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "FRONTEND_DIR=%ROOT%ReachStack"

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found on PATH.
  echo Install Node.js from https://nodejs.org and try again.
  goto :end
)

where python >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Python was not found on PATH.
  echo Install Python 3.11+ and try again.
  goto :end
)

REM ---------- Backend ----------
cd /d "%BACKEND_DIR%"
if errorlevel 1 (
  echo [ERROR] Could not change directory to "%BACKEND_DIR%".
  goto :end
)

if not exist ".venv\Scripts\python.exe" (
  echo Backend virtual environment not found. Creating ".venv"...
  python -m venv .venv
  if errorlevel 1 (
    echo [ERROR] Could not create backend virtual environment.
    goto :end
  )
)

echo Installing/updating backend package...
call ".venv\Scripts\python.exe" -m pip install -e .
if errorlevel 1 (
  echo [ERROR] Backend install failed. See messages above.
  goto :end
)

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>nul
if errorlevel 1 (
  echo Starting backend on http://localhost:8000
  start "ReachStack backend" /min /D "%BACKEND_DIR%" cmd /k ".venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"
) else (
  echo Backend already running on http://localhost:8000
)

REM ---------- Frontend ----------
cd /d "%FRONTEND_DIR%"
if errorlevel 1 (
  echo [ERROR] Could not change directory to "%FRONTEND_DIR%".
  goto :end
)
echo Working directory: %CD%
echo.

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
echo Close the separate "ReachStack backend" window to stop the backend.
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
