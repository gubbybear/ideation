"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { MetricCard } from "@/components/ui/metric-card"
import { cn } from "@/lib/utils"
import { Shield, CheckCircle, AlertTriangle, Download, Filter } from "lucide-react"

const auditLog = [
  { time: "12:14:32", event: "Classification approved", user: "M. Turner", matter: "ACL-1042", status: "success" },
  { time: "12:14:28", event: "PII redaction complete", user: "System", matter: "ACL-1042", status: "info" },
  { time: "11:45:12", event: "Document tokenised", user: "System", matter: "ACL-1039", status: "info" },
  { time: "11:42:05", event: "Portal upload received", user: "Client", matter: "ACL-1039", status: "success" },
  { time: "10:53:44", event: "Draft generated", user: "System", matter: "ACL-1038", status: "info" },
  { time: "10:53:22", event: "Classification complete", user: "System", matter: "ACL-1038", status: "success" },
  { time: "10:02:11", event: "File logged to DMS", user: "System", matter: "Monthly", status: "success" },
  { time: "09:36:55", event: "Annexure missing flagged", user: "System", matter: "ACL-1042", status: "warning" },
  { time: "09:15:33", event: "New matter created", user: "J. Smith", matter: "ACL-1040", status: "success" },
  { time: "08:44:21", event: "Review requested", user: "System", matter: "ACL-1037", status: "info" },
]

const assuranceMetrics = [
  { label: "Documents processed", value: "1,247", subtext: "This month" },
  { label: "PII redaction rate", value: "100%", subtext: "All documents" },
  { label: "Audit coverage", value: "100%", subtext: "Full traceability" },
  { label: "Average confidence", value: "96.4%", subtext: "Classification" },
]

export function AuditView() {
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
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            Export log
          </button>
        </div>
      </div>

      {/* Assurance tiles */}
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

        {assuranceMetrics.slice(0, 2).map((metric) => (
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
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Matter</th>
                <th className="text-right py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((row, i) => (
                <tr key={i} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{row.time}</td>
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
