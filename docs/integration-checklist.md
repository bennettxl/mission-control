# Mission Control Integration Checklist

_Last updated: 2026-03-21 09:00 PT_

## Notion
- [ ] Provide database IDs for:
  - Tasks (kanban)
  - Calendar / runs
  - Documents / briefs
- [ ] Share each database with the Mission Control integration
- [ ] Confirm any status / property mappings that differ from the seed schema

## Google Drive
- [ ] Grant the Mission Control service account access to folder `1RKLmyS59w2iL5GhhTzdGjFGyJdCCARXJ`
- [ ] Drop 2–3 representative files (deck, brief, spreadsheet) into the folder for preview testing
- [ ] Decide on sync scope (entire folder vs. filtered subdirectories)

## Secrets & Automation
- [ ] Share the Mission Control 1Password vault so `.env.local` secrets can move out of Discord
- [ ] Once vault access is available, run `npm run sync:integrations` to refresh Prisma
- [ ] Schedule nightly `sync:integrations` + health-check reminders via n8n once data is flowing

## QA Pass (post-integration)
- [ ] Verify Supabase + Vercel references continue to point at the new Postgres instance
- [ ] Smoke-test doc previews, calendar cards, and Kanban interactions with live data
- [ ] Update Mission Control deployment notes with any schema or env deltas discovered
