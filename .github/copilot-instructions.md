# Copilot Instructions — Ideation Repo

This is an async two-person ideation workspace. Partners work with Claude on separate machines, committing thinking to markdown files and building on each other's work.

## Tools

All tools are in `tools/` and require only Python 3.10+ standard library.

| Command | What it does |
|---------|-------------|
| `python tools/dashboard.py --html` | **Main hub.** Generates dashboard + per-file HTML pages in `output/`, opens in browser. Every MD file becomes a clickable rendered page. |
| `python tools/session.py --html` | Session starter. Git pulls, shows recent changes, open questions, provocations. |
| `python tools/mindmap.py --html` | Renders MINDMAP.md as interactive SVG with pan/zoom/drag. |
| `python tools/redteam.py --html` | Generates adversarial challenges from repo context. Add `--write` to append to RED-TEAM.md. |

## Key files

- **PLAN.md** — Living plan: problem, users, features, business model, session log
- **IDEAS.md** — Raw brainstorming tagged by contributor and date
- **QUESTIONS.md** — Open questions for the other partner. Move resolved to the Resolved section
- **ASSUMPTIONS.md** — Beliefs with confidence levels. Challenge and verdict columns for partner review
- **MINDMAP.md** — Indented markdown with `{colour}` tags. Renders as interactive SVG via mindmap tool
- **DECISIONS.md, RISKS.md, LEAN-CANVAS.md, PRIORITY-BALLOT.md, RED-TEAM.md, USER-JOURNEY.md, DECISION-MATRIX.md** — Structured templates

## Conventions

- Don't delete the other person's writing — add below or challenge via QUESTIONS/ASSUMPTIONS
- Tag contributions with name and date
- After editing markdown files, regenerate HTML: `python tools/dashboard.py --html`
- The `output/` folder is gitignored — each person generates locally
- Leave provocations at the end of sessions for the other partner
