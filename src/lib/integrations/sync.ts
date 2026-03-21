import { prisma } from "@/lib/prisma";
import { fetchNotionTasks, fetchNotionEvents, fetchNotionDocuments } from "@/lib/integrations/notion";
import { fetchDriveDocuments } from "@/lib/integrations/google-drive";

export type SyncSummary = {
  notionTasks: number;
  notionEvents: number;
  notionDocuments: number;
  driveDocuments: number;
};

async function getSourceConnectionId(name: string, type: string, status: string) {
  const existing = await prisma.sourceConnection.findFirst({ where: { name } });
  if (existing) {
    await prisma.sourceConnection.update({
      where: { id: existing.id },
      data: { status, lastSync: new Date() },
    });
    return existing.id;
  }

  const created = await prisma.sourceConnection.create({
    data: {
      name,
      type,
      status,
      lastSync: new Date(),
    },
  });
  return created.id;
}

async function upsertTask(data: {
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  dueDate: string | null;
  owner: string | null;
  labels: string[];
  project: string | null;
  source: string;
  sourceId: string;
  sourceConnectionId: string;
}) {
  const existing = await prisma.task.findFirst({ where: { source: data.source, sourceId: data.sourceId } });
  const labelPayload = [...data.labels];
  if (data.project) {
    labelPayload.push(`project:${data.project}`);
  }
  const payload = {
    title: data.title,
    description: data.description ?? undefined,
    status: data.status ?? undefined,
    priority: data.priority ?? undefined,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    owner: data.owner ?? undefined,
    labels: labelPayload.length ? JSON.stringify(labelPayload) : undefined,
    source: data.source,
    sourceId: data.sourceId,
    sourceConnectionId: data.sourceConnectionId,
  };

  if (existing) {
    await prisma.task.update({ where: { id: existing.id }, data: payload });
  } else {
    await prisma.task.create({ data: payload });
  }
}

async function upsertEvent(data: {
  title: string;
  description: string | null;
  status: string | null;
  start: string | null;
  end: string | null;
  source: string;
  sourceId: string;
  sourceConnectionId: string;
}) {
  const existing = await prisma.calendarEvent.findFirst({ where: { source: data.source, sourceId: data.sourceId } });
  const payload = {
    title: data.title,
    description: data.description ?? undefined,
    status: data.status ?? undefined,
    start: data.start ? new Date(data.start) : new Date(),
    end: data.end ? new Date(data.end) : null,
    source: data.source,
    sourceId: data.sourceId,
    sourceConnectionId: data.sourceConnectionId,
  };

  if (existing) {
    await prisma.calendarEvent.update({ where: { id: existing.id }, data: payload });
  } else {
    await prisma.calendarEvent.create({ data: payload });
  }
}

async function upsertDocument(data: {
  title: string;
  description: string | null;
  summary: string | null;
  kind: string | null;
  source: string;
  sourceId: string;
  link: string | null;
  project: string | null;
  sourceConnectionId: string;
}) {
  const existing = await prisma.documentRecord.findFirst({ where: { source: data.source, sourceId: data.sourceId } });
  const metadata: Record<string, unknown> = {};
  if (data.project) metadata.project = data.project;
  const payload = {
    title: data.title,
    description: data.description ?? undefined,
    summary: data.summary ?? undefined,
    kind: data.kind ?? undefined,
    source: data.source,
    sourceId: data.sourceId,
    link: data.link ?? undefined,
    metadata: Object.keys(metadata).length ? JSON.stringify(metadata) : undefined,
    sourceConnectionId: data.sourceConnectionId,
  };

  if (existing) {
    await prisma.documentRecord.update({ where: { id: existing.id }, data: payload });
  } else {
    await prisma.documentRecord.create({ data: payload });
  }
}

export async function syncExternalData(): Promise<SyncSummary> {
  const [notionTasks, notionEvents, notionDocs, driveDocs] = await Promise.all([
    fetchNotionTasks(),
    fetchNotionEvents(),
    fetchNotionDocuments(),
    fetchDriveDocuments(),
  ]);

  if (notionTasks.length || notionEvents.length || notionDocs.length) {
    const notionConnectionId = await getSourceConnectionId("Notion", "NOTION", notionTasks.length ? "connected" : "ready");
    await Promise.all(
      notionTasks.map((task) =>
        upsertTask({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          owner: task.owner,
          labels: task.labels,
          project: task.project,
          source: "NOTION",
          sourceId: task.id,
          sourceConnectionId: notionConnectionId,
        }),
      ),
    );

    await Promise.all(
      notionEvents.map((event) =>
        upsertEvent({
          title: event.title,
          description: event.description,
          status: event.status,
          start: event.start,
          end: event.end,
          source: "NOTION",
          sourceId: event.id,
          sourceConnectionId: notionConnectionId,
        }),
      ),
    );

    await Promise.all(
      notionDocs.map((doc) =>
        upsertDocument({
          title: doc.title,
          description: null,
          summary: doc.summary,
          kind: doc.kind,
          source: "NOTION",
          sourceId: doc.id,
          link: doc.link,
          project: doc.project,
          sourceConnectionId: notionConnectionId,
        }),
      ),
    );
  }

  if (driveDocs.length) {
    const driveConnectionId = await getSourceConnectionId("Google Drive", "GOOGLE_DRIVE", "connected");
    await Promise.all(
      driveDocs.map((doc) =>
        upsertDocument({
          title: doc.title,
          description: doc.summary,
          summary: doc.summary,
          kind: doc.kind,
          source: "GOOGLE_DRIVE",
          sourceId: doc.id,
          link: doc.link,
          project: null,
          sourceConnectionId: driveConnectionId,
        }),
      ),
    );
  }

  return {
    notionTasks: notionTasks.length,
    notionEvents: notionEvents.length,
    notionDocuments: notionDocs.length,
    driveDocuments: driveDocs.length,
  };
}
