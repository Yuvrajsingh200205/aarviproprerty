import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiOrNull } from '@/lib/api';
import { media, truncate, stripMarkdown } from '@/lib/utils';
import ProjectCard from '@/components/site/ProjectCard';
import Markdown from '@/components/site/Markdown';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await apiOrNull(`/developers/${slug}`);
  if (!res) return { title: 'Developer not found' };
  return { title: `${res.data.name} Projects`, description: truncate(stripMarkdown(res.data.description), 160) };
}

export default async function DeveloperPage({ params }) {
  const { slug } = await params;
  const res = await apiOrNull(`/developers/${slug}`);
  if (!res) notFound();
  const d = res.data;
  return (
    <>
      <section className="bg-brand-900 py-10 text-white md:py-14">
        <div className="container flex flex-col gap-4 sm:flex-row sm:items-center">
          {d.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media(d.logo)} alt={d.name} className="h-20 w-auto rounded-lg bg-white p-2 object-contain" />
          )}
          <div>
            <nav className="mb-1 text-xs text-white/70"><Link href="/developers" className="hover:underline">Developers</Link> / {d.name}</nav>
            <h1 className="font-serif text-3xl md:text-4xl">{d.name}</h1>
            {d.tagline && <p className="mt-1 text-white/80">{d.tagline}</p>}
          </div>
        </div>
      </section>
      <div className="container py-10">
        {d.description && <div className="mb-10 max-w-3xl"><Markdown>{d.description}</Markdown></div>}
        <h2 className="mb-5 font-serif text-2xl text-brand-900">{d.projects.length} Project{d.projects.length === 1 ? '' : 's'}</h2>
        {d.projects.length === 0 ? (
          <p className="text-slate-600">No projects listed yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {d.projects.map((p) => <ProjectCard key={p._id} project={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
