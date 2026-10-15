'use client';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { adminApi } from '@/lib/client-api';
import { settingsTabs } from '@/lib/admin-config';
import FormBuilder, { setIn } from '@/components/admin/FormBuilder';
import { ErrorBox, PageHeader, Spinner, useToast } from '@/components/admin/ui';

export default function SettingsAdmin() {
  const { toast } = useToast();
  const [values, setValues] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(settingsTabs[0].id);
  const [saving, setSaving] = useState(false);
  const current = useMemo(() => settingsTabs.find((t) => t.id === tab), [tab]);

  useEffect(() => {
    adminApi.get('/settings').then((r) => setValues(r.data)).catch((e) => setError(e.message));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await adminApi.put('/settings', values);
      setValues(r.data);
      toast('Settings saved. Changes are live on the website.');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorBox message={error} />;
  if (!values) return <Spinner />;

  return (
    <form onSubmit={save}>
      <PageHeader title="Site settings" subtitle="Control contact details, home page, about page and legal content.">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save settings
        </button>
      </PageHeader>

      <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto border-b" role="tablist">
        {settingsTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === t.id ? 'border-brand-700 text-brand-800' : 'border-transparent text-slate-500 hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card p-5 md:p-6" role="tabpanel">
        <FormBuilder fields={current.fields} values={values} onChange={(n, v) => setValues((s) => setIn(s, n, v))} />
      </div>
    </form>
  );
}
