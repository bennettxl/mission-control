import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });

import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = process.env.NOTION_VERSION ?? "2022-06-28";

async function notionFetch<T>(path: string, init: RequestInit): Promise<T> {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY missing");
  }
  const response = await fetch(`${NOTION_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notion request failed (${response.status}): ${text}`);
  }
  return (await response.json()) as T;
}

async function createPage(databaseId: string, properties: Record<string, unknown>) {
  await notionFetch<PageObjectResponse>("/pages", {
    method: "POST",
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });
}

const DEFAULT_TITLE_CANDIDATES = ["Name", "Title"];
const DESCRIPTION_CANDIDATES = ["Description", "Notes", "Summary"];
const STATUS_CANDIDATES = ["Status", "State"];
const PRIORITY_CANDIDATES = ["Priority", "Urgency"];
const TAGS_CANDIDATES = ["Tags", "Labels", "Workstream"];
const PROJECT_CANDIDATES = ["Project", "Initiative", "Program"];
const TYPE_CANDIDATES = ["Type", "Kind", "Doc Type"];
const URL_CANDIDATES = ["URL", "Link"];

type NotionQueryResponse = {
  results: Array<PageObjectResponse | { object: string }>;
};

function ensurePage(result: { object: string }): result is PageObjectResponse {
  return result.object === "page";
}

function findProperty(
  page: PageObjectResponse,
  { candidates = [], type }: { candidates?: string[]; type?: PageObjectResponse["properties"][string]["type"] },
): { name: string; type: string } | null {
  const entries = Object.entries(page.properties) as [string, PageObjectResponse["properties"][string]][];
  if (candidates.length) {
    const lowered = candidates.map((name) => name.toLowerCase());
    const match = entries.find(([name]) => lowered.includes(name.toLowerCase()));
    if (match) {
      return { name: match[0], type: match[1].type };
    }
  }
  if (type) {
    const match = entries.find(([, value]) => value.type === type);
    if (match) {
      return { name: match[0], type: match[1].type };
    }
  }
  return null;
}

async function detectSchema(databaseId: string, fallbackTitle = "Name") {
  const response = await notionFetch<NotionQueryResponse>(`/databases/${databaseId}/query`, {
    method: "POST",
    body: JSON.stringify({ page_size: 1 }),
  });
  const page = response.results.find(ensurePage);
  if (!page) {
    return {
      title: { name: fallbackTitle, type: "title" },
    };
  }
  return {
    title: findProperty(page, { type: "title", candidates: DEFAULT_TITLE_CANDIDATES }) ?? { name: fallbackTitle, type: "title" },
    description: findProperty(page, { candidates: DESCRIPTION_CANDIDATES, type: "rich_text" }),
    status: findProperty(page, { candidates: STATUS_CANDIDATES, type: "status" }),
    priority: findProperty(page, { candidates: PRIORITY_CANDIDATES, type: "select" }),
    tags: findProperty(page, { candidates: TAGS_CANDIDATES, type: "multi_select" }),
    project: findProperty(page, { candidates: PROJECT_CANDIDATES, type: "select" }),
    date: findProperty(page, { type: "date" }),
    type: findProperty(page, { candidates: TYPE_CANDIDATES, type: "select" }),
    url: findProperty(page, { candidates: URL_CANDIDATES, type: "url" }),
  };
}

function titleProperty(name: string, content: string) {
  return {
    [name]: {
      title: [{ text: { content } }],
    },
  };
}

function richTextProperty(name: string, content: string) {
  return {
    [name]: {
      rich_text: [{ text: { content } }],
    },
  };
}

function statusProperty(meta: { name: string; type: string }, value: string) {
  if (meta.type === "status") {
    return { [meta.name]: { status: { name: value } } };
  }
  return { [meta.name]: { select: { name: value } } };
}

function selectProperty(meta: { name: string }, value: string) {
  return { [meta.name]: { select: { name: value } } };
}

function multiSelectProperty(meta: { name: string }, values: string[]) {
  return { [meta.name]: { multi_select: values.map((value) => ({ name: value })) } };
}

function dateProperty(meta: { name: string }, start: string, end?: string) {
  return {
    [meta.name]: {
      date: {
        start,
        end,
      },
    },
  };
}

