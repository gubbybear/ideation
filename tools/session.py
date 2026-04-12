#!/usr/bin/env python3
"""
Session Starter
Run this at the beginning of every working session. It will:
  1. Git pull to get the latest changes
  2. Show what changed since you last worked (commits you haven't seen)
  3. List open questions from QUESTIONS.md
  4. Show unresolved assumptions from ASSUMPTIONS.md
  5. Show the latest provocation from PLAN.md
  6. List next actions assigned to you

Usage:
    python tools/session.py                  # full session start
    python tools/session.py --html           # open session briefing in browser
    python tools/session.py --name "Alex"    # filter actions for your name
    python tools/session.py --no-pull        # skip git pull
"""

import argparse
import html as html_mod
import re
import subprocess
import sys
from pathlib import Path

from htmlutil import html_page, badge, ensure_output_dir, open_in_browser

REPO_ROOT = Path(__file__).resolve().parent.parent


def run_git(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git"] + list(args),
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=check,
    )


def section(title: str) -> None:
    width = 60
    print(f"\n{'=' * width}")
    print(f"  {title}")
    print(f"{'=' * width}\n")


def git_pull() -> None:
    section("GIT PULL")
    result = run_git("pull", "--rebase", check=False)
    print(result.stdout.strip() if result.stdout.strip() else "Already up to date.")
    if result.returncode != 0 and result.stderr.strip():
        print(f"Warning: {result.stderr.strip()}")


def show_recent_changes() -> None:
    section("WHAT CHANGED (last 7 days)")

    result = run_git("log", "--oneline", "--since=7 days ago", "--all", "--no-merges", check=False)
    if result.stdout.strip():
        for line in result.stdout.strip().splitlines()[:20]:
            print(f"  {line}")
    else:
        print("  No commits in the last 7 days.")

    print()

    # Show files changed in last 7 days
    result = run_git("log", "--name-only", "--pretty=format:", "--since=7 days ago", "--all", check=False)
    if result.stdout.strip():
        files = sorted(set(f.strip() for f in result.stdout.splitlines() if f.strip()))
        if files:
            print("  Files touched:")
            for f in files:
                print(f"    - {f}")


def show_open_questions() -> None:
    section("OPEN QUESTIONS")
    qfile = REPO_ROOT / "QUESTIONS.md"
    if not qfile.exists():
        print("  QUESTIONS.md not found.")
        return

    content = qfile.read_text(encoding="utf-8")
    in_open = False
    questions = []

    for line in content.splitlines():
        if line.strip().lower().startswith("## open"):
            in_open = True
            continue
        if line.strip().lower().startswith("## resolved"):
            in_open = False
            continue
        if in_open and line.strip().startswith("- "):
            questions.append(line.strip())

    if questions:
        for q in questions:
            print(f"  {q}")
    else:
        print("  No open questions.")


def show_unresolved_assumptions() -> None:
    section("UNRESOLVED ASSUMPTIONS")
    afile = REPO_ROOT / "ASSUMPTIONS.md"
    if not afile.exists():
        print("  ASSUMPTIONS.md not found.")
        return

    content = afile.read_text(encoding="utf-8")
    unresolved = []

    for line in content.splitlines():
        # Match table rows that have content but no verdict
        if line.startswith("|") and not line.startswith("| #") and not line.startswith("|---"):
            cells = [c.strip() for c in line.split("|")]
            # cells[0] is empty (before first |), cells[-1] may be empty (after last |)
            cells = [c for c in cells if c]
            if len(cells) >= 2:
                assumption = cells[1] if len(cells) > 1 else ""
                verdict = cells[-1] if len(cells) >= 6 else ""
                if assumption and not verdict and assumption != "Assumption":
                    unresolved.append(f"  {cells[0]}. {assumption}")

    if unresolved:
        for a in unresolved:
            print(a)
    else:
        print("  No unresolved assumptions (or none added yet).")


def show_provocation() -> None:
    section("PROVOCATION FOR THIS SESSION")
    pfile = REPO_ROOT / "PLAN.md"
    if not pfile.exists():
        print("  PLAN.md not found.")
        return

    content = pfile.read_text(encoding="utf-8")
    # Find the provocation block at the end
    match = re.search(r"Provocation for next session.*?\n>\s*\n>(.*?)$", content, re.DOTALL | re.IGNORECASE)
    if match:
        provocation = match.group(1).strip().strip(">").strip()
        if provocation:
            print(f"  {provocation}")
        else:
            print("  (empty — leave one for your partner when you finish!)")
    else:
        print("  No provocation block found in PLAN.md.")


