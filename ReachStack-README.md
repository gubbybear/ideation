# ReachStack Mockup Launch Guide

This guide is for launching the ReachStack mockup on a new laptop.

ReachStack currently runs as two local services:

- Frontend: Next.js app in `ReachStack/`
- Backend: FastAPI fixture service in `backend/`

The backend is fixture-backed. Changes made in the app are kept in memory while the backend is running and reset when it restarts.

## Requirements

Install these before launching:

- Git
- Node.js LTS, with `npm` on PATH
- Python 3.11 or newer, with `python` on PATH
- A modern browser

On Windows, after installing Node.js or Python, open a new terminal so PATH changes are picked up.

## Get The Repo

Clone the repo, then enter the repo folder:

```powershell
git clone <repo-url>
cd ideation
```

If the repo is already on the laptop, open:

```text
C:\Users\<you>\Documents\GitHub\ideation
```

## Easiest Launch

From the repo root, run:

```powershell
.\launch-reachstack.bat
```

Or double-click:

```text
launch-reachstack.bat
```

The launcher will:

- check that `npm` is available
- check that `python` is available
- create `backend\.venv` if it does not exist
- install the backend package
- start the FastAPI backend on `http://localhost:8000`
- run `npm install` in `ReachStack/` if `node_modules` is missing
- start the frontend on `http://localhost:3000`
- open the app in the browser

Open the app at:

```text
http://localhost:3000
```

The backend API docs are available at:

```text
http://localhost:8000/docs
```

## Manual Launch

Use this if the batch file fails or you want separate terminals.

Terminal 1, backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
uvicorn app.main:app --reload --port 8000
```

Terminal 2, frontend:

```powershell
cd ReachStack
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Expected Ports

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:8000` |
| Backend docs | `http://localhost:8000/docs` |
| Backend health check | `http://localhost:8000/api/health` |

## Check That It Is Working

In PowerShell:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
```

Expected result:

```json
{"status":"ok"}
```

Also check the frontend:

```powershell
curl.exe -I http://localhost:3000
```

Expected result includes:

```text
HTTP/1.1 200 OK
```

## Stopping The App

Frontend:

- Press `Ctrl+C` in the launcher or frontend terminal.

Backend:

- Close the separate `ReachStack backend` terminal window, or press `Ctrl+C` in the backend terminal if launched manually.

## Troubleshooting

### The dashboard keeps loading

The backend is probably not running.

Check:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
```

If it times out or fails, restart:

```powershell
.\launch-reachstack.bat
```

### `npm was not found on PATH`

Install Node.js LTS, then open a new terminal:

```text
https://nodejs.org
```

Check:

```powershell
npm --version
```

### `Python was not found on PATH`

Install Python 3.11 or newer and select "Add Python to PATH" during installation.

Check:

```powershell
python --version
```

### PowerShell blocks virtual environment activation

The batch launcher avoids this by calling the venv Python directly.

If launching manually and activation is blocked, use:

```powershell
backend\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### Port 3000 or 8000 is already in use

Close old ReachStack terminals first.

To inspect ports:

```powershell
Get-NetTCPConnection -LocalPort 3000,8000 -ErrorAction SilentlyContinue
```

If port `8000` is already running, the launcher will reuse it. If the frontend port is busy, stop the old frontend terminal and launch again.

### Browser still shows an old favicon or stale UI

Hard refresh the browser:

```text
Ctrl+F5
```

If needed, stop and restart the launcher.

## Project Layout

```text
ideation/
  launch-reachstack.bat      # one-command Windows launcher
  backend/                   # FastAPI fixture backend
  ReachStack/                # Next.js frontend
  taxonomy.md                # document taxonomy
  sourceoftruth.md           # source-of-truth model
```

## What The Demo Contains

The mockup includes:

- Admin / Partner view switch
- Dashboard with assistant-first interface
- Queue and review workflow
- Calendar and bookings
- Clients and engagements
- Client portal
- Documents with source-of-truth modelling
- Search
- Time reporting
- Timesheets
- Audit
- Settings

## Notes For Development

Frontend type check:

```powershell
cd ReachStack
npx tsc --noEmit
```

Backend compile check:

```powershell
python -m compileall backend\app
```

The frontend expects the backend at:

```text
http://localhost:8000
```

That default lives in:

```text
ReachStack\lib\api.ts
```
