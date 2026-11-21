//src/components/Dashboard/ActivityFeed.tsx

const activities = [
  { id: 1, title: 'Acme Corp deal moved to Proposal', time: '2 hours ago', tone: 'pink' },
  { id: 2, title: 'Follow-up call with TechFlow', time: '4 hours ago', tone: 'lilac' },
  { id: 3, title: 'New lead added: Global Enterprises', time: 'Yesterday', tone: 'mint' },
  { id: 4, title: 'Contract sent to HealthPlus', time: 'Yesterday', tone: 'peach' },
];

export const ActivityFeed = () => (
  <div className="card">
    <div className="card-head">
      <h3>Deal Activity</h3>
      <button className="link-btn">View All</button>
    </div>
    <div className="activity-list">
      {activities.map((a) => (
        <div key={a.id} className="activity-item">
          <span className={`dot dot-${a.tone}`} />
          <div>
            <p className="activity-title">{a.title}</p>
            <p className="activity-time">{a.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);