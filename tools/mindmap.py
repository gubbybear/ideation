#!/usr/bin/env python3
"""
Mindmap Generator — Custom SVG renderer

Reads MINDMAP.md and renders an interactive SVG mindmap in the browser.
No external libraries required (no Mermaid).

Colour notation (add to any line in MINDMAP.md):
    ## Section Name {teal}       — named colour on a branch
    - Item {#e07a5f}             — hex colour on a node
    - Plain item                 — inherits parent's colour

Available colours: teal, coral, indigo, amber, sage, slate, rose,
                   sky, lavender, earth, mint, plum

Usage:
    python tools/mindmap.py              # print tree to stdout
    python tools/mindmap.py --html       # open interactive mindmap in browser
    python tools/mindmap.py -i other.md  # use a different source file
"""

import argparse
import json
import re
import sys
from pathlib import Path

from htmlutil import html_page, ensure_output_dir, open_in_browser

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = REPO_ROOT / "MINDMAP.md"

# ── Named colour palette (muted, pleasant tones) ──────────────────────
PALETTE = {
    "teal":     "#2a9d8f",
    "coral":    "#e07a5f",
    "indigo":   "#5c6bc0",
    "amber":    "#d4a03c",
    "sage":     "#6a9a5b",
    "slate":    "#5c7a99",
    "rose":     "#c06c84",
    "sky":      "#5ba4cf",
    "lavender": "#9b8ec4",
    "earth":    "#a0785a",
    "mint":     "#4db6ac",
    "plum":     "#8e4585",
}

# Auto-assigned to top-level branches (cycling)
AUTO_COLORS = list(PALETTE.values())

# Regex to extract {color} at end of a label
_COLOR_RE = re.compile(r"\s*\{([^}]+)\}\s*$")


def _resolve_color(raw: str) -> str | None:
    """Resolve a color name or hex string to a hex value."""
    raw = raw.strip().lower()
    if raw.startswith("#"):
        return raw
    return PALETTE.get(raw)


# ── Parsing ────────────────────────────────────────────────────────────

