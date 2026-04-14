import { getMissionData } from "@/lib/mission-data";
import { Timer, Play, Clock, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

export const revalidate = 300;

export default async function CronPage() {
  const { events } = await getMissionData();

  const cronEvents = events.filter(
    (e) => e.status === "CRON" || e.status === "AUTONOMY" || e.status === "IN_PROGRESS"
  );
  const upcomingEvents = events.filter((e) => e.status === "UPCOMING");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Automation</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Cron Jobs</h1>
        <p className="mt-1 text-sm text-white/50">
          Scheduled automations, proactive rituals, and recurring runs.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/35">
            <Play size={12} />
            Active
          </div>
          <p className="mt-1 text-2xl font-semibold text-white">{cronEvents.length}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/35">
            <Clock size={12} />
            Upcoming
          </div>
          <p className="mt-1 text-2xl font-semibold text-white">{upcomingEvents.length}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/35">
            <AlertCircle size={12} />
            Failed
          </div>
          <p className="mt-1 text-2xl font-semibold text-emerald-400/80">0</p>
        </div>
      </div>

      {/* Active cron jobs */}
      {cronEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Active Jobs</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {cronEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400/80">
                      {event.status}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                    {event.source}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">{event.title}</p>
                {event.description && (
                  <p className="mt-1 text-xs text-white/40">{event.description}</p>
                )}
                <p className="mt-2 text-[11px] text-white/30">
                  {event.start.toLocaleString("en-US", {
                    weekday: "short",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "America/Los_Angeles",
                  })}
                  {event.end
                    ? ` → ${event.end.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "America/Los_Angeles",
                      })}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Upcoming</h2>
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] divide-y divide-white/6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-white">{event.title}</p>
                  <p className="text-[10px] text-white/30">
                    {event.source} · {event.status}
                  </p>
                </div>
                <div className="text-[11px] text-white/35 sm:text-right">
                  <p>
                    {event.start.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      timeZone: "America/Los_Angeles",
                    })}
                  </p>
                  <p>
                    {event.start.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "America/Los_Angeles",
                    })}
                    {event.end
                      ? ` → ${event.end.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: "America/Los_Angeles",
                        })}`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder for future OpenClaw cron integration */}
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 text-center">
        <Timer size={24} className="mx-auto text-white/20" />
        <p className="mt-3 text-sm font-medium text-white/40">
          OpenClaw Cron Integration
        </p>
        <p className="mt-1 text-xs text-white/25">
          Live cron status, run history, and error logs coming in Phase 2.
        </p>
      </div>
    </div>
  );
}
