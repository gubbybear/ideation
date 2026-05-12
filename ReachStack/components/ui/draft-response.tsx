"use client"

import { Edit3, MessageSquarePlus, Send } from "lucide-react"

export function DraftResponse() {
  return (
    <div className="flex flex-col h-full bg-card/30 rounded-lg border border-border/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/10">
        <h4 className="text-sm font-medium text-foreground">Draft Response</h4>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase">
          Acme tone
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-3 overflow-auto">
        <p className="text-sm text-secondary-foreground leading-relaxed">
          Hi Jordan, thanks for sending through the statement of claim. We have linked it to matter ACL-1042 and flagged the newly named opposing party for partner review.
        </p>
        <p className="text-sm text-secondary-foreground leading-relaxed">
          Before we can confirm next steps, could you please send the missing annexures referenced on page 14? The matter team will review the filing date and respond once the partner check is complete.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Private identifiers were tokenised before generation and restored inside the Acme Legal tenant.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-3 border-t border-border/30 bg-muted/10">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          <Send className="w-3.5 h-3.5" />
          Approve
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
          <Edit3 className="w-3.5 h-3.5" />
          Edit
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
          <MessageSquarePlus className="w-3.5 h-3.5" />
          Request info
        </button>
      </div>
    </div>
  )
}
