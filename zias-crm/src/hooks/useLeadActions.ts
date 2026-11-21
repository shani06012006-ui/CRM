import { crmService, getApiError } from '../services/crmService';
import { Lead, LeadStatus } from '../interfaces';
import { useToast } from '../context/ToastContext';

export const useLeadActions = (onChanged: () => void) => {
  const toast = useToast();

  const remove = async (id: number) => {
    if (!window.confirm('Delete this lead? This cannot be undone.')) return;
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

  return { remove, changeStatus };
};