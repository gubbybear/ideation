# ReachStack Front-End Build Plan

This document describes how we design and build the SMB-facing front end for ReachStack. It focuses on the easiest, highest-value part of the project: the ReachStack `Surfaces` experience for staff and clients.

## Working mockup

A working Next.js 16 mockup lives in [ReachStack/](ReachStack/). It implements the staff cockpit shell described below — sidebar, top bar, and the Dashboard / Queue / Review / Portal / Audit / Branding views in [ReachStack/components/views/](ReachStack/components/views/) — and uses a shadcn/ui + Tailwind v4 component set with several ReachStack-specific components (queue items, decision rail, audit feed, document preview, draft response, portal snapshot, glass cards, metric cards).

To launch it locally, double-click [launch-reachstack.bat](launch-reachstack.bat) from the repo root. The script runs `npm install` on first launch, starts `next dev`, and opens `http://localhost:3000` in the default browser. Stop the server with Ctrl+C in the launcher window.

A separate single-file static prototype of the same surfaces also exists at [reachstack-surfaces.html](reachstack-surfaces.html) for fast preview without a build step.

## Purpose

Build the front-end user experience for ReachStack in a way that is:

- SMB-facing and brandable
- fast to prototype and iterate
- secure and privacy-conscious
- easy to integrate with the ReachStack backend
- accessible and mobile-friendly

## Scope

The first front-end deliverable is the ReachStack hosted surface layer:

- Branded staff dashboard for SMB users and operators
- Branded client-facing portal / upload portal
- Embedded widgets for review, approval, and feedback
- Lightweight front-end shell for the ReachStack service

This is not the CORE consultant PWA. It is the productized SMB-facing UI layer that sits on top of ReachStack and is built/hosted by Reach.

## Key outcomes

1. A clean staff dashboard for SMB operators to:
   - review inbound queue items
   - approve drafts and escalate
   - monitor status, confidence, and suggested actions
   - see audit / privacy status for each item

2. A client portal for SMB customers to:
   - upload documents and content safely
   - track request status
   - receive branded answers and follow-up prompts
   - keep data out of third-party LLM training

3. A front-end architecture that supports per-SMB theming and safe white-label branding.

## User personas

- SMB operations manager: needs fast, trusted review of AI-generated drafts and auditable decisions.
- SMB staff member: needs a simple queue view, clear action buttons, and confidence context.
- SMB client / external contact: needs a secure upload and status portal for document intake or requests.
- Reach administrator: needs a consistent front-end framework for multiple deployment brands.

## Design principles

- **Clarity first**: keep the queue state obvious, with primary actions prominent.
- **Privacy by design**: show when PII is redacted and where inference happened.
- **Monochrome base**: default the UI to black, white, and gray so the product feels clean and neutral.
- **Customer accent-driven**: derive accent colors from each customer’s brand instead of owning a proprietary palette.
- **Mobile-friendly**: staff and clients should use this on desktop and mobile.
- **Composable UI**: build reusable components for cards, queues, status chips, and forms.
- **Safe defaults**: default to review/approval workflows rather than autonomous send.

## Desktop screens

The main desktop experience should expose these primary screens:

- **Dashboard**: a summary hub for the inbound queue, urgent items, approval backlog, and status metrics.
- **Queue**: a filtered list of inbound items grouped by channel, priority, confidence, and review state.
- **Item detail / review**: a page for a single item showing source data, extracted metadata, generated draft, privacy status, and action buttons.
- **Client portal**: a branded upload/status screen for customers to submit documents and check progress.
- **Audit / history**: an activity trail for selected queue items, approval decisions, and compliance context.
- **Branding / deployment settings**: a lightweight screen for theme config, customer identity, and display options.

## Recommended front-end architecture

- UI framework: React or SolidJS
- Styling: Tailwind CSS or CSS-in-JS plus design tokens
- Routing: file-based routing or lightweight router for PWA-style experience
- Component library: custom ReachStack design system with:
  - cards
  - queues
  - buttons
  - forms
  - toasts / banners
  - modal dialogs
  - skeleton loading states
- Theming: support `logo`, `accent`, and `surface` tokens per deployment on a monochrome base
- Hosting: static site hosting with dynamic API backend calls
- Security: CSP, secure cookie/auth flow, auth token storage in memory or secure storage

## Implementation phases

### Phase 1: MVP surface

Goals:
- validate the surface concept
- ship a review cockpit and upload portal quickly
- make it easy to theme for the first SMB vertical

Deliverables:
- Staff cockpit landing page
- Inbound queue item list
- Draft review / approval page
- Client upload portal
- Simple brand config system (logo + colors)

### Phase 2: polish and integration

Goals:
- add richer workflow and audit context
- connect to ReachStack backend services
- support deployment-specific content and branding

Deliverables:
- Item detail panel with classification, source, and provenance
- Confidence / escalation guidance components
- Audit trail view for selected queue items
- Client portal progress / status screen
- Localized copy and content placeholders for verticals

### Phase 3: productization

Goals:
- make the front end reusable across multiple STACK deployments
- support brand injection and white-label rollout
- add offline/resilient workflows

Deliverables:
- Theme and branding engine for per-deployment customization
- Shared component library and design tokens
- Service worker / PWA shell if needed for offline support
- Monitoring instrumentation for UI performance and errors
- UX refinements for support, templates, and onboarding

## Example pages and UX flows

1. **Dashboard**
   - queue summary cards by channel and confidence
   - top action items and pending approvals
   - quick filters: urgent, review required, escalation suggested

2. **Queue detail**
   - item metadata (source, channel, received time)
   - extracted classification and key fields
   - draft text and suggested reply/actions
   - buttons: Approve, Send, Escalate, Request Info
   - privacy / audit badge

3. **Review page**
   - side-by-side: original item, generated draft, notes
   - feedback form for active learning
   - escalation checklist and tagging
   - post-action evidence capture

4. **Client upload portal**
   - branded entry page
   - upload / drag-and-drop document intake
   - file type guidance and status messaging
   - follow-up checklist for missing information

5. **Branded status screen**
   - shows what happens next after upload
   - secure link or code for returning clients
   - client-facing explanations of privacy and data handling

## Integration points

The front end should consume backend APIs for:

- queue listing and filtering
- item detail and classification metadata
- draft generation results
- review actions and status changes
- client upload and submission receipts
- audit trail and change history
- branding configuration

API design guidance:
- keep endpoints simple and RESTful
- use strong request validation on the backend
- return UI-friendly payloads and status enums
- surface privacy metadata explicitly

## Brand and theming approach

- Keep a single ReachStack palette with override fields:
  - primary color
  - secondary color
  - accent color
  - logo / wordmark
  - button style
  - background / surface style
- Render brand safely in CSS variables or theme context.
- Keep typography consistent across deployments.
- Use neutral defaults for internal staff dashboard and a stronger brand presence for client-facing screens.

## Delivery plan

1. Create a lightweight design system first.
2. Build the staff dashboard as the first visible product.
3. Add client portal next, reusing form and status components.
4. Incrementally wire the UI to the ReachStack backend.
5. Validate with a single vertical pilot and refine branding.

## Success criteria

- Staff dashboard renders queue items clearly and supports review workflows.
- Client portal accepts uploads and shows status flows.
- The UI is themeable per deployment with minimal code changes.
- The front-end codebase is modular enough to reuse for future ReachStack surfaces.
- The design is aligned with Reach’s privacy- and audit-first architecture.
