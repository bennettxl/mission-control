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
  if (!date) return "â";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(Math.abs(diff) / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}


// Color mapping for pod heads and sub-agents
const COLOR_MAP: Record<string, { border: string; text: string; bg: string }> = {
  emerald: { border: "border-l-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  violet: { border: "border-l-violet-500", text: "text-violet-400", bg: "bg-violet-500/10" },
  amber: { border: "border-l-amber-500", text: "text-amber-400", bg: "bg-amber-500/10" },
  sky: { border: "border-l-sky-500", text: "text-sky-400", bg: "bg-sky-500/10" },
  rose: { border: "border-l-rose-500", text: "text-rose-400", bg: "bg-rose-500/10" },
  lime: { border: "border-l-lime-500", text: "text-lime-400", bg: "bg-lime-500/10" },
  orange: { border: "border-l-orange-500", text: "text-orange-400", bg: "bg-orange-500/10" },
  teal: { border: "border-l-teal-500", text: "text-teal-400", bg: "bg-teal-500/10" },
};

const BORDER_TOP_MAP: Record<string, string> = {
  emerald: "border-t-emerald-500",
  violet: "border-t-violet-500",
  amber: "border-t-amber-500",
  sky: "border-t-sky-500",
  rose: "border-t-rose-500",
  lime: "border-t-lime-500",
  orange: "border-t-orange-500",
  teal: "border-t-teal-500",
};

const POD_HEADS = [
  { name: "Main", role: "Router & System Orchestrator", model: "openai-codex/gpt-5.4", color: "emerald", detail: "default router - no direct crons" },
  { name: "Jessica", role: "Chief of Staff / Mission Control", model: "openai-codex/gpt-5.4", color: "violet", detail: "4 crons - cross-pod digest, sales recap, SOP, memory" },
  { name: "Kirk", role: "FluidCloud Sales & Partnerships", model: "openai-codex/gpt-5.4", color: "amber", detail: "16 crons / 27 skills - intent, POC, outbound stack, prep" },
  { name: "Work", role: "Host Trusted / Engineering Ops", model: "openai-codex/gpt-5.4", color: "sky", detail: "4 crons - Grain sync 2x, health pull, system snapshot" },
  { name: "Tammy", role: "CISO & System Health", model: "openai-codex/gpt-5.4", color: "rose", detail: "11 crons - audits 2x, cron sync 15m, harness, wiki ingest" },
  { name: "Dr. Attia", role: "Longevity & Health Pod", model: "openai-codex/gpt-5.4", color: "lime", detail: "2 crons - morning brief, weekly strategy review" },
  { name: "Harrel", role: "Real David Art Studio Lead", model: "openai-codex/gpt-5.4", color: "orange", detail: "1 cron - weekly studio review, image gen, video frames" },
  { name: "Ralph", role: "RDA Security GM", model: "openai-codex/gpt-5.4", color: "teal", detail: "2 crons - RDA business review + daily signal pipeline" },
];

const SUB_AGENTS = [
  { name: "Sage", parent: "Kirk", role: "Intent Signal Scanner", color: "amber" },
  { name: "Tyler", parent: "Kirk", role: "ZoomInfo Enricher (was hal)", color: "amber" },
  { name: "Marty", parent: "Kirk", role: "Outreach Drafter (was rex)", color: "amber" },
  { name: "Whitney", parent: "Kirk", role: "LinkedIn Variants (was chloe)", color: "amber" },
  { name: "Andrew", parent: "Kirk", role: "SF CRM Writer (was priya)", color: "amber" },
  { name: "Alan", parent: "Tammy", role: "Log Auditor", color: "rose" },
  { name: "Jennifer", parent: "Tammy", role: "Session Journal (was journal)", color: "rose" },
  { name: "Sophia", parent: "Ralph", role: "RDA Researcher (was scout)", color: "teal" },
  { name: "David-Goggins", parent: "Dr. Attia", role: "Fitness Enforcer", color: "lime" },
  { name: "Gabrielle-Lyon", parent: "Dr. Attia", role: "Nutrition Specialist", color: "lime" },
];


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
          {pacificDate} Â· {pacificTime} PT
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
              <p className="mt-2 text-2xl font-semibold text-white">{weather.temperatureF}Â°F</p>
              <p className="text-[11px] text-white/40">
                {weather.description} Â· {weather.windSpeed} mph
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-white/40">Unavailable</p>
          )}
        </div>
      </div>

      {/* System Overview stat row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SystemOverviewCard number="18" label="Agents" subtitle="8 pod heads + 10 subagents" />
        <SystemOverviewCard number="44" label="Cron Jobs" subtitle="40 enabled / 4 retired" />
        <SystemOverviewCard number="129" label="Skills" subtitle="across all agents" />
        <SystemOverviewCard number="376" label="Transcripts" subtitle="Grain, synced 2x daily" />
        <SystemOverviewCard number="12+" label="Integrations" subtitle="SF, Slack, Supabase, Discord..." />
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
      {/* Agent Fleet - Pod Heads */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">Agent Fleet . 8 Pod Heads</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POD_HEADS.map((agent) => {
            const colorConfig = COLOR_MAP[agent.color];
            return (
              <div
                key={agent.name}
                className={clsx(
                  "rounded-2xl border border-white/8 bg-white/[0.03] p-4",
                  "border-l-2",
                  colorConfig.border
                )}
              >
                <p className="text-base font-bold text-white">{agent.name}</p>
                <p className="mt-0.5 text-xs text-white/50">{agent.role}</p>
                <p className="mt-1.5 text-[10px] font-mono text-white/30">{agent.model}</p>
                <p className={clsx("mt-2 text-[10px]", colorConfig.text)}>{agent.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
      {/* Sub-Agent Fleet */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-3">Sub-Agent Fleet . 10 (All on OpenAI-Codex/GPT-5.4-Mini)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SUB_AGENTS.map((agent) => {
            const topBorderClass = BORDER_TOP_MAP[agent.color];
            return (
              <div
                key={agent.name}
                className={clsx(
                  "rounded-2xl border border-white/8 bg-white/[0.03] p-4",
                  "border-t-2",
                  topBorderClass
                )}
              >
                <p className="text-sm font-bold text-white">{agent.name}</p>
                <p className="mt-1 text-[11px] text-white/40">{agent.parent}</p>
                <p className="text-[11px] text-white/40">{agent.role}</p>
              </div>
            );
          })}
        </div>
      </div>

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

function SystemOverviewCard({
  number,
  label,
  subtitle,
}: {
  number: string;
  label: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-center">
      <p className="text-3xl font-bold text-white">{number}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="mt-1 text-[11px] text-white/30">{subtitle}</p>
    </div>
  );
}
