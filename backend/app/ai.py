"""AI adapter for ReachStack's fixture-backed assistant."""

from __future__ import annotations

import os
import json
from pathlib import Path

from app.models import RetrievalAnswerItem, RetrievalCitation, SearchResult

DEFAULT_MODEL = "gpt-4.1-mini"

SYSTEM_PROMPT = """
You are the ReachStack assistant for a professional services firm.
Answer using only the supplied demo records. Do not invent client facts.
If the user asks to perform an action, explain what should happen in the product
instead of claiming that external systems were changed.
Call out source-of-truth, review, approval, sync, billing, or scheduling risks
when they are visible in the records.

Return JSON only. Do not use Markdown.
Shape:
{
  "overview": "one plain-English sentence",
  "items": [
    {
      "title": "short label",
      "detail": "one concise sentence",
      "kind": "action | finding | risk | note",
      "priority": "high | medium | low",
      "source_indexes": [1]
    }
  ],
  "risks": ["optional short risk or caveat"]
}

Rules:
- Always include an overview.
- Use 2-5 items when records are available.
- Split mixed work into separate items.
- For "what do I have to do" questions, make items action-oriented.
- For billing questions, distinguish draft/recorded billable time from submitted, approved, billed, or invoiced time.
- Do not use staff weekly timesheets as client billing evidence unless the question is about staff timesheets.
- Use source_indexes to point at the numbered demo records you relied on.
""".strip()


