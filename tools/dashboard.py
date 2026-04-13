#!/usr/bin/env python3
"""
Repo Dashboard
Scans all markdown files and produces a health report:
  - Which files have content vs. are still templates
  - Empty sections in PLAN.md
  - Open vs resolved questions
  - Unresolved assumptions
  - Blank rows in Priority Ballot
  - Pending red team challenges
  - Session log activity

Usage:
    python tools/dashboard.py              # full report
    python tools/dashboard.py --html       # open HTML dashboard in browser
    python tools/dashboard.py --json       # output as JSON (for scripting)
"""

import argparse
import html as html_mod
import json
import re
import sys
from pathlib import Path

from htmlutil import html_page, badge, progress_bar, stat_box, ensure_output_dir, open_in_browser, render_markdown_to_html
from session import generate_session_html, _collect_next_actions, _collect_provocation, _collect_open_questions, _collect_unresolved_assumptions
from mindmap import parse_mindmap_md, build_tree, generate_html as generate_mindmap_html
from redteam import count_existing_rounds

REPO_ROOT = Path(__file__).resolve().parent.parent


def count_content_lines(filepath: Path) -> int:
    """Count lines that aren't headings, blockquotes, comments, or dividers."""
    if not filepath.exists():
        return 0
    content = filepath.read_text(encoding="utf-8")
    return len([
        l for l in content.splitlines()
        if l.strip()
        and not l.strip().startswith("#")
        and not l.strip().startswith(">")
        and not l.strip().startswith("<!--")
        and not l.strip().startswith("|--")
        and not l.strip().startswith("---")
        and not l.strip().startswith("```")
    ])


def analyze_plan() -> dict:
    """Check which sections of PLAN.md have been filled in."""
    pfile = REPO_ROOT / "PLAN.md"
    if not pfile.exists():
        return {"exists": False}

    content = pfile.read_text(encoding="utf-8")
    sections = {}
    current_section = None
    section_lines = []

    for line in content.splitlines():
        match = re.match(r"^## (\d+)\.\s+(.+)$", line)
        if match:
            if current_section:
                sections[current_section] = len([l for l in section_lines if l.strip() and not l.strip().startswith("|--") and not l.strip().startswith("---")])
            current_section = f"{match.group(1)}. {match.group(2)}"
            section_lines = []
        elif current_section:
            # Skip template placeholders
            if line.strip() and not line.strip().startswith("#") and not line.strip().startswith("_") and not line.strip().startswith(">"):
                section_lines.append(line)

    if current_section:
        sections[current_section] = len([l for l in section_lines if l.strip() and not l.strip().startswith("|--") and not l.strip().startswith("---")])

    return {"exists": True, "sections": sections}


def analyze_questions() -> dict:
    """Count open vs resolved questions."""
    qfile = REPO_ROOT / "QUESTIONS.md"
    if not qfile.exists():
        return {"exists": False}

    content = qfile.read_text(encoding="utf-8")
    open_q = len(re.findall(r"^- \[[ ]\]", content, re.MULTILINE))
    resolved_q = len(re.findall(r"^- \[[xX]\]", content, re.MULTILINE))
    # Also count plain list items in open section
    in_open = False
    plain_open = 0
    open_items = []
    for line in content.splitlines():
        if "## Open" in line:
            in_open = True
            continue
        if "## Resolved" in line:
            in_open = False
        if in_open and line.strip().startswith("- "):
            text = re.sub(r'^- (\[[ xX]\]\s*)?', '', line.strip())
            if text:
                open_items.append(text)
            if "[" not in line[:10]:
                plain_open += 1

    return {"exists": True, "open": open_q + plain_open, "resolved": resolved_q, "open_items": open_items}


def analyze_assumptions() -> dict:
    """Count assumptions and their status."""
    afile = REPO_ROOT / "ASSUMPTIONS.md"
    if not afile.exists():
        return {"exists": False}

    content = afile.read_text(encoding="utf-8")
    total = 0
    with_verdict = 0
    challenged = 0
    items = []

    for line in content.splitlines():
        if line.startswith("|") and not line.startswith("| #") and not line.startswith("|---"):
            cells = [c.strip() for c in line.split("|")]
            cells = [c for c in cells if c]
            if len(cells) >= 2 and cells[1]:  # has an assumption
                total += 1
                conf = cells[2] if len(cells) >= 3 else ""
                verdict = cells[5] if len(cells) >= 6 and cells[5] else ""
                items.append({"text": cells[1], "confidence": conf, "verdict": verdict})
                if len(cells) >= 5 and cells[4]:  # challenged by
                    challenged += 1
                if len(cells) >= 6 and cells[5]:  # verdict
                    with_verdict += 1

    return {"exists": True, "total": total, "challenged": challenged, "resolved": with_verdict, "items": items}


