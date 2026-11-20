import { LayoutDashboard, Users, PieChart, Settings, LogOut, Rocket } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const { logout } = useAuth();
  
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={20} />, label: 'Leads', path: '/leads' },
    { icon: <PieChart size={20} />, label: 'Pipeline', path: '/pipeline' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside style={{ width: '260px', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '40px', paddingLeft: '8px' }}>
        <Rocket size={28} /> SoftFire
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
              borderRadius: '10px', textDecoration: 'none', fontWeight: 500,
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--bg-main)' : 'transparent',
              transition: 'all 0.2s'
            })}
          >
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Upgrade to Pro</p>
          <p style={{ fontSize: '0.7rem', marginTop: '4px', marginBottom: '12px' }}>Unlock advanced features</p>
          <button className="btn btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.8rem', justifyContent: 'center' }}>Upgrade</button>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600, borderRadius: '10px' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
};