//src/components/Dashboard/Header.tsx

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { crmService } from '../../services/crmService';
import { Lead } from '../../interfaces';
import { timeAgo } from '../../utils/format';

type Panel = 'bell' | 'mail' | null;

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: leads, refetch: refetchLeads } = useFetch<Lead[]>(crmService.getLeads);

  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState<Panel>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the open panel on outside click or Escape
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
    } else {
      setPanel(p);
      refetchLeads(); // keep the panels fresh when opened
    }
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/leads?q=${encodeURIComponent(q)}` : '/leads');
    setQuery('');
  };

  const openLead = (lead: Lead) => {
    navigate(`/leads?q=${encodeURIComponent(lead.name)}`);
    setPanel(null);
  };

  const allLeads = leads ?? [];
  const recentLeads = allLeads.slice(0, 5);
  const followUps = allLeads.filter((l) => l.status === 'New');

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
        />
      </form>

      <div className="topbar-right">
        <div className="topbar-icons" ref={wrapRef}>
          <div className="popover-anchor">
            <button className="icon-btn" aria-label="Recent activity" onClick={() => togglePanel('bell')}>
              <Bell size={19} />
            </button>
            {panel === 'bell' && (
              <div className="popover">
                <h4>Recent activity</h4>
                {recentLeads.length === 0 ? (
                  <p className="popover-empty">No leads yet 🐾</p>
                ) : (
                  <div className="popover-list">
                    {recentLeads.map((l) => (
                      <button key={l.id} className="popover-item" onClick={() => openLead(l)}>
                        <span>
                          {l.name}
                          <small>{l.company}</small>
                        </span>
                        <small>{timeAgo(l.created_at)}</small>
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
              {followUps.length > 0 && <span className="icon-count">{followUps.length}</span>}
            </button>
            {panel === 'mail' && (
              <div className="popover">
                <h4>Waiting for follow-up</h4>
                {followUps.length === 0 ? (
                  <p className="popover-empty">All caught up 🌿</p>
                ) : (
                  <div className="popover-list">
                    {followUps.slice(0, 5).map((l) => (
                      <button key={l.id} className="popover-item" onClick={() => openLead(l)}>
                        <span>
                          {l.name}
                          <small>{l.company}</small>
                        </span>
                        <small>{timeAgo(l.created_at)}</small>
                      </button>
                    ))}
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