def analyze_priority_ballot() -> dict:
    """Count features scored vs blank."""
    bfile = REPO_ROOT / "PRIORITY-BALLOT.md"
    if not bfile.exists():
        return {"exists": False}

    content = bfile.read_text(encoding="utf-8")
    total = 0
    scored_a = 0
    scored_b = 0

    for line in content.splitlines():
        if line.startswith("|") and not line.startswith("| Feature") and not line.startswith("|---"):
            cells = [c.strip() for c in line.split("|")]
            cells = [c for c in cells if c]
            if len(cells) >= 1 and cells[0]:
                total += 1
                if len(cells) >= 2 and cells[1]:
                    scored_a += 1
                if len(cells) >= 4 and cells[3]:
                    scored_b += 1

    return {"exists": True, "features": total, "partner_a_scored": scored_a, "partner_b_scored": scored_b}


def analyze_red_team() -> dict:
    """Count red team rounds and responses."""
    rfile = REPO_ROOT / "RED-TEAM.md"
    if not rfile.exists():
        return {"exists": False}

    content = rfile.read_text(encoding="utf-8")
    rounds = len(re.findall(r"^## Round \d+", content, re.MULTILINE))
    challenges = len(re.findall(r"\*\*Challenge \d+:\*\*", content))
    responses = 0
    for match in re.finditer(r"\*\*Response \d+:\*\*\s*\n(.*?)(?=\n---|\n\*\*|\Z)", content, re.DOTALL):
        if match.group(1).strip():
            responses += 1

    return {"exists": True, "rounds": rounds, "challenges": challenges, "responses": responses}


def analyze_decisions() -> dict:
    """Count decisions logged."""
    dfile = REPO_ROOT / "DECISIONS.md"
    if not dfile.exists():
        return {"exists": False}

    content = dfile.read_text(encoding="utf-8")
    decisions = len(re.findall(r"^### D\d+", content, re.MULTILINE))
    return {"exists": True, "count": decisions}


def analyze_risks() -> dict:
    """Count risks and responses."""
    rfile = REPO_ROOT / "RISKS.md"
    if not rfile.exists():
        return {"exists": False}

    content = rfile.read_text(encoding="utf-8")
    risks = len(re.findall(r"^### R\d+", content, re.MULTILINE))
    responses = len(re.findall(r"\*\*Partner response:\*\*\s*.+", content))
    return {"exists": True, "count": risks, "with_response": responses}


def analyze_session_log() -> dict:
    """Count session log entries in PLAN.md."""
    pfile = REPO_ROOT / "PLAN.md"
    if not pfile.exists():
        return {"entries": 0, "items": []}

    content = pfile.read_text(encoding="utf-8")
    in_log = False
    entries = 0
    items = []
    for line in content.splitlines():
        if "## Session Log" in line:
            in_log = True
            continue
        if in_log and line.startswith("## "):
            break
        if in_log and line.startswith("|") and not line.startswith("| Date") and not line.startswith("|---"):
            cells = [c.strip() for c in line.split("|")]
            cells = [c for c in cells if c]
            if len(cells) >= 2 and cells[0]:
                entries += 1
                date = cells[0]
                who = cells[1] if len(cells) >= 2 else ""
                what = cells[2] if len(cells) >= 3 else ""
                items.append({"date": date, "who": who, "what": what})

    return {"entries": entries, "items": items}


def print_bar(label: str, value: int, total: int, width: int = 30) -> None:
    """Print a simple text progress bar."""
    if total == 0:
        pct = 0
    else:
        pct = value / total
    filled = int(width * pct)
    bar = "█" * filled + "░" * (width - filled)
    print(f"  {label:<30} [{bar}] {value}/{total}")


