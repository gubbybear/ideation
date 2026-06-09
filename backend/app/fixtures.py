"""
Phase 0 fixtures. Mirrors the hardcoded data currently sitting inside the
React views in ../ReachStack/components/views/. These get returned by the
stub endpoints in main.py and are mutated in-memory by the action and
branding endpoints. Replace with real persistence in Phase 0.5.

Timestamps are ISO 8601 with Australia/Sydney offset. The frontend formats
them for display. AEST is +10:00; AEDT (DST) is +11:00.
"""

from __future__ import annotations

import uuid

from app.models import (
    AssuranceMetric,
    AuditEvent,
    BookingRecord,
    BrandingConfig,
    BrandingOption,
    ChangeRecord,
    ClientRecord,
    DocumentRecord,
    DashboardResponse,
    DecisionRailOption,
    EngagementRecord,
    MetricCard,
    PortalFile,
    PortalStatus,
    PortalStep,
    QueueDashboardItem,
    QueueItemDetail,
    QueueListItem,
    SearchResult,
    TimeEntryRecord,
    TimesheetRecord,
)


# Anchor fixture timestamps to "today" in Sydney (AEST in June).
_AEST = "+10:00"


def _ts(hms: str) -> str:
    """Build an ISO 8601 timestamp for today's date in Sydney from 'HH:MM' or 'HH:MM:SS'."""
    parts = hms.split(":")
    if len(parts) == 2:
        hms = f"{hms}:00"
    return f"2026-06-08T{hms}{_AEST}"


# ---------- Queue ----------

QUEUE_LIST: list[QueueListItem] = [
    QueueListItem(id="1", name="Gub v Hargrove", type="Statement of Claim", source="Email", confidence=98.4, status="partner", time=_ts("12:14")),
    QueueListItem(id="2", name="Brennan Estate", type="Engagement Letter", source="Portal", confidence=99.1, status="file", time=_ts("11:42")),
    QueueListItem(id="3", name="Coastal Holdings", type="Client Inquiry", source="Inbox", confidence=94.8, status="draft", time=_ts("10:53")),
    QueueListItem(id="4", name="Monthly Close", type="Trust Ledger", source="Drive", confidence=100.0, status="logged", time=_ts("10:02")),
    QueueListItem(id="5", name="Gub v Hargrove", type="Counsel Brief", source="Email", confidence=87.4, status="hold", time=_ts("09:36")),
    QueueListItem(id="6", name="Parker Industries", type="New Matter Intake", source="Portal", confidence=96.2, status="review", time=_ts("09:15")),
    QueueListItem(id="7", name="Wellington Trust", type="Document Review", source="Email", confidence=91.5, status="draft", time=_ts("08:44")),
    QueueListItem(id="8", name="Metro Commercial", type="Settlement Docs", source="Portal", confidence=99.8, status="file", time=_ts("08:22")),
]

QUEUE_DASHBOARD: list[QueueDashboardItem] = [
    QueueDashboardItem(id="1", title="Statement of claim from Hargrove Holdings", meta="Email - Smith v Hargrove - 12:14", confidence=98.4, status="partner"),
    QueueDashboardItem(id="2", title="Signed engagement letter for Brennan Estate", meta="Portal upload - new matter - 11:42", confidence=99.1, status="file"),
    QueueDashboardItem(id="3", title="Client asks for conveyancing settlement status", meta="Shared inbox - Coastal Holdings - 10:53", confidence=94.8, status="draft"),
    QueueDashboardItem(id="4", title="Trust ledger reconciliation extract", meta="Drive folder - monthly close - 10:02", confidence=100.0, status="logged"),
    QueueDashboardItem(id="5", title="Counsel brief with incomplete annexures", meta="Email attachment - Smith v Hargrove - 09:36", confidence=87.4, status="hold"),
]

DECISION_OPTIONS: list[DecisionRailOption] = [
    DecisionRailOption(key="approve", label="Approve & send", description="Send the draft response and log the decision."),
    DecisionRailOption(key="escalate", label="Escalate to partner", description="Flag for partner sign-off before any action."),
    DecisionRailOption(key="hold", label="Hold for review", description="Pause the item and return to queue for later review."),
    DecisionRailOption(key="request_info", label="Request more info", description="Send a follow-up to the client asking for missing details."),
]

