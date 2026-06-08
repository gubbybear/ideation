# ReachStack backend

Phase 0 scaffold. FastAPI service over hardcoded fixtures. The front end in [../ReachStack/](../ReachStack/) calls this directly.

## Run it

First time:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
```

Every time after:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

Then open http://localhost:8000/docs for the auto-generated API explorer.

## Endpoints

| Method | Path                          | Purpose                                  |
| ------ | ----------------------------- | ---------------------------------------- |
| GET    | `/api/dashboard`              | Metrics + recent queue items             |
| GET    | `/api/queue`                  | Queue list (optional `?filter=` param)   |
| GET    | `/api/queue/{id}`             | Single item with full review detail      |
| POST   | `/api/queue/{id}/action`      | Approve / escalate / hold / request_info |
| GET    | `/api/portal/{matter_id}`     | Client portal status (steps + files)     |
| POST   | `/api/portal/upload`          | Client file upload                       |
| GET    | `/api/audit`                  | Audit log                                |
| GET    | `/api/branding`               | Tenant branding config                   |
| PUT    | `/api/branding`               | Update branding config                   |

All responses are pulled from [app/fixtures.py](app/fixtures.py). No persistence yet. Mutating endpoints update the in-memory fixture for the lifetime of the process.

## Where this is going

- Phase 0: stub fixtures (now).
- Phase 0.5: SQLite + JSON config files for per-deployment settings, hand-edited by founders during the first SMB deployment.
- Phase 1: real ingest (file watcher / email / webhook), classifier, draft generation against Anthropic.
- Phase 2: GraphRAG retrieval, ontology layer, eval harness.
