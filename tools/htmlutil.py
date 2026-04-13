"""
Shared HTML utilities for all tools.
Provides a consistent look and feel across all HTML outputs.
"""

from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = REPO_ROOT / "output"


def ensure_output_dir() -> Path:
    OUTPUT_DIR.mkdir(exist_ok=True)
    gitignore = OUTPUT_DIR / ".gitignore"
    if not gitignore.exists():
        gitignore.write_text("*\n!.gitignore\n", encoding="utf-8")
    return OUTPUT_DIR


def html_page(title: str, body: str, extra_head: str = "") -> str:
    """Wrap body content in a full HTML page with shared styles."""
    timestamp = datetime.now().strftime("%d-%m-%y %H:%M")
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>
  :root {{
    --bg: #0d1117;
    --surface: #161b22;
    --border: #30363d;
    --text: #e6edf3;
    --muted: #8b949e;
    --accent: #58a6ff;
    --green: #3fb950;
    --yellow: #d29922;
    --red: #f85149;
    --orange: #db6d28;
    --purple: #bc8cff;
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }}
  h1 {{
    font-size: 1.8rem;
    margin-bottom: 0.25rem;
    color: var(--accent);
  }}
  h2 {{
    font-size: 1.3rem;
    margin: 2rem 0 1rem;
    color: var(--text);
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
  }}
  h3 {{
    font-size: 1.1rem;
    margin: 1.5rem 0 0.5rem;
    color: var(--muted);
  }}
  .timestamp {{
    color: var(--muted);
    font-size: 0.85rem;
    margin-bottom: 2rem;
  }}
  .card {{
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }}
  .grid {{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1rem;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }}
  th, td {{
    padding: 0.5rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }}
  th {{
    color: var(--muted);
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }}
  tr:last-child td {{ border-bottom: none; }}
  .badge {{
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }}
  .badge-green {{ background: rgba(63,185,80,0.15); color: var(--green); }}
  .badge-yellow {{ background: rgba(210,153,34,0.15); color: var(--yellow); }}
  .badge-red {{ background: rgba(248,81,73,0.15); color: var(--red); }}
  .badge-blue {{ background: rgba(88,166,255,0.15); color: var(--accent); }}
  .badge-muted {{ background: rgba(139,148,158,0.15); color: var(--muted); }}
  .progress-bar {{
    height: 8px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
    margin: 0.5rem 0;
  }}
  .progress-fill {{
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }}
  .stat {{
    text-align: center;
    padding: 1rem;
  }}
  .stat-value {{
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
  }}
  .stat-label {{
    font-size: 0.8rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }}
  blockquote {{
    border-left: 3px solid var(--accent);
    padding: 0.5rem 1rem;
    margin: 0.75rem 0;
    color: var(--muted);
    background: rgba(88,166,255,0.05);
    border-radius: 0 6px 6px 0;
  }}
  .challenge {{
    border-left-color: var(--orange);
    background: rgba(219,109,40,0.05);
  }}
  .response {{
    border-left-color: var(--green);
    background: rgba(63,185,80,0.05);
  }}
  .empty {{
    color: var(--muted);
    font-style: italic;
  }}
  ul {{ padding-left: 1.5rem; }}
  li {{ margin: 0.25rem 0; }}
  .tag {{
    display: inline-block;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-right: 0.25rem;
  }}
  .tag-viability {{ background: rgba(248,81,73,0.15); color: var(--red); }}
  .tag-technical {{ background: rgba(88,166,255,0.15); color: var(--accent); }}
  .tag-business {{ background: rgba(210,153,34,0.15); color: var(--yellow); }}
  .tag-user {{ background: rgba(188,140,255,0.15); color: var(--purple); }}
  .tag-team {{ background: rgba(63,185,80,0.15); color: var(--green); }}
  .tag-contextual {{ background: rgba(219,109,40,0.15); color: var(--orange); }}
  a {{ color: var(--accent); text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}
  .nav {{
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }}
  .nav a {{
    padding: 0.4rem 0.8rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.85rem;
  }}
  .nav a:hover {{
    border-color: var(--accent);
    text-decoration: none;
  }}
  .nav a.active {{
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(88,166,255,0.1);
  }}
  code {{
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.85em;
    background: rgba(139,148,158,0.1);
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
  }}
  /* Modal overlay */
  .modal-overlay {{
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7);
    z-index: 1000;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem;
    overflow-y: auto;
  }}
  .modal-overlay.open {{
    display: flex;
  }}
  .modal-content {{
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 2rem;
    max-width: 900px;
    width: 100%;
    position: relative;
    margin: 2rem auto;
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
  }}
  .modal-close {{
    position: sticky;
    top: 0;
    float: right;
    background: var(--border);
    border: none;
    color: var(--text);
    font-size: 1.2rem;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }}
  .modal-close:hover {{
    background: var(--red);
  }}
  .modal-edit {{
    position: sticky;
    top: 0;
    float: right;
    background: var(--accent);
    border: none;
    color: #fff;
    font-size: 0.8rem;
    padding: 0.3rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 0.5rem;
    text-decoration: none;
    line-height: 2rem;
  }}
  .modal-edit:hover {{ opacity: 0.85; }}
  /* File tiles */
  .file-tiles {{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
    margin-bottom: 2rem;
  }}
  .file-tile {{
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem 0.75rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    text-decoration: none;
    color: var(--text);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
  }}
  .file-tile:hover {{
    border-color: var(--accent);
    background: rgba(88,166,255,0.05);
    text-decoration: none;
  }}
  .file-tile .tile-icon {{
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }}
  .file-tile .tile-name {{
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--accent);
  }}
  .file-tile .tile-status {{
    font-size: 0.65rem;
    color: var(--muted);
  }}
  .file-tile.has-content {{
    border-color: rgba(63,185,80,0.3);
  }}
  .file-tile.needs-work {{
    border-color: rgba(210,153,34,0.3);
  }}
