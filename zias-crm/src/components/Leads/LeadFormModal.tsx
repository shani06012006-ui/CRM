import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { CreateLeadDTO, Lead, STATUSES, LeadStatus } from '../../interfaces';
import { crmService, getApiError } from '../../services/crmService';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const emptyForm: CreateLeadDTO = {
  name: '',
  company: '',
  email: '',
  phone: '',
  status: 'New',
  value: 0,
};

const toForm = (lead: Lead | null): CreateLeadDTO =>
  lead
    ? {
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone ?? '',
        status: lead.status,
        value: Number(lead.value),
      }
    : emptyForm;

interface LeadFormModalProps {
  lead: Lead | null; // null = create, Lead = edit
  onClose: () => void;
  onSaved: () => void;
}

export const LeadFormModal = ({ lead, onClose, onSaved }: LeadFormModalProps) => {
  const toast = useToast();
  const confirm = useConfirm();
  const isEdit = !!lead;
  const formRef = useRef<HTMLFormElement>(null);

  const [initial] = useState<CreateLeadDTO>(() => toForm(lead));
  const [form, setForm] = useState<CreateLeadDTO>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  // Closing with unsaved edits asks first
  const tryClose = useCallback(async () => {
    if (isDirty) {
      const discard = await confirm({
        title: 'Discard your changes?',
        message: 'You have unsaved changes in this form.',
        confirmLabel: 'Discard',
        cancelLabel: 'Keep editing',
        danger: true,
      });
      if (!discard) return;
    }
    onClose();
  }, [isDirty, onClose, confirm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        tryClose();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    document.addEventListener('keydown', onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [tryClose]);

  // Warn before refreshing or leaving the page with unsaved edits
  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const update = <K extends keyof CreateLeadDTO>(key: K, value: CreateLeadDTO[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (lead) {
        await crmService.updateLead(lead.id, form);
        toast.show('Lead updated 💛');
      } else {
        await crmService.createLead(form);
        toast.show('New lead added 🐾');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={tryClose}>
      <div
        className="card modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit lead' : 'Add lead'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>{isEdit ? 'Edit lead' : 'Add a new lead'}</h3>
          <button type="button" className="icon-btn" onClick={tryClose} aria-label="Close" title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="form-grid modal-body">
          <div className="input-group">
            <label htmlFor="lead-name">Name</label>
            <input
              id="lead-name"
              className="input-field"
              required
              autoFocus
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="lead-company">Company</label>
            <input
              id="lead-company"
              className="input-field"
              required
              value={form.company}
              onChange={(e) => update('company', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="lead-email">Email</label>
            <input
              id="lead-email"
              type="email"
              className="input-field"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="lead-phone">Phone</label>
            <input
              id="lead-phone"
              className="input-field"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="lead-status">Status</label>
            <select
              id="lead-status"
              className="input-field"
              value={form.status}
              onChange={(e) => update('status', e.target.value as LeadStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="lead-value">Value (₹)</label>
            <input
              id="lead-value"
              type="number"
              min={0}
              step="1"
              className="input-field"
              required
              value={form.value}
              onChange={(e) => update('value', Number(e.target.value))}
            />
          </div>

          {error && <div className="alert alert-error form-full">{error}</div>}

          <div className="form-actions form-full">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Save lead'}
            </button>
            <button type="button" className="btn btn-outline" onClick={tryClose}>
              Cancel
            </button>
            <span className="form-hint">
              <kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">Enter</kbd> saves
            </span>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};