"""ReachStack backend - Phase 0 scaffold.

FastAPI service over hardcoded fixtures. The React front end in ../ReachStack/
calls these endpoints directly. No persistence yet: mutating endpoints update
the in-memory fixtures for the lifetime of the process.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from app.ai import answer_text, answer_with_openai, build_citations

SYDNEY_TZ = ZoneInfo("Australia/Sydney")


def now_sydney_iso() -> str:
    """ISO 8601 timestamp in Sydney local time, including offset."""
    return datetime.now(SYDNEY_TZ).isoformat(timespec="seconds")

from app import fixtures
from app.models import (
    ActionRequest,
    ActionResponse,
    AgentAction,
    AgentActionExecuteRequest,
    AgentActionExecuteResponse,
    AuditEvent,
    AuditResponse,
    BookingCreateRequest,
    BookingRecord,
    BrandingConfig,
    BrandingUpdate,
    ChangeRecord,
    ChangeUndoResponse,
    ClientRecord,
    ClientWorkspace,
    DashboardResponse,
    DocumentRecord,
    DocumentUpdateRequest,
    EngagementRecord,
    PortalFile,
    PortalStatus,
    QueueItemDetail,
    QueueListItem,
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


def _record_session_change(
    *,
    title: str,
    summary: str,
    actor: str,
    target_type: str,
    target_id: str,
    operation: str,
    before: dict | None,
    after: dict | None,
    reversible: bool,
    audit_event_id: str | None = None,
    undo_of: str | None = None,
) -> ChangeRecord:
    change = ChangeRecord(
        id=f"chg_{uuid.uuid4().hex[:8]}",
        session_id=fixtures.CHANGE_SESSION_ID,
        time=now_sydney_iso(),
        title=title,
        summary=summary,
        actor=actor,
        target_type=target_type,
        target_id=target_id,
        operation=operation,  # type: ignore[arg-type]
        before=before,
        after=after,
        reversible=reversible,
        undo_of=undo_of,
        audit_event_id=audit_event_id,
    )
    fixtures.CHANGE_RECORDS.insert(0, change)
    return change


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

    list_item = next((li for li in fixtures.QUEUE_LIST if li.id == item_id), None)
    before = {
        "detail_status": detail.status,
        "list_status": list_item.status if list_item else None,
    }
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
    _record_session_change(
        title=f"Queue action: {req.action}",
        summary=f"Changed {detail.title} from {before['detail_status']} to {new_status}.",
        actor="M. Turner",
        target_type="queue",
        target_id=item_id,
        operation="update",
        before=before,
        after={
            "detail_status": detail.status,
            "list_status": new_status,
        },
        reversible=True,
        audit_event_id=event_id,
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

    audit_event_id = f"evt_{uuid.uuid4().hex[:8]}"
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
    _record_session_change(
        title="Portal file uploaded",
        summary=f"Added {portal_file.name} to {matter_id}.",
        actor="Client",
        target_type="portal_file",
        target_id=f"{matter_id}:{portal_file.name}",
        operation="create",
        before=None,
        after={"matter_id": matter_id, "file": portal_file.model_dump()},
        reversible=True,
        audit_event_id=audit_event_id,
    )

    return UploadResponse(file=portal_file, matter_id=matter_id)


# ---------- Audit ----------

@app.get("/api/audit", response_model=AuditResponse)
def get_audit() -> AuditResponse:
    return AuditResponse(
        metrics=fixtures.ASSURANCE_METRICS,
        events=fixtures.AUDIT_EVENTS,
        session_id=fixtures.CHANGE_SESSION_ID,
        changes=fixtures.CHANGE_RECORDS,
    )


@app.post("/api/audit/changes/{change_id}/undo", response_model=ChangeUndoResponse)
def undo_session_change(change_id: str) -> ChangeUndoResponse:
    change = next((item for item in fixtures.CHANGE_RECORDS if item.id == change_id), None)
    if change is None:
        raise HTTPException(status_code=404, detail=f"Change {change_id} not found")

    if not change.reversible:
        return ChangeUndoResponse(
            change_id=change_id,
            status="blocked",
            message="This change is recorded for audit but is not reversible.",
            change=change,
        )
    if change.reverted:
        return ChangeUndoResponse(
            change_id=change_id,
            status="blocked",
            message="This change has already been undone.",
            change=change,
        )

    before_undo: dict | None = None
    after_undo: dict | None = None

    if change.target_type == "document":
        if not change.before:
            return ChangeUndoResponse(change_id=change_id, status="blocked", message="No document snapshot is available.", change=change)
        index = next((i for i, doc in enumerate(fixtures.DOCUMENTS) if doc.id == change.target_id), None)
        if index is None:
            return ChangeUndoResponse(change_id=change_id, status="blocked", message="The document no longer exists.", change=change)
        before_undo = fixtures.DOCUMENTS[index].model_dump()
        restored = DocumentRecord(**change.before)
        fixtures.DOCUMENTS[index] = restored
        after_undo = restored.model_dump()

    elif change.target_type == "queue":
        if not change.before:
            return ChangeUndoResponse(change_id=change_id, status="blocked", message="No queue snapshot is available.", change=change)
        detail = fixtures.QUEUE_DETAILS.get(change.target_id)
        if detail is None:
            return ChangeUndoResponse(change_id=change_id, status="blocked", message="The queue item no longer exists.", change=change)
        list_item = next((item for item in fixtures.QUEUE_LIST if item.id == change.target_id), None)
        before_undo = {
            "detail_status": detail.status,
            "list_status": list_item.status if list_item else None,
        }
        detail.status = change.before["detail_status"]  # type: ignore[assignment]
        if list_item and change.before.get("list_status"):
            list_item.status = change.before["list_status"]  # type: ignore[assignment]
        after_undo = {
            "detail_status": detail.status,
            "list_status": list_item.status if list_item else None,
        }

    elif change.target_type == "booking":
        before_undo = change.after
        original_count = len(fixtures.BOOKINGS)
        fixtures.BOOKINGS[:] = [booking for booking in fixtures.BOOKINGS if booking.id != change.target_id]
        if len(fixtures.BOOKINGS) == original_count:
            return ChangeUndoResponse(change_id=change_id, status="blocked", message="The booking no longer exists.", change=change)

    elif change.target_type == "time":
        before_undo = change.after
        original_count = len(fixtures.TIME_ENTRIES)
        fixtures.TIME_ENTRIES[:] = [entry for entry in fixtures.TIME_ENTRIES if entry.id != change.target_id]
        if len(fixtures.TIME_ENTRIES) == original_count:
            return ChangeUndoResponse(change_id=change_id, status="blocked", message="The time entry no longer exists.", change=change)

    elif change.target_type == "portal_file":
        if not change.after:
            return ChangeUndoResponse(change_id=change_id, status="blocked", message="No portal file snapshot is available.", change=change)
        matter_id = str(change.after.get("matter_id") or "")
        file_data = change.after.get("file") or {}
        file_name = str(file_data.get("name") or "")
        portal = fixtures.PORTAL_STATUS.get(matter_id)
        if portal is None:
            return ChangeUndoResponse(change_id=change_id, status="blocked", message="The portal matter no longer exists.", change=change)
        before_undo = change.after
        original_count = len(portal.files)
        portal.files[:] = [portal_file for portal_file in portal.files if portal_file.name != file_name]
        if len(portal.files) == original_count:
            return ChangeUndoResponse(change_id=change_id, status="blocked", message="The portal file no longer exists.", change=change)

    elif change.target_type == "branding":
        if not change.before:
            return ChangeUndoResponse(change_id=change_id, status="blocked", message="No branding snapshot is available.", change=change)
        before_undo = fixtures.BRANDING.model_dump()
        fixtures.BRANDING = BrandingConfig(**change.before)
        after_undo = fixtures.BRANDING.model_dump()

    else:
        return ChangeUndoResponse(
            change_id=change_id,
            status="blocked",
            message=f"Undo is not implemented for {change.target_type} changes.",
            change=change,
        )

    change.reverted = True
    audit_event_id = f"evt_{uuid.uuid4().hex[:8]}"
    fixtures.AUDIT_EVENTS.insert(
        0,
        AuditEvent(
            time=now_sydney_iso(),
            event=f"Undo: {change.title}",
            user="Admin",
            matter=change.target_id,
            status="success",
        ),
    )
    undo_change = _record_session_change(
        title=f"Undo: {change.title}",
        summary=f"Restored previous state for {change.target_type} {change.target_id}.",
        actor="Admin",
        target_type=change.target_type,
        target_id=change.target_id,
        operation="undo",
        before=before_undo,
        after=after_undo,
        reversible=False,
        audit_event_id=audit_event_id,
        undo_of=change.id,
    )

    return ChangeUndoResponse(
        change_id=change_id,
        status="completed",
        message=f"Undid {change.title}.",
        change=undo_change,
    )


# ---------- Branding ----------

@app.get("/api/branding", response_model=BrandingConfig)
def get_branding() -> BrandingConfig:
    return fixtures.BRANDING


@app.put("/api/branding", response_model=BrandingConfig)
def update_branding(update: BrandingUpdate) -> BrandingConfig:
    current = fixtures.BRANDING
    before = current.model_dump()
    if update.theme is not None:
        valid = {o.name for o in current.available_themes}
        if update.theme not in valid:
            raise HTTPException(status_code=400, detail=f"Unknown theme: {update.theme}")
        current.theme = update.theme
    if update.density is not None:
        current.density = update.density
    if update.privacy_posture is not None:
        current.privacy_posture = update.privacy_posture
    _record_session_change(
        title="Branding updated",
        summary="Updated tenant branding configuration.",
        actor="Admin",
        target_type="branding",
        target_id="tenant-branding",
        operation="update",
        before=before,
        after=current.model_dump(),
        reversible=True,
    )
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
    _record_session_change(
        title="Booking created",
        summary=f"Created booking {booking.title} for {booking.staff}.",
        actor=booking.staff,
        target_type="booking",
        target_id=booking.id,
        operation="create",
        before=None,
        after=booking.model_dump(),
        reversible=True,
    )
    return booking


@app.get("/api/documents", response_model=list[DocumentRecord])
def list_documents(client_id: str | None = None) -> list[DocumentRecord]:
    if client_id:
        return [d for d in fixtures.DOCUMENTS if d.client_id == client_id]
    return fixtures.DOCUMENTS


@app.patch("/api/documents/{document_id}", response_model=DocumentRecord)
def update_document(document_id: str, req: DocumentUpdateRequest) -> DocumentRecord:
    document = next((doc for doc in fixtures.DOCUMENTS if doc.id == document_id), None)
    if document is None:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
    if not document.name.lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="The mock editor is only available for Word documents.")
    if document.local_editing != "enabled":
        raise HTTPException(status_code=400, detail="This document must be edited in its source system.")

    before = document.model_dump()
    document.snippet = req.snippet
    document.version = (document.version or 0) + 1
    if document.approval_status == "approved":
        document.approval_status = "review"
    if document.status == "indexed":
        document.status = "needs_review"
    if document.source_of_truth == "shared" or document.external_system:
        document.sync_status = "sync_pending"

    audit_event_id = f"evt_{uuid.uuid4().hex[:8]}"
    fixtures.AUDIT_EVENTS.insert(
        0,
        AuditEvent(
            time=now_sydney_iso(),
            event="Document edited",
            user=document.owner,
            matter=document.engagement_id,
            status="success",
        ),
    )
    _record_session_change(
        title="Document edited",
        summary=f"Updated {document.name} in the mock editor.",
        actor=document.owner,
        target_type="document",
        target_id=document.id,
        operation="update",
        before=before,
        after=document.model_dump(),
        reversible=True,
        audit_event_id=audit_event_id,
    )
    return document


@app.post("/api/agent/actions/execute", response_model=AgentActionExecuteResponse)
def execute_agent_action(req: AgentActionExecuteRequest) -> AgentActionExecuteResponse:
    action = req.action
    if action.type != "revise_and_approve_document":
        raise HTTPException(status_code=400, detail=f"Unsupported agent action: {action.type}")

    document = next((doc for doc in fixtures.DOCUMENTS if doc.id == action.target_id), None)
    if document is None:
        raise HTTPException(status_code=404, detail=f"Document {action.target_id} not found")

    warnings = list(action.warnings)
    if document.source_of_truth == "external" or document.local_editing != "enabled":
        warnings.append("External source-of-truth documents must be changed in the authoritative system.")
        return AgentActionExecuteResponse(
            action_id=action.id,
            status="blocked",
            message=f"{document.name} is read-only in ReachStack.",
            document=document,
            warnings=warnings,
        )

    expected_version = action.payload.get("expected_version")
    current_version = str(document.version or 0)
    if expected_version and expected_version != current_version:
        warnings.append("The document changed after this action was proposed. Re-run the assistant before approving.")
        return AgentActionExecuteResponse(
            action_id=action.id,
            status="blocked",
            message=f"{document.name} is on v{current_version}, but the action expected v{expected_version}.",
            document=document,
            warnings=warnings,
        )

    before = document.model_dump()
    new_snippet = action.payload.get("new_snippet")
    if new_snippet:
        document.snippet = new_snippet
    document.version = (document.version or 0) + 1
    document.approval_status = "approved"
    document.status = "indexed"
    if document.source_of_truth == "shared" or document.external_system:
        document.sync_status = "sync_pending"

    audit_event_id = f"evt_{uuid.uuid4().hex[:8]}"
    fixtures.AUDIT_EVENTS.insert(
        0,
        AuditEvent(
            time=now_sydney_iso(),
            event="Agent action: document revised and approved",
            user=document.owner,
            matter=document.engagement_id,
            status="success",
        ),
    )
    change = _record_session_change(
        title="Document revised and approved",
        summary=f"Revised {document.name} and marked it approved.",
        actor=document.owner,
        target_type="document",
        target_id=document.id,
        operation="update",
        before=before,
        after=document.model_dump(),
        reversible=True,
        audit_event_id=audit_event_id,
    )

    return AgentActionExecuteResponse(
        action_id=action.id,
        status="completed",
        message=f"{document.name} was revised locally and marked approved.",
        document=document,
        audit_event_id=audit_event_id,
        change_id=change.id,
        warnings=warnings,
    )


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
    _record_session_change(
        title="Time entry recorded",
        summary=f"Recorded {entry.hours}h for {entry.activity}.",
        actor=entry.staff,
        target_type="time",
        target_id=entry.id,
        operation="create",
        before=None,
        after=entry.model_dump(),
        reversible=True,
    )
    return entry


@app.get("/api/timesheets", response_model=list[TimesheetRecord])
def list_timesheets() -> list[TimesheetRecord]:
    return fixtures.TIMESHEETS


@app.get("/api/search", response_model=list[SearchResult])
def search_records(q: str | None = None, client_id: str | None = None) -> list[SearchResult]:
    return fixtures.ops_search_results(query=q, client_id=client_id)


RETRIEVAL_STOPWORDS = {
    "about",
    "across",
    "after",
    "all",
    "and",
    "any",
    "are",
    "client",
    "clients",
    "could",
    "for",
    "from",
    "have",
    "into",
    "need",
    "needs",
    "our",
    "please",
    "record",
    "records",
    "should",
    "show",
    "that",
    "the",
    "this",
    "today",
    "what",
    "when",
    "where",
    "which",
    "with",
    "work",
}

RETRIEVAL_TYPE_HINTS: dict[str, set[str]] = {
    "queue": {"customer", "escalated", "escalation", "inbound", "item", "items", "queue", "review"},
    "document": {"approval", "approvals", "document", "documents", "draft", "drafted", "file", "files"},
    "booking": {"booking", "bookings", "calendar", "calendars", "meeting", "schedule"},
    "time": {"billable", "billing", "submitted", "time", "timesheet", "timesheets"},
    "client": {"client", "clients", "customer", "customers"},
    "engagement": {"engagement", "engagements", "matter", "matters", "service"},
}

CONTROLLED_RECORD_TYPE_TERMS: dict[str, set[str]] = {
    "client": {"client", "clients", "customer", "customers"},
    "engagement": {"engagement", "engagements", "matter", "matters"},
    "document": {"document", "documents", "file", "files", "doc", "docs"},
    "queue": {"queue", "escalation", "escalations", "inbound", "customer service"},
    "booking": {"booking", "bookings", "calendar", "calendars", "meeting", "meetings", "schedule"},
    "time": {"time", "timesheet", "timesheets", "hours", "billable", "billing", "billed"},
    "audit": {"audit", "audits", "history"},
}

CONTROLLED_STATUS_TERMS = {
    "indexed",
    "processing",
    "needs review",
    "needs_review",
    "external changed",
    "external_changed",
    "local changed",
    "local_changed",
    "sync pending",
    "sync_pending",
    "sync failed",
    "sync_failed",
    "conflict",
    "not synced",
    "not_synced",
    "synced",
    "draft",
    "submitted",
    "approved",
    "rejected",
    "booked",
    "available",
    "completed",
    "cancelled",
    "no show",
    "no_show",
    "partner",
    "hold",
    "file",
    "logged",
}

CONTROLLED_STATUS_ALIASES: dict[str, str] = {
    "need review": "needs review",
    "needing review": "needs review",
    "needs reviewing": "needs review",
    "drafted": "draft",
    "on hold": "hold",
    "not synced": "not synced",
    "sync failed": "sync failed",
    "sync pending": "sync pending",
}


@dataclass
class ControlledScope:
    client_id: str | None = None
    staff: set[str] = field(default_factory=set)
    record_types: set[str] = field(default_factory=set)
    document_types: set[str] = field(default_factory=set)
    document_subtypes: set[str] = field(default_factory=set)
    source_of_truth: set[str] = field(default_factory=set)
    source_systems: set[str] = field(default_factory=set)
    statuses: set[str] = field(default_factory=set)
    required_terms: set[str] = field(default_factory=set)

    @property
    def has_filters(self) -> bool:
        return bool(
            self.client_id
            or self.staff
            or self.record_types
            or self.document_types
            or self.document_subtypes
            or self.source_of_truth
            or self.source_systems
            or self.statuses
            or self.required_terms
        )


def _query_tokens(query: str) -> list[str]:
    words = []
    token = ""
    for char in query.lower():
        if char.isalnum():
            token += char
        elif token:
            words.append(token)
            token = ""
    if token:
        words.append(token)
    return [word for word in words if len(word) > 2 and word not in RETRIEVAL_STOPWORDS]


def _all_query_tokens(query: str) -> list[str]:
    words = []
    token = ""
    for char in query.lower():
        if char.isalnum():
            token += char
        elif token:
            words.append(token)
            token = ""
    if token:
        words.append(token)
    return words


def _normalise_text(value: str) -> str:
    return " ".join(_all_query_tokens(value.replace("_", " ")))


def _phrase_in_query(query_normalised: str, phrase: str) -> bool:
    phrase_normalised = _normalise_text(phrase)
    return bool(phrase_normalised and f" {phrase_normalised} " in f" {query_normalised} ")


def _infer_client_id_from_query(query: str) -> str | None:
    query_lower = query.lower()
    tokens = set(_query_tokens(query))
    for client in fixtures.CLIENTS:
        client_name = client.name.lower()
        client_tokens = set(_query_tokens(client.name))
        if client_name in query_lower or (client_tokens and client_tokens.issubset(tokens)):
            return client.id
    return None


def _controlled_scope(req: RetrievalRequest) -> ControlledScope:
    query_normalised = _normalise_text(req.query)
    scope = ControlledScope(client_id=req.client_id or _infer_client_id_from_query(req.query))

    for record_type, terms in CONTROLLED_RECORD_TYPE_TERMS.items():
        if any(_phrase_in_query(query_normalised, term) for term in terms):
            scope.record_types.add(record_type)

    if _phrase_in_query(query_normalised, "timesheet") or _phrase_in_query(query_normalised, "timesheets"):
        scope.required_terms.add("timesheet")
        scope.record_types.add("time")

    for doc_type in {doc.doc_type for doc in fixtures.DOCUMENTS}:
        if _phrase_in_query(query_normalised, doc_type):
            scope.document_types.add(_normalise_text(doc_type))
            scope.record_types.add("document")

    for subtype in {doc.subtype for doc in fixtures.DOCUMENTS}:
        if _phrase_in_query(query_normalised, subtype):
            scope.document_subtypes.add(_normalise_text(subtype))
            scope.record_types.add("document")

    for source in {doc.source_system for doc in fixtures.DOCUMENTS} | {doc.source for doc in fixtures.DOCUMENTS}:
        if _phrase_in_query(query_normalised, source):
            scope.source_systems.add(_normalise_text(source))
            scope.record_types.add("document")

    for source_of_truth in {"external", "reachstack", "shared"}:
        if _phrase_in_query(query_normalised, source_of_truth):
            scope.source_of_truth.add(source_of_truth)
            scope.record_types.add("document")

    for status in CONTROLLED_STATUS_TERMS:
        if _phrase_in_query(query_normalised, status):
            scope.statuses.add(_normalise_text(status))

    for alias, canonical in CONTROLLED_STATUS_ALIASES.items():
        if _phrase_in_query(query_normalised, alias):
            scope.statuses.add(_normalise_text(canonical))

    for staff in (
        {entry.staff for entry in fixtures.TIME_ENTRIES}
        | {booking.staff for booking in fixtures.BOOKINGS}
        | {sheet.staff for sheet in fixtures.TIMESHEETS}
    ):
        staff_normalised = _normalise_text(staff)
        surname = staff_normalised.split()[-1] if staff_normalised else ""
        if _phrase_in_query(query_normalised, staff) or (surname and _phrase_in_query(query_normalised, surname)):
            scope.staff.add(staff_normalised)

    return scope


def _candidate_text(candidate: SearchResult) -> str:
    return _normalise_text(" ".join([
        candidate.type,
        candidate.title,
        candidate.subtitle,
        candidate.snippet,
    ]))


def _client_matches_candidate(client_id: str, candidate: SearchResult) -> bool:
    if candidate.client_id == client_id:
        return True

    client = next((item for item in fixtures.CLIENTS if item.id == client_id), None)
    if not client:
        return False

    text = _candidate_text(candidate)
    client_tokens = [
        token for token in _all_query_tokens(client.name)
        if token not in {"group", "holdings", "industries", "dental", "pty", "ltd"}
    ]
    return any(token in text for token in client_tokens)


def _matches_any(candidate_text: str, terms: set[str]) -> bool:
    return any(term and term in candidate_text for term in terms)


def _apply_controlled_scope(candidates: list[SearchResult], scope: ControlledScope) -> list[SearchResult]:
    if not scope.has_filters:
        return candidates

    filtered: list[SearchResult] = []
    for candidate in candidates:
        text = _candidate_text(candidate)
        if scope.client_id and not _client_matches_candidate(scope.client_id, candidate):
            continue
        if scope.record_types and candidate.type not in scope.record_types:
            continue
        if scope.staff and not _matches_any(text, scope.staff):
            continue
        if scope.document_types and not _matches_any(text, scope.document_types):
            continue
        if scope.document_subtypes and not _matches_any(text, scope.document_subtypes):
            continue
        if scope.source_of_truth and not _matches_any(text, scope.source_of_truth):
            continue
        if scope.source_systems and not _matches_any(text, scope.source_systems):
            continue
        if scope.statuses and not _matches_any(text, scope.statuses):
            continue
        if scope.required_terms and not _matches_any(text, scope.required_terms):
            continue
        filtered.append(candidate)
    return filtered


def _ranked_retrieval_matches(
    req: RetrievalRequest,
    limit: int = 8,
    scope: ControlledScope | None = None,
) -> list[SearchResult]:
    scope = scope or _controlled_scope(req)
    matches = _apply_controlled_scope(fixtures.ops_search_results(query=req.query), scope)
    if req.engagement_id:
        scoped = [match for match in matches if match.engagement_id == req.engagement_id]
        if scoped:
            matches = scoped
    if matches:
        return matches[:limit]

    candidates = _apply_controlled_scope(fixtures.ops_search_results(), scope)
    if req.engagement_id:
        scoped_candidates = [
            match for match in candidates
            if match.engagement_id in (None, req.engagement_id)
        ]
        if scoped_candidates:
            candidates = scoped_candidates

    tokens = _query_tokens(req.query)
    if not tokens:
        return candidates[:limit]

    scored: list[tuple[int, float, int, SearchResult]] = []
    for index, candidate in enumerate(candidates):
        haystack = " ".join([
            candidate.type,
            candidate.title,
            candidate.subtitle,
            candidate.snippet,
        ]).lower()
        token_score = sum(1 for token in tokens if token in haystack)
        hint_score = 0
        type_hints = RETRIEVAL_TYPE_HINTS.get(candidate.type, set())
        if type_hints.intersection(tokens):
            hint_score += 2
        if candidate.type == "queue" and {"customer", "service"}.issubset(tokens):
            hint_score += 3
        token_score += hint_score
        if token_score:
            scored.append((token_score, candidate.score, -index, candidate))

    if not scored:
        return candidates[:limit]

    if "submitted" in tokens:
        submitted_scored = [
            scored_match for scored_match in scored
            if " - submitted" in scored_match[3].subtitle.lower()
        ]
        if submitted_scored:
            scored = submitted_scored

    scored.sort(reverse=True)
    return [candidate for _, _, _, candidate in scored[:limit]]


def _is_agent_action_request(query: str) -> bool:
    query_normalised = _normalise_text(query)
    action_terms = {
        "approve",
        "apply",
        "change",
        "finalise",
        "finalize",
        "mark approved",
        "revise",
        "update",
    }
    document_terms = {
        "document",
        "documents",
        "draft",
        "email",
        "file",
        "memo",
        "request",
    }
    return (
        any(_phrase_in_query(query_normalised, term) for term in action_terms)
        and any(_phrase_in_query(query_normalised, term) for term in document_terms)
    )


def _document_for_search_result(result: SearchResult) -> DocumentRecord | None:
    if result.type != "document":
        return None
    return next((doc for doc in fixtures.DOCUMENTS if doc.id == result.id), None)


def _document_action_score(doc: DocumentRecord, tokens: list[str]) -> int:
    haystack = " ".join([
        doc.name,
        doc.doc_type,
        doc.subtype,
        doc.source,
        doc.source_of_truth,
        doc.source_system,
        doc.approval_status or "",
        doc.status,
        " ".join(doc.tags),
        doc.snippet,
    ]).lower()
    return sum(1 for token in tokens if token in haystack)


def _candidate_documents_for_action(req: RetrievalRequest, matches: list[SearchResult]) -> list[DocumentRecord]:
    seen: set[str] = set()
    candidates: list[DocumentRecord] = []
    for match in matches:
        document = _document_for_search_result(match)
        if document and document.id not in seen:
            candidates.append(document)
            seen.add(document.id)

    client_id = req.client_id or _infer_client_id_from_query(req.query)
    pool = [
        doc for doc in fixtures.DOCUMENTS
        if doc.id not in seen and (client_id is None or doc.client_id == client_id)
    ]
    tokens = _query_tokens(req.query)
    scored = [
        (score, doc)
        for doc in pool
        if (score := _document_action_score(doc, tokens)) > 0
    ]
    scored.sort(key=lambda item: item[0], reverse=True)
    candidates.extend(doc for _, doc in scored)
    return candidates


def _proposed_document_revision(doc: DocumentRecord) -> str:
    revisions = {
        "doc-2003": (
            "Approved recommendation retains the existing unit trust, adds the 30 June distribution-minute update, "
            "and flags the advice as ready for partner sign-off."
        ),
        "doc-2008": (
            "Approved request asks Elliot Hargrove to resend Annexures B and D, names the partner review blocker, "
            "and sets the deadline before the 30 June tax planning sign-off."
        ),
        "doc-2016": (
            "Approved follow-up confirms the missing approval required for the entity structure memo and asks the "
            "client to respond before the 30 June deadline."
        ),
        "doc-2020": (
            "Approved checklist confirms conflict check, director ID capture, ATO agent link, and Xero connection "
            "as the next onboarding steps."
        ),
    }
    return revisions.get(
        doc.id,
        f"Approved version: {doc.snippet}",
    )


def _agent_action_for_document(doc: DocumentRecord) -> AgentAction | None:
    if doc.source_of_truth == "external" or doc.local_editing != "enabled":
        return None
    if doc.approval_status == "approved":
        return None

    warnings = [
        "Local demo action only; no email, calendar, or accounting connector will be called.",
        "Execution will be re-validated by the backend before any mock state changes.",
    ]
    if doc.source_of_truth == "shared" or doc.external_system:
        warnings.append("This shared document will be left sync pending after local approval.")

    return AgentAction(
        id=f"agent-doc-approve-{doc.id}-v{doc.version or 0}",
        type="revise_and_approve_document",
        label=f"Revise and approve {doc.name}",
        description=(
            "Apply a short local revision, mark the document approved, and write an audit event. "
            "This stays inside the demo data."
        ),
        target_type="document",
        target_id=doc.id,
        target_title=doc.name,
        requires_approval=True,
        button_label="Apply change and approve",
        payload={
            "document_id": doc.id,
            "expected_version": str(doc.version or 0),
            "new_snippet": _proposed_document_revision(doc),
            "revision_note": "Thin agentic demo revision generated from fixture context.",
        },
        warnings=warnings,
    )


def _agent_actions_for_request(req: RetrievalRequest, matches: list[SearchResult]) -> list[AgentAction]:
    if not _is_agent_action_request(req.query):
        return []

    for document in _candidate_documents_for_action(req, matches):
        action = _agent_action_for_document(document)
        if action:
            return [action]
    return []


def _is_count_question(query: str) -> bool:
    tokens = set(_query_tokens(query))
    return "count" in tokens or "number" in tokens or "many" in tokens


def _controlled_count_response(req: RetrievalRequest, scope: ControlledScope) -> RetrievalResponse | None:
    if not _is_count_question(req.query) or not scope.has_filters:
        return None

    matches = _apply_controlled_scope(fixtures.ops_search_results(), scope)
    if req.engagement_id:
        matches = [
            match for match in matches
            if match.engagement_id in (None, req.engagement_id)
        ]

    subject = fixtures._client_name(scope.client_id) if scope.client_id else "the indexed records"
    record_label = "records"
    if "timesheet" in scope.required_terms:
        record_label = "timesheet records"
    elif scope.document_types:
        record_label = "documents"
    if len(scope.record_types) == 1:
        scoped_record_type = next(iter(scope.record_types))
        if scoped_record_type == "time" and "timesheet" not in scope.required_terms:
            record_label = "time records"
        elif scoped_record_type == "queue":
            record_label = "queue items"
        elif scoped_record_type != "time":
            record_label = f"{scoped_record_type} records"

    overview = (
        f"There are {len(matches)} matching {record_label}."
        if subject == "the indexed records"
        else f"{subject} has {len(matches)} matching {record_label}."
    )

    structured = {
        "overview": overview,
        "items": [
            {
                "title": match.title,
                "detail": match.snippet,
                "kind": "finding",
                "priority": "medium",
                "source_indexes": [index],
            }
            for index, match in enumerate(matches[:5], start=1)
        ],
        "risks": [],
    }
    return RetrievalResponse(
        answer=answer_text(structured),
        overview=str(structured["overview"]),
        items=structured["items"],
        risks=[],
        citations=build_citations(matches[:8], structured),
        mode="computed",
    )


def _client_billable_hours_response(req: RetrievalRequest, client_id: str | None) -> RetrievalResponse | None:
    tokens = set(_query_tokens(req.query))
    if not client_id or "hours" not in tokens or not {"bill", "billed", "billable", "billing"}.intersection(tokens):
        return None

    entries = [
        entry for entry in fixtures.TIME_ENTRIES
        if entry.client_id == client_id and entry.billable
    ]
    if not entries:
        client_name = fixtures._client_name(client_id)
        structured = {
            "overview": f"{client_name} has no recorded billable time in the current records.",
            "items": [],
            "risks": [],
        }
        return RetrievalResponse(
            answer=answer_text(structured),
            overview=str(structured["overview"]),
            items=[],
            risks=[],
            citations=[],
            mode="computed",
        )

    client_name = fixtures._client_name(client_id)
    total_hours = sum(entry.hours for entry in entries)
    matches = [
        SearchResult(
            id=entry.id,
            type="time",
            title=entry.activity,
            subtitle=f"{client_name} - {entry.staff} - {entry.status}",
            snippet=(
                f"{entry.hours:.1f}h billable time recorded for {fixtures._engagement_name(entry.engagement_id)}. "
                f"Status: {entry.status}. {entry.notes}"
            ),
            client_id=entry.client_id,
            engagement_id=entry.engagement_id,
            score=0.98,
        )
        for entry in entries
    ]
    has_unfinalised = any(entry.status in ("draft", "submitted") for entry in entries)
    structured = {
        "overview": (
            f"{client_name} has {total_hours:.1f}h recorded as billable time."
        ),
        "items": [
            {
                "title": entry.activity,
                "detail": (
                    f"{entry.staff} recorded {entry.hours:.1f}h billable time for "
                    f"{fixtures._engagement_name(entry.engagement_id)}. Status: {entry.status}."
                ),
                "kind": "finding",
                "priority": "medium" if entry.status == "draft" else "low",
                "source_indexes": [index],
            }
            for index, entry in enumerate(entries, start=1)
        ],
        "risks": (
            ["This is recorded billable time, not necessarily invoiced revenue. Draft or submitted entries still need billing approval."]
            if has_unfinalised
            else []
        ),
    }
    return RetrievalResponse(
        answer=answer_text(structured),
        overview=str(structured["overview"]),
        items=structured["items"],
        risks=structured["risks"],
        citations=build_citations(matches, structured),
        mode="computed",
    )


@app.post("/api/retrieval", response_model=RetrievalResponse)
def retrieve_records(req: RetrievalRequest) -> RetrievalResponse:
    scope = _controlled_scope(req)
    client_id = scope.client_id
    computed = _client_billable_hours_response(req, client_id)
    if computed:
        return computed

    counted = _controlled_count_response(req, scope)
    if counted:
        return counted

    matches = _ranked_retrieval_matches(req, scope=scope)
    subject = fixtures._client_name(client_id) if client_id else "the indexed records"
    structured, mode, model = answer_with_openai(req.query, matches, subject)
    actions = _agent_actions_for_request(req, matches)
    return RetrievalResponse(
        answer=answer_text(structured),
        overview=str(structured.get("overview") or ""),
        items=structured.get("items") if isinstance(structured.get("items"), list) else [],
        risks=structured.get("risks") if isinstance(structured.get("risks"), list) else [],
        citations=build_citations(matches, structured),
        mode=mode,
        model=model,
        actions=actions,
    )
