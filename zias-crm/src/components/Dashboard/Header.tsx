//src/components/Dashboard/Header.tsx

import { Bell, Mail, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <label className="search-box">
        <Search size={18} />
        <input type="text" placeholder="Search anything..." />
      </label>

      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notifications"><Bell size={19} /></button>
        <button className="icon-btn" aria-label="Messages"><Mail size={19} /></button>
        <div className="user-chip">
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};