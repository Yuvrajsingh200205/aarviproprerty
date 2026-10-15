'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// variant: "hero" (horizontal, over image) | "panel" (stacked, listing page)
export default function SearchFilter({ meta, initial = {}, variant = 'hero', action = '/projects' }) {
  const router = useRouter();
  const [v, setV] = useState({
    location: initial.location || '',
    property: initial.property || '',
    projecttype: initial.projecttype || '',
    search: initial.search || '',
  });
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    Object.entries(v).forEach(([k, val]) => val.trim() && sp.set(k, val.trim()));
    const qs = sp.toString();
    router.push(qs ? `${action}?${qs}` : action);
  };
  const clear = () => {
    setV({ location: '', property: '', projecttype: '', search: '' });
    router.push(action);
  };

  const hero = variant === 'hero';
  const cls = 'input !py-3';
  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Search properties"
      className={hero ? 'grid gap-3 rounded-2xl bg-white/95 p-4 shadow-lift backdrop-blur md:grid-cols-5' : 'space-y-4'}
    >
      <div>
        <label className="label" htmlFor={`loc-${variant}`}>Location</label>
        <select id={`loc-${variant}`} className={cls} value={v.location} onChange={set('location')}>
          <option value="">All locations</option>
          {meta.locations.map((l) => (
            <option key={l._id} value={l.slug}>{l.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`prop-${variant}`}>Property type</label>
        <select id={`prop-${variant}`} className={cls} value={v.property} onChange={set('property')}>
          <option value="">All types</option>
          {meta.categories.map((c) => (
            <option key={c._id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`pt-${variant}`}>Project type</label>
        <select id={`pt-${variant}`} className={cls} value={v.projecttype} onChange={set('projecttype')}>
          <option value="">Any</option>
          {meta.projectTypes.map((t) => (
            <option key={t} value={slugify(t)}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`q-${variant}`}>Keyword</label>
        <input id={`q-${variant}`} className={cls} placeholder="Project, developer…" value={v.search} onChange={set('search')} />
      </div>
      <div className={`flex items-end gap-2 ${hero ? '' : 'pt-1'}`}>
        <button type="submit" className="btn-primary h-[46px] flex-1">
          <Search size={16} /> Search
        </button>
        {!hero && (
          <button type="button" onClick={clear} className="btn-ghost h-[46px]">Reset</button>
        )}
      </div>
    </form>
  );
}
