import { useState } from 'react';
import { Users, Briefcase, IndianRupee, TrendingUp, Plus } from 'lucide-react';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { PipelineTable } from '../components/Dashboard/PipelineTable';
import { ActivityFeed } from '../components/Dashboard/ActivityFeed';
import { LeadFormModal } from '../components/Leads/LeadFormModal';
import { ErrorState } from '../components/Common/ErrorState';
import { useFetch } from '../hooks/useFetch';
import { useLeadActions } from '../hooks/useLeadActions';
import { useOnNewLead } from '../hooks/useShortcuts';
import { crmService } from '../services/crmService';
import { Activity, Lead, LeadPage, StatsData } from '../interfaces';
import { formatINR, formatTrend } from '../utils/format';

export const Dashboard = () => {
  const {
    data: leads, error: leadsError, loading: leadsLoading, refetch: refetchLeads,
  } = useFetch<LeadPage>(() => crmService.getLeads({ page_size: 5 }));

  const {
    data: stats, error: statsError, loading: statsLoading, refetch: refetchStats,
  } = useFetch<StatsData>(crmService.getStats);

  const {
    data: activities, error: activityError, loading: activityLoading, refetch: refetchActivity,
  } = useFetch<Activity[]>(() => crmService.getActivity(8));

  const refreshAll = () => {
    refetchLeads();
    refetchStats();
    refetchActivity();
  };

  const { remove, changeStatus } = useLeadActions(refreshAll);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  // Pressing N anywhere opens the form on this page
  useOnNewLead(() => {
    setEditing(null);
    setShowForm(true);
  });

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setShowForm(true);
  };

  if (leadsLoading || statsLoading || activityLoading) {
    return <div className="loader"><span className="spinner" />Loading your dashboard...</div>;
  }

  const statsFailed = !!statsError && !stats;
  const leadsFailed = !!leadsError && !leads;
  const activityFailed = !!activityError && !activities;
  const staleData =
    (!!leadsError && !!leads) || (!!statsError && !!stats) || (!!activityError && !!activities);

  const trends = stats?.trends;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>CRM Dashboard</h1>
          <p>Manage leads, pipeline, and sales efficiently ✨</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} title="New lead (N)">
          <Plus size={18} /> Add New Lead
        </button>
      </div>

      {staleData && (
        <ErrorState
          compact
          message="Some sections couldn't refresh, so the numbers may be a little behind."
          onRetry={refreshAll}
        />
      )}

      {statsFailed ? (
        <ErrorState message={statsError!} onRetry={refetchStats} />
      ) : (
        <div className="stats-grid">
          <StatsCard
            title="Total Leads"
            value={String(stats?.totalLeads ?? 0)}
            icon={<Users size={20} />}
            trend={trends ? formatTrend(trends.totalLeads) : undefined}
          />
          <StatsCard
            title="Open Deals"
            value={String(stats?.openDeals ?? 0)}
            icon={<Briefcase size={20} />}
            trend={trends ? formatTrend(trends.openDeals) : undefined}
          />
          <StatsCard
            title="Revenue"
            value={formatINR(stats?.revenue ?? 0)}
            icon={<IndianRupee size={20} />}
            trend={trends ? formatTrend(trends.revenue) : undefined}
          />
          <StatsCard
            title="Conversion Rate"
            value={`${stats?.conversionRate ?? 0}%`}
            icon={<TrendingUp size={20} />}
            trend={trends ? formatTrend(trends.conversionRate, 'pts') : undefined}
          />
        </div>
      )}

      <div className="dash-grid">
        {leadsFailed ? (
          <ErrorState message={leadsError!} onRetry={refetchLeads} />
        ) : (
          <PipelineTable
            leads={leads?.results ?? []}
            onEdit={openEdit}
            onDelete={remove}
            onStatusChange={changeStatus}
          />
        )}

        {activityFailed ? (
          <ErrorState message={activityError!} onRetry={refetchActivity} />
        ) : (
          <ActivityFeed activities={activities ?? []} />
        )}
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