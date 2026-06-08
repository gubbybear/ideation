# Source Of Truth Model

ReachStack should be able to search and reason over many records, but it should only own and mutate records where ReachStack is the source of truth.

This matters most for documents such as invoices. An invoice may be visible and searchable in ReachStack, but if it belongs in Xero, MYOB, QuickBooks, or another accounting system, that external system remains authoritative.

## Core Fields

Every document should carry a source-of-truth model separate from its document type.

```ts
source_of_truth:
  | "external"
  | "reachstack"
  | "shared"
```

```ts
source_system:
  | "xero"
  | "myob"
  | "quickbooks"
  | "microsoft_365"
  | "google_drive"
  | "client_portal"
  | "reachstack"
  | "manual_upload"
```

Suggested supporting fields:

```ts
external_id?: string
external_url?: string
external_system?: string
sync_status:
  | "not_synced"
  | "synced"
  | "sync_pending"
  | "sync_failed"
  | "external_changed"
  | "local_changed"
  | "conflict"
local_editing:
  | "enabled"
  | "disabled"
approval_status?: "draft" | "review" | "approved" | "sent" | "filed"
version?: number
generated_by?: "assistant" | "user" | "system"
based_on_documents?: string[]
```

## External Source Of Truth

Example: an invoice from Xero.

ReachStack can:

- show it
- index it
- search it
- summarise it
- cite it in answers
- link it to clients, engagements, bookings, tasks, and audit events
- create follow-up work from it

ReachStack should not:

- silently edit it
- overwrite it
- treat its local copy as canonical
- change financial status without syncing through the accounting system

Example model:

```ts
{
  id: "doc_123",
  type: "Financial",
  subtype: "Invoice",
  source_of_truth: "external",
  source_system: "xero",
  external_id: "xero_invoice_abc",
  sync_status: "synced",
  local_editing: "disabled",
  external_url: "https://go.xero.com/...",
  indexed_text: "...",
  extracted_summary: "..."
}
```

UI treatment:

```text
Source of truth: Xero
Synced: Today 10:42
Editing disabled
Open in Xero
```

## ReachStack Source Of Truth

Example: a missing-information request, draft reply, client handover note, or meeting summary generated in ReachStack.

ReachStack can:

- generate it
- edit it
- version it
- approve it
- send or export it
- audit every change
- later sync or file it elsewhere

Example model:

```ts
{
  id: "doc_456",
  type: "Email",
  subtype: "Missing information request",
  source_of_truth: "reachstack",
  source_system: "reachstack",
  external_id: null,
  sync_status: "not_synced",
  local_editing: "enabled",
  approval_status: "draft",
  version: 3,
  generated_by: "assistant",
  based_on_documents: ["doc_123", "doc_789"]
}
```

UI treatment:

```text
Created in ReachStack
Draft v3
Needs approval
Edit / approve / send
```

## Shared Source Of Truth

Some documents are created in ReachStack and then filed elsewhere, or imported from a file store and edited in ReachStack.

Example: a client letter generated in ReachStack and saved to SharePoint.

```ts
{
  source_of_truth: "shared",
  source_system: "reachstack",
  external_system: "microsoft_365",
  external_id: "sharepoint_file_123",
  sync_status: "synced",
  local_editing: "enabled"
}
```

UI treatment:

```text
Created in ReachStack
Filed to SharePoint
Last synced: Today 11:05
Editable here
```

## Product Rule

ReachStack may reason over every indexed record, but should only own and directly mutate records where:

```ts
source_of_truth === "reachstack"
```

For shared documents, ReachStack can edit locally but must track sync state and conflicts.

For external documents, ReachStack should route changes through the external system's API or create a task for a human to update the authoritative system.