def show_next_actions(name: str | None = None) -> None:
    section("NEXT ACTIONS")
    pfile = REPO_ROOT / "PLAN.md"
    if not pfile.exists():
        print("  PLAN.md not found.")
        return

    content = pfile.read_text(encoding="utf-8")
    in_actions = False
    actions = []

    for line in content.splitlines():
        if "## 10. Next Actions" in line or "## 10." in line:
            in_actions = True
            continue
        if in_actions and line.startswith("## ") or line.startswith("---"):
            if in_actions and line.startswith("---"):
                in_actions = False
                continue
        if in_actions and line.startswith("|") and not line.startswith("| Who") and not line.startswith("|---"):
            cells = [c.strip() for c in line.split("|")]
            cells = [c for c in cells if c]
            if len(cells) >= 2 and cells[0]:
                who = cells[0]
                action = cells[1] if len(cells) > 1 else ""
                status = cells[2] if len(cells) > 2 else ""
                if name and name.lower() not in who.lower():
                    continue
                actions.append(f"  [{who}] {action}  ({status})")

    if actions:
        for a in actions:
            print(a)
    else:
        print("  No actions assigned" + (f" to {name}" if name else "") + ".")


def show_session_summary() -> None:
    """Quick count of what's in the repo."""
    section("REPO SNAPSHOT")

    # Count non-empty key files
    key_files = [
        "PLAN.md", "IDEAS.md", "DECISIONS.md", "QUESTIONS.md",
        "RISKS.md", "ASSUMPTIONS.md", "MINDMAP.md", "LEAN-CANVAS.md",
        "PRIORITY-BALLOT.md", "RED-TEAM.md", "USER-JOURNEY.md", "DECISION-MATRIX.md",
    ]

    for fname in key_files:
        fpath = REPO_ROOT / fname
        if fpath.exists():
            content = fpath.read_text(encoding="utf-8")
            # Count non-empty, non-template lines (rough heuristic)
            lines = [l for l in content.splitlines()
                     if l.strip()
                     and not l.strip().startswith("#")
                     and not l.strip().startswith(">")
                     and not l.strip().startswith("<!--")
                     and not l.strip().startswith("|--")
                     and not l.strip().startswith("---")
                     and not l.strip().startswith("```")]
            status = "has content" if len(lines) > 5 else "needs work"
            print(f"  {fname:<25} {status}")


def _collect_recent_changes() -> tuple[list[str], list[str]]:
    """Collect recent commits and files touched."""
    result = run_git("log", "--oneline", "--since=7 days ago", "--all", "--no-merges", check=False)
    commits = result.stdout.strip().splitlines()[:20] if result.stdout.strip() else []

    result = run_git("log", "--name-only", "--pretty=format:", "--since=7 days ago", "--all", check=False)
    files = sorted(set(f.strip() for f in result.stdout.splitlines() if f.strip())) if result.stdout.strip() else []
    return commits, files


def _collect_open_questions() -> list[str]:
    qfile = REPO_ROOT / "QUESTIONS.md"
    if not qfile.exists():
        return []
    content = qfile.read_text(encoding="utf-8")
    in_open = False
    questions = []
    for line in content.splitlines():
        if line.strip().lower().startswith("## open"):
            in_open = True
            continue
        if line.strip().lower().startswith("## resolved"):
            in_open = False
            continue
        if in_open and line.strip().startswith("- "):
            questions.append(line.strip()[2:])
    return questions


def _collect_unresolved_assumptions() -> list[str]:
    afile = REPO_ROOT / "ASSUMPTIONS.md"
    if not afile.exists():
        return []
    content = afile.read_text(encoding="utf-8")
    unresolved = []
    for line in content.splitlines():
        if line.startswith("|") and not line.startswith("| #") and not line.startswith("|---"):
            cells = [c.strip() for c in line.split("|")]
            cells = [c for c in cells if c]
            if len(cells) >= 2:
                assumption = cells[1] if len(cells) > 1 else ""
                verdict = cells[-1] if len(cells) >= 6 else ""
                if assumption and not verdict and assumption != "Assumption":
                    unresolved.append(f"{cells[0]}. {assumption}")
    return unresolved


