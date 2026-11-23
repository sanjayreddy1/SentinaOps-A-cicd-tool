"""Tests for the realtime GitHub webhook feed."""

import hashlib
import hmac
import json

import pytest
from fastapi.testclient import TestClient

from app.api import github_events
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_feed(monkeypatch):
    """Isolate each test and disable signature verification by default."""
    github_events._events.clear()
    monkeypatch.setattr(github_events, "WEBHOOK_SECRET", "")
    yield
    github_events._events.clear()


def test_recent_events_starts_empty():
    response = client.get("/api/github/events/recent")
    assert response.status_code == 200
    assert response.json() == {"events": []}


def test_ping_webhook_is_stored_and_summarized():
    response = client.post(
        "/webhooks/github",
        json={
            "zen": "Keep it logically awesome.",
            "repository": {"full_name": "acme/sentinelops"},
            "sender": {"login": "octocat"},
        },
        headers={"X-GitHub-Event": "ping"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["id"]

    recent = client.get("/api/github/events/recent").json()["events"]
    assert len(recent) == 1
    assert recent[0]["type"] == "ping"
    assert recent[0]["repo"] == "acme/sentinelops"
    assert recent[0]["actor"] == "octocat"
    assert "connection verified" in recent[0]["summary"]


def test_push_webhook_summarizes_branch_and_commits():
    response = client.post(
        "/webhooks/github",
        json={
            "ref": "refs/heads/main",
            "commits": [{"url": "https://github.com/acme/sentinelops/commit/abc"}],
            "repository": {"full_name": "acme/sentinelops"},
            "sender": {"login": "octocat"},
        },
        headers={"X-GitHub-Event": "push"},
    )
    assert response.status_code == 200
    event = client.get("/api/github/events/recent").json()["events"][0]
    assert event["type"] == "push"
    assert event["summary"] == "1 commit(s) pushed to main"
    assert event["url"].endswith("/commit/abc")


def test_pull_request_webhook_summarizes_pr():
    client.post(
        "/webhooks/github",
        json={
            "action": "opened",
            "pull_request": {"number": 42, "title": "Add realtime feed", "html_url": "https://github.com/acme/sentinelops/pull/42"},
            "repository": {"full_name": "acme/sentinelops"},
            "sender": {"login": "octocat"},
        },
        headers={"X-GitHub-Event": "pull_request"},
    )
    event = client.get("/api/github/events/recent").json()["events"][0]
    assert event["type"] == "pull_request"
    assert "PR #42 opened" in event["summary"]


def test_bad_signature_is_rejected(monkeypatch):
    secret = "super-secret"
    monkeypatch.setattr(github_events, "WEBHOOK_SECRET", secret)
    payload = json.dumps({"repository": {"full_name": "acme/sentinelops"}}).encode()

    bad = client.post(
        "/webhooks/github",
        content=payload,
        headers={"X-GitHub-Event": "push", "X-Hub-Signature-256": "sha256=deadbeef", "Content-Type": "application/json"},
    )
    assert bad.status_code == 401

    good_sig = "sha256=" + hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    good = client.post(
        "/webhooks/github",
        content=payload,
        headers={"X-GitHub-Event": "push", "X-Hub-Signature-256": good_sig, "Content-Type": "application/json"},
    )
    assert good.status_code == 200
    assert len(client.get("/api/github/events/recent").json()["events"]) == 1


def test_event_ring_is_bounded():
    for index in range(github_events.MAX_EVENTS + 10):
        github_events._events.appendleft({"id": str(index), "type": "push"})
    assert len(client.get("/api/github/events/recent", params={"limit": 500}).json()["events"]) == github_events.MAX_EVENTS
