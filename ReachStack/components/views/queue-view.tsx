"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { AlertCircle, Loader2 } from "lucide-react"
import { useQueueQuery } from "@/lib/api"
import { formatTimeShort } from "@/lib/format"

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
  const [selectedRow, setSelectedRow] = useState<string | null>("1")
  const { data: rows = [], isPending, error } = useQueueQuery(activeFilter)

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

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Couldn&apos;t load queue</p>
            <p className="text-xs text-destructive/70 font-mono">{error.message}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Client / Engagement</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="text-right py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Confidence</th>
                <th className="text-right py-3 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {isPending && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin inline-block" />
                    <span className="ml-3 text-sm text-muted-foreground">Loading queue…</span>
                  </td>
                </tr>
              )}
              {!isPending && rows.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    No items match this filter.
                  </td>
                </tr>
              )}
              {!isPending && rows.map((row) => {
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
                    <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{formatTimeShort(row.time)}</td>
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
