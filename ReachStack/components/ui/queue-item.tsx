"use client"

import { cn } from "@/lib/utils"

interface QueueItemProps {
  id: string
  title: string
  meta: string
  confidence: number
  status: "partner" | "file" | "draft" | "logged" | "hold" | "review"
  isSelected?: boolean
  onClick?: () => void
}

const statusConfig = {
  partner: { label: "Partner", variant: "warning" as const },
  file: { label: "File", variant: "success" as const },
  draft: { label: "Draft", variant: "info" as const },
  logged: { label: "Logged", variant: "success" as const },
  hold: { label: "Hold", variant: "destructive" as const },
  review: { label: "Review", variant: "info" as const },
}

export function QueueItem({ 
  title, 
  meta, 
  confidence, 
  status, 
  isSelected, 
  onClick 
}: QueueItemProps) {
  const config = statusConfig[status]
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all duration-200",
        isSelected 
          ? "bg-primary/10 border-primary/30 shadow-[0_0_20px_var(--glass-highlight)]" 
          : "bg-card/50 border-border/30 hover:bg-card/80 hover:border-border/50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            isSelected ? "text-foreground" : "text-secondary-foreground"
          )}>
            {title}
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{meta}</p>
        </div>
        
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="font-mono text-xs font-semibold text-foreground">
            {confidence}%
          </span>
          <span className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase",
            config.variant === "warning" && "bg-warning/15 text-warning",
            config.variant === "success" && "bg-success/15 text-success",
            config.variant === "info" && "bg-primary/15 text-primary",
            config.variant === "destructive" && "bg-destructive/15 text-destructive"
          )}>
            {config.label}
          </span>
        </div>
      </div>
    </button>
  )
}
