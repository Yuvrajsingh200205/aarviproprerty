'use client';
import { useCallback, useEffect, useState } from 'react';
import { Download, Loader2, Mail, Phone, Search, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/client-api';
import { formatDateTime } from '@/lib/utils';
import { Badge, ConfirmDialog, ErrorBox, Modal, PageHeader, Pager, Spinner, useDebounced, useToast } from '@/components/admin/ui';

const STATUSES = ['new', 'contacted', 'qualified', 'closed', 'spam'];
const TYPES = ['Quick Enquiry', 'Instant Callback', 'Contact Form', 'Brochure Download'];
const color = { new: 'blue', contacted: 'amber', qualified: 'green', closed: 'slate', spam: 'red' };

export default function EnquiriesAdmin() {
  const { toast } = useToast();
  const [state, setState] = useState({ loading: true, error: '', items: [], meta: null });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [open, setOpen] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filterQs = useCallback(() => {
    const qs = new URLSearchParams();
    if (dq) qs.set('q', dq);
    if (status) qs.set('status', status);
    if (type) qs.set('enquiryType', type);
    return qs;
  }, [dq, status, type]);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const qs = filterQs();
      qs.set('page', page);
      qs.set('limit', 15);
      const r = await adminApi.get(`/enquiries?${qs}`);
      setState({ loading: false, error: '', items: r.data, meta: r.meta });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  }, [page, filterQs]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [dq, status, type]);

  const update = async (id, body) => {
    try {
      const r = await adminApi.put(`/enquiries/${id}`, body);
      setState((s) => ({ ...s, items: s.items.map((e) => (e._id === id ? r.data : e)) }));
      if (open?._id === id) setOpen(r.data);
      return r.data;
    } catch (err) {
      toast(err.message, 'error');
      return null;
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    const r = await update(open._id, { notes });
    if (r) toast('Notes saved');
    setSaving(false);
  };

  const remove = async () => {
    setDelBusy(true);
    try {
      await adminApi.del(`/enquiries/${deleting._id}`);
      toast('Enquiry deleted');
      setDeleting(null);
      setOpen(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDelBusy(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await adminApi.raw(`/enquiries/export.csv?${filterQs()}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Enquiries" subtitle="Leads submitted through the website forms.">
        <button className="btn-outline" onClick={exportCsv} disabled={exporting}>
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Export CSV
        </button>
      </PageHeader>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input !pl-9" placeholder="Search name, phone, email, project…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search enquiries" />
          </div>
          <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input !w-auto" value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
            <option value="">All types</option>
            {TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {state.error ? (
          <div className="p-4"><ErrorBox message={state.error} onRetry={load} /></div>
        ) : state.loading && !state.items.length ? (
          <Spinner />
        ) : state.items.length === 0 ? (
          <p className="py-14 text-center text-sm text-slate-500">No enquiries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Interested in</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.items.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDateTime(e.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button className="text-left" onClick={() => { setOpen(e); setNotes(e.notes || ''); }}>
                        <span className="block font-semibold text-brand-800 hover:underline">{e.name}</span>
                        <span className="block text-xs text-slate-500">{e.phone}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3"><Badge color="gold">{e.enquiryType}</Badge></td>
                    <td className="max-w-[220px] truncate px-4 py-3">{e.projectName || e.enquiryFor || '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-black/10 ${e.status === 'new' ? 'bg-sky-50 text-sky-700' : 'bg-white'}`}
                        value={e.status}
                        onChange={(ev) => update(e._id, { status: ev.target.value })}
                        aria-label={`Status for ${e.name}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <a href={`tel:${e.phone}`} className="inline-flex rounded p-2 text-slate-600 hover:bg-slate-100" aria-label={`Call ${e.name}`}><Phone size={16} /></a>
                      <button className="rounded p-2 text-red-600 hover:bg-red-50" onClick={() => setDeleting(e)} aria-label={`Delete enquiry from ${e.name}`}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={state.meta} onPage={setPage} />
      </div>

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title="Enquiry details">
        {open && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><p className="label">Name</p><p className="font-semibold">{open.name}</p></div>
              <div><p className="label">Received</p><p>{formatDateTime(open.createdAt)}</p></div>
              <div><p className="label">Phone</p><a className="inline-flex items-center gap-1 font-semibold text-brand-700" href={`tel:${open.phone}`}><Phone size={14} />{open.phone}</a></div>
              <div><p className="label">Email</p>{open.email ? <a className="inline-flex items-center gap-1 text-brand-700" href={`mailto:${open.email}`}><Mail size={14} />{open.email}</a> : '—'}</div>
              <div><p className="label">Type</p><p>{open.enquiryType}</p></div>
              <div><p className="label">Interested in</p><p>{open.projectName || open.enquiryFor || '—'}</p></div>
            </div>
            {open.message && <div><p className="label">Message</p><p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3">{open.message}</p></div>}
            {open.pageUrl && <div><p className="label">Submitted from</p><p className="break-all text-xs text-slate-500">{open.pageUrl}</p></div>}
            <div>
              <label className="label" htmlFor="enq-status">Status</label>
              <select id="enq-status" className="input" value={open.status} onChange={(e) => update(open._id, { status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="enq-notes">Internal notes</label>
              <textarea id="enq-notes" rows={3} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Call outcome, follow-up date…" />
              <div className="mt-2 flex justify-end">
                <button className="btn-primary" onClick={saveNotes} disabled={saving}>{saving && <Loader2 size={16} className="animate-spin" />} Save notes</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={Boolean(deleting)} message={`Delete the enquiry from “${deleting?.name}”?`} busy={delBusy} onConfirm={remove} onCancel={() => setDeleting(null)} />
    </div>
  );
}
