import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

export type QueueStatus =
  | "partner"
  | "file"
  | "draft"
  | "logged"
  | "hold"
  | "review"

export type QueueSource = "Email" | "Portal" | "Inbox" | "Drive"

export interface QueueListItem {
  id: string
  name: string
  type: string
  source: QueueSource
  confidence: number
  status: QueueStatus
  time: string
}

async function getJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export function useQueueQuery(filter?: string) {
  const normalized = !filter || filter === "All" ? undefined : filter
  return useQuery({
    queryKey: ["queue", normalized ?? "all"],
    queryFn: () =>
      getJson<QueueListItem[]>("/api/queue", normalized ? { filter: normalized } : undefined),
  })
}

// ---------- Audit ----------

export interface AuditEvent {
  time: string
  event: string
  user: string
  matter: string
  status: "success" | "info" | "warning"
}

export interface AssuranceMetric {
  label: string
  value: string
  subtext: string
}

export type ChangeOperation = "create" | "update" | "delete" | "undo"
export type ChangeUndoStatus = "completed" | "blocked"

export interface ChangeRecord {
  id: string
  session_id: string
  time: string
  title: string
  summary: string
  actor: string
  target_type: string
  target_id: string
  operation: ChangeOperation
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
  reversible: boolean
  reverted: boolean
  undo_of?: string | null
  audit_event_id?: string | null
}

export interface ChangeUndoResponse {
  change_id: string
  status: ChangeUndoStatus
  message: string
  change?: ChangeRecord | null
}

export interface AuditResponse {
  metrics: AssuranceMetric[]
  events: AuditEvent[]
  session_id: string
  changes: ChangeRecord[]
}

export function useAuditQuery() {
  return useQuery({
    queryKey: ["audit"],
    queryFn: () => getJson<AuditResponse>("/api/audit"),
  })
}

export function useChangeUndoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (changeId: string): Promise<ChangeUndoResponse> => {
      const res = await fetch(`${API_BASE}/api/audit/changes/${changeId}/undo`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error(`Undo failed: ${res.status} ${res.statusText}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit"] })
      queryClient.invalidateQueries({ queryKey: ["queue"] })
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["time"] })
      queryClient.invalidateQueries({ queryKey: ["portal"] })
      queryClient.invalidateQueries({ queryKey: ["branding"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["client-workspace"] })
      queryClient.invalidateQueries({ queryKey: ["search"] })
    },
  })
}

// ---------- Actions ----------

export type ActionType = "approve" | "escalate" | "hold" | "request_info"

export interface ActionResponse {
  item_id: string
  action: ActionType
  new_status: QueueStatus
  audit_event_id: string
}

export function useActionMutation(itemId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (action: ActionType): Promise<ActionResponse> => {
      const res = await fetch(`${API_BASE}/api/queue/${itemId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        throw new Error(`Action failed: ${res.status} ${res.statusText}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] })
      queryClient.invalidateQueries({ queryKey: ["audit"] })
    },
  })
}

// ---------- Branding ----------

export interface BrandingOption {
  name: string
  description?: string
  color?: string
}

export interface BrandingConfig {
  tenant_name: string
  theme: string
  density: "Compact" | "Comfortable" | "Spacious"
  privacy_posture: "Restricted" | "Standard" | "Open"
  available_themes: BrandingOption[]
  available_densities: BrandingOption[]
  available_privacy_postures: BrandingOption[]
}

export interface BrandingUpdate {
  theme?: string
  density?: string
  privacy_posture?: string
}

export function useBrandingQuery() {
  return useQuery({
    queryKey: ["branding"],
    queryFn: () => getJson<BrandingConfig>("/api/branding"),
  })
}

export function useBrandingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (update: BrandingUpdate): Promise<BrandingConfig> => {
      const res = await fetch(`${API_BASE}/api/branding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      })
      if (!res.ok) {
        throw new Error(`Branding update failed: ${res.status} ${res.statusText}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] })
    },
  })
}

// ---------- Dashboard ----------

export interface MetricCard {
  value: string
  label: string
  indicator: string
  variant: "success" | "warning" | "info" | "destructive"
}

export interface QueueDashboardItem {
  id: string
  title: string
  meta: string
  confidence: number
  status: QueueStatus
}

export interface DashboardResponse {
  metrics: MetricCard[]
  queue: QueueDashboardItem[]
  eval_pass_rate: number
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getJson<DashboardResponse>("/api/dashboard"),
  })
}

// ---------- Queue Detail ----------

export interface DecisionRailOption {
  key: ActionType
  label: string
  description: string
}

export interface QueueItemDetail {
  id: string
  matter_code: string
  title: string
  received_at: string
  source: QueueSource
  confidence: number
  status: QueueStatus
  alert?: string
  alert_detail?: string
  document_preview_text: string
  draft_text: string
  decision_options: DecisionRailOption[]
}

export function useQueueItemQuery(itemId: string) {
  return useQuery({
    queryKey: ["queue-item", itemId],
    queryFn: () => getJson<QueueItemDetail>(`/api/queue/${itemId}`),
  })
}

export interface PortalStep {
  step: number
  title: string
  description: string
  done?: boolean
  current?: boolean
}

export interface PortalFile {
  name: string
  size: string
  status: "processing" | "complete"
}

export interface PortalStatus {
  matter_id: string
  tenant_name: string
  steps: PortalStep[]
  files: PortalFile[]
}

export function usePortalQuery(matterId: string) {
  return useQuery({
    queryKey: ["portal", matterId],
    queryFn: () => getJson<PortalStatus>(`/api/portal/${matterId}`),
  })
}

export interface UploadResponse {
  file: PortalFile
  matter_id: string
}

export function usePortalUploadMutation(matterId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`${API_BASE}/api/portal/upload?matter_id=${matterId}`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} ${res.statusText}`)
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portal", data.matter_id] })
    },
  })
}

