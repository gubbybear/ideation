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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  useClientsQuery,
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

export function DocumentsView() {
  const { data: documents = [], isPending } = useDocumentsQuery()
  const { data: clients = [] } = useClientsQuery()
  const retrieval = useRetrievalMutation()
  const [query, setQuery] = useState("")
  const [ask, setAsk] = useState("What document evidence matters most this week?")

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? id
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return documents
    return documents.filter((doc) =>
      [doc.name, doc.doc_type, doc.source, doc.snippet, ...doc.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    )
  }, [documents, query])

  async function askDocuments() {
    if (!ask.trim()) return
    await retrieval.mutateAsync({ query: ask })
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
                placeholder="Search filenames, tags, document types, snippets..."
                className="h-7 border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </div>

            {isPending ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                Loading documents...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Document</th>
                      <th className="text-left py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Client</th>
                      <th className="text-left py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Owned By</th>
                      <th className="text-left py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Source</th>
                      <th className="text-right py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doc) => (
                      <DocumentRow key={doc.id} doc={doc} clientName={clientName(doc.client_id)} />
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
                  <p className="text-sm leading-relaxed text-foreground">{retrieval.data.answer}</p>
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
    </div>
  )
}

function DocumentRow({ doc, clientName }: { doc: DocumentRecord; clientName: string }) {
  const ownerLabel = doc.source_of_truth === "reachstack" ? "ReachStack" : doc.source_of_truth
  const systemLabel = doc.external_system ?? doc.source_system

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
        <span className={cn("rounded-full border px-2 py-1 text-[10px] font-semibold uppercase", ownerTone[doc.source_of_truth])}>
          {ownerLabel}
        </span>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          {doc.local_editing === "enabled" ? (
            <PencilLine className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-warning" />
          )}
          {doc.local_editing === "enabled" ? "Editable here" : "Edit in source"}
        </div>
        {doc.version && (
          <p className="mt-1 text-xs text-muted-foreground">v{doc.version}</p>
        )}
      </td>
      <td className="py-3 px-3">
        <p className="text-sm text-foreground">{sourceSystemLabel(systemLabel)}</p>
        <p className="text-xs text-muted-foreground">{syncLabel[doc.sync_status]} - {formatDateTime(doc.uploaded_at)}</p>
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
        <span className={cn("rounded-full border px-2 py-1 text-[10px] font-semibold uppercase", statusTone[doc.status])}>
          {doc.status.replace("_", " ")}
        </span>
      </td>
    </tr>
  )
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
