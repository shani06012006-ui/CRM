import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  compact?: boolean;
}

export const ErrorState = ({ message, onRetry, compact = false }: ErrorStateProps) => (
  <div className={`error-state${compact ? ' compact' : ''}`} role="alert">
    <div className="error-icon">
      <AlertTriangle size={compact ? 15 : 20} />
    </div>
    <div className="error-text">
      <strong>{compact ? 'Showing older data' : "Couldn't load this section"}</strong>
      <span>{message}</span>
    </div>
    <button className="btn btn-outline btn-sm" onClick={onRetry}>
      <RotateCw size={14} /> Try again
    </button>
  </div>
);