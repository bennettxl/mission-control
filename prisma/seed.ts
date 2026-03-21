import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.insight.deleteMany(),
    prisma.documentRecord.deleteMany(),
    prisma.calendarEvent.deleteMany(),
    prisma.task.deleteMany(),
    prisma.sourceConnection.deleteMany(),
  ]);

  const notion = await prisma.sourceConnection.create({
    data: {
      name: "Notion HQ",
      type: "NOTION",
      status: "connected",
      details: JSON.stringify({ database: "Mission Ops" }),
      lastSync: new Date(Date.now() - 1000 * 60 * 20),
    },
  });

  const drive = await prisma.sourceConnection.create({
    data: {
      name: "Google Drive",
      type: "GOOGLE_DRIVE",
      status: "connected",
      details: JSON.stringify({ sharedDrive: "XL Interactive" }),
      lastSync: new Date(Date.now() - 1000 * 60 * 5),
    },
  });

  const upload = await prisma.sourceConnection.create({
    data: {
      name: "Manual Uploads",
      type: "UPLOAD",
      status: "ready",
      details: JSON.stringify({ path: "./uploads" }),
    },
  });

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Storyboard voice AI launch video",
        description: "Outline beats, talent, and CTA for the XLInteractive teaser.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        owner: "Ayan",
        source: "NOTION",
        sourceConnectionId: notion.id,
        labels: JSON.stringify(["stream:content", "project:xlinteractive", "channel:video"]),
      },
    }),
    prisma.task.create({
      data: {
        title: "Sync SMS automation metrics",
        description: "Pull the latest responder metrics and prep the KPI snapshot.",
        status: "BACKLOG",
        priority: "MEDIUM",
        owner: "Automation Pod",
        source: "OPENCLAW",
        sourceConnectionId: notion.id,
        labels: JSON.stringify(["stream:ops", "cadence:weekly"]),
      },
    }),
    prisma.task.create({
      data: {
        title: "Prep enterprise deck variant",
        description: "Weave in media automation results + testimonial quotes.",
        status: "REVIEW",
        priority: "URGENT",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 12),
        owner: "XL Studio",
        source: "GOOGLE_DRIVE",
        sourceConnectionId: drive.id,
        labels: JSON.stringify(["stream:sales", "project:xlinteractive"]),
      },
    }),
    prisma.task.create({
      data: {
        title: "Draft XLInteractive onboarding flow",
        description: "Translate the welcome narrative into SMS + voice actions.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        owner: "Open Claw",
        source: "OPENCLAW",
        labels: JSON.stringify(["project:xlinteractive", "channel:sms", "owner:o"]),
      },
    }),
    prisma.task.create({
      data: {
        title: "Audit cron rituals",
        description: "Confirm every proactive check (weather, inbox, Discord) is queued.",
        status: "BACKLOG",
        priority: "LOW",
        owner: "Signal Monitor",
        source: "OPENCLAW",
        labels: JSON.stringify(["cadence:daily", "owner:s"]),
      },
    }),
    prisma.task.create({
      data: {
        title: "Publish concierge insight digest",
        description: "Summarize sentiment highlights for XLInteractive partners.",
        status: "COMPLETE",
        priority: "MEDIUM",
        owner: "Adept Forge",
        source: "OPENCLAW",
        labels: JSON.stringify(["project:xlinteractive", "channel:email"]),
      },
    }),
  ]);

  await prisma.insight.create({
    data: {
      kind: "RECOMMENDATION",
      content: "Calendar is dense Friday—consider auto-rescheduling low-priority syncs to protect deep work.",
      model: "openrouter/gpt-4o-mini",
      taskId: tasks[0].id,
    },
  });

  await prisma.calendarEvent.createMany({
    data: [
      {
        title: "Morning systems check",
        description: "Heartbeat loop verifying cron queue + reminders.",
        status: "CRON",
        start: new Date(Date.now() + 1000 * 60 * 30),
        end: new Date(Date.now() + 1000 * 60 * 90),
        source: "Signal Monitor",
        sourceConnectionId: notion.id,
      },
      {
        title: "XLInteractive autonomy sprint",
        description: "Batch Open Claw + Forge tasks for onboarding build.",
        status: "AUTONOMY",
        start: new Date(Date.now() + 1000 * 60 * 60 * 4),
        end: new Date(Date.now() + 1000 * 60 * 60 * 6),
        source: "OPENCLAW",
        sourceConnectionId: notion.id,
      },
      {
        title: "Voice AI beta onboarding",
        description: "Live session with cohort 3 brands.",
        status: "UPCOMING",
        start: new Date(Date.now() + 1000 * 60 * 60 * 10),
        end: new Date(Date.now() + 1000 * 60 * 60 * 12),
        source: "NOTION",
        sourceConnectionId: notion.id,
      },
      {
        title: "Content lab: February drops",
        description: "Outline content automation experiments.",
        status: "UPCOMING",
        start: new Date(Date.now() + 1000 * 60 * 60 * 26),
        end: new Date(Date.now() + 1000 * 60 * 60 * 28),
        source: "GOOGLE_DRIVE",
        sourceConnectionId: drive.id,
      },
    ],
  });

  await prisma.documentRecord.createMany({
    data: [
      {
        title: "Conversational touchpoint map",
        description: "Every SMS + Voice AI branch for onboarding.",
        content:
          "Section 1 outlines concierge greetings. Section 2 documents fallback SMS copy whenever calls overflow. Section 3 tags critical branches for personalization.",
        kind: "SPEC",
        source: "GOOGLE_DRIVE",
        sourceConnectionId: drive.id,
        link: "https://drive.google.com/file/d/voice-map",
        summary: "Maps all customer intents with recommended channel + automation fallback logic.",
        metadata: JSON.stringify({ project: "xlinteractive", stream: "automation" }),
      },
      {
        title: "XLInteractive wellness blueprint",
        description: "North star narrative for the health + wellness business.",
        content:
          "Vision: measurable wellness outcomes through persistent concierge AI. Pillars: content engine, community rituals, proactive nudges.",
        kind: "BRIEF",
        source: "NOTION",
        sourceConnectionId: notion.id,
        link: "https://www.notion.so/xlinteractive/xlinteractive-blueprint",
        summary: "Defines promise, target personas, and automation pillars for XLInteractive.",
        metadata: JSON.stringify({ project: "xlinteractive", artifacts: ["brand", "product"] }),
      },
      {
        title: "Sentiment pulse 02-25",
        description: "Weekly qualitative readout from concierge automations.",
        content:
          "Customers highlighted faster answers, concierge tone, and proactive SMS nudges. Two brands requested more seasonal CTAs.",
        kind: "REPORT",
        source: "OPENCLAW",
        sourceConnectionId: upload.id,
        filePath: "./uploads/sentiment-pulse.pdf",
        summary: "Voice + SMS feedback trending positive after concierge scripts deployed.",
        metadata: JSON.stringify({ project: "cx-insights" }),
      },
    ],
  });

  console.log("Seed complete ✔");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
