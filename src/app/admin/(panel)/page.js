'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookOpen, Building2, Eye, Inbox, MapPin, UsersRound } from 'lucide-react';
import { adminApi } from '@/lib/client-api';
import { formatDateTime } from '@/lib/utils';
import { Badge, ErrorBox, PageHeader, Spinner } from '@/components/admin/ui';
import CountUp from '@/components/site/CountUp';

const statusColor = { new: 'blue', contacted: 'amber', qualified: 'green', closed: 'slate', spam: 'red' };

function Stat({ icon: Icon, label, value, sub, href }) {
  return (
    <Link href={href} className="card flex items-center gap-4 p-5 transition hover:shadow-lift">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon size={22} /></span>
      <span>
        <span className="block text-2xl font-bold"><CountUp value={String(value)} duration={900} /></span>
        <span className="block text-sm text-slate-500">{label}</span>
        {sub && <span className="block text-xs text-slate-400">{sub}</span>}
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () => adminApi.get('/stats').then((r) => setData(r.data)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!data) return <Spinner />;

  // fill the last 14 days so the chart has no gaps
  const days = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), count: data.daily.find((x) => x._id === key)?.count || 0 });
  }
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your website content and leads." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Building2} label="Projects" value={data.projects} sub={`${data.published} published`} href="/admin/projects" />
        <Stat icon={Inbox} label="Enquiries" value={data.enquiries} sub={`${data.newEnquiries} new`} href="/admin/enquiries" />
        <Stat icon={MapPin} label="Locations" value={data.locations} sub={`${data.categories} categories`} href="/admin/locations" />
        <Stat icon={BookOpen} label="Blog posts" value={data.blogs} sub={`${data.developers} developers`} href="/admin/blogs" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-sans text-base font-semibold">Enquiries – last 14 days</h2>
          <div className="flex h-44 items-end gap-1.5" role="img" aria-label="Enquiries per day for the last 14 days">
            {days.map((d) => (
              <div key={d.key} className="group flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-semibold text-slate-500">{d.count || ''}</span>
                <div className="w-full rounded-t bg-brand-600 transition group-hover:bg-gold-500" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 4 : 2, opacity: d.count ? 1 : 0.25 }} title={`${d.label}: ${d.count}`} />
                <span className="hidden text-[10px] text-slate-400 sm:block">{d.label.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-sans text-base font-semibold"><Eye size={16} /> Most viewed projects</h2>
          <ol className="space-y-3">
            {data.topProjects.map((p, i) => (
              <li key={p._id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2"><span className="text-slate-400">{i + 1}.</span><span className="truncate">{p.name}</span></span>
                <span className="font-semibold text-brand-700">{p.views}</span>
              </li>
            ))}
            {data.topProjects.length === 0 && <li className="text-sm text-slate-500">No views yet.</li>}
          </ol>
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="flex items-center gap-2 font-sans text-base font-semibold"><UsersRound size={16} /> Latest enquiries</h2>
          <Link href="/admin/enquiries" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link>
        </div>
        {data.recent.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">No enquiries yet.</p>
        ) : (
          <ul className="divide-y">
            {data.recent.map((e) => (
              <li key={e._id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <div>
                  <p className="font-semibold">{e.name} <span className="font-normal text-slate-500">· {e.phone}</span></p>
                  <p className="text-xs text-slate-500">{e.enquiryType}{e.projectName ? ` · ${e.projectName}` : ''} · {formatDateTime(e.createdAt)}</p>
                </div>
                <Badge color={statusColor[e.status]}>{e.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
