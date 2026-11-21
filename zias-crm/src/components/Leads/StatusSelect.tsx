import { LeadStatus, STATUSES } from '../../interfaces';

interface StatusSelectProps {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
}

export const StatusSelect = ({ value, onChange }: StatusSelectProps) => (
  <select
    className="status-select"
    data-status={value}
    value={value}
    onChange={(e) => onChange(e.target.value as LeadStatus)}
    aria-label="Lead status"
  >
    {STATUSES.map((s) => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
);