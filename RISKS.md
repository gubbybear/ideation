# Risks & Concerns

> Things that could kill the idea, slow us down, or blow up later. Be honest. The other person should respond with mitigations or agree it's a real problem.

---

## Format

```
### R[number] — [Short title] — [Name] — [Date]

**Risk:** What could go wrong.

**Likelihood:** High / Medium / Low
**Impact:** High / Medium / Low

**Mitigation:** How we could reduce or avoid it.

**Partner response:** [Name] — [Date]
```

---

<!-- Add risks below this line -->

### R1 — Work evidence IP compliance — Gub — 13-04-26

**Risk:** The core "work evidence" / worklog feature encourages users to document what they do at work. Most employment contracts include IP assignment clauses (employer owns all work product), NDAs, and confidentiality provisions. Users could unknowingly breach their contracts by logging project details, architecture decisions, client names, or proprietary methods. This exposes *them* to legal action and potentially exposes *us* to facilitating contract breach at scale.

**Likelihood:** High
**Impact:** High

**Mitigation:** Several possible approaches, none fully satisfying yet:
1. **Frame as skills journal, not work log** — "I improved at system design" not "I designed a microservices architecture for [Client]'s payment system"
2. **AI guardrails** — detect and flag specific company names, project details, code snippets, client info before saving
3. **Legal disclaimer / education** — onboarding that explains what's safe to log vs. not
4. **Time-delayed publishing** — log now, but only surface for CV/portfolio use after a cooling-off period (e.g. 6-12 months post-employment)
5. **Pivot the framing entirely** — maybe "work evidence" is the wrong metaphor and we should lead with "professional development journal" or "skills portfolio"

**Partner response:**
