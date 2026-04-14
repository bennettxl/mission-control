import { loadDailyMemories, loadLongTermDirectives } from "@/lib/memory";
import { FileText, BookOpen } from "lucide-react";

export const revalidate = 300;

export default async function ReportsPage() {
  const [dailyMemories, directives] = await Promise.all([
    loadDailyMemories(15),
    loadLongTermDirectives(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Feed</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Reports</h1>
        <p className="mt-1 text-sm text-white/50">
          Chronological feed of cron outputs, daily briefings, and automated reports.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
        {/* Main feed — daily memories as report entries */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Daily Logs</h2>
          {dailyMemories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 text-center">
              <FileText size={24} className="mx-auto text-white/20" />
              <p className="mt-3 text-sm text-white/40">No daily logs available yet.</p>
            </div>
          ) : (
            dailyMemories.map((memory) => (
              <article
                key={memory.date}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                    {memory.label}
                  </p>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wide text-white/30">
                    Daily Log
                  </span>
                </div>
                <div className="mt-3 max-h-64 overflow-y-auto text-xs leading-relaxed text-white/55 whitespace-pre-line">
                  {memory.content}
                </div>
              </article>
            ))
          )}

          {/* Placeholder for cron output reports */}
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 text-center">
            <FileText size={24} className="mx-auto text-white/20" />
            <p className="mt-3 text-sm font-medium text-white/40">
              Cron Output Reports
            </p>
            <p className="mt-1 text-xs text-white/25">
              Automated briefing outputs, heartbeat summaries, and cron job results will appear here in Phase 2.
            </p>
          </div>
        </div>

        {/* Sidebar — directives */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <BookOpen size={14} />
            Long-Term Directives
          </h2>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            {directives.length === 0 ? (
              <p className="text-xs text-white/35">No directives logged.</p>
            ) : (
              <ul className="space-y-2">
                {directives.slice(0, 20).map((directive, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2 text-xs leading-relaxed text-white/50"
                  >
                    {directive}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
