//src/pages/Leads.tsx

import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import crmService from '../services/crmService';
import { Lead } from '../interfaces';
import { formatINR } from '../utils/format';

export const Leads = () => {
  const { data: leads, loading, refetch } = useFetch<Lead[]>(crmService.getLeads);
  const [searchTerm, setSearchTerm] = useState('');

  const term = searchTerm.toLowerCase();
  const filteredLeads = leads?.filter(
    (l) => l.name.toLowerCase().includes(term) || l.company.toLowerCase().includes(term)
  ) ?? [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this lead?')) {
      await crmService.deleteLead(id);
      refetch();
    }
  };

  if (loading) return <div className="loader"><span className="spinner" />Loading leads...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>All Leads</h1>
          <p>{filteredLeads.length} lead{filteredLeads.length === 1 ? '' : 's'} found</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or company..."
          className="input-field search-field"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 && (
                <tr><td colSpan={6} className="empty-cell">No matching leads 🌸</td></tr>
              )}
              {filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="cell-name">{lead.name}</td>
                  <td>{lead.company}</td>
                  <td className="cell-muted">{lead.email}</td>
                  <td><span className="badge" data-status={lead.status}>{lead.status}</span></td>
                  <td className="cell-money">{formatINR(lead.value)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(lead.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};