import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
}) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {title}
        </span>
        <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-neutral-900">{value}</div>
        {badge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}
    </div>
  );
};
