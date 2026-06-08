"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useAuditQuery } from "@/lib/api"
import { formatTimeShort } from "@/lib/format"

const statusToVariant = {
  success: "success",
  info: "info",
  warning: "warning",
} as const

export function AuditFeed() {
  const { data, isPending, error } = useAuditQuery()
  const events = (data?.events ?? []).slice(0, 5)

  if (isPending) {
    return (
      <div className="flex items-center text-sm text-muted-foreground py-2">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading audit feed…
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">Couldn&apos;t load audit feed: {error.message}</p>
    )
  }

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No audit events yet.</p>
  }

  return (
    <div className="space-y-3">
      {events.map((event, i) => {
        const variant = statusToVariant[event.status]
        return (
          <div
            key={i}
            className="flex gap-3 p-3 rounded-lg bg-card/30 border border-border/30"
          >
            <div className="shrink-0">
              <span className="font-mono text-[10px] text-muted-foreground">
                {formatTimeShort(event.time)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-xs font-medium",
                  variant === "success" && "text-success",
                  variant === "info" && "text-primary",
                  variant === "warning" && "text-warning",
                )}
              >
                {event.event}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {event.user} · {event.matter}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
