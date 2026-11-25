import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft, Building2, CalendarDays, Check, Mail, Phone, Pencil, Plus,
  StickyNote, Trash2, Video,
} from 'lucide-react';
import { crmService, getApiError } from '../services/crmService';
import { Lead, Note, NoteKind, Task } from '../interfaces';
import { formatINR, timeAgo } from '../utils/format';
import { useLeadActions } from '../hooks/useLeadActions';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { ErrorState } from '../components/Common/ErrorState';
import { LeadFormModal } from '../components/Leads/LeadFormModal';
import { StatusSelect } from '../components/Leads/StatusSelect';

const KIND_META: Record<NoteKind, { label: string; icon: LucideIcon }> = {
  note: { label: 'Note', icon: StickyNote },
  call: { label: 'Call', icon: Phone },
  email: { label: 'Email', icon: Mail },
  meeting: { label: 'Meeting', icon: Video },
};

// Local date as YYYY-MM-DD, so "today" matches the user's clock, not UTC
const todayISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const formatDate = (value: string) => {
  const d = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const leadId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [showEdit, setShowEdit] = useState(false);

  const [noteKind, setNoteKind] = useState<NoteKind>('call');
  const [noteBody, setNoteBody] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);
  const { changeStatus } = useLeadActions(refresh);

  useEffect(() => {
    if (!Number.isInteger(leadId)) {
      setError('This lead link is not valid.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    Promise.all([
      crmService.getLead(leadId),
      crmService.getNotes(leadId),
      crmService.getTasks(leadId),
    ])
      .then(([l, n, t]) => {
        if (cancelled) return;
        setLead(l);
        setNotes(n);
        setTasks(t);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(getApiError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [leadId, reloadKey]);

  if (loading && !lead) {
    return <div className="loader"><span className="spinner" />Loading lead...</div>;
  }
  if (error && !lead) {
    return <ErrorState message={error} onRetry={refresh} />;
  }
  if (!lead) return null;

  const today = todayISO();
  const openTasks = tasks.filter((t) => !t.done).length;

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete ${lead.name}?`,
      message: 'Their activity log and follow-ups go too. This cannot be undone.',
      confirmLabel: 'Delete lead',
      danger: true,
    });
    if (!ok) return;
    try {
      await crmService.deleteLead(lead.id);
      toast.show('Lead deleted', 'info');
      navigate('/leads');
    } catch (err) {
      toast.show(getApiError(err), 'error');
    }
  };

  const addNote = async (e: FormEvent) => {
    e.preventDefault();
    const body = noteBody.trim();
    if (!body) return;
    setSavingNote(true);
    try {
      await crmService.addNote({ lead: lead.id, kind: noteKind, body });
      setNoteBody('');
      toast.show('Entry saved 🐾');
      refresh();
    } catch (err) {
      toast.show(getApiError(err), 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const removeNote = async (noteId: number) => {
    const ok = await confirm({
      title: 'Delete this entry?',
      message: 'Entries are removed for good.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await crmService.deleteNote(noteId);
      refresh();
    } catch (err) {
      toast.show(getApiError(err), 'error');
    }
  };

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    setSavingTask(true);
    try {
      await crmService.addTask({ lead: lead.id, title, due_date: taskDue || null });
      setTaskTitle('');
      setTaskDue('');
      toast.show('Follow-up added ✨');
      refresh();
    } catch (err) {
      toast.show(getApiError(err), 'error');
    } finally {
      setSavingTask(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await crmService.updateTask(task.id, { done: !task.done });
      if (!task.done) toast.show('Nice work, task done 🌿');
      refresh();
    } catch (err) {
      toast.show(getApiError(err), 'error');
    }
  };

  const removeTask = async (taskId: number) => {
    const ok = await confirm({
      title: 'Remove this follow-up?',
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    try {
      await crmService.deleteTask(taskId);
      refresh();
    } catch (err) {
      toast.show(getApiError(err), 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/leads" className="back-link">
            <ArrowLeft size={16} /> All leads
          </Link>
          <h1 style={{ marginTop: 10 }}>{lead.name}</h1>
          <p>{lead.company} · {formatINR(lead.value)}</p>
        </div>
        <div className="toolbar">
          <button
            className="btn btn-outline"
            onClick={() => setShowEdit(true)}
            title="Edit lead (Ctrl + Enter saves)"
          >
            <Pencil size={16} /> Edit
          </button>
          <button className="btn btn-ghost" onClick={handleDelete}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {error && <ErrorState compact message={error} onRetry={refresh} />}

      <div className="detail-layout">
        <aside className="card detail-profile">
          <div className="detail-avatar">{lead.name.charAt(0).toUpperCase()}</div>
          <h3>{lead.name}</h3>
          <p className="muted">{lead.company}</p>

          <div className="detail-status">
            <span className="detail-label">Stage</span>
            <StatusSelect value={lead.status} onChange={(s) => changeStatus(lead, s)} />
          </div>

          <dl className="detail-facts">
            <div>
              <dt><Mail size={14} /> Email</dt>
              <dd><a href={`mailto:${lead.email}`}>{lead.email}</a></dd>
            </div>
            <div>
              <dt><Phone size={14} /> Phone</dt>
              <dd>{lead.phone || '—'}</dd>
            </div>
            <div>
              <dt><Building2 size={14} /> Company</dt>
              <dd>{lead.company}</dd>
            </div>
            <div>
              <dt><CalendarDays size={14} /> Added</dt>
              <dd>{formatDate(lead.created_at)}</dd>
            </div>
            {lead.closed_at && (
              <div>
                <dt><CalendarDays size={14} /> Closed</dt>
                <dd>{formatDate(lead.closed_at)}</dd>
              </div>
            )}
          </dl>
        </aside>

        <div className="detail-main">
          <div className="card">
            <div className="card-head">
              <h3>Activity log</h3>
              <span className="muted small">{notes.length} entries</span>
            </div>

            <form className="composer" onSubmit={addNote}>
              <div className="kind-chips" role="radiogroup" aria-label="Entry type">
                {(Object.keys(KIND_META) as NoteKind[]).map((k) => {
                  const Icon = KIND_META[k].icon;
                  return (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={noteKind === k}
                      className={`kind-chip${noteKind === k ? ' active' : ''}`}
                      onClick={() => setNoteKind(k)}
                    >
                      <Icon size={14} /> {KIND_META[k].label}
                    </button>
                  );
                })}
              </div>
              <textarea
                className="input-field composer-text"
                rows={3}
                maxLength={2000}
                placeholder="What happened? e.g. Called, left voicemail, agreed on a demo on Friday…"
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
              />
              <div className="composer-foot">
                <span className="muted small">{noteBody.length}/2000</span>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!noteBody.trim() || savingNote}
                >
                  {savingNote ? 'Saving...' : 'Add entry'}
                </button>
              </div>
            </form>

            {notes.length === 0 ? (
              <p className="empty-block">No activity yet. Log your first call or note above 🐾</p>
            ) : (
              <ol className="timeline">
                {notes.map((n) => {
                  const meta = KIND_META[n.kind];
                  const Icon = meta.icon;
                  return (
                    <li key={n.id} className="timeline-item" data-kind={n.kind}>
                      <span className="timeline-icon"><Icon size={15} /></span>
                      <div className="timeline-body">
                        <div className="timeline-head">
                          <strong>{meta.label}</strong>
                          <span className="muted small">{timeAgo(n.created_at)}</span>
                          <button
                            className="btn-icon danger sm"
                            aria-label="Delete entry"
                            title="Delete entry"
                            onClick={() => removeNote(n.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <p>{n.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Follow-up tasks</h3>
              <span className="muted small">{openTasks} open</span>
            </div>

            <form className="task-form" onSubmit={addTask}>
              <input
                className="input-field"
                placeholder="e.g. Send pricing deck"
                value={taskTitle}
                maxLength={255}
                onChange={(e) => setTaskTitle(e.target.value)}
                aria-label="Task title"
              />
              <input
                type="date"
                className="input-field"
                min={today}
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
                aria-label="Due date"
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={!taskTitle.trim() || savingTask}>
                <Plus size={15} /> Add task
              </button>
            </form>

            {tasks.length === 0 ? (
              <p className="empty-block">No follow-ups scheduled.</p>
            ) : (
              <ul className="task-list">
                {tasks.map((t) => {
                  const overdue = !t.done && !!t.due_date && t.due_date < today;
                  return (
                    <li
                      key={t.id}
                      className={`task-row${t.done ? ' done' : ''}${overdue ? ' overdue' : ''}`}
                    >
                      <button
                        className="task-check"
                        onClick={() => toggleTask(t)}
                        aria-label={t.done ? 'Mark as open' : 'Mark as done'}
                      >
                        {t.done && <Check size={14} />}
                      </button>
                      <div className="task-text">
                        <span>{t.title}</span>
                        {t.due_date && (
                          <small>{overdue ? 'Overdue · ' : 'Due '}{formatDate(t.due_date)}</small>
                        )}
                      </div>
                      <button
                        className="btn-icon danger sm"
                        aria-label="Delete task"
                        title="Delete task"
                        onClick={() => removeTask(t.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <LeadFormModal
          lead={lead}
          onClose={() => setShowEdit(false)}
          onSaved={refresh}
        />
      )}
    </div>
  );
};