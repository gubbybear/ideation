"use client"

import { cn } from "@/lib/utils"

interface MetricCardProps {
  value: string
  label: string
  indicator: string
  variant?: "default" | "success" | "warning" | "info" | "destructive"
}

export function MetricCard({ value, label, indicator, variant = "default" }: MetricCardProps) {
  return (
    <div className="glass rounded-xl p-4 border-glow flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs font-bold",
        variant === "success" && "bg-success/15 text-success border border-success/20",
        variant === "warning" && "bg-warning/15 text-warning border border-warning/20",
        variant === "info" && "bg-primary/15 text-primary border border-primary/20",
        variant === "destructive" && "bg-destructive/15 text-destructive border border-destructive/20",
        variant === "default" && "bg-muted text-muted-foreground"
      )}>
        {indicator}
      </div>
    </div>
  )
}