// ---------- Professional services operations ----------

export type IntegrationProvider = "Google Workspace" | "Microsoft 365" | "Internal"
export type BookingStatus = "available" | "booked" | "completed" | "cancelled" | "no_show"
export type DocumentStatus = "indexed" | "processing" | "needs_review"
export type DocumentSourceOfTruth = "external" | "reachstack" | "shared"
export type DocumentSyncStatus =
  | "not_synced"
  | "synced"
  | "sync_pending"
  | "sync_failed"
  | "external_changed"
  | "local_changed"
  | "conflict"
export type DocumentEditing = "enabled" | "disabled"
export type DocumentApprovalStatus = "draft" | "review" | "approved" | "sent" | "filed"
export type GeneratedBy = "assistant" | "user" | "system"
export type TimeStatus = "draft" | "submitted" | "approved" | "rejected"
export type RecordType =
  | "client"
  | "engagement"
  | "document"
  | "queue"
  | "booking"
  | "time"
  | "note"
  | "audit"

export interface ClientRecord {
  id: string
  name: string
  segment: string
  primary_contact: string
  email: string
  phone: string
  owner: string
  status: string
  last_touch: string
  summary: string
  tags: string[]
}

export interface EngagementRecord {
  id: string
  client_id: string
  name: string
  service_line: string
  stage: string
  owner: string
  due_date: string
  next_step: string
  billable_hours: number
  document_count: number
  booking_count: number
}

export interface BookingRecord {
  id: string
  client_id: string
  engagement_id: string
  title: string
  start: string
  end: string
  staff: string
  provider: IntegrationProvider
  status: BookingStatus
  location: string
  notes: string
}

export interface BookingCreate {
  client_id: string
  engagement_id: string
  title: string
  start: string
  end: string
  staff: string
  provider: IntegrationProvider
  location?: string
  notes?: string
}

export interface DocumentRecord {
  id: string
  client_id: string
  engagement_id: string
  name: string
  doc_type: string
  subtype: string
  source: string
  source_of_truth: DocumentSourceOfTruth
  source_system: string
  external_system?: string | null
  external_id?: string | null
  external_url?: string | null
  sync_status: DocumentSyncStatus
  local_editing: DocumentEditing
  approval_status?: DocumentApprovalStatus | null
  version?: number | null
  generated_by?: GeneratedBy | null
  based_on_documents: string[]
  uploaded_at: string
  owner: string
  status: DocumentStatus
  tags: string[]
  snippet: string
}

export interface DocumentUpdate {
  snippet: string
  note?: string
}

export interface TimeEntryRecord {
  id: string
  date: string
  staff: string
  client_id: string
  engagement_id: string
  activity: string
  hours: number
  billable: boolean
  rate: number
  status: TimeStatus
  source: string
  notes: string
}

export interface TimeEntryCreate {
  date: string
  staff: string
  client_id: string
  engagement_id: string
  activity: string
  hours: number
  billable: boolean
  rate: number
  notes?: string
}

export interface TimesheetRecord {
  staff: string
  role: string
  week_start: string
  target_hours: number
  submitted_hours: number
  billable_hours: number
  leave_hours: number
  status: TimeStatus
}

export interface SearchResult {
  id: string
  type: RecordType
  title: string
  subtitle: string
  snippet: string
  client_id?: string | null
  engagement_id?: string | null
  score: number
}

export interface ClientWorkspace {
  client: ClientRecord
  engagements: EngagementRecord[]
  bookings: BookingRecord[]
  documents: DocumentRecord[]
  time_entries: TimeEntryRecord[]
  records: SearchResult[]
}

export interface RetrievalRequest {
  query: string
  client_id?: string
  engagement_id?: string
}

export interface RetrievalCitation {
  id: string
  title: string
  source_type: RecordType
  snippet: string
  score: number
  client_id?: string | null
  engagement_id?: string | null
}

export interface RetrievalAnswerItem {
  title: string
  detail: string
  kind: "action" | "finding" | "risk" | "note"
  priority?: "high" | "medium" | "low" | null
  source_indexes: number[]
}

export type AgentActionType = "revise_and_approve_document"
export type AgentActionTargetType = "document"
export type AgentActionExecutionStatus = "completed" | "blocked"

