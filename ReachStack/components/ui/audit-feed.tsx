"use client"

import { cn } from "@/lib/utils"

const auditEvents = [
  {
    time: "12:14",
    title: "Classification approved",
    description: "Smith v Hargrove statement linked",
    variant: "success" as const,
  },
  {
    time: "11:45",
    title: "PII redaction complete",
    description: "3 references tokenised",
    variant: "info" as const,
  },
  {
    time: "11:42",
    title: "Portal upload received",
    description: "Brennan engagement letter",
    variant: "default" as const,
  },
  {
    time: "10:53",
    title: "Draft generated",
    description: "Coastal Holdings response",
    variant: "info" as const,
  },
]

export function AuditFeed() {
  return (
    <div className="space-y-3">
      {auditEvents.map((event, i) => (
        <div 
          key={i} 
          className="flex gap-3 p-3 rounded-lg bg-card/30 border border-border/30"
        >
          <div className="shrink-0">
            <span className="font-mono text-[10px] text-muted-foreground">{event.time}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-xs font-medium",
              event.variant === "success" && "text-success",
              event.variant === "info" && "text-primary",
              event.variant === "default" && "text-foreground"
            )}>
              {event.title}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
