from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


# ---------- Queue ----------

QueueStatus = Literal["partner", "file", "draft", "logged", "hold", "review"]
QueueSource = Literal["Email", "Portal", "Inbox", "Drive"]
ActionType = Literal["approve", "escalate", "hold", "request_info"]


class QueueListItem(BaseModel):
    id: str
    name: str
    type: str
    source: QueueSource
    confidence: float
    status: QueueStatus
    time: str  # ISO 8601 timestamp. Frontend formats for the tenant's timezone.


class QueueDashboardItem(BaseModel):
    """Compact queue item used by the dashboard left rail."""
    id: str
    title: str
    meta: str
    confidence: float
    status: QueueStatus


class DecisionRailOption(BaseModel):
    key: ActionType
    label: str
    description: str


class QueueItemDetail(BaseModel):
    id: str
    matter_code: str
    title: str
    received_at: str  # ISO 8601 timestamp.
    source: QueueSource
    confidence: float
    status: QueueStatus
    alert: str | None = None
    alert_detail: str | None = None
    document_preview_text: str
    draft_text: str
    original_draft_text: str = ""  # AI's first-pass output; preserved so the UI can reset. Backfilled from draft_text in fixtures.
    decision_options: list[DecisionRailOption]


class DraftUpdateRequest(BaseModel):
    draft_text: str


class ActionRequest(BaseModel):
    action: ActionType
    note: str | None = None


class ActionResponse(BaseModel):
    item_id: str
    action: ActionType
    new_status: QueueStatus
    audit_event_id: str


# ---------- Dashboard ----------

class MetricCard(BaseModel):
    value: str
    label: str
    indicator: str
    variant: Literal["success", "warning", "info", "destructive"]


class DashboardResponse(BaseModel):
    metrics: list[MetricCard]
    queue: list[QueueDashboardItem]
    eval_pass_rate: float


# ---------- Portal ----------

class PortalStep(BaseModel):
    step: int
    title: str
    description: str
    done: bool = False
    current: bool = False


class PortalFile(BaseModel):
    name: str
    size: str
    status: Literal["processing", "complete"]


class PortalStatus(BaseModel):
    matter_id: str
    tenant_name: str
    steps: list[PortalStep]
    files: list[PortalFile]


class UploadResponse(BaseModel):
    file: PortalFile
    matter_id: str


# ---------- Audit ----------

class AuditEvent(BaseModel):
    time: str  # ISO 8601 timestamp.
    event: str
    user: str
    matter: str
    status: Literal["success", "info", "warning"]


class AssuranceMetric(BaseModel):
    label: str
    value: str
    subtext: str


ChangeOperation = Literal["create", "update", "delete", "undo"]
ChangeUndoStatus = Literal["completed", "blocked"]


class ChangeRecord(BaseModel):
    id: str
    session_id: str
    time: str
    title: str
    summary: str
    actor: str
    target_type: str
    target_id: str
    operation: ChangeOperation
    before: dict[str, Any] | None = None
    after: dict[str, Any] | None = None
    reversible: bool = False
    reverted: bool = False
    undo_of: str | None = None
    audit_event_id: str | None = None


class ChangeUndoResponse(BaseModel):
    change_id: str
    status: ChangeUndoStatus
    message: str
    change: ChangeRecord | None = None


class AuditResponse(BaseModel):
    metrics: list[AssuranceMetric]
    events: list[AuditEvent]
    session_id: str = ""
    changes: list[ChangeRecord] = []


# ---------- Branding ----------

class BrandingOption(BaseModel):
    name: str
    description: str | None = None
    color: str | None = None


class BrandingConfig(BaseModel):
    tenant_name: str
    theme: str = Field(description="Color theme name, e.g. 'Navy'")
    density: Literal["Compact", "Comfortable", "Spacious"] = "Compact"
    privacy_posture: Literal["Restricted", "Standard", "Open"] = "Restricted"
    available_themes: list[BrandingOption]
    available_densities: list[BrandingOption]
    available_privacy_postures: list[BrandingOption]


class BrandingUpdate(BaseModel):
    theme: str | None = None
    density: Literal["Compact", "Comfortable", "Spacious"] | None = None
    privacy_posture: Literal["Restricted", "Standard", "Open"] | None = None


# ---------- Professional services operations ----------

IntegrationProvider = Literal["Google Workspace", "Microsoft 365", "Internal"]
BookingStatus = Literal["available", "booked", "completed", "cancelled", "no_show"]
DocumentStatus = Literal["indexed", "processing", "needs_review"]
DocumentSourceOfTruth = Literal["external", "reachstack", "shared"]
DocumentSyncStatus = Literal[
    "not_synced",
    "synced",
    "sync_pending",
    "sync_failed",
    "external_changed",
    "local_changed",
    "conflict",
]
DocumentEditing = Literal["enabled", "disabled"]
DocumentApprovalStatus = Literal["draft", "review", "approved", "sent", "filed"]
GeneratedBy = Literal["assistant", "user", "system"]
TimeStatus = Literal["draft", "submitted", "approved", "rejected"]
RecordType = Literal[
    "client",
    "engagement",
    "document",
    "queue",
    "booking",
    "time",
    "note",
    "audit",
]


