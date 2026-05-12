# Reach

> **Productized AI capability that exiting big-tech engineers deploy at SMBs.**

Reach is a two-layer product. The **STACK** is a set of proprietary, vertical-specific AI components — pre-built, pre-tuned, deployment-ready. The **CORE** is a PWA that technical specialists use to scope, sell, deploy, and operate STACK installations at their SMB clients.

The consultant brings discovery, trust, configuration, and change management. Reach brings the implementation IP. Together they ship working AI capability at SMBs faster, more reliably, and with a defensible quality bar than either side could alone.

---

## Why this exists

Two converging realities:

- A wave of capable technical specialists are leaving, or have left, big tech and want an independent practice.
- SMBs increasingly know they need AI but cannot tell who to trust, what to buy, or how to make it real.

Generic templates do not bridge that gap. Bespoke builds are too slow, too risky, and too uneven. Reach makes deployable AI capability productized, branded, and consultant-deliverable. Each engagement becomes a reliable repeat motion.

---

## The two-layer architecture

### STACK

The STACK is the part of Reach that runs the actual AI work at the SMB. It is the team's core IP and where defensibility lives.

Each vertical STACK ships with:

| Component | Purpose |
|-----------|---------|
| Connector pack | Pre-built integrations to the SMB tools the vertical uses — CRMs, helpdesks, accounting, storage, comms. |
| Pre-tuned components | LLM agents, classifiers, retrievers, and generators tuned for the vertical's data and language. |
| Configuration surface | Vocabulary, taxonomies, rules, and escalation paths the consultant adapts to the specific client. |
| Evaluations | Vertical-specific quality checks the consultant runs before go-live and on a recurring basis. |
| Guardrails | Redaction, PII handling, residency controls, action-permission boundaries. |
| Observability | Metrics, logs, audit trail, drift detection — visible to consultant and SMB. |
| Branded end-user UI | White-label widgets and portals the SMB's end users actually interact with. |
| Upgrade path | Versioned components the consultant can roll forward without rebuilding. |

The STACK is licensed per active deployment, with usage metering on top.

### CORE

The CORE is the PWA the consultant lives in. It is both the commercial wrapper and the deployment console.

| Module | Purpose |
|--------|---------|
| Capability Profile | Captures consultant skills, vertical preferences, stack experience. |
| Sprint Selector | Recommends the right STACK and sprint shape from profile and target buyer. |
| SMB Diagnostic | STACK-powered intake the consultant sends to a prospect; returns a readiness picture. |
| Scope & Quote | Generates scope and pricing anchored to a specific STACK deployment. |
| Proposal & SOW | Client-ready outputs that reflect the actual STACK being deployed. |
| Deployment Console | Configures the STACK for this client — mappings, vocabulary, rules, evals. |
| Delivery Checklist | Steps, milestones, approval gates, evidence capture for handover. |
| Live Monitoring | Post-deployment health, usage, cost, and quality dashboards. |
| Retainer Builder | Suggests support and optimisation offers grounded in actual deployment metrics. |
| Case Study Generator | Turns deployment outcomes into non-confidential proof. |

CORE access is a low monthly subscription. The consultant pays this whether or not a deployment is currently active.

---

## Build approach

STACKs are assembled from open-source architectures wherever production-grade options exist — orchestration frameworks, vector and graph stores, evaluation harnesses, observability, OCR / document AI, and self-hosted inference for cost-sensitive workloads. Frontier proprietary models are used selectively, where accuracy-critical reasoning warrants the cost.

This keeps unit economics workable for SMB deployments and lets the team keep pace with the OSS ecosystem as it evolves. The defensibility layers — ontologies, evals, connectors, deployment data, branded UX, and compliance posture — sit above the OSS substrate. That is where Reach's IP accumulates.

---

## What the consultant actually does

The STACK compresses the build. The consultant still owns the engagement.

The consultant owns the parts that do not productize:

- **Discovery** — understanding the messy reality of the specific SMB.
- **Trust** — the face-to-face relationship that unlocks the buying decision.
- **Configuration** — translating the SMB's vocabulary, rules, and edge cases into STACK setup.
- **Integration** — connecting the STACK to the SMB's specific stack and existing processes.
- **Change management** — staff training, adoption, escalation handling.
- **Iteration** — tuning the deployment from real user feedback.
- **Account ownership** — the long-term relationship and the retainer.

