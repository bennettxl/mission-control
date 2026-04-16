import TokenUsageDashboard from '@/components/tokens/TokenUsageDashboard';

export default function TokensPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Token & Cost Usage</h1>
      <TokenUsageDashboard />
    </div>
  );
}
