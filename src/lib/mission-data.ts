import { prisma } from "@/lib/prisma";
import { buildFallbackData, type MissionDataSnapshot } from "@/data/fallback";
import { isMissingTableError } from "@/lib/prisma-errors";

export async function getMissionData(): Promise<MissionDataSnapshot> {
  try {
    const [tasks, events, documents] = await Promise.all([
      prisma.task.findMany({ include: { insights: true }, orderBy: { updatedAt: "desc" } }),
      prisma.calendarEvent.findMany({ orderBy: { start: "asc" } }),
      prisma.documentRecord.findMany({ orderBy: { updatedAt: "desc" } }),
    ]);

    if (!tasks.length && !events.length && !documents.length) {
      console.warn("Prisma returned no data, using fallback snapshot");
      return buildFallbackData();
    }

    return { tasks, events, documents };
  } catch (error) {
    if (isMissingTableError(error)) {
      console.warn("Prisma tables missing, using fallback snapshot", error);
      return buildFallbackData();
    }
    throw error;
  }
}

export type { MissionDataSnapshot };