Reach deliberately does not automate these. Productizing the build creates leverage; the relationship has to stay human-owned.

---

## Initial verticals

**Launch market:** Australia. Connectors, compliance posture, and ecosystem fit are scoped to the AU SMB market first; the architecture supports geographic expansion as deployments mature.

Three wedges at launch, deliberately scoped.

### 1. Document Intake STACK

**Buyers:** accounting firms, legal firms, insurance brokers, migration agents, health admin teams.

**Outcome sold:** reduce the time staff spend chasing, reading, classifying, and summarising client documents.

**STACK includes:**

- Connectors for practice-management tools used by Australian SMBs — Xero, MYOB, FYI Docs, Karbon (accounting); LEAP, Smokeball, ActionStep (legal); Migration Manager (migration) — plus standard cloud storage.
- Document AI for classification, extraction, and redaction.
- Domain ontology and graph store — typed entities (clients, matters, parties, regulations, prior decisions) and the relationships between them.
- GraphRAG retrieval — multi-hop reasoning across documents, parties, references, and prior matters, with auditable retrieval paths for review.
- Missing-information detector — ontology-driven completeness checks generate the client follow-up list.
- Vertical taxonomies — tax categories, conveyancing files, claim types, visa subclasses — encoded in the ontology and reused across clients.
- Compliance-aware audit trail.
- Branded client upload portal.

**Why first:** the outcome is visible within days, the buyer has clear and acknowledged pain, and the regulatory wrapper rewards a productized approach over bespoke builds. The vertical is naturally graph-shaped — clients, matters, parties, references, regulations — so the team's ontology and GraphRAG experience compounds with every deployment.

### 2. Customer Support STACK

**Buyers:** ecommerce brands, SaaS companies, services businesses.

**Outcome sold:** reduce repetitive support load and improve first-response speed.

**STACK includes:**

- Connectors for common helpdesks and storefronts.
- RAG over the SMB's knowledge base, FAQs, and past tickets.
- Optional product and policy ontology — graph-aware retrieval for SMBs with structured catalogs, entitlement rules, troubleshooting trees, or multi-product compatibility constraints.
- Draft-response generator with tone configuration.
- Triage classifier and escalation rules.
- Human approval queue and review surface.
- Quality and CSAT metrics.

**Why first:** every SMB recognizes the pain, the volume justifies usage-based pricing, and the deployment can be staged — drafts only, then autonomous reply for low-risk categories.

### 3. HR STACK

**Buyers:** SMBs with 20–500 employees without dedicated HR leadership — professional services firms, agencies, growing tech companies, multi-site operators (clinics, retail, hospitality, trades).

**Outcome sold:** reduce HR admin load and answer routine employee, compliance, and onboarding questions without consuming senior leadership time.

**STACK includes:**

- Connectors for Australian SMB HR, payroll, workforce, and ATS systems — Employment Hero, KeyPay / Xero Payroll, MYOB, Deputy, Tanda, ELMO, JobAdder, and similar.
- Domain ontology and graph store — employees, roles, departments, managers, contracts, awards and EBA classifications, leave entitlements, training records, locations, policy scopes.
- GraphRAG retrieval — entitlement and policy reasoning across role, location, contract, award, and policy hierarchy, with auditable retrieval paths.
- Policy and handbook assistant — employee Q&A surface with cited answers and escalation paths.
- Onboarding document workflow — collection, classification, missing-info follow-up, signature and access-provisioning tracking.
- Compliance and renewal tracking — training records, contract anniversaries, certifications, state-based obligations.
- Recruiting support layer — JD drafting and CV summarisation against the role ontology.
- Australian compliance posture — Fair Work Act, Modern Awards interpretation, Single Touch Payroll, Superannuation Guarantee, state long-service leave, Privacy Act / APP-aligned PII handling, and audit trail.
- Branded employee and manager portals.

**Why first:** the team's HR expertise gives the STACK an immediate eval edge, the org / policy / entitlement structure plays directly to the GraphRAG strengths shared with Document Intake (lowering marginal build cost), and SMBs without a CHRO have acknowledged repetitive pain that compounds with employee count.

### Expansion criteria

A third vertical only enters the roadmap when:

- The buyer pain can be described in one sentence.
- The connector set is buildable and maintainable by the existing team.
- Clear evals exist for "this deployment is healthy."
- At least three live deployments exist in each of the launching verticals, run by CORE consultants other than the founders.

