//src/components/Dashboard/StatsCard.tsx

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: { value: string; up: boolean };
  sub?: string;
}

export const StatsCard = ({ title, value, icon, trend, sub }: StatsCardProps) => (
  <div className="card stat-card">
    <div className="stat-head">
      <span className="stat-title">{title}</span>
      <div className="stat-icon">{icon}</div>
    </div>
    <div className="stat-value">{value}</div>
    {trend ? (
      <div className={`stat-trend ${trend.up ? 'up' : 'down'}`}>
        {trend.up ? '↑' : '↓'} {trend.value} <span>vs last month</span>
      </div>
    ) : (
      sub && (
        <div className="stat-trend">
          <span>{sub}</span>
        </div>
      )
    )}
  </div>
);