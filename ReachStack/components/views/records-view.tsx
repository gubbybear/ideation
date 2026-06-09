"use client"

import { useState } from "react"
import { DatabaseZap, Loader2, Search, Sparkles } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  useClientsQuery,
  useRetrievalMutation,
  useSearchQuery,
  type RecordType,
  type SearchResult,
} from "@/lib/api"
import { cn } from "@/lib/utils"

const typeTone: Record<RecordType, string> = {
  client: "bg-primary/15 text-primary border-primary/20",
  engagement: "bg-success/15 text-success border-success/20",
  document: "bg-warning/15 text-warning border-warning/20",
  queue: "bg-destructive/10 text-destructive border-destructive/20",
  booking: "bg-primary/10 text-primary border-primary/20",
  time: "bg-muted/50 text-muted-foreground border-border/40",
  note: "bg-muted/50 text-muted-foreground border-border/40",
  audit: "bg-destructive/10 text-destructive border-destructive/20",
}

export function RecordsView() {
  const [query, setQuery] = useState("payroll")
  const [clientId, setClientId] = useState("")
  const [ask, setAsk] = useState("What should we follow up across all client records?")
  const { data: clients = [] } = useClientsQuery()
  const { data: results = [], isPending } = useSearchQuery(query, clientId || undefined)
  const retrieval = useRetrievalMutation()

  async function askRecords() {
    if (!ask.trim()) return
    await retrieval.mutateAsync({ query: ask, client_id: clientId || undefined })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
          Search
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          Search all records
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <GlassCard title="Unified Search" badge={`${results.length}`}>
            <div className="grid grid-cols-[1fr_220px] gap-3 mb-4">
              <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search clients, engagements, documents, bookings, time, audit..."
                  className="h-7 border-0 px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="h-[42px] rounded-lg border border-border/40 bg-background px-3 text-sm"
              >
                <option value="">All clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {isPending ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                Searching records...
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((result) => (
                  <SearchRow key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="col-span-4 space-y-4">
          <GlassCard title="Ask Records" badge="Cited">
            <div className="space-y-3">
              <Textarea value={ask} onChange={(e) => setAsk(e.target.value)} className="min-h-24 text-sm" />
              <button
                type="button"
                onClick={askRecords}
                disabled={retrieval.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {retrieval.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Ask records
              </button>
              {retrieval.data && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="whitespace-pre-line text-sm text-foreground leading-relaxed">{retrieval.data.answer}</p>
                  <div className="mt-3 space-y-2">
                    {retrieval.data.citations.map((citation) => (
                      <div key={`${citation.title}-${citation.score}`} className="rounded-md bg-card/50 border border-border/30 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground">{citation.title}</p>
                          <span className="text-[10px] text-muted-foreground">{Math.round(citation.score * 100)}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{citation.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard title="Result Types" badge="Search">
            <div className="space-y-3">
              {(["client", "engagement", "document", "queue", "booking", "time", "audit"] as RecordType[]).map((type) => {
                const count = results.filter((r) => r.type === type).length
                return (
                  <div key={type} className="flex items-center justify-between rounded-lg border border-border/30 bg-card/30 px-3 py-2">
                    <span className="text-sm text-foreground capitalize">{type}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{count}</span>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

function SearchRow({ result }: { result: SearchResult }) {
  return (
    <div className="rounded-lg border border-border/30 bg-card/30 p-3 hover:border-primary/30">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <DatabaseZap className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{result.subtitle}</p>
            </div>
            <span className={cn("rounded-full border px-2 py-1 text-[10px] font-semibold uppercase", typeTone[result.type])}>
              {result.type}
            </span>
          </div>
          <p className="text-sm text-secondary-foreground mt-2 line-clamp-2">{result.snippet}</p>
        </div>
      </div>
    </div>
  )
}
