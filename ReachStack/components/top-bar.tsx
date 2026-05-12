"use client"

import { ShieldCheck, User, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function TopBar() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    console.log("[v0] toggleTheme called, resolvedTheme:", resolvedTheme, "theme:", theme)
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    console.log("[v0] setting theme to:", newTheme)
    setTheme(newTheme)
  }

  const isDark = resolvedTheme === "dark"

  return (
    <header className="relative z-20 h-14 flex items-center justify-between px-6 border-b border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-mono">
          stack.acmelegal.com.au
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>powered by</span>
        <span className="font-semibold text-foreground">ReachStack</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Privacy indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">
            Restricted · AU inference
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-success" />
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => {
            console.log("[v0] Button clicked!")
            const newTheme = resolvedTheme === "dark" ? "light" : "dark"
            console.log("[v0] Setting theme from", resolvedTheme, "to", newTheme)
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

        {/* User avatar */}
        <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors border border-border/50">
          <User className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}
