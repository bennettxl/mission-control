import Image from "next/image";
import { INTEGRATIONS } from "@/lib/integrations";
import { getMissionData, type MissionDataSnapshot } from "@/lib/mission-data";
import { loadDailyMemories, loadLongTermDirectives } from "@/lib/memory";
import { loadWeather } from "@/lib/weather";
import { TaskIntentForm } from "@/components/task-intent-form";
import { DocLibrary } from "@/components/doc-library";
import { clsx } from "clsx";

export const revalidate = 300;
import {
  ActivitySquare,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  LucideIcon,
} from "lucide-react";

const missionStatement =
  "To build a powerful, autonomous AI organization that produces continuous value, ultimately driving the successful performance and scale of XLInteractive.";

const TASK_COLUMNS = [
  { key: "BACKLOG", title: "Backlog", accent: "from-white/5 via-transparent to-transparent" },
  { key: "IN_PROGRESS", title: "In Progress", accent: "from-[#8f9bff]/30 via-transparent to-transparent" },
  { key: "REVIEW", title: "In Review", accent: "from-[#b388ff]/40 via-transparent to-transparent" },
  { key: "COMPLETE", title: "Done", accent: "from-emerald-400/30 via-transparent to-transparent" },
];

const PROJECTS = [
  {
    key: "xlinteractive",
    name: "XLInteractive",
    description: "Health + wellness flagship launch spanning product, brand, and go-to-market.",
    horizon: "Launch sprint",
    focus: ["Brand systems", "Program design", "Automation"],
  },
];

const TEAM = [
  {
    key: "open-claw",
    code: "O",
    name: "Open Claw",
    role: "Chief-of-staff AI",
    environment: "Mac mini (local)",
  },
  {
    key: "ayan",
    code: "A",
    name: "Ayan",
    role: "Design + Research",
    environment: "MacBook Studio",
  },
  {
    key: "forge",
    code: "F",
    name: "Adept Forge",
    role: "Engineering sub-agent",
    environment: "Node sandbox",
  },
  {
    key: "signal",
    code: "S",
    name: "Signal Monitor",
    role: "Cron + rituals",
    environment: "Cloud worker",
  },
];

type LabelToken = {
  key: string | null;
  value: string;
  raw: string;
};

type ActivityEntry = {
  id: string;
  title: string;
  detail: string;
  owner: string;
  status: string;
  timestamp: Date;
  icon: LucideIcon;
};

type ProjectSummary = (typeof PROJECTS)[number] & {
  tasks: {
    id: string;
    title: string;
    status: string;
    owner: string;
  }[];
  docs: {
    id: string;
    title: string;
    kind: string;
  }[];
  memories: {
    date: string;
    label: string;
    content: string;
  }[];
};

function splitToken(text: string): LabelToken {
  if (text.includes(":")) {
    const [key, ...rest] = text.split(":");
    return { key: key.trim().toLowerCase(), value: rest.join(":").trim(), raw: text };
  }
  return { key: null, value: text.trim(), raw: text };
}

function parseLabels(labels: string | null): LabelToken[] {
  if (!labels) return [];
  try {
    const parsed = JSON.parse(labels);
    if (Array.isArray(parsed)) {
      return parsed.flatMap((entry) => splitToken(String(entry)));
    }
    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed).map(([key, value]) => ({
        key: key.toLowerCase(),
        value: String(value),
        raw: `${key}:${value}`,
      }));
    }
    return [splitToken(String(parsed))];
  } catch (error) {
    console.warn("Failed to parse labels", error);
    return [];
  }
}

