"use client"

import { BriefcaseBusiness, CalendarDays, FileText, Loader2, Timer } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { useClientsQuery, useEngagementsQuery } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const stageTone: Record<string, string> = {
  "In progress": "bg-primary/15 text-primary border-primary/20",
  "Partner review": "bg-warning/15 text-warning border-warning/20",
  "Waiting on client": "bg-destructive/10 text-destructive border-destructive/20",
  Onboarding: "bg-success/15 text-success border-success/20",
}

export function EngagementsView() {
  const { data: engagements = [], isPending } = useEngagementsQuery()
  const { data: clients = [] } = useClientsQuery()
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? id
  const billable = engagements.reduce((sum, e) => sum + e.billable_hours, 0)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
          Engagement Management
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          Active professional-services work across every client
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <SummaryCard icon={BriefcaseBusiness} label="Active engagements" value={String(engagements.length)} />
        <SummaryCard icon={Timer} label="Billable hours" value={`${billable.toFixed(1)}h`} />
        <SummaryCard icon={FileText} label="Linked documents" value={String(engagements.reduce((sum, e) => sum + e.document_count, 0))} />
        <SummaryCard icon={CalendarDays} label="Booked sessions" value={String(engagements.reduce((sum, e) => sum + e.booking_count, 0))} />
      </div>

      <GlassCard title="Engagements" badge="Client linked">
        {isPending ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
            Loading engagements...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {engagements.map((engagement) => (
              <div key={engagement.id} className="rounded-xl border border-border/30 bg-card/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{engagement.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{clientName(engagement.client_id)}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                      stageTone[engagement.stage] ?? "bg-muted/40 text-muted-foreground border-border/40",
                    )}
                  >
                    {engagement.stage}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <MiniMetric label="Service" value={engagement.service_line} />
                  <MiniMetric label="Due" value={formatDate(engagement.due_date)} />
                  <MiniMetric label="Owner" value={engagement.owner} />
                </div>

                <div className="mt-4 rounded-lg border border-border/30 bg-muted/10 p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Next step</p>
                  <p className="text-sm text-foreground leading-relaxed">{engagement.next_step}</p>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{engagement.billable_hours.toFixed(1)}h billable</span>
                  <span>{engagement.document_count} docs</span>
                  <span>{engagement.booking_count} bookings</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="glass rounded-xl border-glow p-5">
      <Icon className="w-5 h-5 text-primary mb-3" />
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/20 border border-border/20 px-3 py-2 min-w-0">
      <p className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="text-xs font-medium text-foreground mt-1 truncate">{value}</p>
    </div>
  )
}
