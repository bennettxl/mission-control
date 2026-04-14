import { getMissionData } from "@/lib/mission-data";
import { loadDailyMemories } from "@/lib/memory";
import { DocLibrary } from "@/components/doc-library";

export const revalidate = 300;

const PROJECTS = [
  {
    key: "xlinteractive",
    name: "XLInteractive",
    description: "Health + wellness flagship launch spanning product, brand, and go-to-market.",
    horizon: "Launch sprint",
    focus: ["Brand systems", "Program design", "Automation"],
  },
];

function projectFromLabels(labels: string | null): string | null {
  if (!labels) return null;
  try {
    const parsed = JSON.parse(labels);
    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        const s = String(entry);
        if (s.toLowerCase().includes("project:")) {
          return s.split(":").slice(1).join(":").trim().toLowerCase().replace(/\s+/g, "-");
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

function projectFromMetadata(metadata: string | null): string | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata);
    const project = parsed.project ?? parsed.Project;
    return project ? String(project).toLowerCase() : null;
  } catch {
    return null;
  }
}

export default async function ProjectsPage() {
  const [{ tasks, documents }, dailyMemories] = await Promise.all([
    getMissionData(),
    loadDailyMemories(8),
  ]);

  const docPayload = documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    kind: doc.kind,
    source: doc.source,
    summary: doc.summary,
    updatedAt: doc.updatedAt.toISOString(),
  }));

  const projectSummaries = PROJECTS.map((project) => {
    const taskMatches = tasks.filter((t) => projectFromLabels(t.labels) === project.key);
    const docMatches = documents.filter(
      (d) => projectFromMetadata(d.metadata ?? null) === project.key
    );
    const memoryMatches = dailyMemories.filter((m) =>
      m.content.toLowerCase().includes(project.name.toLowerCase())
    );

    return {
      ...project,
      tasks: taskMatches.slice(0, 6),
      docs: docMatches.slice(0, 4),
      memories: memoryMatches.slice(0, 3),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Projects</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Workstreams</h1>
        <p className="mt-1 text-sm text-white/50">
          Unified view linking tasks, docs, and memories per project.
        </p>
      </div>

      {projectSummaries.map((project) => (
        <div
          key={project.key}
          className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
                {project.horizon}
              </p>
              <h2 className="text-xl font-semibold text-white">{project.name}</h2>
              <p className="mt-0.5 text-sm text-white/45">{project.description}</p>
            </div>
            <div className="text-right text-[11px] text-white/35">
              <p>{project.tasks.length} tasks</p>
              <p>{project.docs.length} docs</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.focus.map((f) => (
              <span
                key={f}
                className="rounded-full border border-white/8 px-3 py-1 text-[11px] text-white/50"
              >
                {f}
              </span>
            ))}
          </div>

          {project.tasks.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                Linked Tasks
              </p>
              <div className="mt-2 space-y-2">
                {project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      <p className="text-[10px] uppercase text-white/30">{task.status}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/40">
                      {(task.owner ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.memories.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                Recent Mentions
              </p>
              <div className="mt-2 space-y-2">
                {project.memories.map((memory) => (
                  <div
                    key={memory.date}
                    className="rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2"
                  >
                    <p className="text-[10px] uppercase text-white/30">{memory.label}</p>
                    <p className="mt-1 text-xs text-white/50 line-clamp-3">{memory.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Doc Library */}
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Library</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Documents</h2>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <DocLibrary documents={docPayload} />
        </div>
      </div>
    </div>
  );
}