function projectFromLabels(labels: string | null): string | null {
  const tokens = parseLabels(labels);
  const projectToken = tokens.find((token) => token.key === "project" || token.value.toLowerCase() === "live 2xl");
  return projectToken ? projectToken.value.toLowerCase().replace(/\s+/g, "-") : null;
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

function relativeTime(date: Date | null): string {
  if (!date) return "never";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(Math.abs(diff) / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function buildActivityFeed(tasks: MissionDataSnapshot["tasks"], events: MissionDataSnapshot["events"]): ActivityEntry[] {
  const taskEntries: ActivityEntry[] = tasks.slice(0, 6).map((task) => ({
    id: task.id,
    title: task.title,
    detail: task.description ?? "",
    owner: task.owner ?? task.source ?? "Ops",
    status: task.status,
    timestamp: task.updatedAt,
    icon: ActivitySquare,
  }));

  const eventEntries: ActivityEntry[] = events.slice(0, 4).map((event) => ({
    id: event.id,
    title: event.title,
    detail: event.status,
    owner: event.source,
    status: "AUTONOMY",
    timestamp: event.start,
    icon: CalendarClock,
  }));

  return [...taskEntries, ...eventEntries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);
}

function buildProjectSummaries(
  tasks: MissionDataSnapshot["tasks"],
  documents: MissionDataSnapshot["documents"],
  memories: Awaited<ReturnType<typeof loadDailyMemories>>,
): ProjectSummary[] {
  return PROJECTS.map((project) => {
    const taskMatches = tasks.filter((task) => projectFromLabels(task.labels) === project.key);
    const docMatches = documents.filter((doc) => projectFromMetadata(doc.metadata ?? null) === project.key);
    const memoryMatches = memories.filter((entry) => entry.content.toLowerCase().includes(project.name.toLowerCase()));

    return {
      ...project,
      tasks: taskMatches.slice(0, 4).map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        owner: task.owner ?? "Unassigned",
      })),
      docs: docMatches.slice(0, 3).map((doc) => ({
        id: doc.id,
        title: doc.title,
        kind: doc.kind,
      })),
      memories: memoryMatches.slice(0, 2),
    };
  });
}

function teamStatusFromTasks(tasks: MissionDataSnapshot["tasks"]) {
  const assignments = new Map<string, string>();
  tasks.forEach((task) => {
    const ownerKey = (task.owner ?? task.source ?? "").toLowerCase();
    if (!ownerKey) return;
    if (task.status !== "COMPLETE") {
      assignments.set(ownerKey, task.title);
    }
  });
  return TEAM.map((member) => ({
    ...member,
    activeTask: assignments.get(member.name.toLowerCase()) ?? assignments.get(member.code.toLowerCase()) ?? null,
  }));
}

function connectorsStatus(openRouterConnected: boolean) {
  return INTEGRATIONS.map((integration) => {
    const envVar = integration.envVar as keyof NodeJS.ProcessEnv;
    const configured = Boolean(process.env[envVar]);
    if (integration.envVar === "OPENROUTER_API_KEY") {
      return { ...integration, status: openRouterConnected ? "connected" : configured ? "connected" : "configure" };
    }
    return { ...integration, status: configured ? "connected" : "configure" };
  });
}

