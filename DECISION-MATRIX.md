# Decision Matrix

> For when you're stuck between options. One person defines criteria + weights. Other person scores independently. Compare and discuss.
>
> **Weight:** How important is this criteria? (1 = nice-to-have, 3 = critical)
> **Score:** How well does this option satisfy the criteria? (1 = poorly, 5 = perfectly)
> **Weighted Total:** Sum of (weight x score) for each option. Highest wins.

---

<!--
## Decision [N]: [What are we deciding?]

**Context:** [Why does this decision matter?]

**Options:**
- **Option A:** [description]
- **Option B:** [description]

| Criteria | Weight | Option A | Option B |
|----------|--------|----------|----------|
| | | | |
| **Weighted Total** | | **?** | **?** |

**Result:** [Which option won and why]
-->

---

## Decision 1: Where should we start first?

**Context:** The idea space currently includes a broad "portable professional OS", transition tooling, work evidence capture, developer-to-consultant support, agentic AI deployment for SMEs, professional networking, and eventual team/marketplace infrastructure. The immediate business decision is not "what is the whole vision?" but "what is the first wedge we can test with real users, real pain, and the least platform complexity?"

**Decision principle:** Start with the smallest painful job that:
- users need right now, not someday
- the founding team is unusually qualified to solve
- can be delivered manually before it is automated
- avoids two-sided marketplace risk
- reduces the IP/privacy risk around employer-owned work evidence
- teaches us which larger product direction is worth building

### Options

- **Option A: Career Compound / ongoing worklog** - private work history, skills evidence, professional memory, and career compounding over time.
- **Option B: 60-Day Edge / transition toolkit** - offboarding capture, CV refresh, positioning, 30-60-90 plan, network reactivation, and onboarding support around a job change.
- **Option C: Career Copy / expert CV engine** - AI-assisted resume, LinkedIn, case study, and career narrative generation using real career services methodology.
- **Option D: Dev-to-Consultant accelerator** - help experienced developers package themselves for consulting or SME project work, including services, pricing, proposals, and outreach.
- **Option E: Agentic AI Deployer playbook** - a specific consulting methodology for developers helping SMEs adopt AI agents and workflow automation.
- **Option F: ReachStack / network and team infrastructure** - living professional graph, auto-teaming, contracting, revenue splits, and opportunity matching.

### Weighted Score

| Criteria | Weight | A: Worklog | B: Transition | C: Career Copy | D: Dev-to-Consultant | E: AI Deployer | F: ReachStack |
|----------|--------|------------|---------------|----------------|----------------------|----------------|---------------|
| Acute pain / purchase urgency | 3 | 2 | 5 | 4 | 4 | 3 | 3 |
| Founder unfair advantage | 3 | 3 | 5 | 5 | 4 | 3 | 3 |
| Speed to test manually | 3 | 3 | 5 | 5 | 4 | 3 | 1 |
| Low legal/privacy/platform risk | 2 | 1 | 4 | 4 | 4 | 4 | 2 |
| Clear ICP and acquisition path | 3 | 3 | 4 | 5 | 4 | 3 | 2 |
| Willingness to pay now | 2 | 2 | 4 | 4 | 5 | 5 | 3 |
| Path to the larger OS vision | 2 | 5 | 4 | 3 | 5 | 4 | 5 |
| Differentiation | 2 | 3 | 3 | 3 | 4 | 4 | 5 |
| **Weighted Total** | **20** | **55** | **87** | **85** | **84** | **69** | **56** |

**Result:** Start with **Option B: 60-Day Edge / transition toolkit**, but package the first MVP as a hybrid of **B + C + a narrow slice of D**:

> **A transition-first career and consulting-positioning product for experienced software developers.**

This is the strongest first wedge because it combines urgent pain, founder career-services expertise, a clear beachhead user, and a fast concierge MVP path. It also sidesteps the hardest early risks: no daily worklog habit, no marketplace liquidity problem, no need for deep integrations, and less temptation for users to log confidential employer-owned details.

---

## Recommended First Offer

**Working name:** ReachCore Transition Pack, 60-Day Edge, or Big Tech Translator.

**Initial customer:** Mid-to-senior software developers who are unemployed, recently laid off, actively job hunting, or considering a move from big tech/permanent employment into consulting or SME project work.

**Job to be done:** "Help me turn my messy career history into a clear, credible next chapter before I lose momentum."

