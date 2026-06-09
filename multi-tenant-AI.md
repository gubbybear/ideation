# Multi-Tenant AI Architecture

ReachStack should use LLMs as a synthesis layer, not as an unrestricted search engine over customer data.

In production, the application must decide what the user is allowed to retrieve, what the terms in the question mean, and which exact records are relevant before any model call is made.

## Core Principle

```text
Search, permissions, counts, totals, statuses, and source-of-truth rules = application code
Summaries, explanations, drafts, prioritisation, and natural language = LLM
```

The model should not decide:

- which tenant data a user can access
- what a controlled term means
- whether a record is authoritative
- how to calculate billing, time, counts, due dates, or statuses
- whether a source can be edited or mutated

Those decisions belong in ReachStack's backend and ontology layer.

## Example Flow

User asks:

```text
How many billable hours did we bill to Hargrove Holdings?
```

ReachStack should not send the question plus the full Hargrove file to the model.

Instead, the system should run this flow:

```text
User question
 -> ontology / controlled vocabulary resolver
 -> tenant, role, client, and record permissions
 -> tenant capability profile
 -> structured retrieval, local-agent metadata retrieval, or document retrieval
 -> exact computation where possible
 -> local extraction/redaction if files remain on device
 -> redaction and data minimisation
 -> LLM synthesis if needed
 -> citation validation
 -> audit log
 -> UI answer
```

If the tenant uses the local desktop agent, ReachStack should retrieve file metadata and capability state first. File contents should leave the device only if the tenant policy, user permission, file classification, and task requirement all allow it.

## Controlled Vocabulary Resolution

The ontology layer should resolve known business terms before retrieval.

For the example question:

```text
Hargrove Holdings -> client_id=client-hargrove
billable hours -> time/billing domain
billed -> may mean invoiced, not merely recorded
how many -> metric/count question
```

Other controlled terms may include:

- client/customer names
- staff names
- engagement, project, matter, or job IDs
- document types and subtypes
- source systems
- source-of-truth states
- sync states
- workflow statuses
- billing statuses
- time entry statuses
- booking/calendar statuses
- jurisdiction or region
- privacy classifications

If a term belongs to the controlled vocabulary, the model should not infer its meaning. The backend should resolve it deterministically.

## Permission Filtering

Permission checks must happen before retrieval and before any LLM call.

The permission layer should apply:

- tenant isolation
- user identity
- role-based access
- client/customer access
- engagement/matter/project access
- document-level restrictions
- source-system permissions
- jurisdictional or regional restrictions
- staff visibility rules

If a user cannot access a record, that record should never enter the retrieval set and should never be sent to the LLM.

## Retrieval Before Inference

The backend should retrieve records using normal database/search logic.

For example:

```text
client_id = client-hargrove
record_type = time_entry | invoice | billing_record
billable = true
status = draft | submitted | approved | invoiced
```

This retrieval should produce a small candidate set such as:

```json
[
  {
    "record_id": "time-3002",
    "client_id": "client-hargrove",
    "activity": "Partner review",
    "hours": 2.1,
    "billable": true,
    "status": "draft"
  }
]
```

The model should receive only the minimal evidence needed to answer the question.

## Index Location

For local, network, synced, and cloud-backed customer files, ReachStack needs an explicit index policy.

Supported index modes should include:

- metadata-only cloud index
- redacted snippet cloud index
- embeddings over redacted text
- local-only index held by the desktop agent
- hybrid index where cloud metadata points to local evidence
- full-content cloud index only where explicitly approved

The index mode should be part of the tenant capability and privacy profile.

Example:

```yaml
tenant_id: acme-advisory
file_access_mode: local_agent
index_mode: metadata_only_cloud
local_text_extraction: allowed
cloud_text_storage: disabled
embedding_storage: disabled
```

Retrieval should respect this policy before any LLM call. If the cloud index only contains metadata, the assistant should say when an answer requires opening or locally extracting the document.

## Computed Answers

Some questions should bypass the LLM for the primary answer.

Examples:

- counts
- totals
- due dates
- billable hours
- invoice totals
- submitted timesheets
- documents needing review
- sync failures
- records by source system
- open approvals
- overdue tasks

For these questions, code should compute the answer and the LLM may only explain it.

Example:

```text
Hargrove Holdings has 2.1h recorded as billable time.
The entry is still draft, so it may not be invoiced revenue yet.
```

## Data Minimisation

The LLM should not receive whole client files or broad document sets unless there is a strong product and compliance reason.

Preferred input:

```json
{
  "question": "How many billable hours did we bill to Hargrove Holdings?",
  "facts": [
    {
      "record_id": "time-3002",
      "client": "Hargrove Holdings",
      "hours": 2.1,
      "billable": true,
      "status": "draft",
      "activity": "Partner review"
    }
  ],
  "instruction": "Explain this clearly. Distinguish recorded billable time from invoiced time."
}
```

Avoid sending:

- full document bodies by default
- full client workspaces
- unrelated documents
- hidden fields
- unnecessary personal information
- raw external-system data dumps

For local-agent tenants, avoid sending raw file content from the device unless the tenant policy explicitly allows the content class and the user has approved the action.

## Redaction And Tokenisation

For sensitive deployments, ReachStack should support redaction or tokenisation before model calls.

Examples:

```text
Hargrove Holdings -> CLIENT_001
Elliot Hargrove -> PERSON_004
ACL-1042 -> MATTER_1038
J. Smith -> STAFF_002
```

The application can restore display names after the model returns.

Redaction should be policy-driven. Some customers may allow business names but not personal identifiers. Others may require all client and counterparty names to be tokenised.

## LLM Synthesis

After retrieval and minimisation, the LLM can help with:

- summarising the evidence
- explaining the result in plain English
- identifying visible risks
- drafting client messages
- prioritising work
- turning records into structured action items
- producing a concise answer for the UI

The model should return structured output, not arbitrary prose.

Example:

```json
{
  "overview": "Hargrove Holdings has 2.1h recorded as billable time.",
  "items": [
    {
      "title": "Partner review",
      "detail": "J. Smith recorded 2.1h billable time. Status: draft.",
      "kind": "finding",
      "priority": "medium",
      "source_indexes": [1]
    }
  ],
  "risks": [
    "This is recorded billable time, not necessarily invoiced revenue."
  ]
}
```

## Agentic Action Boundary

The LLM may propose actions. It must not execute them.

ReachStack should treat every proposed action as an untrusted draft until application code validates it.

Action flow:

```text
LLM proposes action
 -> backend validates tool name and schema
 -> backend validates tenant, user, role, record permissions
 -> backend validates source-of-truth and local-agent capability
 -> backend performs dry run where possible
 -> UI shows action card with sources, risks, and expected changes
 -> user approves or edits
 -> backend executes through a registered tool/adapter
 -> backend verifies result
 -> audit event and session change record are written
```

An action record should include:

- action type
- target record IDs
- source record IDs
- required capability, such as local agent, Word desktop, calendar connector, or email connector
- input schema version
- permission rule
- source-of-truth rule
- approval rule
- dry-run result
- idempotency key
- expected version or hash
- rollback or undo support
- audit event ID

Tool examples:

- `edit_document`
- `open_document_locally`
- `apply_document_patch`
- `send_approved_email`
- `create_booking`
- `create_time_entry`
- `request_missing_information`
- `update_document_status`

The action registry belongs in ReachStack application code. The model can choose from available tools only after the backend has filtered those tools to the tenant, user, record, and device capability.

## Citation Validation

The model should not invent citations.

ReachStack should:

- pass numbered source records to the model
- require source indexes in the model response
- validate that every cited source was actually retrieved
- render links from application-owned record IDs
- audit the source IDs used

If the model references a source that was not retrieved, the answer should be rejected or repaired.

## Audit Requirements

Every AI answer should be auditable.

The audit log should record:

- tenant ID
- user ID
- query, if policy allows
- redacted query or intent summary when raw query logging is disabled
- resolved controlled terms
- permission scope
- retrieved record IDs
- local-agent device ID where relevant
- index mode used
- redaction policy used
- model provider
- model name
- prompt/template version
- answer mode: computed, fallback, or model-generated
- cited record IDs
- timestamp
- user action taken after the answer

The log should avoid storing unnecessary sensitive prompt content unless the customer policy allows it.

Default audit posture should be:

- store intent and controlled terms
- store retrieved record IDs
- store source IDs and citations
- store provider/model/template metadata
- store raw query only for tenants that explicitly allow it
- store redacted query when raw query logging is disabled

## Session Change Journal And Undo

Agentic work needs a git-style session record in addition to the immutable audit log.

The audit log answers:

- who did what
- when it happened
- which record or source was involved
- whether the action succeeded

The session change journal answers:

- what changed in this working session
- the before and after state
- whether the change is reversible
- whether it has already been reverted
- which audit event and source records explain the change

Every agentic mutation should write a change record with:

- session ID
- change ID
- timestamp
- actor
- operation: create, update, delete, undo
- target type and target ID
- before metadata snapshot where available
- after metadata snapshot where available
- reversible flag
- reverted flag
- undo-of link for rollback records

Content snapshots need their own policy. By default, ReachStack should store hashes, versions, file metadata, and structured field changes rather than raw document text. Store content diffs only where the tenant policy, document classification, and user action explicitly allow it.

Undo must be implemented by application code, not by asking the LLM to reverse itself.

The LLM can propose an action, but ReachStack should:

- validate permissions and source-of-truth rules before execution
- write the permitted metadata snapshot before mutating state
- expose only supported undo buttons in the UI
- create a new audit event when an undo occurs
- create a new change record whose operation is `undo`

For the mock frontend, the current thin slice records in-memory session changes and supports undo for local document revision, queue status changes, created bookings, created time entries, portal file uploads, and branding changes.

In production, this should become a durable event/change store with retention controls, tenant isolation, and permissions around who can revert which changes.

For customers who want ReachStack to work with files that remain on local, network, or synced drives, see `local-desktop-agent.md`. That architecture treats ReachStack SaaS as the control plane and a tenant-installed desktop agent as the file/action plane.

## Provider Strategy

ReachStack should use production-grade model providers, not local hobby-model infrastructure for production inference.

Model providers, storage providers, editor providers, and local-agent capabilities must remain separate adapters.

Initial provider options:

- OpenAI API for model quality and speed
- Azure OpenAI / Microsoft Foundry for Microsoft-heavy or regulated customers

Provider requirements:

- enterprise contract path
- data processing terms
- no training on customer API data by default
- configurable retention controls where available
- audit and usage visibility
- regional/data-residency options where available
- operational support
- clear security posture

Provider privacy controls are important, but they do not replace ReachStack's own retrieval, permission, minimisation, and audit layers.

Storage and editor provider examples:

- local desktop agent
- local folders and network shares
- Google Drive desktop sync
- Dropbox
- Box
- Microsoft 365
- SharePoint / OneDrive
- Word desktop
- LibreOffice desktop
- browser-based editors where configured

ReachStack should not assume Microsoft 365, Word, or OpenAI are always present. Tenant capability profiles should decide which adapters are available for a particular customer and device.

## Product Rule

LLMs should never have open-ended access to customer documents.

They should receive only the permitted, minimal, task-specific evidence package selected by ReachStack's backend.
