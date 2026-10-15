'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import EnquiryForm from './EnquiryForm';

const Ctx = createContext({ open: () => {} });
export const useEnquiry = () => useContext(Ctx);

export default function EnquiryProvider({ children }) {
  const [state, setState] = useState(null);
  const open = useCallback((opts = {}) => setState(opts), []);
  const close = useCallback(() => setState(null), []);
  const value = useMemo(() => ({ open }), [open]);

  useEffect(() => {
    if (!state) return undefined;
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [state, close]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div role="dialog" aria-modal="true" aria-label="Enquiry form" className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lift sm:rounded-2xl">
            <button onClick={close} aria-label="Close" className="absolute right-3 top-3 rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <X size={20} />
            </button>
            <h2 className="pr-8 font-serif text-2xl text-brand-900">{state.title || 'Enquire Now'}</h2>
            <p className="mb-5 mt-1 text-sm text-slate-600">
              {state.subtitle || 'Get expert guidance for your successful real estate journey.'}
            </p>
            <EnquiryForm
              enquiryType={state.enquiryType || 'Quick Enquiry'}
              enquiryFor={state.enquiryFor || state.projectName || ''}
              projectSlug={state.projectSlug}
              submitLabel={state.submitLabel}
              onSuccess={state.onSuccess}
              autoFocus
            />
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
