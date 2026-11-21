import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { authService, getApiError } from '../services/crmService';

interface ProfileForm {
  first_name: string;
  last_name: string;
  email: string;
}

export const Settings = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState<ProfileForm>({ first_name: '', last_name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load the saved values whenever the user changes
  useEffect(() => {
    if (user) {
      setForm({ first_name: user.first_name, last_name: user.last_name, email: user.email });
    }
  }, [user]);

  if (!user) return null;

  const dirty =
    form.first_name !== user.first_name ||
    form.last_name !== user.last_name ||
    form.email !== user.email;

  const reset = () => {
    setForm({ first_name: user.first_name, last_name: user.last_name, email: user.email });
    setError('');
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const updated = await authService.updateMe(form);
      updateUser(updated);
      toast.show('Settings saved ✨');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card settings-card">
      <h1>Settings</h1>
      <p className="muted" style={{ marginTop: 8 }}>Manage your account preferences.</p>

      {error && <div className="alert alert-error" style={{ marginTop: 20 }}>{error}</div>}

      <form className="settings-form" onSubmit={handleSave}>
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="first-name">First name</label>
            <input
              id="first-name"
              className="input-field"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label htmlFor="last-name">Last name</label>
            <input
              id="last-name"
              className="input-field"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            className="input-field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input id="username" className="input-field" value={user.username} readOnly />
        </div>

        <div className="input-group">
          <label htmlFor="role">Role</label>
          <input id="role" className="input-field" value={user.role} readOnly />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={!dirty || saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button type="button" className="btn btn-outline" onClick={reset} disabled={!dirty || saving}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};