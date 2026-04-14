import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [tasks, events, documents] = await Promise.all([
    prisma.task.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.calendarEvent.findMany({ orderBy: { start: "asc" } }),
    prisma.documentRecord.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  const snapshot = {
    generatedAt: new Date().toISOString(),
    tasks,
    events,
    documents,
  };

  console.log(JSON.stringify(snapshot, null, 2));
}

main()
  .catch((err) => {
    console.error("Failed to produce mission snapshot", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
