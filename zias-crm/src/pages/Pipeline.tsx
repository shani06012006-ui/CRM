//src/pages/Pipeline.tsx

import { useFetch } from '../hooks/useFetch';
import { crmService } from '../services/crmService';
import { Lead } from '../interfaces';
import { formatINR } from '../utils/format';

const columns: Lead['status'][] = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed'];

export const Pipeline = () => {
  const { data: leads, loading } = useFetch<Lead[]>(crmService.getLeads);

  if (loading) return <div className="loader"><span className="spinner" />Loading pipeline...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Sales Pipeline</h1>
          <p>Track every deal across its stages</p>
        </div>
      </div>

      <div className="pipeline-board">
        {columns.map((status) => {
          const items = leads?.filter((l) => l.status === status) ?? [];
          return (
            <div key={status} className="pipeline-col">
              <div className="col-head">
                <span className="col-dot" data-status={status} />
                {status}
                <span className="col-count">{items.length}</span>
              </div>
              <div className="col-cards">
                {items.map((lead) => (
                  <div key={lead.id} className="kanban-card" data-status={status}>
                    <p className="cell-name">{lead.name}</p>
                    <p className="cell-muted small">{lead.company}</p>
                    <p className="kanban-value">{formatINR(lead.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};