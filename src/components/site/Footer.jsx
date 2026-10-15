import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import InstantCallback from './InstantCallback';
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from './Icons';
import { telHref } from '@/lib/utils';

const SOCIALS = [
  ['facebook', FacebookIcon, 'Facebook'],
  ['instagram', InstagramIcon, 'Instagram'],
  ['linkedin', LinkedinIcon, 'LinkedIn'],
  ['twitter', TwitterIcon, 'X (Twitter)'],
  ['youtube', YoutubeIcon, 'YouTube'],
];

export default function Footer({ settings, categories = [] }) {
  const s = settings || {};
  return (
    <footer className="mt-16 bg-brand-950 text-white/80">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-serif text-2xl text-white">{s.siteName || 'Aarvi Property'}</h3>
          {s.footerText && <p className="mt-3 text-sm leading-relaxed">{s.footerText}</p>}
          {s.reraNo && <p className="mt-3 text-xs text-white/60">Agent RERA: {s.reraNo}</p>}
          <div className="mt-5 flex gap-2">
            {SOCIALS.filter(([k]) => s.social?.[k]).map(([k, Icon, label]) => (
              <a key={k} href={s.social[k]} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-gold-500 hover:text-brand-950">
                <Icon width={16} height={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-gold-400">About Us</Link></li>
            <li><Link href="/projects" className="hover:text-gold-400">All Projects</Link></li>
            <li><Link href="/developers" className="hover:text-gold-400">Developers</Link></li>
            <li><Link href="/blogs" className="hover:text-gold-400">Blogs</Link></li>
            <li><Link href="/contact" className="hover:text-gold-400">Contact Us</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-gold-400">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions" className="hover:text-gold-400">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Properties</h4>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c._id}><Link href={`/projects?property=${c.slug}`} className="hover:text-gold-400">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            {s.address && (
              <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-gold-400" />
                {s.mapLink ? <a href={s.mapLink} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400">{s.address}</a> : s.address}
              </li>
            )}
            {(s.phones || []).map((p) => (
              <li key={p} className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-gold-400" /><a href={telHref(p)} className="hover:text-gold-400">{p}</a></li>
            ))}
            {(s.emails || []).map((e) => (
              <li key={e} className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-gold-400" /><a href={`mailto:${e}`} className="hover:text-gold-400">{e}</a></li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-white/10 p-4">
            <h5 className="mb-3 text-sm font-semibold text-white">Instant Callback</h5>
            <InstantCallback />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {s.siteName || 'Aarvi Property'}. All rights reserved.
      </div>
    </footer>
  );
}
