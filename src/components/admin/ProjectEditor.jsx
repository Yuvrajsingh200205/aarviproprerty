'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Loader2, Save } from 'lucide-react';
import { adminApi } from '@/lib/client-api';
import { projectDefaults, projectSections } from '@/lib/admin-config';
import FormBuilder, { setIn, toFormValues } from './FormBuilder';
import { ErrorBox, PageHeader, Spinner, useToast } from './ui';

export default function ProjectEditor({ id }) {
  const router = useRouter();
  const { toast } = useToast();
  const allFields = useMemo(() => projectSections.flatMap((s) => s.fields), []);
  const [values, setValues] = useState(id ? null : { ...projectDefaults });
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    adminApi
      .get(`/projects/${id}`)
      .then((r) => setValues(toFormValues(r.data, allFields, projectDefaults)))
      .catch((e) => setLoadError(e.message));
  }, [id, allFields]);

  if (loadError) return <ErrorBox message={loadError} />;
  if (!values) return <Spinner />;

  const change = (name, v) => setValues((s) => setIn(s, name, v));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!values.name?.trim()) return setError('Project name is required');
    if (!values.category) return setError('Please select a property category');
    setSaving(true);
    try {
      const body = { ...values };
      // empty refs are sent as '' and cleared server-side
      const res = id ? await adminApi.put(`/projects/${id}`, body) : await adminApi.post('/projects', body);
      toast('Project saved');
      if (!id) router.replace(`/admin/projects/${res.data._id}`);
      else setValues(toFormValues(res.data, allFields, projectDefaults));
    } catch (err) {
      setError(err.details?.length ? err.details.map((d) => `${d.field}: ${d.message}`).join(' · ') : err.message);
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <form onSubmit={submit}>
      <PageHeader title={id ? 'Edit project' : 'New project'} subtitle={id ? values.name : 'Fill in the details below.'}>
        <Link href="/admin/projects" className="btn-ghost"><ArrowLeft size={16} /> Back</Link>
        {id && values.slug && (
          <a href={`/projects/${values.slug}`} target="_blank" rel="noopener noreferrer" className="btn-outline"><ExternalLink size={16} /> View</a>
        )}
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save project
        </button>
      </PageHeader>

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      <div className="space-y-6">
        {projectSections.map((section) => (
          <section key={section.title} className="card p-5 md:p-6">
            <h2 className="mb-4 border-b pb-3 font-sans text-base font-semibold">{section.title}</h2>
            <FormBuilder fields={section.fields} values={values} onChange={change} />
          </section>
        ))}
      </div>

      <div className="sticky bottom-0 mt-6 flex justify-end gap-2 border-t bg-slate-50/95 py-3 backdrop-blur">
        <Link href="/admin/projects" className="btn-ghost">Cancel</Link>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Loader2 size={16} className="animate-spin" />} Save project
        </button>
      </div>
    </form>
  );
}
