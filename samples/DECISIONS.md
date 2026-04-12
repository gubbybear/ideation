# Decisions Log

> Append-only. Once a decision is made, record it here with the reasoning. Don't edit past entries — if a decision is reversed, add a new entry referencing the old one.

---

## Format

```
### D[number] — [Short title] — [Date]

**Decision:** What we decided.

**Context:** Why this came up.

**Options considered:**
1. Option A — pros / cons
2. Option B — pros / cons

**Reasoning:** Why we chose this.

**Decided by:** Both / [Name]
```

---

<!-- Add decisions below this line -->

### D1 — UK-only at launch — 2026-04-11

**Decision:** Launch in UK only. No multi-country support in MVP.

**Context:** Open Banking APIs differ by country. Tax rules differ. Receipts in different languages.

**Options considered:**
1. UK-only — simpler, we know the market, HMRC rules are well-documented
2. UK + US — bigger market but doubles complexity (different banking APIs, IRS vs HMRC)
3. EU-wide — PSD2 gives us Open Banking but each country has different tax rules

**Reasoning:** We're both UK-based, we understand HMRC self-assessment, and TrueLayer has excellent UK coverage. Expanding later is easier than trying to be global from day one.

**Decided by:** Both

### D2 — React Native for mobile — 2026-04-12

**Decision:** Use React Native, not Flutter or native iOS/Android.

**Context:** Need cross-platform mobile. Small team, can't afford to maintain two codebases.

**Options considered:**
1. React Native — large ecosystem, good camera APIs, Alex has experience
2. Flutter — fast growing but smaller ecosystem for financial/banking libraries
3. Native (Swift + Kotlin) — best UX but 2x development time

**Reasoning:** Alex has 2 years of RN experience. Camera and image handling are well-supported. Banking SDKs (TrueLayer) have RN bindings. Can always go native later if performance demands it.

**Decided by:** Both
