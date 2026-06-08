"use client"

import { ShieldCheck, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { HowToUseModal } from "@/components/how-to-use-modal"
import { useBrandingQuery } from "@/lib/api"
import { cn } from "@/lib/utils"
import { PERSONA_LABELS, type PersonaRole } from "@/lib/persona"

const POSTURE_COPY: Record<string, { label: string; tone: "success" | "warning" | "info" }> = {
  Restricted: { label: "Restricted · AU inference", tone: "success" },
  Standard: { label: "Standard · global inference", tone: "info" },
  Open: { label: "Open · all features", tone: "warning" },
}

interface TopBarProps {
  persona: PersonaRole
  onPersonaChange: (persona: PersonaRole) => void
}

export function TopBar({ persona, onPersonaChange }: TopBarProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { data: branding } = useBrandingQuery()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"
  const posture = POSTURE_COPY[branding?.privacy_posture ?? "Restricted"]

  return (
    <header className="relative z-20 h-14 flex items-center justify-between px-6 border-b border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 p-1">
        {(["admin", "partner"] as PersonaRole[]).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => onPersonaChange(role)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              persona === role
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {PERSONA_LABELS[role]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>powered by</span>
        <span className="font-semibold text-foreground">ReachStack</span>
      </div>

      <div className="flex items-center gap-4">
        <HowToUseModal />

        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border",
            posture.tone === "success" && "bg-success/10 border-success/20",
            posture.tone === "info" && "bg-primary/10 border-primary/20",
            posture.tone === "warning" && "bg-warning/10 border-warning/20",
          )}
        >
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              posture.tone === "success" && "bg-success",
              posture.tone === "info" && "bg-primary",
              posture.tone === "warning" && "bg-warning",
            )}
          />
          <span
            className={cn(
              "text-xs font-medium",
              posture.tone === "success" && "text-success",
              posture.tone === "info" && "text-primary",
              posture.tone === "warning" && "text-warning",
            )}
          >
            {posture.label}
          </span>
          <ShieldCheck
            className={cn(
              "w-3.5 h-3.5",
              posture.tone === "success" && "text-success",
              posture.tone === "info" && "text-primary",
              posture.tone === "warning" && "text-warning",
            )}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            const newTheme = resolvedTheme === "dark" ? "light" : "dark"
            setTheme(newTheme)
          }}
          className="relative z-50 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors border border-border/50 cursor-pointer"
          aria-label={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mounted ? (
            isDark ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

      </div>
    </header>
  )
}
