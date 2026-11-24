"""Pipeline API Router - Realtime GitHub Code Ingestion, Security Scan & Cloud Deployment."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel, Field

try:
    from app.services.scanner import (
        run_security_pipeline,
        get_latest_pipeline_run,
        get_pipeline_history,
    )
except ImportError:
    from ..services.scanner import (
        run_security_pipeline,
        get_latest_pipeline_run,
        get_pipeline_history,
    )

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])


class PipelineRunRequest(BaseModel):
    repo_url: str = Field(
        default="https://github.com/sanjayreddy1/SentinaOps-A-cicd-tool",
        description="GitHub repository URL or owner/repo to scan and deploy"
    )
    branch: str = Field(default="main", description="Git branch to scan and deploy")
    deploy_target: str = Field(default="cloud", description="Cloud deployment target (e.g. cloud, pages, k8s)")


@router.post("/run")
async def run_pipeline(request: PipelineRunRequest) -> dict[str, Any]:
    """Execute real-time pipeline: Ingest GitHub repo -> Realtime OSV/CVE Security Scan -> Deploy -> Return Report, Live Web Link & Fix Suggestions."""
    result = await run_security_pipeline(
        repo_url=request.repo_url,
        branch=request.branch,
        deploy_target=request.deploy_target,
    )
    return result


@router.get("/latest")
def get_latest() -> dict[str, Any]:
    """Fetch the latest pipeline run, live security check report and cloud deployment link."""
    return get_latest_pipeline_run()


@router.get("/history")
def get_history() -> list[dict[str, Any]]:
    """List historical pipeline runs."""
    return get_pipeline_history()