export interface AgentAction {
  id: string
  type: AgentActionType
  label: string
  description: string
  target_type: AgentActionTargetType
  target_id: string
  target_title: string
  requires_approval: boolean
  button_label: string
  payload: Record<string, string>
  warnings: string[]
}

export interface AgentActionExecuteResponse {
  action_id: string
  status: AgentActionExecutionStatus
  message: string
  document?: DocumentRecord | null
  audit_event_id?: string | null
  change_id?: string | null
  warnings: string[]
}

export interface RetrievalResponse {
  answer: string
  overview: string
  items: RetrievalAnswerItem[]
  risks: string[]
  citations: RetrievalCitation[]
  mode: "openai" | "fallback" | "computed"
  model?: string | null
  actions: AgentAction[]
}

export function useClientsQuery() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => getJson<ClientRecord[]>("/api/clients"),
  })
}

export function useClientWorkspaceQuery(clientId: string) {
  return useQuery({
    queryKey: ["client-workspace", clientId],
    queryFn: () => getJson<ClientWorkspace>(`/api/clients/${clientId}/workspace`),
    enabled: Boolean(clientId),
  })
}

export function useEngagementsQuery() {
  return useQuery({
    queryKey: ["engagements"],
    queryFn: () => getJson<EngagementRecord[]>("/api/engagements"),
  })
}

export function useBookingsQuery(clientId?: string) {
  return useQuery({
    queryKey: ["bookings", clientId ?? "all"],
    queryFn: () =>
      getJson<BookingRecord[]>("/api/bookings", clientId ? { client_id: clientId } : undefined),
  })
}

export function useBookingCreateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (booking: BookingCreate): Promise<BookingRecord> => {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      })
      if (!res.ok) {
        throw new Error(`Booking failed: ${res.status} ${res.statusText}`)
      }
      return res.json()
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["client-workspace", booking.client_id] })
      queryClient.invalidateQueries({ queryKey: ["audit"] })
      queryClient.invalidateQueries({ queryKey: ["search"] })
    },
  })
}

export function useDocumentsQuery(clientId?: string) {
  return useQuery({
    queryKey: ["documents", clientId ?? "all"],
    queryFn: () =>
      getJson<DocumentRecord[]>("/api/documents", clientId ? { client_id: clientId } : undefined),
  })
}

export function useDocumentUpdateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ documentId, update }: { documentId: string; update: DocumentUpdate }): Promise<DocumentRecord> => {
      const res = await fetch(`${API_BASE}/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      })
      if (!res.ok) {
        throw new Error(`Document update failed: ${res.status} ${res.statusText}`)
      }
      return res.json()
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      queryClient.invalidateQueries({ queryKey: ["audit"] })
      queryClient.invalidateQueries({ queryKey: ["search"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["client-workspace", document.client_id] })
    },
  })
}

export function useTimeEntriesQuery(clientId?: string) {
  return useQuery({
    queryKey: ["time", clientId ?? "all"],
    queryFn: () =>
      getJson<TimeEntryRecord[]>("/api/time", clientId ? { client_id: clientId } : undefined),
  })
}

export function useTimeEntryCreateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (entry: TimeEntryCreate): Promise<TimeEntryRecord> => {
      const res = await fetch(`${API_BASE}/api/time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      })
      if (!res.ok) {
        throw new Error(`Time entry failed: ${res.status} ${res.statusText}`)
      }
      return res.json()
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ["time"] })
      queryClient.invalidateQueries({ queryKey: ["client-workspace", entry.client_id] })
      queryClient.invalidateQueries({ queryKey: ["audit"] })
      queryClient.invalidateQueries({ queryKey: ["search"] })
    },
  })
}

export function useTimesheetsQuery() {
  return useQuery({
    queryKey: ["timesheets"],
    queryFn: () => getJson<TimesheetRecord[]>("/api/timesheets"),
  })
}

export function useSearchQuery(query: string, clientId?: string) {
  return useQuery({
    queryKey: ["search", query, clientId ?? "all"],
    queryFn: () =>
      getJson<SearchResult[]>(
        "/api/search",
        {
          ...(query ? { q: query } : {}),
          ...(clientId ? { client_id: clientId } : {}),
        },
      ),
  })
}

export function useRetrievalMutation() {
  return useMutation({
    mutationFn: async (payload: RetrievalRequest): Promise<RetrievalResponse> => {
      const res = await fetch(`${API_BASE}/api/retrieval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw new Error(`Retrieval failed: ${res.status} ${res.statusText}`)
      }
      return res.json()
    },
  })
}

export function useAgentActionExecuteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (action: AgentAction): Promise<AgentActionExecuteResponse> => {
      const res = await fetch(`${API_BASE}/api/agent/actions/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        throw new Error(`Agent action failed: ${res.status} ${res.statusText}`)
      }
      return res.json()
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      queryClient.invalidateQueries({ queryKey: ["audit"] })
      queryClient.invalidateQueries({ queryKey: ["search"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      if (result.document?.client_id) {
        queryClient.invalidateQueries({ queryKey: ["client-workspace", result.document.client_id] })
      }
    },
  })
}
