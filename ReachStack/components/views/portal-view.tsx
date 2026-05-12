"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { Upload, FileText, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react"

const statusSteps = [
  { step: 1, title: "Document received", description: "Uploaded via secure portal", done: true },
  { step: 2, title: "Privacy review", description: "PII tokenisation complete", done: true },
  { step: 3, title: "Matter assignment", description: "Linked to ACL-1042", done: true },
  { step: 4, title: "Partner review", description: "Awaiting sign-off", current: true },
  { step: 5, title: "Client notification", description: "Pending completion", done: false },
]

const clientFiles = [
  { name: "Statement_of_claim.pdf", size: "2.4 MB", status: "processing" },
  { name: "Engagement_letter_signed.pdf", size: "1.1 MB", status: "complete" },
  { name: "Supporting_docs.zip", size: "8.7 MB", status: "complete" },
]

export function PortalView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
            Client Portal
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Client-facing intake portal preview
          </h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <ExternalLink className="w-4 h-4" />
          Open portal
        </button>
      </div>

      {/* Client page preview */}
      <div className="glass rounded-xl border-glow overflow-hidden">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                AL
              </div>
              <span className="text-white font-semibold">Acme Legal</span>
            </div>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="hover:text-white cursor-pointer">Documents</span>
              <span className="hover:text-white cursor-pointer">Messages</span>
              <span className="hover:text-white cursor-pointer">Support</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white max-w-xl text-balance">
            Secure document upload and matter status tracking
          </h2>
          <p className="text-white/80 mt-3 max-w-lg">
            Upload your signed documents directly. All files are encrypted and processed within Australia.
          </p>
        </div>

        {/* Content area */}
        <div className="p-6 bg-muted/10">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Upload zone + files */}
            <div className="space-y-4">
              <GlassCard title="Upload Documents">
                <div className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-base font-medium text-foreground mb-1">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF, DOCX, JPG, PNG up to 40 MB
                  </p>
                </div>
              </GlassCard>

              <GlassCard title="Recent Uploads">
                <div className="space-y-3">
                  {clientFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      {file.status === "complete" ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Clock className="w-5 h-5 text-warning animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Right: Status steps */}
            <GlassCard title="Matter Progress">
              <div className="space-y-4">
                {statusSteps.map((step, i) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        step.done && "bg-success text-success-foreground",
                        step.current && "bg-primary text-primary-foreground animate-pulse",
                        !step.done && !step.current && "bg-muted text-muted-foreground"
                      )}>
                        {step.done ? <CheckCircle className="w-4 h-4" /> : step.step}
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={cn(
                          "w-0.5 h-8 mt-2",
                          step.done ? "bg-success/50" : "bg-border/50"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className={cn(
                        "text-sm font-medium",
                        step.done || step.current ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