def print_report(data: dict) -> None:
    print("\n" + "=" * 64)
    print("  REPO DASHBOARD")
    print("=" * 64)

    # File health
    print("\n  FILE HEALTH")
    print("  " + "-" * 40)
    files = [
        ("PLAN.md", 8), ("IDEAS.md", 3), ("DECISIONS.md", 3),
        ("QUESTIONS.md", 3), ("RISKS.md", 3), ("ASSUMPTIONS.md", 3),
        ("MINDMAP.md", 3), ("LEAN-CANVAS.md", 3),
        ("PRIORITY-BALLOT.md", 3), ("RED-TEAM.md", 3),
        ("USER-JOURNEY.md", 3), ("DECISION-MATRIX.md", 3),
    ]
    for fname, threshold in files:
        lines = count_content_lines(REPO_ROOT / fname)
        status = "✅ has content" if lines > threshold else "⬜ needs work"
        print(f"  {fname:<25} {status}")

    # PLAN.md sections
    plan = data["plan"]
    if plan.get("exists") and plan.get("sections"):
        print(f"\n  PLAN.md SECTIONS")
        print("  " + "-" * 40)
        for section_name, line_count in plan["sections"].items():
            status = "✅" if line_count > 2 else "⬜"
            print(f"  {status} {section_name}")

    # Questions
    q = data["questions"]
    if q.get("exists"):
        print(f"\n  QUESTIONS")
        print("  " + "-" * 40)
        print(f"  Open:     {q['open']}")
        print(f"  Resolved: {q['resolved']}")

    # Assumptions
    a = data["assumptions"]
    if a.get("exists"):
        print(f"\n  ASSUMPTIONS")
        print("  " + "-" * 40)
        print(f"  Total:      {a['total']}")
        print(f"  Challenged: {a['challenged']}")
        print(f"  Resolved:   {a['resolved']}")

    # Priority Ballot
    b = data["ballot"]
    if b.get("exists") and b["features"] > 0:
        print(f"\n  PRIORITY BALLOT")
        print("  " + "-" * 40)
        print(f"  Features listed:     {b['features']}")
        print(f"  Partner A scored:    {b['partner_a_scored']}")
        print(f"  Partner B scored:    {b['partner_b_scored']}")

    # Red Team
    r = data["red_team"]
    if r.get("exists"):
        print(f"\n  RED TEAM")
        print("  " + "-" * 40)
        print(f"  Rounds:     {r['rounds']}")
        print(f"  Challenges: {r['challenges']}")
        print(f"  Responses:  {r['responses']}")

    # Decisions & Risks
    d = data["decisions"]
    ri = data["risks"]
    print(f"\n  DECISIONS & RISKS")
    print("  " + "-" * 40)
    if d.get("exists"):
        print(f"  Decisions logged: {d['count']}")
    if ri.get("exists"):
        print(f"  Risks identified: {ri['count']}  (with response: {ri['with_response']})")

    # Session log
    s = data["session_log"]
    print(f"\n  SESSION LOG")
    print("  " + "-" * 40)
    print(f"  Entries: {s['entries']}")

    # Summary
    print("\n" + "=" * 64)
    # Calculate overall progress
    filled_files = sum(1 for fname, threshold in files if count_content_lines(REPO_ROOT / fname) > threshold)
    total_files = len(files)
    print(f"  Overall: {filled_files}/{total_files} files have content")
    print("=" * 64 + "\n")


def generate_file_pages(output_dir: Path) -> dict:
    """Render each MD file as a standalone HTML page. Returns {filename: html_filename}."""
    md_files = sorted(REPO_ROOT.glob("*.md"))
    pages = {}
    for md_file in md_files:
        content = md_file.read_text(encoding="utf-8")
        html_name = md_file.stem.lower() + "-file.html"
        title = md_file.stem.replace("-", " ").title()
        rendered = render_markdown_to_html(content)
        body = f'<div class="card" style="max-width:900px;">\n{rendered}\n</div>'
        page = html_page(title, body)
        (output_dir / html_name).write_text(page, encoding="utf-8")
        pages[md_file.name] = html_name
    return pages


def _inline_md(text: str) -> str:
    """Process inline markdown: bold, italic, inline code. HTML-escapes first."""
    s = html_mod.escape(text)
    s = re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'\*(.+?)\*', r'<em>\1</em>', s)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    return s


