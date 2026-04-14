import { getMissionData } from "@/lib/mission-data";
import { loadWeather } from "@/lib/weather";
import { INTEGRATIONS } from "@/lib/integrations";
import {
  ActivitySquare,
  CalendarDays,
  CheckCircle2,
  Coins,
  ArrowRight,
  CloudSun,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export const revalidate = 300;

function relativeTime(date: Date | null): string {
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(Math.abs(diff) / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default async function OverviewPage() {
  const [{ tasks, events, documents }, weather] = await Promise.all([
    getMissionData(),
    loadWeather(),
  ]);

  const pacificNow = new Date();
  const pacificDate = pacificNow.toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const pacificTime = pacificNow.toLocaleTimeString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
  });

  const activeTasks = tasks.filter((t) => t.status !== "COMPLETE").length;
  const cronCount = events.filter(
    (e) => e.status === "CRON" || e.status === "AUTONOMY" || e.status === "IN_PROGRESS"
  ).length;
  const docCount = documents.length;

  const recentActivity = [...tasks.slice(0, 5)].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  const connectors = INTEGRATIONS.map((integration) => {
    const envVar = integration.envVar as keyof NodeJS.ProcessEnv;
    const configured = Boolean(process.env[envVar]);
    return { ...integration, status: configured ? "connected" : "configure" };
  });

  const quickLinks = [
    { href: "/tasks", label: "Task Board", desc: "Kanban pipeline" },
    { href: "/cron", label: "Cron Jobs", desc: "Scheduled runs" },
    { href: "/tokens", label: "Token Usage", desc: "Cost tracking" },
    { href: "/reports", label: "Reports", desc: "Output feed" },
    { href: "/projects", label: "Projects", desc: "Workstreams" },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Overview</h1>
        <p className="mt-1 text-sm text-white/50">
          {pacificDate} · {pacificTime} PT
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={ActivitySquare} label="Active tasks" value={activeTasks} />
        <StatCard icon={CalendarDays} label="Scheduled runs" value={cronCount} />
        <StatCard icon={CheckCircle2} label="Docs indexed" value={docCount} />
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40">
            <CloudSun size={14} />
            Bay Area
          </div>
          {weather ? (
            <>
              <p className="mt-2 text-2xl font-semibold text-white">{weather.temperatureF}°F</p>
              <p className="text-[11px] text-white/40">
                {weather.description} · {weather.windSpeed} mph
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-white/40">Unavailable</p>
          )}
        </div>
      </div>

      {/* Connectors */}
      <div className="grid gap-3 sm:grid-cols-3">
        {connectors.map((c) => (
          <div
            key={c.key}
            className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-white">{c.name}</p>
              <p className="text-[11px] text-white/40">{c.description}</p>
            </div>
            <span
              className={clsx(
                "text-[10px] uppercase tracking-wide",
                c.status === "connected" ? "text-emerald-400/80" : "text-amber-300/70"
              )}
            >
              {c.status}
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* Recent activity */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            <Link
              href="/tasks"
              className="flex items-center gap-1 text-[11px] text-white/40 transition hover:text-white/60"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentActivity.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-white/6 bg-white/[0.02] p-3"
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/35">
                  <span>{task.source}</span>
                  <span>{relativeTime(task.updatedAt)}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-white">{task.title}</p>
                {task.description && (
                  <p className="mt-0.5 text-xs text-white/45 line-clamp-1">{task.description}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wide",
                      task.status === "COMPLETE"
                        ? "bg-emerald-500/15 text-emerald-400/80"
                        : task.status === "IN_PROGRESS"
                        ? "bg-blue-500/15 text-blue-400/80"
                        : task.status === "REVIEW"
                        ? "bg-purple-500/15 text-purple-400/80"
                        : "bg-white/5 text-white/40"
                    )}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                  {task.owner && (
                    <span className="text-[10px] text-white/30">{task.owner}</span>
                  )}
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-xs text-white/40">No recent activity.</p>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Quick Links</h2>
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 transition hover:border-white/15 hover:bg-white/[0.05]"
            >
              <div>
                <p className="text-sm font-medium text-white">{link.label}</p>
                <p className="text-[11px] text-white/40">{link.desc}</p>
              </div>
              <ArrowRight size={16} className="text-white/25" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ActivitySquare;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40">
        <Icon size={14} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