We expand when the existing verticals have proof.

---

## Pricing

All amounts in AUD, ex-GST.

### Cash flow structure

1. **SMB → Dev** for staged sprint delivery — milestone payments tied to clear value drops scoped through the CORE.
2. **SMB → Reach** for the STACK — activation plus monthly subscription, billed direct.
3. **Reach → Dev** as a lifetime commission on each deployment's STACK MRR.
4. **Dev → Reach** for CORE access — a low monthly subscription.

This keeps the SMB relationship direct with Reach for product feedback, evals, and retention metrics, while giving the consultant early sprint income and ongoing annuity income through commission and optional retainers.

A wholesale path — where established consultants own SMB billing and capture more STACK margin — is a Phase-2 option, available at Studio tier.

### CORE — paid by the consultant

| Tier | Price/mo | Who |
|------|----------|-----|
| Launch | $0 | Pre-revenue. Capped activity, Reach-branded artifacts. |
| Starter | $79 | First paying client. One active deployment. |
| Practice | $199 | Multiple active deployments. Priority support. |
| Studio | $499 | Small group, 3 seats included. +$129/seat. Team analytics. |

CORE is the front door. The STACK is where unit economics compound.

### STACK — paid by the SMB

| STACK | Activation | Foundation | Growth | Scale | Enterprise |
|--------|------------|------------|--------|-------|------------|
| Document Intake | $1,500 | $499 (≤500 docs/mo) | $999 (≤2,000) | $1,999 (≤5,000) | Custom |
| Customer Support | $1,500 | $399 (≤500 tickets/mo) | $799 (≤2,000) | $1,599 (≤5,000) | Custom |
| HR | $2,500 | $399 (≤30 employees) | $799 (≤100) | $1,599 (≤250) | Custom |

Activation covers ontology configuration, connector setup, and eval baselining. HR activation is higher because awards / EBA configuration is heavier work.

### Consultant economics

- **Staged sprint fee (Dev → SMB):** $8,000–$20,000 typical total, scoped via CORE and paid across 3–4 milestone value drops. Higher for HR and compliance-heavy Document Intake; lower for staged Customer Support drafts-only deployments.
- **STACK commission (Reach → Dev):** 15% at Starter, 20% at Practice, 25% at Studio. Applied to current STACK MRR; the rate moves with the consultant's CORE tier.
- **Optional retainer (Dev → SMB):** $500–$2,000/mo for ongoing tuning, escalations, and expansion.

### Sprint fee value drops

The sprint fee should land as small, inspectable value drops. CORE structures the Dev's sprint fee so the Dev gets paid before each step begins; the SMB receives a concrete artefact at the end of each step and can pause with something useful in hand.

| Step | Typical payment | SMB receives |
|------|-----------------|--------------|
| Diagnostic | $1,000–$2,500 | Workflow map, readiness / risk view, value hypothesis, recommended STACK path. |
| Scope and proof | $2,000–$4,000 | Prototype or demo on sample data, success criteria, SOW, eval plan, go / no-go decision. |
| Configuration | $3,000–$7,000 | Connected sandbox or pilot, vocabulary / rules mapping, approval paths, eval baseline. |
| Go-live | $2,000–$6,500 | Production launch, staff training, monitoring baseline, handover evidence, retainer proposal. |

This keeps the consultant from carrying unpaid discovery and implementation risk, while making each SMB payment small enough to approve on the strength of the previous value drop.

### Worked example

First deployment at a 25-person legal firm, Document Intake STACK, Dev at Starter tier.

| Cash flow | Amount |
|-----------|--------|
| SMB → Dev (staged sprint fees) | $12,000 total |
| Value-drop schedule | $1,500 diagnostic; $2,500 scope / proof; $5,000 configuration; $3,000 go-live |
| SMB → Reach (activation) | $1,500 once |
| SMB → Reach (STACK, Growth tier) | $999 / mo |
| Reach → Dev (15% commission) | $150 / mo lifetime |
| Dev → Reach (CORE Starter) | $79 / mo |
| SMB → Dev (optional retainer) | $750 / mo |

**Dev year 1 gross:** $12,000 staged sprint fees + ($150 + $750) × 12 = $22,800. Less CORE ($79 × 12 = $948). **Net ~$21,850** from this single client.

