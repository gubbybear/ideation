#!/usr/bin/env python3
"""
Red Team Randomizer
Reads context from PLAN.md and other repo files, then generates
structured adversarial challenge prompts. No API needed — outputs
challenges you can paste into Claude or work through with your partner.

Usage:
    python tools/redteam.py                     # 5 random challenges
    python tools/redteam.py --count 10          # more challenges
    python tools/redteam.py --focus "business"  # focus on a category
    python tools/redteam.py --write             # append a new round to RED-TEAM.md
    python tools/redteam.py --html              # open challenges in browser
    python tools/redteam.py --partner "Alex"    # pre-fill attacker name
"""

import argparse
import html as html_mod
import random
import re
import sys
from datetime import date
from pathlib import Path

from htmlutil import html_page, badge, tag, ensure_output_dir, open_in_browser

REPO_ROOT = Path(__file__).resolve().parent.parent

# Challenge templates organized by category
CHALLENGE_TEMPLATES = {
    "viability": [
        "What happens if this market is actually 10x smaller than we think?",
        "If a well-funded competitor launched this tomorrow, what would they do differently — and why would users pick them?",
        "What's the smallest version of this that could fail? If even that fails, what does it tell us?",
        "Can you describe a realistic scenario where we build this, launch it, and nobody cares?",
        "What's the cost of being wrong about our core assumption? Can we survive it?",
        "If we had to convince a skeptical investor in 60 seconds, what's the weakest point in our pitch?",
        "What if the problem we're solving isn't painful enough for people to pay for a solution?",
        "Who specifically has tried this before and failed? What killed them?",
        "What's the most expensive mistake we could make in the first 6 months?",
        "If we can't get our first 100 users without paid ads, is this viable?",
    ],
    "technical": [
        "What's the hardest technical problem hiding in this plan that we haven't addressed?",
        "What happens when this needs to scale 100x — does the architecture survive?",
        "What's the most likely way this breaks in production that we haven't planned for?",
        "Are we building something that requires technology or infrastructure that doesn't exist yet (or isn't mature)?",
        "What's our plan B if our primary technical approach turns out to be a dead end?",
        "What dependency are we most vulnerable to? What happens if it disappears or changes terms?",
        "How do we handle the data problem — where does it come from, who owns it, what happens when it's wrong?",
        "What security or privacy disaster is waiting to happen with this design?",
        "If we had to build the MVP in 2 weeks, what would we cut — and would it still be worth launching?",
        "What's the integration or compatibility nightmare we're not seeing?",
    ],
    "business": [
        "What if our pricing is fundamentally wrong — too high for adoption or too low for sustainability?",
        "What's stopping a big platform from adding this as a feature and killing our market overnight?",
        "How do we acquire customers profitably? What's the realistic CAC?",
        "What if our target users love the idea but won't switch from what they're using now?",
        "What's the regulatory or legal risk we're ignoring?",
        "If retention is below 20% after month one, is the business model dead?",
        "What partnerships are we assuming will happen that might not?",
        "What's the worst-case scenario for our unit economics at scale?",
        "Are we building for a market that's growing, shrinking, or about to be disrupted by something else?",
        "What's the honest reason this hasn't been built already — is it opportunity or warning sign?",
    ],
    "user": [
        "Walk through the worst possible first-time user experience. What breaks?",
        "What if users want this to do something completely different from what we planned?",
        "Who's the anti-user — the person who would actively hate this? Why?",
        "What's the most confusing part of our product for a non-technical user?",
        "How does this fail for users with accessibility needs, low bandwidth, or older devices?",
        "What if users find a workaround that's good enough and never adopt our solution?",
        "What's the support nightmare scenario — the ticket that comes in 1000 times?",
        "If we showed the landing page to 10 strangers, how many would understand what this does?",
        "What user behavior are we assuming that might not be true?",
        "What's the emotional barrier to adoption — not the rational one?",
    ],
    "team": [
        "Do we have the skills to build this, or are we assuming we'll figure it out?",
        "What happens if one of us loses interest or availability halfway through?",
        "Are we aligned on what success looks like — really? Define it separately and compare.",
        "What decision will we disagree on most, and how will we resolve it?",
        "Are we building what excites us or what the market needs? Are those the same thing?",
        "What's our honest timeline — and what happens if it takes 3x longer?",
        "Are we the right people to build this, or would someone else do it better?",
        "What are we avoiding talking about?",
    ],
}


