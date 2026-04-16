import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const status = await kv.get('agent-status');
        return NextResponse.json(status);
    } catch (error) {
        console.error('Error fetching agent status:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const status = await request.json();
        await kv.set('agent-status', status);
        return new NextResponse('Status updated', { status: 200 });
    } catch (error) {
        console.error('Error updating agent status:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
