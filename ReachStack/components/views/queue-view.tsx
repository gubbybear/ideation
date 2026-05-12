"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { Filter, ArrowUpDown } from "lucide-react"

const queueData = [
  { id: 1, name: "Smith v Hargrove", type: "Statement of Claim", source: "Email", confidence: 98.4, status: "partner", time: "12:14" },
  { id: 2, name: "Brennan Estate", type: "Engagement Letter", source: "Portal", confidence: 99.1, status: "file", time: "11:42" },
  { id: 3, name: "Coastal Holdings", type: "Client Inquiry", source: "Inbox", confidence: 94.8, status: "draft", time: "10:53" },
  { id: 4, name: "Monthly Close", type: "Trust Ledger", source: "Drive", confidence: 100, status: "logged", time: "10:02" },
  { id: 5, name: "Smith v Hargrove", type: "Counsel Brief", source: "Email", confidence: 87.4, status: "hold", time: "09:36" },
  { id: 6, name: "Parker Industries", type: "New Matter Intake", source: "Portal", confidence: 96.2, status: "review", time: "09:15" },
  { id: 7, name: "Wellington Trust", type: "Document Review", source: "Email", confidence: 91.5, status: "draft", time: "08:44" },
  { id: 8, name: "Metro Commercial", type: "Settlement Docs", source: "Portal", confidence: 99.8, status: "file", time: "08:22" },
]

const statusConfig: Record<string, { label: string; variant: string }> = {
  partner: { label: "Partner", variant: "warning" },
  file: { label: "File", variant: "success" },
  draft: { label: "Draft", variant: "info" },
  logged: { label: "Logged", variant: "success" },
  hold: { label: "Hold", variant: "destructive" },
  review: { label: "Review", variant: "info" },
}

const filters = ["All", "Urgent", "Review", "Missing info", "Partner"]

export function QueueView() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [selectedRow, setSelectedRow] = useState<number | null>(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
            Queue Management
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            All inbound items awaiting processing
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeFilter === filter
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-muted/30 text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Matter</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="text-right py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Confidence</th>
                <th className="text-right py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {queueData.map((row) => {
                const config = statusConfig[row.status]
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRow(row.id)}
                    className={cn(
                      "border-b border-border/20 cursor-pointer transition-colors",
                      selectedRow === row.id ? "bg-primary/10" : "hover:bg-muted/20"
                    )}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{row.name}</td>
                    <td className="py-3 px-4 text-sm text-secondary-foreground">{row.type}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{row.source}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{row.time}</td>
                    <td className="py-3 px-4 text-sm text-right font-mono font-medium text-foreground">{row.confidence}%</td>
                    <td className="py-3 px-4 text-right">
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase",
                        config.variant === "warning" && "bg-warning/15 text-warning",
                        config.variant === "success" && "bg-success/15 text-success",
                        config.variant === "info" && "bg-primary/15 text-primary",
                        config.variant === "destructive" && "bg-destructive/15 text-destructive"
                      )}>
                        {config.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
