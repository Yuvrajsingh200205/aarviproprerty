'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/client-api';
import { media } from '@/lib/utils';
import { Badge, ConfirmDialog, ErrorBox, PageHeader, Pager, Spinner, useDebounced, useToast } from '@/components/admin/ui';

export default function ProjectsAdmin() {
  const { toast } = useToast();
  const [state, setState] = useState({ loading: true, error: '', items: [], meta: null });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const [category, setCategory] = useState('');
  const [published, setPublished] = useState('');
  const [cats, setCats] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi.get('/categories?limit=100').then((r) => setCats(r.data)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const qs = new URLSearchParams({ page, limit: 15 });
      if (dq) qs.set('q', dq);
      if (category) qs.set('category', category);
      if (published) qs.set('published', published);
      const r = await adminApi.get(`/projects?${qs}`);
      setState({ loading: false, error: '', items: r.data, meta: r.meta });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  }, [page, dq, category, published]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [dq, category, published]);

  const togglePublish = async (p) => {
    try {
      await adminApi.put(`/projects/${p._id}`, { published: !p.published });
      toast(p.published ? 'Project hidden from website' : 'Project published');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminApi.del(`/projects/${deleting._id}`);
      toast('Project deleted');
      setDeleting(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Projects" subtitle="Add, edit and publish property listings.">
        <Link href="/admin/projects/new" className="btn-primary"><Plus size={16} /> Add project</Link>
      </PageHeader>
      <div className="card overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input !pl-9" placeholder="Search by name, sector, RERA…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search projects" />
          </div>
          <select className="input !w-auto" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="input !w-auto" value={published} onChange={(e) => setPublished(e.target.value)} aria-label="Filter by status">
            <option value="">All status</option>
            <option value="true">Published</option>
            <option value="false">Hidden</option>
          </select>
        </div>

        {state.error ? (
          <div className="p-4"><ErrorBox message={state.error} onRetry={load} /></div>
        ) : state.loading && !state.items.length ? (
          <Spinner />
        ) : state.items.length === 0 ? (
          <p className="py-14 text-center text-sm text-slate-500">No projects found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.items.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.heroImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={media(p.heroImage)} alt="" className="h-10 w-14 rounded object-cover" />
                        ) : <span className="h-10 w-14 rounded bg-slate-100" />}
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate font-semibold">{p.name}</p>
                          <p className="text-xs text-slate-500">{[p.configuration, p.size].filter(Boolean).join(' · ') || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3">{p.location?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge color="gold">{p.projectType}</Badge>
                      {p.isNewLaunch && <span className="ml-1"><Badge color="blue">Home</Badge></span>}
                    </td>
                    <td className="px-4 py-3"><Badge color={p.published ? 'green' : 'slate'}>{p.published ? 'Published' : 'Hidden'}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button className="rounded p-2 text-slate-600 hover:bg-slate-100" onClick={() => togglePublish(p)} aria-label={p.published ? 'Unpublish' : 'Publish'} title={p.published ? 'Hide from website' : 'Publish'}>
                        {p.published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link href={`/admin/projects/${p._id}`} className="inline-flex rounded p-2 text-slate-600 hover:bg-slate-100" aria-label={`Edit ${p.name}`}><Pencil size={16} /></Link>
                      <button className="rounded p-2 text-red-600 hover:bg-red-50" onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={state.meta} onPage={setPage} />
      </div>

      <ConfirmDialog open={Boolean(deleting)} message={`Delete project “${deleting?.name}”? This cannot be undone.`} busy={busy} onConfirm={remove} onCancel={() => setDeleting(null)} />
    </div>
  );
}
