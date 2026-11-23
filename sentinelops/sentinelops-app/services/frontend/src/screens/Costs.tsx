import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const MOCK_BY_NAMESPACE: Record<string, number> = {
  default: 420,
  monitoring: 310,
  payments: 290,
  catalog: 220,
};

const MOCK_SAVINGS = [
  { recommendation: "Downscale idle catalog pods during off-peak hours", saving_pct: 18 },
  { recommendation: "Switch monitoring namespace to spot instances", saving_pct: 12 },
  { recommendation: "Enable KEDA scale-to-zero for batch jobs", saving_pct: 9 },
];

export default function Costs() {
  const { data } = useQuery({
    queryKey: ["costs"],
    queryFn: async () => (await fetch("/api/costs")).json(),
  });

  const byNamespace: Record<string, number> =
    data?.by_namespace && Object.keys(data.by_namespace).length > 0
      ? data.by_namespace
      : MOCK_BY_NAMESPACE;

  const savings = Array.isArray(data?.top_savings) && data.top_savings.length > 0
    ? data.top_savings
    : MOCK_SAVINGS;

  const monthlyCost = data?.monthly_cost ?? "1,240";
  const savingsVsFixed = data?.savings_vs_fixed ?? "23";
  const totalNs = Object.values(byNamespace).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 max-w-5xl">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Cost &amp; Capacity</h2>
        <p className="mt-1 text-sm text-gray-400">
          OpenCost spend, KEDA autoscaling savings and capacity headroom.
        </p>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        {/* Monthly Cost */}
        <div className="card relative overflow-hidden border-t-2 border-cyan-500">
          <span className="absolute top-3 right-3 text-xl opacity-30">💰</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">
            Monthly Cost
          </p>
          <p className="mt-2 text-3xl font-bold text-white">${monthlyCost}</p>
          <p className="mt-1 text-xs text-gray-500">this billing period</p>
        </div>

        {/* Savings vs Fixed */}
        <div className="card relative overflow-hidden border-t-2 border-green-500">
          <span className="absolute top-3 right-3 text-xl opacity-30">📉</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">
            Savings vs Fixed
          </p>
          <p className="mt-2 text-3xl font-bold text-green-400">{savingsVsFixed}%</p>
          <p className="mt-1 text-xs text-gray-500">vs reserved baseline</p>
        </div>

        {/* KEDA Events */}
        <div className="card relative overflow-hidden border-t-2 border-purple-500">
          <span className="absolute top-3 right-3 text-xl opacity-30">⚡</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">
            KEDA Autoscale
          </p>
          <p className="mt-2 text-3xl font-bold text-white">47</p>
          <p className="mt-1 text-xs text-gray-500">events this week</p>
        </div>

        {/* Nodes Active */}
        <div className="card relative overflow-hidden border-t-2 border-blue-500">
          <span className="absolute top-3 right-3 text-xl opacity-30">📊</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">
            Nodes Active
          </p>
          <p className="mt-2 text-3xl font-bold text-white">3/5</p>
          <p className="mt-1 text-xs text-gray-500">2 on standby</p>
        </div>
      </div>

      {/* Cost by namespace */}
      <div className="card mb-6 max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Cost by Namespace</h3>
          <span className="text-xs text-gray-500">Total: ${totalNs}</span>
        </div>
        <div className="stack gap-4">
          {Object.entries(byNamespace)
            .sort(([, a], [, b]) => b - a)
            .map(([ns, cost]) => {
              const pct = Math.round((cost / totalNs) * 100);
              return (
                <div key={ns}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-200 capitalize">{ns}</span>
                    <span className="text-sm font-semibold text-white">${cost}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-navy-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-xs text-gray-500">{pct}% of total</p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top savings recommendations */}
      <div className="max-w-2xl">
        <h3 className="mb-3 text-base font-bold text-white">Top Savings Recommendations</h3>
        <div className="stack gap-3">
          {savings.map((s: any, i: number) => (
            <div
              key={i}
              className="card border-l-2 border-success flex items-start gap-3 pl-4"
            >
              <span className="mt-0.5 text-lg">💡</span>
              <div className="flex-1">
                <p className="text-sm text-gray-200">{s.recommendation}</p>
              </div>
              <span className="shrink-0 rounded-full bg-green-900/60 px-2 py-0.5 text-xs font-semibold text-green-400">
                Save {s.saving_pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
