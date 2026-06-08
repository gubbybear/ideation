"use client"

import {
  AlertCircle,
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  FileText,
  Inbox,
  Loader2,
  Search,
  Send,
  ShieldCheck,
  Timer,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import {
  useBookingsQuery,
  useDashboardQuery,
  useDocumentsQuery,
  useQueueQuery,
  useTimeEntriesQuery,
  useTimesheetsQuery,
  type BookingRecord,
  type DocumentRecord,
  type QueueListItem,
} from "@/lib/api"
import { formatDateTime, formatTimeShort } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { PersonaRole } from "@/lib/persona"

interface DashboardViewProps {
  persona: PersonaRole
  onOpenReview?: () => void
  onNavigate?: (view: string) => void
}

const partnerPriorityStatuses = new Set(["partner", "hold", "review"])
const adminPriorityStatuses = new Set(["hold", "draft", "review"])

export function DashboardView({ persona, onOpenReview, onNavigate }: DashboardViewProps) {
  const { data: dashboard, isPending: dashboardPending, error: dashboardError } = useDashboardQuery()
  const { data: queue = [], isPending: queuePending, error: queueError } = useQueueQuery()
  const { data: bookings = [] } = useBookingsQuery()
  const { data: documents = [] } = useDocumentsQuery()
  const { data: timeEntries = [] } = useTimeEntriesQuery()
  const { data: timesheets = [] } = useTimesheetsQuery()

  const evalPass = dashboard?.eval_pass_rate ?? 0
  const evalPct = evalPass > 1 ? evalPass : evalPass * 100
  const isPartner = persona === "partner"
  const priorityStatuses = isPartner ? partnerPriorityStatuses : adminPriorityStatuses
  const priorityItems = queue.filter((item) => priorityStatuses.has(item.status)).slice(0, 4)
  const docsNeedingAttention = documents.filter((doc) => doc.status !== "indexed")
  const draftTime = timeEntries.filter((entry) => entry.status === "draft")
  const timesheetsToApprove = timesheets.filter((sheet) => sheet.status === "submitted")
  const nextBooking = [...bookings].sort((a, b) => a.start.localeCompare(b.start))[0]
  const error = dashboardError ?? queueError

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold text-foreground text-balance">
            {isPartner ? "Partner view" : "Admin view"}
          </h1>
        </div>
        <button
          type="button"
          onClick={isPartner ? onOpenReview : () => onNavigate?.("queue")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {isPartner ? "Review next item" : "Open queue"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Couldn&apos;t load dashboard</p>
            <p className="text-xs text-destructive/70 font-mono">{error.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <AssistantPanel persona={persona} onNavigate={onNavigate} onOpenReview={onOpenReview} />
        </div>

        <div className="col-span-4 space-y-4">
          <GlassCard title={isPartner ? "Reviews" : "Customer Service"} badge={`${priorityItems.length}`} badgeVariant="warning">
            {queuePending ? (
              <Loading label="Loading priority items..." />
            ) : priorityItems.length === 0 ? (
              <EmptyState label="No urgent client work waiting." />
            ) : (
              <div className="space-y-2">
                {priorityItems.map((item) => (
                  <PriorityRow key={item.id} item={item} onOpenReview={onOpenReview} />
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard title="Today" badge="Status">
            <div className="space-y-3">
              <TodaySignal
                icon={CheckCircle2}
                label="Eval pass"
                value={dashboardPending ? "..." : `${evalPct.toFixed(1)}%`}
                tone="success"
              />
              <TodaySignal
                icon={CalendarDays}
                label={isPartner ? "My next booking" : "Next booking"}
                value={nextBooking ? formatTimeShort(nextBooking.start) : "None"}
                detail={nextBooking?.title}
              />
              <TodaySignal
                icon={ShieldCheck}
                label="PII coverage"
                value={dashboard?.metrics.find((m) => m.label.includes("PII"))?.value ?? "100%"}
                tone="success"
              />
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <FocusTile
          icon={Inbox}
          label={isPartner ? "Escalations" : "Queue"}
          value={`${priorityItems.length}`}
          action={isPartner ? "Open review" : "Open queue"}
          onClick={isPartner ? onOpenReview : () => onNavigate?.("queue")}
          tone="warning"
        />
        <FocusTile
          icon={CalendarDays}
          label={isPartner ? "Schedule" : "Calendars"}
          value={`${bookings.length}`}
          action="Open calendar"
          onClick={() => onNavigate?.("calendar")}
        />
        <FocusTile
          icon={FileText}
          label="Documents"
          value={`${docsNeedingAttention.length}`}
          action="Open documents"
          onClick={() => onNavigate?.("documents")}
          tone={docsNeedingAttention.length > 0 ? "warning" : "success"}
        />
        <FocusTile
          icon={Timer}
          label={isPartner ? "Billing" : "Timesheets"}
          value={`${draftTime.length + timesheetsToApprove.length}`}
          action={isPartner ? "Open time reporting" : "Open timesheets"}
          onClick={() => onNavigate?.(isPartner ? "time" : "timesheets")}
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <GlassCard title={isPartner ? "My Bookings" : "Calendars"} badge={`${bookings.length}`}>
            <CompactBookingList bookings={bookings.slice(0, 3)} />
          </GlassCard>
        </div>

        <div className="col-span-6">
          <GlassCard title={isPartner ? "Drafts And Documents" : "Documents To Check"} badge={`${docsNeedingAttention.length}`}>
            <CompactDocumentList documents={docsNeedingAttention.slice(0, 3)} />
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

function AssistantPanel({
  persona,
  onNavigate,
  onOpenReview,
}: {
  persona: PersonaRole
  onNavigate?: (view: string) => void
  onOpenReview?: () => void
}) {
  const isPartner = persona === "partner"
  const prompts = isPartner
    ? [
        { label: "Show escalated work", action: onOpenReview },
        { label: "Review drafted documents", action: onOpenReview },
        { label: "What is on my calendar?", action: () => onNavigate?.("calendar") },
        { label: "Open time reporting", action: () => onNavigate?.("time") },
        { label: "Find client context", action: () => onNavigate?.("records") },
        { label: "Open documents needing review", action: () => onNavigate?.("documents") },
      ]
    : [
        { label: "Show customer service items", action: () => onNavigate?.("queue") },
        { label: "Check all calendars", action: () => onNavigate?.("calendar") },
        { label: "Find client records", action: () => onNavigate?.("records") },
        { label: "Show documents needing review", action: () => onNavigate?.("documents") },
        { label: "Check submitted timesheets", action: () => onNavigate?.("timesheets") },
        { label: "Open client portal uploads", action: () => onNavigate?.("portal") },
      ]
  const chips = isPartner
    ? ["Reviews", "Clients", "Files", "Calendar", "Billing"]
    : ["Customers", "Files", "Calendars", "Timesheets", "Audit"]

  return (
    <div className="rounded-xl border border-primary/30 bg-primary text-primary-foreground shadow-xl shadow-primary/15 overflow-hidden min-h-[560px] flex flex-col">
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Assistant</h2>
            <p className="text-xs text-white/75">
              {isPartner ? "Reviews, schedule, clients, and billing" : "Customers, calendars, files, and team time"}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium text-white">
          Ready
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="rounded-xl border border-white/30 bg-white text-foreground shadow-lg">
          <div className="p-4">
            <Textarea
              aria-label="Ask the assistant"
              placeholder={
                isPartner
                  ? "Ask about a review, draft, client, booking, or billable time..."
                  : "Ask about a customer, calendar, file, timesheet, or queue item..."
              }
              className="min-h-28 resize-none border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border/40 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <ServiceChip key={chip} label={chip} />
              ))}
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Send
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <PromptButton key={prompt.label} label={prompt.label} onClick={prompt.action} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pb-5">
        <div className="h-full min-h-48 rounded-xl border border-white/20 bg-white/10 p-4">
          <p className="text-sm text-white/85 leading-relaxed">
            Messages will appear here once the assistant is connected.
          </p>
          <p className="text-xs text-white/65 mt-2 leading-relaxed">
            {isPartner
              ? "The assistant will help review escalations, draft documents, client context, schedule, and billing."
              : "The assistant will help coordinate customer service, calendars, documents, timesheets, and audit history."}
          </p>
        </div>
      </div>
    </div>
  )
}

function PromptButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/25 transition-colors"
    >
      {label}
    </button>
  )
}

function ServiceChip({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {label}
    </span>
  )
}

function PriorityRow({ item, onOpenReview }: { item: QueueListItem; onOpenReview?: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpenReview}
      className="w-full rounded-lg border border-border/30 bg-card/30 p-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5", item.status === "hold" ? "bg-destructive" : "bg-warning")} />
            <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {item.type} - {item.source} - {formatTimeShort(item.time)}
          </p>
        </div>
        <StatusPill status={item.status} />
      </div>
    </button>
  )
}

function StatusPill({ status }: { status: QueueListItem["status"] }) {
  return (
    <span
      className={cn(
        "text-[10px] font-semibold px-2 py-1 rounded-full uppercase shrink-0",
        status === "partner" && "bg-warning/15 text-warning",
        status === "hold" && "bg-destructive/15 text-destructive",
        status === "review" && "bg-primary/15 text-primary",
        status === "file" && "bg-success/15 text-success",
        status === "draft" && "bg-primary/15 text-primary",
        status === "logged" && "bg-success/15 text-success",
      )}
    >
      {status.replace("_", " ")}
    </span>
  )
}

function TodaySignal({
  icon: Icon,
  label,
  value,
  detail,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  detail?: string
  tone?: "default" | "success"
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-card/30 p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            tone === "success" ? "bg-success/10" : "bg-primary/10",
          )}
        >
          <Icon className={cn("w-4 h-4", tone === "success" ? "text-success" : "text-primary")} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          {detail && <p className="text-xs text-muted-foreground truncate">{detail}</p>}
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground shrink-0">{value}</p>
    </div>
  )
}

