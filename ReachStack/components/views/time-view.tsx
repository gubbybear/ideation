"use client"

import { useMemo, useState } from "react"
import { Clock3, Loader2, Plus, ReceiptText, TimerReset } from "lucide-react"
import { toast } from "sonner"
import { GlassCard } from "@/components/ui/glass-card"
import {
  useClientsQuery,
  useEngagementsQuery,
  useTimeEntriesQuery,
  useTimeEntryCreateMutation,
  type TimeEntryCreate,
  type TimeEntryRecord,
  type TimeStatus,
} from "@/lib/api"
import { cn } from "@/lib/utils"

const statusTone: Record<TimeStatus, string> = {
  draft: "bg-muted/50 text-muted-foreground border-border/40",
  submitted: "bg-primary/15 text-primary border-primary/20",
  approved: "bg-success/15 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

export function TimeView() {
  const { data: entries = [], isPending } = useTimeEntriesQuery()
  const { data: clients = [] } = useClientsQuery()
  const { data: engagements = [] } = useEngagementsQuery()
  const createTime = useTimeEntryCreateMutation()

  const [clientId, setClientId] = useState("client-northstar")
  const clientEngagements = engagements.filter((e) => e.client_id === clientId)
  const [hours, setHours] = useState("1.0")
  const [activity, setActivity] = useState("Client advisory session")
  const [billable, setBillable] = useState(true)
  const engagementId = clientEngagements[0]?.id ?? engagements[0]?.id ?? ""

  const billableHours = useMemo(
    () => entries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entry.hours, 0),
    [entries],
  )
  const billableValue = useMemo(
    () => entries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entry.hours * entry.rate, 0),
    [entries],
  )

  async function addEntry(preset?: Partial<TimeEntryCreate>) {
    const payload: TimeEntryCreate = {
      date: "2026-06-08",
      staff: preset?.staff ?? "M. Turner",
      client_id: preset?.client_id ?? clientId,
      engagement_id: preset?.engagement_id ?? engagementId,
      activity: preset?.activity ?? activity,
      hours: preset?.hours ?? Number(hours),
      billable: preset?.billable ?? billable,
      rate: preset?.rate ?? (billable ? 260 : 0),
      notes: preset?.notes ?? "Recorded from the ReachStack time screen.",
    }

    try {
      await createTime.mutateAsync(payload)
      toast.success("Time entry recorded")
    } catch (err) {
      toast.error(`Time entry failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? id
  const engagementName = (id: string) => engagements.find((e) => e.id === id)?.name ?? id

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Time Reporting
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <SummaryCard icon={Clock3} label="Recorded today" value={`${entries.reduce((sum, e) => sum + e.hours, 0).toFixed(1)}h`} />
        <SummaryCard icon={ReceiptText} label="Billable hours" value={`${billableHours.toFixed(1)}h`} />
        <SummaryCard icon={ReceiptText} label="Billable value" value={billableValue.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 })} />
        <SummaryCard icon={TimerReset} label="Draft entries" value={String(entries.filter((e) => e.status === "draft").length)} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4 space-y-4">
          <GlassCard title="Manual Entry" badge="Draft">
            <div className="space-y-3">
              <Field label="Client">
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full h-9 rounded-md border border-border/50 bg-background px-3 text-sm">
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Activity">
                <input value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full h-9 rounded-md border border-border/50 bg-background px-3 text-sm" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Hours">
                  <input value={hours} onChange={(e) => setHours(e.target.value)} className="w-full h-9 rounded-md border border-border/50 bg-background px-3 text-sm" />
                </Field>
                <Field label="Billing">
                  <button
                    type="button"
                    onClick={() => setBillable((v) => !v)}
                    className={cn(
                      "w-full h-9 rounded-md border px-3 text-sm font-medium",
                      billable ? "border-success/30 bg-success/10 text-success" : "border-border/50 bg-muted/20 text-muted-foreground",
                    )}
                  >
                    {billable ? "Billable" : "Non-billable"}
                  </button>
                </Field>
              </div>
              <button
                type="button"
                onClick={() => addEntry()}
                disabled={createTime.isPending || !engagementId}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {createTime.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Record time
              </button>
            </div>
          </GlassCard>

          <GlassCard title="Bookings" badge="Suggested">
            <div className="space-y-3">
              <SuggestedTime
                title="Payroll variance review"
                meta="Northstar Dental Group - 45 minutes"
                onClick={() =>
                  addEntry({
                    client_id: "client-northstar",
                    engagement_id: "eng-northstar-monthly",
                    activity: "Payroll variance review call",
                    hours: 0.75,
                    staff: "M. Turner",
                    notes: "Converted from calendar booking.",
                  })
                }
              />
              <SuggestedTime
                title="Missing documents follow-up"
                meta="Coastal Holdings - 30 minutes"
                onClick={() =>
                  addEntry({
                    client_id: "client-coastal",
                    engagement_id: "eng-coastal-settlement",
                    activity: "Missing documents follow-up",
                    hours: 0.5,
                    staff: "A. Chen",
                    rate: 210,
                    notes: "Converted from client follow-up booking.",
                  })
                }
              />
            </div>
          </GlassCard>
        </div>

        <div className="col-span-8">
          <GlassCard title="Time Entries" badge={`${entries.length}`}>
            {isPending ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                Loading time entries...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Activity</th>
                      <th className="text-left py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Client</th>
                      <th className="text-right py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Hours</th>
                      <th className="text-right py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Value</th>
                      <th className="text-right py-3 px-3 text-[10px] font-semibold text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <TimeRow
                        key={entry.id}
                        entry={entry}
                        client={clientName(entry.client_id)}
                        engagement={engagementName(entry.engagement_id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function SuggestedTime({ title, meta, onClick }: { title: string; meta: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-border/40 bg-card/30 p-3 text-left hover:border-primary/40 hover:bg-primary/5"
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{meta}</p>
    </button>
  )
}

function TimeRow({
  entry,
  client,
  engagement,
}: {
  entry: TimeEntryRecord
  client: string
  engagement: string
}) {
  const value = entry.billable ? entry.hours * entry.rate : 0
  return (
    <tr className="border-b border-border/20 hover:bg-muted/10">
      <td className="py-3 px-3">
        <p className="text-sm font-medium text-foreground">{entry.activity}</p>
        <p className="text-xs text-muted-foreground mt-1">{engagement}</p>
      </td>
      <td className="py-3 px-3">
        <p className="text-sm text-foreground">{client}</p>
        <p className="text-xs text-muted-foreground">{entry.staff} - {entry.source}</p>
      </td>
      <td className="py-3 px-3 text-right text-sm font-mono text-foreground">{entry.hours.toFixed(1)}</td>
      <td className="py-3 px-3 text-right text-sm font-mono text-foreground">
        {value.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 })}
      </td>
      <td className="py-3 px-3 text-right">
        <span className={cn("rounded-full border px-2 py-1 text-[10px] font-semibold uppercase", statusTone[entry.status])}>
          {entry.status}
        </span>
      </td>
    </tr>
  )
}
