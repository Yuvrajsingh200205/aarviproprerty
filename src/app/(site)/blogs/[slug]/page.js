import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiOrNull } from '@/lib/api';
import { formatDate, media, truncate, stripMarkdown } from '@/lib/utils';
import Markdown from '@/components/site/Markdown';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await apiOrNull(`/blogs/${slug}`);
  if (!res) return { title: 'Post not found' };
  const b = res.data;
  return {
    title: b.seoTitle || b.title,
    description: b.seoDescription || b.excerpt || truncate(stripMarkdown(b.content), 160),
    openGraph: { images: b.image ? [media(b.image)] : undefined },
  };
}

export default async function BlogPage({ params }) {
  const { slug } = await params;
  const res = await apiOrNull(`/blogs/${slug}`);
  if (!res) notFound();
  const b = res.data;
  return (
    <article className="container max-w-4xl py-10 md:py-14">
      <nav className="mb-4 text-xs text-slate-500"><Link href="/blogs" className="hover:underline">Blogs</Link> / {b.title}</nav>
      <h1 className="font-serif text-3xl font-semibold text-brand-900 md:text-5xl">{b.title}</h1>
      <p className="mt-3 text-sm text-slate-500">{formatDate(b.publishedAt)} · {b.author}</p>
      {b.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media(b.image)} alt="" className="mt-6 w-full rounded-2xl object-cover shadow-card" />
      )}
      <div className="mt-8"><Markdown>{b.content}</Markdown></div>
      {b.recent?.length > 0 && (
        <aside className="mt-14 border-t pt-8">
          <h2 className="mb-4 font-serif text-xl text-brand-900">More from our blog</h2>
          <ul className="space-y-2">
            {b.recent.map((r) => (
              <li key={r._id}><Link href={`/blogs/${r.slug}`} className="text-brand-700 hover:underline">{r.title}</Link></li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