class ClientRecord(BaseModel):
    id: str
    name: str
    segment: str
    primary_contact: str
    email: str
    phone: str
    owner: str
    status: str
    last_touch: str
    summary: str
    tags: list[str]


class EngagementRecord(BaseModel):
    id: str
    client_id: str
    name: str
    service_line: str
    stage: str
    owner: str
    due_date: str
    next_step: str
    billable_hours: float
    document_count: int
    booking_count: int


class BookingRecord(BaseModel):
    id: str
    client_id: str
    engagement_id: str
    title: str
    start: str
    end: str
    staff: str
    provider: IntegrationProvider
    status: BookingStatus
    location: str
    notes: str = ""


class BookingCreateRequest(BaseModel):
    client_id: str
    engagement_id: str
    title: str
    start: str
    end: str
    staff: str
    provider: IntegrationProvider = "Internal"
    location: str = "Video call"
    notes: str = ""


class DocumentRecord(BaseModel):
    id: str
    client_id: str
    engagement_id: str
    name: str
    doc_type: str
    subtype: str
    source: str
    source_of_truth: DocumentSourceOfTruth
    source_system: str
    external_system: str | None = None
    external_id: str | None = None
    external_url: str | None = None
    sync_status: DocumentSyncStatus
    local_editing: DocumentEditing
    approval_status: DocumentApprovalStatus | None = None
    version: int | None = None
    generated_by: GeneratedBy | None = None
    based_on_documents: list[str] = []
    uploaded_at: str
    owner: str
    status: DocumentStatus
    tags: list[str]
    snippet: str


class DocumentUpdateRequest(BaseModel):
    snippet: str
    note: str | None = None


class TimeEntryRecord(BaseModel):
    id: str
    date: str
    staff: str
    client_id: str
    engagement_id: str
    activity: str
    hours: float
    billable: bool
    rate: float
    status: TimeStatus
    source: str
    notes: str = ""


class TimeEntryCreateRequest(BaseModel):
    date: str
    staff: str
    client_id: str
    engagement_id: str
    activity: str
    hours: float
    billable: bool = True
    rate: float = 240
    notes: str = ""


class TimesheetRecord(BaseModel):
    staff: str
    role: str
    week_start: str
    target_hours: float
    submitted_hours: float
    billable_hours: float
    leave_hours: float
    status: TimeStatus


class ClientWorkspace(BaseModel):
    client: ClientRecord
    engagements: list[EngagementRecord]
    bookings: list[BookingRecord]
    documents: list[DocumentRecord]
    time_entries: list[TimeEntryRecord]
    records: list["SearchResult"]


class SearchResult(BaseModel):
    id: str
    type: RecordType
    title: str
    subtitle: str
    snippet: str
    client_id: str | None = None
    engagement_id: str | None = None
    score: float


class RetrievalRequest(BaseModel):
    query: str
    client_id: str | None = None
    engagement_id: str | None = None


class RetrievalCitation(BaseModel):
    id: str
    title: str
    source_type: RecordType
    snippet: str
    score: float
    client_id: str | None = None
    engagement_id: str | None = None


class RetrievalAnswerItem(BaseModel):
    title: str
    detail: str
    kind: Literal["action", "finding", "risk", "note"] = "finding"
    priority: Literal["high", "medium", "low"] | None = None
    source_indexes: list[int] = []


AgentActionType = Literal["revise_and_approve_document"]
AgentActionTargetType = Literal["document"]
AgentActionExecutionStatus = Literal["completed", "blocked"]


class AgentAction(BaseModel):
    id: str
    type: AgentActionType
    label: str
    description: str
    target_type: AgentActionTargetType
    target_id: str
    target_title: str
    requires_approval: bool = True
    button_label: str = "Apply"
    payload: dict[str, str] = {}
    warnings: list[str] = []


class AgentActionExecuteRequest(BaseModel):
    action: AgentAction


class AgentActionExecuteResponse(BaseModel):
    action_id: str
    status: AgentActionExecutionStatus
    message: str
    document: DocumentRecord | None = None
    audit_event_id: str | None = None
    change_id: str | None = None
    warnings: list[str] = []


class RetrievalResponse(BaseModel):
    answer: str
    overview: str = ""
    items: list[RetrievalAnswerItem] = []
    risks: list[str] = []
    citations: list[RetrievalCitation]
    mode: Literal["openai", "fallback", "computed"] = "fallback"
    model: str | None = None
    actions: list[AgentAction] = []
