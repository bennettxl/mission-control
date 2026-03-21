import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });

async function main() {
  const { syncExternalData } = await import("@/lib/integrations/sync");
  const summary = await syncExternalData();
  console.log(
    `Synced ${summary.notionTasks} Notion tasks, ${summary.notionEvents} Notion events, ${summary.notionDocuments} Notion docs, ${summary.driveDocuments} Drive docs.`,
  );
}

main().catch((error) => {
  console.error("Failed to sync integrations", error);
  process.exit(1);
});
