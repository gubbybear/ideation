const TENANT_TZ = "Australia/Sydney"
const TENANT_LOCALE = "en-AU"

const timeShortFmt = new Intl.DateTimeFormat(TENANT_LOCALE, {
  timeZone: TENANT_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const timeLongFmt = new Intl.DateTimeFormat(TENANT_LOCALE, {
  timeZone: TENANT_TZ,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})

const dateFmt = new Intl.DateTimeFormat(TENANT_LOCALE, {
  timeZone: TENANT_TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const dateTimeFmt = new Intl.DateTimeFormat(TENANT_LOCALE, {
  timeZone: TENANT_TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

function parse(iso: string): Date | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "HH:mm" in Sydney time, e.g. "12:14". Falls back to the raw string. */
export function formatTimeShort(iso: string): string {
  const d = parse(iso)
  return d ? timeShortFmt.format(d) : iso
}

/** "HH:mm:ss" in Sydney time, e.g. "12:14:32". Falls back to the raw string. */
export function formatTimeLong(iso: string): string {
  const d = parse(iso)
  return d ? timeLongFmt.format(d) : iso
}

/** "DD/MM/YYYY" in Sydney time. */
export function formatDate(iso: string): string {
  const d = parse(iso)
  return d ? dateFmt.format(d) : iso
}

/** "DD/MM/YYYY, HH:mm" in Sydney time. */
export function formatDateTime(iso: string): string {
  const d = parse(iso)
  return d ? dateTimeFmt.format(d) : iso
}
