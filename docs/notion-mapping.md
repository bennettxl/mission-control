# Notion ↔︎ Mission Control Mapping

_Last updated: 2026-03-21 15:00 PT_

## Tasks Database
| Mission Control Field | Notion Property | Type | Notes |
| --- | --- | --- | --- |
| Title | `Name` | Title | Primary task name |
| Status | `Status` | Select | Map to `Backlog`, `In Flight`, `Review`, `Done` |
| Owner | `Owner` | People | Optional; falls back to "Unassigned" |
| Priority | `Priority` | Select | Values: `P0`, `P1`, `P2`, `P3` |
| Due Date | `Due` | Date | Used for calendar + SLA views |
| Tags | `Tags` | Multi-select | Surface in filter chips |
| Notes | `Notes` | Rich text | Mirrors to the detail drawer |

## Calendar / Runs Database
| Mission Control Field | Notion Property | Type | Notes |
| --- | --- | --- | --- |
| Event | `Name` | Title | e.g., "Mission Control Sync" |
| Start | `Start` | Date | Required |
| End | `End` | Date | Optional; defaults to +1h if empty |
| Owner | `Owner` | People | For accountability view |
| Status | `Status` | Select | `Scheduled`, `In Progress`, `Complete` |
| Notes | `Notes` | Rich text | Shows in flyout |

## Documents Database
| Mission Control Field | Notion Property | Type | Notes |
| --- | --- | --- | --- |
| Title | `Name` | Title | Document name |
| Type | `Type` | Select | Deck / Brief / Spec / Other |
| Owner | `Owner` | People | Optional |
| Source Link | `URL` | URL | Backlink to canonical doc |
| Tags | `Tags` | Multi-select | Used for saved filters |
| Summary | `Summary` | Rich text | Can be auto-filled via OpenRouter |

## Actions Once IDs Arrive
1. Populate `.env.local` with `NOTION_TASKS_DB_ID`, `NOTION_CALENDAR_DB_ID`, `NOTION_DOCS_DB_ID`.
2. Run `npm run sync:integrations` to pull records and confirm property matches.
3. Update `src/lib/notion/schema.ts` if any property names differ.
4. Re-seed Prisma (`npm run db:seed`) if structural changes are needed.
