'use client';

interface ModelUsage {
  model: string;
  cost: number;
}

interface ModelUsageChartProps {
  modelUsage: ModelUsage[];
}

const ModelUsageChart = ({ modelUsage }: ModelUsageChartProps) => {
  const totalCost = modelUsage.reduce((acc, model) => acc + model.cost, 0);

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Per-Model Usage</h3>
      <div className="space-y-3">
        {modelUsage.map((model) => (
          <div key={model.model} className="text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[var(--text-secondary)]">{model.model}</span>
              <span className="font-mono text-[var(--text-primary)]">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(model.cost)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-raised)] overflow-hidden">
              <div
                className="h-full bg-[var(--brand)] rounded-full"
                style={{ width: `${(model.cost / totalCost) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelUsageChart;
