//src/components/Dashboard/ActivityFeed.tsx

import { useNavigate } from 'react-router-dom';
import { Activity } from '../../interfaces';
import { timeAgo } from '../../utils/format';

interface ActivityFeedProps {
  activities: Activity[];
}

const toneFor: Record<Activity['action'], string> = {
  created: 'dot-mint',
  updated: 'dot-lilac',
  status_changed: 'dot-pink',
  deleted: 'dot-peach',
};

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const navigate = useNavigate();

  const openLead = (activity: Activity) => {
    if (!activity.lead) return; // deleted leads have nothing to open
    navigate(`/leads?q=${encodeURIComponent(activity.lead_name)}`);
  };

  return (
    <div className="card">
      <div className="card-head">
        <h3>Deal Activity</h3>
        <button className="link-btn" onClick={() => navigate('/leads')}>View All</button>
      </div>

      <div className="activity-list">
        {activities.length === 0 && (
          <p className="muted">No activity yet. Add a lead to see it here ✨</p>
        )}
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="activity-item"
            role={activity.lead ? 'button' : undefined}
            tabIndex={activity.lead ? 0 : undefined}
            onClick={() => openLead(activity)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') openLead(activity);
            }}
          >
            <span className={`dot ${toneFor[activity.action]}`} />
            <div>
              <p className="activity-title">{activity.description}</p>
              <p className="activity-time">{timeAgo(activity.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};