function urlProperty(meta: { name: string }, value: string) {
  return {
    [meta.name]: { url: value },
  };
}

async function createTaskSamples(databaseId: string) {
  const schema = await detectSchema(databaseId);
  for (let i = 1; i <= 12; i += 1) {
    const title = `Sample Task ${String(i).padStart(2, "0")}`;
    const props: Record<string, unknown> = {
      ...titleProperty(schema.title.name, title),
    };
    if (schema.description) {
      Object.assign(props, richTextProperty(schema.description.name, `Autogenerated task ${i} for Mission Control testing.`));
    }
    if (schema.status) {
      const statuses = ["Backlog", "In Flight", "Review", "Done"];
      Object.assign(props, statusProperty(schema.status, statuses[i % statuses.length]));
    }
    if (schema.priority) {
      const priorities = ["P0", "P1", "P2", "P3"];
      Object.assign(props, selectProperty(schema.priority, priorities[i % priorities.length]));
    }
    if (schema.tags) {
      Object.assign(props, multiSelectProperty(schema.tags, ["Sample", `Batch ${Math.ceil(i / 4)}`]));
    }
    if (schema.project) {
      Object.assign(props, selectProperty(schema.project, `Project ${((i - 1) % 3) + 1}`));
    }
    if (schema.date) {
      const start = new Date();
      start.setDate(start.getDate() + i);
      Object.assign(props, dateProperty(schema.date, start.toISOString()));
    }
    await createPage(databaseId, props);
  }
  console.log(`Inserted 12 tasks into ${databaseId}`);
}

async function createEventSamples(databaseId: string) {
  const schema = await detectSchema(databaseId);
  for (let i = 1; i <= 12; i += 1) {
    const title = `Sample Event ${String(i).padStart(2, "0")}`;
    const props: Record<string, unknown> = {
      ...titleProperty(schema.title.name, title),
    };
    if (schema.description) {
      Object.assign(props, richTextProperty(schema.description.name, `Test calendar entry ${i}.`));
    }
    if (schema.status) {
      const statuses = ["Scheduled", "In Progress", "Complete"];
      Object.assign(props, statusProperty(schema.status, statuses[i % statuses.length]));
    }
    if (schema.date) {
      const start = new Date();
      start.setDate(start.getDate() + i);
      start.setHours(9 + (i % 6), 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);
      Object.assign(props, dateProperty(schema.date, start.toISOString(), end.toISOString()));
    }
    await createPage(databaseId, props);
  }
  console.log(`Inserted 12 events into ${databaseId}`);
}

async function createDocumentSamples(databaseId: string) {
  const schema = await detectSchema(databaseId);
  for (let i = 1; i <= 12; i += 1) {
    const title = `Sample Brief ${String(i).padStart(2, "0")}`;
    const props: Record<string, unknown> = {
      ...titleProperty(schema.title.name, title),
    };
    if (schema.description) {
      Object.assign(props, richTextProperty(schema.description.name, `Auto-generated doc summary ${i}.`));
    }
    if (schema.type) {
      const kinds = ["Brief", "Deck", "Spec"];
      Object.assign(props, selectProperty(schema.type, kinds[i % kinds.length]));
    }
    if (schema.tags) {
      Object.assign(props, multiSelectProperty(schema.tags, ["Sample", `Docs Batch ${Math.ceil(i / 4)}`]));
    }
    if (schema.project) {
      Object.assign(props, selectProperty(schema.project, `Program ${((i - 1) % 4) + 1}`));
    }
    if (schema.url) {
      Object.assign(props, urlProperty(schema.url, `https://xlinteractive.com/sample-doc-${i}`));
    }
    await createPage(databaseId, props);
  }
  console.log(`Inserted 12 docs into ${databaseId}`);
}

async function main() {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY missing");
  }
  await createTaskSamples(process.env.NOTION_TASKS_DB_ID!);
  await createEventSamples(process.env.NOTION_CALENDAR_DB_ID!);
  await createDocumentSamples(process.env.NOTION_DOCS_DB_ID!);
}

main().catch((error) => {
  console.error("Failed to seed Notion samples", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
