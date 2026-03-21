import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const notionApiKey = process.env.NOTION_API_KEY;
const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = process.env.NOTION_VERSION ?? "2022-06-28";

export type NotionTaskRecord = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  dueDate: string | null;
  owner: string | null;
  labels: string[];
  project: string | null;
};

export type NotionEventRecord = {
  id: string;
  title: string;
  status: string | null;
  start: string | null;
  end: string | null;
  description: string | null;
};

export type NotionDocumentRecord = {
  id: string;
  title: string;
  summary: string | null;
  kind: string | null;
  link: string | null;
  project: string | null;
};

const titleCandidates = ["Name", "Title"];
const statusCandidates = ["Status"];
const priorityCandidates = ["Priority", "Urgency"];
const dueCandidates = ["Due", "Deadline", "Date"];
const ownerCandidates = ["Owner", "Assignee", "Lead"];
const labelCandidates = ["Labels", "Tags", "Workstream"];
const projectCandidates = ["Project", "Initiative"];
const descriptionCandidates = ["Description", "Notes"];
const docTypeCandidates = ["Type", "Kind", "Doc Type"];

type QueryDatabaseResponse = {
  results: Array<PageObjectResponse | { object: string }>;
};
type NotionResult = QueryDatabaseResponse["results"][number];
type PagePropertyValue = PageObjectResponse["properties"][string];

function ensurePage(result: NotionResult): result is PageObjectResponse {
  return (result as PageObjectResponse).object === "page";
}

