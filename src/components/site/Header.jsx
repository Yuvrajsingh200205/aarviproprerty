'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, Heart, Menu, Phone, X } from 'lucide-react';
import { useEnquiry } from './EnquiryProvider';
import { useWishlist } from './WishlistProvider';
import { media, telHref } from '@/lib/utils';

export default function Header({ settings, categories = [] }) {
  const [open, setOpen] = useState(false);
  const [dd, setDd] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { open: openEnquiry } = useEnquiry();
  const { count } = useWishlist();
  const phone = settings?.phones?.[0];

  useEffect(() => {
    setOpen(false);
    setDd(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const link = 'nav-link rounded-md px-3 py-2 text-sm font-medium text-ink hover:text-brand-700';
  const cur = (href) => (pathname === href ? 'page' : undefined);

  return (
    <header className={`sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md transition-shadow duration-300 ${scrolled ? 'shadow-card' : ''}`}>
      <div className={`container flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? 'h-14 md:h-16' : 'h-16 md:h-[76px]'}`}>
        <Link href="/" className="flex items-center gap-2" aria-label={`${settings?.siteName || 'Home'} home`}>
          {settings?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media(settings.logo)} alt={settings.siteName} className="h-10 w-auto md:h-12" />
          ) : (
            <span className="font-serif text-xl font-bold text-brand-800 transition-transform duration-300 hover:scale-105 md:text-2xl">
              {settings?.siteName || 'Aarvi Property'}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <Link href="/" className={link} aria-current={cur('/')}>Home</Link>
          <div className="relative" onMouseEnter={() => setDd(true)} onMouseLeave={() => setDd(false)}>
            <button className={`${link} inline-flex items-center gap-1`} aria-expanded={dd} onClick={() => setDd((d) => !d)}>
              Properties <ChevronDown size={14} className={`transition-transform duration-300 ${dd ? 'rotate-180' : ''}`} />
            </button>
            {dd && (
              <div className="absolute left-0 top-full w-64 animate-fade-up pt-2 [animation-duration:.25s]">
                <div className="rounded-xl bg-white p-2 shadow-lift ring-1 ring-black/5">
                  {categories.map((c) => (
                    <Link key={c._id} href={`/projects?property=${c.slug}`} className="block rounded-lg px-3 py-2 text-sm transition hover:translate-x-1 hover:bg-brand-50 hover:text-brand-700">
                      {c.name}
                    </Link>
                  ))}
                  <Link href="/projects" className="mt-1 block rounded-lg border-t px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                    View all projects
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link href="/developers" className={link} aria-current={cur('/developers')}>Developers</Link>
          <Link href="/blogs" className={link} aria-current={cur('/blogs')}>Blogs</Link>
          <Link href="/about" className={link} aria-current={cur('/about')}>About</Link>
          <Link href="/contact" className={link} aria-current={cur('/contact')}>Contact</Link>
        </nav>

        <div className="flex items-center gap-2">
          {phone && (
            <a href={telHref(phone)} className="hidden items-center gap-2 text-sm font-semibold text-brand-800 xl:flex">
              <Phone size={16} /> {phone}
            </a>
          )}
          <Link href="/saved" aria-label={`Saved projects (${count})`} className="relative rounded-full p-2 text-brand-800 transition hover:scale-110 hover:bg-brand-50">
            <Heart size={22} className={count ? 'fill-red-500 text-red-500' : ''} />
            {count > 0 && (
              <span key={count} className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-brand-950">
                {count}
              </span>
            )}
          </Link>
          <button className="btn-primary hidden sm:inline-flex" onClick={() => openEnquiry({ title: 'Enquire Now' })}>
            Enquire Now
          </button>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fade-in border-t bg-white lg:hidden">
          <nav className="container flex flex-col py-3" aria-label="Mobile">
            <Link href="/" className="py-2.5 font-medium">Home</Link>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">Properties</p>
            {categories.map((c) => (
              <Link key={c._id} href={`/projects?property=${c.slug}`} className="py-2 pl-3 text-sm">{c.name}</Link>
            ))}
            <Link href="/projects" className="py-2 pl-3 text-sm font-semibold text-brand-700">View all projects</Link>
            <Link href="/developers" className="mt-2 py-2.5 font-medium">Developers</Link>
            <Link href="/blogs" className="py-2.5 font-medium">Blogs</Link>
            <Link href="/saved" className="py-2.5 font-medium">Saved ({count})</Link>
            <Link href="/about" className="py-2.5 font-medium">About</Link>
            <Link href="/contact" className="py-2.5 font-medium">Contact</Link>
            <div className="mt-3 flex gap-2">
              {phone && <a href={telHref(phone)} className="btn-outline flex-1"><Phone size={16} /> Call</a>}
              <button className="btn-primary flex-1" onClick={() => openEnquiry({ title: 'Enquire Now' })}>Enquire Now</button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
