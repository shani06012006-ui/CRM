import { useState } from 'react';
import { Users, Briefcase, IndianRupee, TrendingUp, Plus } from 'lucide-react';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { PipelineTable } from '../components/Dashboard/PipelineTable';
import { ActivityFeed } from '../components/Dashboard/ActivityFeed';
import { LeadFormModal } from '../components/Leads/LeadFormModal';
import { useFetch } from '../hooks/useFetch';
import { useLeadActions } from '../hooks/useLeadActions';
import { crmService } from '../services/crmService';
import { Lead, StatsData } from '../interfaces';
import { formatINR } from '../utils/format';

export const Dashboard = () => {
  const { data: leads, loading: leadsLoading, refetch: refetchLeads } = useFetch<Lead[]>(crmService.getLeads);
  const { data: stats, loading: statsLoading, refetch: refetchStats } = useFetch<StatsData>(crmService.getStats);

  const refreshAll = () => {
    refetchLeads();
    refetchStats();
  };
  const { remove, changeStatus } = useLeadActions(refreshAll);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setShowForm(true);
  };

  if (leadsLoading || statsLoading) {
    return <div className="loader"><span className="spinner" />Loading your dashboard...</div>;
  }

  const trend = stats?.leadsTrend ?? 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>CRM Dashboard</h1>
          <p>Manage leads, pipeline, and sales efficiently ✨</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add New Lead
        </button>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Total Leads"
          value={String(stats?.totalLeads ?? 0)}
          icon={<Users size={20} />}
          trend={{ value: `${Math.abs(trend)}%`, up: trend >= 0 }}
        />
        <StatsCard
          title="Open Deals"
          value={String(stats?.openDeals ?? 0)}
          icon={<Briefcase size={20} />}
          sub="Not closed yet"
        />
        <StatsCard
          title="Revenue"
          value={formatINR(stats?.revenue ?? 0)}
          icon={<IndianRupee size={20} />}
          sub="From closed deals"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats?.conversionRate ?? 0}%`}
          icon={<TrendingUp size={20} />}
          sub="Closed out of all leads"
        />
      </div>

      <div className="dash-grid">
        <PipelineTable
          leads={leads ?? []}
          onEdit={openEdit}
          onDelete={remove}
          onStatusChange={changeStatus}
        />
        <ActivityFeed leads={leads ?? []} />
      </div>

      {showForm && (
        <LeadFormModal
          key={editing?.id ?? 'new'}
          lead={editing}
          onClose={() => setShowForm(false)}
          onSaved={refreshAll}
        />
      )}
    </div>
  );
};