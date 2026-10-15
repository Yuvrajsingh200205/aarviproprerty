import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, HeartHandshake, MapPin, Handshake, Star, UsersRound } from 'lucide-react';
import { api } from '@/lib/api';
import { media } from '@/lib/utils';
import Hero from '@/components/site/Hero';
import SectionHeading from '@/components/site/SectionHeading';
import Carousel from '@/components/site/Carousel';
import ProjectCard from '@/components/site/ProjectCard';
import EnquireButton from '@/components/site/EnquireButton';
import Placeholder from '@/components/site/Placeholder';
import Reveal from '@/components/site/Reveal';
import CountUp from '@/components/site/CountUp';
import Marquee from '@/components/site/Marquee';
import EmiCalculator from '@/components/site/EmiCalculator';

export const dynamic = 'force-dynamic';

const WHY = [
  { icon: BadgeCheck, title: 'Verified projects', text: 'Every listing is checked for developer track record and RERA details before we recommend it.' },
  { icon: UsersRound, title: 'Expert advisors', text: 'Talk to people who know the micro-markets of Gurugram and Delhi-NCR inside out.' },
  { icon: Handshake, title: 'Transparent deals', text: 'Clear pricing, honest pros and cons, and no pressure while you decide.' },
  { icon: HeartHandshake, title: 'End-to-end support', text: 'From shortlisting and site visits to paperwork and possession, we stay with you.' },
];

