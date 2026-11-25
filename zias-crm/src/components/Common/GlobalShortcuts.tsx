import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Keyboard, X } from 'lucide-react';
import { NEW_LEAD_EVENT, SHORTCUTS_EVENT } from '../../hooks/useShortcuts';

const GO_TO: Record<string, string> = {
  d: '/dashboard',
  l: '/leads',
  p: '/pipeline',
  s: '/settings',
};

const LIST_PAGES = ['/dashboard', '/leads', '/pipeline'];

const SHORTCUT_ROWS: { keys: string[]; label: string }[] = [
  { keys: ['/'], label: 'Focus search' },
  { keys: ['N'], label: 'New lead' },
  { keys: ['G', 'D'], label: 'Go to Dashboard' },
  { keys: ['G', 'L'], label: 'Go to Leads' },
  { keys: ['G', 'P'], label: 'Go to Pipeline' },
  { keys: ['G', 'S'], label: 'Go to Settings' },
  { keys: ['Ctrl', 'Enter'], label: 'Save the open form' },
  { keys: ['?'], label: 'Show or hide this list' },
  { keys: ['Esc'], label: 'Close a dialog' },
];

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

export const GlobalShortcuts = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);
  // Non-null while waiting for the second key of a "G then ..." sequence
  const gTimer = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (gTimer.current !== null) {
        window.clearTimeout(gTimer.current);
        gTimer.current = null;
        if (GO_TO[key]) {
          e.preventDefault();
          navigate(GO_TO[key]);
        }
        return;
      }

      if (key === 'g') {
        gTimer.current = window.setTimeout(() => {
          gTimer.current = null;
        }, 1000);
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (input) {
          input.focus();
          input.select();
        } else {
          navigate('/leads');
          window.setTimeout(() => {
            document.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
          }, 250);
        }
        return;
      }

      if (key === 'n') {
        e.preventDefault();
        if (LIST_PAGES.includes(pathname)) {
          window.dispatchEvent(new Event(NEW_LEAD_EVENT));
        } else {
          navigate('/leads');
          window.setTimeout(() => window.dispatchEvent(new Event(NEW_LEAD_EVENT)), 250);
        }
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setHelpOpen((open) => !open);
        return;
      }

      if (e.key === 'Escape' && helpOpen) {
        setHelpOpen(false);
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate, pathname, helpOpen]);

  // The header button dispatches this event to open the list
  useEffect(() => {
    const toggle = () => setHelpOpen((open) => !open);
    window.addEventListener(SHORTCUTS_EVENT, toggle);
    return () => window.removeEventListener(SHORTCUTS_EVENT, toggle);
  }, []);

  if (!helpOpen) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={() => setHelpOpen(false)}>
      <div
        className="card shortcut-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shortcut-head">
          <h3>
            <Keyboard size={20} className="inline-icon" /> Keyboard shortcuts
          </h3>
          <button className="icon-btn" aria-label="Close" onClick={() => setHelpOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="shortcut-list">
          {SHORTCUT_ROWS.map((row) => (
            <div key={row.label} className="shortcut-row">
              <span>{row.label}</span>
              <span className="shortcut-keys">
                {row.keys.map((k, i) => (
                  <span key={`${row.label}-${k}`} className="shortcut-key">
                    {i > 0 && (
                      <span className="then">{row.keys[0] === 'G' ? 'then' : '+'}</span>
                    )}
                    <kbd className="kbd">{k}</kbd>
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};