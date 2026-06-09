"use client"

import { useState } from "react"
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
  useAgentActionExecuteMutation,
  useDashboardQuery,
  useDocumentsQuery,
  useQueueQuery,
  useRetrievalMutation,
  useTimeEntriesQuery,
  useTimesheetsQuery,
  type BookingRecord,
  type DocumentRecord,
  type AgentAction,
  type RetrievalAnswerItem,
  type QueueListItem,
  type RetrievalCitation,
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
          <AssistantPanel persona={persona} onNavigate={onNavigate} />
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

type AssistantMessage = {
  role: "user" | "assistant"
  text: string
  overview?: string
  items?: RetrievalAnswerItem[]
  risks?: string[]
  citations?: RetrievalCitation[]
  mode?: "openai" | "fallback" | "computed"
  model?: string | null
  actions?: AgentAction[]
}

type AssistantActionState = {
  status: "running" | "completed" | "blocked" | "failed"
  message: string
}

function AssistantPanel({
  persona,
  onNavigate,
}: {
  persona: PersonaRole
  onNavigate?: (view: string) => void
}) {
  const isPartner = persona === "partner"
  const prompts = isPartner
    ? [
        "Show escalated work",
        "Review drafted documents",
        "What is on my calendar?",
        "Summarise my billable time",
        "Find client context",
        "Show documents needing review",
        "Revise and approve missing annexures request",
      ]
    : [
        "Show customer service items",
        "Check all calendars",
        "Find client records",
        "Show documents needing review",
        "Check submitted timesheets",
        "Show client portal uploads",
      ]
  const chips = isPartner
    ? ["Reviews", "Clients", "Files", "Calendar", "Billing"]
    : ["Customers", "Files", "Calendars", "Timesheets", "Audit"]
  const retrieval = useRetrievalMutation()
  const agentActionExecution = useAgentActionExecuteMutation()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [actionStates, setActionStates] = useState<Record<string, AssistantActionState>>({})

  async function sendAssistant(prompt = input) {
    const text = prompt.trim()
    if (!text || retrieval.isPending) return

    setInput("")
    setActionStates({})
    setMessages([{ role: "user", text }])

    try {
      const response = await retrieval.mutateAsync({ query: text })
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: response.answer,
          overview: response.overview,
          items: response.items,
          risks: response.risks,
          citations: response.citations,
          mode: response.mode,
          model: response.model,
          actions: response.actions,
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: error instanceof Error ? error.message : "The assistant could not answer just now.",
          mode: "fallback",
        },
      ])
    }
  }

  async function runAgentAction(action: AgentAction) {
    setActionStates((current) => ({
      ...current,
      [action.id]: { status: "running", message: "Applying change..." },
    }))

    try {
      const result = await agentActionExecution.mutateAsync(action)
      setActionStates((current) => ({
        ...current,
        [action.id]: {
          status: result.status,
          message: result.message,
        },
      }))
    } catch (error) {
      setActionStates((current) => ({
        ...current,
        [action.id]: {
          status: "failed",
          message: error instanceof Error ? error.message : "The action could not be completed.",
        },
      }))
    }
  }

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
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                isPartner
                  ? "Ask about a review, draft, client, booking, or billable time..."
                  : "Ask about a customer, calendar, file, timesheet, or queue item..."
              }
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault()
                  void sendAssistant()
                }
              }}
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
              onClick={() => void sendAssistant()}
              disabled={!input.trim() || retrieval.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {retrieval.isPending ? "Thinking" : "Send"}
              {retrieval.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <PromptButton key={prompt} label={prompt} onClick={() => void sendAssistant(prompt)} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pb-5">
        <div className="h-full min-h-48 rounded-xl border border-white/20 bg-white/10 p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <>
              <p className="text-sm text-white/85 leading-relaxed">
                Ask a question or use a prompt to query the demo records.
              </p>
              <p className="text-xs text-white/65 mt-2 leading-relaxed">
                {isPartner
                  ? "The assistant can review escalations, draft documents, client context, schedule, and billing."
                  : "The assistant can coordinate customer service, calendars, documents, timesheets, and audit history."}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <AssistantMessageBubble
                  key={`${message.role}-${index}`}
                  message={message}
                  onOpenCitation={(citation) => openCitation(citation, onNavigate)}
                  onExecuteAction={(action) => void runAgentAction(action)}
                  actionStates={actionStates}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function openCitation(
  citation: RetrievalCitation,
  onNavigate?: (view: string) => void,
) {
  if (citation.source_type === "queue") {
    onNavigate?.("queue")
    return
  }

  const targetByType: Partial<Record<RetrievalCitation["source_type"], string>> = {
    client: "clients",
    engagement: "engagements",
    document: "documents",
    booking: "calendar",
    time: "time",
    audit: "audit",
    note: "records",
  }
  onNavigate?.(targetByType[citation.source_type] ?? "records")
}

function AssistantMessageBubble({
  message,
  onOpenCitation,
  onExecuteAction,
  actionStates,
}: {
  message: AssistantMessage
  onOpenCitation?: (citation: RetrievalCitation) => void
  onExecuteAction?: (action: AgentAction) => void
  actionStates?: Record<string, AssistantActionState>
}) {
  const isUser = message.role === "user"
  const hasStructuredContent = Boolean(message.overview || message.items?.length || message.risks?.length)
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[86%] rounded-xl px-3 py-2 text-sm leading-relaxed",
          isUser ? "bg-white text-foreground" : "bg-white/15 text-white border border-white/15",
        )}
      >
        {isUser || !hasStructuredContent ? (
          <p className="whitespace-pre-line">{message.text}</p>
        ) : (
          <StructuredAssistantContent message={message} />
        )}
        {!isUser && message.actions && message.actions.length > 0 && (
          <AgentActionList
            actions={message.actions}
            states={actionStates ?? {}}
            onExecuteAction={onExecuteAction}
          />
        )}
        {!isUser && message.mode && (
          <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-white/60">
            {answerModeLabel(message.mode, message.model)}
          </p>
        )}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Sources</p>
            <div className="space-y-1.5">
              {message.citations.slice(0, 4).map((citation) => (
                <button
                  key={`${citation.source_type}-${citation.id}-${citation.title}`}
                  type="button"
                  onClick={() => onOpenCitation?.(citation)}
                  className="block w-full rounded-lg bg-white/10 px-2 py-1.5 text-left hover:bg-white/20"
                >
                  <span className="block text-xs font-semibold text-white">{citation.title}</span>
                  <span className="block text-[11px] text-white/65 line-clamp-2">{citation.snippet}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AgentActionList({
  actions,
  states,
  onExecuteAction,
}: {
  actions: AgentAction[]
  states: Record<string, AssistantActionState>
  onExecuteAction?: (action: AgentAction) => void
}) {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Suggested actions</p>
      {actions.map((action) => (
        <AgentActionCard
          key={action.id}
          action={action}
          state={states[action.id]}
          onExecuteAction={onExecuteAction}
        />
      ))}
    </div>
  )
}

function AgentActionCard({
  action,
  state,
  onExecuteAction,
}: {
  action: AgentAction
  state?: AssistantActionState
  onExecuteAction?: (action: AgentAction) => void
}) {
  const isRunning = state?.status === "running"
  const isFinished = state?.status === "completed" || state?.status === "blocked"
  const nextSnippet = action.payload.new_snippet

  return (
    <div className="rounded-lg border border-white/20 bg-white/10 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{action.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/75">{action.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase text-white/70">
          Approval
        </span>
      </div>

      {nextSnippet && (
        <div className="mt-3 rounded-md bg-white/10 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Change preview</p>
          <p className="mt-1 text-xs leading-relaxed text-white/80">{nextSnippet}</p>
        </div>
      )}

      {action.warnings.length > 0 && (
        <div className="mt-3 space-y-1">
          {action.warnings.map((warning) => (
            <div key={warning} className="flex items-start gap-2 text-xs leading-relaxed text-white/70">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/60" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {state ? (
          <p className={cn(
            "text-xs font-medium",
            state.status === "completed" ? "text-emerald-100" : "text-white/75",
          )}>
            {state.message}
          </p>
        ) : (
          <p className="text-xs text-white/60">Target: {action.target_title}</p>
        )}
        <button
          type="button"
          onClick={() => onExecuteAction?.(action)}
          disabled={isRunning || isFinished}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-primary hover:bg-white/90 disabled:opacity-60"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : state?.status === "completed" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {isRunning ? "Applying" : state?.status === "completed" ? "Done" : action.button_label}
        </button>
      </div>
    </div>
  )
}

function answerModeLabel(mode: NonNullable<AssistantMessage["mode"]>, model?: string | null) {
  if (mode === "openai") return `OpenAI${model ? ` - ${model}` : ""}`
  if (mode === "computed") return "Computed from records"
  return "Demo fallback"
}

function StructuredAssistantContent({ message }: { message: AssistantMessage }) {
  return (
    <div className="space-y-3">
      {message.overview && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Overview</p>
          <p className="mt-1 text-sm text-white">{message.overview}</p>
        </div>
      )}

      {message.items && message.items.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Items</p>
          <div className="space-y-2">
            {message.items.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="relative overflow-hidden rounded-lg bg-white/10 py-2 pl-4 pr-3"
                title={item.priority ? `${itemKindLabel(item.kind)} - ${item.priority} priority` : itemKindLabel(item.kind)}
              >
                <div className={cn("absolute inset-y-0 left-0 w-1", priorityStripTone(item.priority))} />
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/75">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {message.risks && message.risks.length > 0 && (
        <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Watch</p>
          <ul className="mt-1 space-y-1">
            {message.risks.map((risk) => (
              <li key={risk} className="text-xs leading-relaxed text-white/75">
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function itemKindLabel(kind: RetrievalAnswerItem["kind"]) {
  const labels: Record<RetrievalAnswerItem["kind"], string> = {
    action: "To do",
    finding: "Finding",
    risk: "Risk",
    note: "Note",
  }
  return labels[kind]
}

function priorityStripTone(priority: RetrievalAnswerItem["priority"]) {
  if (!priority) return "bg-white/25"

  const tones: Record<NonNullable<RetrievalAnswerItem["priority"]>, string> = {
    high: "bg-red-300",
    medium: "bg-amber-200",
    low: "bg-emerald-200",
  }
  return tones[priority]
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
