
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const htmlPath = path.join(process.cwd(), 'public', 'tech-stack', 'tech_stack.html');
  try {
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    return new NextResponse('Error reading tech stack HTML file.', { status: 500 });
  }
}
