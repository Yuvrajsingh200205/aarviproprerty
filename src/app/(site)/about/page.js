import { api } from '@/lib/api';
import { media } from '@/lib/utils';
import Markdown from '@/components/site/Markdown';
import EnquireButton from '@/components/site/EnquireButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'About Us' };

export default async function AboutPage() {
  const { data: s } = await api('/settings');
  const a = s.about || {};
  return (
    <>
      <section className="bg-brand-900 py-12 text-white md:py-16">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-5xl">{a.heading || 'About Us'}</h1>
          {a.intro && <p className="mt-3 max-w-3xl text-lg text-white/80">{a.intro}</p>}
        </div>
      </section>
      <div className="container py-12">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>{a.body && <Markdown>{a.body}</Markdown>}</div>
          {a.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media(a.image)} alt="" className="w-full rounded-2xl object-cover shadow-card" />
          )}
        </div>
        {(a.mission || a.vision) && (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {a.mission && (
              <div className="card p-6">
                <h2 className="font-serif text-2xl text-brand-900">Our Mission</h2>
                <p className="mt-3 text-slate-700">{a.mission}</p>
              </div>
            )}
            {a.vision && (
              <div className="card p-6">
                <h2 className="font-serif text-2xl text-brand-900">Our Vision</h2>
                <p className="mt-3 text-slate-700">{a.vision}</p>
              </div>
            )}
          </div>
        )}
        <div className="mt-12 text-center">
          <EnquireButton title="Talk to us" className="btn-primary !px-8 !py-3">Get in touch</EnquireButton>
        </div>
      </div>
    </>
  );
}
