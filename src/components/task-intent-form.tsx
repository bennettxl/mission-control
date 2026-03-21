"use client";

import { useActionState } from "react";
import { createTaskFromPrompt } from "@/app/actions/create-task-from-prompt";

const initialState = {
  ok: false,
  message: "Describe what you need and I’ll structure the task",
};

export function TaskIntentForm() {
  const [state, formAction, pending] = useActionState(createTaskFromPrompt, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <textarea
        name="prompt"
        className="w-full rounded-2xl border border-white/15 bg-white/5 p-3 text-sm text-white placeholder:text-white/30 focus:border-mission-highlight focus:outline-none"
        placeholder="E.g. follow up with Cohort 3 brands next Tuesday about voice AI onboarding"
        rows={3}
        disabled={pending}
      />
      <div className="flex items-center justify-between text-xs text-white/60">
        <span className={state.ok ? "text-mission-highlight" : "text-white/60"}>{state.message}</span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-white/20 px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-mission-highlight hover:text-mission-highlight disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Drafting…" : "Create task"}
        </button>
      </div>
    </form>
  );
}
