'use server';

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { callOpenRouter } from "@/lib/openrouter";
import { isMissingTableError } from "@/lib/prisma-errors";

const missionStatement =
  "To provide intelligent understanding and seamless communication that helps our clients XL (excel). By integrating advanced Voice AI, SMS, and media automation, we increase business value by transforming how brands engage—amplifying human impact and building sustainable customer relationships.";

export async function summarizeDocument(documentId: string, _formData?: FormData) {
  void _formData;

  let document;
  try {
    document = await prisma.documentRecord.findUnique({
      where: { id: documentId },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error("Prod database isn't configured yet, so document summaries are disabled.");
    }
    throw error;
  }

  if (!document) {
    throw new Error("Document not found");
  }

  const contextPieces = [document.description, document.content]
    .filter((piece): piece is string => typeof piece === "string" && piece.trim().length > 0)
    .join("\n\n");

  if (!contextPieces) {
    throw new Error("No document content available to summarize.");
  }

  const prompt = `Mission statement: ${missionStatement}\n\nDocument title: ${document.title}\nSource: ${document.source}\nContent:\n${contextPieces}\n\nWrite a tight three-bullet summary (each bullet <= 20 words) and end with a single sentence recommendation.`;

  const response = await callOpenRouter(prompt);

  if (!response.ok) {
    throw new Error(response.error ?? "OpenRouter call failed");
  }

  const cleanSummary = response.output.trim();

  try {
    await prisma.documentRecord.update({
      where: { id: documentId },
      data: { summary: cleanSummary },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error("Prod database isn't configured yet, so document summaries are disabled.");
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/projects");
}
