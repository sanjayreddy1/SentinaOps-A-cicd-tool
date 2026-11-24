import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const kpiCards = (data: any) => [
  {
    label: "Cluster Health",
    value: data?.cluster_health
      ? `${data.cluster_health.nodes_ready}/${data.cluster_health.nodes_total}`
      : "—",
    sub: "nodes ready",
    trend: "↑",
    trendColor: "#22c55e",
    borderColor: "#22c55e",
  },
  {
    label: "Deploys today",
    value: data?.deploys_today ?? "—",
    sub: "since midnight",
    trend: "↑",
    trendColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  {
    label: "Open Incidents",
    value: data?.open_incidents ?? "—",
    sub: "active alerts",
    trend: "↓",
    trendColor: "#ef4444",
    borderColor: "#ef4444",
  },
  {
    label: "Monthly Cost",
    value: data ? `$${data.monthly_cost}` : "—",
    sub: "USD this month",
    trend: "↓",
    trendColor: "#a855f7",
    borderColor: "#a855f7",
  },
  {
    label: "Savings vs Fixed",
    value: data ? `${data.savings_vs_fixed}%` : "—",
    sub: "cost efficiency",
    trend: "↑",
    trendColor: "#22c55e",
    borderColor: "#22c55e",
  },
  {
    label: "Policy Blocks",
    value: data?.policy_blocks ?? "—",
    sub: "last 24 h",
    trend: "↑",
    trendColor: "#f59e0b",
    borderColor: "#3b82f6",
  },
];

const chartData = [
  { t: "18:00", requests: 38, error_rate: 0.004 },
  { t: "18:30", requests: 41, error_rate: 0.003 },
  { t: "19:00", requests: 44, error_rate: 0.005 },
  { t: "19:30", requests: 39, error_rate: 0.002 },
  { t: "20:00", requests: 46, error_rate: 0.006 },
  { t: "20:30", requests: 43, error_rate: 0.004 },
  { t: "21:00", requests: 47, error_rate: 0.007 },
];

const services = [
  { name: "api-gateway", healthy: true },
  { name: "catalog", healthy: true },
  { name: "orders", healthy: false },
  { name: "payments", healthy: true },
];

export default function Overview() {
  const { data } = useQuery({
    queryKey: ["overview"],
    queryFn: async () => {
      const { data: rows } = await supabase.from("overview").select("*");
      return rows?.[0] ?? null;
    },
  });

  const { data: deploymentsData } = useQuery({
    queryKey: ["deployments"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/deployments");
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    },
    refetchInterval: 5000,
  });

  const deployments: any[] = Array.isArray(deploymentsData) ? deploymentsData : [];

  // Merge dynamic real-time deployment count into KPIs
  const liveData = {
    ...data,
    deploys_today: deployments.length > 0 ? deployments.length : (data?.deploys_today ?? 2),
    policy_blocks: deployments.filter((d: any) => d.status === "Blocked" || d.sync_status === "Blocked").length || (data?.policy_blocks ?? 0),
  };

  const cards = kpiCards(liveData);

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#e2e8f0",
              margin: 0,
            }}
          >
            Platform Overview
          </h2>
          <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#64748b" }}>
            Live cluster health, deploy, incident and cost signals.
          </p>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            color: "#475569",
            padding: "0.25rem 0.75rem",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "9999px",
            border: "1px solid rgba(255,255,255,0.08)",
            whiteSpace: "nowrap",
            alignSelf: "center",
          }}
        >
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* KPI stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
        className="kpi-grid"
      >
        <style>{`
          @media (min-width: 640px) { .kpi-grid { grid-template-columns: repeat(3, 1fr) !important; } }
          @media (min-width: 1024px) { .kpi-grid { grid-template-columns: repeat(6, 1fr) !important; } }
        `}</style>
        {cards.map((c) => (
          <div
            key={c.label}
            className="card"
            style={{
              borderTop: `3px solid ${c.borderColor}`,
              padding: "1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
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
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#f1f5f9",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {String(c.value)}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                marginTop: "0.125rem",
              }}
            >
              <span style={{ color: c.trendColor, fontSize: "0.75rem", fontWeight: 600 }}>
                {c.trend}
              </span>
              <span style={{ fontSize: "0.7rem", color: "#475569" }}>{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Request rate chart */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "1.25rem" }}>
        {/* Chart header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>
            Request Rate &amp; Error Rate
            <span style={{ fontSize: "0.75rem", color: "#475569", marginLeft: "0.5rem" }}>
              (live · 1h window)
            </span>
          </h3>
          {/* Legend */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "#94a3b8" }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#4169E1",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              Requests (k/min)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "#94a3b8" }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#DC2626",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              Error Rate
            </span>
          </div>
        </div>
        {/* Chart body */}
        <div style={{ height: "20rem" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d5a" />
              <XAxis dataKey="t" stroke="#475569" fontSize={12} tick={{ fill: "#64748b" }} />
              <YAxis stroke="#475569" fontSize={12} tick={{ fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #1e3a5f",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "0.75rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#4169E1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="error_rate"
                stroke="#DC2626"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service health pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
          Service Health
        </span>
        {services.map((svc) => (
          <span
            key={svc.name}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.75rem",
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${svc.healthy ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              fontSize: "0.75rem",
              color: "#cbd5e1",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: svc.healthy ? "#22c55e" : "#ef4444",
                display: "inline-block",
                boxShadow: svc.healthy
                  ? "0 0 6px #22c55e"
                  : "0 0 6px #ef4444",
              }}
            />
            {svc.name}
            <span style={{ color: svc.healthy ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
              {svc.healthy ? "Healthy" : "Degraded"}
            </span>
          </span>
        ))}
      </div>

      {/* Real-time Multi-Repo Cloud Deployments Card */}
      {deployments.length > 0 && (
        <div className="card" style={{ marginTop: "1.75rem", padding: "1.25rem", borderTop: "3px solid #3b82f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>🚀</span> Active On-Demand Deployments &amp; Live Sites
              <span className="live-dot" />
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Real-time sync with CI/CD Security Pipeline
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {deployments.slice(0, 4).map((d: any, idx: number) => (
              <div
                key={idx}
                style={{
                  background: "rgba(10, 15, 36, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.35rem" }}>
                    <strong style={{ color: "#ffffff", fontSize: "0.95rem" }}>{d.service}</strong>
                    <span className={`badge ${d.sync_status === "Synced" || d.status === "Live" ? "badge-pass" : "badge-fail"}`} style={{ fontSize: "0.7rem" }}>
                      {d.status || d.sync_status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    Branch: <code style={{ color: "#38bdf8" }}>{d.branch || "main"}</code> · {d.cloud_provider?.includes("Render") ? "Render" : "GitHub Pages"}
                  </div>
                </div>

                {d.live_url ? (
                  <a
                    href={d.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-white btn-sm"
                    style={{ fontSize: "0.75rem", padding: "4px 10px", fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}
                  >
                    <span>🌐</span> Open App ↗
                  </a>
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>Blocked by Policy</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