</style>
{extra_head}
</head>
<body>
<nav class="nav">
  <a href="dashboard.html" {"class='active'" if "Dashboard" in title else ""}>Dashboard</a>
  <a href="redteam.html" {"class='active'" if "Red Team" in title else ""}>Red Team</a>
</nav>
<h1>{title}</h1>
<div class="timestamp">Generated {timestamp}</div>
{body}
</body>
</html>"""


def badge(text: str, color: str = "muted") -> str:
    return f'<span class="badge badge-{color}">{text}</span>'


def progress_bar(value: int, total: int, color: str = "var(--green)") -> str:
    pct = (value / total * 100) if total > 0 else 0
    return f"""<div class="progress-bar">
  <div class="progress-fill" style="width:{pct:.0f}%;background:{color}"></div>
</div>"""


def stat_box(value, label: str) -> str:
    return f"""<div class="stat">
  <div class="stat-value">{value}</div>
  <div class="stat-label">{label}</div>
</div>"""


def tag(text: str, category: str = "") -> str:
    cls = f"tag-{category}" if category else ""
    return f'<span class="tag {cls}">{text}</span>'


def open_in_browser(filepath: Path) -> None:
    """Open an HTML file in the default browser."""
    import os
    import sys
    if sys.platform == "win32":
        os.startfile(str(filepath))
    else:
        import webbrowser
        webbrowser.open(filepath.as_uri())


def render_markdown_to_html(text: str) -> str:
    """Convert markdown text to HTML. Handles headings, tables, lists,
    blockquotes, bold/italic, code blocks, horizontal rules, and checkboxes."""
    import html as _html

    lines = text.split("\n")
    out = []
    in_table = False
    in_code = False
    in_ul = False
    in_bq = False
    code_lines = []

    def _inline(s: str) -> str:
        """Process inline markdown: bold, italic, inline code, links."""
        import re as _re
        # inline code first (so backtick content isn't mangled by bold/italic)
        s = _re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
        # bold + italic
        s = _re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', s)
        # bold
        s = _re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
        # italic
        s = _re.sub(r'\*(.+?)\*', r'<em>\1</em>', s)
        # links [text](url)
        s = _re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', s)
        return s

    def _close_list():
        nonlocal in_ul
        if in_ul:
            out.append("</ul>")
            in_ul = False

    def _close_bq():
        nonlocal in_bq
        if in_bq:
            out.append("</blockquote>")
            in_bq = False

    def _close_table():
        nonlocal in_table
        if in_table:
            out.append("</table></div>")
            in_table = False

    for line in lines:
        stripped = line.strip()

        # Code fence
        if stripped.startswith("```"):
            if in_code:
                out.append("<pre><code>" + _html.escape("\n".join(code_lines)) + "</code></pre>")
                code_lines = []
                in_code = False
            else:
                _close_list()
                _close_bq()
                _close_table()
                in_code = True
            continue
        if in_code:
            code_lines.append(line)
            continue

        # Horizontal rule
        if stripped in ("---", "***", "___") and not in_table:
            _close_list()
            _close_bq()
            _close_table()
            out.append('<hr style="border:none;border-top:1px solid var(--border);margin:1.5rem 0;">')
            continue

        # HTML comment — skip
        if stripped.startswith("<!--") and stripped.endswith("-->"):
            continue

        # Headings
        import re as _re
        hm = _re.match(r'^(#{1,6})\s+(.+)$', stripped)
        if hm:
            _close_list()
            _close_bq()
            _close_table()
            level = len(hm.group(1))
            # strip any {colour} tags from display
            heading_text = _re.sub(r'\s*\{[^}]+\}', '', hm.group(2))
            out.append(f"<h{level}>{_inline(_html.escape(heading_text))}</h{level}>")
            continue

        # Table row
        if stripped.startswith("|"):
            _close_list()
            _close_bq()
            cells = [c.strip() for c in stripped.split("|")]
            cells = [c for c in cells if c != ""]
            # Separator row
            if all(_re.match(r'^[-:]+$', c) for c in cells):
                continue
            if not in_table:
                in_table = True
                out.append('<div style="overflow-x:auto;"><table>')
                # First row = header
                out.append("<tr>" + "".join(f"<th>{_inline(_html.escape(c))}</th>" for c in cells) + "</tr>")
            else:
                out.append("<tr>" + "".join(f"<td>{_inline(_html.escape(c))}</td>" for c in cells) + "</tr>")
            continue
        else:
            _close_table()

        # Blockquote
        if stripped.startswith(">"):
            _close_list()
            _close_table()
            if not in_bq:
                in_bq = True
                out.append("<blockquote>")
            content = stripped.lstrip("> ").strip()
            if content:
                out.append(f"<p>{_inline(_html.escape(content))}</p>")
            continue
        else:
            _close_bq()

        # List items (unordered: - or *, with optional checkbox)
        lm = _re.match(r'^(\s*)[-*]\s+(\[[ xX]\]\s+)?(.+)$', stripped)
        if lm:
            _close_table()
            _close_bq()
            if not in_ul:
                in_ul = True
                out.append("<ul>")
            checkbox = ""
            if lm.group(2):
                checked = "x" in lm.group(2).lower()
                checkbox = f'<input type="checkbox" disabled {"checked" if checked else ""}> '
            out.append(f"<li>{checkbox}{_inline(_html.escape(lm.group(3)))}</li>")
            continue

        # Ordered list
        olm = _re.match(r'^(\s*)\d+\.\s+(.+)$', stripped)
        if olm:
            _close_table()
            _close_bq()
            if not in_ul:
                in_ul = True
                out.append("<ul>")
            out.append(f"<li>{_inline(_html.escape(olm.group(2)))}</li>")
            continue

        _close_list()

        # Blank line
        if not stripped:
            continue

        # Regular paragraph
        out.append(f"<p>{_inline(_html.escape(stripped))}</p>")

    # Close any open blocks
    _close_list()
    _close_bq()
    _close_table()
    if in_code:
        out.append("<pre><code>" + _html.escape("\n".join(code_lines)) + "</code></pre>")

    return "\n".join(out)
