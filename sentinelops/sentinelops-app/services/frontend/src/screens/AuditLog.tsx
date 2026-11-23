import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type AuditEntry = {
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  result: string;
};

const MOCK_ENTRIES: AuditEntry[] = [
  { timestamp: "2026-11-23 12:01", actor: "system", action: "auto-restart", resource: "payments", result: "resolved" },
  { timestamp: "2026-11-23 11:45", actor: "sanjay@co.com", action: "promote-canary", resource: "catalog v1.3", result: "success" },
  { timestamp: "2026-11-23 11:30", actor: "system", action: "scale-up", resource: "orders (3→5)", result: "success" },
  { timestamp: "2026-11-23 11:10", actor: "sanjay@co.com", action: "policy-override", resource: "payments image", result: "blocked" },
];

type Filter = "All" | "Human" | "Automated";

function ActorBadge({ actor }: { actor: string }) {
  if (actor === "system") {
    return (
      <span className="badge badge-royal flex items-center gap-1 text-xs">
        🤖 system
      </span>
    );
  }
  return (
    <span className="badge badge-warn flex items-center gap-1 text-xs">
      👤 {actor}
    </span>
  );
}

function ResultBadge({ result }: { result: string }) {
  if (result === "success" || result === "resolved") {
    return <span className="badge badge-pass text-xs">{result}</span>;
  }
  if (result === "blocked" || result === "failed") {
    return <span className="badge badge-fail text-xs">{result}</span>;
  }
  return <span className="badge text-xs">{result}</span>;
}

export default function AuditLog() {
  const { data } = useQuery({
    queryKey: ["audit"],
    queryFn: async () => (await fetch("/api/audit")).json(),
  });

  const rawEntries: AuditEntry[] = Array.isArray(data) && data.length > 0 ? data : MOCK_ENTRIES;

  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const filters: Filter[] = ["All", "Human", "Automated"];

  const filtered = rawEntries.filter((e) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Human" && e.actor !== "system") ||
      (filter === "Automated" && e.actor === "system");
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      e.actor.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.resource.toLowerCase().includes(q) ||
      e.result.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleExport = () => {
    const header = "Timestamp,Actor,Action,Resource,Result\n";
    const rows = filtered
      .map((e) => `"${e.timestamp}","${e.actor}","${e.action}","${e.resource}","${e.result}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl">
      {/* Page header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Audit Log</h2>
          <p className="mt-1 text-sm text-gray-400">
            Every action (human or automated): who, what changed, when, and result.
          </p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary text-xs px-4 py-2">
          ⬇ Export CSV
        </button>
      </div>

      {/* Filter row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1 text-xs font-semibold transition-colors ${
                filter === f
                  ? "border-cyan-500 bg-cyan-900/50 text-cyan-400"
                  : "border-navy-700 bg-navy-800 text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input text-sm w-56 py-1.5 px-3"
        />
      </div>

      {/* Audit table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-navy-800">
              <tr>
                {["Timestamp", "Actor", "Action", "Resource", "Result"].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-cyan-accent"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr
                  key={i}
                  className={`border-t border-navy-800 transition-colors hover:bg-navy-700 ${
                    i % 2 === 0 ? "bg-navy-900" : "bg-navy-800/50"
                  }`}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-400">
                    {e.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <ActorBadge actor={e.actor} />
                  </td>
                  <td className="px-4 py-3 text-gray-200 font-medium">{e.action}</td>
                  <td className="px-4 py-3 text-gray-300">{e.resource}</td>
                  <td className="px-4 py-3">
                    <ResultBadge result={e.result} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                    No matching audit entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-600">{filtered.length} entries shown</p>
    </div>
  );
}