**Reach year 1 from this deployment:** $1,500 + ($999 − $150) × 12 + $948 CORE = **~$12,640**.

**Steady state (year 2+):** Dev nets ~$9,850/yr per ongoing client at Starter tier (commission + retainer less CORE). Reach nets ~$10,200/yr per deployment in STACK revenue after commission, plus the Dev's CORE subscription. Unit economics scale linearly with new deployments; commission improves at Practice (20%) and Studio (25%) tiers.

---

## Customer

Technical specialists building an independent practice. Recently-exited big-tech engineers are a high-density segment, but the product does not require that origin.

**Strong fit:**

- senior software, data, ML, platform, and security engineers
- solutions architects and technical product managers
- automation specialists, systems integrators, technical founders between ventures

**They bring:** deep technical credibility, comfort with APIs and data, ability to ship production-quality work.

**They lack:** repeatable scoping, a productized delivery surface, an end-user UI to put in front of SMB clients, and a credible quality bar that does not depend on personal reputation.

Reach gives them the missing surface so they can sell, deliver, and stand behind real AI capability without building from zero each time.

---

## What SMB work looks like

SMB engagements have a different shape from big-tech work, and consultants moving across need to recalibrate.

- **The needs are lower.** SMBs do not need state-of-the-art systems. The win is moving a manual workflow from 20 hours a week down to 5.
- **There are fewer technical experts on the client side.** The Dev is often the most technical person in any room they enter, including with the executive team.
- **The buyer doesn't know what they don't know.** Discovery has to surface the questions the SMB could not think to ask, framed in their language.
- **Scope follows buyer appetite for change.** Disciplined under-scoping is a virtue; aim for what the SMB can absorb, then expand.
- **Outcomes matter more than elegance.** A slightly clunky workflow that runs reliably for the SMB is worth more than a clean architecture they cannot operate.

Reach is built around this reality. CORE constrains the engagement to a fixed-scope sprint shape; STACK ships production-grade capability without requiring the SMB to host or maintain it; the Dev brings the trust and contextual judgment that no platform can productize.

---

## SMB buyer reality

SMBs do not buy "AI". They buy:

- fewer missed leads
- faster response times
- less manual admin
- cleaner client handovers
- faster file preparation
- fewer repeated questions

Reach's STACKs are explained and sold in those terms. The CORE forces every proposal to anchor to a measurable outcome the deployed STACK can actually move.

---

## Why this is defensible

Seven layers, strongest first.

1. **Deployment data flywheel.** Every deployment improves the next: prompts, taxonomies, escalation patterns, edge-case libraries, eval failure modes. Hard to reproduce without running real engagements.
2. **Vertical ontologies.** Typed graph schemas — entities, relationships, completeness rules — encoding the domain expertise that defines good output in this vertical. Reused across deployments and refined by them.
3. **Vertical evals.** Knowing what "good" looks like for tax document intake or retail support requires actual deployment data and domain shaping. This is where most generic AI products break.
4. **Two-sided lock-in.** Consultants invest in CORE fluency and a portfolio of live deployments. SMBs depend on STACK continuity. Both sides face switching cost.
5. **Connector inventory.** Pre-built, maintained integrations to the SMB tools each vertical uses — months of focused work per vertical, painful to reproduce ad-hoc.
6. **Compliance posture.** Audit trails, residency controls, redaction, permission boundaries — implemented once, reused everywhere. Bespoke builds usually skip these and pay later.
7. **Branded end-user UI.** SMB end users interact with a polished surface, raising the trust bar against any bespoke alternative.

A motivated developer with ChatGPT and a Notion template cannot reproduce this in a weekend. That is the point.

---

## What Reach is not

- Not a course, certification, or coaching program.
- Not a CV tool or job board.
- Not a generic prompt library or template pack.
- Not a freelancer marketplace.
- Not an agency — Reach does not deliver client work directly.
- Not a low-end tool — the STACK ships production-grade capability.

---

## Strategic thesis

Frontier models are already capable enough. The remaining bottleneck on SMB AI adoption is *reliable, deliverable* capability: branded, supported, observable, and bought from someone the SMB trusts.

Reach productizes the capability and equips a class of technical specialists to be the trusted deliverers. Over time, the STACK becomes a category-defining piece of infrastructure for SMB AI deployment, and the CORE becomes the operating system for the practitioners who deploy it.
