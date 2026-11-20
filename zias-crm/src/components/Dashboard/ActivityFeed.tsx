export const ActivityFeed = () => {
  const activities = [
    { id: 1, title: 'Acme Corp deal moved to Proposal', time: '2 hours ago', color: 'var(--primary)' },
    { id: 2, title: 'Follow-up call with TechFlow', time: '4 hours ago', color: 'var(--secondary)' },
    { id: 3, title: 'New lead added: Global Enterprises', time: 'Yesterday', color: 'var(--success)' },
    { id: 4, title: 'Contract sent to HealthPlus', time: 'Yesterday', color: 'var(--warning)' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: '24px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem' }}>Deal Activity</h3>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>View All</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activities.map((activity) => (
          <div key={activity.id} style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: activity.color, marginTop: '6px' }}></div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>{activity.title}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};