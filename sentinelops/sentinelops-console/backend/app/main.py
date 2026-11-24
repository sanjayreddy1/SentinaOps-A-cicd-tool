"""SentinelOps Console backend - FastAPI service."""

import os
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import overview, deployments, rollouts, vulnerabilities, policy, incidents, remediations, costs, chaos, audit
from app.api import github_events, pipeline

app = FastAPI(title="SentinelOps Console API")

# Comma-separated origins so the same image works locally (Vite 5173), in the
# docker-compose stack (4173) and behind the GitHub Pages deployment.
_default_origins = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:4173,http://127.0.0.1:4173"
)
_allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(overview.router)
app.include_router(deployments.router)
app.include_router(rollouts.router)
app.include_router(vulnerabilities.router)
app.include_router(policy.router)
app.include_router(incidents.router)
app.include_router(remediations.router)
app.include_router(costs.router)
app.include_router(chaos.router)
app.include_router(audit.router)
app.include_router(github_events.router)
app.include_router(pipeline.router)


@app.get("/healthz")
def healthz() -> dict[str, Any]:
    return {"status": "ok"}


@app.get("/readyz")
def readyz() -> dict[str, Any]:
    return {"status": "ok"}
