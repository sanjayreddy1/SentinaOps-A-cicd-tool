"""Realtime GitHub webhook feed for the SentinelOps console.

Endpoints
---------
POST /webhooks/github          Receive a GitHub webhook (HMAC-SHA256 verified).
GET  /api/github/events        Server-Sent Events stream of live webhook events.
GET  /api/github/events/recent Last N events as JSON (useful for backfill/tests).

Events are kept in a bounded in-memory ring and fanned out to every connected
SSE subscriber. This keeps the console "live" without polling GitHub.
"""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import os
import time
import uuid
from collections import deque
from typing import Any, AsyncIterator

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse

router = APIRouter()

MAX_EVENTS = 100
_events: deque[dict[str, Any]] = deque(maxlen=MAX_EVENTS)
_subscribers: set[asyncio.Queue[str]] = set()

# Set GITHUB_WEBHOOK_SECRET in production to reject forged deliveries.
# With no secret configured the receiver runs in open dev mode.
WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "")


def _verify_signature(payload: bytes, signature: str | None) -> bool:
    """Verify GitHub's X-Hub-Signature-256 header against the shared secret."""
    if not WEBHOOK_SECRET:
        return True
    if not signature or not signature.startswith("sha256="):
        return False
    expected = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature.split("=", 1)[1])


def _commit_url(payload: dict[str, Any]) -> str | None:
    commits = payload.get("commits") or []
    if commits and isinstance(commits[0], dict):
        return commits[0].get("url")
    return payload.get("compare")


def _summarize(event_name: str, payload: dict[str, Any]) -> dict[str, Any]:
    """Turn a raw GitHub payload into a compact console event."""
    repo = (payload.get("repository") or {}).get("full_name", "unknown/unknown")
    actor = (payload.get("sender") or {}).get("login", "unknown")

    if event_name == "push":
        branch = str(payload.get("ref", "")).removeprefix("refs/heads/") or "unknown"
        commits = payload.get("commits") or []
        summary = f"{len(commits)} commit(s) pushed to {branch}"
        url = _commit_url(payload)
    elif event_name == "pull_request":
        pr = payload.get("pull_request") or {}
        summary = f"PR #{pr.get('number', '?')} {payload.get('action', 'updated')}: {pr.get('title', '')}".strip()
        url = pr.get("html_url")
    elif event_name == "ping":
        summary = "Webhook ping - GitHub connection verified"
        url = None
    elif event_name == "release":
        release = payload.get("release") or {}
        summary = f"Release {release.get('tag_name', '?')} {payload.get('action', 'published')}"
        url = release.get("html_url")
    else:
        summary = f"{event_name} event received"
        url = payload.get("html_url")

    return {
        "id": uuid.uuid4().hex,
        "type": event_name,
        "repo": repo,
        "actor": actor,
        "summary": summary,
        "url": url,
        "received_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


async def _publish(event: dict[str, Any]) -> None:
    _events.appendleft(event)
    message = f"data: {json.dumps(event)}\n\n"
    for queue in list(_subscribers):
        try:
            queue.put_nowait(message)
        except asyncio.QueueFull:
            _subscribers.discard(queue)


@router.post("/webhooks/github")
async def github_webhook(
    request: Request,
    x_github_event: str = Header("ping", alias="X-GitHub-Event"),
    x_hub_signature_256: str | None = Header(None, alias="X-Hub-Signature-256"),
) -> JSONResponse:
    body = await request.body()
    if not _verify_signature(body, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")
    try:
        payload = json.loads(body or b"{}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Payload must be an object")

    event = _summarize(x_github_event, payload)
    await _publish(event)
    return JSONResponse({"status": "ok", "id": event["id"]})


@router.get("/api/github/events/recent")
async def recent_events(limit: int = 20) -> dict[str, Any]:
    return {"events": list(_events)[: max(1, min(limit, MAX_EVENTS))]}


@router.get("/api/github/events")
async def stream_events(request: Request) -> StreamingResponse:
    """Stream webhook events to the console over Server-Sent Events."""

    async def event_generator() -> AsyncIterator[str]:
        queue: asyncio.Queue[str] = asyncio.Queue(maxsize=50)
        _subscribers.add(queue)
        try:
            yield ": connected\n\n"
            # Replay the newest event so a fresh connection has context.
            if _events:
                yield f"data: {json.dumps(_events[0])}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    yield await asyncio.wait_for(queue.get(), timeout=15)
                except asyncio.TimeoutError:
                    yield ": keep-alive\n\n"
        finally:
            _subscribers.discard(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
