"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  DatabaseZap,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Inbox,
  FileCheck,
  Globe,
  Shield,
  Palette,
  Sun,
  ShieldCheck,
  Send,
  UserCheck,
  XCircle,
  Upload,
  Download,
  ChevronLeft,
  Timer,
  UsersRound,
} from "lucide-react"

type Step = { icon: React.ComponentType<{ className?: string }>; text: string }

type Section = {
  id: string
  group: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  intro: string
  steps: Step[]
}

const sections: Section[] = [
  {
    id: "dashboard",
    group: "Work",
    title: "Dashboard",
    icon: LayoutDashboard,
    intro:
      "Your daily landing page. Shows what came in today, what is waiting for a human, and how the system is performing.",
    steps: [
      { icon: LayoutDashboard, text: "Top tiles show today's volume and the live evaluation pass rate." },
      { icon: Inbox, text: "Pick an item from the Inbound Queue on the left. The document preview and draft response update to that item." },
      { icon: FileCheck, text: "The right rail lists the AI's suggested action and lets you approve, escalate, request more info, or mark it as wrong." },
      { icon: ShieldCheck, text: "Below: a snapshot of recent client uploads and the live audit feed of system events." },
      { icon: Send, text: "The Review next item button jumps straight to the Review screen for deeper work." },
    ],
  },
  {
    id: "queue",
    group: "Work",
    title: "Queue",
    icon: Inbox,
    intro:
      "The full list of inbound items waiting for someone to action them. Use this when you want to work through everything in one place.",
    steps: [
      { icon: Inbox, text: "Click any row to select an item. Selected rows are highlighted." },
      { icon: FileCheck, text: "Use the filter pills (All, Urgent, Review, Missing info, Partner) to narrow the list." },
      { icon: LayoutDashboard, text: "Each row shows client or engagement name, type, source, time received, AI confidence, and current status." },
    ],
  },
  {
    id: "review",
    group: "Work",
    title: "Review",
    icon: FileCheck,
    intro:
      "The deep-work view for approving or correcting AI-drafted responses. This is where humans stay in control.",
    steps: [
      { icon: FileCheck, text: "Left panel: the inbound document. Middle panel: the AI-drafted reply in your firm's tone." },
      { icon: ChevronLeft, text: "Use the left/right arrows at the top right to walk through every item in the queue." },
      { icon: Send, text: "Approve and send: marks the draft as filed and records the approval in the audit log." },
      { icon: UserCheck, text: "Escalate to partner: flags the item for partner sign-off before any reply leaves." },
      { icon: HelpCircle, text: "Create missing-info request: returns the item to draft and notes that the client owes more info." },
      { icon: XCircle, text: "Mark as incorrect: puts the item on hold so the AI's call can be reviewed and corrected." },
    ],
  },
  {
    id: "calendar",
    group: "Work",
    title: "Calendar",
    icon: CalendarDays,
    intro:
      "The scheduling surface. It assumes Google Workspace and Microsoft 365 provide email, calendar, and free/busy signals.",
    steps: [
      { icon: CalendarDays, text: "Pick a client context, then choose an available slot from Google or Microsoft free/busy." },
      { icon: UsersRound, text: "Created bookings are linked back to the client and engagement record." },
      { icon: Timer, text: "Completed bookings can become billable or non-billable time entries." },
    ],
  },
  {
    id: "time",
    group: "Work",
    title: "Time Reporting",
    icon: Timer,
    intro:
      "Captures billable and non-billable work against clients and engagements.",
    steps: [
      { icon: Timer, text: "Create manual time entries with client, activity, hours, rate, and billing status." },
      { icon: CalendarDays, text: "Use suggested entries to convert calendar bookings into recorded work." },
      { icon: ShieldCheck, text: "New time entries are logged for audit and appear in searchable records." },
    ],
  },
  {
    id: "clients",
    group: "Clients",
    title: "Clients",
    icon: UsersRound,
    intro:
      "Client records without a sales pipeline. Use it to find context before doing the work.",
    steps: [
      { icon: UsersRound, text: "Select a client to see contacts, engagements, documents, bookings, time, and timeline records." },
      { icon: DatabaseZap, text: "Ask that client's records and inspect cited sources." },
      { icon: FileText, text: "Use it as the jumping-off point before client calls or document review." },
    ],
  },
  {
    id: "engagements",
    group: "Clients",
    title: "Engagements",
    icon: BriefcaseBusiness,
    intro:
      "Tracks active professional-services work across accounting, advisory, legal-support, and client-service engagements.",
    steps: [
      { icon: BriefcaseBusiness, text: "Scan stage, owner, due date, service line, next step, linked docs, and booked sessions." },
      { icon: Timer, text: "Billable hour totals show the commercial footprint of each engagement." },
    ],
  },
  {
    id: "portal",
    group: "Portal",
    title: "Client Portal",
    icon: Globe,
    intro:
      "A preview of what your clients see when they log in. Use it to check the look and feel and to test uploads.",
    steps: [
      { icon: Upload, text: "Drop a file in the upload area or click to browse. Accepts PDF, DOCX, JPG, PNG up to 40 MB." },
      { icon: FileCheck, text: "Recent Uploads lists what the client has sent in, with a tick once processing finishes." },
      { icon: LayoutDashboard, text: "Engagement Progress on the right shows the client where their work is in the workflow." },
    ],
  },
  {
    id: "documents",
    group: "Files",
    title: "Documents",
    icon: FileText,
    intro:
      "The document library for files arriving from email, portals, Google Drive, and Microsoft 365.",
    steps: [
      { icon: FileText, text: "Search files by name, type, source, tag, and extracted snippet." },
      { icon: DatabaseZap, text: "Ask documents and review citations before relying on an answer." },
      { icon: Upload, text: "Index folder represents future document ingestion from customer storage systems." },
    ],
  },
  {
    id: "records",
    group: "Files",
    title: "Search",
    icon: DatabaseZap,
    intro:
      "Searches clients, engagements, documents, bookings, time entries, and audit events.",
    steps: [
      { icon: DatabaseZap, text: "Use search when you need context without knowing where it lives." },
      { icon: ShieldCheck, text: "Citations show which records support an answer." },
    ],
  },
  {
    id: "timesheets",
    group: "People",
    title: "Timesheets",
    icon: ClipboardCheck,
    intro:
      "A lightweight HR fallback for SMBs that do not already have a timesheet system.",
    steps: [
      { icon: ClipboardCheck, text: "Track submitted, draft, and approved hours by staff member." },
      { icon: CalendarDays, text: "Unavailable and leave time should remove capacity from client booking availability." },
    ],
  },
  {
    id: "audit",
    group: "Admin",
    title: "Audit",
    icon: Shield,
    intro:
      "A complete record of every action the system and your staff have taken. Use this for compliance reviews and incident investigation.",
    steps: [
      { icon: Shield, text: "Tiles at the top summarise coverage and key compliance figures." },
      { icon: FileCheck, text: "The log lists every event with time, description, user, record/engagement, and outcome. New approvals, bookings, time entries, and uploads land here." },
      { icon: Download, text: "Export log downloads the whole table as a CSV file you can share with auditors or store in your DMS." },
    ],
  },
  {
    id: "branding",
    group: "Admin",
    title: "Settings",
    icon: Palette,
    intro:
      "Where you set how your tenant looks and how strictly it handles client data.",
    steps: [
      { icon: Palette, text: "Pick a colour theme. The preview panel on the right shows an outline of what the client portal looks like." },
      { icon: LayoutDashboard, text: "Choose an interface density: Compact, Comfortable, or Spacious." },
      { icon: ShieldCheck, text: "Set the Privacy Posture. Restricted keeps inference in Australia and disables training use; the chip in the top bar updates to match your choice." },
      { icon: FileCheck, text: "Click Save changes in the top right. Settings are stored and used the next time the dashboard loads." },
    ],
  },
]

