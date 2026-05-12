"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { DocumentPreview } from "@/components/ui/document-preview"
import { DraftResponse } from "@/components/ui/draft-response"
import { DecisionRail } from "@/components/ui/decision-rail"
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"

export function ReviewView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
            Document Review
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Statement of claim from Hargrove Holdings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Smith v Hargrove · Matter ACL-1042 · Received 12:14
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground px-3">1 of 6</span>
          <button className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-warning">Human approval required</p>
          <p className="text-xs text-warning/70">
            This document contains a newly named opposing party and requires partner sign-off before processing.
          </p>
        </div>
      </div>

      {/* Main review area */}
      <div className="grid grid-cols-12 gap-6">
        {/* Document preview */}
        <div className="col-span-5">
          <GlassCard title="Document Preview">
            <DocumentPreview />
          </GlassCard>
        </div>

        {/* Draft response */}
        <div className="col-span-4">
          <GlassCard title="AI-Generated Response" badge="Acme tone" badgeVariant="info">
            <DraftResponse />
          </GlassCard>
        </div>

        {/* Decision rail */}
        <div className="col-span-3">
          <DecisionRail />
        </div>
      </div>
    </div>
  )
}
