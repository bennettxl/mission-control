import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
}

const StatCard = ({ icon: Icon, label, value, className }: StatCardProps) => {
  return (
    <div className={`rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  );
};

export default StatCard;