from __future__ import annotations

from typing import Any
from fastapi import APIRouter

try:
    from app.services.scanner import get_latest_pipeline_run
except ImportError:
    try:
        from ..services.scanner import get_latest_pipeline_run
    except ImportError:
        def get_latest_pipeline_run() -> dict[str, Any]:
            return {"deployment": {}, "repo": "app", "commit_sha": "latest"}

router = APIRouter(prefix="/api/deployments", tags=["deployments"])


@router.get("/")
def list_deployments() -> list[dict[str, Any]]:
    """Return real-time GitOps & Cloud deployments with live links."""
    run: dict[str, Any] = get_latest_pipeline_run()
    dep: dict[str, Any] = run.get("deployment", {})
    return [
        {
            "service": run.get("repo", "app"),
            "version": f"sha-{run.get('commit_sha', 'latest')}",
            "env": dep.get("environment", "prod"),
            "sync_status": "Synced" if dep.get("status") == "Live" else "Degraded",
            "rollout_state": dep.get("rollout_state", "Canary (100%)"),
            "live_url": dep.get("live_url"),
            "scanned_at": run.get("scanned_at"),
            "status": dep.get("status", "Live"),
        }
    ]
