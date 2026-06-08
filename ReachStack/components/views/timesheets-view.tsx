"use client"

import { CheckCircle2, Clock, Loader2, UserCheck, UsersRound } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { useTimesheetsQuery, type TimeStatus, type TimesheetRecord } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const statusTone: Record<TimeStatus, string> = {
  draft: "bg-muted/50 text-muted-foreground border-border/40",
  submitted: "bg-primary/15 text-primary border-primary/20",
  approved: "bg-success/15 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

export function TimesheetsView() {
  const { data: timesheets = [], isPending } = useTimesheetsQuery()
  const submitted = timesheets.reduce((sum, sheet) => sum + sheet.submitted_hours, 0)
  const billable = timesheets.reduce((sum, sheet) => sum + sheet.billable_hours, 0)
  const leave = timesheets.reduce((sum, sheet) => sum + sheet.leave_hours, 0)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
          Staff & Timesheets
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          Basic HR capture when no in-house HR system exists
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <SummaryCard icon={UsersRound} label="Staff tracked" value={String(timesheets.length)} />
        <SummaryCard icon={Clock} label="Submitted hours" value={`${submitted.toFixed(1)}h`} />
        <SummaryCard icon={UserCheck} label="Billable hours" value={`${billable.toFixed(1)}h`} />
        <SummaryCard icon={CheckCircle2} label="Leave/unavailable" value={`${leave.toFixed(1)}h`} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <GlassCard title="Weekly Timesheets" badge="Week of 08/06/2026">
            {isPending ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                Loading timesheets...
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {timesheets.map((sheet) => (
                  <TimesheetCard key={sheet.staff} sheet={sheet} />
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="col-span-4 space-y-4">
          <GlassCard title="Approval Queue" badge="Ops">
            <div className="space-y-3">
              {timesheets.map((sheet) => (
                <div key={sheet.staff} className="rounded-lg border border-border/30 bg-card/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{sheet.staff}</p>
                      <p className="text-xs text-muted-foreground mt-1">{sheet.role}</p>
                    </div>
                    <span className={cn("rounded-full border px-2 py-1 text-[10px] font-semibold uppercase", statusTone[sheet.status])}>
                      {sheet.status}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40" disabled={sheet.status !== "submitted"}>
                      Approve
                    </button>
                    <button className="flex-1 rounded-md border border-border/40 px-3 py-2 text-xs font-medium text-muted-foreground disabled:opacity-40" disabled={sheet.status !== "submitted"}>
                      Query
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Availability Impact" badge="Bookings">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Leave and unavailable time blocks should feed the booking engine before any client sees open slots.
              </p>
              <div className="rounded-lg border border-warning/20 bg-warning/10 p-3">
                <p className="text-xs font-semibold text-warning">A. Chen unavailable</p>
                <p className="text-xs text-muted-foreground mt-1">4.0h leave this week, removed from booking availability.</p>
              </div>
            </div>
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

function TimesheetCard({ sheet }: { sheet: TimesheetRecord }) {
  const pct = Math.min(100, Math.round((sheet.submitted_hours / sheet.target_hours) * 100))
  const billablePct = sheet.submitted_hours > 0 ? Math.round((sheet.billable_hours / sheet.submitted_hours) * 100) : 0

  return (
    <div className="rounded-xl border border-border/30 bg-card/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{sheet.staff}</p>
          <p className="text-xs text-muted-foreground mt-1">{sheet.role}</p>
        </div>
        <span className={cn("rounded-full border px-2 py-1 text-[10px] font-semibold uppercase", statusTone[sheet.status])}>
          {sheet.status}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <Progress label="Submitted" value={`${sheet.submitted_hours.toFixed(1)} / ${sheet.target_hours.toFixed(0)}h`} pct={pct} />
        <Progress label="Billable mix" value={`${billablePct}%`} pct={billablePct} />
      </div>

      <div className="mt-4 rounded-lg border border-border/30 bg-muted/10 p-3">
        <p className="text-[10px] font-semibold uppercase text-muted-foreground">Week start</p>
        <p className="text-sm font-medium text-foreground mt-1">{formatDate(sheet.week_start)}</p>
      </div>
    </div>
  )
}

function Progress({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
