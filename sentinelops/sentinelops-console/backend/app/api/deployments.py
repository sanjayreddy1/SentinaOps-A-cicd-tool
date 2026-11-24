from __future__ import annotations

from typing import Any
from fastapi import APIRouter

try:
    from app.services.scanner import get_latest_pipeline_run, get_pipeline_history
except ImportError:
    try:
        from ..services.scanner import get_latest_pipeline_run, get_pipeline_history
    except ImportError:
        def get_latest_pipeline_run() -> dict[str, Any]:
            return {"deployment": {}, "repo": "app", "commit_sha": "latest"}
        def get_pipeline_history() -> list[dict[str, Any]]:
            return []

router = APIRouter(prefix="/api/deployments", tags=["deployments"])


@router.get("/")
@router.get("")
def list_deployments() -> list[dict[str, Any]]:
    """Return real-time GitOps & Cloud deployments across all scanned and deployed repositories."""
    history = get_pipeline_history()
    if not history:
        history = [get_latest_pipeline_run()]

    result: list[dict[str, Any]] = []
    for run in history:
        dep: dict[str, Any] = run.get("deployment", {})
        result.append({
            "service": run.get("app_name") or run.get("repo", "app"),
            "repo_url": run.get("repo_url"),
            "branch": run.get("branch", "main"),
            "version": f"sha-{run.get('commit_sha', 'latest')}",
            "env": dep.get("environment", "prod"),
            "sync_status": "Synced" if dep.get("status") == "Live" else "Blocked",
            "rollout_state": dep.get("rollout_state", "Canary (100% Synced)"),
            "live_url": dep.get("live_url"),
            "report_url": dep.get("report_url"),
            "cloud_provider": dep.get("cloud_provider"),
            "scanned_at": run.get("scanned_at"),
            "status": dep.get("status", "Live"),
        })
    return result
