# SentinelOps App — Demo E-Commerce Microservices

Five-service e-commerce shop that the SentinelOps platform runs on top of:

| Service | Stack | Port | Notes |
| --- | --- | --- | --- |
| frontend | React 19 + Vite 6 + TS 5.8, served by nginx | 80 | Single frontend: Demo Shop + SentinelOps Console (Supabase Auth + GitHub OAuth) |
| api-gateway | Go 1.24 | 8080 | Edge gateway, rate limits, ingress entrypoint |
| catalog | Python 3.12 + FastAPI 0.115 | 8000 | Product catalog |
| orders | Go 1.24 | 8080 | Order creation, publishes to Valkey stream |
| payments | Go 1.24 | 8080 | Consumes orders stream, processes payment |

## Runtime contract (per blueprint 5.4)

Every service exposes:
- `GET /healthz` - liveness
- `GET /readyz` - readiness
- Prometheus metrics: request rate, error rate, latency histogram

Orders publishes to a Valkey (Redis-compatible) stream that payments consumes
(KEDA scales on stream length).

A feature flag / env var injects errors or latency so you can deliberately ship a bad
version and demonstrate automatic rollback.

## Run the whole stack locally

```bash
cd sentinelops-app
docker compose up --build
# Frontend http://localhost:4173 | API gateway :8080 | catalog :8000
# orders :8081 | payments :8082 | console :8001 | Valkey :6379
```

The console API at `:8001` receives GitHub webhooks at `POST /webhooks/github`
and streams them to the frontend's **GitHub** tab via SSE. See
`../REALTIME_GITHUB.md` for webhook setup.

## Local build

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/<user>/sentinelops-app/services/api-gateway ./services/api-gateway
```
