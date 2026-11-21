//src/components/Dashboard/ActivityFeed.tsx

import { useNavigate } from 'react-router-dom';
import { Lead } from '../../interfaces';
import { timeAgo } from '../../utils/format';

interface ActivityFeedProps {
  leads: Lead[];
}

export const ActivityFeed = ({ leads }: ActivityFeedProps) => {
  const navigate = useNavigate();

  const recent = [...leads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="card">
      <div className="card-head">
        <h3>Deal Activity</h3>
        <button className="link-btn" onClick={() => navigate('/leads')}>View All</button>
      </div>

      <div className="activity-list">
        {recent.length === 0 && (
          <p className="muted">No activity yet. Add a lead to see it here ✨</p>
        )}
        {recent.map((lead) => (
          <div
            key={lead.id}
            className="activity-item"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/leads?q=${encodeURIComponent(lead.name)}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(`/leads?q=${encodeURIComponent(lead.name)}`);
            }}
          >
            <span className="dot" data-status={lead.status} />
            <div>
              <p className="activity-title">{lead.name} from {lead.company} was added</p>
              <p className="activity-time">{lead.status} · {timeAgo(lead.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};