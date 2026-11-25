import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback<ConfirmFn>(
    (opts) => {
      // If a dialog is already open, answer it with "no" before opening the new one
      resolver.current?.(false);
      return new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setOptions(opts);
      });
    },
    []
  );

  // Capture phase on window, so Escape closes this dialog only and
  // doesn't also close the form underneath it
  useEffect(() => {
    if (!options) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [options, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options &&
        createPortal(
          <div className="modal-backdrop confirm-backdrop" onClick={() => close(false)}>
            <div
              className="card confirm-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`confirm-icon${options.danger ? ' danger' : ''}`}>
                <AlertTriangle size={22} />
              </div>
              <h3 id="confirm-title">{options.title}</h3>
              {options.message && <p className="confirm-msg">{options.message}</p>}
              <div className="confirm-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => close(false)}
                  autoFocus={!!options.danger}
                >
                  {options.cancelLabel ?? 'Cancel'}
                </button>
                <button
                  className={`btn ${options.danger ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => close(true)}
                  autoFocus={!options.danger}
                >
                  {options.confirmLabel ?? 'Confirm'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
};