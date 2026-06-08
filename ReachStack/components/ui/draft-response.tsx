"use client"

import { Loader2 } from "lucide-react"
import { useQueueItemQuery } from "@/lib/api"

interface DraftResponseProps {
  itemId?: string
}

export function DraftResponse({ itemId = "1" }: DraftResponseProps) {
  const { data, isPending, error } = useQueueItemQuery(itemId)

  return (
    <div className="flex flex-col h-full bg-card/30 rounded-lg border border-border/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/10">
        <h4 className="text-sm font-medium text-foreground">Draft Response</h4>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase">
          Acme tone
        </span>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {isPending && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating draft preview…
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">
            Couldn&apos;t load draft: {error.message}
          </p>
        )}

        {data && (
          <>
            <pre className="whitespace-pre-wrap font-sans text-sm text-secondary-foreground leading-relaxed">
              {data.draft_text}
            </pre>
            <p className="text-xs text-muted-foreground italic pt-2 border-t border-border/20">
              Private identifiers were tokenised before generation and restored
              inside the {data.matter_code} tenant. Use the decision rail to approve, escalate,
              or request more information.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
