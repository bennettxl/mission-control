import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const NAV_ITEMS = [
  { id: "task-board", label: "Task Board", hint: "Ops flow" },
  { id: "calendar", label: "Calendar", hint: "Cron + rituals" },
  { id: "projects", label: "Projects", hint: "XLInteractive" },
  { id: "memories", label: "Memories", hint: "Daily log" },
  { id: "docs", label: "Docs", hint: "Library" },
  { id: "team", label: "Team & Mission", hint: "Org map" },
  { id: "office", label: "Office", hint: "Visualizer" },
];

export const metadata: Metadata = {
  title: "XLInteractive Mission Control",
  description:
    "Command console for Open Claw + sub-agents — tasks, calendar, XLInteractive initiatives, memories, docs, and systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen px-4 pb-12 pt-8 text-sm text-white/90 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
            <aside className="nav-surface hidden w-64 flex-shrink-0 flex-col px-5 py-6 lg:flex">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Mission Control</p>
                <h1 className="mt-2 text-xl font-semibold text-white">Open Claw</h1>
                <p className="mt-1 text-[13px] text-white/60">
                  Linear-inspired console for XLInteractive autonomy.
                </p>
              </div>
              <nav className="mt-8 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className="nav-link flex flex-col px-3 py-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-[11px] text-white/40">{item.hint}</span>
                  </a>
                ))}
              </nav>
              <div className="mt-auto rounded-xl border border-white/5 bg-white/5 p-4 text-[13px] text-white/65">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Heartbeat</p>
                <p className="mt-2 font-medium text-white">Autonomous tasks monitored every loop.</p>
                <p className="mt-1">Assign work to “O” and it auto-executes.</p>
              </div>
            </aside>

            <main className="flex-1 space-y-6">
              <div className="nav-surface flex flex-wrap gap-2 rounded-2xl px-4 py-3 text-[13px] text-white/70 lg:hidden">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={`mobile-${item.id}`}
                    href={`#${item.id}`}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-white hover:border-white/30"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
