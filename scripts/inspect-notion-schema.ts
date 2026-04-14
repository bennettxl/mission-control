import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function logSchema(databaseId: string, label: string) {
  if (!databaseId) {
    console.log(`Missing database id for ${label}`);
    return;
  }
  const schema = await notion.databases.retrieve({ database_id: databaseId });
  console.log(`\n=== ${label} (${databaseId}) ===`);
  console.dir(schema.properties, { depth: null });
}

async function main() {
  await logSchema(process.env.NOTION_TASKS_DB_ID!, "Tasks");
  await logSchema(process.env.NOTION_CALENDAR_DB_ID!, "Calendar");
  await logSchema(process.env.NOTION_DOCS_DB_ID!, "Docs");
}

main().catch((err) => {
  console.error("Failed to inspect Notion schema", err.response?.data ?? err.message);
  process.exit(1);
});
