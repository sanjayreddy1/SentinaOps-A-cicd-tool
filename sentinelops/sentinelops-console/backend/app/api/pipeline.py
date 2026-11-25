"""Pipeline API Router - Realtime GitHub Code Ingestion, Security Scan & Cloud Deployment."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

try:
    from app.services.scanner import (
        run_security_pipeline,
        get_latest_pipeline_run,
        get_pipeline_history,
        get_pipeline_run_by_id,
    )
except ImportError:
    from ..services.scanner import (
        run_security_pipeline,
        get_latest_pipeline_run,
        get_pipeline_history,
        get_pipeline_run_by_id,
    )

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])


class PipelineRunRequest(BaseModel):
    repo_url: str = Field(
        default="https://github.com/sanjayreddy1/sanjusportfolio",
        description="GitHub repository URL or owner/repo to scan and deploy"
    )
    branch: str = Field(default="master", description="Git branch to scan and deploy")
    deploy_target: str = Field(default="pages", description="Deployment target (e.g. pages, render, cloud)")
    publish_directory: str = Field(default="dist", description="Publish directory for Render static site / build (e.g. dist, build)")


@router.post("/run")
async def run_pipeline(request: PipelineRunRequest) -> dict[str, Any]:
    """Execute on-demand real-time pipeline: Ingest GitHub repo -> Realtime OSV/CVE Security Scan -> Deploy -> Return Report, Live Web Link & Fix Suggestions."""
    result = await run_security_pipeline(
        repo_url=request.repo_url,
        branch=request.branch,
        deploy_target=request.deploy_target,
        publish_directory=request.publish_directory,
    )
    return result


@router.get("/latest")
def get_latest() -> dict[str, Any]:
    """Fetch the latest pipeline run, live security check report and cloud deployment link."""
    return get_latest_pipeline_run()


@router.get("/history")
def get_history() -> list[dict[str, Any]]:
    """List all historically deployed apps with links and security reports."""
    return get_pipeline_history()


@router.get("/report/{run_id}")
def get_report(run_id: str) -> dict[str, Any]:
    """Fetch specific deployment security check report by run ID."""
    report = get_pipeline_run_by_id(run_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Report {run_id} not found")
    return report
