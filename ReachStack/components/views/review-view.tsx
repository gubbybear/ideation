"use client"

import { useMemo, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { DocumentPreview } from "@/components/ui/document-preview"
import { DraftResponse } from "@/components/ui/draft-response"
import { DecisionRail } from "@/components/ui/decision-rail"
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useQueueItemQuery, useQueueQuery } from "@/lib/api"
import { formatTimeShort } from "@/lib/format"

export function ReviewView() {
  const { data: queue = [] } = useQueueQuery()
  const ids = useMemo(() => queue.map((q) => q.id), [queue])
  const [activeId, setActiveId] = useState<string | null>(null)
  const currentId = activeId ?? ids[0] ?? "1"
  const currentIndex = ids.indexOf(currentId)

  const { data: item, isPending, error } = useQueueItemQuery(currentId)

  const goPrev = () => {
    if (currentIndex > 0) setActiveId(ids[currentIndex - 1])
  }
  const goNext = () => {
    if (currentIndex >= 0 && currentIndex < ids.length - 1) {
      setActiveId(ids[currentIndex + 1])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
            Document Review
          </p>
          {isPending ? (
            <div className="h-8 bg-muted/30 rounded w-64 mb-2 animate-pulse" />
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-foreground">
                {item?.title || "Loading…"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {item?.matter_code} · Received {formatTimeShort(item?.received_at || "")}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={currentIndex <= 0}
            className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous item"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground px-3 tabular-nums">
            {ids.length > 0 ? `${currentIndex + 1} of ${ids.length}` : "—"}
          </span>
          <button
            onClick={goNext}
            disabled={currentIndex < 0 || currentIndex >= ids.length - 1}
            className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next item"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Couldn&apos;t load item</p>
            <p className="text-xs text-destructive/70 font-mono">{error.message}</p>
          </div>
        </div>
      )}

      {item?.alert && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-warning">{item.alert}</p>
            {item.alert_detail && (
              <p className="text-xs text-warning/70">{item.alert_detail}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5">
          <GlassCard title="Document Preview">
            {isPending ? (
              <div className="py-12 text-center">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin inline-block" />
                <span className="ml-2 text-sm text-muted-foreground">Loading…</span>
              </div>
            ) : (
              <DocumentPreview itemId={currentId} />
            )}
          </GlassCard>
        </div>

        <div className="col-span-4">
          <GlassCard title="AI-Generated Response" badge="Acme tone" badgeVariant="info">
            {isPending ? (
              <div className="py-12 text-center">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin inline-block" />
              </div>
            ) : (
              <DraftResponse itemId={currentId} />
            )}
          </GlassCard>
        </div>

        <div className="col-span-3">
          <DecisionRail itemId={currentId} />
        </div>
      </div>
    </div>
  )
}
