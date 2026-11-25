import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const badgeFor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "passed":
    case "live":
    case "synced":
      return "badge-pass";
    case "deployed_with_warnings":
    case "progressing":
      return "badge-warn";
    case "blocked":
    case "blocked_by_security":
    case "failed":
      return "badge-fail";
    default:
      return "badge-royal";
  }
};

export default function History() {
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["pipeline-history"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/pipeline/history");
        if (!res.ok) throw new Error("API failed");
        return await res.json();
      } catch {
        return [];
      }
    },
    refetchInterval: 8000,
  });

  const history: any[] = Array.isArray(historyData) ? historyData : [];

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.app_name?.toLowerCase().includes(term) ||
      item.repo_url?.toLowerCase().includes(term) ||
      item.branch?.toLowerCase().includes(term) ||
      item.status?.toLowerCase().includes(term)
    );
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: "1100px", padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📜</span> Deployed Apps &amp; Security Reports History
          </h2>
          <p style={{ marginTop: "0.35rem", fontSize: "0.875rem", color: "#94a3b8" }}>
            All applications deployed on-demand via SentinelOps with live URLs, branches, and full security check reports.
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          className="input"
          placeholder="Filter by app name, branch, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
      </div>

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden", borderTop: "3px solid #4169E1" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "rgba(14, 21, 48, 0.95)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>App Name</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Repository &amp; Branch</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Deployed App Link</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Deployed On Time</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Security Status</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Report</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "2.5rem 1rem", textAlign: "center", color: "#94a3b8" }}>
                    {isLoading ? "Loading deployment history..." : "No deployed apps in history yet. Run a pipeline from Deployments to deploy on-demand."}
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, idx) => (
                  <tr
                    key={item.run_id || idx}
                    style={{
                      background: idx % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.02)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    {/* App Name */}
                    <td style={{ padding: "1rem", color: "#f8fafc", fontWeight: 700 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span>📦</span> {item.app_name || item.repo}
                      </div>
                    </td>

                    {/* Repo & Branch */}
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <a
                          href={item.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#60a5fa", textDecoration: "underline", fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          {item.owner}/{item.repo}
                        </a>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                          <span>branch:</span> <code style={{ color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)", padding: "1px 5px", borderRadius: "3px" }}>{item.branch}</code>
                          <span className="badge badge-royal" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                            {item.deployment?.cloud_provider?.includes("Render") ? "☁️ Render Cloud" : "🌐 GitHub Pages"}
                          </span>
                          {item.deployment?.publish_directory && item.deployment?.publish_directory !== "root" && (
                            <span className="badge badge-royal" style={{ fontSize: "0.65rem", padding: "1px 6px", borderColor: "#38bdf8", color: "#38bdf8" }}>
                              📁 {item.deployment.publish_directory}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Deployed App Link */}
                    <td style={{ padding: "1rem" }}>
                      {item.deployment?.live_url ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <a
                            href={item.deployment.live_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-white btn-sm"
                            style={{ fontSize: "0.75rem", padding: "4px 10px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                          >
                            <span>🌐</span> Open App ↗
                          </a>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: "0.7rem", padding: "3px 8px" }}
                            onClick={() => handleCopy(item.deployment.live_url, `url-${idx}`)}
                          >
                            {copiedId === `url-${idx}` ? "✓" : "Copy"}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>Deployment Blocked</span>
                      )}
                    </td>

                    {/* Deployed Timestamp */}
                    <td style={{ padding: "1rem", color: "#cbd5e1", fontSize: "0.8rem" }}>
                      {formatDate(item.scanned_at || item.deployment?.deployed_at)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "1rem" }}>
                      <span className={`badge ${badgeFor(item.status)}`}>
                        {item.status === "blocked_by_security"
                          ? "🛑 Blocked (Critical)"
                          : item.status === "deployed_with_warnings"
                          ? "⚠️ Warnings"
                          : "✅ Passed"}
                      </span>
                    </td>

                    {/* Report Button */}
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                        onClick={() => setSelectedReport(item)}
                      >
                        <span>🛡️</span> View Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECURITY REPORT DETAIL MODAL ── */}
      {selectedReport && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1.5rem",
          }}
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#0E1530",
              border: "1px solid #4169E1",
              padding: "1.5rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <div>
                <span className="badge badge-royal" style={{ fontSize: "0.75rem" }}>
                  Report ID: {selectedReport.run_id}
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", margin: "0.5rem 0 0 0" }}>
                  Security Check Report for {selectedReport.app_name}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.25rem 0 0 0" }}>
                  Branch: <code>{selectedReport.branch}</code> · Commit: <code>{selectedReport.commit_sha}</code>
                  {selectedReport.deployment?.publish_directory && selectedReport.deployment?.publish_directory !== "root" && (
                    <> · Publish Dir: <code style={{ color: "#38bdf8" }}>{selectedReport.deployment.publish_directory}</code></>
                  )}
                  {" "}· Scanned: {formatDate(selectedReport.scanned_at)}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedReport(null)}
              >
                ✕ Close
              </button>
            </div>

            {/* Live Link Summary */}
            <div style={{ background: "rgba(65, 105, 225, 0.08)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(65, 105, 225, 0.2)", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#60a5fa", fontWeight: 600, display: "block" }}>
                    Live Deployed App URL:
                  </span>
                  <a
                    href={selectedReport.deployment?.live_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#ffffff", fontWeight: 600, textDecoration: "underline", fontSize: "0.95rem" }}
                  >
                    {selectedReport.deployment?.live_url}
                  </a>
                </div>
                <a
                  href={selectedReport.deployment?.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-white btn-sm"
                >
                  Open Live Link ↗
                </a>
              </div>
            </div>

            {/* Vulnerabilities & Leaks List */}
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "#ffffff", margin: "0 0 0.75rem 0" }}>
                Findings &amp; Remediation Suggestions ({selectedReport.vulnerabilities?.length || 0})
              </h4>

              {(!selectedReport.vulnerabilities || selectedReport.vulnerabilities.length === 0) ? (
                <div style={{ textAlign: "center", padding: "1.5rem", color: "#22c55e" }}>
                  ✅ 0 Security Vulnerabilities or Secret Leaks Detected! 100% Secure.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {selectedReport.vulnerabilities.map((v: any, vIdx: number) => (
                    <div
                      key={vIdx}
                      style={{
                        padding: "1rem",
                        borderRadius: "8px",
                        background: "rgba(7, 11, 26, 0.7)",
                        border: "1px solid var(--border)",
                        borderLeft: `4px solid ${v.severity === "CRITICAL" ? "#dc2626" : v.severity === "HIGH" ? "#ea580c" : "#f59e0b"}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div>
                          <span className={`badge ${badgeFor(v.severity)}`} style={{ marginRight: "0.5rem" }}>
                            {v.severity}
                          </span>
                          <strong style={{ color: "#ffffff", fontSize: "0.9rem" }}>{v.id}</strong>
                          <span style={{ fontSize: "0.8rem", color: "#94a3b8", marginLeft: "0.5rem" }}>
                            in <code>{v.workload}</code>
                          </span>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>
                          Fixed in: {v.fixed_in}
                        </span>
                      </div>

                      <p style={{ fontSize: "0.8rem", color: "#cbd5e1", margin: "0.5rem 0" }}>
                        {v.summary}
                      </p>

                      {/* Actionable Fix Suggestion */}
                      <div style={{ background: "#070B1A", padding: "0.75rem", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.06)", marginTop: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#60a5fa" }}>
                            💡 Actionable Remediation:
                          </span>
                          {v.remediation_cmd && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                              onClick={() => handleCopy(v.remediation_cmd, `modal-fix-${vIdx}`)}
                            >
                              {copiedId === `modal-fix-${vIdx}` ? "✓ Copied" : "Copy Command"}
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "#e2e8f0", margin: "0 0 0.4rem 0" }}>
                          {v.suggestion}
                        </p>
                        {v.remediation_cmd && (
                          <code style={{ display: "block", fontSize: "0.75rem", color: "#38bdf8", background: "#0b1228", padding: "0.4rem 0.6rem", borderRadius: "4px" }}>
                            $ {v.remediation_cmd}
                          </code>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
