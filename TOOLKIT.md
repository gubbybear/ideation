# Collaboration Toolkit

> Copy any template below into a new file (or a section of an existing file) when you need it. Fill in with Claude, push for your partner to extend.

---

## 1. Mindmap

Use indented Markdown for quick capture, or Mermaid for visual rendering.

### Markdown Style (easy to diff)

```
# [Central Topic]

## Branch A
- Sub-idea
  - Detail
  - Detail
- Sub-idea

## Branch B
- Sub-idea
  - Detail

## Branch C — added by [Name]
- Sub-idea
```

### Mermaid Style (renders in GitHub)

````mermaid
mindmap
  root((Central Topic))
    Branch A
      Sub-idea 1
      Sub-idea 2
    Branch B
      Sub-idea 3
        Detail
    Branch C
      Sub-idea 4
````

**How to use async:** One person creates the initial map. The other adds branches, re-parents nodes, or marks branches with ❌ to challenge them.

---

## 2. Assumption Tracker

Surface hidden beliefs early. Challenge them explicitly.

| # | Assumption | Confidence (H/M/L) | Evidence | Challenged by | Verdict |
|---|-----------|---------------------|----------|---------------|---------|
| 1 | _e.g. Users will pay for this_ | M | _None yet_ | | |
| 2 | | | | | |
| 3 | | | | | |

**How to use async:**
- Add assumptions you're making (even obvious ones)
- Partner reviews and fills in "Challenged by" with a counter-argument or question
- Converge on a Verdict: `Valid`, `Disproven`, `Needs testing`

---

## 3. Lean Canvas

One-page business model. Fill in what you can, leave blanks for your partner.

| Block | Notes |
|-------|-------|
| **Problem** (top 3) | 1. <br> 2. <br> 3. |
| **Customer Segments** | |
| **Unique Value Proposition** | |
| **Solution** | |
| **Channels** | |
| **Revenue Streams** | |
| **Cost Structure** | |
| **Key Metrics** | |
| **Unfair Advantage** | |

**How to use async:** First pass fills what you know. Partner fills gaps and challenges entries with inline comments like `<!-- [Name]: Is this really our UVP? -->`.

---

## 4. Priority Ballot

Score features independently, then compare. Reveals alignment (and disagreements worth discussing).

| Feature | [Partner A] Impact (1-5) | [Partner A] Effort (1-5) | [Partner B] Impact (1-5) | [Partner B] Effort (1-5) | Avg Impact | Avg Effort | Score (I/E) |
|---------|--------------------------|--------------------------|--------------------------|--------------------------|------------|------------|-------------|
| _Feature 1_ | | | | | | | |
| _Feature 2_ | | | | | | | |
| _Feature 3_ | | | | | | | |

**How to use async:**
1. One person lists the features and fills their scores
2. Other person fills their columns **without looking at partner's scores first** (honor system — or use `git log` to verify)
3. Third pass: compute averages, discuss any score where you differ by 2+

---

## 5. Red Team Prompts

Structured adversarial thinking. One person writes the attack, the other must defend or concede.

### Round: [Topic / Date]

**Attacker: [Name]**

> **Challenge 1:** _Why will this fail?_
> 

**Defender: [Name]**

> **Response 1:**
> 

---

> **Challenge 2:** _What's the weakest part of this plan?_
> 

> **Response 2:**
> 

---

> **Challenge 3:** _What happens when [competitor/market/technology] does X?_
> 

> **Response 3:**
> 

**Verdict:** _What did we learn? What changed?_


---

## 6. User Journey Map

Walk through the experience step-by-step. Partner pokes holes.

### Journey: [User Persona] — [Goal]

| Step | User Action | System Response | User Feeling | Pain Points / Questions |
|------|-------------|-----------------|--------------|------------------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

### Mermaid Sequence Diagram (optional)

````mermaid
sequenceDiagram
    actor User
    participant App
    participant Backend

    User->>App: Does something
    App->>Backend: Sends request
    Backend-->>App: Returns result
    App-->>User: Shows outcome
````

**How to use async:** One person drafts the happy path. Partner adds pain points, edge cases, and alternate paths.

---

## 7. Decision Matrix

For when you're stuck between options.

### Decision: [What are we deciding?]

| Criteria (weight) | Option A | Option B | Option C |
|--------------------|----------|----------|----------|
| _Criteria 1_ (3) | Score /5 | Score /5 | Score /5 |
| _Criteria 2_ (2) | Score /5 | Score /5 | Score /5 |
| _Criteria 3_ (1) | Score /5 | Score /5 | Score /5 |
| **Weighted Total** | | | |

**How to use async:** One person defines criteria + weights. Other person scores independently. Compare and discuss.

---

## Quick Reference: Asking Claude to Help

Useful prompts for working with these templates:

- *"Read PLAN.md and QUESTIONS.md, then fill in the Assumption Tracker with assumptions we seem to be making"*
- *"Red-team section 3 of PLAN.md — give me 5 hard challenges"*
- *"Score the features in the Priority Ballot based on what you know from the repo"*
- *"Read [partner]'s mindmap additions and suggest 3 extensions or counter-branches"*
- *"Walk through the user journey and find the 3 weakest steps"*
