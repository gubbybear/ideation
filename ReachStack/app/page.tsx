"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { DashboardView } from "@/components/views/dashboard-view"
import { QueueView } from "@/components/views/queue-view"
import { ReviewView } from "@/components/views/review-view"
import { PortalView } from "@/components/views/portal-view"
import { AuditView } from "@/components/views/audit-view"
import { BrandingView } from "@/components/views/branding-view"

export default function ReachStackDashboard() {
  const [activeView, setActiveView] = useState("dashboard")

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />
      case "queue":
        return <QueueView />
      case "review":
        return <ReviewView />
      case "portal":
        return <PortalView />
      case "audit":
        return <AuditView />
      case "branding":
        return <BrandingView />
      default:
        return <DashboardView />
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
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          
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
