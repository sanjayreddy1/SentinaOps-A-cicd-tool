import { useState, type FormEvent } from "react";
import { supabase } from "../utils/supabase";

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-5.16 5.94" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.66.41.35.77 1.05.77 2.12v3.14c0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

const ROLES = ["admin", "developer", "viewer"];

const FEATURES = [
  {
    icon: "🚀",
    title: "Instant Deployments",
    desc: "Push to prod with confidence. Full rollback in 30 seconds.",
  },
  {
    icon: "🛡️",
    title: "Continuous Security",
    desc: "CVE scanning, secret detection, and drift alerts — always on.",
  },
  {
    icon: "🔥",
    title: "Incident Intelligence",
    desc: "AI-assisted triage, runbooks, and automated self-healing.",
  },
];

export default function Login() {
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("developer");
  const [authMsg, setAuthMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const signIn = async (e?: FormEvent) => {
    e?.preventDefault();
    setAuthMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthMsg({ ok: false, text: `Sign in failed: ${error.message}` });
    }
  };

  const signInWithGithub = async () => {
    setAuthMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setAuthMsg({ ok: false, text: `GitHub sign-in failed: ${error.message}` });
    }
  };

  const createUser = async () => {
    setAuthMsg(null);
    const { error } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
      options: { data: { username: newUsername, role: newRole } },
    });
    if (error) {
      setAuthMsg({ ok: false, text: `Could not create user "${newUsername}": ${error.message}` });
      return;
    }
    setAuthMsg({
      ok: true,
      text: `User "${newUsername}" created with role "${newRole}" in Supabase Auth.`,
    });
  };

  return (
    <div className="flex min-h-screen bg-navy-900">
      {/* ── Left branding panel (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(135deg, #0d1117 0%, #0f1923 50%, #0a1628 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Top: brand */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl font-bold text-white">SentinelOps</span>
            <span className="live-dot ml-1 inline-block" aria-label="Realtime connected" />
          </div>
          <h2
            className="text-4xl font-bold leading-tight text-white mb-4"
            style={{ letterSpacing: "-0.02em" }}
          >
            Ship fast.
            <br />
            Stay secure.
            <br />
            <span className="text-gradient">Self-heal.</span>
          </h2>
          <p className="text-silver opacity-70 text-base mt-4 max-w-xs">
            The SRE platform built for teams who move at speed without trading off reliability.
          </p>
        </div>

        {/* Middle: feature bullets */}
        <div className="space-y-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{f.title}</p>
                <p className="text-silver opacity-60 text-sm mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: footer note */}
        <p className="text-xs text-silver opacity-30">
          © 2026 SentinelOps. All systems operational.
        </p>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo (mobile visible + desktop) */}
          <div className="mb-8 text-center lg:text-left">
            <span className="text-xl font-bold text-white lg:hidden">SentinelOps</span>
            <h1 className="mt-2 text-2xl font-bold text-white">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p className="mt-1 text-sm text-silver opacity-60">
              {mode === "signin"
                ? "Sign in to your console"
                : "Set up a new SentinelOps account"}
            </p>
          </div>

          <div className="card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="stack">
              {/* GitHub SSO — primary CTA (sign in mode only) */}
              {mode === "signin" && (
                <>
                  <button
                    type="button"
                    className="btn btn-white btn-block flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
                    onClick={() => void signInWithGithub()}
                  >
                    <GithubIcon />
                    Sign in with GitHub
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center py-1">
                    <div className="flex-1 border-t border-navy-800" />
                    <span className="mx-3 flex-shrink-0 text-xs text-silver opacity-40">
                      or continue with email
                    </span>
                    <div className="flex-1 border-t border-navy-800" />
                  </div>
                </>
              )}

              {/* Sign in form */}
              {mode === "signin" ? (
                <form onSubmit={(e) => void signIn(e)} className="stack">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-silver" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      className="input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-silver" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        className="input"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    Sign In
                  </button>
                </form>
              ) : (
                /* Create account form */
                <div className="stack">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-silver" htmlFor="new-username">
                      Username
                    </label>
                    <input
                      id="new-username"
                      className="input"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="jane.doe"
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-silver" htmlFor="new-email">
                      Email
                    </label>
                    <input
                      id="new-email"
                      className="input"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="jane.doe@company.com"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-silver" htmlFor="new-password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        className="input"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-silver" htmlFor="new-role">
                      Role
                    </label>
                    <select
                      id="new-role"
                      className="input"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => void createUser()}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* Auth message */}
              {authMsg && (
                <div className={`alert ${authMsg.ok ? "alert-success" : "alert-danger"}`}>
                  <p className="text-sm text-gray-200">{authMsg.text}</p>
                </div>
              )}
            </div>
          </div>

          {/* Toggle sign in / create */}
          <p className="mt-5 text-center text-sm text-silver opacity-60">
            {mode === "signin" ? (
              <>
                No account?{" "}
                <button
                  type="button"
                  className="font-medium text-cyan-accent hover:underline"
                  onClick={() => { setMode("create"); setAuthMsg(null); }}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-cyan-accent hover:underline"
                  onClick={() => { setMode("signin"); setAuthMsg(null); }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