QUEUE_DETAILS: dict[str, QueueItemDetail] = {
    "1": QueueItemDetail(
        id="1",
        matter_code="ACL-1042",
        title="Statement of claim from Hargrove Holdings",
        received_at=_ts("12:14"),
        source="Email",
        confidence=98.4,
        status="partner",
        alert="Human approval required",
        alert_detail="This document contains a newly named opposing party and requires partner sign-off before processing.",
        document_preview_text=(
            "STATEMENT OF CLAIM\n"
            "Between SMITH PROPERTIES PTY LTD (Plaintiff) and HARGROVE HOLDINGS PTY LTD (Defendant).\n"
            "Filed in the Supreme Court of New South Wales on 14 May 2026."
        ),
        draft_text=(
            "Dear M. Turner,\n\n"
            "We have received the Statement of Claim filed by Smith Properties Pty Ltd against Hargrove Holdings Pty Ltd. "
            "Our preliminary review suggests three procedural responses worth your sign-off. "
            "Please review the attached summary and confirm the path forward.\n\n"
            "Regards,\n"
            "Acme Advisory"
        ),
        decision_options=DECISION_OPTIONS,
    ),
    "2": QueueItemDetail(
        id="2",
        matter_code="ACL-1039",
        title="Signed engagement letter for Brennan Estate",
        received_at=_ts("11:42"),
        source="Portal",
        confidence=99.1,
        status="file",
        document_preview_text=(
            "ENGAGEMENT LETTER\n"
            "Client: Brennan Estate (executor: J. Brennan).\n"
            "Scope: estate administration and probate filing.\n"
            "Signed 11 May 2026."
        ),
        draft_text=(
            "Hi Jacqui,\n\n"
            "Thanks for returning the signed engagement letter. We have filed it against matter ACL-1039 and "
            "the estate administration work will begin this week. We'll be in touch once the grant of probate "
            "is lodged.\n\n"
            "Regards,\nAcme Advisory"
        ),
        decision_options=DECISION_OPTIONS,
    ),
    "3": QueueItemDetail(
        id="3",
        matter_code="ACL-1038",
        title="Client asks for conveyancing settlement status",
        received_at=_ts("10:53"),
        source="Inbox",
        confidence=94.8,
        status="draft",
        document_preview_text=(
            "From: jordan@coastalholdings.com.au\n"
            "Subject: Settlement timing?\n\n"
            "Hi team - can you confirm when settlement is scheduled and whether the deposit has cleared? "
            "Our buyer is asking for an update."
        ),
        draft_text=(
            "Hi Jordan,\n\n"
            "Settlement for the Coastal Holdings matter is currently scheduled for 28 May 2026. "
            "The deposit has cleared trust and we are awaiting the final discharge of mortgage from the "
            "outgoing lender. We will email you again the moment that lands.\n\n"
            "Regards,\nAcme Advisory"
        ),
        decision_options=DECISION_OPTIONS,
    ),
    "4": QueueItemDetail(
        id="4",
        matter_code="Monthly",
        title="Trust ledger reconciliation extract",
        received_at=_ts("10:02"),
        source="Drive",
        confidence=100.0,
        status="logged",
        document_preview_text=(
            "TRUST LEDGER - MONTHLY CLOSE\n"
            "Period: 01 Apr - 30 Apr 2026.\n"
            "Opening: $1,284,302.14. Closing: $1,318,977.02.\n"
            "Reconciliation: balanced. No exceptions."
        ),
        draft_text=(
            "Logged the April trust ledger reconciliation. No exceptions flagged; closing balance "
            "matches the bank statement. Archived against the Monthly Close folder."
        ),
        decision_options=DECISION_OPTIONS,
    ),
    "5": QueueItemDetail(
        id="5",
        matter_code="ACL-1042",
        title="Counsel brief with incomplete annexures",
        received_at=_ts("09:36"),
        source="Email",
        confidence=87.4,
        status="hold",
        alert="Missing annexures",
        alert_detail="Annexures B and D referenced on page 14 are not attached. The matter is on hold pending the full brief.",
        document_preview_text=(
            "BRIEF TO COUNSEL\n"
            "Re: Smith v Hargrove (ACL-1042).\n"
            "Annexure A: pleadings bundle.\n"
            "Annexure B: [MISSING]\n"
            "Annexure C: expert report.\n"
            "Annexure D: [MISSING]"
        ),
        draft_text=(
            "Hi Counsel's chambers,\n\n"
            "Thanks for the brief on Smith v Hargrove. Two annexures (B and D) referenced on page 14 do not "
            "appear to be attached. Could you please resend the complete bundle so we can progress?\n\n"
            "Regards,\nAcme Advisory"
        ),
        decision_options=DECISION_OPTIONS,
    ),
    "6": QueueItemDetail(
        id="6",
        matter_code="ACL-1040",
        title="New matter intake - Parker Industries",
        received_at=_ts("09:15"),
        source="Portal",
        confidence=96.2,
        status="review",
        document_preview_text=(
            "NEW MATTER INTAKE\n"
            "Client: Parker Industries Pty Ltd.\n"
            "Type: commercial contract dispute.\n"
            "Counterparty: Northbridge Logistics. Estimated value: $420k."
        ),
        draft_text=(
            "Hi Parker Industries team,\n\n"
            "Thanks for lodging the new matter via the portal. We have opened ACL-1040 and a "
            "commercial disputes lawyer will be in touch within one business day to scope next steps "
            "and confirm conflict checks.\n\n"
            "Regards,\nAcme Advisory"
        ),
        decision_options=DECISION_OPTIONS,
    ),
    "7": QueueItemDetail(
        id="7",
        matter_code="ACL-1037",
        title="Document review request - Wellington Trust",
        received_at=_ts("08:44"),
        source="Email",
        confidence=91.5,
        status="draft",
        document_preview_text=(
            "DOCUMENT REVIEW REQUEST\n"
            "Client: Wellington Trust.\n"
            "Document: revised deed of variation (v3).\n"
            "Requested turnaround: 48 hours."
        ),
        draft_text=(
            "Hi Wellington Trust,\n\n"
            "We have received the revised deed of variation (v3) and will return a marked-up version within "
            "your 48-hour window. We have flagged three clauses for partner attention.\n\n"
            "Regards,\nAcme Advisory"
        ),
        decision_options=DECISION_OPTIONS,
    ),
    "8": QueueItemDetail(
        id="8",
        matter_code="ACL-1041",
        title="Settlement docs - Metro Commercial",
        received_at=_ts("08:22"),
        source="Portal",
        confidence=99.8,
        status="file",
        document_preview_text=(
            "SETTLEMENT BUNDLE\n"
            "Matter: Metro Commercial sale of 14 Whitlam Lane.\n"
            "Contains: contract of sale, transfer, statement of adjustments, trust receipt."
        ),
        draft_text=(
            "Settlement bundle for Metro Commercial is complete and has been filed against ACL-1041. "
            "All parties have been notified and the trust receipt has been logged."
        ),
        decision_options=DECISION_OPTIONS,
    ),
}


# ---------- Dashboard ----------

DASHBOARD_METRICS = [
    MetricCard(value="47", label="Open inbound items", indicator="IN", variant="success"),
    MetricCard(value="6", label="Need partner approval", indicator="AP", variant="warning"),
    MetricCard(value="9 hrs", label="Average client handover", indicator="SLA", variant="info"),
    MetricCard(value="100%", label="PII redaction coverage", indicator="PII", variant="success"),
]


def dashboard_response() -> DashboardResponse:
    return DashboardResponse(
        metrics=DASHBOARD_METRICS,
        queue=QUEUE_DASHBOARD,
        eval_pass_rate=96.4,
    )


# ---------- Portal ----------

PORTAL_STATUS: dict[str, PortalStatus] = {
    "ACL-1042": PortalStatus(
        matter_id="ACL-1042",
        tenant_name="Acme Advisory",
        steps=[
            PortalStep(step=1, title="Document received", description="Uploaded via secure portal", done=True),
            PortalStep(step=2, title="Privacy review", description="PII tokenisation complete", done=True),
            PortalStep(step=3, title="Engagement assignment", description="Linked to ACL-1042", done=True),
            PortalStep(step=4, title="Partner review", description="Awaiting sign-off", current=True),
            PortalStep(step=5, title="Client notification", description="Pending completion"),
        ],
        files=[
            PortalFile(name="Statement_of_claim.pdf", size="2.4 MB", status="processing"),
            PortalFile(name="Engagement_letter_signed.pdf", size="1.1 MB", status="complete"),
            PortalFile(name="Supporting_docs.zip", size="8.7 MB", status="complete"),
        ],
    ),
}


