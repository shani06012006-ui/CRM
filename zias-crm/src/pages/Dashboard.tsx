//src/pages/Dashboard.tsx

import { useState } from 'react';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { PipelineTable } from '../components/Dashboard/PipelineTable';
import { ActivityFeed } from '../components/Dashboard/ActivityFeed';
import { Users, Briefcase, IndianRupee, TrendingUp, Plus } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { crmService } from '../services/crmService';
import { Lead, CreateLeadDTO, StatsData } from '../interfaces';
import { formatINR } from '../utils/format';

const emptyLead: CreateLeadDTO = { name: '', company: '', email: '', phone: '', status: 'New', value: 0 };

export const Dashboard = () => {
  const { data: leads, loading: leadsLoading, refetch: refetchLeads } = useFetch<Lead[]>(crmService.getLeads);
  const { data: stats, loading: statsLoading } = useFetch<StatsData>(crmService.getStats);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateLeadDTO>(emptyLead);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      await crmService.deleteLead(id);
      refetchLeads();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crmService.createLead(formData);
      setShowForm(false);
      setFormData(emptyLead);
      refetchLeads();
    } catch {
      alert('Error creating lead');
    }
  };

  if (leadsLoading || statsLoading) {
    return <div className="loader"><span className="spinner" />Loading your dashboard...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>CRM Dashboard</h1>
          <p>Manage leads, pipeline, and sales efficiently ✨</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Add New Lead
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3 className="form-title">Create New Lead</h3>
          <form onSubmit={handleCreate} className="form-grid">
            <div className="input-group">
              <label>Name</label>
              <input className="input-field" required value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Company</label>
              <input className="input-field" required value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" className="input-field" required value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Value (₹)</label>
              <input type="number" className="input-field" required value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Save Lead</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="stats-grid">
        <StatsCard title="Total Leads" value={String(stats?.totalLeads ?? 0)} icon={<Users size={20} />} trend="+0%" trendUp={true} />
        <StatsCard title="Open Deals" value={String(stats?.openDeals ?? 0)} icon={<Briefcase size={20} />} trend="+0%" trendUp={true} />
        <StatsCard title="Revenue" value={formatINR(stats?.revenue ?? 0)} icon={<IndianRupee size={20} />} trend="+0%" trendUp={true} />
        <StatsCard title="Conversion Rate" value={`${stats?.conversionRate ?? 0}%`} icon={<TrendingUp size={20} />} trend="+0%" trendUp={true} />
      </div>

      <div className="dash-grid">
        <PipelineTable leads={leads || []} onDelete={handleDelete} />
        <ActivityFeed />
      </div>
    </div>
  );
};