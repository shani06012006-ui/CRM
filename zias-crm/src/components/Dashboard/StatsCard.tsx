//src/components/Dashboard/StatsCard.tsx

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend: string;
  trendUp: boolean;
}

export const StatsCard = ({ title, value, icon, trend, trendUp }: StatsCardProps) => (
  <div className="card stat-card">
    <div className="stat-head">
      <span className="stat-title">{title}</span>
      <div className="stat-icon">{icon}</div>
    </div>
    <div className="stat-value">{value}</div>
    <div className={`stat-trend ${trendUp ? 'up' : 'down'}`}>
      {trendUp ? '↑' : '↓'} {trend} <span>vs last month</span>
    </div>
  </div>
);