def load_local_env() -> None:
    """Load backend/.env without adding another dotenv dependency."""
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def openai_model() -> str:
    return os.getenv("OPENAI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL


def is_openai_configured() -> bool:
    load_local_env()
    return bool(os.getenv("OPENAI_API_KEY"))


def build_citations(matches: list[SearchResult], structured: dict[str, object] | None = None) -> list[RetrievalCitation]:
    ordered_matches = order_matches_by_source_indexes(matches, structured)
    return [
        RetrievalCitation(
            id=match.id,
            title=match.title,
            source_type=match.type,
            snippet=match.snippet,
            score=match.score,
            client_id=match.client_id,
            engagement_id=match.engagement_id,
        )
        for match in ordered_matches
    ]


def order_matches_by_source_indexes(
    matches: list[SearchResult],
    structured: dict[str, object] | None = None,
) -> list[SearchResult]:
    source_indexes: list[int] = []
    if structured:
        items = structured.get("items")
        if isinstance(items, list):
            for item in items:
                if not isinstance(item, dict):
                    continue
                indexes = item.get("source_indexes")
                if not isinstance(indexes, list):
                    continue
                for index in indexes:
                    try:
                        source_indexes.append(int(index) - 1)
                    except (TypeError, ValueError):
                        continue

    ordered: list[SearchResult] = []
    seen: set[int] = set()
    for index in source_indexes:
        if index < 0 or index >= len(matches) or index in seen:
            continue
        ordered.append(matches[index])
        seen.add(index)

    for index, match in enumerate(matches):
        if index not in seen:
            ordered.append(match)
    return ordered


def fallback_structured_answer(matches: list[SearchResult], subject: str) -> dict[str, object]:
    if not matches:
        return {
            "overview": "No matching records were found in the indexed client workspace.",
            "items": [],
            "risks": [],
        }

    items = [
        RetrievalAnswerItem(
            title=match.title,
            detail=match.snippet,
            kind="action" if match.type in ("queue", "document", "time") else "finding",
            priority="high" if match.type == "queue" or "review" in match.subtitle.lower() else "medium",
            source_indexes=[index],
        ).model_dump()
        for index, match in enumerate(matches[:5], start=1)
    ]
    return {
        "overview": (
            f"ReachStack found {len(matches)} relevant record"
            f"{'' if len(matches) == 1 else 's'} for {subject}."
        ),
        "items": items,
        "risks": [],
    }


def answer_text(structured: dict[str, object]) -> str:
    overview = str(structured.get("overview") or "").strip()
    items = structured.get("items")
    risks = structured.get("risks")
    lines: list[str] = []
    if overview:
        lines.append(overview)
    if isinstance(items, list):
        for item in items:
            if not isinstance(item, dict):
                continue
            title = str(item.get("title") or "").strip()
            detail = str(item.get("detail") or "").strip()
            if title and detail:
                lines.append(f"- {title}: {detail}")
            elif detail:
                lines.append(f"- {detail}")
    if isinstance(risks, list):
        for risk in risks:
            risk_text = str(risk or "").strip()
            if risk_text:
                lines.append(f"- Risk: {risk_text}")
    return "\n".join(lines).strip() or "No answer was generated."


def answer_with_openai(query: str, matches: list[SearchResult], subject: str) -> tuple[dict[str, object], str, str | None]:
    load_local_env()
    model = openai_model()

    if not os.getenv("OPENAI_API_KEY"):
        return fallback_structured_answer(matches, subject), "fallback", None

    if not matches:
        return fallback_structured_answer(matches, subject), "fallback", None

    try:
        from openai import OpenAI
    except ImportError:
        structured = {
            "overview": "OpenAI is configured, but the backend package is not installed yet.",
            "items": [
                {
                    "title": "Install backend package",
                    "detail": "Run the launcher again or run `pip install -e .` inside `backend`.",
                    "kind": "action",
                    "priority": "high",
                    "source_indexes": [],
                }
            ],
            "risks": [],
        }
        return structured, "fallback", None

    context = "\n\n".join(
        (
            f"[{index}] type: {match.type}\n"
            f"title: {match.title}\n"
            f"subtitle: {match.subtitle}\n"
            f"snippet: {match.snippet}"
        )
        for index, match in enumerate(matches, start=1)
    )
    user_input = (
        f"User question: {query}\n"
        f"Scope: {subject}\n\n"
        f"Demo records:\n{context}"
    )

    try:
        client = OpenAI()
        response = client.responses.create(
            model=model,
            instructions=SYSTEM_PROMPT,
            input=user_input,
            max_output_tokens=500,
        )
    except Exception:
        return fallback_structured_answer(matches, subject), "fallback", model

    structured = parse_structured_answer(response_text(response))
    if not structured:
        return fallback_structured_answer(matches, subject), "fallback", model

    return structured, "openai", model


def parse_structured_answer(text: str) -> dict[str, object] | None:
    if not text.strip():
        return None

    raw = text.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:].strip()

    if not raw.startswith("{"):
        start = raw.find("{")
        end = raw.rfind("}")
        if start == -1 or end == -1 or end <= start:
            return None
        raw = raw[start:end + 1]

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return None

    if not isinstance(parsed, dict):
        return None

    overview = str(parsed.get("overview") or "").strip()
    raw_items = parsed.get("items")
    raw_risks = parsed.get("risks")
    items: list[dict[str, object]] = []

    if isinstance(raw_items, list):
        for raw_item in raw_items[:6]:
            if not isinstance(raw_item, dict):
                continue
            title = str(raw_item.get("title") or "").strip()
            detail = str(raw_item.get("detail") or "").strip()
            if not detail:
                continue
            kind = str(raw_item.get("kind") or "finding").strip().lower()
            priority = raw_item.get("priority")
            source_indexes = raw_item.get("source_indexes")
            clean_source_indexes: list[int] = []
            if isinstance(source_indexes, list):
                for source_index in source_indexes[:4]:
                    try:
                        clean_source_indexes.append(int(source_index))
                    except (TypeError, ValueError):
                        continue
            item = RetrievalAnswerItem(
                title=title or "Item",
                detail=detail,
                kind=kind if kind in ("action", "finding", "risk", "note") else "finding",
                priority=priority if priority in ("high", "medium", "low") else None,
                source_indexes=clean_source_indexes,
            )
            items.append(item.model_dump())

    risks = [str(risk).strip() for risk in raw_risks if str(risk).strip()] if isinstance(raw_risks, list) else []
    if not overview and items:
        overview = "ReachStack found relevant records for this request."

    return {
        "overview": overview,
        "items": items,
        "risks": risks[:4],
    }


def response_text(response: object) -> str:
    output_text = getattr(response, "output_text", None)
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    chunks: list[str] = []
    for item in getattr(response, "output", []) or []:
        for content in getattr(item, "content", []) or []:
            text = getattr(content, "text", None)
            if isinstance(text, str) and text.strip():
                chunks.append(text.strip())
    return "\n".join(chunks).strip()