def parse_mindmap_md(text: str) -> list[tuple[int, str, str | None]]:
    """Parse indented markdown into (depth, label, color) triples.

    Colour is extracted from an optional {name} or {#hex} at end of a line.
    """
    nodes: list[tuple[int, str, str | None]] = []
    current_heading_depth = 0
    root_found = False

    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith(">") or stripped.startswith("<!--"):
            continue
        if stripped.startswith("---"):
            continue

        heading_match = re.match(r"^(#{1,6})\s+(.+)$", stripped)
        if heading_match:
            level = len(heading_match.group(1))
            label = heading_match.group(2).strip()
            color = None
            cm = _COLOR_RE.search(label)
            if cm:
                color = _resolve_color(cm.group(1))
                label = label[:cm.start()].strip()
            if level == 1 and not root_found:
                root_found = True
                if label.lower() not in ("mindmap", "mind map"):
                    nodes.append((0, label, color))
                continue
            current_heading_depth = level - 1
            nodes.append((current_heading_depth, label, color))
            continue

        list_match = re.match(r"^(\s*)-\s+(.+)$", line)
        if list_match:
            indent = len(list_match.group(1))
            label = list_match.group(2).strip()
            color = None
            cm = _COLOR_RE.search(label)
            if cm:
                color = _resolve_color(cm.group(1))
                label = label[:cm.start()].strip()
            item_depth = current_heading_depth + 1 + (indent // 2)
            nodes.append((item_depth, label, color))

    return nodes


def build_tree(nodes: list[tuple[int, str, str | None]],
               root_label: str = "Idea") -> dict:
    """Convert flat (depth, label, color) list into a nested tree dict."""
    root = {"label": root_label, "color": None, "children": []}

    if nodes and nodes[0][0] == 0:
        root["label"] = nodes[0][1]
        root["color"] = nodes[0][2]
        nodes = nodes[1:]

    stack: list[tuple[int, dict]] = [(-1, root)]

    for depth, label, color in nodes:
        node = {"label": label, "color": color, "children": []}
        while len(stack) > 1 and stack[-1][0] >= depth:
            stack.pop()
        stack[-1][1]["children"].append(node)
        stack.append((depth, node))

    return root


def _print_tree(node: dict, prefix: str = "", is_last: bool = True,
                is_root: bool = True) -> None:
    """Pretty-print tree to terminal."""
    color_tag = ""
    if node.get("color"):
        name = next((k for k, v in PALETTE.items() if v == node["color"]),
                     node["color"])
        color_tag = f" {{{name}}}"

    if is_root:
        print(f"\u25cf {node['label']}{color_tag}")
    else:
        branch = "\u2514\u2500 " if is_last else "\u251c\u2500 "
        print(f"{prefix}{branch}{node['label']}{color_tag}")

    children = node.get("children", [])
    for i, child in enumerate(children):
        child_is_last = i == len(children) - 1
        if is_root:
            child_prefix = ""
        elif is_last:
            child_prefix = prefix + "   "
        else:
            child_prefix = prefix + "\u2502  "
        _print_tree(child, child_prefix, child_is_last, is_root=False)


# ── HTML generation ────────────────────────────────────────────────────

_EXTRA_CSS = """<style>
  #mindmap-wrap {
    background: linear-gradient(145deg, #0f1318 0%, #141a22 100%);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    margin: 1rem 0;
    position: relative;
  }
  #mindmap-svg {
    width: 100%;
    height: 72vh;
    min-height: 400px;
    display: block;
    cursor: grab;
  }
  #mindmap-svg:active { cursor: grabbing; }
  #mindmap-svg .mm-node { cursor: move; }
  #mindmap-svg .mm-node:hover rect { filter: url(#sh); }
  #mindmap-svg .mm-node.dragging { opacity: 0.85; }
  #color-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0.75rem 0;
    align-items: center;
  }
  .swatch {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.45rem;
    border-radius: 10px;
    font-size: 0.72rem;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--muted);
  }
  .swatch .dot {
    width: 9px; height: 9px;
    border-radius: 50%;
    display: inline-block;
  }
  #controls {
    display: flex; gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  #controls button {
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.3rem 0.7rem;
    font-size: 0.8rem;
    cursor: pointer;
  }
  #controls button:hover { border-color: var(--accent); }
  .zoom-hint {
    color: var(--muted);
    font-size: 0.72rem;
    margin-left: 0.5rem;
  }
</style>"""

# The full SVG mindmap renderer — plain string, no f-string escaping.
_JS_RENDERER = r"""
(function() {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const data   = window._MM_TREE;
  const autoCols = window._MM_AUTO;

  const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
  const FS   = [20, 15, 13, 12, 11];
  const HGAP = 55;
  const VGAP = 5;
  const PX   = 14, PY = 7;
  const MINW = 36;

  /* ── text measurement ── */
  const mCtx = document.createElement('canvas').getContext('2d');
  function tw(t, s) { mCtx.font = s + 'px ' + FONT; return mCtx.measureText(t).width; }

  /* ── colour helpers ── */
  function hex2rgb(h) {
    h = h.replace('#','');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return [parseInt(h.substr(0,2),16), parseInt(h.substr(2,2),16), parseInt(h.substr(4,2),16)];
  }
  function rgb2hex(r,g,b) {
    return '#' + [r,g,b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
  }
  function lighten(h, a) {
    const [r,g,b] = hex2rgb(h);
    return rgb2hex(r+(255-r)*a, g+(255-g)*a, b+(255-b)*a);
  }
  function textCol(bg) {
    const [r,g,b] = hex2rgb(bg);
    return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.55 ? '#1a1a2e' : '#f0f0f5';
  }

  /* ── assign colours ── */
  function assignColors(node, parent, idx) {
    if (!node.color) {
      if (parent) node.color = parent.color;
      else        node.color = autoCols[idx % autoCols.length];
    }
    node.children.forEach((c, i) => assignColors(c, node, parent ? idx : i));
  }
  data.color = data.color || '#4a5568';
  data.children.forEach((c, i) => assignColors(c, null, i));

  /* ── build flat lookup + parent refs ── */
  let _uid = 0;
  function stamp(n, par) {
    n._id = _uid++;
    n._parent = par || null;
    n.children.forEach(c => stamp(c, n));
  }
  stamp(data, null);

  /* ── compute sizes ── */
  function sizes(n, d) {
    const fs = FS[Math.min(d, FS.length - 1)];
    n.w  = Math.max(tw(n.label, fs) + PX * 2, MINW);
    n.h  = fs + PY * 2;
    n.fs = fs;
    n.d  = d;
    if (!n.children.length) { n.sh = n.h; return; }
    n.children.forEach(c => sizes(c, d + 1));
    n.sh = n.children.reduce((s, c) => s + c.sh, 0) + (n.children.length - 1) * VGAP;
  }

  /* ── initial layout ── */
  function lay(n, x, y, dir) {
    n.x = x; n.y = y; n.dir = dir;
    if (!n.children.length) return;
    const cx = x + dir * (n.w / 2 + HGAP);
    let sy = y - n.sh / 2;
    for (const c of n.children) {
      lay(c, cx, sy + c.sh / 2, dir);
      sy += c.sh + VGAP;
    }
  }

  sizes(data, 0);
  data.x = 0; data.y = 0; data.dir = 0;

  const mid = Math.ceil(data.children.length / 2);
  function side(arr, dir) {
    if (!arr.length) return;
    const th = arr.reduce((s, c) => s + c.sh, 0) + (arr.length - 1) * VGAP;
    let sy = -th / 2;
    for (const c of arr) { lay(c, dir * (data.w / 2 + HGAP), sy + c.sh / 2, dir); sy += c.sh + VGAP; }
  }
  side(data.children.slice(0, mid), 1);
  side(data.children.slice(mid), -1);

  /* ── create SVG ── */
  const wrap = document.getElementById('mindmap-wrap');
  const svg  = document.createElementNS(SVG_NS, 'svg');
  svg.id = 'mindmap-svg';
  wrap.appendChild(svg);

  const defs = document.createElementNS(SVG_NS, 'defs');
  defs.innerHTML = '<filter id="sh" x="-15%" y="-15%" width="140%" height="140%">' +
    '<feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#000" flood-opacity="0.22"/></filter>' +
    '<filter id="glow" x="-25%" y="-25%" width="150%" height="150%">' +
    '<feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#58a6ff" flood-opacity="0.35"/></filter>';
  svg.appendChild(defs);

  const edgeG = document.createElementNS(SVG_NS, 'g');
  const nodeG = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(edgeG);
  svg.appendChild(nodeG);

  /* ── edge: draw and return path element ── */
  function makeEdgePath(p, c) {
    const dir = c.x > p.x ? 1 : (c.x < p.x ? -1 : (c.dir || 1));
    const x1 = p.x + dir * p.w / 2, y1 = p.y;
    const x2 = c.x - dir * c.w / 2, y2 = c.y;
    const dx = x2 - x1;
    return 'M' + x1 + ' ' + y1 +
      ' C' + (x1 + dx * 0.45) + ' ' + y1 + ',' +
             (x2 - dx * 0.45) + ' ' + y2 + ',' +
              x2 + ' ' + y2;
  }

  function drawEdge(p, c) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', makeEdgePath(p, c));
    path.setAttribute('stroke', lighten(c.color || '#4a5568', 0.15));
    path.setAttribute('stroke-width', Math.max(1.2, 2.6 - (c.d || 1) * 0.35));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', '0.5');
    edgeG.appendChild(path);
    c._edge = path;   // store reference for updates
  }

  /* ── update a single edge path ── */
  function updateEdge(c) {
    if (!c._edge || !c._parent) return;
    c._edge.setAttribute('d', makeEdgePath(c._parent, c));
  }

  /* ── node: draw and store refs ── */
  function drawNode(n) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.classList.add('mm-node');
    const d    = n.d || 0;
    const base = n.color || '#4a5568';
    const fill = d === 0 ? base : lighten(base, Math.min(d * 0.1, 0.4));
    const tc   = textCol(fill);

    const r = document.createElementNS(SVG_NS, 'rect');
    r.setAttribute('x', n.x - n.w / 2);
    r.setAttribute('y', n.y - n.h / 2);
    r.setAttribute('width', n.w);
    r.setAttribute('height', n.h);
    r.setAttribute('rx', n.h / 2);
    r.setAttribute('fill', fill);
    if (d === 0) r.setAttribute('filter', 'url(#sh)');

    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', n.x);
    t.setAttribute('y', n.y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dominant-baseline', 'central');
    t.setAttribute('fill', tc);
    t.setAttribute('font-size', n.fs);
    t.setAttribute('font-family', FONT);
    t.setAttribute('font-weight', d === 0 ? '700' : d === 1 ? '600' : '400');
    t.setAttribute('pointer-events', 'none');
    t.textContent = n.label;

    g.appendChild(r);
    g.appendChild(t);
    nodeG.appendChild(g);

    // Store refs on the data node for live updates
    n._g = g;
    n._rect = r;
    n._text = t;
  }

  /* ── update node position in SVG ── */
  function updateNodePos(n) {
    n._rect.setAttribute('x', n.x - n.w / 2);
    n._rect.setAttribute('y', n.y - n.h / 2);
    n._text.setAttribute('x', n.x);
    n._text.setAttribute('y', n.y);
  }

  /* ── move a node + its entire subtree by (dx,dy) ── */
  function moveSubtree(n, dx, dy) {
    n.x += dx;
    n.y += dy;
    updateNodePos(n);
    updateEdge(n);                        // edge from parent → this node
    for (const c of n.children) {
      moveSubtree(c, dx, dy);
    }
  }

  /* ── render everything ── */
  function renderEdges(n) { for (const c of n.children) { drawEdge(n, c); renderEdges(c); } }
  function renderNodes(n) { drawNode(n); for (const c of n.children) renderNodes(c); }
  renderEdges(data);
  renderNodes(data);

  /* ── viewBox / fit ── */
  function calcBounds(n) {
    let x0 = n.x - n.w/2, x1 = n.x + n.w/2, y0 = n.y - n.h/2, y1 = n.y + n.h/2;
    for (const c of n.children) {
      const b = calcBounds(c);
      x0 = Math.min(x0, b.x0); x1 = Math.max(x1, b.x1);
      y0 = Math.min(y0, b.y0); y1 = Math.max(y1, b.y1);
    }
    return { x0, x1, y0, y1 };
  }

  function fitView() {
    const b = calcBounds(data), pad = 50;
    vb = { x: b.x0 - pad, y: b.y0 - pad, w: b.x1 - b.x0 + pad*2, h: b.y1 - b.y0 + pad*2 };
    updVB();
  }

  let vb = { x: 0, y: 0, w: 100, h: 100 };
  function updVB() { svg.setAttribute('viewBox', vb.x+' '+vb.y+' '+vb.w+' '+vb.h); }
  fitView();

  /* ── SVG coordinate helpers ── */
  function clientToSVG(cx, cy) {
    const rc = svg.getBoundingClientRect();
    return {
      x: (cx - rc.left) / rc.width  * vb.w + vb.x,
      y: (cy - rc.top)  / rc.height * vb.h + vb.y
    };
  }

  /* ── interaction state ── */
  const IDLE = 0, PANNING = 1, DRAGGING = 2;
  let mode = IDLE;
  let dragNode = null;
  let lastSVG  = { x: 0, y: 0 };       // last SVG-space pointer pos
  let lastClient = { x: 0, y: 0 };      // last client-space pointer pos

  /* ── find which data node owns an SVG group ── */
  function findNode(el, n) {
    if (n._g === el) return n;
    for (const c of n.children) {
      const r = findNode(el, c);
      if (r) return r;
    }
    return null;
  }

  /* ── mousedown: node drag or canvas pan ── */
  svg.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    const target = e.target.closest('.mm-node');
    const pt = clientToSVG(e.clientX, e.clientY);
    lastSVG = pt;
    lastClient = { x: e.clientX, y: e.clientY };

    if (target) {
      const n = findNode(target, data);
      if (n) {
        mode = DRAGGING;
        dragNode = n;
        target.classList.add('dragging');
        n._rect.setAttribute('filter', 'url(#glow)');
        svg.style.cursor = 'move';
        e.preventDefault();
        return;
      }
    }
    mode = PANNING;
    svg.style.cursor = 'grabbing';
  });

  /* ── mousemove ── */
  window.addEventListener('mousemove', function(e) {
    if (mode === IDLE) return;

    if (mode === DRAGGING && dragNode) {
      const pt = clientToSVG(e.clientX, e.clientY);
      const dx = pt.x - lastSVG.x;
      const dy = pt.y - lastSVG.y;
      moveSubtree(dragNode, dx, dy);
      // Also update the edge from parent → this node's siblings (parent's other children)
      // and the edge from this node's parent
      if (dragNode._parent) {
        for (const sib of dragNode._parent.children) {
          updateEdge(sib);
        }
      }
      lastSVG = pt;
    }

    if (mode === PANNING) {
      const rc = svg.getBoundingClientRect();
      vb.x -= (e.clientX - lastClient.x) / rc.width  * vb.w;
      vb.y -= (e.clientY - lastClient.y) / rc.height * vb.h;
      lastClient = { x: e.clientX, y: e.clientY };
      updVB();
    }
  });

  /* ── mouseup ── */
  window.addEventListener('mouseup', function() {
    if (mode === DRAGGING && dragNode) {
      dragNode._g.classList.remove('dragging');
      if (dragNode.d !== 0) dragNode._rect.removeAttribute('filter');
      else dragNode._rect.setAttribute('filter', 'url(#sh)');
    }
    mode = IDLE;
    dragNode = null;
    svg.style.cursor = 'grab';
  });

  /* ── zoom (scroll wheel, pointer-anchored) ── */
  svg.addEventListener('wheel', function(e) {
    e.preventDefault();
    const sc = e.deltaY > 0 ? 1.08 : 1 / 1.08;
    const pt = clientToSVG(e.clientX, e.clientY);
    vb.w *= sc; vb.h *= sc;
    const rc = svg.getBoundingClientRect();
    vb.x = pt.x - (e.clientX - rc.left) / rc.width  * vb.w;
    vb.y = pt.y - (e.clientY - rc.top)  / rc.height * vb.h;
    updVB();
  }, { passive: false });

  /* ── toolbar buttons ── */
  document.getElementById('fit-btn').addEventListener('click', fitView);

  document.getElementById('zin-btn').addEventListener('click', function() {
    const cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2;
    vb.w /= 1.3; vb.h /= 1.3;
    vb.x = cx - vb.w / 2; vb.y = cy - vb.h / 2;
    updVB();
  });

  document.getElementById('zout-btn').addEventListener('click', function() {
    const cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2;
    vb.w *= 1.3; vb.h *= 1.3;
    vb.x = cx - vb.w / 2; vb.y = cy - vb.h / 2;
    updVB();
  });

  document.getElementById('reset-btn').addEventListener('click', function() {
    // Re-run layout from scratch
    sizes(data, 0);
    data.x = 0; data.y = 0; data.dir = 0;
    const mid2 = Math.ceil(data.children.length / 2);
    side(data.children.slice(0, mid2), 1);
    side(data.children.slice(mid2), -1);
    // Update all positions
    function updAll(n) {
      updateNodePos(n);
      updateEdge(n);
      n.children.forEach(updAll);
    }
    updAll(data);
    fitView();
  });
})();
"""


def generate_html(tree: dict, source_file: str) -> str:
    """Generate a self-contained HTML page with an interactive SVG mindmap."""
    tree_json = json.dumps(tree)
    auto_json = json.dumps(AUTO_COLORS)

    # Colour legend swatches
    swatches = "".join(
        f'<span class="swatch"><span class="dot" style="background:{h}"></span>{n}</span>'
        for n, h in PALETTE.items()
    )

    body = (
        f'<p style="color:var(--muted);font-size:0.85rem">Source: {source_file}</p>\n'
        f'<div id="color-legend">'
        f'<span style="color:var(--muted);font-size:0.8rem;margin-right:0.25rem">Colours</span>'
        f'{swatches}'
        f'<span style="color:var(--muted);font-size:0.7rem;margin-left:0.5rem">'
        f'add {{name}} to any line in your .md</span>'
        f'</div>\n'
        f'<div id="controls">'
        f'<button id="fit-btn">Fit to view</button>'
        f'<button id="zin-btn">Zoom +</button>'
        f'<button id="zout-btn">Zoom −</button>'
        f'<button id="reset-btn">Reset layout</button>'
        f'<span class="zoom-hint">scroll to zoom · drag canvas to pan · drag node to move</span>'
        f'</div>\n'
        f'<div id="mindmap-wrap"></div>\n'
        f'<script>\n'
        f'window._MM_TREE = {tree_json};\n'
        f'window._MM_AUTO = {auto_json};\n'
        f'</script>\n'
        f'<script>{_JS_RENDERER}</script>\n'
    )

    return html_page("Mindmap", body, extra_head=_EXTRA_CSS)


# ── CLI ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Generate an interactive mindmap from MINDMAP.md")
    parser.add_argument("--input", "-i", type=Path, default=DEFAULT_INPUT,
                        help="Input markdown file")
    parser.add_argument("--html", action="store_true",
                        help="Open interactive SVG mindmap in browser")
    parser.add_argument("--root", "-r", default="Idea",
                        help="Root node label (used if file has no topic heading)")
    args = parser.parse_args()

    if not args.input.exists():
        print(f"Error: {args.input} not found", file=sys.stderr)
        sys.exit(1)

    text = args.input.read_text(encoding="utf-8")
    nodes = parse_mindmap_md(text)

    if not nodes:
        print("No mindmap content found.", file=sys.stderr)
        sys.exit(1)

    tree = build_tree(nodes, root_label=args.root)

    if args.html:
        out = ensure_output_dir() / "mindmap.html"
        out.write_text(generate_html(tree, args.input.name), encoding="utf-8")
        print(f"Mindmap written to {out}")
        open_in_browser(out)
    else:
        _print_tree(tree)


if __name__ == "__main__":
    main()
