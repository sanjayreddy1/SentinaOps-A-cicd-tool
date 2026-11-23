# Realtime GitHub connection

The console now has a **live GitHub activity feed**. GitHub sends webhooks to the
console backend, which verifies them and pushes each event to every open browser
over Server-Sent Events (SSE). No polling, no refresh.

```
GitHub repo ──webhook──▶ POST /webhooks/github ──fan-out──▶ GET /api/github/events (SSE) ──▶ Console "GitHub" tab
```

## Quick start (local)

```bash
# Start the whole stack (6 services + Valkey)
cd sentinelops-app
GITHUB_WEBHOOK_SECRET=my-secret docker compose up --build

# Frontend: http://localhost:4173   Console API: http://localhost:8001
```

Or run the pieces separately:

```bash
# Terminal 1 - console backend
cd sentinelops-console/backend
GITHUB_WEBHOOK_SECRET=my-secret uvicorn app.main:app --port 8000

# Terminal 2 - frontend (Vite proxies /api -> localhost:8000)
cd sentinelops-app/services/frontend
npm install && npm run dev
```

## Configure the GitHub webhook

1. Repo → **Settings** → **Webhooks** → **Add webhook**.
2. **Payload URL:**
   - Local: `https://<your-tunnel>.ngrok-free.app/webhooks/github`
     (e.g. `ngrok http 8001` when using docker compose, or `ngrok http 8000`
     when running uvicorn directly).
   - Deployed: `https://<console-api-host>/webhooks/github`.
3. **Content type:** `application/json`.
4. **Secret:** the same value as `GITHUB_WEBHOOK_SECRET`.
5. **Events:** select *Pushes*, *Pull requests*, *Releases* (and *Ping* is sent
   automatically to verify the connection).

When the webhook is saved, GitHub sends a `ping` event — the feed shows
"Webhook ping - GitHub connection verified" immediately.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/webhooks/github` | Receives and HMAC-verifies GitHub webhooks |
| `GET` | `/api/github/events` | SSE stream of live events |
| `GET` | `/api/github/events/recent?limit=20` | Last 20 events as JSON |

The `X-Hub-Signature-256` header is checked with `hmac.compare_digest` when a
secret is configured. Without a secret the receiver runs in open dev mode.

## Frontend configuration

`VITE_API_BASE_URL` selects the console API origin:

- Empty (default) — same origin; Vite's `/api` proxy handles local dev.
- `http://localhost:8001` — when running the docker-compose stack.
- Your deployed API URL — for the GitHub Pages build.

Copy `sentinelops-app/services/frontend/.env.example` to `.env` and set it.

## Tests

```bash
cd sentinelops-console/backend
pip install -r requirements-dev.txt
python -m pytest -q        # webhook signature, push/PR/ping events, bounded ring

cd ../sentinelops-app/services/frontend
npm test                   # SSE connection + live event rendering
```
