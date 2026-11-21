import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { useLeadActions } from '../hooks/useLeadActions';
import { crmService } from '../services/crmService';
import { Lead, STATUSES } from '../interfaces';
import { formatINR } from '../utils/format';
import { LeadFormModal } from '../components/Leads/LeadFormModal';
import { StatusSelect } from '../components/Leads/StatusSelect';

export const Pipeline = () => {
  const { data: leads, loading, refetch } = useFetch<Lead[]>(crmService.getLeads);
  const { remove, changeStatus } = useLeadActions(refetch);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  if (loading) {
    return <div className="loader"><span className="spinner" />Loading pipeline...</div>;
  }

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setShowForm(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Sales Pipeline</h1>
          <p>Track every deal across its stages</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add New Lead
        </button>
      </div>

      <div className="pipeline-board">
        {STATUSES.map((status) => {
          const items = (leads ?? []).filter((l) => l.status === status);
          const total = items.reduce((sum, l) => sum + Number(l.value), 0);

          return (
            <div key={status} className="pipeline-col">
              <div className="col-head">
                <span className="col-dot" data-status={status} />
                {status}
                <span className="col-count">{items.length}</span>
              </div>
              <p className="col-total">{formatINR(total)} in this stage</p>

              <div className="col-cards">
                {items.length === 0 && <p className="col-empty">Nothing here yet 🐾</p>}
                {items.map((lead) => (
                  <div key={lead.id} className="kanban-card" data-status={lead.status}>
                    <p className="cell-name">{lead.name}</p>
                    <p className="cell-muted small">{lead.company}</p>
                    <p className="kanban-value">{formatINR(lead.value)}</p>
                    <div className="kanban-actions">
                      <StatusSelect value={lead.status} onChange={(s) => changeStatus(lead, s)} />
                      <div className="action-group">
                        <button className="btn-icon" aria-label="Edit lead" onClick={() => openEdit(lead)}>
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon danger" aria-label="Delete lead" onClick={() => remove(lead.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <LeadFormModal
          key={editing?.id ?? 'new'}
          lead={editing}
          onClose={() => setShowForm(false)}
          onSaved={refetch}
        />
      )}
    </div>
  );
};