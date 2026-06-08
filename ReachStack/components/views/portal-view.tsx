"use client"

import { useRef } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import { usePortalQuery, usePortalUploadMutation } from "@/lib/api"
import { toast } from "sonner"

const MATTER_ID = "ACL-1042"

export function PortalView() {
  const { data: portal, isPending, error } = usePortalQuery(MATTER_ID)
  const uploadMutation = usePortalUploadMutation(MATTER_ID)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return
    try {
      await uploadMutation.mutateAsync(file)
      toast.success(`${file.name} uploaded`)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const statusSteps = portal?.steps ?? []
  const clientFiles = portal?.files ?? []
  const tenantName = portal?.tenant_name ?? "Acme Advisory"
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
      </div>

      {/* Client page preview */}
      <div className="glass rounded-xl border-glow overflow-hidden">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                {tenantName.split(' ').map(w => w[0]).join('')}
              </div>
              <span className="text-white font-semibold">{tenantName}</span>
            </div>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="hover:text-white cursor-pointer">Documents</span>
              <span className="hover:text-white cursor-pointer">Messages</span>
              <span className="hover:text-white cursor-pointer">Support</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white max-w-xl text-balance">
            Secure document upload and engagement status tracking
          </h2>
          <p className="text-white/80 mt-3 max-w-lg">
            Upload your signed documents directly. All files are encrypted and processed within Australia.
          </p>
        </div>

        {/* Content area */}
        <div className="p-6 bg-muted/10">
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Couldn&apos;t load portal data</p>
                <p className="text-xs text-destructive/70 font-mono">{error.message}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Upload zone + files */}
            <div className="space-y-4">
              <GlassCard title="Upload Documents">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-all cursor-pointer group"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-7 h-7 text-primary animate-spin mb-4" />
                      <p className="text-base font-medium text-foreground mb-1">Uploading…</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <Upload className="w-7 h-7 text-primary" />
                      </div>
                      <p className="text-base font-medium text-foreground mb-1">
                        Drop files here or click to upload
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PDF, DOCX, JPG, PNG up to 40 MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                />
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
            <GlassCard title="Engagement Progress">
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
