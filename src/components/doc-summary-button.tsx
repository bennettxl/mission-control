"use client";

import { useState, useTransition } from "react";
import { summarizeDocument } from "@/app/actions/summarize-document";

export function DocSummaryButton({ documentId }: { documentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        await summarizeDocument(documentId);
        setMessage("Summary updated");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "OpenRouter error");
      }
    });
  };

  return (
    <div className="mt-3 space-y-1 text-xs text-white/60">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="rounded-full border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-mission-highlight hover:text-mission-highlight disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30"
      >
        {isPending ? "Summarizing…" : "Summarize via OpenRouter"}
      </button>
      {message && <p className="text-[11px] text-white/50">{message}</p>}
    </div>
  );
}
