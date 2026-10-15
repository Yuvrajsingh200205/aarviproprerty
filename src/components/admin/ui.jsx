'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2, X, XCircle } from 'lucide-react';

// ---------- Toasts ----------
const ToastCtx = createContext({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s, { id, message, type }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4200);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  const icon = { success: <CheckCircle2 size={18} className="text-emerald-500" />, error: <XCircle size={18} className="text-red-500" />, info: <Info size={18} className="text-sky-500" /> };
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex items-start gap-3 rounded-lg bg-white p-3 text-sm shadow-lift ring-1 ring-black/5">
            {icon[t.type] || icon.info}
            <p className="flex-1">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ---------- Modal ----------
export function Modal({ open, onClose, title, children, wide = false, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`relative w-full ${wide ? 'max-w-4xl' : 'max-w-xl'} rounded-2xl bg-white shadow-lift`}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-sans text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t bg-slate-50 px-6 py-3 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}

// ---------- Confirm ----------
export function ConfirmDialog({ open, title = 'Are you sure?', message, confirmLabel = 'Delete', danger = true, busy, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button className="btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />} {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <AlertTriangle className="shrink-0 text-amber-500" />
        <p className="text-sm text-slate-700">{message}</p>
      </div>
    </Modal>
  );
}

// ---------- Small pieces ----------
export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-slate-500" role="status">
    <Loader2 className="animate-spin" size={20} /> {label}
  </div>
);

export const ErrorBox = ({ message, onRetry }) => (
  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
    {message}
    {onRetry && <button onClick={onRetry} className="ml-3 font-semibold underline">Retry</button>}
  </div>
);

export const Badge = ({ children, color = 'slate' }) => {
  const map = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-sky-100 text-sky-700',
    gold: 'bg-gold-400/20 text-gold-600',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[color]}`}>{children}</span>;
};

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="font-sans text-2xl font-bold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-2">{children}</div>
  </div>
);

export function Pager({ meta, onPage }) {
  if (!meta || meta.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <span className="text-slate-500">Page {meta.page} of {meta.pages} · {meta.total} total</span>
      <div className="flex gap-1">
        <button className="btn-ghost !px-2.5 !py-1.5" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
        <button className="btn-ghost !px-2.5 !py-1.5" disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

export function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  const t = useRef();
  useEffect(() => {
    clearTimeout(t.current);
    t.current = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t.current);
  }, [value, delay]);
  return v;
}
