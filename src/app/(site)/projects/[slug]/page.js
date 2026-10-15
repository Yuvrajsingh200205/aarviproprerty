import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ShieldCheck, Check, Landmark as LandmarkIcon } from 'lucide-react';
import { api, apiOrNull, getSettings } from '@/lib/api';
import { media, truncate, stripMarkdown } from '@/lib/utils';
import Markdown from '@/components/site/Markdown';
import Gallery from '@/components/site/Gallery';
import ProjectActions from '@/components/site/ProjectActions';
import EnquiryForm from '@/components/site/EnquiryForm';
import ProjectCard from '@/components/site/ProjectCard';
import Placeholder from '@/components/site/Placeholder';
import SectionHeading from '@/components/site/SectionHeading';
import EmiCalculator from '@/components/site/EmiCalculator';
import Reveal from '@/components/site/Reveal';
import SaveButton from '@/components/site/SaveButton';

export const dynamic = 'force-dynamic';

async function load(slug) {
  const res = await apiOrNull(`/projects/${slug}`);
  return res?.data || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await apiOrNull(`/projects/${slug}`);
  const p = res?.data;
  if (!p) return { title: 'Project not found' };
  const desc = p.seoDescription || p.shortDescription || truncate(stripMarkdown(p.overview), 160);
  return {
    title: p.seoTitle || `${p.name}${p.location?.name ? ` – ${p.location.name}` : ''}`,
    description: desc,
    openGraph: { title: p.name, description: desc, images: p.heroImage ? [media(p.heroImage)] : undefined },
  };
}

