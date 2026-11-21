//src/components/Dashboard/PipelineTable.tsx

import { Lead } from '../../interfaces';
import { formatINR } from '../../utils/format';

interface PipelineTableProps {
  leads: Lead[];
  onDelete: (id: string) => void;
}

export const PipelineTable = ({ leads, onDelete }: PipelineTableProps) => (
  <div className="card">
    <div className="card-head">
      <h3>Recent Leads</h3>
      <button className="btn btn-outline btn-sm">View All</button>
    </div>

    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Status</th>
            <th>Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr>
              <td colSpan={5} className="empty-cell">No leads yet. Add your first one ✨</td>
            </tr>
          )}
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="cell-name">{lead.name}</td>
              <td className="cell-muted">{lead.company}</td>
              <td><span className="badge" data-status={lead.status}>{lead.status}</span></td>
              <td className="cell-money">{formatINR(lead.value)}</td>
              <td>
                <button className="btn btn-ghost btn-sm" onClick={() => onDelete(lead.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);