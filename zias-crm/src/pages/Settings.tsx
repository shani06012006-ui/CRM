//src/pages/Settings.tsx

import { useAuth } from '../hooks/useAuth';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="card settings-card">
      <h1>Settings</h1>
      <p className="muted" style={{ marginTop: 8 }}>Manage your account preferences.</p>

      <div className="settings-form">
        <div className="input-group">
          <label>Display Name</label>
          <input type="text" className="input-field" value={user?.name ?? ''} readOnly />
        </div>
        <div className="input-group">
          <label>Email Address</label>
          <input type="email" className="input-field" value={user?.email ?? ''} readOnly />
        </div>
        <div className="input-group">
          <label>Role</label>
          <input type="text" className="input-field" value={user?.role ?? ''} readOnly />
        </div>
      </div>
    </div>
  );
};