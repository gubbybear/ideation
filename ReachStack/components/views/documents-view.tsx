"use client"

import { useMemo, useState } from "react"
import {
  AlertCircle,
  ExternalLink,
  FileSearch,
  FileText,
  Loader2,
  Lock,
  PencilLine,
  Search,
  UploadCloud,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  useClientsQuery,
  useDocumentUpdateMutation,
  useDocumentsQuery,
  useRetrievalMutation,
  type DocumentRecord,
  type DocumentSourceOfTruth,
  type DocumentStatus,
  type DocumentSyncStatus,
} from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

const statusTone: Record<DocumentStatus, string> = {
  indexed: "bg-success/15 text-success border-success/20",
  processing: "bg-warning/15 text-warning border-warning/20",
  needs_review: "bg-destructive/10 text-destructive border-destructive/20",
}

const ownerTone: Record<DocumentSourceOfTruth, string> = {
  external: "bg-warning/15 text-warning border-warning/20",
  reachstack: "bg-primary/15 text-primary border-primary/20",
  shared: "bg-success/15 text-success border-success/20",
}

const syncLabel: Record<DocumentSyncStatus, string> = {
  not_synced: "not synced",
  synced: "synced",
  sync_pending: "sync pending",
  sync_failed: "sync failed",
  external_changed: "external changed",
  local_changed: "local changed",
  conflict: "conflict",
}

type OwnershipFilter = "all" | DocumentSourceOfTruth
type SyncFilter = "all" | DocumentSyncStatus

const ownershipFilters: { value: OwnershipFilter; label: string }[] = [
  { value: "all", label: "All ownership" },
  { value: "external", label: "External" },
  { value: "reachstack", label: "ReachStack" },
  { value: "shared", label: "Shared" },
]

const testSearches = [
  "BAS lodgement",
  "supplier dispute",
  "director ID",
  "lease renewal",
  "onboarding checklist",
  "conflict check",
  "remittance advice",
]