# ---------- Audit ----------

AUDIT_EVENTS: list[AuditEvent] = [
    AuditEvent(time=_ts("12:14:32"), event="Classification approved", user="M. Turner", matter="ACL-1042", status="success"),
    AuditEvent(time=_ts("12:14:28"), event="PII redaction complete", user="System", matter="ACL-1042", status="info"),
    AuditEvent(time=_ts("11:45:12"), event="Document tokenised", user="System", matter="ACL-1039", status="info"),
    AuditEvent(time=_ts("11:42:05"), event="Portal upload received", user="Client", matter="ACL-1039", status="success"),
    AuditEvent(time=_ts("10:53:44"), event="Draft generated", user="System", matter="ACL-1038", status="info"),
    AuditEvent(time=_ts("10:53:22"), event="Classification complete", user="System", matter="ACL-1038", status="success"),
    AuditEvent(time=_ts("10:02:11"), event="File logged to DMS", user="System", matter="Monthly", status="success"),
    AuditEvent(time=_ts("09:36:55"), event="Annexure missing flagged", user="System", matter="ACL-1042", status="warning"),
    AuditEvent(time=_ts("09:15:33"), event="New matter created", user="J. Smith", matter="ACL-1040", status="success"),
    AuditEvent(time=_ts("08:44:21"), event="Review requested", user="System", matter="ACL-1037", status="info"),
]

ASSURANCE_METRICS: list[AssuranceMetric] = [
    AssuranceMetric(label="Documents processed", value="1,247", subtext="This month"),
    AssuranceMetric(label="PII redaction rate", value="100%", subtext="All documents"),
    AssuranceMetric(label="Audit coverage", value="100%", subtext="Full traceability"),
    AssuranceMetric(label="Average confidence", value="96.4%", subtext="Classification"),
]

CHANGE_SESSION_ID = f"session-{uuid.uuid4().hex[:8]}"
CHANGE_RECORDS: list[ChangeRecord] = []


# ---------- Branding ----------

BRANDING: BrandingConfig = BrandingConfig(
    tenant_name="Acme Advisory",
    theme="Navy",
    density="Compact",
    privacy_posture="Restricted",
    available_themes=[
        BrandingOption(name="Navy", color="#1f3357"),
        BrandingOption(name="Forest", color="#15803d"),
        BrandingOption(name="Ocean", color="#1e6f8a"),
        BrandingOption(name="Amber", color="#9a6a1f"),
        BrandingOption(name="Slate", color="#0a0a0a"),
    ],
    available_densities=[
        BrandingOption(name="Compact", description="Maximum information density"),
        BrandingOption(name="Comfortable", description="Balanced spacing"),
        BrandingOption(name="Spacious", description="More breathing room"),
    ],
    available_privacy_postures=[
        BrandingOption(name="Restricted", description="AU-hosted inference, no training"),
        BrandingOption(name="Standard", description="Global inference, anonymised training"),
        BrandingOption(name="Open", description="Full platform features"),
    ],
)


# ---------- Professional services operations ----------

CLIENTS: list[ClientRecord] = [
    ClientRecord(
        id="client-northstar",
        name="Northstar Dental Group",
        segment="Healthcare group",
        primary_contact="Priya Raman",
        email="priya@northstardental.com.au",
        phone="+61 2 5550 0142",
        owner="M. Turner",
        status="Active",
        last_touch=_ts("12:05"),
        summary="Multi-site dental group using Acme for monthly accounts, payroll review, and board reporting.",
        tags=["Accounting", "Payroll", "Board reporting"],
    ),
    ClientRecord(
        id="client-hargrove",
        name="Hargrove Holdings",
        segment="Property investment",
        primary_contact="Elliot Hargrove",
        email="elliot@hargroveholdings.com.au",
        phone="+61 2 5550 0198",
        owner="J. Smith",
        status="Partner review",
        last_touch=_ts("11:28"),
        summary="Property group with an active dispute file, tax planning work, and several document-heavy requests.",
        tags=["Advisory", "Legal support", "Tax"],
    ),
    ClientRecord(
        id="client-coastal",
        name="Coastal Holdings",
        segment="Hospitality operator",
        primary_contact="Jordan Lee",
        email="jordan@coastalholdings.com.au",
        phone="+61 7 5550 0181",
        owner="A. Chen",
        status="Waiting on client",
        last_touch=_ts("10:43"),
        summary="Hospitality group receiving settlement support, bookkeeping clean-up, and quarterly compliance reminders.",
        tags=["Bookkeeping", "Compliance", "CRM follow-up"],
    ),
    ClientRecord(
        id="client-parker",
        name="Parker Industries",
        segment="Manufacturing",
        primary_contact="Nadia Parker",
        email="nadia@parkerindustries.com.au",
        phone="+61 3 5550 0134",
        owner="M. Turner",
        status="Onboarding",
        last_touch=_ts("09:16"),
        summary="New manufacturing client onboarding for commercial advisory, grant readiness, and monthly management reports.",
        tags=["Onboarding", "Management reports", "Grant readiness"],
    ),
]


