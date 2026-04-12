# App/Tool Ideation Plan

> **Async collaboration space.** Each contributor works with Claude on their own machine, commits thinking to this repo, and builds on what the other has pushed. Pull before you start. Push when you finish a session.

---

## How This Repo Works

1. **Pull first.** Always `git pull` before starting a session so you have the latest thinking.
2. **Work with Claude.** Use Claude to explore, challenge, and extend ideas.
3. **Commit with intent.** Write clear commit messages describing what you added or changed and why.
4. **Push when done.** Push at the end of every session so your partner can build on it next.
5. **Leave provocations.** End sessions with open questions, challenges, or "what if" prompts in the relevant section so the other person has a jumping-off point.

### File Conventions

| File | Purpose |
|------|---------|
| `PLAN.md` | This file. The living plan — problem, solution, decisions, architecture. |
| `IDEAS.md` | Raw brainstorming. Unfiltered. Tag entries with your name and date. |
| `DECISIONS.md` | Decisions made and the reasoning behind them. Append-only log. |
| `QUESTIONS.md` | Open questions that need the other person's input. Mark resolved when done. |
| `RISKS.md` | Risks, concerns, and things that could kill the idea. |

---

## 1. Problem Statement

_What problem are we solving? Who has it? Why does it matter?_

<!-- CONTRIBUTOR: Write your version. Don't delete the other person's — add yours below and we'll converge. -->

**Alex — 2026-04-10:**
Small business owners waste 5-10 hours/week manually reconciling invoices, receipts, and bank statements. Existing accounting tools are either too complex (QuickBooks) or too simple (spreadsheets). There's a gap for an AI-powered tool that just handles the messy middle — matching transactions to documents automatically.

**Jordan — 2026-04-11:**
Agree on the pain point but I'd frame it broader: freelancers and micro-businesses (1-5 people) drown in financial admin. It's not just reconciliation — it's chasing receipts, categorizing expenses, and prepping for tax time. The real problem is fragmented financial data across email, photos, bank feeds, and paper.

---

## 2. Target User

_Who specifically is this for? What's their context? What do they do today?_

**Alex — 2026-04-10:**
Primary: Solo freelancers and consultants earning £30k-£150k/year. They use a mix of bank apps, spreadsheets, and shoeboxes of receipts. They dread tax season. They're tech-comfortable but not accountants.

**Jordan — 2026-04-11:**
+1. Secondary: Small agency owners (2-5 people) who've outgrown spreadsheets but find Xero/QuickBooks overkill. They want something that "just works" without learning accounting terminology.

---

## 3. Core Value Proposition

_In one sentence, why would someone use this instead of what they do now?_

**Alex — 2026-04-10:**
"Take a photo of any receipt or forward any invoice, and we'll match it to your bank transactions automatically — tax time sorted in minutes, not days."

**Jordan — 2026-04-11:**
Love it. Maybe tighter: "Never manually categorize an expense again — we read your receipts, match your transactions, and keep you tax-ready year-round."

---

## 4. Key Features / Capabilities

_What does it need to do? Prioritize ruthlessly — what's the MVP vs. nice-to-have?_

### Must Have (MVP)
- Receipt capture (photo + email forwarding)
- Bank feed integration (Open Banking API)
- AI-powered transaction matching (receipt ↔ bank transaction)
- Expense categorization (auto + manual override)
- Tax summary dashboard
- Mobile app (iOS + Android)

### Should Have (v1.1)
- Multi-currency support
- Recurring expense detection
- Accountant sharing / export
- VAT calculation

### Could Have (Later)
- Invoice creation and sending
- Cash flow forecasting
- Integration with Xero/QuickBooks for larger businesses
- Team expense management

---

## 5. How It Works (High-Level)

_Describe the user flow or system behavior. Diagrams welcome — use Mermaid or ASCII._

1. User connects bank account via Open Banking
2. User snaps receipt or forwards invoice email to receipts@app.com
3. AI extracts vendor, amount, date, category from document
4. System matches document to bank transaction (fuzzy matching on amount + date)
5. User reviews matches in a simple feed (swipe to confirm/reject)
6. Dashboard shows running totals by category, tax quarter, etc.

---

## 6. Technical Direction

_Languages, frameworks, infrastructure, APIs, constraints._

- **Frontend:** React Native (cross-platform mobile)
- **Backend:** Python/FastAPI on AWS Lambda
- **AI/ML:** GPT-4o for receipt parsing, custom matching model for transaction reconciliation
- **Banking:** TrueLayer or Plaid for Open Banking
- **Storage:** S3 for documents, PostgreSQL for structured data
- **Auth:** Clerk or Auth0

---

## 7. Business Model / Monetization

_How does this make money? Or what's the strategic value?_

- Freemium: Free for up to 50 transactions/month
- Pro: £9.99/month — unlimited transactions, multi-currency, accountant sharing
- Business: £24.99/month — team features, API access, priority support

---

## 8. Competitive Landscape

_What exists already? Why is this different or better?_

| Competitor / Alternative | What they do well | Where they fall short |
|--------------------------|-------------------|----------------------|
| QuickBooks Self-Employed | Strong brand, mileage tracking | Clunky UI, US-focused, expensive |
| Xero | Great for accountants, robust API | Overkill for freelancers, steep learning curve |
| Dext (Receipt Bank) | Receipt capture is solid | No bank matching, expensive, feels dated |
| Spreadsheets | Free, flexible | Manual everything, error-prone, no insights |
| FreeAgent | UK-focused, decent UX | Limited AI, feels like it hasn't evolved |

---

## 9. Open Questions

_Move resolved questions to DECISIONS.md with the answer._

- [ ] Do we build mobile-first or web-first?
- [ ] Which Open Banking provider — TrueLayer vs Plaid vs GoCardless?
- [ ] How accurate does AI matching need to be before users trust it?
- [x] UK-only at launch or multi-country? → UK-only (see D1)

---

## 10. Next Actions

_What's the next concrete thing each person should work on?_

| Who | Action | Status |
|-----|--------|--------|
| Alex | Research Open Banking API costs and limits | In progress |
| Jordan | Sketch mobile app wireframes for receipt capture flow | Not started |
| Alex | Build prototype receipt parser with GPT-4o | Not started |
| Jordan | Interview 5 freelancers about current pain points | In progress |

---

## Session Log

_Brief notes after each working session so the other person knows what happened._

| Date | Who | What happened | Key outputs |
|------|-----|---------------|-------------|
| 2026-04-10 | Alex | Initial brainstorm — problem, users, features | PLAN.md sections 1-4 filled |
| 2026-04-11 | Jordan | Added counterpoints, expanded user segments, competitive research | Sections 2, 3, 8 updated |
| 2026-04-12 | Alex | Technical direction, business model, started Open Banking research | Sections 6, 7 filled |

---

> **Provocation for next session:** _Leave a question or challenge here for your partner to pick up._
> 
> What if we skip the mobile app entirely and just do a WhatsApp bot? Users already text photos to people — what if they just texted receipts to us? Way cheaper to build, and the interaction model might be more natural than yet another app.
