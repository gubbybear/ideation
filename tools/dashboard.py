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
import json
import re
import sys
from pathlib import Path

from htmlutil import html_page, badge, progress_bar, stat_box, ensure_output_dir, open_in_browser, render_markdown_to_html

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
    for line in content.splitlines():
        if "## Open" in line:
            in_open = True
            continue
        if "## Resolved" in line:
            in_open = False
        if in_open and line.strip().startswith("- ") and "[" not in line[:10]:
            plain_open += 1

    return {"exists": True, "open": open_q + plain_open, "resolved": resolved_q}


def analyze_assumptions() -> dict:
    """Count assumptions and their status."""
    afile = REPO_ROOT / "ASSUMPTIONS.md"
    if not afile.exists():
        return {"exists": False}

    content = afile.read_text(encoding="utf-8")
    total = 0
    with_verdict = 0
    challenged = 0

    for line in content.splitlines():
        if line.startswith("|") and not line.startswith("| #") and not line.startswith("|---"):
            cells = [c.strip() for c in line.split("|")]
            cells = [c for c in cells if c]
            if len(cells) >= 2 and cells[1]:  # has an assumption
                total += 1
                if len(cells) >= 5 and cells[4]:  # challenged by
                    challenged += 1
                if len(cells) >= 6 and cells[5]:  # verdict
                    with_verdict += 1

    return {"exists": True, "total": total, "challenged": challenged, "resolved": with_verdict}


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
        return {"entries": 0}

    content = pfile.read_text(encoding="utf-8")
    in_log = False
    entries = 0
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

    return {"entries": entries}


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


def generate_html(data: dict, file_pages: dict = None) -> str:
    """Generate an HTML dashboard."""
    if file_pages is None:
        file_pages = {}
    files = [
        ("PLAN.md", 8), ("IDEAS.md", 3), ("DECISIONS.md", 3),
        ("QUESTIONS.md", 3), ("RISKS.md", 3), ("ASSUMPTIONS.md", 3),
        ("MINDMAP.md", 3), ("LEAN-CANVAS.md", 3),
        ("PRIORITY-BALLOT.md", 3), ("RED-TEAM.md", 3),
        ("USER-JOURNEY.md", 3), ("DECISION-MATRIX.md", 3),
    ]

    filled_files = sum(1 for fname, threshold in files if count_content_lines(REPO_ROOT / fname) > threshold)
    total_files = len(files)

    # Stats row
    q = data["questions"]
    a = data["assumptions"]
    d = data["decisions"]
    r = data["red_team"]
    ri = data["risks"]
    s = data["session_log"]

    body = f"""
<div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); margin-bottom: 1.5rem;">
  <div class="card">{stat_box(f"{filled_files}/{total_files}", "Files Active")}</div>
  <div class="card">{stat_box(q.get('open', 0), "Open Questions")}</div>
  <div class="card">{stat_box(a.get('total', 0), "Assumptions")}</div>
  <div class="card">{stat_box(d.get('count', 0), "Decisions")}</div>
  <div class="card">{stat_box(ri.get('count', 0), "Risks")}</div>
  <div class="card">{stat_box(s.get('entries', 0), "Sessions")}</div>
</div>

<div class="grid">
<div>
<h2>File Health</h2>
<div class="card">
  {progress_bar(filled_files, total_files)}
  <table>
    <tr><th>File</th><th>Status</th></tr>
"""
    for fname, threshold in files:
        lines = count_content_lines(REPO_ROOT / fname)
        if lines > threshold:
            b = badge("has content", "green")
        else:
            b = badge("needs work", "yellow")
        link = file_pages.get(fname)
        name_cell = f'<a href="{link}">{fname}</a>' if link else fname
        body += f"    <tr><td>{name_cell}</td><td>{b}</td></tr>\n"

    body += "  </table>\n</div>\n"

    # PLAN.md sections
    plan = data["plan"]
    if plan.get("exists") and plan.get("sections"):
        filled_sections = sum(1 for v in plan["sections"].values() if v > 2)
        total_sections = len(plan["sections"])
        body += f"""
</div>
<div>
<h2>PLAN.md Sections</h2>
<div class="card">
  {progress_bar(filled_sections, total_sections)}
  <table>
    <tr><th>Section</th><th>Status</th></tr>
"""
        for section_name, line_count in plan["sections"].items():
            b = badge("filled", "green") if line_count > 2 else badge("empty", "yellow")
            body += f"    <tr><td>{section_name}</td><td>{b}</td></tr>\n"
        body += "  </table>\n</div>\n</div>\n</div>\n"
    else:
        body += "</div>\n"

    # Questions
    if q.get("exists"):
        total_q = q["open"] + q["resolved"]
        q_bar = progress_bar(q['resolved'], total_q) if q['resolved'] > 0 else '<p style="font-size:0.8rem;color:var(--muted);margin-top:0.5rem;">No questions resolved yet</p>'
        body += f"""
<h2>Questions</h2>
<div class="card">
  <div class="grid" style="grid-template-columns: 1fr 1fr;">
    {stat_box(q['open'], "Open")}
    {stat_box(q['resolved'], "Resolved")}
  </div>
  {q_bar}
</div>
"""

    # Assumptions
    if a.get("exists") and a["total"] > 0:
        body += f"""
<h2>Assumptions</h2>
<div class="card">
  <div class="grid" style="grid-template-columns: 1fr 1fr 1fr;">
    {stat_box(a['total'], "Total")}
    {stat_box(a['challenged'], "Challenged")}
    {stat_box(a['resolved'], "Resolved")}
  </div>
  {progress_bar(a['resolved'], a['total'])}
</div>
"""

    # Priority Ballot
    b_data = data["ballot"]
    if b_data.get("exists") and b_data.get("features", 0) > 0:
        body += f"""
<h2>Priority Ballot</h2>
<div class="card">
  <div class="grid" style="grid-template-columns: 1fr 1fr 1fr;">
    {stat_box(b_data['features'], "Features")}
    {stat_box(b_data['partner_a_scored'], "Partner A Scored")}
    {stat_box(b_data['partner_b_scored'], "Partner B Scored")}
  </div>
</div>
"""

    # Red Team
    if r.get("exists") and r.get("rounds", 0) > 0:
        body += f"""
<h2>Red Team</h2>
<div class="card">
  <div class="grid" style="grid-template-columns: 1fr 1fr 1fr;">
    {stat_box(r['rounds'], "Rounds")}
    {stat_box(r['challenges'], "Challenges")}
    {stat_box(r['responses'], "Responses")}
  </div>
  {progress_bar(r['responses'], r['challenges']) if r['challenges'] else ''}
</div>
"""

    # Risks
    if ri.get("exists") and ri.get("count", 0) > 0:
        body += f"""
<h2>Risks</h2>
<div class="card">
  <div class="grid" style="grid-template-columns: 1fr 1fr;">
    {stat_box(ri['count'], "Identified")}
    {stat_box(ri['with_response'], "With Response")}
  </div>
  {progress_bar(ri['with_response'], ri['count'])}
</div>
"""

    return html_page("Repo Dashboard", body)


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
        open_in_browser(out)
    elif args.json:
        print(json.dumps(data, indent=2))
    else:
        print_report(data)


if __name__ == "__main__":
    main()
