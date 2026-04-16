import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function GET() {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();

    const usage = data.data.usage || {};
    const modelUsage = Object.entries(usage)
      .map(([model, cost]) => ({
        model,
        cost: cost as number,
      }))
      .sort((a, b) => b.cost - a.cost);

    const result = {
      balance: data.data.limit - data.data.usage_today,
      limit: data.data.limit,
      usageToday: data.data.usage_today,
      modelUsage,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch OpenRouter data:', error);
    return NextResponse.json({ error: 'Failed to fetch OpenRouter data' }, { status: 500 });
  }
}
