import { useState } from "react";

type SKU = "SO-100" | "SO-200" | "SO-300";

const PRODUCTS: {
  sku: SKU;
  name: string;
  price: number;
  emoji: string;
  description: string;
}[] = [
  {
    sku: "SO-100",
    name: "On-Call Mug",
    price: 24,
    emoji: "🫖",
    description: "Perfect for the midnight deploy",
  },
  {
    sku: "SO-200",
    name: "Self-Heal Hoodie",
    price: 64,
    emoji: "👕",
    description: "Stay warm during the 3am incident",
  },
  {
    sku: "SO-300",
    name: "Canary Cap",
    price: 34,
    emoji: "🧢",
    description: "Rep the canary deployment life",
  },
];

export default function Shop({ onBack }: { onBack: () => void }) {
  const [cart, setCart] = useState<number>(0);
  const [quantities, setQuantities] = useState<Record<SKU, number>>({
    "SO-100": 0,
    "SO-200": 0,
    "SO-300": 0,
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
    <div className="min-h-screen pb-28">
      {/* Back link */}
      <div className="px-6 pt-6">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onBack}
        >
          ← Back to Console
        </button>
      </div>

      {/* Hero banner */}
      <div className="mx-auto max-w-5xl px-6 pt-6">
        <div
          className="rounded-2xl border border-navy-700 bg-navy-800 px-8 py-10"
          style={{ background: "var(--so-navy-800)" }}
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-white">
              SentinelOps Merch{" "}
              <span role="img" aria-label="rocket">
                🚀
              </span>
            </h1>
            <p className="text-lg font-semibold text-cyan-accent" style={{ color: "var(--so-cyan-400)" }}>
              Official gear for the on-call hero
            </p>
            <p className="mt-1 max-w-xl text-sm" style={{ color: "var(--text-muted)" }}>
              Greenfield e-commerce demo running on the SentinelOps platform.
              Every purchase supports 24/7 uptime — metaphorically.
            </p>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Products
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <div
              key={p.sku}
              className="card flex flex-col gap-4"
              style={{
                transition: "box-shadow 200ms ease, border-color 200ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 0 0 1px var(--so-primary-600), 0 8px 32px rgba(65,105,225,0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "";
              }}
            >
              {/* Emoji icon */}
              <div className="flex items-center justify-center">
                <div
                  className="flex items-center justify-center rounded-full text-4xl"
                  style={{
                    width: 64,
                    height: 64,
                    background: "var(--so-navy-700)",
                    border: "1px solid var(--border)",
                  }}
                  aria-hidden="true"
                >
                  {p.emoji}
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  SKU: {p.sku}
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--so-cyan-400)" }}
                >
                  ${p.price}
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {p.description}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-auto flex flex-col gap-2">
                {quantities[p.sku] > 0 && (
                  <p
                    className="text-center text-xs font-semibold"
                    style={{ color: "var(--so-success)" }}
                  >
                    {quantities[p.sku]} in cart
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => addToCart(p.sku)}
                >
                  Add to cart
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
          background: "var(--so-navy-800)",
          borderColor: "var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="badge badge-royal"
              style={{ fontSize: "0.9rem", padding: "4px 14px" }}
            >
              {cart} {cart === 1 ? "item" : "items"}
            </span>
            <span className="text-sm font-semibold text-white">
              Total:{" "}
              <span style={{ color: "var(--so-cyan-400)" }}>
                ${totalPrice}
              </span>
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button type="button" className="btn btn-accent btn-lg">
              Checkout →
            </button>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Powered by SentinelOps Payments service
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