async function queryDatabase(databaseId: string, payload: Record<string, unknown>): Promise<QueryDatabaseResponse> {
  if (!notionApiKey) {
    throw new Error("NOTION_API_KEY is not configured");
  }

  const response = await fetch(`${NOTION_API_BASE}/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${notionApiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Notion query failed (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as QueryDatabaseResponse;
}

function findPropertyByName(page: PageObjectResponse, candidates: string[]): PagePropertyValue | undefined {
  const lowered = candidates.map((name) => name.toLowerCase());
  const entries = Object.entries(page.properties) as [string, PagePropertyValue][];
  return entries.find(([name]) => lowered.includes(name.toLowerCase()))?.[1];
}

function findPropertyByType(page: PageObjectResponse, type: PagePropertyValue["type"]): PagePropertyValue | undefined {
  const entries = Object.values(page.properties) as PagePropertyValue[];
  return entries.find((property) => property.type === type);
}

function extractTitle(page: PageObjectResponse): string {
  const property = (findPropertyByName(page, titleCandidates) ?? findPropertyByType(page, "title")) as PagePropertyValue | undefined;
  if (property && property.type === "title") {
    return property.title.map((block) => block.plain_text).join(" ").trim() || "Untitled";
  }
  return "Untitled";
}

function extractRichText(page: PageObjectResponse, candidates: string[]): string | null {
  const property = findPropertyByName(page, candidates);
  if (!property) return null;
  if (property.type === "rich_text") {
    return property.rich_text.map((block) => block.plain_text).join("\n").trim() || null;
  }
  if (property.type === "title") {
    return property.title.map((block) => block.plain_text).join("\n").trim() || null;
  }
  return null;
}

function extractStatus(page: PageObjectResponse): string | null {
  const property = (findPropertyByName(page, statusCandidates) ?? findPropertyByType(page, "status")) as PagePropertyValue | undefined;
  if (property?.type === "status") {
    return property.status?.name ?? null;
  }
  if (property?.type === "select") {
    return property.select?.name ?? null;
  }
  return null;
}

function extractPriority(page: PageObjectResponse): string | null {
  const property = findPropertyByName(page, priorityCandidates);
  if (property?.type === "select") {
    return property.select?.name ?? null;
  }
  if (property?.type === "status") {
    return property.status?.name ?? null;
  }
  return null;
}

function extractDateRange(page: PageObjectResponse): { start: string | null; end: string | null } {
  const property = (findPropertyByName(page, dueCandidates) ?? findPropertyByType(page, "date")) as PagePropertyValue | undefined;
  if (property?.type === "date") {
    return { start: property.date?.start ?? null, end: property.date?.end ?? null };
  }
  return { start: null, end: null };
}

function extractOwner(page: PageObjectResponse): string | null {
  const property = findPropertyByName(page, ownerCandidates);
  if (!property) return null;
  if (property.type === "people" && property.people.length > 0) {
    return property.people
      .map((person) => {
        if ("name" in person && person.name) return person.name;
        if ("person" in person && person.person && "email" in person.person && person.person.email) {
          return person.person.email;
        }
        return person.id;
      })
      .join(", ");
  }
  if (property.type === "rich_text") {
    return property.rich_text.map((block) => block.plain_text).join(" ").trim() || null;
  }
  if (property.type === "title") {
    return property.title.map((block) => block.plain_text).join(" ").trim() || null;
  }
  if (property.type === "select") {
    return property.select?.name ?? null;
  }
  return null;
}

function extractLabels(page: PageObjectResponse): string[] {
  const property = (findPropertyByName(page, labelCandidates) ?? findPropertyByType(page, "multi_select")) as PagePropertyValue | undefined;
  if (property?.type === "multi_select") {
    return property.multi_select.map((option) => option.name);
  }
  return [];
}

function extractProject(page: PageObjectResponse): string | null {
  const property = findPropertyByName(page, projectCandidates);
  if (property?.type === "select") {
    return property.select?.name ?? null;
  }
  if (property?.type === "rich_text") {
    const value = property.rich_text.map((block) => block.plain_text).join(" ").trim();
    return value || null;
  }
  if (property?.type === "multi_select") {
    return property.multi_select[0]?.name ?? null;
  }
  return null;
}

function extractDocType(page: PageObjectResponse): string | null {
  const property = findPropertyByName(page, docTypeCandidates);
  if (property?.type === "select") {
    return property.select?.name ?? null;
  }
  return null;
}

function normalizeProject(value: string | null): string | null {
  if (!value) return null;
  return value.trim();
}

export async function fetchNotionTasks(limit = 25): Promise<NotionTaskRecord[]> {
  if (!notionApiKey || !process.env.NOTION_TASKS_DB_ID) {
    return [];
  }

  const response = await queryDatabase(process.env.NOTION_TASKS_DB_ID, {
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    page_size: limit,
  });

  return response.results
    .filter((page): page is PageObjectResponse => ensurePage(page))
    .map((page) => {
      const { start, end } = extractDateRange(page);
      return {
        id: page.id,
        title: extractTitle(page),
        description: extractRichText(page, descriptionCandidates),
        status: extractStatus(page),
        priority: extractPriority(page),
        dueDate: end ?? start,
        owner: extractOwner(page),
        labels: extractLabels(page),
        project: normalizeProject(extractProject(page)),
      } satisfies NotionTaskRecord;
    });
}

export async function fetchNotionEvents(limit = 20): Promise<NotionEventRecord[]> {
  if (!notionApiKey || !process.env.NOTION_CALENDAR_DB_ID) {
    return [];
  }

  const response = await queryDatabase(process.env.NOTION_CALENDAR_DB_ID, {
    sorts: [{ timestamp: "last_edited_time", direction: "ascending" }],
    page_size: limit,
  });

  return response.results
    .filter((page): page is PageObjectResponse => ensurePage(page))
    .map((page) => {
      const { start, end } = extractDateRange(page);
      return {
        id: page.id,
        title: extractTitle(page),
        status: extractStatus(page),
        start,
        end,
        description: extractRichText(page, descriptionCandidates),
      } satisfies NotionEventRecord;
    });
}

export async function fetchNotionDocuments(limit = 20): Promise<NotionDocumentRecord[]> {
  if (!notionApiKey || !process.env.NOTION_DOCS_DB_ID) {
    return [];
  }

  const response = await queryDatabase(process.env.NOTION_DOCS_DB_ID, {
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    page_size: limit,
  });

  return response.results
    .filter((page): page is PageObjectResponse => ensurePage(page))
    .map((page) => ({
      id: page.id,
      title: extractTitle(page),
      summary: extractRichText(page, descriptionCandidates),
      kind: extractDocType(page),
      link: page.url,
      project: normalizeProject(extractProject(page)),
    } satisfies NotionDocumentRecord));
}
