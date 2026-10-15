'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';
import SearchFilter from './SearchFilter';
import Skyline from './Skyline';
import { media } from '@/lib/utils';

function RotatingWord({ words }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (words.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span className="relative inline-block align-bottom">
      <span key={words[i]} className="text-shimmer inline-block animate-word-in font-semibold">{words[i]}</span>
    </span>
  );
}

export default function Hero({ settings, meta }) {
  const ref = useRef(null);
  const hero = settings.hero || {};
  const words = (hero.title || '').split(' ').filter(Boolean);
  const rotating = meta.categories.filter((c) => c.showInMenu).map((c) => c.name);

  // mouse-follow spotlight + gentle parallax on the blobs
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    el.style.setProperty('--px', `${((x - 0.5) * 30).toFixed(1)}px`);
    el.style.setProperty('--py', `${((y - 0.5) * 30).toFixed(1)}px`);
  };

  return (
    <section ref={ref} onPointerMove={onMove} className="relative isolate overflow-hidden bg-brand-950 text-white">
      {hero.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media(hero.image)} alt="" className="absolute inset-0 -z-30 h-full w-full object-cover opacity-40" />
      )}
      <div className="absolute inset-0 -z-20 animate-gradient bg-[linear-gradient(120deg,#082320,#0f3d36,#196253,#0f3d36,#082320)] bg-[length:300%_300%] opacity-95" />
      <div className="bg-grid absolute inset-0 -z-10" />
      {/* floating colour blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ transform: 'translate(var(--px,0),var(--py,0))', transition: 'transform .3s ease-out' }}>
        <div className="absolute -left-20 top-10 h-80 w-80 animate-blob rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 animate-blob rounded-full bg-gold-500/20 blur-3xl [animation-delay:-5s]" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 animate-blob rounded-full bg-sky-400/10 blur-3xl [animation-delay:-9s]" />
      </div>
      {/* cursor spotlight */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden md:block"
        style={{ background: 'radial-gradient(500px circle at var(--mx,70%) var(--my,30%), rgba(224,185,90,.14), transparent 60%)' }}
      />

      <div className="container relative pb-36 pt-14 md:pb-52 md:pt-24">
        <p className="mb-5 inline-flex animate-fade-in items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400 backdrop-blur">
          <Sparkles size={14} /> Trusted real estate advisors
        </p>

        <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-[1.08] md:text-7xl [perspective:800px]">
          {words.map((w, i) => (
            <span key={i}>
              <span className="inline-block overflow-hidden align-bottom">
                <span
                  className={`inline-block animate-word-in ${i >= words.length - 2 && words.length > 3 ? 'text-shimmer' : ''}`}
                  style={{ animationDelay: `${120 + i * 90}ms` }}
                >
                  {w}
                </span>
              </span>{' '}
            </span>
          ))}
        </h1>

        {hero.subtitle && (
          <p className="mt-5 max-w-2xl animate-fade-up text-base text-white/80 [animation-delay:700ms] md:text-lg">{hero.subtitle}</p>
        )}
        {rotating.length > 0 && (
          <p className="mt-3 animate-fade-up text-lg text-white/90 [animation-delay:850ms] md:text-2xl" aria-hidden="true">
            Discover <RotatingWord words={rotating} /> in Gurugram &amp; Delhi-NCR
          </p>
        )}

        <div className="mt-8 animate-fade-up [animation-delay:1000ms] md:mt-10">
          <SearchFilter meta={meta} variant="hero" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 animate-fade-up [animation-delay:1150ms]">
          {meta.categories.filter((c) => c.showInMenu).map((c) => (
            <Link
              key={c._id}
              href={`/projects?property=${c.slug}`}
              className="rounded-full border border-white/30 px-4 py-1.5 text-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-500 hover:text-brand-950"
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* floating decorative chips */}
        <div className="pointer-events-none absolute right-6 top-24 hidden animate-float rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur-md lg:block">
          <p className="text-xs text-white/60">Handpicked</p>
          <p className="font-serif text-xl text-gold-400">300+ projects</p>
        </div>
        <div className="pointer-events-none absolute right-40 top-64 hidden animate-float-slow rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur-md lg:block [animation-delay:-3s]">
          <p className="text-xs text-white/60">Free</p>
          <p className="font-serif text-xl text-white">Site visits</p>
        </div>
      </div>

      <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full md:h-44" />
      <a href="#explore" aria-label="Scroll to projects" className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 animate-float text-white/70 hover:text-gold-400 md:block">
        <ArrowDown size={22} />
      </a>
    </section>
  );
}