ENGAGEMENTS: list[EngagementRecord] = [
    EngagementRecord(
        id="eng-northstar-monthly",
        client_id="client-northstar",
        name="Monthly accounts and payroll review",
        service_line="Accounting",
        stage="In progress",
        owner="M. Turner",
        due_date="2026-06-14",
        next_step="Review payroll variance notes before client call.",
        billable_hours=7.5,
        document_count=5,
        booking_count=2,
    ),
    EngagementRecord(
        id="eng-hargrove-tax",
        client_id="client-hargrove",
        name="FY26 tax planning and dispute support",
        service_line="Tax and advisory",
        stage="Partner review",
        owner="J. Smith",
        due_date="2026-06-18",
        next_step="Confirm entity structure advice and missing annexures.",
        billable_hours=11.2,
        document_count=7,
        booking_count=1,
    ),
    EngagementRecord(
        id="eng-coastal-settlement",
        client_id="client-coastal",
        name="Settlement and bookkeeping clean-up",
        service_line="Client services",
        stage="Waiting on client",
        owner="A. Chen",
        due_date="2026-06-20",
        next_step="Client to upload final supplier statement and deposit receipt.",
        billable_hours=4.0,
        document_count=4,
        booking_count=1,
    ),
    EngagementRecord(
        id="eng-parker-onboarding",
        client_id="client-parker",
        name="New client onboarding and reporting setup",
        service_line="Advisory",
        stage="Onboarding",
        owner="M. Turner",
        due_date="2026-06-21",
        next_step="Book discovery session and index uploaded contracts.",
        billable_hours=2.3,
        document_count=3,
        booking_count=1,
    ),
]


BOOKINGS: list[BookingRecord] = [
    BookingRecord(
        id="book-1001",
        client_id="client-northstar",
        engagement_id="eng-northstar-monthly",
        title="Payroll variance review",
        start="2026-06-09T09:30:00+10:00",
        end="2026-06-09T10:15:00+10:00",
        staff="M. Turner",
        provider="Google Workspace",
        status="booked",
        location="Google Meet",
        notes="Client asked to include leave accrual questions.",
    ),
    BookingRecord(
        id="book-1002",
        client_id="client-hargrove",
        engagement_id="eng-hargrove-tax",
        title="Partner sign-off call",
        start="2026-06-09T11:00:00+10:00",
        end="2026-06-09T11:45:00+10:00",
        staff="J. Smith",
        provider="Microsoft 365",
        status="booked",
        location="Teams",
        notes="Check tax planning memo and dispute documents.",
    ),
    BookingRecord(
        id="book-1003",
        client_id="client-coastal",
        engagement_id="eng-coastal-settlement",
        title="Missing documents follow-up",
        start="2026-06-09T14:00:00+10:00",
        end="2026-06-09T14:30:00+10:00",
        staff="A. Chen",
        provider="Google Workspace",
        status="booked",
        location="Phone",
        notes="Turn into a time entry after completion.",
    ),
    BookingRecord(
        id="book-1004",
        client_id="client-parker",
        engagement_id="eng-parker-onboarding",
        title="Discovery session",
        start="2026-06-10T10:00:00+10:00",
        end="2026-06-10T11:00:00+10:00",
        staff="M. Turner",
        provider="Microsoft 365",
        status="available",
        location="Teams",
        notes="Open slot held by scheduling rules.",
    ),
]


