# Mission Control Vault Migration Plan

_Last updated: 2026-03-21 12:00 PT_

## Goal
Move all sensitive configuration (env vars, service-account JSON, API keys) from ad-hoc storage to a shared 1Password vault so Mission Control deploys stay auditable and recoverable.

## Steps
1. **Vault Share**
   - Bennett grants the "Mission Control" vault to `xl@xlinteractive.com` (and any other automation identities)
   - Confirm access via `op vault ls`

2. **Secret Ingestion**
   - Create items for:
     - `DATABASE_URL` (Supabase)
     - `OPENROUTER_API_KEY`
     - `NOTION_API_KEY`
     - `NOTION_TASKS_DB_ID`, `NOTION_CALENDAR_DB_ID`, `NOTION_DOCS_DB_ID`
     - `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Tag each item with `mission-control` for quick filtering

3. **Local Sync**
   - Use `op run --env-file=.env.local -- npm run dev` for local sessions once vault items exist
   - Document fallback instructions in `docs/README.md`

4. **Automation Hooks**
   - Update n8n secrets to pull from 1Password Connect (or CLI) before calling `sync:integrations`
   - Store Vercel / Supabase tokens in the same vault for parity

5. **Decommission Legacy Locations**
   - Remove plaintext secrets from Discord / ad-hoc notes
   - Replace `.env.local` contents with references to `op inject`

## Deliverables
- Updated `.env.local.example` showing `op` usage hints
- Short Loom or text walkthrough for anyone running Mission Control locally
