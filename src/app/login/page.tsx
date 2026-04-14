"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { Lock, ArrowRight, Zap, BarChart3, Bot, Shield } from "lucide-react";

/* âââ Animated grid dot pattern (CSS-only) âââ */
function GridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(220,38,38,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(220,38,38,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.06),transparent_50%)]" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,#09090b_100%)]" />
    </div>
  );
}

/* âââ Feature pill âââ */
function FeaturePill({ icon: Icon, label }: { icon: typeof Zap; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-white/50">
      <Icon size={14} className="text-red-500/70" />
      <span>{label}</span>
    </div>
  );
}

/* âââ Login form âââ */
function LoginForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          next: searchParams.get("next") ?? "/",
        }),
      });
      const data = await res.json();

      if (data.ok) {
        window.location.href = data.redirect ?? "/";
      } else {
        setError(data.error ?? "Invalid access code");
      }
    } catch {
      setError("Network error â please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* âââ Left panel: Brand story âââ */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-[#09090b] px-8 py-10 lg:w-[55%] lg:px-16 lg:py-14">
        <GridPattern />

        {/* Top: Logo + wordmark */}
        <div className="relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <Image
              src="/branding/xl-logo-shield.png"
              alt="XLInteractive"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <div>
              <span className="text-base font-bold text-white">
                XL<span className="text-red-500">Interactive</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Headline */}
        <div className="relative z-10 my-auto max-w-lg py-12 lg:py-0">
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-red-500/80">
              Command Center
            </p>
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Mission{" "}
              <span className="text-red-500">Control</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/40 lg:text-base lg:leading-relaxed">
              Intelligent Understanding, Seamless Communication. Your unified
              dashboard for tasks, automation, reports, and AI agent systems.
            </p>
          </div>

          {/* Feature pills */}
          <div
            className="mt-8 flex flex-wrap gap-2"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            <FeaturePill icon={Bot} label="AI Agents" />
            <FeaturePill icon={BarChart3} label="Token Tracking" />
            <FeaturePill icon={Zap} label="Cron Automation" />
            <FeaturePill icon={Shield} label="Secure Access" />
          </div>
        </div>

        {/* Bottom: Tagline bar */}
        <div className="relative z-10">
          <div
            className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white/20"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            <span>Optimize</span>
            <span className="h-1 w-1 rounded-full bg-red-500/50" />
            <span>Automate</span>
            <span className="h-1 w-1 rounded-full bg-red-500/50" />
            <span>Elevate</span>
          </div>
        </div>
      </div>

      {/* âââ Right panel: Login form âââ */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#0c0c0f] px-6 py-12 lg:px-16">
        <div
          className="w-full max-w-sm animate-fade-in-up"
          style={{ animationDelay: "0.15s", animationFillMode: "both" }}
        >
          {/* Mobile logo (hidden on desktop, shown when left panel scrolls away) */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Image
              src="/branding/xl-logo-shield.png"
              alt="XLInteractive"
              width={48}
              height={48}
              className="mb-3 h-12 w-12 object-contain"
            />
            <h2 className="text-lg font-bold text-white">
              Mission <span className="text-red-500">Control</span>
            </h2>
          </div>

          {/* Desktop heading */}
          <div className="mb-8 hidden lg:block">
            <h2 className="text-xl font-semibold text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-white/40">
              Enter your access code to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="access-code"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/30"
              >
                Access Code
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
                />
                <input
                  id="access-code"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter code"
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 transition-all duration-150 focus:border-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-150 hover:bg-red-500 hover:shadow-red-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Authenticatingâ¦</span>
                </>
              ) : (
                <>
                  <span>Enter Mission Control</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-white/15">
            XLInteractive Â· Secure Access
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
