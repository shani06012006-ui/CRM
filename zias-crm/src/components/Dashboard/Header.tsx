import { Bell, Mail, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header style={{ height: '80px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-main)', padding: '10px 16px', borderRadius: '10px', width: '300px' }}>
        <Search size={18} color="var(--text-muted)" />
        <input type="text" placeholder="Search anything..." style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '0.9rem' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
          <Bell size={20} style={{ cursor: 'pointer' }} />
          <Mail size={20} style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
            {user?.name.charAt(0)}
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name}</p>
            <p style={{ fontSize: '0.75rem' }}>{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};