**Core promise:** In a few days, the user gets a practical transition pack they can use immediately:
- a sharpened career narrative
- an evidence-safe achievement bank
- a strong CV and LinkedIn rewrite
- 3-5 plausible target paths, including consulting/service-package options
- outreach scripts for recruiters, ex-colleagues, and SME prospects
- a simple 30-day transition plan

**Why this first:** It sells the immediate output, not the long-term habit. The user does not need to believe in a "Professional OS" yet. They only need to believe that their current career materials are not working and that expert-guided reframing would help.

---

## MVP Scope

### Concierge MVP

Deliver this manually to 5-10 users before building much software.

**Inputs:**
- existing CV or LinkedIn profile
- 30-45 minute interview
- optional work-history notes
- target direction: job search, consulting, SME work, or uncertain

**Outputs:**
- rewritten positioning statement
- updated CV or CV section rewrite
- achievement bank framed without confidential employer specifics
- target role/service map
- outreach message pack
- recommended next 10 actions

**Tools needed now:**
- intake form
- repeatable interview script
- prompt library / career-writing rubric
- output template
- manual delivery workflow

**Tools not needed yet:**
- full SaaS app
- passive integrations with Slack/Jira/GitHub
- marketplace
- network graph
- auto-contracting
- AI-agent deployment platform

---

## What This Tests

| Risk / Assumption | Test |
|-------------------|------|
| Devs feel transition pain strongly enough to act | Can we book 10 interviews from founder network / LinkedIn / communities? |
| Users will pay for better career framing | Can we sell 3 paid beta packs at AUD $149-$499? |
| Founder expertise beats generic AI CV tools | Ask users to compare our output against their own GPT attempt or existing CV. |
| Consulting is a real adjacent path | How many users choose "service package / SME consulting" as a serious option? |
| Evidence can be captured safely | Can we produce strong achievements without employer-confidential details? |
| The workflow can become software | Track delivery time and identify repeated steps worth automating. |

---

## Suggested 6-Week Path

### Week 1: Define the wedge

- Pick the first ICP: "mid/senior software developers in transition" rather than all knowledge workers.
- Name the beta offer.
- Write a one-page landing pitch.
- Draft the intake form and interview script.
- Define what "done" means for one transition pack.

### Week 2: Customer discovery

- Speak with 10 developers in transition.
- Ask what they are doing now, what feels broken, what they have paid for, and whether consulting is attractive or scary.
- Run a fake-door test with three offers: CV rewrite, transition plan, dev-to-consultant package.

### Weeks 3-4: Concierge delivery

- Deliver 5 packs manually.
- Time each step.
- Capture before/after examples.
- Ask for payment, testimonial, referral, or a clear "no".
- Track which output users value most.

### Week 5: Productize the repeated parts

- Convert the best-performing outputs into templates and prompts.
- Decide whether the first product is a guided career rewrite, a transition operating kit, or a consulting offer builder.
- Draft the first lightweight app flow only after the manual workflow is repeatable.

### Week 6: Decide the next build

- If users mostly want jobs: build ReachCore around transition/CV/work evidence.
- If users mostly want consulting: build the Dev-to-Consultant accelerator.
- If SME demand appears first: test the Agentic AI Deployer playbook with one real SME project.
- If willingness to pay is weak: keep the product as lead-gen for premium career services and rethink SaaS.

---

## What Not To Start With

**Do not start with the ongoing worklog.** It is strategically important, but it depends on habit formation and trust before the user has received value. It also has the biggest IP/compliance ambiguity.

**Do not start with ReachStack / auto-teaming.** It may be the powerful long-term product, but it needs a supply base, demand base, trust layer, contracting layer, and matching data. Too many unknowns at once.

**Do not start with a marketplace.** First prove that one side has a painful, repeatable need and that the offer can be packaged.

**Do not start with agentic AI deployment as the only wedge.** It is promising, but likely too early and demand may require education. Treat it as one consulting path inside the Dev-to-Consultant package until validated.

---

## First Business Hypothesis

Experienced developers in transition will pay for expert-guided career reframing if it produces concrete assets quickly: better CV language, clearer positioning, safer evidence framing, and credible next-step options. A meaningful subset will also want help translating their skills into independent consulting offers. That subset becomes the bridge from ReachCore into ReachStack.