def extract_plan_context() -> dict:
    """Pull key context from PLAN.md."""
    pfile = REPO_ROOT / "PLAN.md"
    if not pfile.exists():
        return {}

    content = pfile.read_text(encoding="utf-8")
    context = {}

    sections = {
        "problem": r"## 1\. Problem.*?\n(.*?)(?=\n## \d|$)",
        "user": r"## 2\. Target User.*?\n(.*?)(?=\n## \d|$)",
        "value_prop": r"## 3\. Core Value.*?\n(.*?)(?=\n## \d|$)",
        "features": r"## 4\. Key Features.*?\n(.*?)(?=\n## \d|$)",
        "technical": r"## 6\. Technical Direction.*?\n(.*?)(?=\n## \d|$)",
        "business": r"## 7\. Business Model.*?\n(.*?)(?=\n## \d|$)",
    }

    for key, pattern in sections.items():
        match = re.search(pattern, content, re.DOTALL)
        if match:
            text = match.group(1).strip()
            # Filter out empty template lines
            lines = [l for l in text.splitlines()
                     if l.strip()
                     and not l.strip().startswith("_")
                     and not l.strip().startswith("<!--")
                     and l.strip() != "-"]
            if lines:
                context[key] = "\n".join(lines)

    return context


def extract_assumptions() -> list[str]:
    """Pull existing assumptions."""
    afile = REPO_ROOT / "ASSUMPTIONS.md"
    if not afile.exists():
        return []

    content = afile.read_text(encoding="utf-8")
    assumptions = []
    for line in content.splitlines():
        if line.startswith("|") and not line.startswith("| #") and not line.startswith("|---"):
            cells = [c.strip() for c in line.split("|")]
            cells = [c for c in cells if c]
            if len(cells) >= 2 and cells[1]:
                assumptions.append(cells[1])
    return assumptions


def select_challenges(count: int, focus: str | None = None) -> list[tuple[str, str]]:
    """Select random challenges, optionally focused on a category."""
    if focus:
        focus = focus.lower()
        matching = {k: v for k, v in CHALLENGE_TEMPLATES.items() if focus in k}
        if not matching:
            print(f"Warning: no category matching '{focus}', using all categories", file=sys.stderr)
            matching = CHALLENGE_TEMPLATES
    else:
        matching = CHALLENGE_TEMPLATES

    # Build pool with category labels
    pool = []
    for category, challenges in matching.items():
        for c in challenges:
            pool.append((category, c))

    random.shuffle(pool)
    return pool[:count]


def generate_contextual_challenges(context: dict, count: int) -> list[str]:
    """Generate challenges that reference specific repo content."""
    contextual = []

    if "problem" in context:
        contextual.append(f"Regarding our problem statement: is '{context['problem'][:100]}...' really the right framing? What if the real problem is something adjacent?")

    if "value_prop" in context:
        contextual.append(f"Our value proposition says: '{context['value_prop'][:100]}...' — can you find 3 existing tools that already claim this?")

    if "features" in context:
        contextual.append(f"Look at our feature list. Which feature would a user NEVER actually use? Be honest.")

    if "technical" in context:
        contextual.append(f"Our technical direction mentions: '{context['technical'][:100]}...' — what's the biggest risk with this stack choice?")

    assumptions = extract_assumptions()
    if assumptions:
        a = random.choice(assumptions)
        contextual.append(f"We're assuming: '{a}' — build the strongest case that this assumption is wrong.")

    random.shuffle(contextual)
    return contextual[:count]


