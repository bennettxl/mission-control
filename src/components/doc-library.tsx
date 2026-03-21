"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DocSummaryButton } from "@/components/doc-summary-button";

export type DocLibraryItem = {
  id: string;
  title: string;
  kind: string;
  source: string;
  summary: string | null;
  updatedAt: string;
};

function formatRelative(dateString: string) {
  const value = new Date(dateString);
  const diff = Date.now() - value.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return value.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function DocLibrary({ documents }: { documents: DocLibraryItem[] }) {
  const [query, setQuery] = useState("");
  const [activeKind, setActiveKind] = useState("ALL");

  const kinds = useMemo(() => {
    const unique = Array.from(new Set(documents.map((doc) => doc.kind)));
    return ["ALL", ...unique];
  }, [documents]);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesKind = activeKind === "ALL" || doc.kind === activeKind;
      const matchesQuery = query
        ? [doc.title, doc.summary ?? "", doc.source].some((field) =>
            field.toLowerCase().includes(query.toLowerCase()),
          )
        : true;
      return matchesKind && matchesQuery;
    });
  }, [documents, activeKind, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search size={16} className="text-white/40" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search briefs, specs, decisions"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {kinds.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => setActiveKind(kind)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                activeKind === kind
                  ? "border-white/40 bg-white/20 text-white"
                  : "border-white/10 bg-white/0 text-white/55 hover:border-white/30 hover:text-white"
              }`}
            >
              {kind}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((doc) => (
          <article key={doc.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-white">{doc.title}</p>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">{doc.kind}</p>
              </div>
              <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-wide text-white/60">
                {doc.source}
              </span>
            </div>
            {doc.summary ? (
              <p className="mt-3 text-xs text-white/65 whitespace-pre-line">{doc.summary}</p>
            ) : (
              <p className="mt-3 text-xs italic text-white/35">No summary yet</p>
            )}
            <div className="mt-3 text-[11px] uppercase tracking-[0.3em] text-white/40">
              updated {formatRelative(doc.updatedAt)}
            </div>
            <DocSummaryButton documentId={doc.id} />
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-white/60">No documents match that filter.</p>
        )}
      </div>
    </div>
  );
}