const Row = ({ label, value }) =>
  value ? (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  ) : null;

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const [p, settings] = await Promise.all([load(slug), getSettings()]);
  if (!p) notFound();

  const price = p.priceLabel ? (/^\d/.test(p.priceLabel) ? `₹ ${p.priceLabel}` : p.priceLabel) : 'On Request';
  const sections = [
    ['overview', 'Overview', Boolean(p.overview || p.highlights?.length)],
    ['amenities', 'Amenities', p.amenities?.length > 0],
    ['location', 'Location', Boolean(p.mapUrl || p.landmarks?.length || p.address)],
    ['gallery', 'Gallery', p.gallery?.length > 0],
    ['plans', 'Site & Floor Plans', Boolean(p.sitePlan || p.floorPlans?.length)],
    ['faqs', 'FAQs', p.faqs?.length > 0],
    ['emi', 'EMI Calculator', true],
    ['developer', 'Developer', Boolean(p.developer)],
  ].filter((s) => s[2]);

  return (
    <>
      <section className="border-b bg-white">
        <div className="container py-6 md:py-8">
          <nav className="mb-3 text-xs text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link> /{' '}
            <Link href="/projects" className="hover:underline">Projects</Link>
            {p.category && <> / <Link href={`/projects?property=${p.category.slug}`} className="hover:underline">{p.category.name}</Link></>}
          </nav>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 shadow-card">
              <SaveButton slug={p.slug} name={p.name} className="absolute right-4 top-4 z-20" size={20} />
              {p.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media(p.heroImage)} alt={p.name} className="h-full w-full object-cover transition duration-[1500ms] group-hover:scale-105" />
              ) : (
                <Placeholder label={p.name} />
              )}
            </div>
            <div className="flex flex-col">
              <div className="mb-2 flex flex-wrap gap-2">
                {(p.isNewLaunch || p.projectType !== 'New Launch') && (
                  <span className="rounded-full bg-gold-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-950">{p.isNewLaunch ? 'New Launch' : p.projectType}</span>
                )}
                {p.status && <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">{p.status}</span>}
              </div>
              <h1 className="font-serif text-3xl font-semibold text-brand-900 md:text-4xl">{p.name}</h1>
              {(p.sector || p.location) && (
                <p className="mt-2 flex items-center gap-1.5 text-slate-600">
                  <MapPin size={16} className="text-gold-600" />
                  {[p.sector, p.location?.name].filter(Boolean).join(', ')}
                </p>
              )}
              {p.reraNo && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                  <ShieldCheck size={16} className="text-brand-600" /> RERA No.: <span className="font-semibold">{p.reraNo}</span>
                </p>
              )}
              <dl className="mt-5 rounded-xl bg-cream px-4">
                <Row label="Property type" value={p.category?.name} />
                <Row label="Configuration" value={p.configuration} />
                <Row label="Project size" value={p.size} />
                <Row label="Possession" value={p.possession} />
                <Row label="Developer" value={p.developer?.name} />
                <Row label="Price" value={price} />
              </dl>
              <div className="mt-5">
                <ProjectActions project={p} whatsapp={settings?.whatsapp} phone={settings?.phones?.[0]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* anchor nav */}
      <nav className="sticky top-16 z-30 border-b bg-white/95 backdrop-blur md:top-[72px]" aria-label="Project sections">
        <div className="container no-scrollbar flex gap-1 overflow-x-auto">
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-600 hover:text-brand-700">{label}</a>
          ))}
        </div>
      </nav>

      <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-12">
          {(p.overview || p.highlights?.length > 0) && (
            <section id="overview" className="scroll-mt-32">
              <h2 className="mb-4 font-serif text-2xl text-brand-900">Overview</h2>
              {p.shortDescription && <p className="mb-4 text-lg text-slate-700">{p.shortDescription}</p>}
              <Markdown>{p.overview}</Markdown>
              {p.highlights?.length > 0 && (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 rounded-lg bg-white p-3 text-sm shadow-card"><Check size={16} className="mt-0.5 shrink-0 text-brand-600" />{h}</li>
                  ))}
                </ul>
              )}
              {p.videoUrl && (
                <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline mt-5">Watch project video</a>
              )}
            </section>
          )}

          {p.amenities?.length > 0 && (
            <section id="amenities" className="scroll-mt-32">
              <h2 className="mb-4 font-serif text-2xl text-brand-900">Amenities</h2>
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {p.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 rounded-lg bg-white p-3 text-sm font-medium shadow-card">
                    <Check size={16} className="shrink-0 text-gold-600" />{a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(p.mapUrl || p.landmarks?.length > 0 || p.address) && (
            <section id="location" className="scroll-mt-32">
              <h2 className="mb-4 font-serif text-2xl text-brand-900">Location &amp; Landmarks</h2>
              {p.address && <p className="mb-4 flex items-start gap-2 text-slate-700"><MapPin size={18} className="mt-0.5 shrink-0 text-gold-600" />{p.address}</p>}
              {p.landmarks?.length > 0 && (
                <ul className="mb-4 divide-y rounded-xl bg-white shadow-card">
                  {p.landmarks.map((l, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className="flex items-center gap-2"><LandmarkIcon size={16} className="text-brand-600" />{l.name}</span>
                      <span className="font-semibold text-slate-700">{l.distance}</span>
                    </li>
                  ))}
                </ul>
              )}
              {p.mapUrl && (
                <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">Open in Google Maps</a>
              )}
            </section>
          )}

          {p.gallery?.length > 0 && (
            <section id="gallery" className="scroll-mt-32">
              <h2 className="mb-4 font-serif text-2xl text-brand-900">Gallery</h2>
              <Gallery images={p.gallery} name={p.name} />
            </section>
          )}

          {(p.sitePlan || p.floorPlans?.length > 0) && (
            <section id="plans" className="scroll-mt-32">
              <h2 className="mb-4 font-serif text-2xl text-brand-900">Site &amp; Floor Plans</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {p.sitePlan && (
                  <figure className="overflow-hidden rounded-xl bg-white shadow-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={media(p.sitePlan)} alt={`${p.name} site plan`} loading="lazy" className="w-full" />
                    <figcaption className="px-4 py-2 text-sm font-semibold">Site Plan</figcaption>
                  </figure>
                )}
                {p.floorPlans?.map((f, i) => f.image && (
                  <figure key={i} className="overflow-hidden rounded-xl bg-white shadow-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={media(f.image)} alt={f.title || `Floor plan ${i + 1}`} loading="lazy" className="w-full" />
                    <figcaption className="px-4 py-2 text-sm font-semibold">{f.title || `Floor plan ${i + 1}`}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {p.faqs?.length > 0 && (
            <section id="faqs" className="scroll-mt-32">
              <h2 className="mb-4 font-serif text-2xl text-brand-900">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {p.faqs.map((f, i) => (
                  <details key={i} className="group rounded-xl bg-white p-4 shadow-card">
                    <summary className="cursor-pointer list-none font-semibold text-brand-900 marker:hidden">{f.question}</summary>
                    <p className="mt-3 text-sm text-slate-600">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section id="emi" className="scroll-mt-32">
            <h2 className="mb-4 font-serif text-2xl text-brand-900">EMI Calculator</h2>
            <Reveal><EmiCalculator title="Estimate your monthly EMI" compactLayout /></Reveal>
          </section>

          {p.developer && (
            <section id="developer" className="scroll-mt-32">
              <h2 className="mb-4 font-serif text-2xl text-brand-900">About the Developer</h2>
              <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                {p.developer.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media(p.developer.logo)} alt={p.developer.name} className="h-16 w-auto object-contain" />
                )}
                <div className="flex-1">
                  <h3 className="font-serif text-xl text-brand-900">{p.developer.name}</h3>
                  {p.developer.description && <p className="mt-1 text-sm text-slate-600">{truncate(p.developer.description, 280)}</p>}
                </div>
                <Link href={`/developers/${p.developer.slug}`} className="btn-outline whitespace-nowrap">All projects</Link>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="card p-5">
            <h2 className="font-serif text-xl text-brand-900">Interested in {p.name}?</h2>
            <p className="mb-4 mt-1 text-sm text-slate-600">Leave your details and our advisor will call you back.</p>
            <EnquiryForm enquiryType="Quick Enquiry" enquiryFor={p.name} projectSlug={p.slug} compact />
          </div>
        </aside>
      </div>

      {p.related?.length > 0 && (
        <section className="section bg-white">
          <div className="container">
            <SectionHeading title="Similar Projects" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {p.related.slice(0, 3).map((r) => <ProjectCard key={r._id} project={r} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
