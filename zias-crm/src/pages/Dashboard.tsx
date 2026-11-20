import { useState } from 'react';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { PipelineTable } from '../components/Dashboard/PipelineTable';
import { ActivityFeed } from '../components/Dashboard/ActivityFeed';
import { Users, Briefcase, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { crmService } from '../services/crmService';
import { Lead, CreateLeadDTO } from '../interfaces';

export const Dashboard = () => {
  const { data: leads, loading, refetch } = useFetch<Lead[]>(crmService.getLeads);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateLeadDTO>({ name: '', company: '', email: '', phone: '', status: 'New', value: 0 });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      // In a real app, call API then refetch
      alert(`Lead ${id} deleted (Mock)`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crmService.createLead(formData);
      setShowForm(false);
      setFormData({ name: '', company: '', email: '', phone: '', status: 'New', value: 0 });
      refetch(); // Refresh list
    } catch (err) {
      alert('Error creating lead');
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>CRM Dashboard</h1>
          <p>Manage leads, pipeline, and sales efficiently.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Add New Lead
        </button>
      </div>

      {/* Create Lead Modal/Form */}
      {showForm && (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Create New Lead</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Name</label>
              <input className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Company</label>
              <input className="input-field" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" className="input-field" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Value ($)</label>
              <input type="number" className="input-field" required value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Save Lead</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <StatsCard title="Total Leads" value="2,486" icon={<Users size={20} />} trend="+12.5%" trendUp={true} />
        <StatsCard title="Open Deals" value="156" icon={<Briefcase size={20} />} trend="+8.1%" trendUp={true} />
        <StatsCard title="Revenue" value="$2.45M" icon={<DollarSign size={20} />} trend="+18.2%" trendUp={true} />
        <StatsCard title="Conversion Rate" value="24.8%" icon={<TrendingUp size={20} />} trend="-2.1%" trendUp={false} />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <PipelineTable leads={leads || []} onDelete={handleDelete} />
        <ActivityFeed />
      </div>
    </div>
  );
};