import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useLeadActions } from '../hooks/useLeadActions';
import { crmService, getApiError } from '../services/crmService';
import { Lead, LeadPage, LeadStatus, STATUSES } from '../interfaces';
import { formatINR } from '../utils/format';
import { LeadFormModal } from '../components/Leads/LeadFormModal';
import { StatusSelect } from '../components/Leads/StatusSelect';
import { ErrorState } from '../components/Common/ErrorState';
import { useOnNewLead } from '../hooks/useShortcuts';


const COLUMN_LIMIT = 50;

type Board = Partial<Record<LeadStatus, LeadPage>>;

export const Pipeline = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  const refresh = () => setReloadKey((k) => k + 1);
  const { remove, changeStatus } = useLeadActions(refresh);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all(
      STATUSES.map((s) => crmService.getLeads({ status: s, page_size: COLUMN_LIMIT }))
    )
      .then((pages) => {
        if (cancelled) return;
        const next: Board = {};
        STATUSES.forEach((s, i) => {
          next[s] = pages[i];
        });
        setBoard(next);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(getApiError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setShowForm(true);
  };

  const hasBoard = Object.keys(board).length > 0;

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

      {loading && !hasBoard && (
        <div className="loader"><span className="spinner" />Loading pipeline...</div>
      )}

      {error && !hasBoard && <ErrorState message={error} onRetry={refresh} />}

      {error && hasBoard && <ErrorState compact message={error} onRetry={refresh} />}

      {hasBoard && (
        <div className="pipeline-board">
          {STATUSES.map((status) => {
            const page = board[status];
            const items = page?.results ?? [];
            const count = page?.count ?? 0;
            const total = page?.total_value ?? 0;

            return (
              <div key={status} className="pipeline-col">
                <div className="col-head">
                  <span className="col-dot" data-status={status} />
                  {status}
                  <span className="col-count">{count}</span>
                </div>
                <p className="col-total">{formatINR(total)} in this stage</p>

                <div className="col-cards">
                  {count === 0 && <p className="col-empty">Nothing here yet 🐾</p>}

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

                  {count > items.length && (
                    <p className="col-more">
                      Showing {items.length} of {count}.{' '}
                      <button className="link-btn" onClick={() => navigate(`/leads`)}>
                        See all
                      </button>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <LeadFormModal
          key={editing?.id ?? 'new'}
          lead={editing}
          onClose={() => setShowForm(false)}
          onSaved={refresh}
        />
      )}
    </div>
  );
};