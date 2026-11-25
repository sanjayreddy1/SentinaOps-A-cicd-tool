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
import History from "./screens/History";
import Chatbot from "./screens/Chatbot";
import LiveAppPreview from "./screens/LiveAppPreview";

type Screen =
  | "login"
  | "overview"
  | "shop"
  | "github"
  | "deployments"
  | "history"
  | "chatbot"
  | "security"
  | "incidents"
  | "costs"
  | "chaos"
  | "audit";

const NAV: { id: Screen; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "chatbot", label: "Chatbot (RAG)", icon: "💬" },
  { id: "deployments", label: "Deployments", icon: "🚀" },
  { id: "history", label: "History", icon: "📜" },
  { id: "security", label: "Security", icon: "🛡️" },
  { id: "github", label: "GitHub", icon: "⚡" },
  { id: "shop", label: "Shop", icon: "🛒" },
  { id: "incidents", label: "Incidents", icon: "🔥" },
  { id: "costs", label: "Costs", icon: "💰" },
  { id: "chaos", label: "Chaos Lab", icon: "🧪" },
  { id: "audit", label: "Audit Log", icon: "📋" },
];

const SCREEN_TITLES: Record<Screen, string> = {
  login: "Login",
  overview: "Overview",
  chatbot: "AI Assistant (RAG Knowledge Engine)",
  shop: "Shop",
  github: "GitHub",
  deployments: "Deployments",
  history: "Deployment History",
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [previewAppInfo, setPreviewAppInfo] = useState<{
    app: string;
    branch: string;
    owner: string;
  } | null>(null);

  useEffect(() => {
    // 1. Initialize Theme (default light / white background)
    const savedTheme = (localStorage.getItem("sentinelops-theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    // 2. Check URL parameters for direct repo preview (e.g. ?app=sanjusportfolio&branch=master)
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get("app") || params.get("preview");
    if (appParam) {
      setPreviewAppInfo({
        app: appParam,
        branch: params.get("branch") || "master",
        owner: params.get("owner") || "sanjayreddy1",
      });
    }

    // 3. Supabase Auth
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

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("sentinelops-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  if (!ready) {
    return <div className="min-h-screen bg-slate-50" aria-busy="true" />;
  }

  if (!session) {
    return <Login />;
  }

  const userEmail = session.user?.email ?? "";
  const userInitial = userEmail.charAt(0).toUpperCase() || "U";
  const isLight = theme === "light";

  return (
    <div
      className={`flex min-h-screen ${
        isLight ? "bg-slate-50 text-slate-900" : "bg-navy-900 text-white"
      }`}
    >
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r transition-colors ${
          isLight
            ? "border-slate-200 bg-white"
            : "border-navy-800 bg-navy-900"
        }`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-2 border-b px-5 py-5 ${
            isLight ? "border-slate-200" : "border-navy-800"
          }`}
        >
          <span
            className={`text-xl font-bold ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            SentinelOps
          </span>
          <span className="live-dot ml-1 inline-block" aria-label="Realtime connected" />
        </div>
        <div className="px-5 pb-2 pt-2">
          <span
            className={`text-xs font-bold uppercase tracking-widest ${
              isLight ? "text-slate-400" : "text-silver opacity-50"
            }`}
          >
            Autonomous Console
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
                    ? isLight
                      ? "border-l-2 border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                      : "border-l-2 border-cyan-accent bg-navy-700 text-white font-semibold"
                    : isLight
                    ? "border-l-2 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
        <div
          className={`border-t px-4 py-4 ${
            isLight ? "border-slate-200" : "border-navy-800"
          }`}
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {userInitial}
            </div>
            <span
              className={`truncate text-xs ${
                isLight ? "text-slate-600" : "text-silver"
              }`}
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
        <header
          className={`sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 transition-colors ${
            isLight
              ? "border-slate-200 bg-white"
              : "border-navy-800 bg-navy-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${
                isLight ? "text-slate-400" : "text-silver opacity-50"
              }`}
            >
              SentinelOps
            </span>
            <span
              className={`text-xs ${
                isLight ? "text-slate-300" : "text-silver opacity-30"
              }`}
            >
              /
            </span>
            <span
              className={`text-sm font-semibold ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              {SCREEN_TITLES[screen]}
            </span>
          </div>

          {/* Theme switcher & quick controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                isLight
                  ? "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
                  : "border-navy-700 bg-navy-800 text-white hover:bg-navy-700"
              }`}
              title="Toggle Light (White) / Dark Background"
            >
              <span>{isLight ? "☀️ White Background" : "🌙 Dark Theme"}</span>
            </button>

            <button
              type="button"
              onClick={() => setScreen("chatbot")}
              className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <span>💬 Ask AI</span>
            </button>
          </div>
        </header>

        {/* Screen content */}
        <main className="flex-1 overflow-auto px-6 py-8">
          {screen === "overview" && <Overview />}
          {screen === "chatbot" && <Chatbot />}
          {screen === "shop" && <Shop onBack={() => setScreen("overview")} />}
          {screen === "github" && <GitHubFeed />}
          {screen === "deployments" && <Deployments />}
          {screen === "history" && <History />}
          {screen === "security" && <SecurityCenter />}
          {screen === "incidents" && <Incidents />}
          {screen === "costs" && <Costs />}
          {screen === "chaos" && <ChaosLab />}
          {screen === "audit" && <AuditLog />}
        </main>
      </div>

      {/* Direct In-App Live Preview from URL params (?app=...) */}
      {previewAppInfo && (
        <LiveAppPreview
          appName={previewAppInfo.app}
          owner={previewAppInfo.owner}
          branch={previewAppInfo.branch}
          onClose={() => setPreviewAppInfo(null)}
        />
      )}
    </div>
  );
}
