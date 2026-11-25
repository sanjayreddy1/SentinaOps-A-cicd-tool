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
import License from "./screens/License";
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
  | "audit"
  | "license";

const NAV: { id: Screen; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "deployments", label: "Deployments", icon: "🚀" },
  { id: "history", label: "History", icon: "📜" },
  { id: "security", label: "Security", icon: "🛡️" },
  { id: "shop", label: "Store", icon: "🛒" },
  { id: "chatbot", label: "Chatbot (RAG)", icon: "💬" },
  { id: "github", label: "GitHub", icon: "⚡" },
  { id: "incidents", label: "Incidents", icon: "🔥" },
  { id: "costs", label: "Costs (INR)", icon: "💰" },
  { id: "chaos", label: "Chaos Lab", icon: "🧪" },
  { id: "audit", label: "Audit Log", icon: "📋" },
  { id: "license", label: "License & MIT", icon: "⚖️" },
];

const SCREEN_TITLES: Record<Screen, string> = {
  login: "Login",
  overview: "Overview",
  chatbot: "AI Assistant (RAG Knowledge Engine)",
  shop: "Platform Store (INR)",
  github: "GitHub Feed",
  deployments: "CI/CD & Cloud Deployments",
  history: "Deployment History",
  security: "Security Center",
  incidents: "Incidents",
  costs: "Cost & Capacity (INR)",
  chaos: "Chaos Lab",
  audit: "Audit Log",
  license: "License & Terms (MIT Copyright © 2026)",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("overview");
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isChatbotWidgetOpen, setIsChatbotWidgetOpen] = useState(false);
  const [previewAppInfo, setPreviewAppInfo] = useState<{
    app: string;
    branch: string;
    owner: string;
  } | null>(null);

  useEffect(() => {
    // 1. Initialize Theme (default light / white background with black text)
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
    return <div className="min-h-screen bg-white" aria-busy="true" />;
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
        isLight ? "bg-white text-black" : "bg-navy-900 text-white"
      }`}
      style={{ color: isLight ? "#000000" : undefined }}
    >
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r transition-colors ${
          isLight
            ? "border-slate-300 bg-white"
            : "border-navy-800 bg-navy-900"
        }`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-2 border-b px-5 py-5 ${
            isLight ? "border-slate-300" : "border-navy-800"
          }`}
        >
          <span
            className={`text-xl font-black ${
              isLight ? "text-black" : "text-white"
            }`}
            style={{ color: isLight ? "#000000" : undefined }}
          >
            SentinelOps
          </span>
          <span className="live-dot ml-1 inline-block" aria-label="Realtime connected" />
        </div>
        <div className="px-5 pb-2 pt-2">
          <span
            className={`text-xs font-black uppercase tracking-widest ${
              isLight ? "text-black" : "text-silver opacity-50"
            }`}
            style={{ color: isLight ? "#000000" : undefined }}
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
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition-colors",
                  isActive
                    ? isLight
                      ? "border-l-4 border-black bg-slate-100 text-black font-extrabold"
                      : "border-l-4 border-cyan-accent bg-navy-700 text-white font-extrabold"
                    : isLight
                    ? "border-l-4 border-transparent text-black hover:bg-slate-100 hover:text-black"
                    : "border-l-4 border-transparent text-silver hover:bg-navy-800 hover:text-white",
                ].join(" ")}
                style={{ color: isLight ? "#000000" : undefined }}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-base leading-none">{n.icon}</span>
                <span>{n.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User + Sign Out + Copyright License Footer */}
        <div
          className={`border-t px-4 py-3 ${
            isLight ? "border-slate-300 bg-slate-50" : "border-navy-800"
          }`}
        >
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black text-xs font-extrabold text-white">
              {userInitial}
            </div>
            <span
              className={`truncate text-xs font-bold ${
                isLight ? "text-black" : "text-silver"
              }`}
              style={{ color: isLight ? "#000000" : undefined }}
              title={userEmail}
            >
              {userEmail}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm w-full"
            style={{ fontWeight: 700, color: isLight ? "#000000" : undefined, borderColor: isLight ? "#000000" : undefined }}
            onClick={() => void supabase.auth.signOut()}
          >
            Sign Out
          </button>

          {/* Prominent Copyright Notice */}
          <div className="mt-3 border-t border-slate-200 pt-2 text-center">
            <button
              type="button"
              onClick={() => setScreen("license")}
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
            >
              <p className="text-xs font-extrabold text-black" style={{ color: "#000000", margin: 0 }}>
                © 2026 Sanjay Kumar
              </p>
              <p className="text-xs font-semibold text-black hover:underline" style={{ color: "#000000", margin: 0 }}>
                MIT License &amp; Terms ↗
              </p>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col" style={{ marginLeft: "240px" }}>
        {/* Top bar */}
        <header
          className={`sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 transition-colors ${
            isLight
              ? "border-slate-300 bg-white"
              : "border-navy-800 bg-navy-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold ${
                isLight ? "text-black" : "text-silver opacity-50"
              }`}
              style={{ color: isLight ? "#000000" : undefined }}
            >
              SentinelOps
            </span>
            <span
              className={`text-xs font-bold ${
                isLight ? "text-black" : "text-silver opacity-30"
              }`}
              style={{ color: isLight ? "#000000" : undefined }}
            >
              /
            </span>
            <span
              className={`text-sm font-extrabold ${
                isLight ? "text-black" : "text-white"
              }`}
              style={{ color: isLight ? "#000000" : undefined }}
            >
              {SCREEN_TITLES[screen]}
            </span>
          </div>

          {/* Theme switcher & quick controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                isLight
                  ? "border-black bg-white text-black hover:bg-slate-100"
                  : "border-navy-700 bg-navy-800 text-white hover:bg-navy-700"
              }`}
              style={{ color: isLight ? "#000000" : undefined, borderColor: isLight ? "#000000" : undefined }}
              title="Toggle Light (White) / Dark Background"
            >
              <span>{isLight ? "☀️ White (Active)" : "🌙 Dark Theme"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsChatbotWidgetOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-full bg-black px-3.5 py-1 text-xs font-bold text-white hover:bg-slate-800"
            >
              <span>💬 Ask AI</span>
            </button>
          </div>
        </header>

        {/* Screen content */}
        <main className="flex-1 overflow-auto px-6 py-8" style={{ color: isLight ? "#000000" : undefined }}>
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
          {screen === "license" && <License />}
        </main>
      </div>

      {/* ── FLOATING CHATBOT WIDGET AT BOTTOM RIGHT ── */}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999 }}>
        {isChatbotWidgetOpen ? (
          <div
            style={{
              width: "390px",
              maxWidth: "92vw",
              height: "560px",
              maxHeight: "82vh",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.25)",
              borderRadius: "16px",
              overflow: "hidden",
              background: "#ffffff",
              border: "2px solid #000000",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Chatbot isWidget={true} onClose={() => setIsChatbotWidgetOpen(false)} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsChatbotWidgetOpen(true)}
            className="btn btn-primary"
            style={{
              borderRadius: "999px",
              padding: "12px 20px",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.28)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: 800,
              fontSize: "0.88rem",
              background: "#000000",
              color: "#ffffff",
              border: "2px solid #ffffff",
              cursor: "pointer",
            }}
            title="Open SentinelOps AI Chatbot Assistant"
          >
            <span style={{ fontSize: "1.2rem" }}>💬</span>
            <span>SentinelOps AI</span>
            <span className="live-dot" style={{ width: "8px", height: "8px", background: "#22c55e" }} />
          </button>
        )}
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
