import { useQuery } from "@tanstack/react-query";

const badgeFor = (status: string) => {
  switch (status.toLowerCase()) {
    case "synced":
      return "badge-pass";
    case "progressing":
    case "degraded":
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

const CANARY_STEPS = [
  { pct: 10, label: "10%" },
  { pct: 30, label: "30%" },
  { pct: 60, label: "60%" },
  { pct: 100, label: "100%" },
];
const CURRENT_CANARY_STEP = 2; // 0-indexed → 60%

export default function Deployments() {
  const { data } = useQuery({
    queryKey: ["deployments"],
    queryFn: async () => (await fetch("/api/deployments")).json(),
  });

  const deployments = Array.isArray(data) ? data : data ? [data] : [];

  // Mock summary numbers
  const totalToday = deployments.length || 12;
  const synced = deployments.filter((d: any) => d?.sync_status?.toLowerCase() === "synced").length || 9;
  const failed = deployments.filter(
    (d: any) =>
      d?.sync_status?.toLowerCase() === "failed" ||
      d?.sync_status?.toLowerCase() === "aborted"
  ).length || 1;

  const summaryCards = [
    {
      label: "Total Deploys Today",
      value: totalToday,
      borderColor: "#3b82f6",
      icon: "🚀",
    },
    {
      label: "Synced",
      value: synced,
      borderColor: "#22c55e",
      icon: "✓",
    },
    {
      label: "Failed",
      value: failed,
      borderColor: "#ef4444",
      icon: "✕",
    },
  ];

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Page header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#e2e8f0",
            margin: 0,
          }}
        >
          Deployments &amp; Releases
        </h2>
        <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#64748b" }}>
          GitOps-synced workloads with canary rollout state.
        </p>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {summaryCards.map((c) => (
          <div
            key={c.label}
            className="card"
            style={{
              borderTop: `3px solid ${c.borderColor}`,
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "1.25rem",
                lineHeight: 1,
                color: c.borderColor,
              }}
            >
              {c.icon}
            </span>
            <div>
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#64748b",
                  margin: 0,
                }}
              >
                {c.label}
              </p>
              <p
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {c.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Deployments table */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>
            Active Deployments
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "var(--color-navy-800, #0f1f3d)",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                {["Service", "Env", "Sync Status", "Rollout State", "Canary"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.6rem 1rem",
                      textAlign: "left",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "#475569",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deployments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: "2rem", textAlign: "center", color: "#475569" }}
                  >
                    No deployment data available.
                  </td>
                </tr>
              ) : (
                deployments.map((d: any, i: number) => (
                  <tr
                    key={d?.service ?? i}
                    style={{
                      background:
                        i % 2 === 0
                          ? "var(--color-navy-900, #0a1628)"
                          : "var(--color-navy-800, #0f1f3d)",
                      transition: "background 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        "rgba(65,105,225,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        i % 2 === 0
                          ? "var(--color-navy-900, #0a1628)"
                          : "var(--color-navy-800, #0f1f3d)";
                    }}
                  >
                    {/* Service + version badge */}
                    <td style={{ padding: "0.6rem 1rem", color: "#cbd5e1" }}>
                      <span style={{ fontWeight: 500 }}>{d?.service}</span>
                      {d?.version && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontSize: "0.65rem",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                            background: "rgba(65,105,225,0.18)",
                            color: "#93c5fd",
                            fontFamily: "monospace",
                          }}
                        >
                          {d.version}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.6rem 1rem", color: "#94a3b8" }}>{d?.env}</td>
                    <td style={{ padding: "0.6rem 1rem" }}>
                      <span className={`badge ${badgeFor(String(d?.sync_status ?? ""))}`}>
                        {d?.sync_status}
                      </span>
                    </td>
                    <td style={{ padding: "0.6rem 1rem" }}>
                      <span className={`badge ${badgeFor(String(d?.rollout_state ?? ""))}`}>
                        {d?.rollout_state}
                      </span>
                    </td>
                    {/* Canary progress bar */}
                    <td style={{ padding: "0.6rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          style={{
                            width: "80px",
                            height: "6px",
                            borderRadius: "9999px",
                            background: "rgba(255,255,255,0.08)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: "60%",
                              height: "100%",
                              borderRadius: "9999px",
                              background: "linear-gradient(90deg, #3b82f6, #22c55e)",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>60%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Release detail card */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>
            Release Detail
            <span
              style={{
                marginLeft: "0.5rem",
                fontSize: "0.75rem",
                color: "#475569",
                fontWeight: 400,
              }}
            >
              catalog · v2.4.1
            </span>
          </h3>
          <span style={{ fontSize: "0.7rem", color: "#475569" }}>Canary rollout in progress</span>
        </div>

        {/* 4-step canary progress */}
        <div style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "#475569",
              marginBottom: "0.75rem",
            }}
          >
            Canary Stages
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {CANARY_STEPS.map((step, idx) => {
              const isActive = idx === CURRENT_CANARY_STEP;
              const isDone = idx < CURRENT_CANARY_STEP;
              const isLast = idx === CANARY_STEPS.length - 1;
              return (
                <div key={step.pct} style={{ display: "flex", alignItems: "center", flex: isLast ? 0 : 1 }}>
                  {/* Step node */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        border: isActive
                          ? "2px solid #4169E1"
                          : isDone
                          ? "2px solid #22c55e"
                          : "2px solid rgba(255,255,255,0.1)",
                        background: isActive
                          ? "rgba(65,105,225,0.2)"
                          : isDone
                          ? "rgba(34,197,94,0.15)"
                          : "transparent",
                        color: isActive ? "#93c5fd" : isDone ? "#22c55e" : "#475569",
                        boxShadow: isActive ? "0 0 10px rgba(65,105,225,0.4)" : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      {isDone ? "✓" : step.label}
                    </div>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: isActive ? "#93c5fd" : isDone ? "#22c55e" : "#475569",
                        fontWeight: isActive ? 600 : 400,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {!isLast && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: isDone
                          ? "#22c55e"
                          : "rgba(255,255,255,0.08)",
                        marginBottom: "1.1rem",
                        marginLeft: 2,
                        marginRight: 2,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Metrics */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: "160px",
              padding: "0.75rem 1rem",
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <span style={{ color: "#22c55e", fontSize: "1rem" }}>✓</span>
            <div>
              <p style={{ fontSize: "0.65rem", color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Success Rate
              </p>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#22c55e", margin: 0 }}>
                99.2%
              </p>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: "160px",
              padding: "0.75rem 1rem",
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <span style={{ color: "#22c55e", fontSize: "1rem" }}>✓</span>
            <div>
              <p style={{ fontSize: "0.65rem", color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                p95 Latency
              </p>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#22c55e", margin: 0 }}>
                142ms
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="btn btn-success" style={{ padding: "0.45rem 1.1rem", fontSize: "0.8125rem" }}>
            Promote
          </button>
          <button className="btn btn-warning" style={{ padding: "0.45rem 1.1rem", fontSize: "0.8125rem" }}>
            Pause
          </button>
          <button
            className="btn btn-outline-danger"
            style={{
              padding: "0.45rem 1.1rem",
              fontSize: "0.8125rem",
              background: "transparent",
              border: "1px solid rgba(239,68,68,0.5)",
              color: "#ef4444",
            }}
          >
            Abort
          </button>
          <span style={{ fontSize: "0.7rem", color: "#475569", marginLeft: "0.25rem" }}>
            (admin only)
          </span>
        </div>
      </div>
    </div>
  );
}
