import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { useLeadActions } from '../hooks/useLeadActions';
import { crmService } from '../services/crmService';
import { Lead, LeadStatus, STATUSES } from '../interfaces';
import { formatINR } from '../utils/format';
import { LeadFormModal } from '../components/Leads/LeadFormModal';
import { StatusSelect } from '../components/Leads/StatusSelect';

export const Leads = () => {
  const [searchParams] = useSearchParams();
  const { data: leads, loading, refetch } = useFetch<Lead[]>(crmService.getLeads);
  const { remove, changeStatus } = useLeadActions(refetch);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [statusFilter, setStatusFilter] = useState<'All' | LeadStatus>('All');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  // Header search navigates here with ?q=..., so pick it up when it changes
  useEffect(() => {
    setSearchTerm(searchParams.get('q') ?? '');
  }, [searchParams]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (leads ?? []).filter((l) => {
      const matchesTerm =
        !term || [l.name, l.company, l.email].some((field) => field.toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  if (loading) {
    return <div className="loader"><span className="spinner" />Loading leads...</div>;
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
          <h1>All Leads</h1>
          <p>{filtered.length} of {leads?.length ?? 0} leads</p>
        </div>
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search name, company, email..."
            className="input-field search-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="input-field filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | LeadStatus)}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> Add Lead
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Status</th>
                <th>Value</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">No matching leads 🌸</td>
                </tr>
              )}
              {filtered.map((lead) => (
                <tr key={lead.id}>
                  <td className="cell-name">{lead.name}</td>
                  <td>{lead.company}</td>
                  <td className="cell-muted">{lead.email}</td>
                  <td>
                    <StatusSelect value={lead.status} onChange={(s) => changeStatus(lead, s)} />
                  </td>
                  <td className="cell-money">{formatINR(lead.value)}</td>
                  <td className="col-actions">
                    <div className="action-group">
                      <button className="btn-icon" aria-label="Edit lead" onClick={() => openEdit(lead)}>
                        <Pencil size={15} />
                      </button>
                      <button className="btn-icon danger" aria-label="Delete lead" onClick={() => remove(lead.id)}>
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