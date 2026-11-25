import { useEffect, useRef } from 'react';

export const NEW_LEAD_EVENT = 'crm:new-lead';
export const SHORTCUTS_EVENT = 'crm:shortcuts';

export const useOnNewLead = (handler: () => void) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = () => handlerRef.current();
    window.addEventListener(NEW_LEAD_EVENT, listener);
    return () => window.removeEventListener(NEW_LEAD_EVENT, listener);
  }, []);
};