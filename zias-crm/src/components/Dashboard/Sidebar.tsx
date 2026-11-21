//src/components/Dashboard/Sidebar.tsx

import { LayoutDashboard, Users, PieChart, Settings, LogOut, Rocket, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: PieChart, label: 'Pipeline', path: '/pipeline' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Rocket size={22} /></div>
        <span className="brand-name nav-label">SoftFire</span>
      </div>

      <nav className="nav">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={20} />
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="upgrade-card">
        <Sparkles size={22} color="#f25aa3" />
        <h4>Upgrade to Pro</h4>
        <p>Unlock advanced features</p>
        <button className="btn btn-primary btn-sm btn-block">Upgrade</button>
      </div>

      <button className="logout-btn" onClick={logout}>
        <LogOut size={20} />
        <span className="nav-label">Logout</span>
      </button>
    </aside>
  );
};