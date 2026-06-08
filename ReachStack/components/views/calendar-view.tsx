"use client"

import { useMemo, useState } from "react"
import { CalendarClock, CheckCircle2, Loader2, Plus, Video } from "lucide-react"
import { toast } from "sonner"
import { GlassCard } from "@/components/ui/glass-card"
import {
  useBookingCreateMutation,
  useBookingsQuery,
  useClientsQuery,
  useEngagementsQuery,
  type BookingCreate,
  type BookingRecord,
  type IntegrationProvider,
} from "@/lib/api"
import { formatDateTime, formatTimeShort } from "@/lib/format"
import { cn } from "@/lib/utils"

const staff = ["M. Turner", "J. Smith", "A. Chen"]
const providers: IntegrationProvider[] = ["Google Workspace", "Microsoft 365"]

export function CalendarView() {
  const { data: bookings = [], isPending } = useBookingsQuery()
  const { data: clients = [] } = useClientsQuery()
  const { data: engagements = [] } = useEngagementsQuery()
  const createBooking = useBookingCreateMutation()

  const [clientId, setClientId] = useState("client-northstar")
  const clientEngagements = useMemo(
    () => engagements.filter((e) => e.client_id === clientId),
    [clientId, engagements],
  )
  const engagementId = clientEngagements[0]?.id ?? engagements[0]?.id ?? ""

  const openSlots: BookingCreate[] = [
    {
      client_id: clientId,
      engagement_id: engagementId,
      title: "Client working session",
      start: "2026-06-10T13:00:00+10:00",
      end: "2026-06-10T13:45:00+10:00",
      staff: "M. Turner",
      provider: "Google Workspace",
      location: "Google Meet",
      notes: "Created from the availability grid.",
    },
    {
      client_id: clientId,
      engagement_id: engagementId,
      title: "Document follow-up",
      start: "2026-06-11T09:00:00+10:00",
      end: "2026-06-11T09:30:00+10:00",
      staff: "A. Chen",
      provider: "Microsoft 365",
      location: "Teams",
      notes: "Created from Microsoft free/busy availability.",
    },
  ]

  async function bookSlot(slot: BookingCreate) {
    try {
      await createBooking.mutateAsync(slot)
      toast.success("Booking created")
    } catch (err) {
      toast.error(`Booking failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
            Calendar & Bookings
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Book customer time across Google and Microsoft calendars
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {providers.map((provider) => (
            <span
              key={provider}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success border border-success/20 text-xs font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {provider}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3 space-y-4">
          <GlassCard title="Booking Context" badge="Free/busy">
            <div className="space-y-3">
              <Field label="Client">
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full h-9 rounded-md border border-border/50 bg-background px-3 text-sm"
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Engagement">
                <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-sm text-foreground">
                  {clientEngagements[0]?.name ?? "Loading engagement..."}
                </div>
              </Field>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Availability is shown as if ReachStack has read Google Calendar and Microsoft 365 free/busy data,
                then reserved the chosen slot against the client record.
              </p>
            </div>
          </GlassCard>

          <GlassCard title="Open Slots" badge="Suggested">
            <div className="space-y-3">
              {openSlots.map((slot) => (
                <button
                  key={`${slot.start}-${slot.staff}`}
                  type="button"
                  onClick={() => bookSlot(slot)}
                  disabled={!slot.engagement_id || createBooking.isPending}
                  className="w-full rounded-lg border border-border/40 bg-card/30 p-3 text-left hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{formatDateTime(slot.start)}</span>
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {slot.staff} via {slot.provider}
                  </p>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="col-span-6">
          <GlassCard title="Schedule" badge="Week view">
            <div className="grid grid-cols-[90px_1fr] gap-0 overflow-hidden rounded-lg border border-border/30">
              {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"].map((time) => (
                <div key={time} className="contents">
                  <div className="border-b border-border/20 bg-muted/20 px-3 py-4 text-xs text-muted-foreground font-mono">
                    {time}
                  </div>
                  <div className="relative min-h-16 border-b border-border/20 bg-card/20 p-2">
                    {bookings
                      .filter((booking) => formatTimeShort(booking.start).startsWith(time.slice(0, 2)))
                      .map((booking) => (
                        <BookingPill key={booking.id} booking={booking} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="col-span-3">
          <GlassCard title="Upcoming Bookings" badge={`${bookings.length}`}>
            {isPending ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                Loading bookings...
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="rounded-lg border border-border/30 bg-card/30 p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {booking.location.includes("Meet") || booking.location.includes("Teams") ? (
                          <Video className="w-4 h-4 text-primary" />
                        ) : (
                          <CalendarClock className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{booking.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(booking.start)} - {booking.staff}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{booking.provider}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
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

function BookingPill({ booking }: { booking: BookingRecord }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-xs",
        booking.status === "available"
          ? "border-warning/30 bg-warning/10 text-warning"
          : "border-primary/30 bg-primary/10 text-primary",
      )}
    >
      <p className="font-semibold text-foreground">{booking.title}</p>
      <p className="text-muted-foreground mt-0.5">
        {formatTimeShort(booking.start)}-{formatTimeShort(booking.end)} - {booking.staff}
      </p>
    </div>
  )
}
