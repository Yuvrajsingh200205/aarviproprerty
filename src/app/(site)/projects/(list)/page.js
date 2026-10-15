import { api } from '@/lib/api';
import SearchFilter from '@/components/site/SearchFilter';
import ProjectCard from '@/components/site/ProjectCard';
import Pagination from '@/components/site/Pagination';
import { SearchX } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const PER_PAGE = 12;

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const { data: meta } = await api('/meta');
  const cat = meta.categories.find((c) => c.slug === (sp.property || '').toLowerCase());
  if (cat) return { title: cat.seoTitle || `${cat.name} Projects`, description: cat.seoDescription || cat.description || undefined };
  return { title: 'Projects' };
}

export default async function ProjectsPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const filters = {
    property: sp.property || '',
    location: sp.location || '',
    projecttype: sp.projecttype || '',
    search: sp.search || '',
    developer: sp.developer || '',
  };
  const [{ data: items, meta: pg }, { data: meta }] = await Promise.all([
    api('/projects', { query: { ...filters, page, limit: PER_PAGE } }),
    api('/meta'),
  ]);

  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const cat = meta.categories.find((c) => c.slug === norm(filters.property));
  const loc = meta.locations.find((l) => l.slug === norm(filters.location));
  const title = cat ? cat.name : loc ? `Projects in ${loc.name}` : filters.search ? `Results for “${filters.search}”` : 'All Projects';

  return (
    <>
      <section className="bg-brand-900 py-10 text-white md:py-14">
        <div className="container">
          <nav className="mb-2 text-xs text-white/70" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link> / <span>Projects</span>
          </nav>
          <h1 className="font-serif text-3xl md:text-4xl">{title}</h1>
          {cat?.description && <p className="mt-2 max-w-2xl text-white/80">{cat.description}</p>}
        </div>
      </section>

      <div className="container py-8 md:py-10">
        <div className="mb-8">
          <SearchFilter
            meta={meta}
            variant="hero"
            initial={{
              location: loc?.slug || '',
              property: cat?.slug || '',
              projecttype: norm(filters.projecttype),
              search: filters.search,
            }}
          />
        </div>

        <p className="mb-5 text-sm text-slate-600" aria-live="polite">
          {pg.total} project{pg.total === 1 ? '' : 's'} found
        </p>

        {items.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 py-16 text-center">
            <SearchX size={40} className="text-slate-400" />
            <p className="font-semibold">No projects match your search.</p>
            <Link href="/projects" className="btn-primary">Clear filters</Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => <ProjectCard key={p._id} project={p} />)}
          </div>
        )}

        <Pagination page={pg.page} pages={pg.pages} basePath="/projects" params={filters} />
      </div>
    </>
  );
}
