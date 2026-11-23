import { useQuery } from "@tanstack/react-query";

const badgeFor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "synced":
    case "pass":
    case "resolved":
      return "badge-pass";
    case "progressing":
    case "degraded":
    case "firing":
      return "badge-warn";
    case "failed":
    case "aborted":
      return "badge-fail";
    case "running":
      return "badge-running";
    case "critical":
      return "badge-critical";
    case "high":
      return "badge-high";
    case "medium":
      return "badge-medium";
    case "low":
      return "badge-low";
    default:
      return "badge-pass";
  }
};

const borderColorFor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "firing":
      return "#dc2626";
    case "acknowledged":
      return "#f59e0b";
    case "resolved":
      return "#22c55e";
    default:
      return "#4169e1";
  }
};

const remediationIcon = (action: string) => {
  if (!action) return "🔄";
  const a = action.toLowerCase();
  if (a.includes("restart")) return "🔄";
  if (a.includes("scale")) return "📈";
  if (a.includes("rollback")) return "⏪";
  if (a.includes("drain")) return "🚿";
  return "🔄";
};

const MOCK_TIMELINE = [
  { time: "12:01:03", label: "Alert fired", detail: "High error rate detected on payments service", color: "#dc2626" },
  { time: "12:01:08", label: "Auto-remediation triggered", detail: "Restarting deployment: payments (1→3 replicas)", color: "#f59e0b" },
  { time: "12:01:45", label: "Service recovered", detail: "Error rate dropped to 0.1%, health check passing", color: "#22c55e" },
];

export default function Incidents() {
  const { data } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => (await fetch("/api/incidents")).json(),
  });

  const incidents = Array.isArray(data) ? data : data ? [data] : [];

  const firing = incidents.filter((i: any) => i?.status?.toLowerCase() === "firing").length;
  const acknowledged = incidents.filter((i: any) => i?.status?.toLowerCase() === "acknowledged").length;
  const resolved = incidents.filter((i: any) => i?.status?.toLowerCase() === "resolved").length;

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 className="text-2xl font-bold" style={{ margin: 0 }}>
          Incidents &amp; Self-Healing
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "4px" }}>
          Real-time alerts, automated remediation, and time-to-recover metrics.
        </p>
      </div>

      {/* Summary Stat Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {[
          { emoji: "🔴", count: firing, label: "Firing", color: "#dc2626" },
          { emoji: "🟡", count: acknowledged, label: "Acknowledged", color: "#f59e0b" },
          { emoji: "🟢", count: resolved, label: "Resolved", color: "#22c55e" },
        ].map(({ emoji, count, label, color }) => (
          <div
            key={label}
            className="card"
            style={{ borderTop: `3px solid ${color}`, textAlign: "center", padding: "16px" }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{emoji}</div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color, lineHeight: 1 }}>{count}</div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginTop: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Incident Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
        {incidents.length === 0 && (
          <div className="card" style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>
            No incidents found.
          </div>
        )}
        {incidents.map((i: any, idx: number) => {
          const status = i?.status ?? "unknown";
          const borderColor = borderColorFor(status);
          return (
            <div
              key={idx}
              className="card"
              style={{ borderLeft: `4px solid ${borderColor}`, padding: "16px 20px" }}
            >
              {/* Top Row: severity badge + alert name + status badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  {i.severity && (
                    <span className={`badge badge-${i.severity?.toLowerCase() ?? "low"}`}>
                      {i.severity}
                    </span>
                  )}
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      color: "var(--text)",
                    }}
                  >
                    {i.alert ?? "Unknown Alert"}
                  </span>
                </div>
                <span className={`badge ${badgeFor(status)}`} style={{ flexShrink: 0 }}>
                  {status}
                </span>
              </div>

              {/* Second Row: service + remediation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{ fontSize: "0.8125rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <span>🖥️</span>
                  <span style={{ color: "var(--text)", fontWeight: 500 }}>{i.service ?? "unknown"}</span>
                </span>
                {i.remediation && (
                  <span
                    style={{ fontSize: "0.8125rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}
                  >
                    <span>{remediationIcon(i.remediation)}</span>
                    <span>{i.remediation}</span>
                  </span>
                )}
              </div>

              {/* Third Row: recovered in Xs */}
              {i.recovered_seconds != null && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span>⏱️</span>
                  <span>
                    Recovered in{" "}
                    <strong style={{ color: "var(--text)" }}>{i.recovered_seconds}s</strong>
                  </span>
                </div>
              )}

              {/* Observability links */}
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  gap: "14px",
                  flexWrap: "wrap",
                }}
              >
                <a href="#" style={{ fontSize: "0.75rem", color: "var(--link)", display: "flex", alignItems: "center", gap: "4px" }}>
                  📊 Grafana →
                </a>
                <a href="#" style={{ fontSize: "0.75rem", color: "var(--link)", display: "flex", alignItems: "center", gap: "4px" }}>
                  📋 Loki →
                </a>
                <a href="#" style={{ fontSize: "0.75rem", color: "var(--link)", display: "flex", alignItems: "center", gap: "4px" }}>
                  🔍 Tempo →
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Self-Healing Timeline */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h3
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ⚡ Self-Healing Timeline
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Automated remediation sequence
          </p>
        </div>
        <div style={{ position: "relative", paddingLeft: "28px" }}>
          {/* Vertical connecting line */}
          <div
            style={{
              position: "absolute",
              left: "9px",
              top: "12px",
              bottom: "12px",
              width: "2px",
              background: "var(--border)",
            }}
          />
          {MOCK_TIMELINE.map((event, idx) => (
            <div
              key={idx}
              style={{ position: "relative", marginBottom: idx < MOCK_TIMELINE.length - 1 ? "24px" : 0 }}
            >
              {/* Circle dot */}
              <div
                style={{
                  position: "absolute",
                  left: "-25px",
                  top: "2px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: event.color,
                  border: "2px solid var(--surface)",
                  boxShadow: `0 0 0 2px ${event.color}55`,
                  zIndex: 1,
                }}
              />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>
                    {event.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {event.time}
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                  {event.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