function FocusTile({
  icon: Icon,
  label,
  value,
  action,
  onClick,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  action: string
  onClick?: () => void
  tone?: "default" | "success" | "warning"
}) {
  return (
    <div className="glass rounded-xl border-glow p-4">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            tone === "warning" && "bg-warning/15",
            tone === "success" && "bg-success/15",
            tone === "default" && "bg-primary/10",
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5",
              tone === "warning" && "text-warning",
              tone === "success" && "text-success",
              tone === "default" && "text-primary",
            )}
          />
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      </div>
      <p className="text-sm font-medium text-foreground mt-3">{label}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80"
      >
        {action}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function CompactBookingList({ bookings }: { bookings: BookingRecord[] }) {
  if (bookings.length === 0) return <EmptyState label="No bookings scheduled." />
  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <CompactRow
          key={booking.id}
          icon={CalendarDays}
          title={booking.title}
          meta={`${formatDateTime(booking.start)} - ${booking.staff}`}
          badge={booking.provider}
        />
      ))}
    </div>
  )
}

function CompactDocumentList({ documents }: { documents: DocumentRecord[] }) {
  if (documents.length === 0) return <EmptyState label="All indexed documents look settled." />
  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <CompactRow
          key={doc.id}
          icon={FileText}
          title={doc.name}
          meta={doc.snippet}
          badge={doc.status.replace("_", " ")}
        />
      ))}
    </div>
  )
}

function CompactRow({
  icon: Icon,
  title,
  meta,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  meta: string
  badge: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/30 bg-card/30 p-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{title}</p>
          <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground shrink-0 capitalize">
            {badge}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{meta}</p>
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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-border/30 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}
