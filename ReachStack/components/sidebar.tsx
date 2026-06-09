"use client"

import { cn } from "@/lib/utils"
import {
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Inbox,
  FileCheck,
  Globe,
  Shield,
  Palette,
  Search,
  Timer,
  UsersRound,
  Zap,
} from "lucide-react"
import {
  useBookingsQuery,
  useBrandingQuery,
  useClientsQuery,
  useDocumentsQuery,
  useEngagementsQuery,
  usePortalQuery,
  useQueueQuery,
  useTimeEntriesQuery,
  useTimesheetsQuery,
} from "@/lib/api"
import { useBrandingDemo } from "@/lib/branding-demo"
import type { PersonaRole } from "@/lib/persona"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  persona: PersonaRole
}

const PORTAL_MATTER_ID = "ACL-1042"

export function Sidebar({ activeView, onViewChange, persona }: SidebarProps) {
  const { data: queue = [] } = useQueueQuery()
  const { data: branding } = useBrandingQuery()
  const { data: portal } = usePortalQuery(PORTAL_MATTER_ID)
  const { data: clients = [] } = useClientsQuery()
  const { data: engagements = [] } = useEngagementsQuery()
  const { data: bookings = [] } = useBookingsQuery()
  const { data: documents = [] } = useDocumentsQuery()
  const { data: timeEntries = [] } = useTimeEntriesQuery()
  const { data: timesheets = [] } = useTimesheetsQuery()
  const { branding: brandingDemo } = useBrandingDemo()

  const tenantName =
    brandingDemo.tenantName.trim() || branding?.tenant_name || "Acme Advisory"
  const reviewCount = queue.filter(
    (q) => q.status === "partner" || q.status === "review" || q.status === "hold",
  ).length
  const portalCount = portal?.files.length ?? 0
  const searchableCount =
    clients.length + engagements.length + bookings.length + documents.length + timeEntries.length + queue.length

  const adminNavGroups = [
    {
      label: "Work",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, count: queue.length },
        { id: "queue", label: "Queue", icon: Inbox, count: queue.length },
        { id: "calendar", label: "Calendar", icon: CalendarDays, count: bookings.length },
      ],
    },
    {
      label: "Customers",
      items: [
        { id: "clients", label: "Clients", icon: UsersRound, count: clients.length },
        { id: "engagements", label: "Engagements", icon: BriefcaseBusiness, count: engagements.length },
        { id: "portal", label: "Client Portal", icon: Globe, count: portalCount },
      ],
    },
    {
      label: "Files",
      items: [
        { id: "documents", label: "Documents", icon: FileText, count: documents.length },
        { id: "records", label: "Search", icon: Search, count: searchableCount },
      ],
    },
    {
      label: "People",
      items: [
        { id: "timesheets", label: "Timesheets", icon: ClipboardCheck, count: timesheets.length },
      ],
    },
    {
      label: "Admin",
      items: [
        { id: "audit", label: "Audit", icon: Shield, badge: "100%" },
        { id: "branding", label: "Settings", icon: Palette, badge: "v1" },
      ],
    },
  ]

  const partnerNavGroups = [
    {
      label: "Work",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, count: reviewCount },
        { id: "review", label: "Review", icon: FileCheck, count: reviewCount },
        { id: "calendar", label: "Calendar", icon: CalendarDays, count: bookings.length },
        { id: "time", label: "Time Reporting", icon: Timer, count: timeEntries.length },
      ],
    },
    {
      label: "Clients",
      items: [
        { id: "clients", label: "Clients", icon: UsersRound, count: clients.length },
        { id: "engagements", label: "Engagements", icon: BriefcaseBusiness, count: engagements.length },
      ],
    },
    {
      label: "Files",
      items: [
        { id: "documents", label: "Documents", icon: FileText, count: documents.length },
        { id: "records", label: "Search", icon: Search, count: searchableCount },
      ],
    },
    {
      label: "Admin",
      items: [
        { id: "audit", label: "Audit", icon: Shield, badge: "100%" },
      ],
    },
  ]

  const navGroups = persona === "partner" ? partnerNavGroups : adminNavGroups

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-border/50 bg-sidebar backdrop-blur-xl">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden",
              brandingDemo.logo ? "bg-card border border-border/40" : "bg-primary",
            )}
          >
            {brandingDemo.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandingDemo.logo}
                alt={`${tenantName} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <Zap className="w-5 h-5 text-primary-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">{tenantName}</h1>
            <p className="text-xs text-muted-foreground">
              {persona === "partner" ? "Partner view" : "Admin view"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-6 overflow-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-foreground border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      {item.label}
                    </span>

                    {"count" in item && item.count !== undefined && (
                      <span
                        className={cn(
                          "text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 text-muted-foreground",
                        )}
                      >
                        {item.count}
                      </span>
                    )}

                    {"badge" in item && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="glass rounded-lg p-3">
          <p className="text-xs font-medium text-foreground mb-1">Deployment</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {branding?.theme ?? "Navy"} theme,{" "}
            {(branding?.density ?? "Compact").toLowerCase()} density,{" "}
            {(branding?.privacy_posture ?? "Restricted").toLowerCase()} privacy.
          </p>
        </div>
      </div>
    </aside>
  )
}