DOCUMENTS: list[DocumentRecord] = [
    DocumentRecord(
        id="doc-2001",
        client_id="client-northstar",
        engagement_id="eng-northstar-monthly",
        name="Payroll_variance_report_May.xlsx",
        doc_type="Report",
        subtype="Payroll report",
        source="Microsoft 365 email",
        source_of_truth="external",
        source_system="microsoft_365",
        external_id="msg-a833-payroll-variance",
        external_url="https://outlook.office.com/mail/",
        sync_status="synced",
        local_editing="disabled",
        uploaded_at=_ts("11:52"),
        owner="M. Turner",
        status="indexed",
        tags=["Payroll", "Variance", "May close"],
        snippet="Leave accrual increased 8.4% month-on-month after two new dentists moved from contractor to employee status.",
    ),
    DocumentRecord(
        id="doc-2002",
        client_id="client-northstar",
        engagement_id="eng-northstar-monthly",
        name="Board_pack_questions.pdf",
        doc_type="Report",
        subtype="Board pack",
        source="Google Drive",
        source_of_truth="external",
        source_system="google_drive",
        external_id="gdrive-board-pack-questions",
        external_url="https://drive.google.com/",
        sync_status="synced",
        local_editing="disabled",
        uploaded_at=_ts("10:49"),
        owner="System",
        status="indexed",
        tags=["Board", "Management reporting"],
        snippet="Directors asked for a plain-English explanation of wage cost movements and chair utilisation.",
    ),
    DocumentRecord(
        id="doc-2007",
        client_id="client-northstar",
        engagement_id="eng-northstar-monthly",
        name="INV-1048-chair-fitout.pdf",
        doc_type="Financial",
        subtype="Invoice",
        source="Xero",
        source_of_truth="external",
        source_system="xero",
        external_id="xero-invoice-1048",
        external_url="https://go.xero.com/",
        sync_status="synced",
        local_editing="disabled",
        uploaded_at=_ts("10:12"),
        owner="System",
        status="indexed",
        tags=["Invoice", "Xero", "Source of truth"],
        snippet="Invoice INV-1048 for dental chair fitout is synced from Xero; ReachStack can cite it but edits belong in Xero.",
    ),
    DocumentRecord(
        id="doc-2003",
        client_id="client-hargrove",
        engagement_id="eng-hargrove-tax",
        name="Entity_structure_tax_memo.docx",
        doc_type="Report",
        subtype="Tax memo",
        source="Client portal",
        source_of_truth="shared",
        source_system="client_portal",
        external_system="microsoft_365",
        external_id="sharepoint-tax-memo-draft",
        external_url="https://sharepoint.com/",
        sync_status="local_changed",
        local_editing="enabled",
        approval_status="review",
        version=2,
        uploaded_at=_ts("09:58"),
        owner="J. Smith",
        status="needs_review",
        tags=["Tax", "Entity structure", "Partner review"],
        snippet="Draft recommendation is to retain the existing unit trust but update distribution minutes before 30 June.",
    ),
    DocumentRecord(
        id="doc-2004",
        client_id="client-hargrove",
        engagement_id="eng-hargrove-tax",
        name="Counsel_brief_annexures.zip",
        doc_type="Supporting File",
        subtype="Document bundle",
        source="Microsoft 365 email",
        source_of_truth="external",
        source_system="microsoft_365",
        external_id="msg-counsel-annexures",
        external_url="https://outlook.office.com/mail/",
        sync_status="external_changed",
        local_editing="disabled",
        uploaded_at=_ts("09:36"),
        owner="System",
        status="processing",
        tags=["Bundle", "Missing info"],
        snippet="Annexures B and D are referenced in the index but were not present in the archive.",
    ),
    DocumentRecord(
        id="doc-2008",
        client_id="client-hargrove",
        engagement_id="eng-hargrove-tax",
        name="Missing_annexures_request.md",
        doc_type="Email",
        subtype="Missing information request",
        source="ReachStack",
        source_of_truth="reachstack",
        source_system="reachstack",
        sync_status="not_synced",
        local_editing="enabled",
        approval_status="draft",
        version=3,
        generated_by="assistant",
        based_on_documents=["doc-2004"],
        uploaded_at=_ts("09:38"),
        owner="J. Smith",
        status="needs_review",
        tags=["Generated", "Missing info", "Draft"],
        snippet="Draft request asking the client to resend Annexures B and D before partner review can proceed.",
    ),
    DocumentRecord(
        id="doc-2005",
        client_id="client-coastal",
        engagement_id="eng-coastal-settlement",
        name="Supplier_statement_final.pdf",
        doc_type="Financial",
        subtype="Supplier statement",
        source="Client portal",
        source_of_truth="external",
        source_system="client_portal",
        external_id="portal-supplier-statement-final",
        sync_status="sync_pending",
        local_editing="disabled",
        uploaded_at=_ts("08:55"),
        owner="A. Chen",
        status="indexed",
        tags=["Bookkeeping", "Settlement"],
        snippet="Supplier balance reconciles except for one March invoice that does not appear in the accounting file.",
    ),
    DocumentRecord(
        id="doc-2009",
        client_id="client-coastal",
        engagement_id="eng-coastal-settlement",
        name="Settlement_followup_note.md",
        doc_type="Meeting Note",
        subtype="Call summary",
        source="ReachStack",
        source_of_truth="reachstack",
        source_system="reachstack",
        sync_status="not_synced",
        local_editing="enabled",
        approval_status="draft",
        version=1,
        generated_by="assistant",
        based_on_documents=["doc-2005"],
        uploaded_at=_ts("08:58"),
        owner="A. Chen",
        status="indexed",
        tags=["Generated", "Call summary", "Follow-up"],
        snippet="Call summary capturing the missing March invoice, settlement timing, and assigned follow-up actions.",
    ),
    DocumentRecord(
        id="doc-2006",
        client_id="client-parker",
        engagement_id="eng-parker-onboarding",
        name="Commercial_contracts_summary.pdf",
        doc_type="Contract",
        subtype="Contract summary",
        source="Google Drive",
        source_of_truth="external",
        source_system="google_drive",
        external_id="gdrive-commercial-contracts-summary",
        external_url="https://drive.google.com/",
        sync_status="synced",
        local_editing="disabled",
        uploaded_at=_ts("08:20"),
        owner="System",
        status="indexed",
        tags=["Onboarding", "Contracts", "Advisory"],
        snippet="Three evergreen supplier agreements contain price-review clauses due before the next reporting cycle.",
    ),
    DocumentRecord(
        id="doc-2010",
        client_id="client-parker",
        engagement_id="eng-parker-onboarding",
        name="Onboarding_next_steps_letter.docx",
        doc_type="Form",
        subtype="Client letter",
        source="ReachStack",
        source_of_truth="shared",
        source_system="reachstack",
        external_system="microsoft_365",
        external_id="sharepoint-onboarding-next-steps",
        external_url="https://sharepoint.com/",
        sync_status="synced",
        local_editing="enabled",
        approval_status="filed",
        version=4,
        generated_by="assistant",
        based_on_documents=["doc-2006"],
        uploaded_at=_ts("08:25"),
        owner="M. Turner",
        status="indexed",
        tags=["Generated", "Filed", "SharePoint"],
        snippet="Client next-steps letter created in ReachStack and filed to SharePoint after approval.",
    ),
    DocumentRecord(
        id="doc-2011",
        client_id="client-northstar",
        engagement_id="eng-northstar-monthly",
        name="NAB_operating_account_May_statement.pdf",
        doc_type="Financial",
        subtype="Bank statement",
        source="Xero",
        source_of_truth="external",
        source_system="xero",
        external_system="xero",
        external_id="xero-bankfeed-may-2026",
        external_url="https://go.xero.com/Bank/BankAccounts.aspx",
        sync_status="synced",
        local_editing="disabled",
        uploaded_at=_ts("11:46"),
        owner="System",
        status="indexed",
        tags=["Bank statement", "Xero", "May close"],
        snippet="NAB operating account statement for May - closing balance reconciles to Xero bank feed with no exceptions.",
    ),
    DocumentRecord(
        id="doc-2012",
        client_id="client-northstar",
        engagement_id="eng-northstar-monthly",
        name="BAS_lodgement_Q3_FY26.pdf",
        doc_type="Compliance",
        subtype="BAS lodgement",
        source="Xero",
        source_of_truth="external",
        source_system="xero",
        external_system="xero",
        external_id="xero-bas-q3-fy26",
        external_url="https://go.xero.com/AccountsReceivable/Reports/BAS",
        sync_status="external_changed",
        local_editing="disabled",
        approval_status="review",
        uploaded_at=_ts("11:18"),
        owner="M. Turner",
        status="needs_review",
        tags=["BAS lodgement", "GST", "Compliance"],
        snippet="Q3 FY26 BAS lodgement re-issued in Xero after a late supplier invoice - figures now differ from the version partner reviewed yesterday.",
    ),
    DocumentRecord(
        id="doc-2013",
        client_id="client-northstar",
        engagement_id="eng-northstar-monthly",
        name="Chair_cleaning_receipt_supplier_dispute.jpg",
        doc_type="Financial",
        subtype="Receipt",
        source="Manual upload",
        source_of_truth="reachstack",
        source_system="manual",
        sync_status="not_synced",
        local_editing="enabled",
        uploaded_at=_ts("10:31"),
        owner="A. Chen",
        status="needs_review",
        tags=["Receipt", "Supplier dispute", "Manual upload"],
        snippet="Photograph of chair-cleaning receipt that contradicts the supplier invoice amount - flagged for supplier dispute follow-up.",
    ),
    DocumentRecord(
        id="doc-2014",
        client_id="client-hargrove",
        engagement_id="eng-hargrove-tax",
        name="Director_ID_E_Hargrove.pdf",
        doc_type="Identity",
        subtype="Director ID",
        source="Manual upload",
        source_of_truth="reachstack",
        source_system="manual",
        sync_status="sync_failed",
        local_editing="enabled",
        approval_status="review",
        uploaded_at=_ts("09:51"),
        owner="J. Smith",
        status="needs_review",
        tags=["Director ID", "Identity", "ASIC"],
        snippet="Director ID for Elliot Hargrove captured for ASIC records - push to the compliance register failed and needs a manual retry.",
    ),
    DocumentRecord(
        id="doc-2015",
        client_id="client-hargrove",
        engagement_id="eng-hargrove-tax",
        name="Lease_renewal_42_Wharf_St.docx",
        doc_type="Contract",
        subtype="Lease renewal",
        source="Microsoft 365",
        source_of_truth="shared",
        source_system="microsoft_365",
        external_system="microsoft_365",
        external_id="sharepoint-lease-renewal-42-wharf",
        external_url="https://sharepoint.com/sites/hargrove/lease-renewal",
        sync_status="conflict",
        local_editing="enabled",
        approval_status="review",
        version=5,
        uploaded_at=_ts("09:24"),
        owner="J. Smith",
        status="needs_review",
        tags=["Lease renewal", "Contract", "Conflict"],
        snippet="42 Wharf Street lease renewal - landlord edited rent escalation clause in SharePoint while partner was editing the option period locally.",
    ),
    DocumentRecord(
        id="doc-2016",
        client_id="client-hargrove",
        engagement_id="eng-hargrove-tax",
        name="Hargrove_followup_missing_approval.md",
        doc_type="Email",
        subtype="Client follow-up",
        source="ReachStack",
        source_of_truth="reachstack",
        source_system="reachstack",
        external_system="microsoft_365",
        sync_status="sync_pending",
        local_editing="enabled",
        approval_status="review",
        version=2,
        generated_by="assistant",
        based_on_documents=["doc-2003", "doc-2008"],
        uploaded_at=_ts("09:42"),
        owner="J. Smith",
        status="needs_review",
        tags=["Generated", "Client follow-up", "Missing approval"],
        snippet="Follow-up email to Elliot Hargrove chasing the missing approval on the entity structure memo before the 30 June deadline.",
    ),
    DocumentRecord(
        id="doc-2017",
        client_id="client-coastal",
        engagement_id="eng-coastal-settlement",
        name="Supplier_dispute_thread.eml",
        doc_type="Email",
        subtype="Inbound correspondence",
        source="Microsoft 365",
        source_of_truth="external",
        source_system="microsoft_365",
        external_system="microsoft_365",
        external_id="msg-coastal-supplier-dispute-thread",
        external_url="https://outlook.office.com/mail/",
        sync_status="synced",
        local_editing="disabled",
        uploaded_at=_ts("08:47"),
        owner="A. Chen",
        status="indexed",
        tags=["Supplier dispute", "Email", "Inbound"],
        snippet="Three-message email thread between Coastal Holdings and Riverside Linen disputing the March cleaning invoice and remittance amount.",
    ),
    DocumentRecord(
        id="doc-2018",
        client_id="client-coastal",
        engagement_id="eng-coastal-settlement",
        name="Remittance_advice_riverside_linen.pdf",
        doc_type="Financial",
        subtype="Remittance advice",
        source="Xero",
        source_of_truth="external",
        source_system="xero",
        external_system="xero",
        external_id="xero-remittance-riverside-2026-05",
        external_url="https://go.xero.com/AccountsPayable/RemittanceAdvice",
        sync_status="synced",
        local_editing="disabled",
        uploaded_at=_ts("08:51"),
        owner="System",
        status="indexed",
        tags=["Remittance advice", "Xero", "Accounts payable"],
        snippet="Remittance advice to Riverside Linen for $4,820 covering invoices INV-2204 and INV-2218 - excludes the disputed March cleaning charge.",
    ),
    DocumentRecord(
        id="doc-2019",
        client_id="client-coastal",
        engagement_id="eng-coastal-settlement",
        name="BAS_Q3_worksheet_coastal.xlsx",
        doc_type="Compliance",
        subtype="GST worksheet",
        source="Client portal",
        source_of_truth="shared",
        source_system="client_portal",
        external_system="microsoft_365",
        external_id="portal-bas-q3-worksheet",
        external_url="https://sharepoint.com/sites/coastal/bas-q3",
        sync_status="local_changed",
        local_editing="enabled",
        approval_status="draft",
        version=3,
        uploaded_at=_ts("09:05"),
        owner="A. Chen",
        status="needs_review",
        tags=["BAS lodgement", "GST", "Worksheet"],
        snippet="Working draft of the Q3 BAS GST worksheet with cleaning-supplier dispute amounts excluded pending resolution.",
    ),
    DocumentRecord(
        id="doc-2020",
        client_id="client-parker",
        engagement_id="eng-parker-onboarding",
        name="Onboarding_checklist_parker.md",
        doc_type="Form",
        subtype="Onboarding checklist",
        source="ReachStack",
        source_of_truth="reachstack",
        source_system="reachstack",
        sync_status="not_synced",
        local_editing="enabled",
        approval_status="draft",
        version=2,
        generated_by="assistant",
        based_on_documents=["doc-2006", "doc-2010"],
        uploaded_at=_ts("08:14"),
        owner="M. Turner",
        status="indexed",
        tags=["Generated", "Onboarding checklist", "Advisory"],
        snippet="Onboarding checklist covering conflict check, director ID capture, ATO agent link, and Xero connection for Parker Industries.",
    ),
    DocumentRecord(
        id="doc-2021",
        client_id="client-parker",
        engagement_id="eng-parker-onboarding",
        name="Conflict_check_report_parker.pdf",
        doc_type="Compliance",
        subtype="Conflict check",
        source="ReachStack",
        source_of_truth="reachstack",
        source_system="reachstack",
        sync_status="not_synced",
        local_editing="enabled",
        approval_status="approved",
        version=1,
        generated_by="system",
        based_on_documents=["doc-2006"],
        uploaded_at=_ts("08:17"),
        owner="M. Turner",
        status="indexed",
        tags=["Conflict check", "Compliance", "Onboarding"],
        snippet="Conflict check across existing clients and counterparties - no conflicts identified with Parker Industries or Northbridge Logistics.",
    ),
    DocumentRecord(
        id="doc-2022",
        client_id="client-parker",
        engagement_id="eng-parker-onboarding",
        name="Director_ID_N_Parker.pdf",
        doc_type="Identity",
        subtype="Director ID",
        source="Manual upload",
        source_of_truth="reachstack",
        source_system="manual",
        sync_status="synced",
        local_editing="enabled",
        approval_status="approved",
        uploaded_at=_ts("08:11"),
        owner="M. Turner",
        status="indexed",
        tags=["Director ID", "Identity", "Onboarding"],
        snippet="Director ID for Nadia Parker captured during onboarding and matched to ASIC register without exception.",
    ),
    DocumentRecord(
        id="doc-2023",
        client_id="client-parker",
        engagement_id="eng-parker-onboarding",
        name="Engagement_letter_parker_signed.pdf",
        doc_type="Contract",
        subtype="Engagement letter",
        source="Manual upload",
        source_of_truth="reachstack",
        source_system="manual",
        sync_status="sync_pending",
        local_editing="enabled",
        approval_status="sent",
        uploaded_at=_ts("08:19"),
        owner="M. Turner",
        status="indexed",
        tags=["Engagement letter", "Signed", "Onboarding"],
        snippet="Counter-signed engagement letter for Parker Industries advisory and management reporting scope - queued for filing to SharePoint.",
    ),
    DocumentRecord(
        id="doc-2024",
        client_id="client-northstar",
        engagement_id="eng-northstar-monthly",
        name="Q1_board_meeting_minutes.gdoc",
        doc_type="Meeting Note",
        subtype="Board minutes",
        source="Google Drive",
        source_of_truth="external",
        source_system="google_drive",
        external_system="google_drive",
        external_id="gdrive-northstar-q1-minutes",
        external_url="https://drive.google.com/file/d/northstar-q1-minutes",
        sync_status="synced",
        local_editing="disabled",
        uploaded_at=_ts("10:55"),
        owner="System",
        status="indexed",
        tags=["Board minutes", "Meeting note", "Governance"],
        snippet="Q1 board minutes capturing director discussion on payroll variance, chair utilisation, and unanswered board questions for the next pack.",
    ),
    DocumentRecord(
        id="doc-2025",
        client_id="client-hargrove",
        engagement_id="eng-hargrove-tax",
        name="FY26_tax_workpapers.xlsx",
        doc_type="Supporting File",
        subtype="Tax workpapers",
        source="Xero",
        source_of_truth="external",
        source_system="xero",
        external_system="xero",
        external_id="xero-workpapers-hargrove-fy26",
        external_url="https://workpapers.xero.com/hargrove-fy26",
        sync_status="synced",
        local_editing="disabled",
        uploaded_at=_ts("09:11"),
        owner="J. Smith",
        status="indexed",
        tags=["Workpapers", "Tax", "Xero"],
        snippet="FY26 tax workpapers exported from Xero Workpapers - supports the entity-structure memo and missing-approval follow-up.",
    ),
    DocumentRecord(
        id="doc-2026",
        client_id="client-coastal",
        engagement_id="eng-coastal-settlement",
        name="Misc_receipts_April_dump.zip",
        doc_type="Other",
        subtype="Receipt bundle",
        source="Manual upload",
        source_of_truth="reachstack",
        source_system="manual",
        sync_status="not_synced",
        local_editing="enabled",
        uploaded_at=_ts("08:39"),
        owner="A. Chen",
        status="processing",
        tags=["Receipts", "Manual upload", "Bookkeeping"],
        snippet="Client-supplied bundle of April cafe and laundry receipts awaiting OCR and matching against the supplier statement.",
    ),
]


