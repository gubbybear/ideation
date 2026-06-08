"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { Check, Zap, Loader2, AlertCircle } from "lucide-react"
import { useBrandingQuery, useBrandingMutation } from "@/lib/api"
import { toast } from "sonner"

export function BrandingView() {
  const { data: branding, isPending, error } = useBrandingQuery()
  const mutation = useBrandingMutation()

  const [selectedTheme, setSelectedTheme] = useState("Navy")
  const [selectedDensity, setSelectedDensity] = useState("Compact")
  const [selectedPrivacy, setSelectedPrivacy] = useState("Restricted")

  useEffect(() => {
    if (branding) {
      setSelectedTheme(branding.theme)
      setSelectedDensity(branding.density)
      setSelectedPrivacy(branding.privacy_posture)
    }
  }, [branding])

  const handleSave = async () => {
    try {
      await mutation.mutateAsync({
        theme: selectedTheme,
        density: selectedDensity,
        privacy_posture: selectedPrivacy,
      })
      toast.success("Settings saved")
    } catch (err) {
      toast.error(`Save failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const colorThemes = branding?.available_themes ?? [
    { name: "Navy", color: "bg-[#1f3357]" },
    { name: "Forest", color: "bg-[#15803d]" },
    { name: "Ocean", color: "bg-[#1e6f8a]" },
    { name: "Amber", color: "bg-[#9a6a1f]" },
    { name: "Slate", color: "bg-[#0a0a0a]" },
  ]

  const densityOptions = branding?.available_densities ?? [
    { name: "Compact", description: "Maximum information density" },
    { name: "Comfortable", description: "Balanced spacing" },
    { name: "Spacious", description: "More breathing room" },
  ]

  const privacyOptions = branding?.available_privacy_postures ?? [
    { name: "Restricted", description: "AU-hosted inference, no training" },
    { name: "Standard", description: "Global inference, anonymised training" },
    { name: "Open", description: "Full platform features" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-1">
            Settings
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Customize your tenant appearance and behavior
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending || mutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {!mutation.isPending && "Save changes"}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Couldn&apos;t load settings</p>
            <p className="text-xs text-destructive/70 font-mono">{error.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Settings */}
        <div className="col-span-7 space-y-6">
          {/* Color theme */}
          <GlassCard title="Color Theme">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose your primary brand color for the client portal and staff interface.
              </p>
              <div className="flex flex-wrap gap-3">
                {colorThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setSelectedTheme(theme.name)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all",
                      selectedTheme === theme.name
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-border"
                    )}
                  >
                    <div className={cn("w-5 h-5 rounded-full", theme.color)} />
                    <span className="text-sm font-medium text-foreground">{theme.name}</span>
                    {selectedTheme === theme.name && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Density */}
          <GlassCard title="Interface Density">
            <div className="space-y-3">
              {densityOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => setSelectedDensity(option.name)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-lg border transition-all text-left",
                    selectedDensity === option.name
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-border"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{option.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                  </div>
                  {selectedDensity === option.name && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Privacy */}
          <GlassCard title="Privacy Posture">
            <div className="space-y-3">
              {privacyOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => setSelectedPrivacy(option.name)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-lg border transition-all text-left",
                    selectedPrivacy === option.name
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-border"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{option.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                  </div>
                  {selectedPrivacy === option.name && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Preview */}
        <div className="col-span-5">
          <GlassCard title="Live Preview">
            <div className="glass rounded-xl overflow-hidden border border-border/30">
              {/* Mini portal preview */}
              <div className="bg-primary px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white">Acme Advisory</span>
                </div>
                <div className="flex gap-3 text-[10px] text-white/70">
                  <span>Docs</span>
                  <span>Messages</span>
                </div>
              </div>
              <div className="p-4 bg-muted/10 min-h-[200px]">
                <div className="space-y-2">
                  <div className="h-2 bg-muted/50 rounded-full w-3/4" />
                  <div className="h-2 bg-muted/50 rounded-full w-1/2" />
                  <div className="h-2 bg-muted/50 rounded-full w-2/3" />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-card/30 border border-border/30">
                    <div className="h-1.5 bg-muted/50 rounded-full w-full mb-2" />
                    <div className="h-1.5 bg-muted/50 rounded-full w-2/3" />
                  </div>
                  <div className="p-3 rounded-lg bg-card/30 border border-border/30">
                    <div className="h-1.5 bg-muted/50 rounded-full w-full mb-2" />
                    <div className="h-1.5 bg-muted/50 rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Preview updates in real-time as you change settings
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
