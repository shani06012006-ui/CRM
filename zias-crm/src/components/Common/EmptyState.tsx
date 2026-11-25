import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  action?: ReactNode;
}

export const EmptyState = ({ title, message, action }: EmptyStateProps) => (
  <div className="empty-state">
    <div className="empty-icon">
      <Sparkles size={26} />
    </div>
    <h3>{title}</h3>
    <p className="muted">{message}</p>
    {action}
  </div>
);