def generate_html(data: dict, file_pages: dict = None) -> str:
    """Generate a content-focused HTML dashboard."""
    if file_pages is None:
        file_pages = {}

    q = data["questions"]
    a = data["assumptions"]
    s = data["session_log"]

    # Collect session-style content
    actions = _collect_next_actions()
    provocation = _collect_provocation()
    open_questions = _collect_open_questions()
    unresolved_assumptions = _collect_unresolved_assumptions()

    # Define the key files with icons
    tile_files = [
        ("PLAN.md", "📋", "Plan"),
        ("IDEAS.md", "💡", "Ideas"),
        ("QUESTIONS.md", "❓", "Questions"),
        ("ASSUMPTIONS.md", "🎯", "Assumptions"),
        ("DECISIONS.md", "⚖️", "Decisions"),
        ("RISKS.md", "⚠️", "Risks"),
        ("MINDMAP.md", "🗺️", "Mindmap"),
        ("LEAN-CANVAS.md", "📊", "Lean Canvas"),
        ("PRIORITY-BALLOT.md", "🗳️", "Priority Ballot"),
        ("RED-TEAM.md", "🔴", "Red Team"),
        ("USER-JOURNEY.md", "🚶", "User Journey"),
        ("DECISION-MATRIX.md", "📐", "Decision Matrix"),
    ]

    body = ""

    # ─── File tiles with modal content ───
    body += '<div class="file-tiles">\n'
    modals = ""
    for fname, icon, label in tile_files:
        fpath = REPO_ROOT / fname
        lines = count_content_lines(fpath)
        threshold = 8 if fname == "PLAN.md" else 3
        has = lines > threshold
        status_class = "has-content" if has else "needs-work"
        status_text = "has content" if has else "needs work"
        modal_id = fname.replace(".", "-").lower()

        body += f"""<div class="file-tile {status_class}" onclick="document.getElementById('modal-{modal_id}').classList.add('open')">
  <span class="tile-icon">{icon}</span>
  <span class="tile-name">{label}</span>
  <span class="tile-status">{status_text}</span>
</div>\n"""

        # Build modal with rendered file content
        if fpath.exists():
            content = fpath.read_text(encoding="utf-8")
            rendered = render_markdown_to_html(content)
        else:
            rendered = '<p class="empty">File not found.</p>'

        vscode_uri = fpath.resolve().as_uri().replace('file:///', 'vscode://file/')

        modals += f"""<div class="modal-overlay" id="modal-{modal_id}" onclick="if(event.target===this)this.classList.remove('open')">
  <div class="modal-content">
    <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('open')">&times;</button>
    <a class="modal-edit" href="{vscode_uri}">Edit in VS Code</a>
    <h2 style="margin-top:0;margin-bottom:1rem;clear:both;">{fname}</h2>
    {rendered}
  </div>
</div>\n"""

    body += '</div>\n'

    # ─── Section 1: Actions & Provocation (what to do right now) ───

    # Next actions — front and centre
    if actions:
        plan_path = REPO_ROOT / "PLAN.md"
        plan_uri = plan_path.resolve().as_uri().replace('file:///', 'vscode://file/')
        # Find the line number of the Next Actions section
        actions_line = 1
        if plan_path.exists():
            for i, line in enumerate(plan_path.read_text(encoding="utf-8").splitlines(), 1):
                if "Next Actions" in line:
                    actions_line = i
                    break
        body += f'<h2>Actions For You <a class="modal-edit" href="{plan_uri}:{actions_line}" style="font-size:0.7rem;vertical-align:middle;">Edit in VS Code</a></h2>\n<div class="card">\n<table><tr><th>Who</th><th>Action</th><th>Status</th></tr>\n'
        for act in actions:
            status_badge = badge(act['status'] or 'pending', 'yellow' if act['status'] != 'Done' else 'green')
            body += f"<tr><td>{html_mod.escape(act['who'])}</td><td>{html_mod.escape(act['action'])}</td><td>{status_badge}</td></tr>\n"
        body += "</table>\n</div>\n"

    # Provocation
    if provocation:
        body += f"""
<div class="card" style="border-left: 4px solid var(--accent);">
  <h3 style="margin-top: 0;">Provocation</h3>
  <blockquote>{_inline_md(provocation)}</blockquote>
</div>
"""

    # ─── Section 2: Open Questions (grouped by category) ───

    if open_questions:
        body += '<h2>Open Questions</h2>\n<div class="card">\n'
        current_cat = None
        for oq in open_questions:
            cat = oq.get("category")
            if cat and cat != current_cat:
                if current_cat is not None:
                    body += '</ul>\n'
                body += f'<h3 style="margin:1rem 0 0.4rem 0;color:var(--accent);font-size:1rem;">{html_mod.escape(cat)}</h3>\n<ul>\n'
                current_cat = cat
            elif current_cat is None:
                body += '<ul>\n'
                current_cat = ""
            body += f"<li>{_inline_md(oq['text'])}</li>\n"
        body += '</ul>\n</div>\n'

    # ─── Section 3: Unresolved Assumptions (table with confidence) ───

    if unresolved_assumptions:
        body += '<h2>Unresolved Assumptions</h2>\n<div class="card">\n'
        body += '<table><tr><th style="width:2.5rem">#</th><th>Assumption</th><th style="width:5rem">Confidence</th></tr>\n'
        for ua in unresolved_assumptions:
            conf = ua.get("confidence", "")
            conf_color = {"H": "green", "M": "yellow", "L": "red"}.get(conf, "muted")
            conf_label = {"H": "High", "M": "Med", "L": "Low"}.get(conf, conf)
            body += f'<tr><td>{html_mod.escape(ua["num"])}</td><td>{_inline_md(ua["text"])}</td><td>{badge(conf_label, conf_color)}</td></tr>\n'
        body += '</table>\n</div>\n'

    # ─── Section 4: Session Log ───

    session_items = s.get("items", [])
    if session_items:
        body += '<h2>Session Log</h2>\n<div class="card">\n<table><tr><th>Date</th><th>Who</th><th>What happened</th></tr>\n'
        for si in reversed(session_items):  # most recent first
            body += f"<tr><td>{html_mod.escape(si['date'])}</td><td>{html_mod.escape(si['who'])}</td><td>{html_mod.escape(si['what'])}</td></tr>\n"
        body += '</table>\n</div>\n'

    # Append modals at the end of body
    body += modals

    # Escape key closes modals
    body += """
<script>
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});
</script>
"""

    return html_page("Dashboard", body)


