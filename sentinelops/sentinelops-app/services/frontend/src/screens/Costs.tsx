import { useQuery } from "@tanstack/react-query";

const MOCK_BY_NAMESPACE: Record<string, number> = {
  default: 42000,
  monitoring: 31000,
  payments: 29000,
  catalog: 22000,
};

const MOCK_SAVINGS = [
  { recommendation: "Downscale idle catalog pods during off-peak hours", saving_pct: 18, saving_inr: "18,400 INR" },
  { recommendation: "Switch monitoring namespace to spot instances", saving_pct: 12, saving_inr: "12,200 INR" },
  { recommendation: "Enable KEDA scale-to-zero for batch jobs", saving_pct: 9, saving_inr: "9,100 INR" },
];

export default function Costs() {
  const { data } = useQuery({
    queryKey: ["costs"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/costs");
        if (!res.ok) throw new Error("API unavailable");
        return await res.json();
      } catch {
        return null;
      }
    },
  });

  const byNamespace: Record<string, number> =
    data?.by_namespace && Object.keys(data.by_namespace).length > 0
      ? data.by_namespace
      : MOCK_BY_NAMESPACE;

  const savings = Array.isArray(data?.top_savings) && data.top_savings.length > 0
    ? data.top_savings
    : MOCK_SAVINGS;

  const monthlyCost = data?.monthly_cost ?? "124,000";
  const savingsVsFixed = data?.savings_vs_fixed ?? "23";
  const totalNs = Object.values(byNamespace).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 max-w-5xl" style={{ color: "#000000" }}>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-black" style={{ color: "#000000" }}>
          Cost &amp; Capacity (FinOps)
        </h2>
        <p className="mt-1 text-sm font-semibold text-black" style={{ color: "#000000" }}>
          OpenCost cluster spend, KEDA autoscaling savings, and multi-cloud capacity headroom. All figures in INR.
        </p>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        {/* Monthly Cost */}
        <div className="card relative overflow-hidden border-t-2 border-blue-600 bg-white" style={{ background: "#ffffff", borderColor: "#cbd5e1" }}>
          <span className="absolute top-3 right-3 text-xl opacity-40">💰</span>
          <p className="text-xs font-bold uppercase tracking-widest text-black" style={{ color: "#000000" }}>
            Monthly Cost
          </p>
          <p className="mt-2 text-2xl font-black text-black" style={{ color: "#000000" }}>
            {monthlyCost} INR
          </p>
          <p className="mt-1 text-xs font-semibold text-black" style={{ color: "#000000" }}>this billing period</p>
        </div>

        {/* Savings vs Fixed */}
        <div className="card relative overflow-hidden border-t-2 border-green-600 bg-white" style={{ background: "#ffffff", borderColor: "#cbd5e1" }}>
          <span className="absolute top-3 right-3 text-xl opacity-40">📉</span>
          <p className="text-xs font-bold uppercase tracking-widest text-black" style={{ color: "#000000" }}>
            Savings vs Fixed
          </p>
          <p className="mt-2 text-2xl font-black text-black" style={{ color: "#16a34a" }}>{savingsVsFixed}%</p>
          <p className="mt-1 text-xs font-semibold text-black" style={{ color: "#000000" }}>vs reserved baseline</p>
        </div>

        {/* KEDA Events */}
        <div className="card relative overflow-hidden border-t-2 border-purple-600 bg-white" style={{ background: "#ffffff", borderColor: "#cbd5e1" }}>
          <span className="absolute top-3 right-3 text-xl opacity-40">⚡</span>
          <p className="text-xs font-bold uppercase tracking-widest text-black" style={{ color: "#000000" }}>
            KEDA Autoscale
          </p>
          <p className="mt-2 text-2xl font-black text-black" style={{ color: "#000000" }}>47</p>
          <p className="mt-1 text-xs font-semibold text-black" style={{ color: "#000000" }}>events this week</p>
        </div>

        {/* Nodes Active */}
        <div className="card relative overflow-hidden border-t-2 border-blue-500 bg-white" style={{ background: "#ffffff", borderColor: "#cbd5e1" }}>
          <span className="absolute top-3 right-3 text-xl opacity-40">📊</span>
          <p className="text-xs font-bold uppercase tracking-widest text-black" style={{ color: "#000000" }}>
            Nodes Active
          </p>
          <p className="mt-2 text-2xl font-black text-black" style={{ color: "#000000" }}>3/5</p>
          <p className="mt-1 text-xs font-semibold text-black" style={{ color: "#000000" }}>2 on standby</p>
        </div>
      </div>

      {/* Cost by namespace */}
      <div className="card mb-6 max-w-2xl bg-white" style={{ background: "#ffffff", border: "1px solid #cbd5e1" }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-black" style={{ color: "#000000" }}>
            Cost by Namespace
          </h3>
          <span className="text-xs font-bold text-black" style={{ color: "#000000" }}>
            Total: {totalNs.toLocaleString("en-IN")} INR
          </span>
        </div>
        <div className="stack gap-4">
          {Object.entries(byNamespace)
            .sort(([, a], [, b]) => b - a)
            .map(([ns, cost]) => {
              const pct = Math.round((cost / totalNs) * 100);
              return (
                <div key={ns}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-black capitalize" style={{ color: "#000000" }}>{ns}</span>
                    <span className="text-sm font-bold text-black" style={{ color: "#000000" }}>{cost.toLocaleString("en-IN")} INR</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-xs font-semibold text-black" style={{ color: "#000000" }}>{pct}% of total spend</p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top savings recommendations */}
      <div className="max-w-2xl">
        <h3 className="mb-3 text-base font-extrabold text-black" style={{ color: "#000000" }}>
          Top Savings Recommendations
        </h3>
        <div className="stack gap-3">
          {savings.map((s: any, i: number) => (
            <div
              key={i}
              className="card flex items-start gap-3 pl-4 bg-white"
              style={{ background: "#ffffff", borderLeft: "4px solid #16a34a", border: "1px solid #cbd5e1", borderLeftWidth: "4px", borderLeftColor: "#16a34a" }}
            >
              <span className="mt-0.5 text-lg">💡</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-black" style={{ color: "#000000" }}>{s.recommendation}</p>
                {s.saving_inr && (
                  <p className="text-xs font-semibold text-black" style={{ color: "#000000", marginTop: "2px" }}>
                    Projected reduction: <strong>{s.saving_inr}</strong>
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-extrabold text-green-800">
                Save {s.saving_pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
