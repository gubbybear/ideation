"use client"

import { useState } from "react"
import { MetricCard } from "@/components/ui/metric-card"
import { GlassCard } from "@/components/ui/glass-card"
import { QueueItem } from "@/components/ui/queue-item"
import { DocumentPreview } from "@/components/ui/document-preview"
import { DraftResponse } from "@/components/ui/draft-response"
import { DecisionRail } from "@/components/ui/decision-rail"
import { PortalSnapshot } from "@/components/ui/portal-snapshot"
import { AuditFeed } from "@/components/ui/audit-feed"
import { ArrowRight, CheckCircle2 } from "lucide-react"

const queueItems = [
  {
    id: "1",
    title: "Statement of claim from Hargrove Holdings",
    meta: "Email · Smith v Hargrove · 12:14",
    confidence: 98.4,
    status: "partner" as const,
  },
  {
    id: "2",
    title: "Signed engagement letter for Brennan Estate",
    meta: "Portal upload · new matter · 11:42",
    confidence: 99.1,
    status: "file" as const,
  },
  {
    id: "3",
    title: "Client asks for conveyancing settlement status",
    meta: "Shared inbox · Coastal Holdings · 10:53",
    confidence: 94.8,
    status: "draft" as const,
  },
  {
    id: "4",
    title: "Trust ledger reconciliation extract",
    meta: "Drive folder · monthly close · 10:02",
    confidence: 100,
    status: "logged" as const,
  },
  {
    id: "5",
    title: "Counsel brief with incomplete annexures",
    meta: "Email attachment · Smith v Hargrove · 09:36",
    confidence: 87.4,
    status: "hold" as const,
  },
]

export function DashboardView() {
  const [selectedItem, setSelectedItem] = useState("1")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
            Staff Cockpit
          </p>
          <h1 className="text-2xl font-semibold text-foreground text-balance">
            Today&apos;s inbound work, review risk, and client handoffs.
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span className="text-xs font-medium text-success">Eval pass 96.4%</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Review next item
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          value="47" 
          label="Open inbound items" 
          indicator="IN"
          variant="success"
        />
        <MetricCard 
          value="6" 
          label="Need partner approval" 
          indicator="AP"
          variant="warning"
        />
        <MetricCard 
          value="9 hrs" 
          label="Average client handover" 
          indicator="SLA"
          variant="info"
        />
        <MetricCard 
          value="100%" 
          label="PII redaction coverage" 
          indicator="PII"
          variant="success"
        />
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-12 gap-4">
        {/* Queue panel */}
        <div className="col-span-3">
          <GlassCard title="Inbound Queue" badge="Newest first">
            <div className="space-y-2">
              {queueItems.map((item) => (
                <QueueItem
                  key={item.id}
                  {...item}
                  isSelected={selectedItem === item.id}
                  onClick={() => setSelectedItem(item.id)}
                />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Review panel */}
        <div className="col-span-6">
          <GlassCard 
            title="Selected Item Review" 
            badge="Human approval required"
            badgeVariant="warning"
          >
            <div className="grid grid-cols-2 gap-4">
              <DocumentPreview />
              <DraftResponse />
            </div>
          </GlassCard>
        </div>

        {/* Decision rail */}
        <div className="col-span-3">
          <DecisionRail />
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <PortalSnapshot />
        </div>
        <div className="col-span-4">
          <GlassCard title="Assurance Events" badge="Live" badgeVariant="success">
            <AuditFeed />
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
