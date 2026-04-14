import { config } from 'dotenv';
config();
config({ path: '.env.local', override: true });
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const pageId = '32de15f9-9649-81ae-9eae-fcbd30817a68';

const channelMap = [
  ['#pod-mission-control', 'Mission Control'],
  ['#pod-agency', 'Agency Pod'],
  ['#pod-automation', 'Automation Pod'],
  ['#pod-growth', 'Growth & Sales'],
  ['#pod-finance', 'Finance & Accounting'],
  ['#pod-xl-studio', 'XL Studio / Ayan'],
  ['#pod-adept-forge', 'Adept Forge'],
  ['#pod-signal-monitor', 'Signal Monitor'],
  ['#pod-quality', 'XL Quality Control'],
  ['#pod-shc', 'SHC Digital Transformation PM'],
  ['#pod-trusted-execution', 'Trusted Execution'],
  ['#pod-health', 'Health Pod'],
  ['#pod-hubby', 'Hubby Pod'],
  ['#pod-fatherhood', 'Fatherhood Pod'],
  ['#pod-life', 'Personal Pod']
];

const children = [
  {
    heading_2: {
      rich_text: [{ text: { content: 'Discord Channel Map' } }]
    }
  },
  ...channelMap.map(([channel, pod]) => ({
    bulleted_list_item: {
      rich_text: [{ text: { content: `${channel} → ${pod}` } }]
    }
  }))
];

(async () => {
  try {
    await notion.blocks.children.append({ block_id: pageId, children });
    console.log('Appended channel map to Notion');
  } catch (err) {
    console.error('Failed to append channel map', err.response?.data ?? err.message);
    process.exit(1);
  }
})();
