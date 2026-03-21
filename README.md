# XLInteractive Mission Control

Local Next.js command center for tracking the XLInteractive mission statement, live tasks, autonomous calendar runs, and documents coming from Notion, Google Drive, and manual uploads. OpenRouter hooks are ready for AI-powered summaries and natural-language task creation.

## Stack
- **Next.js 16 (App Router) + TypeScript**
- **Tailwind CSS 4** with custom glassmorphism theme
- **Prisma + SQLite** for fast local data modeling
- **Lucide Icons** for lightweight visuals
- **OpenRouter hooks** for document summarization + natural-language task intake

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Copy the environment template**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the values as needed:
   - `DATABASE_URL` – defaults to the local SQLite file.
   - `NOTION_API_KEY` – share your target databases with the integration.
   - `GOOGLE_SERVICE_ACCOUNT_JSON` – stringified service-account JSON for Drive.
   - `OPENROUTER_API_KEY` – optional but unlocks document summaries + task parsing.

3. **Create the database + seed sample data**
   ```bash
   npm run db:push   # sync schema → dev.db
   npm run db:seed   # load starter tasks/events/docs
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to view Mission Control.

## Connecting real data
| Source | What you get | How to connect |
| --- | --- | --- |
| Notion | Tasks, calendar items, briefs | Create an integration → share the databases → add `NOTION_API_KEY` **and** the database IDs (`NOTION_TASKS_DB_ID`, `NOTION_CALENDAR_DB_ID`, `NOTION_DOCS_DB_ID`) to `.env.local`, then run `npm run sync:integrations`. |
| Google Drive | Decks, specs, uploads | Create a service account with Drive API access → paste JSON credentials into `GOOGLE_SERVICE_ACCOUNT_JSON`, optionally set `GOOGLE_DRIVE_FOLDER_ID`, then run `npm run sync:integrations`. |
| Manual uploads | Local docs dropped into `/uploads` | Use the planned drag/drop uploader (coming next). |
| OpenRouter | Insights + natural-language tools | Generate an API key → set `OPENROUTER_API_KEY`. |

The app already surfaces which integrations are missing so you can wire them up incrementally. Once the env values are in place, use `npm run sync:integrations` to pull Notion + Drive data into the local Prisma database.

## OpenRouter features shipped in v1
- **Doc summarization:** every document card has a “Summarize via OpenRouter” button powered by `summarizeDocument`.
- **Natural-language task intake:** the Task Flow panel now includes a mini prompt box that turns free text into structured tasks with `createTaskFromPrompt`.

## Development roadmap
- Build dedicated adapters under `src/lib/integrations/` for pulling real Notion/Drive data.
- Add file upload handling + preview cards.
- Layer activity indicators + history for OpenRouter actions (streaming responses, error logs).
- Drop in additional modules (content lab, KPI wall, deal desk) using the existing layout.

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js locally (http://localhost:3000). |
| `npm run build` | Production build. |
| `npm run start` | Run the production server. |
| `npm run lint` | ESLint (Next.js config). |
| `npm run db:push` | Apply Prisma schema to SQLite. |
| `npm run db:seed` | Populate the database with sample data. |

---
Questions or new module ideas? Just tell XL what you want Mission Control to do next and we can scaffold another tool inside this shell.
