"use client"

import { useRef, useState } from "react"
import { Paintbrush, RotateCcw, Upload, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  type CornerOption,
  useBrandingDemo,
} from "@/lib/branding-demo"

type FontOption = {
  name: string
  cssValue: string
  sample: string
}

const FONT_OPTIONS: FontOption[] = [
  {
    name: "Geist",
    cssValue: "var(--font-geist), system-ui, sans-serif",
    sample: "Aa  Northstar Dental Group",
  },
  {
    name: "Inter",
    cssValue: "var(--font-inter), system-ui, sans-serif",
    sample: "Aa  Northstar Dental Group",
  },
  {
    name: "IBM Plex Sans",
    cssValue: "var(--font-ibm-plex), system-ui, sans-serif",
    sample: "Aa  Northstar Dental Group",
  },
  {
    name: "Playfair Display",
    cssValue: "var(--font-playfair), Georgia, serif",
    sample: "Aa  Northstar Dental Group",
  },
]

const PRESET_COLORS = [
  "#1f3357", // navy
  "#15803d", // forest
  "#1e6f8a", // ocean
  "#9a6a1f", // amber
  "#7c3aed", // violet
  "#e11d48", // crimson
  "#0a0a0a", // slate
]

const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"]
const MAX_LOGO_BYTES = 512 * 1024 // 512 KB keeps localStorage healthy

export function BrandingPicker() {
  const [open, setOpen] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    branding,
    setTenantName,
    setAccent,
    setFont,
    setCorners,
    setLogo,
    reset,
  } = useBrandingDemo()

  const handleLogoFile = (file: File | undefined) => {
    setLogoError(null)
    if (!file) return
    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      setLogoError("Use PNG, JPG, SVG, or WebP.")
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo must be under 512 KB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") setLogo(reader.result)
    }
    reader.onerror = () => setLogoError("Could not read that file.")
    reader.readAsDataURL(file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Open branding picker"
          className="relative z-50 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors border border-border/50 cursor-pointer"
        >
          <Paintbrush className="w-4 h-4 text-muted-foreground" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Branding (demo)</DialogTitle>
          <DialogDescription>
            Try the logo, accent colour, typeface, and corner style. Stored in your browser only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          <section>
            <p className="text-xs font-semibold text-foreground mb-2">
              Logo &amp; company name
            </p>
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-lg bg-primary/10 border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                {branding.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={branding.logo}
                    alt="Tenant logo preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground">No logo</span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <input
                  type="text"
                  value={branding.tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Company name"
                  maxLength={60}
                  aria-label="Company name"
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-input/40"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_LOGO_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => handleLogoFile(e.target.files?.[0])}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-border/60 bg-muted/40 hover:bg-muted transition-colors flex-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {branding.logo ? "Replace logo" : "Upload logo"}
                  </button>
                  {branding.logo && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogo(null)
                        setLogoError(null)
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p
              className={cn(
                "text-[11px] mt-2",
                logoError ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {logoError ?? "PNG, JPG, SVG, or WebP. Max 512 KB."}
            </p>
          </section>

          <section>
            <p className="text-xs font-semibold text-foreground mb-2">Accent colour</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-12 h-10 rounded-md border border-border bg-transparent cursor-pointer"
                aria-label="Pick accent colour"
              />
              <input
                type="text"
                value={branding.accent}
                onChange={(e) => setAccent(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-input/40 font-mono"
                aria-label="Accent colour hex"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccent(color)}
                  aria-label={`Use ${color}`}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                    branding.accent.toLowerCase() === color.toLowerCase()
                      ? "border-foreground"
                      : "border-border/40",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold text-foreground mb-2">Typeface</p>
            <div className="space-y-2">
              {FONT_OPTIONS.map((opt) => {
                const selected = branding.font === opt.cssValue
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setFont(opt.cssValue)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-border",
                    )}
                  >
                    <span className="text-sm font-medium text-foreground">
                      {opt.name}
                    </span>
                    <span
                      className="text-sm text-muted-foreground"
                      style={{ fontFamily: opt.cssValue }}
                    >
                      {opt.sample}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold text-foreground mb-2">Corners</p>
            <div className="grid grid-cols-2 gap-2">
              {(["rounded", "square"] as CornerOption[]).map((option) => {
                const selected = branding.corners === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCorners(option)}
                    className={cn(
                      "px-4 py-3 border text-sm font-medium transition-colors capitalize",
                      option === "rounded" ? "rounded-lg" : "rounded-none",
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/50 text-muted-foreground hover:border-border",
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </section>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => {
                reset()
                setLogoError(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to defaults
            </button>
            <span className="text-[11px] text-muted-foreground">
              Demo only — not saved to backend
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