export default async function Home() {
  const [{ tasks, events, documents }, dailyMemories, directives, weather] = await Promise.all([
    getMissionData(),
    loadDailyMemories(8),
    loadLongTermDirectives(),
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

  const activeTasks = tasks.filter((task) => task.status !== "COMPLETE").length;
  const cronCount = events.filter((event) => event.status === "CRON" || event.status === "AUTONOMY" || event.status === "IN_PROGRESS").length;
  const documentCount = documents.length;
  const activityFeed = buildActivityFeed(tasks, events);
  const projectSummaries = buildProjectSummaries(tasks, documents, dailyMemories);
  const teamRoster = teamStatusFromTasks(tasks);
  const connectorStates = connectorsStatus(Boolean(process.env.OPENROUTER_API_KEY));
  const timelineEvents = events.slice(0, 8);

  const docPayload = documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    kind: doc.kind,
    source: doc.source,
    summary: doc.summary,
    updatedAt: doc.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-10">
      <section id="overview" className="masked-panel space-y-8 p-6 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Image
                src="/branding/xl-logo.jpg"
                alt="XLInteractive mark"
                width={72}
                height={72}
                priority
                className="h-16 w-16 rounded-2xl border border-white/20 object-cover shadow-lg"
              />
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">XLInteractive</p>
                <h1 className="text-3xl font-semibold text-white lg:text-4xl">Mission Control</h1>
                <p className="text-sm text-white/70">{missionStatement}</p>
              </div>
            </div>
            <p className="text-sm text-white/60">
              Linear-inspired surface for tracking workstreams, cron rituals, XLInteractive assets, and every memory or document
              generated by Open Claw + sub-agents.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2 lg:grid-cols-4">
            {[{ label: "Active tasks", value: activeTasks, icon: ActivitySquare }, { label: "Scheduled runs", value: cronCount, icon: CalendarDays }, { label: "Docs indexed", value: documentCount, icon: CheckCircle2 }].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
                  <item.icon size={14} />
                  {item.label}
                </div>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/0 to-white/10 px-4 py-3 text-white">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                <span>Bay Area now</span>
                <span>{pacificTime}</span>
              </div>
              <p className="mt-2 text-sm text-white/70">{pacificDate}</p>
              {weather ? (
                <div className="mt-3">
                  <p className="text-2xl font-semibold">{weather.temperatureF}°F</p>
                  <p className="text-xs text-white/60">{weather.description} · {weather.windSpeed} mph wind</p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-white/60">Weather feed unavailable.</p>
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {connectorStates.map((connector) => (
            <div key={connector.key} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{connector.name}</p>
                <span
                  className={clsx(
                    "text-[10px] uppercase tracking-wide",
                    connector.status === "connected" ? "text-emerald-300" : "text-amber-200",
                  )}
                >
                  {connector.status}
                </span>
              </div>
              <p className="text-xs text-white/50">{connector.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="task-board" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Module 1</p>
            <h2 className="text-2xl font-semibold text-white">Task Board</h2>
            <p className="text-sm text-white/60">Kanban pipeline + live activity feed. Any card assigned to “O” auto-executes every heartbeat.</p>
          </div>
          <div className="hidden rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/50 lg:block">
            Live ops
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[320px,minmax(0,1fr)]">
          <div className="masked-panel space-y-4 p-5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
              <span>Live activity</span>
              <span>Now</span>
            </div>
            <div className="space-y-3">
              {activityFeed.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-white/45">
                    <div className="flex items-center gap-2 text-white/60">
                      <entry.icon size={12} />
                      {entry.owner}
                    </div>
                    <span>{relativeTime(entry.timestamp)}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{entry.title}</p>
                  <p className="text-xs text-white/60">{entry.detail || entry.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="masked-panel space-y-5 p-5">
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-white/70">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/45">
                <span>Natural language intake</span>
                <span>Open Router</span>
              </div>
              <p className="mt-2 text-xs text-white/60">
                Drop instructions → I draft the task, assign it to myself if needed, and move it into Live Ops.
              </p>
              <div className="mt-3">
                <TaskIntentForm />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-4">
              {TASK_COLUMNS.map((column) => (
                <div key={column.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{column.title}</p>
                    <span className="text-xs text-white/50">{tasks.filter((task) => task.status === column.key).length}</span>
                  </div>
                  <div className={clsx("mt-2 h-1 w-full rounded-full", `bg-gradient-to-r ${column.accent}`)} />
                  <div className="mt-4 space-y-3">
                    {tasks
                      .filter((task) => task.status === column.key)
                      .map((task) => (
                        <article key={task.id} className="rounded-xl border border-white/10 bg-slate-900/40 p-3 text-sm text-white">
                          <div className="flex items-center justify-between text-xs text-white/60">
                            <p className="font-medium">{task.title}</p>
                            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
                              {(task.owner ?? task.source ?? "?").slice(0, 1).toUpperCase()}
                            </span>
                          </div>
                          {task.description && (
                            <p className="mt-1 text-xs text-white/50 line-clamp-2">{task.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {parseLabels(task.labels).map((label) => (
                              <span key={label.raw} className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
                                {label.value}
                              </span>
                            ))}
                          </div>
                        </article>
                      ))}
                    {tasks.filter((task) => task.status === column.key).length === 0 && (
                      <p className="text-xs text-white/50">No cards here.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="calendar" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Module 2</p>
            <h2 className="text-2xl font-semibold text-white">Cron & Proactive Calendar</h2>
            <p className="text-sm text-white/60">Visual confirmation that recurring automations + proactive rituals are queued and running.</p>
          </div>
        </div>
        <div className="masked-panel p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {events.slice(0, 6).map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/45">
                  <span>{event.status}</span>
                  <span>{event.source}</span>
                </div>
                <p className="mt-2 text-base font-semibold text-white">{event.title}</p>
                {event.description && <p className="text-xs text-white/60">{event.description}</p>}
                <p className="mt-2 text-xs text-white/50">
                  {event.start.toLocaleString("en", { weekday: "short", hour: "numeric", minute: "2-digit" })} →{" "}
                  {event.end ? event.end.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }) : "TBD"}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/45">
              <span>Upcoming timeline</span>
              <span>Local time</span>
            </div>
            <div className="divide-y divide-white/10">
              {timelineEvents.length === 0 && <p className="px-4 py-3 text-xs text-white/60">No calendar entries yet.</p>}
              {timelineEvents.map((event) => (
                <div key={`timeline-${event.id}`} className="flex flex-col gap-1 px-4 py-3 text-sm text-white/80 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="text-xs text-white/50">{event.source} · {event.status}</p>
                  </div>
                  <div className="text-xs text-white/60 md:text-right">
                    <p>{event.start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                    <p>
                      {event.start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      {event.end ? ` → ${event.end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Module 3</p>
          <h2 className="text-2xl font-semibold text-white">Projects</h2>
          <p className="text-sm text-white/60">Unified view of XLInteractive linking tasks, memories, and docs.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {projectSummaries.map((project) => (
            <div key={project.key} className="masked-panel space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/40">{project.horizon}</p>
                  <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                  <p className="text-sm text-white/60">{project.description}</p>
                </div>
                <div className="text-right text-xs text-white/55">
                  <p>{project.tasks.length} linked tasks</p>
                  <p>{project.docs.length} linked docs</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Focus</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.focus.map((focus) => (
                    <span key={focus} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/70">
                      {focus}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Tasks</p>
                <div className="mt-2 space-y-2">
                  {project.tasks.length === 0 && <p className="text-xs text-white/60">No tagged tasks yet.</p>}
                  {project.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
                      <div>
                        <p className="font-semibold text-white">{task.title}</p>
                        <p className="text-xs text-white/50">{task.status}</p>
                      </div>
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
                        {task.owner.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">Docs</p>
                  <ul className="mt-2 space-y-2 text-sm text-white/75">
                    {project.docs.length === 0 && <li className="text-xs text-white/60">No docs linked yet.</li>}
                    {project.docs.map((doc) => (
                      <li key={doc.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <p className="font-medium text-white">{doc.title}</p>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">{doc.kind}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">Recent memories</p>
                  <div className="mt-2 space-y-2 text-xs text-white/65">
                    {project.memories.length === 0 && <p className="text-white/55">No recent mentions.</p>}
                    {project.memories.map((memory) => (
                      <div key={memory.date} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">{memory.label}</p>
                        <p className="mt-1 text-xs text-white/70 line-clamp-3">{memory.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="memories" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Module 4</p>
          <h2 className="text-2xl font-semibold text-white">Memories</h2>
          <p className="text-sm text-white/60">Chronological journal pulled straight from the markdown vault plus long-term directives.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="masked-panel space-y-3 p-5">
            {dailyMemories.map((memory) => (
              <article key={memory.date} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">{memory.label}</p>
                <p className="mt-2 whitespace-pre-line text-white/70">{memory.content}</p>
              </article>
            ))}
            {dailyMemories.length === 0 && <p className="text-sm text-white/60">No memory files available yet.</p>}
          </div>
          <div className="masked-panel space-y-3 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">Long-term directives</p>
            <ul className="space-y-2 text-sm text-white/75">
              {directives.length === 0 && <li className="text-white/55">No directives logged.</li>}
              {directives.map((directive, index) => (
                <li key={directive + index} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                  {directive}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="docs" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Module 5</p>
          <h2 className="text-2xl font-semibold text-white">Docs Library</h2>
          <p className="text-sm text-white/60">Searchable repository for every spec, plan, and summary.</p>
        </div>
        <div className="masked-panel p-5">
          <DocLibrary documents={docPayload} />
        </div>
      </section>

      <section id="team" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Module 6</p>
          <h2 className="text-2xl font-semibold text-white">Team & Mission</h2>
          <p className="text-sm text-white/60">Org structure of Open Claw + sub-agents.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="masked-panel space-y-3 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">Mission statement</p>
            <p className="text-lg text-white/85">{missionStatement}</p>
          </div>
          <div className="masked-panel p-5">
            <div className="grid gap-3">
              {teamRoster.map((member) => (
                <div key={member.key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{member.name}</p>
                    <p className="text-xs text-white/60">{member.role}</p>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">{member.environment}</p>
                  </div>
                  <div className="text-right text-xs text-white/60">
                    <p className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-wide text-white/70">{member.code}</p>
                    <p className="mt-2 text-white/50">{member.activeTask ? `→ ${member.activeTask}` : "Idle"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="office" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Module 7</p>
          <h2 className="text-2xl font-semibold text-white">The Office</h2>
          <p className="text-sm text-white/60">2D pixel-art view of who’s at their desk vs collaborating.</p>
        </div>
        <div className="pixel-room p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {teamRoster.map((member, index) => (
              <div
                key={`pixel-${member.key}`}
                className={clsx(
                  "pixel-agent",
                  index % 3 === 0 ? "translate-y-2" : "",
                  member.activeTask ? "border-[#8f9bff]/40" : "border-white/10",
                )}
              >
                <strong>{member.code}</strong>
                <span>{member.activeTask ? "Working" : index % 2 === 0 ? "Collaborating" : "Strategizing"}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-white/45">
            Agents congregate at the cooler when collaborating.
          </p>
        </div>
      </section>
    </div>
  );
}
