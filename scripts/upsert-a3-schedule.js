const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const schedule = [
  {
    title: "A3 KB Stage 1 – Notion audit & dedupe",
    description:
      "Export existing rows, purge hallucinations/duplicates, and add Section/Category/Relevance/URL fields so the database is ready for imports.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: new Date("2026-03-23T21:30:00.000Z"),
  },
  {
    title: "A3 KB Stage 2 – Metadata backfill",
    description:
      "Normalize all 97 lessons from the JSON feed, patch existing entries, and insert any missing lessons.",
    status: "BACKLOG",
    priority: "HIGH",
    dueDate: new Date("2026-03-24T00:30:00.000Z"),
  },
  {
    title: "A3 KB Stage 3 – Attachments & lesson URLs",
    description:
      "Validate lesson URLs on theaiclub, capture attachment links, and flag any missing assets for scrape.",
    status: "BACKLOG",
    priority: "MEDIUM",
    dueDate: new Date("2026-03-24T02:00:00.000Z"),
  },
  {
    title: "A3 KB Stage 4 – Video downloads to Extreme SSD",
    description:
      "Pull all 75 DRM-protected HLS streams, name them YYYYMMDD – <Title>, and store under /Volumes/Extreme SSD/A3 Genius Classes - Knowledge Base.",
    status: "BACKLOG",
    priority: "HIGH",
    dueDate: new Date("2026-03-24T07:00:00.000Z"),
  },
  {
    title: "A3 KB Stage 5 – Transcripts",
    description:
      "Run Whisper large-v3 on every MP4, attach transcript links/status in Notion, and verify formatting.",
    status: "BACKLOG",
    priority: "MEDIUM",
    dueDate: new Date("2026-03-24T18:00:00.000Z"),
  },
  {
    title: "A3 KB Stage 6 – QA & final report",
    description:
      "Spot-check metadata vs. source, verify SSD files, and send the completion summary with token usage.",
    status: "BACKLOG",
    priority: "MEDIUM",
    dueDate: new Date("2026-03-24T21:00:00.000Z"),
  },
];

async function upsertSchedule() {
  for (const stage of schedule) {
    const existing = await prisma.task.findFirst({ where: { title: stage.title } });

    if (existing) {
      await prisma.task.update({
        where: { id: existing.id },
        data: {
          description: stage.description,
          status: stage.status,
          priority: stage.priority,
          dueDate: stage.dueDate,
          owner: "XLAgent_00",
          source: "MANUAL",
          labels: "a3-genius-classes",
        },
      });
    } else {
      await prisma.task.create({
        data: {
          title: stage.title,
          description: stage.description,
          status: stage.status,
          priority: stage.priority,
          dueDate: stage.dueDate,
          owner: "XLAgent_00",
          source: "MANUAL",
          labels: "a3-genius-classes",
        },
      });
    }
  }
}

upsertSchedule()
  .then(() => {
    console.log("A3 Genius Classes schedule posted to Mission Control.");
  })
  .catch((err) => {
    console.error("Failed to upsert A3 schedule", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
