//src/components/Dashboard/PipelineTable.tsx

import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { Lead, LeadStatus } from '../../interfaces';
import { formatINR } from '../../utils/format';
import { StatusSelect } from '../Leads/StatusSelect';

interface PipelineTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: number) => void;
  onStatusChange: (lead: Lead, status: LeadStatus) => void;
}

export const PipelineTable = ({ leads, onEdit, onDelete, onStatusChange }: PipelineTableProps) => {
  const navigate = useNavigate();
  const rows = leads.slice(0, 5);

  return (
    <div className="card">
      <div className="card-head">
        <h3>Recent Leads</h3>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/leads')}>View All</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Status</th>
              <th>Value</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-cell">No leads yet. Add your first one ✨</td>
              </tr>
            )}
            {rows.map((lead) => (
              <tr key={lead.id}>
                <td className="cell-name">{lead.name}</td>
                <td className="cell-muted">{lead.company}</td>
                <td>
                  <StatusSelect value={lead.status} onChange={(s) => onStatusChange(lead, s)} />
                </td>
                <td className="cell-money">{formatINR(lead.value)}</td>
                <td className="col-actions">
                  <div className="action-group">
                    <button className="btn-icon" aria-label="Edit lead" onClick={() => onEdit(lead)}>
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn-icon danger"
                      aria-label="Delete lead"
                      onClick={() => onDelete(lead.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};