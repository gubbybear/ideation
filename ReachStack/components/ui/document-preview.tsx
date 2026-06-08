"use client"

import { Loader2 } from "lucide-react"
import { useQueueItemQuery } from "@/lib/api"

interface DocumentPreviewProps {
  itemId?: string
}

export function DocumentPreview({ itemId = "1" }: DocumentPreviewProps) {
  const { data, isPending, error } = useQueueItemQuery(itemId)

  return (
    <div className="h-full">
      <div className="bg-muted/20 rounded-lg p-4 h-full border border-border/30">
        <div className="bg-card/50 rounded-lg p-5 border border-border/20 min-h-[280px] shadow-lg">
          {isPending && (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading document…
            </div>
          )}

          {error && (
            <div className="py-10 text-sm text-destructive">
              Couldn&apos;t load this item: {error.message}
            </div>
          )}

          {data && (
            <>
              <p className="font-mono text-xs font-semibold text-foreground mb-4">
                {data.title}
              </p>

              <pre className="whitespace-pre-wrap font-mono text-xs text-secondary-foreground leading-relaxed">
                {data.document_preview_text}
              </pre>

              <div className="grid grid-cols-2 gap-2 mt-6">
                <FieldPill label="Engagement" value={data.matter_code} />
                <FieldPill label="Confidence" value={`${data.confidence.toFixed(1)}%`} />
                <FieldPill label="Source" value={data.source} />
                <FieldPill label="Status" value={data.status} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-md px-3 py-2 border border-border/20">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xs font-medium text-foreground mt-0.5 capitalize">{value}</p>
    </div>
  )
}
