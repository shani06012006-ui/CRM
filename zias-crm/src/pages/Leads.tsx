import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { useLeadActions } from '../hooks/useLeadActions';
import { useOnNewLead } from '../hooks/useShortcuts';
import { crmService, getApiError } from '../services/crmService';
import { Lead, LeadPage, LeadStatus, STATUSES } from '../interfaces';
import { formatINR } from '../utils/format';
import { useToast } from '../context/ToastContext';
import { LeadFormModal } from '../components/Leads/LeadFormModal';
import { StatusSelect } from '../components/Leads/StatusSelect';
import { ErrorState } from '../components/Common/ErrorState';
import { EmptyState } from '../components/Common/EmptyState';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest first' },
  { value: 'created_at', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: '-value', label: 'Highest value' },
  { value: 'value', label: 'Lowest value' },
];

export const Leads = () => {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>(
    (searchParams.get('status') ?? '') as LeadStatus | ''
  );
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<LeadPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);
  const { remove, changeStatus, bulkRemove, bulkStatus } = useLeadActions(refresh);

  // Pressing N anywhere opens the form on this page
  useOnNewLead(() => {
    setEditing(null);
    setShowForm(true);
  });

  // Header search and dashboard links arrive as ?q=... or ?status=...
  useEffect(() => {
    const urlQ = searchParams.get('q') ?? '';
    const urlStatus = (searchParams.get('status') ?? '') as LeadStatus | '';
    setSearchInput(urlQ);
    setQ(urlQ);
    setStatusFilter(urlStatus);
    setPage(1);
  }, [searchParams]);

  // Wait for typing to pause before calling the server
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    crmService
      .getLeads({ page, page_size: PAGE_SIZE, q, status: statusFilter, ordering })
      .then((res) => {
        if (cancelled) return;
        // The last lead on the final page was deleted, so step back one page
        if (res.results.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setResult(res);
        setError('');
        setSelected(new Set());
      })
      .catch((err) => {
        if (cancelled) return;
        if (page > 1 && err?.response?.status === 404) {
          setPage(1);
          return;
        }
        setError(getApiError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, q, statusFilter, ordering, reloadKey]);

  const leads = result?.results ?? [];
  const count = result?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const hasFilters = !!q || !!statusFilter;
  const allOnPage = leads.length > 0 && leads.every((l) => selected.has(l.id));
  const selectedIds = [...selected];

  if (loading && !result) {
    return <div className="loader"><span className="spinner" />Loading leads...</div>;
  }

  if (error && !result) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setShowForm(true);
  };

  const clearFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setPage(1);
  };

  const toggleAll = () => {
    if (allOnPage) {
      setSelected(new Set());
    } else {
      setSelected(new Set(leads.map((l) => l.id)));
    }
  };

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      // Collect every page that matches the current filters
      const rows: Lead[] = [];
      let p = 1;
      for (;;) {
        const res = await crmService.getLeads({
          page: p, page_size: 200, q, status: statusFilter, ordering,
        });
        rows.push(...res.results);
        if (!res.next) break;
        p += 1;
      }

      const header = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Value', 'Created'];
      const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const lines = [
        header.join(','),
        ...rows.map((l) =>
          [l.name, l.company, l.email, l.phone, l.status, l.value, l.created_at].map(escape).join(',')
        ),
      ];

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.show(`Exported ${rows.length} lead${rows.length === 1 ? '' : 's'} 🐾`);
    } catch (err) {
      toast.show(getApiError(err), 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>All Leads</h1>
          <p>
            {count} lead{count === 1 ? '' : 's'}
            {result && ` · ${formatINR(result.total_value)} in total`}
          </p>
        </div>
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search name, company, email..."
            className="input-field search-field"
            data-search-input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            className="input-field filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as LeadStatus | '');
              setPage(1);
            }}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="input-field filter-select"
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setPage(1);
            }}
            aria-label="Sort leads"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            className="btn btn-outline"
            onClick={exportCsv}
            disabled={exporting || count === 0}
            title="Download the leads that match these filters as a spreadsheet"
          >
            <Download size={16} /> {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button className="btn btn-primary" onClick={openCreate} title="New lead (N)">
            <Plus size={18} /> Add Lead
          </button>
        </div>
      </div>

      {error && result && <ErrorState compact message={error} onRetry={refresh} />}

      {selected.size > 0 && (
        <div className="bulk-bar">
          <span><strong>{selected.size}</strong> selected</span>
          <select
            className="input-field bulk-select"
            value=""
            aria-label="Set status for selected leads"
            onChange={(e) => {
              if (e.target.value) bulkStatus(selectedIds, e.target.value as LeadStatus);
            }}
          >
            <option value="">Set status…</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => bulkRemove(selectedIds)}>
            <Trash2 size={14} /> Delete selected
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setSelected(new Set())}>
            <X size={14} /> Clear
          </button>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="check-col">
                  <input
                    type="checkbox"
                    aria-label="Select all leads on this page"
                    checked={allOnPage}
                    onChange={toggleAll}
                  />
                </th>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Status</th>
                <th>Value</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-td">
                    {hasFilters ? (
                      <EmptyState
                        title="No matches"
                        message="Nothing fits those filters. Try a different search, or clear them."
                        action={
                          <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                            Clear filters
                          </button>
                        }
                      />
                    ) : (
                      <EmptyState
                        title="No leads yet"
                        message="Add your first lead and it will show up here."
                        action={
                          <button className="btn btn-primary btn-sm" onClick={openCreate}>
                            <Plus size={15} /> Add first lead
                          </button>
                        }
                      />
                    )}
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className={selected.has(lead.id) ? 'row-selected' : undefined}>
                  <td className="check-col">
                    <input
                      type="checkbox"
                      aria-label={`Select ${lead.name}`}
                      checked={selected.has(lead.id)}
                      onChange={() => toggleOne(lead.id)}
                    />
                  </td>
                  <td className="cell-name">
                    <Link to={`/leads/${lead.id}`} className="name-link">{lead.name}</Link>
                  </td>
                  <td>{lead.company}</td>
                  <td className="cell-muted">{lead.email}</td>
                  <td>
                    <StatusSelect value={lead.status} onChange={(s) => changeStatus(lead, s)} />
                  </td>
                  <td className="cell-money">{formatINR(lead.value)}</td>
                  <td className="col-actions">
                    <div className="action-group">
                      <button className="btn-icon" aria-label="Edit lead" title="Edit" onClick={() => openEdit(lead)}>
                        <Pencil size={15} />
                      </button>
                      <button className="btn-icon danger" aria-label="Delete lead" title="Delete" onClick={() => remove(lead.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {count > 0 && (
          <div className="pager">
            <span className="pager-info">
              Page {page} of {totalPages} · showing {leads.length} of {count}
            </span>
            <div className="pager-buttons">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages || loading}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

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