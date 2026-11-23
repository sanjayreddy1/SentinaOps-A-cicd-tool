import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "./utils/supabase";
import Login from "./screens/Login";
import Overview from "./screens/Overview";
import Deployments from "./screens/Deployments";
import SecurityCenter from "./screens/SecurityCenter";
import Incidents from "./screens/Incidents";
import Costs from "./screens/Costs";
import ChaosLab from "./screens/ChaosLab";
import AuditLog from "./screens/AuditLog";
import Shop from "./screens/Shop";
import GitHubFeed from "./screens/GitHubFeed";

type Screen =
  | "login"
  | "overview"
  | "shop"
  | "github"
  | "deployments"
  | "security"
  | "incidents"
  | "costs"
  | "chaos"
  | "audit";

const NAV: { id: Screen; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "shop", label: "Shop", icon: "🛒" },
  { id: "github", label: "GitHub", icon: "⚡" },
  { id: "deployments", label: "Deployments", icon: "🚀" },
  { id: "security", label: "Security", icon: "🛡️" },
  { id: "incidents", label: "Incidents", icon: "🔥" },
  { id: "costs", label: "Costs", icon: "💰" },
  { id: "chaos", label: "Chaos Lab", icon: "🧪" },
  { id: "audit", label: "Audit Log", icon: "📋" },
];

const SCREEN_TITLES: Record<Screen, string> = {
  login: "Login",
  overview: "Overview",
  shop: "Shop",
  github: "GitHub",
  deployments: "Deployments",
  security: "Security Center",
  incidents: "Incidents",
  costs: "Costs",
  chaos: "Chaos Lab",
  audit: "Audit Log",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("overview");
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setReady(true);
      if (session) {
        setScreen("overview");
      } else {
        setScreen("login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-navy-900" aria-busy="true" />;
  }

  if (!session) {
    return <Login />;
  }

  const userEmail = session.user?.email ?? "";
  const userInitial = userEmail.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex min-h-screen bg-navy-900">
      {/* ── Sidebar ── */}
      <aside
        className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-navy-800 bg-navy-900"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-navy-800 px-5 py-5">
          <span className="text-xl font-bold text-white">SentinelOps</span>
          <span className="live-dot ml-1 inline-block" aria-label="Realtime connected" />
        </div>
        <div className="px-5 pb-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-silver opacity-50">
            Console
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Console screens">
          {NAV.map((n) => {
            const isActive = screen === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setScreen(n.id)}
                className={[
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-l-2 border-cyan-accent bg-navy-700 text-white"
                    : "border-l-2 border-transparent text-silver hover:bg-navy-800 hover:text-white",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-base leading-none">{n.icon}</span>
                <span>{n.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User + Sign Out */}
        <div className="border-t border-navy-800 px-4 py-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cyan-accent text-xs font-bold text-navy-900">
              {userInitial}
            </div>
            <span
              className="truncate text-xs text-silver"
              title={userEmail}
            >
              {userEmail}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm w-full"
            onClick={() => void supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col" style={{ marginLeft: "240px" }}>
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-navy-800 bg-navy-900 px-6 py-3">
          <span className="text-xs text-silver opacity-50">SentinelOps</span>
          <span className="text-xs text-silver opacity-30">/</span>
          <span className="text-sm font-semibold text-white">
            {SCREEN_TITLES[screen]}
          </span>
        </header>

        {/* Screen content */}
        <main className="flex-1 overflow-auto px-6 py-8">
          {screen === "overview" && <Overview />}
          {screen === "shop" && <Shop onBack={() => setScreen("overview")} />}
          {screen === "github" && <GitHubFeed />}
          {screen === "deployments" && <Deployments />}
          {screen === "security" && <SecurityCenter />}
          {screen === "incidents" && <Incidents />}
          {screen === "costs" && <Costs />}
          {screen === "chaos" && <ChaosLab />}
          {screen === "audit" && <AuditLog />}
        </main>
      </div>
    </div>
  );
}
