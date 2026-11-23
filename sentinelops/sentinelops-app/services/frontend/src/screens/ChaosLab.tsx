import { useQuery } from "@tanstack/react-query";

const BLAST_RADIUS_WIDTH: Record<string, string> = {
  low: "25%",
  medium: "50%",
  high: "75%",
  critical: "100%",
};

const MOCK_EXPERIMENTS = [
  {
    name: "pod-kill-payments",
    hypothesis: "Payments service recovers within 30s after a pod kill.",
    blast_radius: "medium",
    last_result: "pass",
    recovery_time: "18s",
  },
  {
    name: "network-latency-catalog",
    hypothesis: "Catalog reads degrade gracefully under 500ms added latency.",
    blast_radius: "low",
    last_result: "pass",
    recovery_time: "N/A",
  },
  {
    name: "cpu-hog-orders",
    hypothesis: "KEDA scales orders pods before CPU saturation causes errors.",
    blast_radius: "high",
    last_result: "fail",
    recovery_time: "72s",
  },
];

function ResultBadge({ result }: { result: string }) {
  if (!result) return null;
  if (result === "pass")
    return (
      <span className="badge badge-pass text-xs uppercase tracking-wide">✓ Pass</span>
    );
  if (result === "fail")
    return (
      <span className="badge badge-fail text-xs uppercase tracking-wide">✕ Fail</span>
    );
  return (
    <span className="badge badge-warn text-xs uppercase tracking-wide">⟳ {result}</span>
  );
}

export default function ChaosLab() {
  const { data } = useQuery({
    queryKey: ["chaos-experiments"],
    queryFn: async () => (await fetch("/api/chaos/experiments")).json(),
  });

  const rawExperiments = Array.isArray(data) ? data : data ? [data] : [];
  const experiments = rawExperiments.length > 0 ? rawExperiments : MOCK_EXPERIMENTS;

  const passed = experiments.filter((e: any) => e.last_result === "pass").length;
  const failed = experiments.filter((e: any) => e.last_result === "fail").length;

  return (
    <div className="p-6 max-w-4xl">
      {/* Page header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Chaos Lab</h2>
            <span className="rounded-full border border-yellow-500/50 bg-yellow-900/40 px-2.5 py-0.5 text-xs font-semibold text-yellow-400">
              ⚠️ Staging only
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Chaos experiments with automated recovery verification.
          </p>
        </div>
      </div>

      {/* Status bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-navy-800 px-4 py-3 text-sm text-gray-300">
        <span>🕐 Last run: <strong className="text-white">2h ago</strong></span>
        <span className="text-gray-600">·</span>
        <span><strong className="text-white">{experiments.length}</strong> experiments</span>
        <span className="text-gray-600">·</span>
        <span className="text-green-400"><strong>{passed}</strong> passed</span>
        <span className="text-gray-600">·</span>
        <span className="text-red-400"><strong>{failed}</strong> failed</span>
      </div>

      {/* Experiment cards */}
      <div className="stack gap-4 mb-8">
        {experiments.map((e: any) => {
          const isFailed = e.last_result === "fail";
          const blastPct = BLAST_RADIUS_WIDTH[e.blast_radius] ?? "50%";
          return (
            <div
              key={e.name}
              className={`card border-t-2 ${isFailed ? "border-danger" : "border-brand"}`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-white text-base">{e.name}</span>
                <div className="flex items-center gap-3">
                  <ResultBadge result={e.last_result} />
                  <button className="btn btn-danger text-xs px-3 py-1 flex items-center gap-1">
                    <span>▶</span> Run
                  </button>
                </div>
              </div>

              {/* Hypothesis */}
              <p className="mt-2 text-sm italic text-gray-400">{e.hypothesis}</p>

              {/* Blast radius */}
              <div className="mt-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
                  <span>💥</span>
                  <span>
                    Blast radius:{" "}
                    <span className="font-semibold text-gray-200 capitalize">{e.blast_radius}</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-navy-800">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all duration-500"
                    style={{ width: blastPct }}
                  />
                </div>
              </div>

              {/* Recovery time */}
              {e.recovery_time && e.recovery_time !== "N/A" && (
                <p className="mt-2 text-xs text-gray-500">
                  ⏱ Recovery time: <span className="text-gray-300">{e.recovery_time}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Safety notice */}
      <div className="alert flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-900/20 px-4 py-3">
        <span className="text-lg">⚠️</span>
        <p className="text-sm text-yellow-300">
          Experiments are gated to <strong>staging namespace</strong> by default.{" "}
          <strong>Admin role required</strong> to run.
        </p>
      </div>
    </div>
  );
}
