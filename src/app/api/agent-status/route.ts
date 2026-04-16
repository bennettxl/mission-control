
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// This is the data structure for our agent status
interface AgentStatus {
    last_updated: string;
    agents: {
        id: string;
        name: string;
        status: 'active' | 'idle';
        task: string;
    }[];
}

const STATUS_KEY = 'agent-status';

/**
 * GET /api/agent-status
 * Retrieves the latest agent status from Vercel KV storage.
 */
export async function GET() {
    try {
        const status = await kv.get<AgentStatus>(STATUS_KEY);
        if (!status) {
            return NextResponse.json({ error: 'No status data available.' }, { status: 404 });
        }
        return NextResponse.json(status);
    } catch (error) {
        console.error('Error fetching agent status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/agent-status
 * Receives new agent status data and stores it in Vercel KV.
 * Requires a secret key for authorization.
 */
export async function POST(req: NextRequest) {
    const secret = req.headers.get('x-api-secret');
    if (secret !== process.env.AGENT_STATUS_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        // Basic validation
        if (!body.last_updated || !Array.isArray(body.agents)) {
            return NextResponse.json({ error: 'Invalid data format.' }, { status: 400 });
        }

        await kv.set(STATUS_KEY, body);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error processing agent status post:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
