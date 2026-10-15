import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate, media } from '@/lib/utils';
import Pagination from '@/components/site/Pagination';
import Placeholder from '@/components/site/Placeholder';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Blogs' };

export default async function BlogsPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const { data, meta } = await api('/blogs', { query: { page, limit: 9 } });
  return (
    <>
      <section className="bg-brand-900 py-10 text-white md:py-14">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-4xl">Blogs</h1>
          <p className="mt-2 text-white/80">Guides, market insights and project updates.</p>
        </div>
      </section>
      <div className="container py-10">
        {data.length === 0 ? (
          <p className="text-slate-600">No posts yet. Please check back soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((b) => (
              <Link key={b._id} href={`/blogs/${b.slug}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                  {b.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media(b.image)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : <Placeholder label={b.title} />}
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{formatDate(b.publishedAt)}</p>
                  <h2 className="mt-1 line-clamp-2 font-serif text-xl text-brand-900 group-hover:text-brand-600">{b.title}</h2>
                  {b.excerpt && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{b.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
        <Pagination page={meta.page} pages={meta.pages} basePath="/blogs" />
      </div>
    </>
  );
}
