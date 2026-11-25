import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { authService, getApiError } from '../services/crmService';

interface ProfileForm {
  first_name: string;
  last_name: string;
  email: string;
}

interface PasswordForm {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

// 0 to 5, based on length, mixed case, digits, and symbols
const scorePassword = (p: string): number => {
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  // Anything under 8 characters can't be stronger than "Weak"
  if (p.length < 8) score = Math.min(score, 1);
  return score;
};

const PasswordField = ({
  id, label, value, onChange, autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-group">
      <label htmlFor={id}>{label}</label>
      <div className="pw-field">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="input-field"
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
};

export const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileForm>({ first_name: '', last_name: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [pw, setPw] = useState<PasswordForm>({ old_password: '', new_password: '', confirm_password: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({ first_name: user.first_name, last_name: user.last_name, email: user.email });
    }
  }, [user]);

  if (!user) return null;

  const profileDirty =
    profile.first_name !== user.first_name ||
    profile.last_name !== user.last_name ||
    profile.email !== user.email;

  const resetProfile = () => {
    setProfile({ first_name: user.first_name, last_name: user.last_name, email: user.email });
    setProfileError('');
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setSavingProfile(true);
    try {
      const updated = await authService.updateMe(profile);
      updateUser(updated);
      toast.show('Profile saved ✨');
    } catch (err) {
      setProfileError(getApiError(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const score = scorePassword(pw.new_password);
  const reqs = {
    length: pw.new_password.length >= 8,
    differs: !!pw.new_password && pw.new_password !== pw.old_password,
    matches: !!pw.confirm_password && pw.new_password === pw.confirm_password,
  };
  const canSubmitPw = !!pw.old_password && reqs.length && reqs.differs && reqs.matches;

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmitPw) return;
    setPwError('');
    setSavingPw(true);
    try {
      await authService.changePassword(pw);
      toast.show('Password changed. Please sign in again 🔐', 'info');
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setPwError(getApiError(err));
    } finally {
      setSavingPw(false);
    }
  };

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="settings-stack">
      <section className="card settings-section">
        <div className="section-head">
          <div>
            <h1>Settings</h1>
            <p className="muted">Manage your account and security.</p>
          </div>
          <span className="role-badge">
            <ShieldCheck size={15} /> {user.role}
          </span>
        </div>

        {profileError && <div className="alert alert-error">{profileError}</div>}

        <form className="settings-form" onSubmit={saveProfile}>
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="first-name">First name</label>
              <input
                id="first-name"
                className="input-field"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label htmlFor="last-name">Last name</label>
              <input
                id="last-name"
                className="input-field"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input id="username" className="input-field" value={user.username} readOnly />
            </div>
            <div className="input-group">
              <label htmlFor="role">Role</label>
              <input id="role" className="input-field" value={user.role} readOnly />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={!profileDirty || savingProfile}>
              {savingProfile ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className="btn btn-outline" onClick={resetProfile} disabled={!profileDirty || savingProfile}>
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="card settings-section">
        <div className="section-head">
          <div>
            <h3><KeyRound size={18} className="inline-icon" /> Change password</h3>
            <p className="muted">Changing your password signs you out on every device.</p>
          </div>
        </div>

        {pwError && <div className="alert alert-error">{pwError}</div>}

        <form className="settings-form" onSubmit={changePassword} autoComplete="off">
          <PasswordField
            id="old-password"
            label="Current password"
            value={pw.old_password}
            autoComplete="current-password"
            onChange={(v) => setPw({ ...pw, old_password: v })}
          />

          <PasswordField
            id="new-password"
            label="New password"
            value={pw.new_password}
            autoComplete="new-password"
            onChange={(v) => setPw({ ...pw, new_password: v })}
          />

          {pw.new_password && (
            <div className="pw-meter" data-score={score}>
              <div className="meter-track">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`meter-seg${i <= score ? ' on' : ''}`} />
                ))}
              </div>
              <span className="meter-label">{STRENGTH_LABELS[score]}</span>
            </div>
          )}

          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            value={pw.confirm_password}
            autoComplete="new-password"
            onChange={(v) => setPw({ ...pw, confirm_password: v })}
          />

          <ul className="req-list">
            <li className={reqs.length ? 'ok' : ''}>At least 8 characters</li>
            <li className={reqs.differs ? 'ok' : ''}>Different from your current password</li>
            <li className={reqs.matches ? 'ok' : ''}>Both entries match</li>
          </ul>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={!canSubmitPw || savingPw}>
              {savingPw ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </section>

      <section className="card settings-section">
        <div className="section-head">
          <div>
            <h3>Session</h3>
            <p className="muted">Sign out of this browser. Your data stays safe.</p>
          </div>
          <button className="btn btn-outline" onClick={signOut}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </section>
    </div>
  );
};