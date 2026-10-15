import Link from 'next/link';
import { ArrowUpRight, BedDouble, MapPin, Ruler } from 'lucide-react';
import Placeholder from './Placeholder';
import SaveButton from './SaveButton';
import TiltCard from './TiltCard';
import { media } from '@/lib/utils';

export default function ProjectCard({ project: p, className = '' }) {
  const spec = p.configuration || p.size;
  // "New Launch" is the default type, so only highlight flagged launches and Resale / Rental listings.
  const badge = p.isNewLaunch ? 'New Launch' : p.projectType && p.projectType !== 'New Launch' ? p.projectType : '';
  return (
    <TiltCard className={`h-full ${className}`}>
      <Link
        href={`/projects/${p.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card transition-shadow duration-300 group-hover:shadow-lift"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {p.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media(p.heroImage)} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          ) : (
            <div className="h-full w-full transition duration-700 group-hover:scale-110"><Placeholder label={p.name} /></div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-950 shadow">
              {badge}
            </span>
          )}
          <span className="absolute bottom-3 right-3 flex translate-y-3 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-900 opacity-0 shadow-lift transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            View details <ArrowUpRight size={14} />
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug text-brand-900 transition-colors group-hover:text-brand-600">{p.name}</h3>
          {p.location?.name && (
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin size={14} className="shrink-0 text-gold-600" />
              <span className="line-clamp-1">{p.sector ? `${p.sector}, ` : ''}{p.location.name}</span>
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-sm">
            {spec ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                {p.configuration ? <BedDouble size={15} className="text-brand-600" /> : <Ruler size={15} className="text-brand-600" />}
                {spec}
              </span>
            ) : <span />}
            <span className="text-xs font-semibold text-brand-700">{p.category?.name}</span>
          </div>
        </div>
      </Link>
      <SaveButton slug={p.slug} name={p.name} />
    </TiltCard>
  );
}