TIME_ENTRIES: list[TimeEntryRecord] = [
    TimeEntryRecord(
        id="time-3001",
        date="2026-06-08",
        staff="M. Turner",
        client_id="client-northstar",
        engagement_id="eng-northstar-monthly",
        activity="Payroll variance review",
        hours=1.4,
        billable=True,
        rate=260,
        status="submitted",
        source="Manual",
        notes="Reviewed variance notes and prepared client questions.",
    ),
    TimeEntryRecord(
        id="time-3002",
        date="2026-06-08",
        staff="J. Smith",
        client_id="client-hargrove",
        engagement_id="eng-hargrove-tax",
        activity="Partner review",
        hours=2.1,
        billable=True,
        rate=340,
        status="draft",
        source="AI suggested from document review",
        notes="Review of tax memo and missing annexure escalation.",
    ),
    TimeEntryRecord(
        id="time-3003",
        date="2026-06-08",
        staff="A. Chen",
        client_id="client-coastal",
        engagement_id="eng-coastal-settlement",
        activity="Bookkeeping clean-up",
        hours=1.8,
        billable=True,
        rate=210,
        status="submitted",
        source="Manual",
        notes="Matched supplier statement to ledger and flagged missing invoice.",
    ),
    TimeEntryRecord(
        id="time-3004",
        date="2026-06-08",
        staff="M. Turner",
        client_id="client-parker",
        engagement_id="eng-parker-onboarding",
        activity="Internal onboarding setup",
        hours=0.7,
        billable=False,
        rate=0,
        status="draft",
        source="Booking prep",
        notes="Created onboarding checklist and document index.",
    ),
]