def format_round(challenges: list[tuple[str, str]], contextual: list[str],
                 attacker: str = "[Name]", round_num: int = 1) -> str:
    """Format challenges as a red team round."""
    lines = [
        f"## Round {round_num}: Auto-generated — {date.today().isoformat()}",
        "",
        f"**Attacker: {attacker} (assisted by Red Team Randomizer)**",
        "",
    ]

    num = 1
    for category, challenge in challenges:
        lines.extend([
            f"> **Challenge {num}** [{category}]: {challenge}",
            "> ",
            "",
            f"**Response {num}:** [Defender name]",
            "",
            "> ",
            "",
            "---",
            "",
        ])
        num += 1

    for challenge in contextual:
        lines.extend([
            f"> **Challenge {num}** [contextual]: {challenge}",
            "> ",
            "",
            f"**Response {num}:** [Defender name]",
            "",
            "> ",
            "",
            "---",
            "",
        ])
        num += 1

    lines.extend([
        "**Verdict:** _What did we learn? What changed?_",
        "",
    ])

    return "\n".join(lines)


def write_to_red_team(round_text: str) -> None:
    """Append a round to RED-TEAM.md."""
    rfile = REPO_ROOT / "RED-TEAM.md"
    if not rfile.exists():
        print("Error: RED-TEAM.md not found", file=sys.stderr)
        sys.exit(1)

    content = rfile.read_text(encoding="utf-8")
    content = content.rstrip() + "\n\n---\n\n" + round_text + "\n"
    rfile.write_text(content, encoding="utf-8")


def generate_html(generic: list[tuple[str, str]], contextual: list[str],
                  attacker: str, round_num: int) -> str:
    """Generate an HTML page showing the red team challenges."""
    body = f"""
<p>Round {round_num} &mdash; Attacker: <strong>{html_mod.escape(attacker)}</strong></p>
"""

    num = 1
    for category, challenge in generic:
        body += f"""
<div class="card">
  <div style="margin-bottom: 0.5rem;">{tag(category, category)} Challenge {num}</div>
  <blockquote class="challenge">{html_mod.escape(challenge)}</blockquote>
  <blockquote class="response"><span class="empty">Awaiting response...</span></blockquote>
</div>
"""
        num += 1

    for challenge in contextual:
        body += f"""
<div class="card">
  <div style="margin-bottom: 0.5rem;">{tag('contextual', 'contextual')} Challenge {num}</div>
  <blockquote class="challenge">{html_mod.escape(challenge)}</blockquote>
  <blockquote class="response"><span class="empty">Awaiting response...</span></blockquote>
</div>
"""
        num += 1

    body += """
<div class="card" style="border-left: 4px solid var(--yellow);">
  <h3 style="margin-top: 0;">Verdict</h3>
  <p class="empty">What did we learn? What changed?</p>
</div>
"""

    return html_page(f"Red Team — Round {round_num}", body)


def count_existing_rounds() -> int:
    """Count how many rounds exist in RED-TEAM.md."""
    rfile = REPO_ROOT / "RED-TEAM.md"
    if not rfile.exists():
        return 0
    content = rfile.read_text(encoding="utf-8")
    return len(re.findall(r"^## Round \d+", content, re.MULTILINE))


def main():
    parser = argparse.ArgumentParser(description="Generate red team challenges")
    parser.add_argument("--count", "-c", type=int, default=5, help="Number of random challenges")
    parser.add_argument("--focus", "-f", type=str, default=None,
                        help="Focus area: viability, technical, business, user, team")
    parser.add_argument("--write", "-w", action="store_true", help="Append to RED-TEAM.md")
    parser.add_argument("--html", action="store_true", help="Open challenges in browser")
    parser.add_argument("--partner", "-p", type=str, default="[Name]", help="Attacker name")
    args = parser.parse_args()

    context = extract_plan_context()

    # Mix generic and contextual challenges
    contextual_count = min(2, args.count // 2) if context else 0
    generic_count = args.count - contextual_count

    generic = select_challenges(generic_count, args.focus)
    contextual = generate_contextual_challenges(context, contextual_count) if context else []

    round_num = count_existing_rounds() + 1
    round_text = format_round(generic, contextual, attacker=args.partner, round_num=round_num)

    if args.html:
        out = ensure_output_dir() / "redteam.html"
        out.write_text(generate_html(generic, contextual, args.partner, round_num), encoding="utf-8")
        print(f"Red team round written to {out}")
        open_in_browser(out)
    elif args.write:
        write_to_red_team(round_text)
        print(f"Round {round_num} with {len(generic) + len(contextual)} challenges appended to RED-TEAM.md")
    else:
        print(round_text)


if __name__ == "__main__":
    main()
