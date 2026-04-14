import { getMissionData, type MissionDataSnapshot } from "@/lib/mission-data";
import { TaskIntentForm } from "@/components/task-intent-form";
import { clsx } from "clsx";

export const revalidate = 300;

const TASK_COLUMNS = [
  { key: "BACKLOG", title: "Backlog", color: "bg-white/5" },
  { key: "IN_PROGRESS", title: "In Progress", color: "bg-blue-500/10" },
  { key: "REVIEW", title: "In Review", color: "bg-purple-500/10" },
  { key: "COMPLETE", title: "Done", color: "bg-emerald-500/10" },
];

type LabelToken = { key: string | null; value: string; raw: string };

function parseLabels(labels: string | null): LabelToken[] {
  if (!labels) return [];
  try {
    const parsed = JSON.parse(labels);
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => {
        const s = String(entry);
        if (s.includes(":")) {
          const [key, ...rest] = s.split(":");
          return { key: key.trim().toLowerCase(), value: rest.join(":").trim(), raw: s };
        }
        return { key: null, value: s.trim(), raw: s };
      });
    }
    return [];
  } catch {
    return [];
  }
}

export default async function TasksPage() {
  const { tasks } = await getMissionData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Tasks</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Task Board</h1>
        <p className="mt-1 text-sm text-white/50">
          Kanban pipeline with natural language intake. Cards assigned to "O" auto-execute.
        </p>
      </div>

      {/* Natural language intake */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/35">
          <span>Natural language intake</span>
          <span>OpenRouter</span>
        </div>
        <p className="mt-1 text-xs text-white/45">
          Drop instructions → task gets drafted, assigned, and moved into the pipeline.
        </p>
        <div className="mt-3">
          <TaskIntentForm />
        </div>
      </div>

      {/* Kanban columns — horizontal scroll on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {TASK_COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.key);
          return (
            <div
              key={column.key}
              className="min-w-[280px] flex-shrink-0 rounded-2xl border border-white/8 bg-white/[0.02] p-4 lg:min-w-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={clsx("h-2 w-2 rounded-full", column.color)} />
                  <p className="text-sm font-semibold text-white">{column.title}</p>
                </div>
                <span className="text-xs text-white/35">{columnTasks.length}</span>
              </div>

              <div className="mt-4 space-y-3">
                {columnTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-xl border border-white/6 bg-white/[0.03] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      <span className="flex-shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
                        {(task.owner ?? task.source ?? "?").slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-xs text-white/40 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {parseLabels(task.labels).map((label) => (
                        <span
                          key={label.raw}
                          className="rounded-full border border-white/8 px-2 py-0.5 text-[9px] uppercase tracking-wide text-white/35"
                        >
                          {label.value}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
                {columnTasks.length === 0 && (
                  <p className="py-4 text-center text-xs text-white/30">No cards</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