TIMESHEETS: list[TimesheetRecord] = [
    TimesheetRecord(
        staff="M. Turner",
        role="Client partner",
        week_start="2026-06-08",
        target_hours=38,
        submitted_hours=31.5,
        billable_hours=24.4,
        leave_hours=0,
        status="submitted",
    ),
    TimesheetRecord(
        staff="J. Smith",
        role="Senior advisor",
        week_start="2026-06-08",
        target_hours=38,
        submitted_hours=28.2,
        billable_hours=22.7,
        leave_hours=0,
        status="draft",
    ),
    TimesheetRecord(
        staff="A. Chen",
        role="Client services",
        week_start="2026-06-08",
        target_hours=30,
        submitted_hours=24.8,
        billable_hours=18.6,
        leave_hours=4,
        status="approved",
    ),
]


def _client_name(client_id: str | None) -> str:
    client = next((c for c in CLIENTS if c.id == client_id), None)
    return client.name if client else "Unknown client"


def _engagement_name(engagement_id: str | None) -> str:
    engagement = next((e for e in ENGAGEMENTS if e.id == engagement_id), None)
    return engagement.name if engagement else "General records"


def ops_search_results(query: str | None = None, client_id: str | None = None) -> list[SearchResult]:
    needle = (query or "").strip().lower()
    results: list[SearchResult] = []

    def include(*parts: str, candidate_client_id: str | None = None) -> bool:
        if client_id and candidate_client_id != client_id:
            return False
        if not needle:
            return True
        haystack = " ".join(parts).lower()
        return needle in haystack

    for client in CLIENTS:
        if include(client.name, client.summary, " ".join(client.tags), candidate_client_id=client.id):
            results.append(
                SearchResult(
                    id=client.id,
                    type="client",
                    title=client.name,
                    subtitle=f"{client.segment} - {client.owner}",
                    snippet=client.summary,
                    client_id=client.id,
                    score=0.96,
                )
            )

    for engagement in ENGAGEMENTS:
        if include(engagement.name, engagement.service_line, engagement.next_step, candidate_client_id=engagement.client_id):
            results.append(
                SearchResult(
                    id=engagement.id,
                    type="engagement",
                    title=engagement.name,
                    subtitle=f"{_client_name(engagement.client_id)} - {engagement.stage}",
                    snippet=engagement.next_step,
                    client_id=engagement.client_id,
                    engagement_id=engagement.id,
                    score=0.91,
                )
            )

    for item in QUEUE_LIST:
        detail = QUEUE_DETAILS.get(item.id)
        queue_parts = [
            "queue",
            "customer service",
            "inbound work",
            item.name,
            item.type,
            item.source,
            item.status,
            detail.matter_code if detail else "",
            (detail.alert or "") if detail else "",
            (detail.alert_detail or "") if detail else "",
            detail.document_preview_text if detail else "",
            detail.draft_text if detail else "",
        ]
        if include(*queue_parts):
            results.append(
                SearchResult(
                    id=item.id,
                    type="queue",
                    title=item.name,
                    subtitle=f"{item.source} - {item.status} - {item.type}",
                    snippet=(detail.alert_detail if detail and detail.alert_detail else f"{item.type} from {item.source} needs {item.status} handling."),
                    score=0.9 if item.status in ("partner", "hold", "review") else 0.8,
                )
            )

    for doc in DOCUMENTS:
        doc_search_parts = [
            doc.name,
            doc.doc_type,
            doc.subtype,
            doc.source,
            doc.source_of_truth,
            doc.source_system,
            doc.external_system or "",
            doc.external_id or "",
            doc.sync_status,
            doc.sync_status.replace("_", " "),
            doc.local_editing,
            doc.approval_status or "",
            doc.generated_by or "",
            doc.owner,
            doc.snippet,
            " ".join(doc.tags),
            " ".join(doc.based_on_documents),
        ]
        if include(*doc_search_parts, candidate_client_id=doc.client_id):
            results.append(
                SearchResult(
                    id=doc.id,
                    type="document",
                    title=doc.name,
                    subtitle=(
                        f"{_client_name(doc.client_id)} - {doc.doc_type} - {doc.subtype} - "
                        f"{doc.source_of_truth} - {doc.status} - {doc.sync_status}"
                    ),
                    snippet=doc.snippet,
                    client_id=doc.client_id,
                    engagement_id=doc.engagement_id,
                    score=0.88,
                )
            )

    for booking in BOOKINGS:
        if include(booking.title, booking.staff, booking.provider, booking.notes, candidate_client_id=booking.client_id):
            results.append(
                SearchResult(
                    id=booking.id,
                    type="booking",
                    title=booking.title,
                    subtitle=f"{_client_name(booking.client_id)} - {booking.staff} - {booking.provider} - {booking.status}",
                    snippet=f"{booking.start} to {booking.end}. {booking.notes}",
                    client_id=booking.client_id,
                    engagement_id=booking.engagement_id,
                    score=0.78,
                )
            )

    for entry in TIME_ENTRIES:
        client_name = _client_name(entry.client_id)
        engagement_name = _engagement_name(entry.engagement_id)
        billing_label = "billable" if entry.billable else "non-billable"
        if include(
            entry.activity,
            entry.staff,
            client_name,
            engagement_name,
            entry.notes,
            entry.status,
            billing_label,
            f"{entry.hours:.1f} hours",
            candidate_client_id=entry.client_id,
        ):
            results.append(
                SearchResult(
                    id=entry.id,
                    type="time",
                    title=entry.activity,
                    subtitle=f"{client_name} - {entry.staff} - {entry.status}",
                    snippet=(
                        f"{entry.hours:.1f}h {billing_label} time recorded for {engagement_name}. "
                        f"Status: {entry.status}. {entry.notes}"
                    ),
                    client_id=entry.client_id,
                    engagement_id=entry.engagement_id,
                    score=0.72,
                )
            )

    for sheet in TIMESHEETS:
        timesheet_parts = [
            "timesheet",
            "submitted timesheet",
            sheet.staff,
            sheet.role,
            sheet.week_start,
            sheet.status,
            f"{sheet.submitted_hours} recorded hours",
            f"{sheet.billable_hours} billable hours",
            f"{sheet.leave_hours} leave hours",
        ]
        if include(*timesheet_parts):
            results.append(
                SearchResult(
                    id=f"timesheet-{sheet.staff.lower().replace(' ', '-').replace('.', '')}",
                    type="time",
                    title=f"{sheet.staff} timesheet",
                    subtitle=f"{sheet.role} - {sheet.status}",
                    snippet=(
                        f"Week of {sheet.week_start}: {sheet.submitted_hours:.1f}h recorded, "
                        f"{sheet.billable_hours:.1f}h billable, {sheet.leave_hours:.1f}h leave."
                    ),
                    score=0.82 if sheet.status == "submitted" else 0.74,
                )
            )

    for event in AUDIT_EVENTS:
        if include(event.event, event.user, event.matter):
            results.append(
                SearchResult(
                    id=f"audit-{event.time}-{event.event}",
                    type="audit",
                    title=event.event,
                    subtitle=f"{event.user} - {event.matter}",
                    snippet=f"{event.status} event recorded at {event.time}",
                    score=0.65,
                )
            )

    return sorted(results, key=lambda r: r.score, reverse=True)
