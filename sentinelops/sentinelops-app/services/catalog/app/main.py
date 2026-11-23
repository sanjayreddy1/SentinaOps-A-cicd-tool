from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import Response
from prometheus_client import REGISTRY, Counter, generate_latest

REQUESTS = Counter("api_requests_total", "Total API requests", ["service", "status"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="SentinelOps Catalog", lifespan=lifespan)


@app.middleware("http")
async def count_requests(request: Request, call_next):
    response = await call_next(request)
    REQUESTS.labels(service="catalog", status=str(response.status_code)).inc()
    return response


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/readyz")
def readyz():
    return {"status": "ok"}


@app.get("/metrics")
def metrics():
    return Response(generate_latest(REGISTRY), media_type="text/plain; version=0.0.4; charset=utf-8")


@app.get("/products")
def products():
    return {
        "products": [
            {"id": "sku-1", "name": "SentinelOps Tee", "price": 25},
            {"id": "sku-2", "name": "Realtime Hoodie", "price": 48},
        ]
    }