def main():
    parser = argparse.ArgumentParser(description="Repo health dashboard")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--html", action="store_true", help="Generate HTML dashboard and open in browser")
    args = parser.parse_args()

    data = {
        "plan": analyze_plan(),
        "questions": analyze_questions(),
        "assumptions": analyze_assumptions(),
        "ballot": analyze_priority_ballot(),
        "red_team": analyze_red_team(),
        "decisions": analyze_decisions(),
        "risks": analyze_risks(),
        "session_log": analyze_session_log(),
    }

    if args.html:
        out_dir = ensure_output_dir()
        file_pages = generate_file_pages(out_dir)
        out = out_dir / "dashboard.html"
        out.write_text(generate_html(data, file_pages), encoding="utf-8")
        print(f"Dashboard written to {out}")
        print(f"  {len(file_pages)} file pages generated")

        # Generate session page
        (out_dir / "session.html").write_text(generate_session_html(), encoding="utf-8")
        print("  session.html generated")

        # Generate mindmap page
        mm_file = REPO_ROOT / "MINDMAP.md"
        if mm_file.exists():
            mm_text = mm_file.read_text(encoding="utf-8")
            nodes = parse_mindmap_md(mm_text)
            if nodes:
                tree = build_tree(nodes, root_label="Idea")
                (out_dir / "mindmap.html").write_text(generate_mindmap_html(tree, "MINDMAP.md"), encoding="utf-8")
                print("  mindmap.html generated")

        # Generate red team page from RED-TEAM.md content
        rt_file = REPO_ROOT / "RED-TEAM.md"
        if rt_file.exists():
            rt_content = rt_file.read_text(encoding="utf-8")
            rt_rendered = render_markdown_to_html(rt_content)
            rt_uri = rt_file.resolve().as_uri().replace('file:///', 'vscode://file/')
            rt_body = f'<p><a class="modal-edit" href="{rt_uri}">Edit RED-TEAM.md in VS Code</a></p>\n'
            if count_existing_rounds() == 0:
                rt_body += '<div class="card" style="border-left: 4px solid var(--yellow);"><h3 style="margin-top:0">No rounds yet</h3>'
                rt_body += '<p>Generate challenges with: <code>python tools/redteam.py --write --html</code></p></div>\n'
            rt_body += rt_rendered
            (out_dir / "redteam.html").write_text(html_page("Red Team", rt_body), encoding="utf-8")
        print("  redteam.html generated")

        open_in_browser(out)
    elif args.json:
        print(json.dumps(data, indent=2))
    else:
        print_report(data)


if __name__ == "__main__":
    main()