def _collect_provocation() -> str:
    pfile = REPO_ROOT / "PLAN.md"
    if not pfile.exists():
        return ""
    content = pfile.read_text(encoding="utf-8")
    match = re.search(r"Provocation for next session.*?\n>\s*\n>(.*?)$", content, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip().strip(">").strip()
    return ""


def _collect_next_actions(name: str | None = None) -> list[dict]:
    pfile = REPO_ROOT / "PLAN.md"
    if not pfile.exists():
        return []
    content = pfile.read_text(encoding="utf-8")
    in_actions = False
    actions = []
    for line in content.splitlines():
        if "## 10. Next Actions" in line or "## 10." in line:
            in_actions = True
            continue
        if in_actions and (line.startswith("## ") or line.startswith("---")):
            in_actions = False
            continue
        if in_actions and line.startswith("|") and not line.startswith("| Who") and not line.startswith("|---"):
            cells = [c.strip() for c in line.split("|")]
            cells = [c for c in cells if c]
            if len(cells) >= 2 and cells[0]:
                who = cells[0]
                action = cells[1] if len(cells) > 1 else ""
                status = cells[2] if len(cells) > 2 else ""
                if name and name.lower() not in who.lower():
                    continue
                actions.append({"who": who, "action": action, "status": status})
    return actions


def _collect_file_status() -> list[tuple[str, str]]:
    key_files = [
        "PLAN.md", "IDEAS.md", "DECISIONS.md", "QUESTIONS.md",
        "RISKS.md", "ASSUMPTIONS.md", "MINDMAP.md", "LEAN-CANVAS.md",
        "PRIORITY-BALLOT.md", "RED-TEAM.md", "USER-JOURNEY.md", "DECISION-MATRIX.md",
    ]
    results = []
    for fname in key_files:
        fpath = REPO_ROOT / fname
        if fpath.exists():
            content = fpath.read_text(encoding="utf-8")
            lines = [l for l in content.splitlines()
                     if l.strip()
                     and not l.strip().startswith("#")
                     and not l.strip().startswith(">")
                     and not l.strip().startswith("<!--")
                     and not l.strip().startswith("|--")
                     and not l.strip().startswith("---")
                     and not l.strip().startswith("```")]
            status = "has content" if len(lines) > 5 else "needs work"
            results.append((fname, status))
    return results


def generate_session_html(name: str | None = None) -> str:
    """Generate an HTML session briefing."""
    commits, files_touched = _collect_recent_changes()
    questions = _collect_open_questions()
    assumptions = _collect_unresolved_assumptions()
    provocation = _collect_provocation()
    actions = _collect_next_actions(name)
    file_status = _collect_file_status()

    body = ""

    # Provocation (hero)
    if provocation:
        body += f"""
<div class="card" style="border-left: 4px solid var(--accent);">
  <h3 style="margin-top: 0;">Provocation for this session</h3>
  <blockquote>{html_mod.escape(provocation)}</blockquote>
</div>
"""
    else:
        body += """
<div class="card" style="border-left: 4px solid var(--yellow);">
  <h3 style="margin-top: 0;">No provocation set</h3>
  <p class="empty">Leave one for your partner when you finish!</p>
</div>
"""

    # Recent changes
    body += '<h2>What Changed (last 7 days)</h2><div class="card">'
    if commits:
        body += "<table><tr><th>Recent Commits</th></tr>"
        for c in commits:
            body += f"<tr><td><code>{html_mod.escape(c)}</code></td></tr>"
        body += "</table>"
        if files_touched:
            body += "<h3>Files Touched</h3><ul>"
            for f in files_touched:
                body += f"<li>{html_mod.escape(f)}</li>"
            body += "</ul>"
    else:
        body += '<p class="empty">No commits in the last 7 days.</p>'
    body += "</div>"

    # Two-column layout
    body += '<div class="grid">'

    # Open questions
    body += '<div class="card"><h3 style="margin-top:0">Open Questions</h3>'
    if questions:
        body += "<ul>"
        for q in questions:
            body += f"<li>{html_mod.escape(q)}</li>"
        body += "</ul>"
    else:
        body += '<p class="empty">No open questions.</p>'
    body += "</div>"

    # Unresolved assumptions
    body += '<div class="card"><h3 style="margin-top:0">Unresolved Assumptions</h3>'
    if assumptions:
        body += "<ul>"
        for a in assumptions:
            body += f"<li>{html_mod.escape(a)}</li>"
        body += "</ul>"
    else:
        body += '<p class="empty">None yet.</p>'
    body += "</div>"

    body += "</div>"  # close grid

    # Next actions
    body += '<h2>Next Actions</h2><div class="card">'
    if actions:
        body += "<table><tr><th>Who</th><th>Action</th><th>Status</th></tr>"
        for a in actions:
            body += f"<tr><td>{html_mod.escape(a['who'])}</td><td>{html_mod.escape(a['action'])}</td><td>{badge(a['status'] or 'pending', 'yellow')}</td></tr>"
        body += "</table>"
    else:
        body += '<p class="empty">No actions assigned' + (f' to {html_mod.escape(name)}' if name else '') + '.</p>'
    body += "</div>"

    # File status
    body += '<h2>Repo Snapshot</h2><div class="card"><table><tr><th>File</th><th>Status</th></tr>'
    for fname, status in file_status:
        b = badge(status, "green" if status == "has content" else "yellow")
        body += f"<tr><td>{fname}</td><td>{b}</td></tr>"
    body += "</table></div>"

    title = "Session Briefing" + (f" — {name}" if name else "")
    return html_page(title, body)



def main():
    parser = argparse.ArgumentParser(description="Start a collaboration session")
    parser.add_argument("--name", "-n", type=str, default=None, help="Your name (filters actions)")
    parser.add_argument("--no-pull", action="store_true", help="Skip git pull")
    parser.add_argument("--html", action="store_true", help="Open session briefing in browser")
    args = parser.parse_args()

    if not args.no_pull:
        git_pull()

    if args.html:
        out = ensure_output_dir() / "session.html"
        out.write_text(generate_session_html(args.name), encoding="utf-8")
        print(f"Session briefing written to {out}")
        open_in_browser(out)
    else:
        print("\n" + "~" * 60)
        print("  SESSION START")
        print("~" * 60)

        show_recent_changes()
        show_session_summary()
        show_open_questions()
        show_unresolved_assumptions()
        show_provocation()
        show_next_actions(args.name)

        print(f"\n{'~' * 60}")
        print("  Ready to work. Don't forget to push when you're done!")
        print(f"{'~' * 60}\n")


if __name__ == "__main__":
    main()