const topBarTips: Step[] = [
  {
    icon: ShieldCheck,
    text: "The coloured pill near the top right shows your current privacy posture. It reads live from Settings and changes if you switch postures.",
  },
  { icon: Sun, text: "The sun/moon button switches between dark and light mode." },
]

export function HowToUseModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="How to use ReachStack"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          How to use
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl">How to use ReachStack</DialogTitle>
          <DialogDescription>
            A short tour of every screen and what each button does. No technical knowledge required.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="px-6 py-5 space-y-6">
            <section>
              <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-2">
                Getting around
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                The left sidebar is your main menu. Each item opens a different screen.
                The number next to a menu item tells you how many items are waiting there.
                The bar across the top shows your firm's address, current privacy mode, and
                a button to switch between light and dark themes.
              </p>
              <ul className="space-y-2">
                {topBarTips.map((tip, i) => {
                  const Icon = tip.icon
                  return (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <span>{tip.text}</span>
                    </li>
                  )
                })}
              </ul>
            </section>

            {["Work", "Clients", "Portal", "Files", "People", "Admin"].map((group) => (
              <section key={group}>
                <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-3">
                  {group}
                </p>
                <div className="space-y-4">
                  {sections
                    .filter((s) => s.group === group)
                    .map((section) => {
                      const SectionIcon = section.icon
                      return (
                        <div
                          key={section.id}
                          className="rounded-xl border border-border/40 bg-card/30 p-4"
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <SectionIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">
                                {section.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                {section.intro}
                              </p>
                            </div>
                          </div>

                          <ul className="space-y-2 mt-3 pl-12">
                            {section.steps.map((step, i) => {
                              const StepIcon = step.icon
                              return (
                                <li
                                  key={i}
                                  className="flex items-start gap-2.5 text-xs text-muted-foreground"
                                >
                                  <StepIcon className="w-3.5 h-3.5 mt-0.5 text-foreground/70 shrink-0" />
                                  <span className="leading-relaxed">{step.text}</span>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )
                    })}
                </div>
              </section>
            ))}

            <section className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm font-medium text-foreground mb-1">
                A note on safety
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every draft sits in review until someone approves, escalates, or holds it.
                Approvals, holds, missing-info requests, and client uploads are written to
                the Audit log, so you can always see who actioned what and when.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
