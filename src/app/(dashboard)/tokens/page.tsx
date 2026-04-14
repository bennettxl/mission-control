import { Coins, TrendingUp, Zap, DollarSign } from "lucide-react";

export const revalidate = 300;

export default function TokensPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Usage</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Token & Cost Usage</h1>
        <p className="mt-1 text-sm text-white/50">
          OpenRouter spend, per-model breakdown, and balance tracking.
        </p>
      </div>

      {/* Placeholder stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PlaceholderStat icon={DollarSign} label="Balance" value="—" />
        <PlaceholderStat icon={TrendingUp} label="Today" value="—" />
        <PlaceholderStat icon={Zap} label="This week" value="—" />
        <PlaceholderStat icon={Coins} label="This month" value="—" />
      </div>

      {/* Placeholder chart area */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold text-white">Spend Over Time</h2>
        <div className="mt-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-white/8">
          <div className="text-center">
            <TrendingUp size={28} className="mx-auto text-white/15" />
            <p className="mt-2 text-xs text-white/25">Chart visualization coming in Phase 2</p>
          </div>
        </div>
      </div>

      {/* Per-model breakdown placeholder */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold text-white">Per-Model Breakdown</h2>
        <div className="mt-4 space-y-3">
          {["claude-opus-4", "gpt-4o", "gpt-4o-mini", "gemini-2.5-pro"].map((model) => (
            <div
              key={model}
              className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">{model}</p>
                <p className="text-[10px] text-white/30">Usage data pending</p>
              </div>
              <div className="h-2 w-24 rounded-full bg-white/5">
                <div className="h-full w-0 rounded-full bg-white/20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 text-center">
        <Coins size={24} className="mx-auto text-white/20" />
        <p className="mt-3 text-sm font-medium text-white/40">
          Real-Time Token Tracking
        </p>
        <p className="mt-1 text-xs text-white/25">
          OpenRouter balance, burn rate alerts, and per-session cost tracking coming in Phase 2.
        </p>
      </div>
    </div>
  );
}

function PlaceholderStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/35">
        <Icon size={14} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white/25">{value}</p>
    </div>
  );
}
