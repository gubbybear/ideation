# White-label customisation (demo)

A client-side branding picker for demos and sales conversations. Lets you reskin ReachStack on the fly without touching the backend or rebuilding.

## How to open it

Paint-brush icon in the top bar, between the **How to use** chip and the privacy posture pill. Opens a modal with four sections.

## What you can change

| Control | What it affects |
|---|---|
| **Logo** | The square mark at the top of the sidebar. Falls back to the Zap glyph when empty. |
| **Company name** | The tenant label rendered under the logo. Falls back to the backend `BrandingConfig.tenant_name`, then to `"Acme Advisory"`. |
| **Accent colour** | CSS vars `--primary`, `--accent`, `--ring`, `--sidebar-primary`, `--sidebar-ring`. Every `bg-primary` / `text-primary` / `border-primary` / focus ring in the app picks it up live. |
| **Typeface** | CSS var `--font-sans`. Four options preloaded via `next/font/google`: Geist, Inter, IBM Plex Sans, Playfair Display. |
| **Corners** | `data-corners="square"` on `<html>` triggers a global `border-radius: 0` override that catches `rounded-full` pills as well as `rounded-md` / `rounded-lg` / `rounded-xl` tiles. |

## How state flows

1. `BrandingDemoProvider` (in [`lib/branding-demo.tsx`](ReachStack/lib/branding-demo.tsx)) owns the state.
2. State persists to `localStorage` under the key `reachstack-branding-demo`.
3. On every change the provider:
   - writes the JSON blob to localStorage,
   - sets the relevant CSS variables on `document.documentElement`,
   - toggles the `data-corners` attribute.
4. Components read state through `useBrandingDemo()`.

No backend calls. No build step. State survives reload, but it lives only in the current browser profile.

## Files touched

- [`ReachStack/lib/branding-demo.tsx`](ReachStack/lib/branding-demo.tsx) — context, provider, localStorage glue, DOM application.
- [`ReachStack/components/branding-picker.tsx`](ReachStack/components/branding-picker.tsx) — the modal UI.
- [`ReachStack/components/top-bar.tsx`](ReachStack/components/top-bar.tsx) — mounts the trigger button.
- [`ReachStack/components/sidebar.tsx`](ReachStack/components/sidebar.tsx) — consumes logo and tenant name.
- [`ReachStack/app/layout.tsx`](ReachStack/app/layout.tsx) — preloads the alternative Google fonts and wraps the tree in `BrandingDemoProvider`.
- [`ReachStack/app/globals.css`](ReachStack/app/globals.css) — adds the `html[data-corners='square']` override.

## Logo upload constraints

- Accepted MIME types: `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`.
- 512 KB cap. The file is read via `FileReader.readAsDataURL` and stored as a base64 string. Data URLs are ~33% larger than the underlying file, so the cap keeps localStorage well clear of its ~5 MB ceiling.
- Validation errors render inline beneath the upload row.

## Extending it

- **More fonts** — add another `next/font/google` import in [`layout.tsx`](ReachStack/app/layout.tsx), expose its `variable`, append it to the `<html>` `className`, then add a new entry to `FONT_OPTIONS` in [`branding-picker.tsx`](ReachStack/components/branding-picker.tsx).
- **More surfaces consuming the logo / name** — call `useBrandingDemo()` anywhere you need it. The top-bar's "powered by" slot, the portal preview, the how-to-use modal header, and the dashboard greeting are all candidates.
- **Persisting to the backend** — replace the localStorage read/write inside `BrandingDemoProvider` with calls to `useBrandingQuery` / `useBrandingMutation` and extend `BrandingConfig` in [`backend/app/models.py`](backend/app/models.py) with `accent_color`, `font_family`, `corners`, `logo_url`, `tenant_name` fields. The existing Settings page in [`branding-view.tsx`](ReachStack/components/views/branding-view.tsx) can then be retired or repurposed.

## Known limitations

- The `* { border-radius: 0 !important }` rule used by **Square** corners is intentionally heavy-handed and will also square the colour-swatch circles inside the picker itself once toggled. Acceptable for a demo; swap to a targeted selector list if you need to keep avatars round.
- A few ambient glow / glass declarations in [`globals.css`](ReachStack/app/globals.css) bake in the original OKLCH blue and will not retint with the accent picker. Main UI surfaces (sidebar, top bar, buttons, pills, focus rings) all retint correctly.
- The Settings page at `/branding` still shows the legacy v0 Navy / Forest / Ocean swatches and is independent of this demo picker. Either delete that view or migrate it onto the same `BrandingDemoState` when productising.
