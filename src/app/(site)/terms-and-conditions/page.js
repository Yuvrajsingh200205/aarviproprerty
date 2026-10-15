import { api } from '@/lib/api';
import Markdown from '@/components/site/Markdown';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Terms & Conditions' };

export default async function Page() {
  const { data: s } = await api('/settings');
  return (
    <>
      <section className="bg-brand-900 py-12 text-white">
        <div className="container"><h1 className="font-serif text-3xl md:text-5xl">Terms & Conditions</h1></div>
      </section>
      <div className="container max-w-4xl py-12">
        {s.terms ? <Markdown>{s.terms}</Markdown> : <p className="text-slate-600">Content coming soon.</p>}
      </div>
    </>
  );
}
