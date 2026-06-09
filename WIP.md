# Work in progress — 2026-05-17

## TL;DR

Audit + fixes from prior session are **done but uncommitted**. A durable
draft-editor feature is **in progress** — backend half-started, frontend not
started, frontend dev server is stopped.

## Servers

- Backend: **running** on http://127.0.0.1:8000 (uvicorn with `--reload`)
- Frontend: **stopped** — restart with `cd ReachStack && npm run dev`

## What's done but uncommitted (audit + fixes)

All in working tree, no commits yet:

- DocumentPreview / DraftResponse fetch the selected item from
  `/api/queue/{id}` and render real `document_preview_text` / `draft_text`.
- Sidebar counts come from `useQueueQuery` / `usePortalQuery` / `useBrandingQuery`.
  Tenant name and deployment footer also live.
- Dead buttons fixed or removed:
  - Audit "Export log" → CSV download
  - Audit "Filter", Queue "Filters"/"Sort", Portal "Open portal" → removed
  - Dashboard "Review next item" → switches `activeView` via callback from page.tsx
  - Review prev/next chevrons → step through the real queue ids; counter is real
- Dashboard AuditFeed and PortalSnapshot now feed from `/api/audit` and
  `/api/portal/ACL-1042` respectively.
- Top-bar privacy pill reads from `/api/branding` (Restricted = green,
  Standard = blue, Open = amber). Subdomain derives from tenant name.
- How-to modal copy reconciled with reality; stale duplicate at
  `ReachStack/components/ui/how-to-modal.tsx` was deleted and unmounted from
  `app/layout.tsx`.
- Pre-existing type bugs fixed: `MetricCard` accepts `"destructive"` variant,
  `QueueItem` accepts `"review"` status.
- Backend fixtures expanded — every queue id 1-8 now has a full
  `QueueItemDetail` entry (only "1" had one before).

`npx tsc --noEmit` is clean as of last check.

## In progress — durable draft editor

Goal: make the AI-generated draft response **editable** so a reviewer can
correct wording before approving. Edits persist via a backend PATCH and are
logged to the audit trail. Reset-to-AI-version button uses
`original_draft_text` preserved on the model.

### Done

- `backend/app/models.py`:
  - `QueueItemDetail.original_draft_text: str = ""` added (default empty,
    backfilled from `draft_text` in fixtures).
  - New `DraftUpdateRequest` model with `draft_text: str`.
- `backend/app/fixtures.py`:
  - Item "1" has a leftover `original_draft_text=""` line that should be
    removed (the model default covers it). The cancelled edit was trying to
    remove this line. Items 2-8 don't have the line — they rely on the
    default.

### Not done

1. **Backfill `original_draft_text` from `draft_text` in fixtures.** Add at the
   end of `fixtures.py`, after `QUEUE_DETAILS` is built:

   ```python
   for _detail in QUEUE_DETAILS.values():
       _detail.original_draft_text = _detail.draft_text
   ```

   Also remove the leftover `original_draft_text=""` line on item 1.

2. **`PATCH /api/queue/{item_id}/draft` endpoint** in `backend/app/main.py`:
   - Accepts `DraftUpdateRequest`.
   - Updates `fixtures.QUEUE_DETAILS[item_id].draft_text`.
   - Appends an audit event (`event="Draft edited"`, user `"M. Turner"`,
     matter from the item's `matter_code`).
   - Returns the updated `QueueItemDetail`.
   - 404 if item not found.

3. **Frontend API types and hook** in `ReachStack/lib/api.ts`:
   - Add `original_draft_text: string` to the `QueueItemDetail` interface.
   - Add `useDraftUpdateMutation(itemId)` modelled on
     `useActionMutation` — `PATCH`, invalidates `["queue-item", itemId]` and
     `["audit"]` on success.

4. **`ReachStack/components/ui/draft-response.tsx`** — convert from read-only
   `<pre>` to an editor:
   - Local state for the edited text, seeded from `data.draft_text`. Re-sync
     via `useEffect` when `itemId` changes or new server data arrives.
   - `<textarea>` (use `components/ui/textarea.tsx`).
   - "Save" button — enabled only when local text differs from
     `data.draft_text`. Calls the mutation; toast on success/error.
   - "Reset to AI version" button — visible only when
     `data.draft_text !== data.original_draft_text`. Calls the mutation with
     `original_draft_text`. (Doing it server-side keeps it durable too.)
   - "Edited" badge in the header when
     `data.draft_text !== data.original_draft_text`.

5. **Restart frontend** (`cd ReachStack && npm run dev`) and verify in the
   browser:
   - Edit the draft on Review screen, click Save, refresh page → edit persists.
   - Audit screen shows the new "Draft edited" event.
   - Reset button restores the AI text and re-saves.
   - Switching items doesn't leak edits between them.

## Followups (not blocking)

Still cosmetic-only and intentionally left alone:

- DecisionRail's Classification / Engagement link / Confidence rows are still
  hardcoded ("Pleadings", "ACL-1042", "98.4%").
- Branding "Live Preview" panel is purely decorative — theme change does not
  reflect.
- Portal mock's header tabs (Documents / Messages / Support) are decorative.