export function DocumentsView() {
  const { data: documents = [], isPending } = useDocumentsQuery()
  const { data: clients = [] } = useClientsQuery()
  const retrieval = useRetrievalMutation()
  const documentUpdate = useDocumentUpdateMutation()
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>("all")
  const [syncFilter, setSyncFilter] = useState<SyncFilter>("all")
  const [ask, setAsk] = useState("What document evidence matters most this week?")
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null)
  const [editorText, setEditorText] = useState("")
  const [editorNote, setEditorNote] = useState("")

  const clientById = useMemo(() => new Map(clients.map((client) => [client.id, client.name])), [clients])
  const clientName = (id: string) => clientById.get(id) ?? id
  const documentTypes = useMemo(
    () => Array.from(new Set(documents.map((doc) => doc.doc_type))).sort((a, b) => a.localeCompare(b)),
    [documents],
  )
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return documents.filter((doc) => {
      if (typeFilter !== "all" && doc.doc_type !== typeFilter) return false
      if (ownershipFilter !== "all" && doc.source_of_truth !== ownershipFilter) return false
      if (syncFilter !== "all" && doc.sync_status !== syncFilter) return false
      if (!needle) return true

      return [
        doc.name,
        doc.doc_type,
        doc.subtype,
        doc.source,
        doc.source_of_truth,
        doc.source_system,
        doc.external_system ?? "",
        doc.external_id ?? "",
        sourceSystemLabel(doc.external_system ?? doc.source_system),
        syncLabel[doc.sync_status],
        doc.sync_status,
        doc.local_editing,
        doc.approval_status ?? "",
        doc.generated_by ?? "",
        doc.version ? `v${doc.version}` : "",
        doc.owner,
        clientById.get(doc.client_id) ?? doc.client_id,
        doc.snippet,
        ...doc.tags,
        ...doc.based_on_documents,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    })
  }, [clientById, documents, ownershipFilter, query, syncFilter, typeFilter])

  async function askDocuments() {
    if (!ask.trim()) return
    await retrieval.mutateAsync({ query: ask })
  }

  function openEditor(doc: DocumentRecord) {
    setEditingDoc(doc)
    setEditorText(doc.snippet)
    setEditorNote("")
  }

  async function saveEditor() {
    if (!editingDoc || !editorText.trim()) return
    await documentUpdate.mutateAsync({
      documentId: editingDoc.id,
      update: {
        snippet: editorText.trim(),
        note: editorNote.trim() || undefined,
      },
    })
    setEditingDoc(null)
    setEditorText("")
    setEditorNote("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
            Document Management
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Searchable document library
          </h1>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/40 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/30"
        >
          <UploadCloud className="w-4 h-4 text-primary" />
          Index folder
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <GlassCard title="Documents" badge={`${filtered.length}`}>
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-border/40 bg-background px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search filenames, document types, source systems, sync states, tags..."
                className="h-7 border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 rounded-lg border border-border/40 bg-background px-3 text-xs font-medium text-foreground"
              >
                <option value="all">All document types</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {ownershipFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setOwnershipFilter(filter.value)}
                  className={cn(
                    "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                    ownershipFilter === filter.value
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/40 bg-card/30 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filter.label}
                </button>
              ))}

              <select
                value={syncFilter}
                onChange={(e) => setSyncFilter(e.target.value as SyncFilter)}
                className="h-9 rounded-lg border border-border/40 bg-background px-3 text-xs font-medium text-foreground"
              >
                <option value="all">All sync states</option>
                {(Object.keys(syncLabel) as DocumentSyncStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {syncLabel[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {testSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-full bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
                >
                  {term}
                </button>
              ))}
            </div>

            {isPending ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                Loading documents...
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-border/30 bg-muted/10 py-12 text-center text-sm text-muted-foreground">
                No documents match those filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <colgroup>
                    <col className="w-[48%]" />
                    <col className="w-[14%]" />
                    <col className="w-[24%]" />
                    <col className="w-[14%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Document</th>
                      <th className="text-left py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Client</th>
                      <th className="text-left py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Source</th>
                      <th className="text-right py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doc) => (
                      <DocumentRow
                        key={doc.id}
                        doc={doc}
                        clientName={clientName(doc.client_id)}
                        onOpenEditor={openEditor}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="col-span-4 space-y-4">
          <GlassCard title="Ask Documents" badge="Cited">
            <div className="space-y-3">
              <Textarea
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                className="min-h-24 text-sm"
              />
              <button
                type="button"
                onClick={askDocuments}
                disabled={retrieval.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {retrieval.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
                Ask documents
              </button>

              {retrieval.data ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{retrieval.data.answer}</p>
                  <div className="mt-3 space-y-2">
                    {retrieval.data.citations.map((citation) => (
                      <div key={`${citation.title}-${citation.score}`} className="rounded-md border border-border/30 bg-card/50 p-2">
                        <p className="text-xs font-semibold text-foreground">{citation.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{citation.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-border/30 bg-muted/10 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Answers should cite the exact client record, document, booking, or time entry used.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard title="Source Of Truth" badge="Ownership">
            <div className="space-y-3">
              <OwnershipCount
                label="External"
                count={documents.filter((d) => d.source_of_truth === "external").length}
                detail="Search and cite here; edit in the source system."
                tone="external"
              />
              <OwnershipCount
                label="ReachStack"
                count={documents.filter((d) => d.source_of_truth === "reachstack").length}
                detail="Created, edited, approved, and audited here."
                tone="reachstack"
              />
              <OwnershipCount
                label="Shared"
                count={documents.filter((d) => d.source_of_truth === "shared").length}
                detail="Editable here with sync state tracked."
                tone="shared"
              />
            </div>
          </GlassCard>

          <GlassCard title="Index Coverage" badge="Live">
            <div className="space-y-3">
              <Coverage label="Indexed" count={documents.filter((d) => d.status === "indexed").length} total={documents.length} />
              <Coverage label="Processing" count={documents.filter((d) => d.status === "processing").length} total={documents.length} />
              <Coverage label="Needs review" count={documents.filter((d) => d.status === "needs_review").length} total={documents.length} />
            </div>
          </GlassCard>
        </div>
      </div>

      <DocumentEditorDialog
        doc={editingDoc}
        text={editorText}
        note={editorNote}
        saving={documentUpdate.isPending}
        error={documentUpdate.error instanceof Error ? documentUpdate.error.message : null}
        onTextChange={setEditorText}
        onNoteChange={setEditorNote}
        onSave={() => void saveEditor()}
        onOpenChange={(open) => {
          if (!open) setEditingDoc(null)
        }}
      />
    </div>
  )
}

function DocumentRow({
  doc,
  clientName,
  onOpenEditor,
}: {
  doc: DocumentRecord
  clientName: string
  onOpenEditor?: (doc: DocumentRecord) => void
}) {
  const systemLabel = doc.external_system ?? doc.source_system
  const syncIssue = syncIssueLabel(doc.sync_status)
  const approvalState = approvalStateLabel(doc.approval_status)
  const canOpenEditor = canOpenWordEditor(doc)

  return (
    <tr className="border-b border-border/20 hover:bg-muted/10">
      <td className="py-3 px-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {doc.doc_type} - {doc.subtype}
            </p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.snippet}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {doc.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-3 text-sm text-muted-foreground">{clientName}</td>
      <td className="py-3 px-3">
        <p className="text-sm font-medium text-foreground">{sourceSystemLabel(systemLabel)}</p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          {doc.local_editing === "enabled" ? (
            <PencilLine className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-warning" />
          )}
          {doc.local_editing === "enabled" ? "Editable here" : "Edit in source"}
        </div>
        {doc.version && (
          <p className="mt-1 text-xs text-muted-foreground">Version {doc.version}</p>
        )}
        {canOpenEditor && (
          <button
            type="button"
            onClick={() => onOpenEditor?.(doc)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/15"
          >
            <PencilLine className="h-3.5 w-3.5" />
            Open editor
          </button>
        )}
        {syncIssue && (
          <p className="mt-1 text-xs font-medium text-warning">{syncIssue}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(doc.uploaded_at)}</p>
        {doc.external_url && (
          <a
            href={doc.external_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
          >
            Open source
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </td>
      <td className="py-3 px-3 text-right">
        <span className={cn("inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold", statusTone[doc.status])}>
          {documentStatusLabel(doc.status)}
        </span>
        {approvalState && (
          <p className="mt-2 text-xs text-muted-foreground">
            {approvalState}
          </p>
        )}
      </td>
    </tr>
  )
}

function DocumentEditorDialog({
  doc,
  text,
  note,
  saving,
  error,
  onTextChange,
  onNoteChange,
  onSave,
  onOpenChange,
}: {
  doc: DocumentRecord | null
  text: string
  note: string
  saving: boolean
  error: string | null
  onTextChange: (value: string) => void
  onNoteChange: (value: string) => void
  onSave: () => void
  onOpenChange: (open: boolean) => void
}) {
  const hasChanges = Boolean(doc && text.trim() && text.trim() !== doc.snippet.trim())

  return (
    <Dialog open={Boolean(doc)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{doc ? `Editor - ${doc.name}` : "Document editor"}</DialogTitle>
          <DialogDescription className="sr-only">
            Edit the selected Word document.
          </DialogDescription>
        </DialogHeader>

        {doc && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-border/40 bg-muted/10 p-3 text-xs">
              <EditorMeta label="Source" value={sourceSystemLabel(doc.external_system ?? doc.source_system)} />
              <EditorMeta label="Edit rule" value={doc.local_editing === "enabled" ? "Editable here" : "Edit in source"} />
              <EditorMeta label="Version" value={doc.version ? `Version ${doc.version}` : "Unversioned"} />
            </div>

            <Textarea
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              className="min-h-64 resize-y text-sm leading-relaxed"
            />

            <Input
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Optional edit note"
              className="text-sm"
            />

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-border/50 bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/30"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!hasChanges || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />}
            Save draft
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditorMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-foreground">{value}</p>
    </div>
  )
}

function canOpenWordEditor(doc: DocumentRecord): boolean {
  return doc.name.toLowerCase().endsWith(".docx") && doc.local_editing === "enabled"
}

function documentStatusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    indexed: "Indexed",
    processing: "Processing",
    needs_review: "Needs review",
  }
  return labels[status]
}

function approvalStateLabel(status: DocumentRecord["approval_status"]): string | null {
  if (status === "draft") return "Approval: draft"
  if (status === "review") return "Approval: review"
  return null
}

function syncIssueLabel(status: DocumentSyncStatus): string | null {
  const labels: Partial<Record<DocumentSyncStatus, string>> = {
    sync_pending: "Sync pending",
    sync_failed: "Sync failed",
    external_changed: "External changed",
    local_changed: "Local changes",
    conflict: "Conflict",
  }
  return labels[status] ?? null
}

function sourceSystemLabel(system: string): string {
  const labels: Record<string, string> = {
    xero: "Xero",
    myob: "MYOB",
    quickbooks: "QuickBooks",
    microsoft_365: "Microsoft 365",
    google_drive: "Google Drive",
    client_portal: "Client portal",
    reachstack: "ReachStack",
    manual: "Manual upload",
    manual_upload: "Manual upload",
  }
  return labels[system] ?? system
}

function OwnershipCount({
  label,
  count,
  detail,
  tone,
}: {
  label: string
  count: number
  detail: string
  tone: DocumentSourceOfTruth
}) {
  return (
    <div className="rounded-lg border border-border/30 bg-card/30 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className={cn("rounded-full border px-2 py-1 text-[10px] font-semibold uppercase", ownerTone[tone])}>
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground">{count}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{detail}</p>
    </div>
  )
}

function Coverage({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{count} docs</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
