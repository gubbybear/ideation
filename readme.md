# Ideation Repo

> **Two-person async ideation workspace.** Each partner works with Claude on their own machine, commits thinking to this repo, and builds on what the other has pushed.

---

## Quick Start

```
git pull
python tools/session.py --html
```

That's it. The session briefing tells you what changed since you were last here, what questions are waiting for you, and where to start. When you're done working, commit and push.

### Using Claude in VS Code?

If you're working through Claude in VS Code, you don't need to remember commands:

- **Just ask Claude:** "open the dashboard", "run the session starter", "show me the mindmap" — Claude knows about all the tools via the copilot instructions file (`.github/copilot-instructions.md`).
- **Or use VS Code tasks:** `Ctrl+Shift+P` → "Run Task" → pick Dashboard, Session Starter, Mindmap, or Red Team. These are defined in `.vscode/tasks.json`.

Claude will also automatically follow the repo conventions (don't delete the other person's work, tag contributions, regenerate HTML after edits).

---

## The Dashboard (Your Front Door)

The dashboard is the best way to navigate the repo's current state:

```
python tools/dashboard.py --html
```

This generates `output/dashboard.html` and opens it in your browser. From there you can:

- **See overall health** — which files have content, which need work, how many questions/assumptions/decisions exist
- **Click any filename** to read the full rendered content of that file in the same dark-themed UI
- **Navigate** via the top nav bar to the Mindmap, Session briefing, or Red Team tools

**Bookmark `output/dashboard.html`** — it's the single entry point to everything. Re-run the command whenever you want a fresh snapshot.

---

## Workflow

### Every Session

1. **Pull first.** Always `git pull` before you start so you have the latest thinking.
2. **Run the session starter.** `python tools/session.py --html` shows you what changed, open questions, and provocations left by your partner.
3. **Work with Claude.** Explore, challenge, extend ideas. Edit the markdown files directly.
4. **Regenerate the dashboard.** `python tools/dashboard.py --html` to see the updated state.
5. **Commit with intent.** Write clear commit messages: what you added/changed and *why*.
6. **Push when done.** So your partner can build on it next.
7. **Leave provocations.** End sessions with open questions or "what if" prompts so the other person has a jumping-off point.

### Tips

- **Don't delete the other person's writing.** Add yours below, or challenge it in QUESTIONS.md / ASSUMPTIONS.md.
- **Tag your contributions.** Use `### [Name] — [Date]` headers in IDEAS.md and session log entries in PLAN.md.
- **Use the Red Team tool** when you feel like the idea is too comfortable — it generates adversarial challenges to stress-test your thinking.
- **Regenerate HTML after edits.** The output folder is gitignored, so each person generates locally.

---

## Repo Structure

### Markdown Files (the thinking)

| File | What goes here |
|------|---------------|
| `PLAN.md` | The living plan — problem statement, target user, features, business model, competitive landscape, session log |
| `IDEAS.md` | Raw brainstorming. Unfiltered. Tagged by contributor and date |
| `QUESTIONS.md` | Open questions needing the other person's input. Mark resolved when done |
| `ASSUMPTIONS.md` | Hidden beliefs surfaced and challenged. Track confidence and verdicts |
| `DECISIONS.md` | Decisions made and the reasoning behind them. Append-only log |
| `RISKS.md` | Risks, concerns, and things that could kill the idea |
| `MINDMAP.md` | Visual idea map — indented markdown with `{colour}` tags per branch |
| `LEAN-CANVAS.md` | One-page business model canvas |
| `PRIORITY-BALLOT.md` | Feature prioritisation — each partner scores independently |
| `RED-TEAM.md` | Adversarial challenge rounds and responses |
| `USER-JOURNEY.md` | Step-by-step user experience mapping |
| `DECISION-MATRIX.md` | Weighted scoring for key decisions |
| `TOOLKIT.md` | Reference: all template formats and how to use them |

### Tools (the infrastructure)

All tools are Python 3.10+, standard library only — no pip installs needed.

#### `python tools/dashboard.py`

The main hub. Scans all markdown files and produces a health report.

| Flag | Effect |
|------|--------|
| `--html` | Generate dashboard + per-file HTML pages, open in browser |
| `--json` | Output raw data as JSON (for scripting) |
| *(no flag)* | Print text report to terminal |

Every markdown file in the repo gets its own rendered HTML page (e.g. `plan-file.html`, `ideas-file.html`) linked from the dashboard's file health table.

#### `python tools/session.py`

Run at the start of every session. Pulls latest changes, shows recent commits, lists open questions and provocations.

| Flag | Effect |
|------|--------|
| `--html` | Open session briefing in browser |
| `--name NAME` | Filter next-actions for your name |
| `--no-pull` | Skip `git pull` (useful offline) |

#### `python tools/mindmap.py`

Renders `MINDMAP.md` as an interactive SVG mindmap with pan, zoom, and drag-to-move nodes.

| Flag | Effect |
|------|--------|
| `--html` | Open interactive mindmap in browser |
| `--input FILE` | Use a different input file (default: `MINDMAP.md`) |
| `--root LABEL` | Override root node label |

**Colour syntax:** Add `{teal}`, `{coral}`, `{indigo}`, `{amber}`, `{sage}`, `{slate}`, `{rose}`, `{sky}`, `{lavender}`, `{earth}`, `{mint}`, `{plum}`, or `{#hex}` to any heading to colour that branch.

#### `python tools/redteam.py`

Generates adversarial challenges to stress-test your idea. Reads context from the repo files.

| Flag | Effect |
|------|--------|
| `--html` | Open challenges in browser |
| `--write` | Append a new round to `RED-TEAM.md` |
| `--count N` | Number of challenges (default: 5) |
| `--focus AREA` | Focus: `viability`, `technical`, `business`, `user`, `team` |
| `--partner NAME` | Set the attacker name |

### Output

The `output/` folder is **gitignored**. Each person generates HTML locally. It contains:

- `dashboard.html` — the main hub
- `session.html` — latest session briefing
- `mindmap.html` — interactive SVG mindmap
- `redteam.html` — latest red team challenges
- `*-file.html` — rendered view of each markdown file

---

## Requirements

- **Python 3.10+** (standard library only, no dependencies)
- **Git** (for pull/push and session history)
- **A browser** (for HTML output)
- **Claude** (or any AI assistant for ideation sessions)
