import { useState } from "react";

type SKU =
  | "SO-CLUSTER-PRO"
  | "SO-CVE-AUTOFIX"
  | "SO-KYVERNO-PACK"
  | "SO-SRE-AUTOBOT"
  | "SO-FINOPS-SUITE"
  | "SO-CHAOS-MESH";

interface Product {
  sku: SKU;
  name: string;
  price: number;
  emoji: string;
  category: string;
  description: string;
}

const PRODUCTS: Product[] = [
  {
    sku: "SO-CLUSTER-PRO",
    name: "SentinelOps Cloud Cluster Pro License",
    price: 9999,
    emoji: "🖥️",
    category: "Cloud Control Plane",
    description: "Autonomous CI/CD cluster controller with multi-cloud Kubernetes deployment agents and zero-404 live runner.",
  },
  {
    sku: "SO-CVE-AUTOFIX",
    name: "Zero-Day OSV & CVE Auto-Fix Engine",
    price: 4999,
    emoji: "🛡️",
    category: "Security & Vulnerability",
    description: "Real-time dependency vulnerability scanner and automated patch generator with 1-click mitigation.",
  },
  {
    sku: "SO-KYVERNO-PACK",
    name: "Kyverno Enterprise Admission Policy Pack",
    price: 3499,
    emoji: "🔒",
    category: "Kubernetes Governance",
    description: "Production-grade CIS benchmark policies, Sigstore Cosign image attestation verification, and rootless UID enforcement.",
  },
  {
    sku: "SO-SRE-AUTOBOT",
    name: "24/7 SRE Incident Auto-Rollback Bot",
    price: 5999,
    emoji: "⚡",
    category: "Reliability & Incidents",
    description: "PagerDuty & Slack webhook integration that halts degraded canaries and restores stable baseline in under 2 minutes.",
  },
  {
    sku: "SO-FINOPS-SUITE",
    name: "FinOps Multi-Cloud Cost Optimizer",
    price: 2999,
    emoji: "💰",
    category: "FinOps & Efficiency",
    description: "OpenCost cluster right-sizing analytics and automated KEDA scale-to-zero idle pod reclamation.",
  },
  {
    sku: "SO-CHAOS-MESH",
    name: "Chaos Lab Automated Stress Testing Suite",
    price: 3999,
    emoji: "🧪",
    category: "Chaos Engineering",
    description: "Automated chaos injection harnesses for pod kill, 200ms latency simulation, and CPU burn resilience testing.",
  },
];

export default function Shop({ onBack }: { onBack: () => void }) {
  const [cart, setCart] = useState<number>(0);
  const [quantities, setQuantities] = useState<Record<SKU, number>>({
    "SO-CLUSTER-PRO": 0,
    "SO-CVE-AUTOFIX": 0,
    "SO-KYVERNO-PACK": 0,
    "SO-SRE-AUTOBOT": 0,
    "SO-FINOPS-SUITE": 0,
    "SO-CHAOS-MESH": 0,
  });

  function addToCart(sku: SKU) {
    setQuantities((prev) => ({ ...prev, [sku]: prev[sku] + 1 }));
    setCart((c) => c + 1);
  }

  const totalPrice = PRODUCTS.reduce(
    (sum, p) => sum + p.price * quantities[p.sku],
    0,
  );

  return (
    <div className="min-h-screen pb-32" style={{ color: "#000000" }}>
      {/* Back link */}
      <div className="px-6 pt-4">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onBack}
          style={{ fontWeight: 700, color: "#000000", borderColor: "#000000" }}
        >
          ← Back to Console Overview
        </button>
      </div>

      {/* Hero banner */}
      <div className="mx-auto max-w-5xl px-6 pt-6">
        <div
          className="rounded-2xl border border-slate-300 bg-white px-8 py-8 shadow-sm"
          style={{ background: "#ffffff", borderColor: "#cbd5e1" }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-extrabold text-black" style={{ color: "#000000", margin: 0 }}>
                SentinelOps Platform Store
              </h1>
              <span className="badge badge-royal" style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
                Cloud Native Add-ons
              </span>
            </div>
            <p className="text-base font-bold text-black" style={{ color: "#000000" }}>
              Enterprise DevSecOps Extensions &amp; Autonomous Cloud Infrastructure Modules
            </p>
            <p className="max-w-2xl text-sm font-medium text-black" style={{ color: "#000000" }}>
              Extend your SentinelOps cluster with automated CVE remediation, Kyverno admission controls, SRE incident auto-rollback bots, and FinOps right-sizing. All billing in INR.
            </p>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-black" style={{ color: "#000000" }}>
          Available Platform Modules &amp; Subscriptions
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <div
              key={p.sku}
              className="card flex flex-col gap-4"
              style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                padding: "1.5rem",
                color: "#000000",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                transition: "box-shadow 200ms ease, border-color 200ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#2563eb";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(37,99,235,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#cbd5e1";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)";
              }}
            >
              {/* Category & Icon */}
              <div className="flex items-center justify-between">
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                  {p.category}
                </span>
                <span style={{ fontSize: "2rem" }}>{p.emoji}</span>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-extrabold text-black" style={{ color: "#000000", margin: 0 }}>
                  {p.name}
                </h3>
                <span className="text-xs font-semibold text-black" style={{ color: "#000000" }}>
                  SKU: {p.sku}
                </span>
                <p
                  className="text-2xl font-black text-black"
                  style={{ color: "#000000", marginTop: "0.5rem", marginBottom: "0.25rem" }}
                >
                  {p.price.toLocaleString("en-IN")} INR
                </p>
                <p className="text-sm font-medium text-black" style={{ color: "#000000", lineHeight: "1.5" }}>
                  {p.description}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-auto flex flex-col gap-2 pt-2">
                {quantities[p.sku] > 0 && (
                  <p
                    className="text-center text-xs font-bold"
                    style={{ color: "#16a34a" }}
                  >
                    ✓ {quantities[p.sku]} module added to cart
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => addToCart(p.sku)}
                  style={{ fontWeight: 700 }}
                >
                  Add to Cart ({p.price.toLocaleString("en-IN")} INR)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky bottom cart bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t px-6 py-4"
        style={{
          background: "#ffffff",
          borderColor: "#cbd5e1",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="badge badge-royal"
              style={{ fontSize: "0.9rem", padding: "4px 14px" }}
            >
              {cart} {cart === 1 ? "module" : "modules"} selected
            </span>
            <span className="text-base font-extrabold text-black" style={{ color: "#000000" }}>
              Total:{" "}
              <span style={{ color: "#000000", textDecoration: "underline" }}>
                {totalPrice.toLocaleString("en-IN")} INR
              </span>
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => alert(`Order placed for ${totalPrice.toLocaleString("en-IN")} INR via SentinelOps Payments service.`)}
              style={{ fontWeight: 700 }}
            >
              Checkout ({totalPrice.toLocaleString("en-IN")} INR) →
            </button>
            <span className="text-xs font-semibold text-black" style={{ color: "#000000" }}>
              Powered by SentinelOps Payments service · Instant Cluster Activation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