export default async function HomePage() {
  const [{ data: home }, { data: meta }] = await Promise.all([api('/home'), api('/meta')]);
  const { settings, newLaunch, sections, locations, awards, testimonials, developers } = home;
  const titles = settings.sectionTitles || {};
  const stats = settings.stats || [];
  const half = Math.ceil(developers.length / 2);
  const devRows = [developers.slice(0, half), developers.slice(half)].filter((r) => r.length);

  const devChip = (d) => (
    <Link
      key={d._id}
      href={`/developers/${d.slug}`}
      className="flex h-16 min-w-[180px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-center text-sm font-semibold text-brand-900 transition hover:-translate-y-1 hover:border-gold-500 hover:shadow-glow"
    >
      {d.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media(d.logo)} alt={d.name} loading="lazy" className="max-h-10 w-auto object-contain" />
      ) : d.name}
    </Link>
  );

  return (
    <>
      <Hero settings={settings} meta={meta} />

      <div id="explore" />

      {/* NEW LAUNCHES */}
      {newLaunch.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading title={titles.newLaunch || 'New Launched Properties'} href="/projects?projecttype=new-launch" />
            <Carousel autoplay={4500}>
              {newLaunch.map((p) => <ProjectCard key={p._id} project={p} />)}
            </Carousel>
          </div>
        </section>
      )}

      {/* WHY US */}
      <section className="section relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 animate-blob rounded-full bg-gold-400/10 blur-3xl" />
        <div className="container relative">
          <SectionHeading title="Why choose us" subtitle="Buying property is a big decision. We make it simple, safe and rewarding." center />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="card group h-full p-6 transition duration-300 hover:-translate-y-2 hover:shadow-lift">
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-brand-800 group-hover:text-gold-400">
                    <Icon size={26} />
                  </span>
                  <h3 className="font-serif text-xl text-brand-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY SECTIONS */}
      {sections.map(({ category, projects }, i) => (
        <section key={category._id} className={`section ${i % 2 === 1 ? 'bg-white' : ''}`}>
          <div className="container">
            <SectionHeading
              title={category.name === 'Residential' ? titles.residential || `${category.name} Properties` : category.name === 'Commercial' ? titles.commercial || `${category.name} Properties` : category.name === 'Residential Plots' ? titles.plots || category.name : category.name}
              subtitle={category.description}
              href={`/projects?property=${category.slug}`}
            />
            <Carousel>
              {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
            </Carousel>
          </div>
        </section>
      ))}

      {/* STATS */}
      {stats.length > 0 && (
        <section className="relative overflow-hidden bg-brand-900 py-14 text-white">
          <div className="bg-grid absolute inset-0 opacity-40" />
          <div className="pointer-events-none absolute -left-10 top-0 h-60 w-60 animate-blob rounded-full bg-brand-500/30 blur-3xl" />
          <div className="container relative grid gap-8 text-center sm:grid-cols-3">
            {stats.map((s, i) => (
              <Reveal key={i} delay={i * 120}>
                <p className="font-serif text-5xl font-semibold text-gold-400 md:text-6xl"><CountUp value={s.value} /></p>
                <p className="mt-2 text-sm uppercase tracking-widest text-white/80">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* LOCATIONS */}
      {locations.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading title={titles.locations || 'Locations'} subtitle="Explore projects by prime micro-markets." />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {locations.map((l, i) => (
                <Reveal key={l._id} delay={(i % 4) * 70}>
                  <Link href={`/projects?location=${l.slug}`} className="group relative flex h-32 items-end overflow-hidden rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 p-4 text-white shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                    {l.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media(l.image)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50 transition duration-700 group-hover:scale-110" />
                    )}
                    <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-500/20 transition duration-500 group-hover:scale-[2.2]" />
                    <ArrowUpRight className="absolute right-3 top-3 -translate-x-2 translate-y-2 text-gold-400 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" size={20} />
                    <div className="relative">
                      <p className="flex items-center gap-1 font-semibold leading-tight"><MapPin size={14} className="text-gold-400" />{l.name}</p>
                      <p className="text-xs text-white/70">{l.projectCount} project{l.projectCount === 1 ? '' : 's'}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EMI */}
      <section className="section bg-white">
        <div className="container grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Plan ahead</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-900 md:text-4xl">What will your home loan EMI be?</h2>
            <p className="mt-4 text-slate-600">Move the sliders to see your monthly instalment, total interest and payable amount. Then talk to us about the right project for your budget.</p>
            <div className="mt-6"><EnquireButton title="Get a personalised plan" className="btn-primary">Talk to an advisor</EnquireButton></div>
          </Reveal>
          <Reveal delay={150}><EmiCalculator /></Reveal>
        </div>
      </section>

      {/* AWARDS */}
      {awards.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading title={titles.awards || 'Awards & Recognitions'} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {awards.map((a, i) => (
                <Reveal key={a._id} delay={(i % 6) * 60}>
                  <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center transition duration-300 hover:-translate-y-1.5 hover:rotate-1 hover:border-gold-500 hover:shadow-glow">
                    {a.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media(a.image)} alt={a.title} loading="lazy" className="max-h-24 w-auto object-contain" />
                    ) : (
                      <Placeholder className="rounded-lg" />
                    )}
                    <p className="text-xs font-semibold text-slate-700">{a.title}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="section bg-white">
          <div className="container">
            <SectionHeading title={titles.testimonials || 'Happy Customers'} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal key={t._id} delay={(i % 3) * 100}>
                  <figure className="card flex h-full flex-col gap-3 p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                    <div className="flex gap-0.5 text-gold-500" aria-label={`${t.rating} out of 5`}>
                      {Array.from({ length: t.rating || 5 }).map((_, k) => <Star key={k} size={16} fill="currentColor" />)}
                    </div>
                    <blockquote className="text-sm leading-relaxed text-slate-700">“{t.text}”</blockquote>
                    <figcaption className="mt-auto flex items-center gap-3 pt-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">{t.name?.[0]?.toUpperCase()}</span>
                      <span>
                        <span className="block text-sm font-semibold">{t.name}</span>
                        {t.designation && <span className="block text-xs text-slate-500">{t.designation}</span>}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DEVELOPERS MARQUEE */}
      {developers.length > 0 && (
        <section className="section overflow-hidden">
          <div className="container">
            <SectionHeading title={titles.developers || 'Developers'} href="/developers" />
          </div>
          <div className="space-y-3">
            {devRows.map((row, i) => (
              <Marquee key={i} reverse={i % 2 === 1}>{row.map(devChip)}</Marquee>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section pt-0">
        <div className="container">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#0f3d36,#196253,#0f3d36)] bg-[length:200%_200%] p-8 text-center text-white animate-gradient md:p-14">
              <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 animate-float rounded-full bg-gold-500/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 right-10 h-56 w-56 animate-float-slow rounded-full bg-brand-400/20 blur-2xl" />
              <h2 className="relative font-serif text-3xl md:text-5xl">Looking for the right property?</h2>
              <p className="relative mx-auto mt-3 max-w-xl text-white/80">Talk to our advisors for site visits, pricing and the latest launches.</p>
              <div className="relative mt-7 flex justify-center">
                <EnquireButton title="Talk to an advisor" className="btn-gold !px-9 !py-3.5 text-base">Get a Free Consultation</EnquireButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
