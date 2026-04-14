# Mission Control Dashboard — Work Plan

**Project:** Transform Mission Control from a single-page dashboard into a comprehensive, mobile-first command center for Bennett.
**Repo:** `github.com/bennettxl/mission-control`
**Live URL:** https://mission-control-smoky-phi.vercel.app
**Stack:** Next.js 16 (App Router) · Tailwind CSS · Prisma/Postgres (Supabase) · Vercel

---

## Phase 1: Core Dashboard Rebuild ✅ SHIPPED
**Completed:** April 14, 2026

### What shipped
- **Multi-page app** with 6 routes: `/` (Overview), `/tasks`, `/cron`, `/tokens`, `/reports`, `/projects`
- **Auth gate** — middleware-based password protection with httpOnly cookie (30-day expiry)
- **Mobile-first layout** — bottom tab bar (iOS-style) on mobile, sidebar nav on desktop
- **Dashboard shell** — shared layout with header, active page highlighting, sign-out
- **Loading skeletons** — every page has a skeleton loading state
- **Responsive design** — single-column mobile, expanding grids on tablet/desktop, safe-area padding for notched phones
- **Preserved all existing data** — Prisma integration, Notion/Drive/OpenRouter connectors, task intent form, doc library

### Pages delivered
| Route | Status | Data Source |
|-------|--------|-------------|
| `/` Overview | ✅ Live | Prisma (tasks, events, docs) + weather API |
| `/tasks` | ✅ Live | Prisma tasks (kanban) + OpenRouter NL intake |
| `/cron` | ✅ Shell | Prisma events + placeholder for OpenClaw cron API |
| `/tokens` | ✅ Shell | Placeholder cards ready for OpenRouter API data |
| `/reports` | ✅ Live | Memory vault daily logs + directives |
| `/projects` | ✅ Live | Prisma tasks/docs + memory mentions + doc library |
| `/login` | ✅ Live | Token-based auth |

---

## Phase 2: Live Data Integration 🔜 IN PROGRESS
**Target:** April 15–17, 2026 (Wed–Thu)

### 2A. Token & Cost Usage (`/tokens`)
- [ ] Create `/api/tokens` route that calls OpenRouter API (`/api/v1/auth/key`)
- [ ] Fetch balance, daily/weekly/monthly spend, per-model breakdown
- [ ] Build stat cards: current balance (color-coded green/yellow/red), today's spend, weekly, monthly
- [ ] Add per-model usage bars (claude-opus, gpt-4o, gpt-4o-mini, gemini-pro, etc.)
- [ ] Add burn rate calculation and estimated time-to-$0 warning
- [ ] Stretch: simple spend-over-time chart (last 7 days) using CSS/SVG (no chart library)

### 2B. Cron Jobs (`/cron`)
- [ ] Create `/api/cron` route that reads OpenClaw cron job data
- [ ] Display: job name, schedule, last run time, next run time, status (active/disabled/failed)
- [ ] Show recent run history per job (last 5 runs with status + duration)
- [ ] Color-code: green = healthy, yellow = stale (>2× expected interval), red = failed
- [ ] Link to run output when available

### 2C. Reports Feed (`/reports`)
- [ ] Create `/api/reports` route to aggregate:
  - Cron job outputs (briefings, heartbeat summaries)
  - Daily logs from memory vault
  - Manual report entries from Prisma
- [ ] Chronological feed with source badges (CRON, DAILY LOG, BRIEFING, MANUAL)
- [ ] Expandable/collapsible entries for long reports
- [ ] Filter by source type and date range

### 2D. Enhanced Task Board (`/tasks`)
- [ ] Add filter bar: by owner, status, pod/label, priority
- [ ] Add task count summary row
- [ ] Improve card detail: show due date, priority badge, age
- [ ] Stretch: drag-and-drop column moves (client-side state + API call)

---

## Phase 3: Polish & Production Hardening
**Target:** April 17–18, 2026 (Thu–Fri)

### 3A. Visual Polish
- [ ] Refine spacing, typography, and color consistency across all pages
- [ ] Add page transition animations (subtle fade)
- [ ] Improve empty states with better illustrations/copy
- [ ] Test on iPhone SE, iPhone 15, iPad, and desktop widths
- [ ] Dark mode refinement (ensure contrast ratios meet WCAG AA)

### 3B. Performance
- [ ] Audit Lighthouse scores (target: 90+ mobile)
- [ ] Add ISR/streaming where beneficial (token data = dynamic, overview = ISR)
- [ ] Lazy-load doc library and large lists
- [ ] Optimize image loading (next/image + sizes)

### 3C. Production Hardening
- [ ] Add error boundaries per page
- [ ] Graceful fallbacks when APIs are down (OpenRouter, weather, Prisma)
- [ ] Rate limiting on auth endpoint
- [ ] Add `robots.txt` / `noindex` meta (private dashboard)
- [ ] Vercel analytics (optional)

---

## Phase 4: Chat Window (v2)
**Target:** Week of April 20, 2026

### Options (in order of preference)
1. **OpenClaw API integration** — Real-time two-way chat panel embedded in the dashboard. Sends messages to XL via OpenClaw's API, displays responses with streaming. Most powerful but requires API auth + WebSocket/SSE.
2. **Discord bridge** — Lighter: sends to a Discord channel, polls for responses. Uses existing infra but has latency.
3. **Iframe widget** — Embed a third-party chat service. Lowest effort but least integrated.

### Chat UI spec (applies to any option)
- [ ] Slide-out panel from bottom-right (mobile: full-screen modal)
- [ ] Message history (last 20 messages)
- [ ] Typing indicator
- [ ] Markdown rendering in responses
- [ ] Persistent across page navigation (state in layout)
- [ ] Collapse to floating button when closed

---

## Phase 5: Future Enhancements (Backlog)
- [ ] **Calendar view** — Pull Google Calendar events and display weekly/daily view
- [ ] **Pod dashboards** — Per-pod pages showing tasks, metrics, and activity
- [ ] **Notification center** — In-app alerts for critical events (balance low, cron failure, etc.)
- [ ] **API health monitor** — Status page for all integrated services
- [ ] **PWA support** — Add to Home Screen with offline shell
- [ ] **Multi-user auth** — Invite team members with role-based access
- [ ] **Webhook receiver** — Accept incoming data from n8n, Notion webhooks, etc.
- [ ] **Export/share** — Generate PDF reports or shareable links

---

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| App Router route groups | Clean URL structure, shared layouts, per-page loading states |
| Middleware auth (not NextAuth) | Simple single-user dashboard; no OAuth complexity needed |
| No chart library yet | Keeping bundle small; CSS/SVG bars for Phase 2, evaluate recharts if needed in Phase 4 |
| httpOnly cookie | Secure auth that survives page reloads; 30-day expiry |
| Bottom tab bar | Mobile-first; matches iOS/Android native patterns Bennett uses daily |
| ISR (5 min revalidation) | Balance between freshness and Vercel function costs |

---

## Access & Credentials

| Item | Value |
|------|-------|
| Login URL | https://mission-control-smoky-phi.vercel.app/login |
| Access code | `xl-mission-2026` (change via Vercel env `MISSION_CONTROL_TOKEN`) |
| Vercel project | `bennettxls-projects/mission-control` |
| GitHub | `bennettxl/mission-control` (main branch) |

---

*Last updated: April 14, 2026 — XL*
