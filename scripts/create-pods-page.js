import { config } from 'dotenv';
config();
config({ path: '.env.local', override: true });
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const pods = [
  {
    code: 'MC',
    name: 'Mission Control',
    focus: 'Token usage tracking, cron alerts, AM deliverables (stock/trend brief, day-job prep packet, mission control update).',
    status: 'Token tracker + cron alerts live (07:00–23:00, every 2h). Next run hits at 07:00 PT with AM deliverables queued.'
  },
  {
    code: 'AGY',
    name: 'Agency Pod',
    focus: 'Research + intelligence gathering for client/agency workstreams.',
    status: 'Research sources staged; awaiting tomorrow’s data pulls.'
  },
  {
    code: 'QC',
    name: 'XL Quality Control',
    focus: 'Analyze effectiveness of tasks/comms, optimize workflows, feed learnings into memory.',
    status: 'Standing mandate: continuous system optimization + feedback ingestion.'
  },
  {
    code: 'O',
    name: 'Open Claw',
    focus: 'Chief-of-staff AI (Mac mini) managing workflows, owners, accountability, daily mission updates.',
    status: 'Active.'
  },
  {
    code: 'A',
    name: 'Ayan',
    focus: 'Design & research (Mac Studio) – storyboards, brand systems, qualitative insights.',
    status: 'Active.'
  },
  {
    code: 'F',
    name: 'Adept Forge',
    focus: 'Engineering pod (sandbox node) – code changes, automations, experiments.',
    status: 'Active.'
  },
  {
    code: 'S',
    name: 'Signal Monitor',
    focus: 'Rituals / cron pod (cloud worker) – weather, inbox, reminders, proactive alerts.',
    status: 'Active.'
  },
  {
    code: 'AP',
    name: 'Automation Pod',
    focus: 'Build/operate automation tooling (n8n, cron pipelines, connectors) across Mission Control.',
    status: 'Wiring n8n + reminder workflows; ETA Wed Mar 25 6 AM for the automated status cadence.'
  },
  {
    code: 'XLS',
    name: 'XL Studio',
    focus: 'Creative/content studio for XLInteractive (storytelling, motion, marketing assets).',
    status: 'Standing pool; no new deliverables logged today.'
  },
  {
    code: 'GRW',
    name: 'Growth & Sales',
    focus: 'Pipeline generation, outbound, partner management, and revenue instrumentation.',
    status: 'Pod created; needs pipeline/backlog defined (lead sourcing, outreach cadences, deal status).'
  },
  {
    code: 'FIN',
    name: 'Finance & Accounting',
    focus: 'Cashflow, billing/invoicing, expense tracking, forecasting, compliance.',
    status: 'Pod created; awaiting latest statements + bookkeeping backlog to ingest.'
  },
  {
    code: 'SHC',
    name: 'SHC Digital Transformation PM',
    focus: 'Calendar scrape, prep packet drafting, and PM support for SHC initiatives.',
    status: 'Calendar scrape + prep packet drafting scheduled for the morning block.'
  },
  {
    code: 'HLTH',
    name: 'Health Pod',
    focus: 'Workouts, nutrition, health routines.',
    status: 'Nothing logged today; awaiting direction for tomorrow’s plan.'
  },
  {
    code: 'HUB',
    name: 'Hubby',
    focus: 'Relationship planning with Karen (weekly date ideas + prep).',
    status: 'Need weekly date suggestions each Wednesday.'
  },
  {
    code: 'FAM',
    name: 'Fatherhood',
    focus: 'Kid logistics + activities.',
    status: 'Weekend activity report due Thu at noon; weekly logistics still outstanding.'
  },
  {
    code: 'PER',
    name: 'Personal',
    focus: 'Personal matters, goals, errands.',
    status: 'Catch-all queue.'
  },
  {
    code: 'TEX',
    name: 'Trusted Execution',
    focus: 'High-trust, high-stakes items requiring focused execution.',
    status: 'No pending tasks at the moment.'
  }
];

const children = [
  {
    object: 'block',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: 'Pod Directory' } }]
    }
  },
  ...pods.map((pod) => ({
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: `${pod.name} (${pod.code}) — ${pod.focus} Current: ${pod.status}`
          }
        }
      ]
    }
  }))
];

const title = `Mission Control Pods — ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'short' })}`;

(async () => {
  try {
    const page = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DOCS_DB_ID },
      properties: {
        Name: {
          title: [{ text: { content: title } }]
        }
      },
      children
    });
    console.log('Created page:', page.id);
  } catch (err) {
    console.error('Failed to create pods page', err.response?.data ?? err.message);
    process.exit(1);
  }
})();
