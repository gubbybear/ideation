"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface GlassCardProps {
  title?: string
  badge?: string
  badgeVariant?: "default" | "success" | "warning" | "info"
  children: ReactNode
  className?: string
}

export function GlassCard({ 
  title, 
  badge, 
  badgeVariant = "default",
  children, 
  className 
}: GlassCardProps) {
  return (
    <div className={cn("glass rounded-xl border-glow overflow-hidden", className)}>
      {(title || badge) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          {title && (
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          )}
          {badge && (
            <span className={cn(
              "text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide",
              badgeVariant === "success" && "bg-success/15 text-success border border-success/20",
              badgeVariant === "warning" && "bg-warning/15 text-warning border border-warning/20",
              badgeVariant === "info" && "bg-primary/15 text-primary border border-primary/20",
              badgeVariant === "default" && "bg-muted/50 text-muted-foreground"
            )}>
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
