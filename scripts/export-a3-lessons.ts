import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });

const notionApiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_A3_DB_ID;
const NOTION_VERSION = process.env.NOTION_VERSION ?? "2022-06-28";

if (!notionApiKey) {
  throw new Error("NOTION_API_KEY is not configured");
}
if (!databaseId) {
  throw new Error("NOTION_A3_DB_ID is not configured");
}

type NotionProperty =
  | { type: "title"; title: Array<{ plain_text: string }> }
  | { type: "rich_text"; rich_text: Array<{ plain_text: string }> }
  | { type: "multi_select"; multi_select: Array<{ name: string }> }
  | { type: "select"; select: { name: string } | null }
  | { type: "date"; date: { start: string | null; end: string | null } | null }
  | { type: "url"; url: string | null }
  | { type: "status"; status: { name: string } | null }
  | { type: "people"; people: Array<{ id: string; name?: string | null; person?: { email?: string | null } }> }
  | { type: string; [key: string]: unknown };

type RichTextProperty = Extract<NotionProperty, { type: "rich_text" | "title" }>;

type NotionPage = {
  id: string;
  properties: Record<string, NotionProperty>;
};

type LessonRow = {
  id: string;
  lessonTitle: string;
  section: string | null;
  categories: string[];
  agencyRelevance: string | null;
  lessonUrl: string | null;
  resourceLinks: string | null;
  attachments: string | null;
  description: string | null;
  notes: string | null;
  keyTools: string | null;
  transcriptionStatus: string | null;
  date: string | null;
};

function extractPlainText(property?: RichTextProperty | null): string | null {
  if (!property) return null;
  if (property.type === "rich_text") {
    const text = property.rich_text.map((block) => block.plain_text).join("\n").trim();
    return text || null;
  }
  if (property.type === "title") {
    const text = property.title.map((block) => block.plain_text).join(" ").trim();
    return text || null;
  }
  return null;
}

function normalizeTitle(page: NotionPage): string {
  const titleProp = page.properties["Lesson Title"] as NotionProperty | undefined;
  const value = extractPlainText(titleProp && titleProp.type === "title" ? titleProp as RichTextProperty : null);
  return value ?? "Untitled Lesson";
}

function getSelectName(property?: NotionProperty): string | null {
  if (!property) return null;
  if (property.type === "select") {
    return property.select?.name ?? null;
  }
  if (property.type === "status") {
    return property.status?.name ?? null;
  }
  return null;
}

function getMultiSelectNames(property?: NotionProperty): string[] {
  if (property?.type === "multi_select") {
    return property.multi_select.map((option) => option.name);
  }
  return [];
}

function getDateValue(property?: NotionProperty): string | null {
  if (property?.type === "date") {
    return property.date?.end ?? property.date?.start ?? null;
  }
  return null;
}

function getUrl(property?: NotionProperty): string | null {
  if (property?.type === "url") {
    return property.url ?? null;
  }
  return null;
}

function getPeople(property?: NotionProperty): string | null {
  if (property?.type === "people" && property.people.length > 0) {
    return property.people
      .map((person) => person.name ?? person.person?.email ?? person.id)
      .filter(Boolean)
      .join(", ");
  }
  return null;
}

async function fetchAllLessons(): Promise<LessonRow[]> {
  const lessons: LessonRow[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const response = await fetch("https://api.notion.com/v1/databases/" + databaseId + "/query", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: JSON.stringify({ start_cursor: cursor, page_size: 100 }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Notion query failed (${response.status}): ${errorBody}`);
    }

    const data = (await response.json()) as { results: NotionPage[]; has_more: boolean; next_cursor?: string | null };
    for (const page of data.results) {
      const getProp = (name: string) => page.properties[name];
      lessons.push({
        id: page.id,
        lessonTitle: normalizeTitle(page),
        section: getSelectName(getProp("Section")),
        categories: getMultiSelectNames(getProp("Category")),
        agencyRelevance: getSelectName(getProp("Agency Relevance")),
        lessonUrl: getUrl(getProp("Lesson URL")),
        resourceLinks: getUrl(getProp("Resource Links")),
        attachments: extractPlainText(getProp("Attachments/Files") as RichTextProperty),
        description: extractPlainText(getProp("Description") as RichTextProperty),
        notes: extractPlainText(getProp("Notes") as RichTextProperty),
        keyTools: extractPlainText(getProp("Key Tools Mentioned") as RichTextProperty),
        transcriptionStatus: getSelectName(getProp("Transcription Status")),
        date: getDateValue(getProp("Date")),
      });
    }

    if (!data.has_more || !data.next_cursor) {
      break;
    }
    cursor = data.next_cursor;
  }

  return lessons;
}

function summarizeDuplicates(rows: LessonRow[]) {
  const byTitle = new Map<string, LessonRow[]>();
  const byUrl = new Map<string, LessonRow[]>();

  for (const row of rows) {
    const key = row.lessonTitle.trim().toLowerCase();
    if (!byTitle.has(key)) byTitle.set(key, []);
    byTitle.get(key)!.push(row);

    if (row.lessonUrl) {
      const urlKey = row.lessonUrl.trim().toLowerCase();
      if (!byUrl.has(urlKey)) byUrl.set(urlKey, []);
      byUrl.get(urlKey)!.push(row);
    }
  }

  const duplicateTitles = Array.from(byTitle.values()).filter((entries) => entries.length > 1);
  const duplicateUrls = Array.from(byUrl.values()).filter((entries) => entries.length > 1);

  return { duplicateTitles, duplicateUrls };
}

async function main() {
  const lessons = await fetchAllLessons();
  const timestamp = new Date().toISOString().split("T")[0];
  const outputDir = resolve(process.cwd(), "data");
  mkdirSync(outputDir, { recursive: true });
  const filePath = resolve(outputDir, `a3-lessons-${timestamp}.json`);
  writeFileSync(filePath, JSON.stringify({ exportedAt: new Date().toISOString(), count: lessons.length, lessons }, null, 2));

  const { duplicateTitles, duplicateUrls } = summarizeDuplicates(lessons);
  console.log(`Exported ${lessons.length} lessons to ${filePath}`);
  console.log(`Duplicate titles: ${duplicateTitles.length}, duplicate URLs: ${duplicateUrls.length}`);
  if (duplicateTitles.length) {
    console.log("Sample duplicate titles:");
    for (const group of duplicateTitles.slice(0, 5)) {
      console.log("-", group[0].lessonTitle, "=>", group.map((row) => row.id).join(", "));
    }
  }
  if (duplicateUrls.length) {
    console.log("Sample duplicate URLs:");
    for (const group of duplicateUrls.slice(0, 5)) {
      console.log("-", group[0].lessonUrl, "=>", group.map((row) => row.id).join(", "));
    }
  }
}

main().catch((error) => {
  console.error("Failed to export A3 lessons", error);
  process.exit(1);
});
