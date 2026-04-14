"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Coins,
  FileText,
  FolderKanban,
  LogOut,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", hint: "Dashboard home", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", hint: "Kanban board", icon: CheckSquare },
  { href: "/cron", label: "Cron", hint: "Scheduled jobs", icon: Timer },
  { href: "/tokens", label: "Tokens", hint: "Usage & cost", icon: Coins },
  { href: "/reports", label: "Reports", hint: "Output feed", icon: FileText },
  { href: "/projects", label: "Projects", hint: "Workstreams", icon: FolderKanban },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

async function handleLogout() {
  await fetch("/api/auth", { method: "DELETE" });
  window.location.href = "/login";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-sm text-white/90">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/5 bg-[rgba(7,10,18,0.95)] backdrop-blur-xl lg:flex">
        <div className="px-5 pt-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/branding/xl-logo.jpg"
              alt="XLInteractive"
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl border border-white/15 object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-white">Mission Control</p>
              <p className="text-[11px] text-white/40">XLInteractive</p>
            </div>
          </Link>
        </div>

        <nav className="mt-8 flex-1 space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-white/8 text-white"
                    : "text-white/50 hover:bg-white/4 hover:text-white/80"
                )}
              >
                <item.icon size={18} className={active ? "text-white" : "text-white/40"} />
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  <span className="text-[10px] text-white/30">{item.hint}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/40 transition hover:bg-white/4 hover:text-white/60"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[rgba(5,7,13,0.92)] px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/branding/xl-logo.jpg"
            alt="XLInteractive"
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg border border-white/15 object-cover"
          />
          <span className="text-sm font-semibold text-white">Mission Control</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white/60"
        >
          <LogOut size={16} />
        </button>
      </header>

      {/* Main content area */}
      <main className="pb-24 pt-16 lg:pb-8 lg:pl-60 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-[rgba(5,7,13,0.95)] backdrop-blur-xl lg:hidden">
        <div className="flex items-stretch justify-around" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex min-h-[60px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-white" : "text-white/35"
                )}
              >
                <item.icon size={20} className={active ? "text-white" : "text-white/35"} />
                <span>{item.label}</span>
                {active && (
                  <div className="h-0.5 w-4 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
