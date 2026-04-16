"use client";
import { useState, useEffect } from 'react';
import StatCard from '../ui/StatCard';
import { Coins, TrendingUp } from 'lucide-react';

interface ModelUsage {
  model: string;
  cost: number;
}

interface TokenData {
  balance: number;
  limit: number;
  usageToday: number;
  modelUsage: ModelUsage[];
}

const TokenUsageDashboard = () => {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/tokens');
        if (!response.ok) {
          throw new Error('Failed to fetch token data');
        }
        const tokenData = await response.json();
        setData(tokenData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    // A more polished skeleton loader can be added here
    return <div>Loading token data...</div>;
  }

  if (error) {
    return <div className="text-danger">Error: {error}</div>;
  }

  if (!data) {
    return <div>No data available.</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  const balanceColorClass = data.balance > 20 ? 'text-success' : data.balance > 5 ? 'text-warning' : 'text-danger';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <StatCard 
          icon={Coins} 
          label="Current Balance" 
          value={formatCurrency(data.balance)} 
          className={balanceColorClass}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Usage Today" 
          value={formatCurrency(data.usageToday)} 
        />
      </div>
      <div className="lg:col-span-2">
        <ModelUsageChart modelUsage={data.modelUsage} />
      </div>
    </div>
  );
};

export default TokenUsageDashboard;
