'use client';
import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/client-api';
import FormBuilder, { setIn, toFormValues } from './FormBuilder';
import { ConfirmDialog, ErrorBox, Modal, PageHeader, Pager, Spinner, useDebounced, useToast } from './ui';

/**
 * Generic list + create/edit modal for a simple admin resource.
 * config: { title, subtitle, endpoint, itemName, fields, columns, defaults, searchable, wide }
 */
export default function ResourcePage({ config }) {
  const { title, subtitle, endpoint, itemName = 'item', fields, columns, defaults = {}, searchable = true, wide = false } = config;
  const { toast } = useToast();
  const [state, setState] = useState({ loading: true, error: '', items: [], meta: null });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const [editing, setEditing] = useState(null); // null | {} (new) | doc
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [delBusy, setDelBusy] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const qs = new URLSearchParams({ page, limit: 15 });
      if (dq) qs.set('q', dq);
      const r = await adminApi.get(`/${endpoint}?${qs}`);
      setState({ loading: false, error: '', items: r.data, meta: r.meta });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  }, [endpoint, page, dq]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [dq]);

  const openNew = () => {
    setValues({ ...defaults });
    setFormError('');
    setEditing({});
  };
  const openEdit = (doc) => {
    setValues(toFormValues(doc, fields, defaults));
    setFormError('');
    setEditing(doc);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const body = { ...values };
      if (editing?._id) await adminApi.put(`/${endpoint}/${editing._id}`, body);
      else await adminApi.post(`/${endpoint}`, body);
      toast(`${itemName} saved`);
      setEditing(null);
      load();
    } catch (err) {
      setFormError(err.details?.length ? err.details.map((d) => `${d.field}: ${d.message}`).join(' · ') : err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDelBusy(true);
    try {
      await adminApi.del(`/${endpoint}/${deleting._id}`);
      toast(`${itemName} deleted`);
      setDeleting(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
      setDeleting(null);
    } finally {
      setDelBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}>
        <button className="btn-primary" onClick={openNew}><Plus size={16} /> Add {itemName}</button>
      </PageHeader>

      <div className="card overflow-hidden">
        {searchable && (
          <div className="border-b p-3">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input !pl-9" placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
            </div>
          </div>
        )}
        {state.error ? (
          <div className="p-4"><ErrorBox message={state.error} onRetry={load} /></div>
        ) : state.loading && !state.items.length ? (
          <Spinner />
        ) : state.items.length === 0 ? (
          <p className="py-14 text-center text-sm text-slate-500">No {title.toLowerCase()} found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {columns.map((c) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.items.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/70">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 align-middle">{c.render ? c.render(row) : row[c.key]}</td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button className="rounded p-2 text-slate-600 hover:bg-slate-100" onClick={() => openEdit(row)} aria-label={`Edit ${row.name || row.title}`}><Pencil size={16} /></button>
                      <button className="rounded p-2 text-red-600 hover:bg-red-50" onClick={() => setDeleting(row)} aria-label={`Delete ${row.name || row.title}`}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={state.meta} onPage={setPage} />
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing?._id ? `Edit ${itemName}` : `Add ${itemName}`}
        wide={wide}
      >
        <form onSubmit={save} className="space-y-5">
          <FormBuilder fields={fields} values={values} onChange={(name, v) => setValues((s) => setIn(s, name, v))} />
          {formError && <ErrorBox message={formError} />}
          <div className="flex justify-end gap-2 border-t pt-4">
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />} Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        message={`Delete “${deleting?.name || deleting?.title || ''}”? This cannot be undone.`}
        busy={delBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
