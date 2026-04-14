"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";

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
        body: JSON.stringify({ password, next: searchParams.get("next") ?? "/" }),
      });
      const data = await res.json();

      if (data.ok) {
        // Full page reload ensures the cookie is sent with the next request
        window.location.href = data.redirect ?? "/";
      } else {
        setError(data.error ?? "Invalid password");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/branding/xl-logo.jpg"
            alt="XLInteractive"
            width={64}
            height={64}
            className="h-16 w-16 rounded-2xl border border-white/20 object-cover shadow-lg"
          />
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-white">Mission Control</h1>
            <p className="mt-1 text-sm text-white/50">Enter your access code to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Access code"
              autoFocus
              className="w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          {error && (
            <p className="text-center text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-2xl bg-white/10 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15 active:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Authenticating…" : "Enter Mission Control"}
          </button>
        </form>

        <p className="text-center text-[11px] text-white/25">
          XLInteractive · Secure Access
        </p>
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
