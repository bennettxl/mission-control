export type IntegrationConfig = {
  key: string;
  name: string;
  envVar: string;
  guide: string;
  description: string;
};

export const INTEGRATIONS: IntegrationConfig[] = [
  {
    key: "notion",
    name: "Notion",
    envVar: "NOTION_API_KEY",
    guide: "https://developers.notion.com/docs/authorization",
    description: "Sync tasks, calendar boards, and docs from your Notion workspaces.",
  },
  {
    key: "google-drive",
    name: "Google Drive",
    envVar: "GOOGLE_SERVICE_ACCOUNT_JSON",
    guide: "https://developers.google.com/workspace/guides/service-accounts",
    description: "Mirror briefs, decks, and automation specs stored in Drive.",
  },
  {
    key: "openrouter",
    name: "OpenRouter",
    envVar: "OPENROUTER_API_KEY",
    guide: "https://openrouter.ai/keys",
    description: "Let Mission Control summarize docs and turn natural language into tasks.",
  },
];
