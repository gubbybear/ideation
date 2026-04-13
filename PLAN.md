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

Knowledge economy workers (developers, designers, consultants, analysts, PMs, marketers) are increasingly moving between roles — shorter tenures, contract assignments, portfolio careers. But they still operate with the tooling and mindset of a permanent employee: they rely on their employer's systems, have no portable professional infrastructure, and start from scratch every time they move.

The problem: **every job change is a cold start.** You lose your tooling, your workflows, your network context, your professional reputation evidence, and your momentum. Meanwhile, companies expect you to be productive from day one. The gap between "how work actually works now" (fluid, contract-heavy, multi-employer) and "how workers are equipped" (as if they'll be somewhere for 10 years) is growing fast.

This matters because the knowledge economy is trending toward a model where the *worker* is the unit of value, not the role. But workers don't have the operating system to match.

---

## 2. Target User

_Who specifically is this for? What's their context? What do they do today?_

**Beachhead: Software developers** — hitting the job market at scale right now. Big tech layoffs, AI reshaping roles, and a generation of devs who assumed they'd be at big tech forever now rethinking their career model. This group is:
- Highly tool-literate (will adopt good software fast)
- Already comfortable with Git, CLIs, structured data
- Feeling acute pain *right now* — not a hypothetical future
- Increasingly looking beyond big tech toward SMEs, agencies, and consulting

**The SME pivot angle:** Many devs are discovering that small/medium businesses desperately need technical capability — software setup, system integration, workflow automation, and now **agentic AI deployment** — but can't afford or attract permanent senior hires. There's a natural match: experienced devs who need work + SMEs who need technical help for defined periods. But devs don't know how to find, pitch, scope, or deliver these engagements. They've never operated as a business.

**Broader primary (later):** Mid-career knowledge workers (5-20 years experience) who've had 3+ roles and expect to keep moving. Developers, product managers, designers, consultants, data analysts, marketing strategists. Earning $80k-$250k. Mix of permanent and contract.

**What they do today:**
- LinkedIn profile as their "home base" (passive, employer-controlled narrative)
- Scattered notes across Notion/Google Docs/whatever the last employer used
- Portfolio of work trapped in Slack threads, Confluence pages, and private repos they lose access to
- Restart their "personal brand" from scratch at every move
- Manually chase references, update CVs, rebuild their network map
- (Devs specifically) Apply to hundreds of roles on job boards, hear nothing, have no way to demonstrate value beyond a CV and a GitHub profile

**Key frustration:** They're skilled and experienced, but there's no single system that helps them *operate as a professional* across employers the way a small business operates across clients. For devs eyeing contract/consulting: they have the technical skills but zero business infrastructure.

---

## 3. Core Value Proposition

_In one sentence, why would someone use this instead of what they do now?_

"Your portable professional operating system — keep your momentum, evidence, and network working for you no matter where you work next."

---

## 4. Key Features / Capabilities

_What does it need to do? Prioritize ruthlessly — what's the MVP vs. nice-to-have?_

### Must Have (MVP)
- **Professional Worklog** — Capture what you did, what you shipped, what impact it had. Private, yours forever. Structured enough to generate CVs/case studies from.
- **Skills & Evidence Tracker** — Map skills to real work evidence. "I didn't just say I know Python — here's what I built."
- **Transition Toolkit** — When you get a new role: onboarding checklist, 30-60-90 planner, stakeholder mapper, learning plan generator.
- **Portable Contacts** — Your professional network mapped by role/context, not just LinkedIn connections. Who you worked with, on what, and their strengths.

### Should Have (v1.1)
- **Contract/Rate Intelligence** — What you've earned, market benchmarks, negotiation prep.
- **Reputation Vault** — Collect peer feedback, project outcomes, quantified achievements outside of any employer's performance system.
- **Career Radar** — Pattern recognition: "You switch every 18 months. Here's what to start doing at month 12."

### Could Have (Later)
- **AI Career Copilot** — "Given your trajectory and skills, here are blind spots and adjacencies to develop."
- **Trusted Network Matching** — Warm introductions based on mutual work history (not LinkedIn's weak-tie spam).
- **Team Formation** — For contract workers assembling project teams: find former colleagues with the right skills.

---

## 5. How It Works (High-Level)

_Describe the user flow or system behavior. Diagrams welcome._

1. User signs up, creates their professional profile (imported from LinkedIn or manual)
2. Ongoing: logs work activity — projects, deliverables, skills used, people worked with
3. AI helps structure and tag entries, suggests impact framing ("you reduced X by Y%")
4. When approaching a transition: activate Transition Toolkit → generates updated CV, prep materials, network reactivation suggestions
5. In new role: onboarding accelerator uses past patterns to create a 30-60-90 plan
6. Continuous: skills map evolves, evidence accumulates, network stays warm

---

## 7. Business Model / Monetization

_How does this make money? Or what's the strategic value?_

- **Free tier:** Worklog (limited entries), basic skills tracker, CV export
- **Pro ($14.99/mo):** Unlimited worklog, transition toolkit, AI-assisted framing, reputation vault
- **Career+ ($29.99/mo):** Career radar, contract intelligence, network matching, AI copilot
- **Potential B2B angle:** Companies pay to *onboard* new hires faster using the worker's existing profile (with consent). Recruitment firms pay for verified skill/evidence data.

---

## 8. Competitive Landscape

_What exists already? Why is this different or better?_

| Competitor / Alternative | What they do well | Where they fall short |
|--------------------------|-------------------|----------------------|
| LinkedIn | Ubiquitous, network effects, recruiter access | Employer-controlled narrative, shallow skills, no private worklog, not a *tool* for the worker |
| Notion / personal wikis | Flexible, private | No structure for career management, no intelligence, starts blank every time |
| CV builders (Novoresume etc) | Good templates | Backward-looking, no ongoing capture, no career management |
| Portfolio sites (Behance, GitHub) | Evidence of work | Only for specific roles, no private layer, no transition tooling |
| Career coaching services | Personalized advice | Expensive, not continuous, no tooling layer — *we know this industry and can productize the best of it* |
| Contractor platforms (Toptal, Upwork) | Marketplace, rate data | Only for freelancers, not for perm/contract hybrid workers |

**Our angle:** Nobody owns the *worker's operating system* layer. LinkedIn is the social layer. Job boards are the search layer. We're the **operational layer** — the private professional infrastructure that makes each career move compound rather than reset.

---

## 8b. Founding Team Advantage

_What domain expertise gives us an unfair edge?_

The founding team brings pre-existing expertise in **three areas** that map directly onto the product:

1. **Resume writing & career services** — Deep understanding of how professionals present themselves, what hiring managers look for, how to frame experience for maximum impact. This isn't theoretical; this is practitioner knowledge of the CV/career coaching industry. Directly informs: CV auto-generation, skills-to-evidence mapping, AI-assisted impact framing, transition toolkit, and any career advisory features. We know what *good* looks like because we've done it professionally.

2. **Working in large tech** — First-hand experience of the big-tech environment that our beachhead users (displaced developers) are leaving. We understand the culture, the performance review cycle, the skills that are valued and undervalued, and crucially, what it feels like to transition out. This means we can build with genuine empathy and practical accuracy — not guessing at the user's pain.

3. **Career services industry knowledge** — Understanding of the competitive landscape from the *service provider* side. We know what career coaches charge, what clients actually need vs. what they ask for, and where existing services fail. This means we can productize what currently requires expensive 1-on-1 coaching — turning expert knowledge into software.

**Why this matters:** Most career-tech products are built by technologists guessing at career needs. We're career professionals building technology. The combination of resume/career domain expertise + tech literacy + understanding of the big-tech developer audience puts us in a unique position to build something that's both technically capable and professionally credible.

---

## 9. Open Questions

_Move resolved questions to DECISIONS.md with the answer._

- [ ] Is this one product or a suite of tools? "Professional OS" could be too broad.
- [ ] Do we start with the transition moment (acute pain) or the ongoing worklog (habit)?
- [ ] Contract workers vs permanent workers — same product or different entry points?
- [ ] How do we get people to log work *before* they need it? The motivation gap.
- [ ] B2C first or B2B first? Workers buy it, or companies provide it?

---

## 10. Next Actions

_What's the next concrete thing each person should work on?_

| Who | Action | Status |
|-----|--------|--------|
| Fi | React to the problem statement and target user — does this match your thinking? | Not started |
| Fi | Add competitive landscape entries we're missing | Not started |
| Both | Discuss: one product or a suite? What's the MVP wedge? | Not started |
| Fi | Review all ideas in IDEAS.md — expand, riff, add new ones (divergence step) | Not started |

---

## Session Log

_Brief notes after each working session so the other person knows what happened._

| Date | Who | What happened | Key outputs |
|------|-----|---------------|-------------|
| 12-04-26 | Session 1 | Initial ideation — problem framing, target user, features, business model, competitive landscape | PLAN sections 1-5,7-8 filled, IDEAS seeded, MINDMAP created, QUESTIONS + ASSUMPTIONS populated |
| 12-04-26 | Session 2 | Added founding team domain expertise — resume writing, career services, big tech experience | PLAN §8b added, 3 new IDEAS, 4 new ASSUMPTIONS, 4 new QUESTIONS, MINDMAP "Founder Domain Expertise" branch |

---

> **Provocation for next session:** The biggest risk might be that this is a "vitamin not a painkiller." People don't feel career management pain until they're *in transition* — and then it's too late to have been logging work. How do we solve the cold-start motivation problem? Is the transition toolkit the real MVP wedge, and the worklog is something we hook people on *after*?
