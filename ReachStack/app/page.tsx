"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { DashboardView } from "@/components/views/dashboard-view"
import { QueueView } from "@/components/views/queue-view"
import { ReviewView } from "@/components/views/review-view"
import { CalendarView } from "@/components/views/calendar-view"
import { ClientsView } from "@/components/views/clients-view"
import { EngagementsView } from "@/components/views/engagements-view"
import { DocumentsView } from "@/components/views/documents-view"
import { TimeView } from "@/components/views/time-view"
import { TimesheetsView } from "@/components/views/timesheets-view"
import { RecordsView } from "@/components/views/records-view"
import { PortalView } from "@/components/views/portal-view"
import { AuditView } from "@/components/views/audit-view"
import { BrandingView } from "@/components/views/branding-view"
import type { PersonaRole } from "@/lib/persona"

export default function ReachStackDashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [persona, setPersona] = useState<PersonaRole>("admin")

  useEffect(() => {
    setActiveView("dashboard")
  }, [persona])

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardView
            persona={persona}
            onOpenReview={() => setActiveView("review")}
            onNavigate={setActiveView}
          />
        )
      case "queue":
        return <QueueView />
      case "review":
        return <ReviewView />
      case "calendar":
        return <CalendarView />
      case "clients":
        return <ClientsView />
      case "engagements":
        return <EngagementsView />
      case "documents":
        return <DocumentsView />
      case "time":
        return <TimeView />
      case "timesheets":
        return <TimesheetsView />
      case "records":
        return <RecordsView />
      case "portal":
        return <PortalView />
      case "audit":
        return <AuditView />
      case "branding":
        return <BrandingView />
      default:
        return <DashboardView persona={persona} onOpenReview={() => setActiveView("review")} onNavigate={setActiveView} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glow effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex h-screen">
        <Sidebar activeView={activeView} onViewChange={setActiveView} persona={persona} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar persona={persona} onPersonaChange={setPersona} />
          
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-[1600px] mx-auto">
              {renderView()}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
