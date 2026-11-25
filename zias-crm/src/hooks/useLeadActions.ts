import { crmService, getApiError } from '../services/crmService';
import { Lead, LeadStatus } from '../interfaces';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export const useLeadActions = (onChanged: () => void) => {
  const toast = useToast();
  const confirm = useConfirm();

  const remove = async (id: number) => {
    const ok = await confirm({
      title: 'Delete this lead?',
      message: 'Their notes and follow-ups go too. This cannot be undone.',
      confirmLabel: 'Delete lead',
      danger: true,
    });
    if (!ok) return;
    try {
      await crmService.deleteLead(id);
      toast.show('Lead deleted', 'info');
      onChanged();
    } catch (err) {
      toast.show(getApiError(err), 'error');
    }
  };

  const changeStatus = async (lead: Lead, status: LeadStatus) => {
    if (status === lead.status) return;
    try {
      await crmService.updateLead(lead.id, { status });
      toast.show(`Moved to ${status} 🐾`);
      onChanged();
    } catch (err) {
      toast.show(getApiError(err), 'error');
    }
  };

  const bulkRemove = async (ids: number[]) => {
    if (ids.length === 0) return;
    const ok = await confirm({
      title: `Delete ${plural(ids.length, 'lead')}?`,
      message: 'Their notes and follow-ups go too. This cannot be undone.',
      confirmLabel: `Delete ${ids.length}`,
      danger: true,
    });
    if (!ok) return;

    const results = await Promise.allSettled(ids.map((id) => crmService.deleteLead(id)));
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed) {
      toast.show(`${ids.length - failed} deleted, ${failed} failed`, 'error');
    } else {
      toast.show(`${plural(ids.length, 'lead')} deleted`, 'info');
    }
    onChanged();
  };

  const bulkStatus = async (ids: number[], status: LeadStatus) => {
    if (ids.length === 0) return;
    const results = await Promise.allSettled(
      ids.map((id) => crmService.updateLead(id, { status }))
    );
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed) {
      toast.show(`${ids.length - failed} updated, ${failed} failed`, 'error');
    } else {
      toast.show(`${plural(ids.length, 'lead')} moved to ${status} 🐾`);
    }
    onChanged();
  };

  return { remove, changeStatus, bulkRemove, bulkStatus };
};