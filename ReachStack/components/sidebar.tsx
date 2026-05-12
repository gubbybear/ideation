"use client"

import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Inbox, 
  FileCheck, 
  Globe, 
  Shield, 
  Palette,
  Zap
} from "lucide-react"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

const navGroups = [
  {
    label: "Staff",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, count: 47 },
      { id: "queue", label: "Queue", icon: Inbox, count: 18 },
      { id: "review", label: "Review", icon: FileCheck, count: 6 },
    ]
  },
  {
    label: "Client",
    items: [
      { id: "portal", label: "Client Portal", icon: Globe, count: 9 },
    ]
  },
  {
    label: "Assurance",
    items: [
      { id: "audit", label: "Audit", icon: Shield, badge: "100%" },
      { id: "branding", label: "Branding", icon: Palette, badge: "v1" },
    ]
  }
]

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-60 h-screen flex flex-col border-r border-border/50 bg-sidebar backdrop-blur-xl">
      {/* Brand */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Acme Legal</h1>
            <p className="text-xs text-muted-foreground">Client intake & support</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={cn(
                        "w-4 h-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      {item.label}
                    </span>
                    
                    {"count" in item && (
                      <span className={cn(
                        "text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted/50 text-muted-foreground"
                      )}>
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

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="glass rounded-lg p-3">
          <p className="text-xs font-medium text-foreground mb-1">Deployment</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Navy theme, compact density, restricted privacy.
          </p>
        </div>
      </div>
    </aside>
  )
}
