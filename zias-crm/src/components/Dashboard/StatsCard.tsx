import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend: string;
  trendUp: boolean;
}

export const StatsCard = ({ title, value, icon, trend, trendUp }: StatsCardProps) => {
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{title}</p>
        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--primary)' }}>{icon}</div>
      </div>
      <h2 style={{ fontSize: '1.8rem' }}>{value}</h2>
      <p style={{ fontSize: '0.8rem', color: trendUp ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {trendUp ? '↑' : '↓'} {trend} <span style={{ color: 'var(--text-muted)' }}>vs last month</span>
      </p>
    </div>
  );
};