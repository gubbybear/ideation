# ReachStack Local Desktop Agent Architecture

ReachStack should support customers who want to keep files in their own local, network, synced, or cloud-backed storage while still using ReachStack for search, audit, workflow, and AI-assisted actions.

The clean architecture is a deployed SaaS control plane plus a tenant-installed local desktop agent.

## Product Goal

Allow a tenant to connect real working files without requiring ReachStack to store those files.

ReachStack should store:

- tenant configuration
- document metadata
- file identity records
- permissions and capability profiles
- audit events
- session change records
- version/hash history
- search indexes where permitted
- AI outputs and citations where permitted

ReachStack should not automatically store:

- raw customer files
- full local file trees
- unapproved folder contents
- sensitive document text beyond the tenant's configured policy

## Core Principle

```text
ReachStack SaaS = control plane
Local desktop agent = file and desktop action plane
Customer storage = source of truth for files
```

The SaaS app asks for permitted actions. The local agent proves it can perform them safely on the customer's machine.

## Architecture

```text
ReachStack Web App
  -> ReachStack SaaS API
  -> tenant capability profile
  -> signed local action request
  -> browser launches local agent
  -> local agent opens/watches/indexes approved files
  -> metadata, audit, version events return to SaaS
```

Main components:

- ReachStack SaaS backend
- ReachStack web frontend
- Tenant capability profile
- Local desktop agent
- Local agent pairing service
- Local file watcher
- Local app launcher
- Local metadata/indexer
- Audit and session change journal

## Tenant Capability Profile

Each tenant should have a capability profile that says what ReachStack is allowed to do.

Example:

```yaml
tenant_id: acme-advisory
file_access_mode: local_agent
desktop_agent_required: true
allowed_file_types:
  - docx
  - xlsx
  - pdf
  - msg
  - eml
approved_roots:
  - name: Client Files
    path_hint: G:\Clients
    recursive: true
  - name: Google Drive Clients
    path_hint: "%USERPROFILE%\Google Drive\Clients"
    recursive: true
editor_preferences:
  docx:
    primary: word_desktop
    fallback: libreoffice
  xlsx:
    primary: excel_desktop
  pdf:
    primary: system_default
save_back_mode: local_agent_observed
ai_content_policy: metadata_first
```

The frontend should never assume Word, Excel, Google Drive, Dropbox, or SharePoint. It should ask the backend what the tenant and current device support.

## Local Agent Responsibilities

The local agent should:

- pair securely with one or more ReachStack tenants
- expose current device capabilities
- allow the user/admin to approve local folders
- scan only approved roots
- map files to ReachStack document records
- calculate file identity and version metadata
- open files in the configured local app
- watch files for save/rename/delete changes
- report change events to ReachStack
- optionally extract text locally where policy allows
- optionally redact locally before sending content-derived metadata
- maintain a small local queue when offline

The agent should not:

- give the web app arbitrary file system access
- execute arbitrary commands
- scan the whole disk by default
- upload file contents unless explicitly configured
- bypass local OS permissions

## File Identity Model

Every connected file should have a stable identity record.

Suggested fields:

```ts
type ConnectedFile = {
  document_id: string
  tenant_id: string
  device_id: string
  root_id: string
  display_name: string
  local_path?: string
  relative_path: string
  file_type: string
  size_bytes: number
  modified_at: string
  content_hash?: string
  quick_hash?: string
  os_file_id?: string
  storage_provider?: "local" | "network_share" | "google_drive" | "dropbox" | "box" | "onedrive" | "sharepoint" | "dms"
  provider_file_id?: string
  source_of_truth: "external" | "reachstack" | "shared"
  local_editing: "enabled" | "disabled"
  sync_status: "synced" | "local_changed" | "external_changed" | "sync_pending" | "conflict" | "unknown"
  version: number
}
```

For local and network files, the path plus hash and OS file ID may be the best available identity.

For cloud-synced folders, the agent should capture provider hints where possible, but should still work when the provider ID is unavailable.

## Open File Flow

User clicks:

```text
Open in Word
```

Flow:

```text
1. Frontend asks SaaS for an open-file action.
2. SaaS validates tenant, user, document, source-of-truth, and permissions.
3. SaaS creates a short-lived signed action token.
4. Browser launches reachstack://open?... or calls localhost agent bridge.
5. Local agent validates token, tenant, device, and path.
6. Local agent opens the file in the configured editor.
7. Local agent starts watching the file for changes.
8. Saves are reported to ReachStack as version events.
```

Two launch mechanisms should be supported:

```text
reachstack://open?request_id=...
```

and, where available:

```text
http://127.0.0.1:<agent-port>/open
```

The custom protocol is better for reliably waking the agent. The localhost bridge is better for capability checks and status.

## Edit And Save Flow

The local agent does not need to understand Word internals to deliver a useful first version.

Minimum viable behaviour:

```text
1. Open file in Word or the configured editor.
2. Capture file modified timestamp, size, and hash before opening.
3. Watch for file changes.
4. When saved or closed, recalculate metadata.
5. Send a DocumentChanged event to ReachStack.
6. ReachStack records an audit event and session change record.
7. ReachStack marks the document local_changed, synced, or conflict depending on storage rules.
```

