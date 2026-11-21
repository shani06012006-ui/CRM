import { LayoutDashboard, Users, PieChart, Settings, LogOut, Rocket, Sparkles } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: PieChart, label: 'Pipeline', path: '/pipeline' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
        <Sparkles size={22} />
        <h4>Upgrade to Pro</h4>
        <p>Unlock advanced features</p>
        <button
          className="btn btn-primary btn-sm btn-block"
          onClick={() => toast.show('Pro plans are coming soon 🐾', 'info')}
        >
          Upgrade
        </button>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={20} />
        <span className="nav-label">Logout</span>
      </button>
    </aside>
  );
};