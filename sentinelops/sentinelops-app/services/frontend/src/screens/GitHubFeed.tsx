import { useEffect, useState } from "react";

type GitHubEvent = {
  id: string;
  type: string;
  repo: string;
  actor: string;
  summary: string;
  url: string | null;
  received_at: string;
};

type Connection = "connecting" | "live" | "offline";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const TYPE_LABELS: Record<string, string> = {
  push: "Push",
  pull_request: "Pull request",
  ping: "Connected",
  release: "Release",
};

function eventIcon(type: string) {
  switch (type) {
    case "push":
      return "⑂";
    case "pull_request":
      return "⇄";
    case "release":
      return "⚑";
    default:
      return "●";
  }
}

/** Returns the CSS border-left color for a given event type */
function eventBorderColor(type: string): string {
  switch (type) {
    case "push":
      return "#3B82F6"; // blue
    case "pull_request":
      return "#8B5CF6"; // purple
    case "release":
      return "#22C55E"; // green
    default:
      return "#4B5563"; // gray
  }
}

/** Returns a badge class for the event type pill */
function eventBadgeClass(type: string): string {
  switch (type) {
    case "push":
      return "badge badge-running";
    case "pull_request":
      return "badge badge-royal";
    case "release":
      return "badge badge-pass";
    default:
      return "badge badge-warn";
  }
}

/** Avatar color based on first character */
function avatarColor(actor: string): string {
  const colors = [
    "#4169E1",
    "#8B5CF6",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#EC4899",
  ];
  const index = actor.charCodeAt(0) % colors.length;
  return colors[index];
}

/** Relative time helper: "2 min ago", "just now", etc. */
function relativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 10) return "just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return dateStr;
  } catch {
    return dateStr;
  }
}

export default function GitHubFeed() {
  // ── All existing state & logic preserved exactly ──
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [connection, setConnection] = useState<Connection>("connecting");

  useEffect(() => {
    const source = new EventSource(`${API_BASE}/api/github/events`);

    source.onopen = () => setConnection("live");
    source.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as GitHubEvent;
        if (!event?.id) return;
        setEvents((previous) =>
          [event, ...previous.filter((item) => item.id !== event.id)].slice(0, 50),
        );
      } catch {
        // Ignore SSE comments / keep-alive frames.
      }
    };
    source.onerror = () => setConnection("offline");

    return () => source.close();
  }, []);

  const statusLabel =
    connection === "live" ? "Live" : connection === "connecting" ? "Connecting" : "Offline";

  // ── Connection status strip config ──
  const statusStrip =
    connection === "live"
      ? {
          border: "#22C55E",
          bg: "rgba(34,197,94,0.07)",
          text: "🟢 Connected to webhook SSE stream",
        }
      : connection === "connecting"
        ? {
            border: "#3B82F6",
            bg: "rgba(59,130,246,0.07)",
            text: "🔵 Connecting...",
          }
        : {
            border: "#DC2626",
            bg: "rgba(220,38,38,0.07)",
            text: "🔴 SSE stream offline — check /webhooks/github",
          };

  return (
    <div>
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">GitHub Activity</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Realtime webhook feed — pushes, pull requests and releases as they happen.
          </p>
        </div>
        <div className="row">
          {/* Live / Offline badge — larger & prominent */}
          <span
            className={`badge ${connection === "offline" ? "badge-fail" : connection === "live" ? "badge-pass" : "badge-running"}`}
            style={{ fontSize: "0.8rem", padding: "5px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <span
              className={`live-dot ${connection === "offline" ? "is-offline" : ""}`}
              aria-hidden="true"
            />
            {statusLabel}
          </span>
          <button
            type="button"
            className="btn btn-white btn-sm"
            onClick={() => setEvents([])}
          >
            Clear feed
          </button>
        </div>
      </div>

      {/* ── Connection status strip ── */}
      <div
        className="mt-4 rounded-lg px-4 py-3 text-sm font-medium"
        style={{
          borderLeft: `4px solid ${statusStrip.border}`,
          background: statusStrip.bg,
          color: "var(--text)",
        }}
      >
        {statusStrip.text}
      </div>

      {/* ── Event list / empty state ── */}
      <div className="card mt-6 max-w-4xl">
        {events.length === 0 ? (
          /* Empty state */
          <div className="py-16 text-center">
            <div className="text-6xl" aria-hidden="true">
              ⌁
            </div>
            <p className="mt-4 text-xl font-semibold text-white">Waiting for GitHub events…</p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Configure a repository webhook to start seeing activity here in real time.
            </p>
            <pre
              className="mx-auto mt-6 max-w-sm text-left text-xs"
              style={{ userSelect: "all" }}
            >
              POST https://your-domain/webhooks/github
            </pre>
          </div>
        ) : (
          /* Event stream */
          <ul className="stack" aria-live="polite">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-start gap-3 rounded-lg p-4 transition-all"
                style={{
                  borderLeft: `4px solid ${eventBorderColor(event.type)}`,
                  background: "var(--surface-2)",
                  border: `1px solid var(--border)`,
                  borderLeftWidth: 4,
                  borderLeftColor: eventBorderColor(event.type),
                }}
              >
                {/* Actor avatar */}
                <div
                  className="flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{
                    width: 36,
                    height: 36,
                    background: avatarColor(event.actor),
                    fontFamily: "var(--font-sans)",
                  }}
                  title={event.actor}
                  aria-hidden="true"
                >
                  {event.actor.charAt(0).toUpperCase()}
                </div>

                {/* Main content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Event type pill */}
                    <span className={eventBadgeClass(event.type)}>
                      {eventIcon(event.type)}{" "}
                      {TYPE_LABELS[event.type] ?? event.type}
                    </span>
                    {/* Repo monospace badge */}
                    <span
                      className="badge badge-warn"
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
                    >
                      {event.repo}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      by {event.actor}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white">{event.summary}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {relativeTime(event.received_at)}
                  </p>
                </div>

                {/* View link */}
                {event.url ? (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm shrink-0"
                  >
                    View →
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
