"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, CalendarClock, FileText, Loader2, Search, Timer, UserRound } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import {
  useClientWorkspaceQuery,
  useClientsQuery,
  useRetrievalMutation,
  type ClientRecord,
  type SearchResult,
} from "@/lib/api"
import { formatDate, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

const starterQuestions = [
  "What is the latest open item for this client?",
  "Which documents need review?",
  "Summarise bookings, documents, and billable time.",
]

export function ClientsView() {
  const { data: clients = [], isPending: clientsPending } = useClientsQuery()
  const [selectedClientId, setSelectedClientId] = useState("client-northstar")
  const { data: workspace, isPending } = useClientWorkspaceQuery(selectedClientId)
  const retrieval = useRetrievalMutation()
  const [question, setQuestion] = useState(starterQuestions[0])

  useEffect(() => {
    if (!clients.some((c) => c.id === selectedClientId) && clients[0]) {
      setSelectedClientId(clients[0].id)
    }
  }, [clients, selectedClientId])

  const billableTotal = useMemo(
    () => workspace?.time_entries.filter((t) => t.billable).reduce((sum, t) => sum + t.hours, 0) ?? 0,
    [workspace],
  )

  async function askRecords(prompt = question) {
    if (!prompt.trim()) return
    setQuestion(prompt)
    await retrieval.mutateAsync({ query: prompt, client_id: selectedClientId })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
          Clients
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          Client work, files, bookings, and time in one place
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <GlassCard title="Clients" badge={`${clients.length}`}>
            {clientsPending ? (
              <Loading label="Loading clients..." />
            ) : (
              <div className="space-y-2">
                {clients.map((client) => (
                  <ClientButton
                    key={client.id}
                    client={client}
                    active={client.id === selectedClientId}
                    onClick={() => setSelectedClientId(client.id)}
                  />
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="col-span-6 space-y-4">
          <GlassCard title="Client" badge={workspace?.client.status ?? "Loading"}>
            {isPending || !workspace ? (
              <Loading label="Loading workspace..." />
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{workspace.client.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{workspace.client.summary}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Owner</p>
                    <p className="text-sm font-semibold text-foreground">{workspace.client.owner}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <Stat icon={UserRound} label="Contact" value={workspace.client.primary_contact} />
                  <Stat icon={Building2} label="Engagements" value={String(workspace.engagements.length)} />
                  <Stat icon={FileText} label="Documents" value={String(workspace.documents.length)} />
                  <Stat icon={Timer} label="Billable" value={`${billableTotal.toFixed(1)}h`} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MiniList
                    title="Active Engagements"
                    items={workspace.engagements.map((e) => ({
                      id: e.id,
                      title: e.name,
                      meta: `${e.service_line} - due ${formatDate(e.due_date)}`,
                      status: e.stage,
                    }))}
                  />
                  <MiniList
                    title="Upcoming Bookings"
                    items={workspace.bookings.map((b) => ({
                      id: b.id,
                      title: b.title,
                      meta: `${formatDateTime(b.start)} - ${b.staff}`,
                      status: b.provider,
                    }))}
                  />
                  <MiniList
                    title="Documents"
                    items={workspace.documents.map((d) => ({
                      id: d.id,
                      title: d.name,
                      meta: d.snippet,
                      status: d.status,
                    }))}
                  />
                  <MiniList
                    title="Time Entries"
                    items={workspace.time_entries.map((t) => ({
                      id: t.id,
                      title: t.activity,
                      meta: `${t.staff} - ${t.hours.toFixed(1)}h ${t.billable ? "billable" : "non-billable"}`,
                      status: t.status,
                    }))}
                  />
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard title="Record Timeline" badge="Searchable">
            <div className="space-y-2">
              {(workspace?.records ?? []).slice(0, 7).map((record) => (
                <RecordRow key={`${record.type}-${record.id}`} record={record} />
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="col-span-3">
          <GlassCard title="Ask Records" badge="Cited">
            <div className="space-y-3">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-24 text-sm"
              />
              <button
                type="button"
                onClick={() => askRecords()}
                disabled={retrieval.isPending || !selectedClientId}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {retrieval.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Ask records
              </button>

              <div className="space-y-2">
                {starterQuestions.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => askRecords(prompt)}
                    className="w-full rounded-lg border border-border/40 bg-card/30 px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground hover:border-primary/30"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {retrieval.data && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-sm text-foreground leading-relaxed">{retrieval.data.answer}</p>
                  <div className="mt-3 space-y-2">
                    {retrieval.data.citations.map((citation) => (
                      <div key={`${citation.title}-${citation.score}`} className="rounded-md bg-card/50 border border-border/30 p-2">
                        <p className="text-xs font-semibold text-foreground">{citation.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{citation.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

function ClientButton({
  client,
  active,
  onClick,
}: {
  client: ClientRecord
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        active ? "border-primary/40 bg-primary/10" : "border-border/30 bg-card/30 hover:bg-muted/20",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{client.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{client.segment}</p>
        </div>
        <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
          {client.status}
        </span>
      </div>
    </button>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border/30 bg-card/30 p-3">
      <Icon className="w-4 h-4 text-primary mb-2" />
      <p className="text-[10px] font-semibold text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1 truncate">{value}</p>
    </div>
  )
}

function MiniList({
  title,
  items,
}: {
  title: string
  items: { id: string; title: string; meta: string; status: string }[]
}) {
  return (
    <div className="rounded-lg border border-border/30 bg-muted/10 p-3">
      <p className="text-xs font-semibold text-foreground mb-2">{title}</p>
      <div className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="rounded-md bg-card/40 border border-border/20 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-foreground line-clamp-1">{item.title}</p>
              <span className="shrink-0 text-[10px] text-primary">{item.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.meta}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecordRow({ record }: { record: SearchResult }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/30 bg-card/30 p-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Search className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{record.title}</p>
          <span className="text-[10px] uppercase text-muted-foreground">{record.type}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{record.snippet}</p>
      </div>
    </div>
  )
}

function Loading({ label }: { label: string }) {
  return (
    <div className="py-10 text-center text-sm text-muted-foreground">
      <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
      {label}
    </div>
  )
}
