import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const MOCK_CVE: Record<number, string> = {
  0: "CVE-2024-1234",
  1: "CVE-2024-5678",
  2: "CVE-2023-9012",
  3: "CVE-2024-3456",
  4: "CVE-2023-7890",
};

const MOCK_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: "Patch available", color: "#22c55e" },
  1: { label: "No fix", color: "#dc2626" },
  2: { label: "Patch available", color: "#22c55e" },
  3: { label: "Patch available", color: "#22c55e" },
  4: { label: "No fix", color: "#dc2626" },
};

const MOCK_TIMESTAMPS: Record<number, string> = {
  0: "2026-11-23 12:01",
  1: "2026-11-23 11:45",
  2: "2026-11-23 11:30",
  3: "2026-11-23 10:58",
};

const severityIcon = (sev: string) => {
  switch (sev?.toLowerCase()) {
    case "critical": return "🔴";
    case "high":     return "🟠";
    case "medium":   return "🟡";
    case "low":      return "🔵";
    default:         return "⚪";
  }
};

export default function SecurityCenter() {
  const [tab, setTab] = useState("vulnerabilities");

  const { data: vulns } = useQuery({
    queryKey: ["vulnerabilities"],
    queryFn: async () => (await fetch("/api/vulnerabilities")).json(),
  });
  const { data: policy } = useQuery({
    queryKey: ["policy-violations"],
    queryFn: async () => (await fetch("/api/policy-violations")).json(),
  });

  const vulnerabilities = Array.isArray(vulns) ? vulns : vulns ? [vulns] : [];
  const violations = Array.isArray(policy) ? policy : policy ? [policy] : [];

  const critical = vulnerabilities.filter((v: any) => v?.severity?.toLowerCase() === "critical").length;
  const high     = vulnerabilities.filter((v: any) => v?.severity?.toLowerCase() === "high").length;
  const medium   = vulnerabilities.filter((v: any) => v?.severity?.toLowerCase() === "medium").length;

  const tabs = [
    { id: "vulnerabilities", label: "Vulnerabilities", count: vulnerabilities.length },
    { id: "policy", label: "Policy Violations", count: violations.length },
  ];

  return (
    <div style={{ maxWidth: "960px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 className="text-2xl font-bold" style={{ margin: 0 }}>
          Security Center
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "4px" }}>
          Vulnerabilities, image signing and admission policy enforcement.
        </p>
      </div>

      {/* Risk Summary Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {[
          { label: "Critical", count: critical, color: "#dc2626", icon: "🔴", border: "#dc2626" },
          { label: "High",     count: high,     color: "#ea580c", icon: "🟠", border: "#ea580c" },
          { label: "Medium",   count: medium,   color: "#f59e0b", icon: "🟡", border: "#f59e0b" },
        ].map(({ label, count, color, icon, border }) => (
          <div
            key={label}
            className="card"
            style={{ borderTop: `3px solid ${border}`, textAlign: "center", padding: "16px" }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{icon}</div>
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

      {/* Pill Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "999px",
          padding: "4px",
          width: "fit-content",
        }}
      >
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 18px",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.15s ease",
                background: isActive ? "#fff" : "transparent",
                color: isActive ? "#070b1a" : "var(--text-muted)",
                boxShadow: isActive ? "0 1px 4px #0004" : "none",
              }}
            >
              {t.label}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "20px",
                  height: "20px",
                  borderRadius: "999px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "0 5px",
                  background: isActive ? "#4169e1" : "var(--surface-2)",
                  color: isActive ? "#fff" : "var(--text-muted)",
                }}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === "vulnerabilities" ? (
        <div
          className="card"
          style={{ padding: 0, overflow: "hidden" }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "var(--surface-2)",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {["CVE", "Workload", "Severity", "Package", "Fixed in", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 14px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vulnerabilities.map((v: any, i: number) => {
                  const cve = MOCK_CVE[i] ?? `CVE-2024-${1000 + i}`;
                  const statusMeta = MOCK_STATUS[i] ?? { label: "Unknown", color: "var(--text-muted)" };
                  return (
                    <tr
                      key={i}
                      style={{
                        background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <td style={{ padding: "11px 14px" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.75rem",
                            color: "var(--link)",
                            background: "var(--surface-2)",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cve}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px", color: "var(--text)", fontWeight: 500 }}>
                        {v.workload}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span
                          className={`badge badge-${v.severity?.toLowerCase() ?? "low"}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          {severityIcon(v.severity)} {v.severity}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px", color: "var(--text-muted)" }}>
                        {v.package}
                      </td>
                      <td
                        style={{
                          padding: "11px 14px",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.8125rem",
                        }}
                      >
                        {v.fixed_in}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: statusMeta.color,
                            background: `${statusMeta.color}22`,
                            padding: "2px 10px",
                            borderRadius: "999px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {vulnerabilities.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}
                    >
                      No vulnerabilities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Policy Violations */
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {violations.length === 0 && (
            <div className="card" style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>
              No policy violations found.
            </div>
          )}
          {violations.map((v: any, i: number) => (
            <div
              key={i}
              className="card"
              style={{ borderLeft: "4px solid #dc2626", padding: "16px 20px" }}
            >
              {/* Top Row: policy badge + resource name + "Blocked by OPA" label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="badge badge-fail">{v.policy}</span>
                  <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text)" }}>
                    {v.resource}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#dc2626",
                    background: "#dc262622",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  🛡️ Blocked by OPA
                </span>
              </div>

              {/* User + reason */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span>👤</span>
                  <span style={{ color: "var(--text)", fontWeight: 500 }}>{v.user}</span>
                </span>
                <span style={{ color: "var(--border)" }}>·</span>
                <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{v.reason}</span>
              </div>

              {/* Timestamp */}
              <div
                style={{
                  marginTop: "10px",
                  paddingTop: "8px",
                  borderTop: "1px solid var(--border)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                🕐 {MOCK_TIMESTAMPS[i] ?? "2026-11-23 12:00"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
