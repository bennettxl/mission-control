'use server';

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { callOpenRouter } from "@/lib/openrouter";
import { isMissingTableError } from "@/lib/prisma-errors";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const missionStatement =
  "To provide intelligent understanding and seamless communication that helps our clients XL (excel). By integrating advanced Voice AI, SMS, and media automation, we increase business value by transforming how brands engage—amplifying human impact and building sustainable customer relationships.";

type ActionState = {
  ok: boolean;
  message: string;
};

function normalizeStatus(status?: string | null): string {
  const value = (status ?? '').toUpperCase();
  if (value.includes('PROGRESS')) return 'IN_PROGRESS';
  if (value.includes('REVIEW')) return 'REVIEW';
  if (value.includes('BLOCK')) return 'BLOCKED';
  if (value.includes('DONE') || value.includes('COMPLETE')) return 'COMPLETE';
  return 'BACKLOG';
}

function normalizePriority(priority?: string | null): string | undefined {
  const value = (priority ?? '').toUpperCase();
  if (!value) return undefined;
  if (value.includes('URGENT')) return 'URGENT';
  if (value.includes('HIGH')) return 'HIGH';
  if (value.includes('MED')) return 'MEDIUM';
  if (value.includes('LOW')) return 'LOW';
  return undefined;
}

function parseJsonBlock(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (error) {
    console.error('Failed to parse OpenRouter JSON', error, text);
    return null;
  }
}

export async function createTaskFromPrompt(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const promptText = formData.get('prompt');
  if (!promptText || typeof promptText !== 'string' || !promptText.trim()) {
    return { ok: false, message: 'Add some instructions first.' };
  }

  const instruction = `Mission statement: ${missionStatement}
The user provided this request: "${promptText}"
Return ONLY valid JSON with this shape: {"title": string, "description": string, "status": string, "priority": string, "dueDate": "YYYY-MM-DD" | null}.
Ensure the response is pure JSON without commentary.`;

  const response = await callOpenRouter(instruction);
  if (!response.ok) {
    return { ok: false, message: response.error ?? 'OpenRouter error' };
  }

  const parsed = parseJsonBlock(response.output);
  if (!parsed) {
    return { ok: false, message: 'Model response was not valid JSON.' };
  }

  const dueDate = parsed?.dueDate ? new Date(parsed.dueDate) : null;

  try {
    await prisma.task.create({
      data: {
        title: parsed.title || 'Untitled mission task',
        description: [parsed.description, `Original prompt: ${promptText}`]
          .filter(Boolean)
          .join('\n\n'),
        status: normalizeStatus(parsed.status),
        priority: normalizePriority(parsed.priority),
        dueDate: Number.isNaN(dueDate?.getTime()) ? null : dueDate,
        source: 'OPENROUTER',
      },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      console.warn('Database not provisioned for createTaskFromPrompt', error);
      return { ok: false, message: "Prod database isn't configured yet, so I can't save tasks here." };
    }
    throw error;
  }

  revalidatePath('/');
  return { ok: true, message: 'Task created from prompt.' };
}
