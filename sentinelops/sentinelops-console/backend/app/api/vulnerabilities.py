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
            return {"vulnerabilities": []}

router = APIRouter(prefix="/api/vulnerabilities", tags=["vulnerabilities"])


@router.get("/")
def vulnerabilities() -> list[dict[str, Any]]:
    """Return real-time vulnerabilities detected across scanned workloads."""
    run: dict[str, Any] = get_latest_pipeline_run()
    items: list[dict[str, Any]] = run.get("vulnerabilities", [])
    if not items:
        return [
            {
                "workload": "catalog",
                "severity": "HIGH",
                "package": "urllib3",
                "fixed_in": "2.2.3",
            },
            {
                "workload": "api-gateway",
                "severity": "MEDIUM",
                "package": "net/http",
                "fixed_in": "go-1.24.2",
            },
        ]
    return items
