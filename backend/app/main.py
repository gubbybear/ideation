"""ReachStack backend — Phase 0 scaffold.

FastAPI service over hardcoded fixtures. The React front end in ../ReachStack/
calls these endpoints directly. No persistence yet: mutating endpoints update
the in-memory fixtures for the lifetime of the process.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

SYDNEY_TZ = ZoneInfo("Australia/Sydney")


def now_sydney_iso() -> str:
    """ISO 8601 timestamp in Sydney local time, including offset."""
    return datetime.now(SYDNEY_TZ).isoformat(timespec="seconds")

from app import fixtures
from app.models import (
    ActionRequest,
    ActionResponse,
    AuditEvent,
    AuditResponse,
    BookingCreateRequest,
    BookingRecord,
    BrandingConfig,
    BrandingUpdate,
    ClientRecord,
    ClientWorkspace,
    DashboardResponse,
    DocumentRecord,
    EngagementRecord,
    PortalStatus,
    QueueItemDetail,
    QueueListItem,
    RetrievalCitation,
    RetrievalRequest,
    RetrievalResponse,
    SearchResult,
    TimeEntryCreateRequest,
    TimeEntryRecord,
    TimesheetRecord,
    UploadResponse,
)

app = FastAPI(
    title="ReachStack backend",
    version="0.1.0",
    description="Phase 0 scaffold. Stub endpoints over fixture data.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# ---------- Dashboard ----------

@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard() -> DashboardResponse:
    return fixtures.dashboard_response()


# ---------- Queue ----------

@app.get("/api/queue", response_model=list[QueueListItem])
def list_queue(filter: str | None = None) -> list[QueueListItem]:
    items = fixtures.QUEUE_LIST
    if filter is None or filter.lower() == "all":
        return items
    f = filter.lower()
    if f == "urgent":
        return [i for i in items if i.status in ("partner", "hold")]
    if f == "review":
        return [i for i in items if i.status == "review"]
    if f == "missing info":
        return [i for i in items if i.status == "hold"]
    if f == "partner":
        return [i for i in items if i.status == "partner"]
    return items


@app.get("/api/queue/{item_id}", response_model=QueueItemDetail)
def get_queue_item(item_id: str) -> QueueItemDetail:
    detail = fixtures.QUEUE_DETAILS.get(item_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Queue item {item_id} not found")
    return detail


@app.post("/api/queue/{item_id}/action", response_model=ActionResponse)
def act_on_queue_item(item_id: str, req: ActionRequest) -> ActionResponse:
    detail = fixtures.QUEUE_DETAILS.get(item_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Queue item {item_id} not found")

    new_status = {
        "approve": "file",
        "escalate": "partner",
        "hold": "hold",
        "request_info": "draft",
    }[req.action]
    detail.status = new_status  # type: ignore[assignment]

    for li in fixtures.QUEUE_LIST:
        if li.id == item_id:
            li.status = new_status  # type: ignore[assignment]
            break

    event_id = f"evt_{uuid.uuid4().hex[:8]}"
    fixtures.AUDIT_EVENTS.insert(
        0,
        AuditEvent(
            time=now_sydney_iso(),
            event=f"Action: {req.action}",
            user="M. Turner",
            matter=detail.matter_code,
            status="success",
        ),
    )

    return ActionResponse(
        item_id=item_id,
        action=req.action,
        new_status=new_status,  # type: ignore[arg-type]
        audit_event_id=event_id,
    )


# ---------- Portal ----------

@app.get("/api/portal/{matter_id}", response_model=PortalStatus)
def get_portal_status(matter_id: str) -> PortalStatus:
    portal = fixtures.PORTAL_STATUS.get(matter_id)
    if portal is None:
        raise HTTPException(status_code=404, detail=f"Matter {matter_id} not found")
    return portal


@app.post("/api/portal/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(matter_id: str, file: UploadFile) -> UploadResponse:
    portal = fixtures.PORTAL_STATUS.get(matter_id)
    if portal is None:
        raise HTTPException(status_code=404, detail=f"Matter {matter_id} not found")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    size_str = f"{size_mb:.1f} MB" if size_mb >= 0.1 else f"{len(contents) / 1024:.0f} KB"

    from app.models import PortalFile
    portal_file = PortalFile(name=file.filename or "untitled", size=size_str, status="processing")
    portal.files.insert(0, portal_file)

    fixtures.AUDIT_EVENTS.insert(
        0,
        AuditEvent(
            time=now_sydney_iso(),
            event="Portal upload received",
            user="Client",
            matter=matter_id,
            status="success",
        ),
    )

    return UploadResponse(file=portal_file, matter_id=matter_id)


# ---------- Audit ----------

@app.get("/api/audit", response_model=AuditResponse)
def get_audit() -> AuditResponse:
    return AuditResponse(
        metrics=fixtures.ASSURANCE_METRICS,
        events=fixtures.AUDIT_EVENTS,
    )


# ---------- Branding ----------

@app.get("/api/branding", response_model=BrandingConfig)
def get_branding() -> BrandingConfig:
    return fixtures.BRANDING


@app.put("/api/branding", response_model=BrandingConfig)
def update_branding(update: BrandingUpdate) -> BrandingConfig:
    current = fixtures.BRANDING
    if update.theme is not None:
        valid = {o.name for o in current.available_themes}
        if update.theme not in valid:
            raise HTTPException(status_code=400, detail=f"Unknown theme: {update.theme}")
        current.theme = update.theme
    if update.density is not None:
        current.density = update.density
    if update.privacy_posture is not None:
        current.privacy_posture = update.privacy_posture
    return current


# ---------- Professional services operations ----------

@app.get("/api/clients", response_model=list[ClientRecord])
def list_clients() -> list[ClientRecord]:
    return fixtures.CLIENTS


@app.get("/api/clients/{client_id}/workspace", response_model=ClientWorkspace)
def get_client_workspace(client_id: str) -> ClientWorkspace:
    client = next((c for c in fixtures.CLIENTS if c.id == client_id), None)
    if client is None:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found")

    engagements = [e for e in fixtures.ENGAGEMENTS if e.client_id == client_id]
    bookings = [b for b in fixtures.BOOKINGS if b.client_id == client_id]
    documents = [d for d in fixtures.DOCUMENTS if d.client_id == client_id]
    time_entries = [t for t in fixtures.TIME_ENTRIES if t.client_id == client_id]
    records = fixtures.ops_search_results(client_id=client_id)

    return ClientWorkspace(
        client=client,
        engagements=engagements,
        bookings=bookings,
        documents=documents,
        time_entries=time_entries,
        records=records,
    )


@app.get("/api/engagements", response_model=list[EngagementRecord])
def list_engagements() -> list[EngagementRecord]:
    return fixtures.ENGAGEMENTS


@app.get("/api/bookings", response_model=list[BookingRecord])
def list_bookings(client_id: str | None = None) -> list[BookingRecord]:
    if client_id:
        return [b for b in fixtures.BOOKINGS if b.client_id == client_id]
    return fixtures.BOOKINGS


@app.post("/api/bookings", response_model=BookingRecord, status_code=status.HTTP_201_CREATED)
def create_booking(req: BookingCreateRequest) -> BookingRecord:
    if not any(c.id == req.client_id for c in fixtures.CLIENTS):
        raise HTTPException(status_code=404, detail=f"Client {req.client_id} not found")
    if not any(e.id == req.engagement_id for e in fixtures.ENGAGEMENTS):
        raise HTTPException(status_code=404, detail=f"Engagement {req.engagement_id} not found")

    booking = BookingRecord(
        id=f"book_{uuid.uuid4().hex[:8]}",
        status="booked",
        **req.model_dump(),
    )
    fixtures.BOOKINGS.insert(0, booking)
    fixtures.AUDIT_EVENTS.insert(
        0,
        AuditEvent(
            time=now_sydney_iso(),
            event="Booking created",
            user=booking.staff,
            matter=booking.engagement_id,
            status="success",
        ),
    )
    return booking


@app.get("/api/documents", response_model=list[DocumentRecord])
def list_documents(client_id: str | None = None) -> list[DocumentRecord]:
    if client_id:
        return [d for d in fixtures.DOCUMENTS if d.client_id == client_id]
    return fixtures.DOCUMENTS


@app.get("/api/time", response_model=list[TimeEntryRecord])
def list_time_entries(client_id: str | None = None) -> list[TimeEntryRecord]:
    if client_id:
        return [t for t in fixtures.TIME_ENTRIES if t.client_id == client_id]
    return fixtures.TIME_ENTRIES


@app.post("/api/time", response_model=TimeEntryRecord, status_code=status.HTTP_201_CREATED)
def create_time_entry(req: TimeEntryCreateRequest) -> TimeEntryRecord:
    if not any(c.id == req.client_id for c in fixtures.CLIENTS):
        raise HTTPException(status_code=404, detail=f"Client {req.client_id} not found")
    if not any(e.id == req.engagement_id for e in fixtures.ENGAGEMENTS):
        raise HTTPException(status_code=404, detail=f"Engagement {req.engagement_id} not found")

    entry = TimeEntryRecord(
        id=f"time_{uuid.uuid4().hex[:8]}",
        status="draft",
        source="Manual",
        **req.model_dump(),
    )
    fixtures.TIME_ENTRIES.insert(0, entry)
    fixtures.AUDIT_EVENTS.insert(
        0,
        AuditEvent(
            time=now_sydney_iso(),
            event="Time entry recorded",
            user=entry.staff,
            matter=entry.engagement_id,
            status="info",
        ),
    )
    return entry


@app.get("/api/timesheets", response_model=list[TimesheetRecord])
def list_timesheets() -> list[TimesheetRecord]:
    return fixtures.TIMESHEETS


@app.get("/api/search", response_model=list[SearchResult])
def search_records(q: str | None = None, client_id: str | None = None) -> list[SearchResult]:
    return fixtures.ops_search_results(query=q, client_id=client_id)


@app.post("/api/retrieval", response_model=RetrievalResponse)
def retrieve_records(req: RetrievalRequest) -> RetrievalResponse:
    matches = fixtures.ops_search_results(query=req.query, client_id=req.client_id)[:4]
    if req.engagement_id:
        scoped = [m for m in matches if m.engagement_id == req.engagement_id]
        if scoped:
            matches = scoped

    if not matches:
        return RetrievalResponse(
            answer="No matching records were found in the indexed client workspace.",
            citations=[],
        )

    subject = fixtures._client_name(req.client_id) if req.client_id else "the indexed records"
    answer = (
        f"ReachStack found {len(matches)} relevant record"
        f"{'' if len(matches) == 1 else 's'} for {subject}. "
        f"The strongest signal is '{matches[0].title}', which says: {matches[0].snippet}"
    )
    citations = [
        RetrievalCitation(
            title=m.title,
            source_type=m.type,
            snippet=m.snippet,
            score=m.score,
        )
        for m in matches
    ]
    return RetrievalResponse(answer=answer, citations=citations)