Later, a Word add-in can provide deeper document-level operations such as accepting AI edits, citing sources, or editing specific paragraphs.

## Local Agent API

The local agent should expose a small local API bound only to localhost.

Example endpoints:

```text
GET  /health
GET  /capabilities
POST /pair
POST /roots
GET  /roots
POST /scan
POST /open
GET  /actions/{id}
POST /events/flush
```

The local API must validate:

- request origin
- signed action token
- tenant ID
- device ID
- expiry
- approved root containment
- allowed file type
- allowed operation

## SaaS API Additions

ReachStack backend should add:

```text
POST /api/tenants/{tenant_id}/devices/pair
GET  /api/tenants/{tenant_id}/capabilities
POST /api/documents/{document_id}/local-open-request
POST /api/local-agent/events
POST /api/local-agent/files
POST /api/local-agent/scan-results
```

The SaaS backend remains the policy decision point.

The local agent remains the file execution point.

## Security Model

Security has to be first-class because this agent touches customer files.

Required controls:

- explicit tenant pairing
- per-device identity
- short-lived signed action tokens
- allowlisted folder roots
- allowlisted file extensions
- denylisted sensitive paths
- no arbitrary shell command execution
- no arbitrary path opening from the browser
- localhost API only
- origin checks for browser calls
- TLS for cloud API calls
- audit every open, scan, save, delete, and failed attempt
- local admin can pause or revoke the agent
- tenant admin can revoke a device

The local agent should treat ReachStack SaaS as a policy source, not as an all-powerful remote control.

## Privacy And AI

Initial posture should be metadata-first.

The local agent can send:

- filename
- file type
- folder/category
- size
- modified timestamp
- hash/version
- user-approved tags
- extracted text only if tenant policy allows

For sensitive tenants, text extraction can happen locally and only redacted snippets, embeddings, or structured metadata can be sent to ReachStack.

The AI layer should still follow the rule from `multi-tenant-AI.md`: the model receives only the minimal permitted evidence package selected by ReachStack.

## Storage Provider Strategy

The local agent makes ReachStack less dependent on any single storage vendor.

Supported storage categories:

- local folders
- network shares
- Google Drive desktop sync
- Dropbox desktop sync
- Box Drive
- OneDrive sync
- SharePoint sync
- DMS-exported folders

The agent does not need deep provider integration on day one. It can start by watching approved local paths, then add provider-specific IDs and APIs later.

## Source Of Truth Interaction

The source-of-truth model still matters.

Examples:

- A Xero invoice synced into a folder can be opened and cited, but edits belong in Xero.
- A Word draft in an approved client folder can be edited locally.
- A shared document can be edited locally but may become `sync_pending` or `conflict`.
- A ReachStack-generated draft can be saved into the customer folder and then tracked by the local agent.

The local agent expands where files can live. It does not remove source-of-truth rules.

## MVP We Can Build Shortly

Build Windows-first because the current demo and many SMB document workflows are Windows-heavy.

Minimum testable slice:

1. Local agent runs on the same laptop as the browser.
2. User configures one approved folder.
3. Agent scans `.docx` files in that folder.
4. ReachStack imports metadata, not file contents.
5. Documents page shows those files as connected local files.
6. User clicks `Open in Word`.
7. Agent opens the selected local `.docx` in Word.
8. Agent watches the file for save changes.
9. ReachStack records a version event and session change record.
10. Audit page shows the local open and save events.

First implementation can be a simple trayless local process with:

- localhost HTTP API
- custom protocol later
- approved root in a local config file
- Python or .NET prototype
- file watcher
- app launcher
- basic pairing token

After the slice works, package it as a proper desktop app.

## Suggested Build Phases

### Phase 1: Local Prototype

- one local agent process
- one approved folder
- `.docx` only
- open in Word
- save detection
- metadata sync to local ReachStack backend
- audit/session change records

### Phase 2: Tenant Pairing

- device registration
- tenant capability profile
- signed action tokens
- local agent status in ReachStack
- device revoke flow

### Phase 3: Broader File Support

- `.xlsx`
- `.pdf`
- `.eml` / `.msg`
- provider/sync hints
- conflict detection
- offline queue

### Phase 4: AI-Assisted Local Documents

- local text extraction policy
- redaction before cloud transfer
- document citations
- proposed edits as patches
- user applies edits in editor or via agent
- reversible change records

### Phase 5: Production Desktop App

- installer
- auto-update
- tray UI
- logs and diagnostics
- admin-managed config
- MDM deployment option
- signed binaries
- device health reporting

## Open Product Questions

- Should the first agent be Windows-only or cross-platform from day one?
- Should local content ever leave the device by default?
- Do tenants need local-only search, cloud search, or hybrid search?
- Who can approve folder roots: tenant admin, local user, or both?
- How much audit detail can be shown without exposing sensitive paths?
- What is the rollback story when a user edits a real Word file directly?
- Do we need a Word add-in for deeper AI editing, or is file-level open/save enough for v1?

## Near-Term Recommendation

Build the local agent as the first real integration layer.

Keep Microsoft, Google, Dropbox, and other providers as adapters behind the same abstraction:

```text
Open this permitted document with the tenant's configured editor.
Track what changed.
Record the audit trail.
Do not take ownership of the file unless the tenant explicitly asks ReachStack to.
```

