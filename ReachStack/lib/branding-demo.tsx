"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

export type CornerOption = "rounded" | "square"

export type BrandingDemoState = {
  tenantName: string
  accent: string
  font: string
  corners: CornerOption
  logo: string | null
}

const STORAGE_KEY = "reachstack-branding-demo"

export const DEFAULT_BRANDING: BrandingDemoState = {
  tenantName: "Acme Advisory",
  accent: "#3b6df1",
  font: "var(--font-geist), system-ui, sans-serif",
  corners: "rounded",
  logo: null,
}

function loadBranding(): BrandingDemoState {
  if (typeof window === "undefined") return DEFAULT_BRANDING
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_BRANDING
    const parsed = JSON.parse(raw) as Partial<BrandingDemoState>
    return {
      tenantName:
        typeof parsed.tenantName === "string" && parsed.tenantName.trim().length > 0
          ? parsed.tenantName
          : DEFAULT_BRANDING.tenantName,
      accent: parsed.accent ?? DEFAULT_BRANDING.accent,
      font: parsed.font ?? DEFAULT_BRANDING.font,
      corners: parsed.corners === "square" ? "square" : "rounded",
      logo: typeof parsed.logo === "string" ? parsed.logo : null,
    }
  } catch {
    return DEFAULT_BRANDING
  }
}

function applyBrandingToDom(branding: BrandingDemoState) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.style.setProperty("--primary", branding.accent)
  root.style.setProperty("--accent", branding.accent)
  root.style.setProperty("--ring", branding.accent)
  root.style.setProperty("--sidebar-primary", branding.accent)
  root.style.setProperty("--sidebar-ring", branding.accent)
  root.style.setProperty("--font-sans", branding.font)
  root.dataset.corners = branding.corners
}

type BrandingDemoContextValue = {
  branding: BrandingDemoState
  hydrated: boolean
  setTenantName: (value: string) => void
  setAccent: (value: string) => void
  setFont: (value: string) => void
  setCorners: (value: CornerOption) => void
  setLogo: (value: string | null) => void
  reset: () => void
}

const BrandingDemoContext = createContext<BrandingDemoContextValue | null>(null)

export function BrandingDemoProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingDemoState>(DEFAULT_BRANDING)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const initial = loadBranding()
    setBranding(initial)
    applyBrandingToDom(initial)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    applyBrandingToDom(branding)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(branding))
    } catch {
      /* localStorage full or unavailable — demo state will not persist */
    }
  }, [branding, hydrated])

  const setTenantName = useCallback(
    (value: string) => setBranding((b) => ({ ...b, tenantName: value })),
    [],
  )
  const setAccent = useCallback(
    (value: string) => setBranding((b) => ({ ...b, accent: value })),
    [],
  )
  const setFont = useCallback(
    (value: string) => setBranding((b) => ({ ...b, font: value })),
    [],
  )
  const setCorners = useCallback(
    (value: CornerOption) => setBranding((b) => ({ ...b, corners: value })),
    [],
  )
  const setLogo = useCallback(
    (value: string | null) => setBranding((b) => ({ ...b, logo: value })),
    [],
  )
  const reset = useCallback(() => setBranding(DEFAULT_BRANDING), [])

  const value = useMemo(
    () => ({
      branding,
      hydrated,
      setTenantName,
      setAccent,
      setFont,
      setCorners,
      setLogo,
      reset,
    }),
    [
      branding,
      hydrated,
      setTenantName,
      setAccent,
      setFont,
      setCorners,
      setLogo,
      reset,
    ],
  )

  return (
    <BrandingDemoContext.Provider value={value}>
      {children}
    </BrandingDemoContext.Provider>
  )
}

export function useBrandingDemo(): BrandingDemoContextValue {
  const ctx = useContext(BrandingDemoContext)
  if (!ctx) {
    throw new Error("useBrandingDemo must be used inside <BrandingDemoProvider>")
  }
  return ctx
}
