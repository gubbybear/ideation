"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { Shield, CheckCircle, AlertTriangle, Download, Loader2, AlertCircle, GitCommitHorizontal, RotateCcw } from "lucide-react"
import { useAuditQuery, useChangeUndoMutation, type AuditEvent, type ChangeRecord } from "@/lib/api"
import { formatTimeLong } from "@/lib/format"

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function downloadAuditCsv(events: AuditEvent[]) {
  const header = ["time", "event", "user", "record", "status"]
  const rows = events.map((e) =>
    [e.time, e.event, e.user, e.matter, e.status].map(escapeCsv).join(","),
  )
  const csv = [header.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  link.download = `audit-log-${stamp}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function changeOperationTone(change: ChangeRecord) {
  if (change.reverted) return "bg-muted/50 text-muted-foreground border-border/30"
  if (change.operation === "create") return "bg-success/15 text-success border-success/20"
  if (change.operation === "update") return "bg-primary/15 text-primary border-primary/20"
  if (change.operation === "undo") return "bg-warning/15 text-warning border-warning/20"
  return "bg-muted/50 text-muted-foreground border-border/30"
}

export function AuditView() {
  const { data, isPending, error } = useAuditQuery()
  const undo = useChangeUndoMutation()
  const events = data?.events ?? []
  const metrics = data?.metrics ?? []
  const changes = data?.changes ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
            Audit & Compliance
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Full traceability and compliance assurance
          </h1>
          {data?.session_id && (
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              Session {data.session_id}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadAuditCsv(events)}
            disabled={events.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Export log
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Couldn&apos;t load audit log</p>
            <p className="text-xs text-destructive/70 font-mono">{error.message}</p>
          </div>
        </div>
      )}

      {/* Audit summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl border-glow p-5 col-span-1">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground mt-1">Audit Coverage</p>
              <p className="text-xs text-success mt-2">All actions fully traceable</p>
            </div>
          </div>
        </div>

        {metrics.slice(0, 2).map((metric) => (
          <div key={metric.label} className="glass rounded-xl border-glow p-5">
            <p className="text-2xl font-bold text-foreground">{metric.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
            <p className="text-xs text-muted-foreground/70 mt-2">{metric.subtext}</p>
          </div>
        ))}
      </div>

      {/* Session changes */}
      <GlassCard title="Session Changes" badge={`${changes.length}`} badgeVariant="info">
        <div className="space-y-3">
          <div className="rounded-lg border border-border/30 bg-muted/10 p-3">
            <div className="flex items-start gap-2">
              <GitCommitHorizontal className="mt-0.5 h-4 w-4 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                This is the reversible change history for the current demo session. Audit events remain immutable; these records keep before/after state so a mock action can be rolled back.
              </p>
            </div>
          </div>

          {isPending && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Loading session changes...
            </div>
          )}

          {!isPending && changes.length === 0 && (
            <div className="rounded-lg border border-border/30 bg-muted/10 py-8 text-center text-sm text-muted-foreground">
              No reversible changes have been recorded in this session yet.
            </div>
          )}

          {!isPending && changes.map((change) => {
            const undoing = undo.isPending && undo.variables === change.id
            const canUndo = change.reversible && !change.reverted && change.operation !== "undo"
            return (
              <div key={change.id} className="rounded-lg border border-border/30 bg-card/40 p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full border px-2 py-1 text-[10px] font-semibold uppercase", changeOperationTone(change))}>
                        {change.operation}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{change.id}</span>
                      {change.reverted && (
                        <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                          reverted
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{change.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{change.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{formatTimeLong(change.time)}</span>
                      <span>{change.actor}</span>
                      <span className="font-mono">{change.target_type}:{change.target_id}</span>
                      {change.undo_of && <span className="font-mono">undo of {change.undo_of}</span>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => undo.mutate(change.id)}
                    disabled={!canUndo || undoing}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border/40 bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {undoing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    Undo
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Audit log */}
      <GlassCard title="Audit Log" badge="Live" badgeVariant="success">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Event</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Record</th>
                <th className="text-right py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {isPending && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin inline-block" />
                    <span className="ml-3 text-sm text-muted-foreground">Loading audit log…</span>
                  </td>
                </tr>
              )}
              {!isPending && events.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No audit events yet.
                  </td>
                </tr>
              )}
              {!isPending && events.map((row, i) => (
                <tr key={i} className={cn(
                  "border-b border-border/20 hover:bg-muted/10 transition-colors",
                  i === 0 && "bg-primary/5"
                )}>
                  <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{formatTimeLong(row.time)}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{row.event}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{row.user}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{row.matter}</td>
                  <td className="py-3 px-4 text-right">
                    {row.status === "success" && <CheckCircle className="w-4 h-4 text-success inline" />}
                    {row.status === "info" && <div className="w-2 h-2 rounded-full bg-primary inline-block" />}
                    {row.status === "warning" && <AlertTriangle className="w-4 h-4 text-warning inline" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
