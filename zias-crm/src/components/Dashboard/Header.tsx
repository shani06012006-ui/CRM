import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Keyboard, Mail, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { SHORTCUTS_EVENT } from '../../hooks/useShortcuts';
import { crmService } from '../../services/crmService';
import { Activity, LeadPage } from '../../interfaces';
import { timeAgo } from '../../utils/format';

type Panel = 'bell' | 'mail' | null;

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: activities, refetch: refetchActivity } = useFetch<Activity[]>(
    () => crmService.getActivity(8)
  );

  const [followUps, setFollowUps] = useState<LeadPage | null>(null);

  const loadFollowUps = useCallback(() => {
    crmService
      .getLeads({ status: 'New', page_size: 5 })
      .then(setFollowUps)
      .catch(() => setFollowUps(null));
  }, []);

  // Reload the badge on mount and whenever the user moves to another page
  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps, location.pathname]);

  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState<Panel>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanel(null);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const togglePanel = (p: Exclude<Panel, null>) => {
    if (panel === p) {
      setPanel(null);
      return;
    }
    setPanel(p);
    if (p === 'bell') refetchActivity();
    else loadFollowUps();
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/leads?q=${encodeURIComponent(q)}` : '/leads');
    setQuery('');
    setPanel(null);
  };

  const openLeadByName = (name: string) => {
    navigate(`/leads?q=${encodeURIComponent(name)}`);
    setPanel(null);
  };

  const followUpCount = followUps?.count ?? 0;

  return (
    <header className="topbar">
      <form className="search-box" onSubmit={submitSearch} role="search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search leads, companies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search leads"
          data-search-input
        />
      </form>

      <div className="topbar-right">
        <div className="topbar-icons" ref={wrapRef}>
          <button
            className="icon-btn"
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
            onClick={() => window.dispatchEvent(new Event(SHORTCUTS_EVENT))}
          >
            <Keyboard size={19} />
          </button>

          <div className="popover-anchor">
            <button className="icon-btn" aria-label="Recent activity" onClick={() => togglePanel('bell')}>
              <Bell size={19} />
            </button>
            {panel === 'bell' && (
              <div className="popover">
                <h4>Recent activity</h4>
                {(activities ?? []).length === 0 ? (
                  <p className="popover-empty">No activity yet 🐾</p>
                ) : (
                  <div className="popover-list">
                    {(activities ?? []).map((a) => (
                      <button
                        key={a.id}
                        className="popover-item"
                        disabled={!a.lead}
                        onClick={() => openLeadByName(a.lead_name)}
                      >
                        <span>{a.description}</span>
                        <small>{timeAgo(a.created_at)}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="popover-anchor">
            <button className="icon-btn" aria-label="Leads waiting for follow-up" onClick={() => togglePanel('mail')}>
              <Mail size={19} />
              {followUpCount > 0 && <span className="icon-count">{followUpCount}</span>}
            </button>
            {panel === 'mail' && (
              <div className="popover">
                <h4>Waiting for follow-up</h4>
                {followUpCount === 0 ? (
                  <p className="popover-empty">All caught up 🌿</p>
                ) : (
                  <div className="popover-list">
                    {(followUps?.results ?? []).map((l) => (
                      <button key={l.id} className="popover-item" onClick={() => openLeadByName(l.name)}>
                        <span>
                          {l.name}
                          <small>{l.company}</small>
                        </span>
                        <small>{timeAgo(l.created_at)}</small>
                      </button>
                    ))}
                    {followUpCount > (followUps?.results.length ?? 0) && (
                      <button className="popover-item" onClick={() => { navigate('/leads?status=New'); setPanel(null); }}>
                        <span>View all {followUpCount} new leads</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

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