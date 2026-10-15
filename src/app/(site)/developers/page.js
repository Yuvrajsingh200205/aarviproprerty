import Link from 'next/link';
import { api } from '@/lib/api';
import { media } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Developers' };

export default async function DevelopersPage() {
  const { data } = await api('/developers');
  return (
    <>
      <section className="bg-brand-900 py-10 text-white md:py-14">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-4xl">Developers</h1>
          <p className="mt-2 text-white/80">Browse projects by the developers we work with.</p>
        </div>
      </section>
      <div className="container py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((d) => (
            <Link key={d._id} href={`/developers/${d.slug}`} className="card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 font-serif text-xl font-bold text-brand-800">
                {d.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media(d.logo)} alt="" className="h-full w-full object-contain" />
                ) : d.name[0]}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-brand-900 group-hover:text-brand-600">{d.name}</span>
                <span className="text-sm text-slate-500">{d.projectCount} project{d.projectCount === 1 ? '' : 's'}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
