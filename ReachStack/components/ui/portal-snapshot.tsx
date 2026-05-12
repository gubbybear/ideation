"use client"

import { cn } from "@/lib/utils"
import { Upload, FileText } from "lucide-react"

const portalItems = [
  { name: "Brennan Estate", status: "Costs agreement received", badge: "In review", variant: "success" as const },
  { name: "Coastal Holdings", status: "Settlement date confirmed", badge: "Answered", variant: "info" as const },
  { name: "Smith v Hargrove", status: "Annexures requested", badge: "Waiting", variant: "warning" as const },
]

export function PortalSnapshot() {
  return (
    <div className="glass rounded-xl border-glow overflow-hidden">
      {/* Portal header */}
      <div className="bg-primary px-5 py-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary-foreground">Client Portal Preview</h3>
        <span className="text-xs text-primary-foreground/70 font-mono">intake.acmelegal.com.au</span>
      </div>

      {/* Portal content */}
      <div className="p-5 bg-muted/10">
        <div className="grid grid-cols-2 gap-4">
          {/* Upload zone */}
          <div className="border-2 border-dashed border-border/50 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-card/20 hover:bg-card/30 hover:border-primary/30 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Upload signed documents</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PDF, DOCX, JPG, PNG up to 40 MB.<br />Files stay inside Acme Legal&apos;s ReachStack workspace.
            </p>
          </div>

          {/* Status list */}
          <div className="space-y-3">
            {portalItems.map((item) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.status}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase",
                  item.variant === "success" && "bg-success/15 text-success",
                  item.variant === "info" && "bg-primary/15 text-primary",
                  item.variant === "warning" && "bg-warning/15 text-warning"
                )}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
