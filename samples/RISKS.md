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

### R1 — Open Banking API reliability — Alex — 2026-04-10

**Risk:** Open Banking providers could have downtime, rate limits, or change their APIs. If we can't pull bank data, the core product breaks.

**Likelihood:** Medium
**Impact:** High

**Mitigation:** Abstract the banking layer so we can swap providers. Support manual CSV upload as fallback. Cache transactions locally.

**Partner response:** Jordan — 2026-04-11: Agree this is real. TrueLayer had a 4-hour outage in March. We should definitely build the CSV fallback into MVP, not treat it as a nice-to-have.

### R2 — AI parsing accuracy — Jordan — 2026-04-11

**Risk:** GPT-4o might misread receipts (especially handwritten ones, faded thermal paper, foreign language receipts). Users lose trust quickly if matches are wrong.

**Likelihood:** High
**Impact:** High

**Mitigation:** Always show confidence scores. Never auto-confirm below 85% confidence. Let users correct and use corrections to improve matching over time.

**Partner response:** Alex — 2026-04-12: Good call. I tested GPT-4o on 20 receipts — got 85% accuracy on amount extraction but only 70% on vendor name. We need a validation layer.

### R3 — Regulatory / FCA — Alex — 2026-04-12

**Risk:** Accessing bank data might require FCA authorization as an Account Information Service Provider (AISP). The process takes 6-12 months and costs £5k-£15k.

**Likelihood:** High
**Impact:** High

**Mitigation:** Use TrueLayer's AISP license (they're already authorized). We operate as their agent. Need to verify this model works legally.

**Partner response:**

### R4 — Crowded market — Jordan — 2026-04-11

**Risk:** Dext, FreeAgent, Coconut, and others already exist. Why would anyone switch to us?

**Likelihood:** Medium
**Impact:** Medium

**Mitigation:** Our differentiator is the AI matching — no one else does automatic receipt-to-transaction matching well. If we nail that one thing, we have a wedge.

**Partner response:** Alex — 2026-04-12: Agree, but we need to validate this. Let's ask in the user interviews: "If your receipts automatically matched to your bank transactions, how much time would that save you?"

