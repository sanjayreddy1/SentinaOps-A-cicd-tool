import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("vulnerabilities");
  const [scanRepo, setScanRepo] = useState("https://github.com/sanjayreddy1/SentinaOps-A-cicd-tool");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: vulns, isLoading: vulnsLoading } = useQuery({
    queryKey: ["vulnerabilities"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/vulnerabilities");
        if (!res.ok) throw new Error("API failed");
        return await res.json();
      } catch {
        return [];
      }
    },
  });

  const { data: policy } = useQuery({
    queryKey: ["policy-violations"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/policy-violations");
        if (!res.ok) throw new Error("API failed");
        return await res.json();
      } catch {
        return [];
      }
    },
  });

  const scanMutation = useMutation({
    mutationFn: async (repo: string) => {
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repo, branch: "main", deploy_target: "cloud" }),
      });
      if (!res.ok) throw new Error("Scan failed");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vulnerabilities"] });
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
    },
  });

  const vulnerabilities = Array.isArray(vulns) ? vulns : vulns ? [vulns] : [];
  const violations = Array.isArray(policy) ? policy : policy ? [policy] : [];

  const critical = vulnerabilities.filter((v: any) => v?.severity?.toLowerCase() === "critical").length;
  const high     = vulnerabilities.filter((v: any) => v?.severity?.toLowerCase() === "high").length;
  const medium   = vulnerabilities.filter((v: any) => v?.severity?.toLowerCase() === "medium").length;

  const tabs = [
    { id: "vulnerabilities", label: "Vulnerabilities (OSV/CVE)", count: vulnerabilities.length },
    { id: "policy", label: "Policy Violations (Kyverno/OPA)", count: violations.length },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div style={{ maxWidth: "960px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 className="text-2xl font-bold" style={{ margin: 0, color: "#ffffff" }}>
          Security Center
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "4px" }}>
          Real-time vulnerability scanner (OSV/CVE database), container policy enforcement, and live fix suggestions.
        </p>
      </div>

      {/* On-Demand Real-Time Scan Bar */}
      <div className="card" style={{ marginBottom: "24px", padding: "16px 20px", background: "rgba(14, 21, 48, 0.8)", borderTop: "3px solid #6B8CFF" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ flex: "1 1 340px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#60a5fa", display: "block", marginBottom: "4px" }}>
              ⚡ Scan Any GitHub Repository in Real-Time:
            </span>
            <input
              type="text"
              className="input"
              value={scanRepo}
              onChange={(e) => setScanRepo(e.target.value)}
              placeholder="https://github.com/owner/repository"
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={scanMutation.isPending}
            onClick={() => scanMutation.mutate(scanRepo)}
            style={{ alignSelf: "flex-end" }}
          >
            {scanMutation.isPending ? "Scanning OSV Database..." : "🔍 Run Live Security Scan"}
          </button>
        </div>
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
        <div
          className="card"
          style={{
            borderLeft: "4px solid var(--so-danger)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "16px 20px",
          }}
        >
          <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>🔴</span>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.1, color: "var(--text)" }}>
              {critical}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Critical
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            borderLeft: "4px solid #EA580C",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "16px 20px",
          }}
        >
          <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>🟠</span>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.1, color: "var(--text)" }}>
              {high}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              High
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            borderLeft: "4px solid var(--so-warning)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "16px 20px",
          }}
        >
          <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>🟡</span>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.1, color: "var(--text)" }}>
              {medium}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Medium
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--fs-sm)",
                fontWeight: 600,
                border: "1px solid",
                borderColor: isActive ? "var(--so-primary-600)" : "var(--border)",
                background: isActive ? "#FFFFFF" : "transparent",
                color: isActive ? "#070B1A" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <span>{t.label}</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: "var(--radius-pill)",
                  background: isActive ? "#4169E1" : "rgba(65, 105, 225, 0.2)",
                  color: "#FFFFFF",
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
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {vulnerabilities.length === 0 ? (
            <div className="card text-center" style={{ padding: "40px 20px" }}>
              <div style={{ fontSize: "3rem" }}>✅</div>
              <h3 style={{ marginTop: "12px", color: "#ffffff" }}>0 Vulnerabilities Detected</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                All scanned dependencies and container manifests meet current production security standards.
              </p>
            </div>
          ) : (
            vulnerabilities.map((v: any, i: number) => {
              const cve = v.id || v.aliases?.[0] || `VULN-${i}`;
              const sev = (v.severity || "low").toLowerCase();
              return (
                <div
                  key={i}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${sev === "critical" ? "#dc2626" : sev === "high" ? "#ea580c" : "#f59e0b"}`,
                    padding: "16px 20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <span className={`badge badge-${sev}`} style={{ marginRight: "8px" }}>
                        {severityIcon(v.severity)} {v.severity}
                      </span>
                      <code style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: 700 }}>
                        {cve}
                      </code>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "8px" }}>
                        in <strong>{v.workload}</strong> ({v.package} @ {v.installed_version || "current"})
                      </span>
                    </div>

                    <span style={{ fontSize: "0.8rem", color: "#22c55e", fontWeight: 600 }}>
                      Fixed in: {v.fixed_in || "Latest Patch"}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "#e2e8f0", margin: "10px 0" }}>
                    {v.summary}
                  </p>

                  {/* Suggestion Box */}
                  <div style={{ background: "rgba(7, 11, 26, 0.75)", padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#60a5fa", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>💡</span> Realtime Remediation Suggestion:
                      </span>
                      {v.remediation_cmd && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                          onClick={() => handleCopy(v.remediation_cmd, `sugg-${i}`)}
                        >
                          {copiedId === `sugg-${i}` ? "✓ Copied" : "Copy Fix Command"}
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#cbd5e1", margin: 0 }}>
                      {v.suggestion || `Upgrade ${v.package} to version ${v.fixed_in} to resolve ${cve}.`}
                    </p>
                    {v.remediation_cmd && (
                      <pre style={{ margin: "8px 0 0 0", padding: "6px 10px", fontSize: "0.75rem", color: "#38bdf8", background: "#060914" }}>
                        {v.remediation_cmd}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {violations.map((v: any, i: number) => (
            <div
              key={i}
              className="card"
              style={{
                borderLeft: "4px solid var(--so-danger)",
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span className="badge badge-fail">{v.policy}</span>
                <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--text)" }}>
                  {v.resource}
                </span>
                <span className="badge badge-warn" style={{ marginLeft: "auto", fontSize: "11px" }}>
                  Blocked by OPA/Kyverno
                </span>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>
                User <strong style={{ color: "var(--text)" }}>{v.user}</strong>: {v.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
