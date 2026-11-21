//src/pages/PipelineTable.tsx

import { Lead } from '../interfaces';

interface PipelineTableProps {
  leads: Lead[];
  onDelete: (id: string) => void;
}

export const PipelineTable = ({ leads, onDelete }: PipelineTableProps) => {
  const getStatusColor = (status: Lead['status']) => {
    switch(status) {
      case 'New': return { bg: '#e3f2fd', color: '#1976d2' };
      case 'Qualified': return { bg: '#e8f5e9', color: '#2e7d32' };
      case 'Proposal': return { bg: '#fff3e0', color: '#f57c00' };
      case 'Negotiation': return { bg: '#f3e5f5', color: '#7b1fa2' };
      case 'Closed': return { bg: '#ffebee', color: '#c62828' };
      default: return { bg: '#f5f5f5', color: '#616161' };
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem' }}>Recent Leads</h3>
        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>View All</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <th style={{ padding: '16px 24px', fontWeight: 500 }}>Name</th>
            <th style={{ padding: '16px 24px', fontWeight: 500 }}>Company</th>
            <th style={{ padding: '16px 24px', fontWeight: 500 }}>Status</th>
            <th style={{ padding: '16px 24px', fontWeight: 500 }}>Value</th>
            <th style={{ padding: '16px 24px', fontWeight: 500 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const statusStyle = getStatusColor(lead.status);
            return (
              <tr key={lead.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>{lead.name}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{lead.company}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                    {lead.status}
                  </span>
                </td>
                {/* Changed to Rupee symbol */}
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>₹{lead.value.toLocaleString()}</td>
                <td style={{ padding: '16px 24px' }}>
                  <button onClick={() => onDelete(lead.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};