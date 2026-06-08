"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { Shield, CheckCircle, AlertTriangle, Download, Loader2, AlertCircle } from "lucide-react"
import { useAuditQuery, type AuditEvent } from "@/lib/api"
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

export function AuditView() {
  const { data, isPending, error } = useAuditQuery()
  const events = data?.events ?? []
  const metrics = data?.metrics ?? []

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
