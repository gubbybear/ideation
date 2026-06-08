"use client"

import { cn } from "@/lib/utils"
import { Upload, FileText, CheckCircle, Clock, Loader2 } from "lucide-react"
import { useBrandingQuery, usePortalQuery } from "@/lib/api"

const MATTER_ID = "ACL-1042"

export function PortalSnapshot() {
  const { data: branding } = useBrandingQuery()
  const { data: portal, isPending, error } = usePortalQuery(MATTER_ID)
  const tenantName = portal?.tenant_name ?? branding?.tenant_name ?? "Acme Advisory"
  const recentFiles = (portal?.files ?? []).slice(0, 3)

  return (
    <div className="glass rounded-xl border-glow overflow-hidden">
      <div className="bg-primary px-5 py-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary-foreground">Client Portal Preview</h3>
        <span className="text-xs text-primary-foreground/70 font-mono">
          intake.{tenantName.toLowerCase().replace(/\s+/g, "")}.com.au
        </span>
      </div>

      <div className="p-5 bg-muted/10">
        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-dashed border-border/50 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-card/20 group">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Client upload zone</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PDF, DOCX, JPG, PNG up to 40 MB.
              <br />
              Files stay inside {tenantName}&apos;s ReachStack workspace.
            </p>
          </div>

          <div className="space-y-3">
            {isPending && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading recent uploads…
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">
                Couldn&apos;t load portal: {error.message}
              </p>
            )}

            {!isPending && !error && recentFiles.length === 0 && (
              <p className="text-sm text-muted-foreground">No client uploads yet.</p>
            )}

            {recentFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase shrink-0 flex items-center gap-1",
                    file.status === "complete"
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning",
                  )}
                >
                  {file.status === "complete" ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {file.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
