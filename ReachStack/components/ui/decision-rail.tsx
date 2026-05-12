"use client"

import { GlassCard } from "./glass-card"
import { Send, UserCheck, HelpCircle, XCircle } from "lucide-react"

export function DecisionRail() {
  return (
    <div className="space-y-4">
      {/* Classification */}
      <GlassCard title="Decision Rail">
        <div className="space-y-0">
          <DecisionRow label="Classification" value="Pleadings" />
          <DecisionRow label="Engagement link" value="ACL-1042" />
          <DecisionRow label="Suggested action" value="Partner review" />
          <DecisionRow label="Confidence" value="98.4%" highlight />
        </div>
      </GlassCard>

      {/* Privacy */}
      <GlassCard title="Privacy Posture">
        <div className="space-y-0">
          <DecisionRow label="Inference" value="AU-hosted" />
          <DecisionRow label="Redaction" value="Enabled" />
          <DecisionRow label="Training use" value="Disabled" />
          <DecisionRow label="Audit status" value="Complete" />
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="glass rounded-xl border-glow p-4 space-y-2">
        <ActionButton variant="primary" icon={Send}>
          Approve and send
        </ActionButton>
        <ActionButton icon={UserCheck}>
          Escalate to partner
        </ActionButton>
        <ActionButton icon={HelpCircle}>
          Create missing-info request
        </ActionButton>
        <ActionButton variant="destructive" icon={XCircle}>
          Mark as incorrect
        </ActionButton>
      </div>
    </div>
  )
}

function DecisionRow({ 
  label, 
  value, 
  highlight 
}: { 
  label: string
  value: string
  highlight?: boolean 
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  )
}

function ActionButton({ 
  children, 
  variant = "default",
  icon: Icon
}: { 
  children: React.ReactNode
  variant?: "default" | "primary" | "destructive"
  icon: React.ComponentType<{ className?: string }>
}) {
  const baseStyles = "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
  
  const variants = {
    default: "border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/30",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
    destructive: "border border-destructive/30 text-destructive hover:bg-destructive/10"
  }

  return (
    <button className={`${baseStyles} ${variants[variant]}`}>
      <Icon className="w-4 h-4" />
      {children}
    </button>
  )
}
