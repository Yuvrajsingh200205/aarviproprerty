import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

export default function SectionHeading({ title, subtitle, href, hrefLabel = 'View all', center = false, light = false, children }) {
  return (
    <Reveal className={`mb-8 flex flex-wrap items-end gap-4 ${center ? 'justify-center text-center' : 'justify-between'}`}>
      <div>
        <h2 className={`font-serif text-2xl font-semibold md:text-3xl ${light ? 'text-white' : 'text-brand-900'}`}>{title}</h2>
        <span
          className="mt-2 block h-1 w-14 origin-left rounded bg-gradient-to-r from-gold-500 to-gold-400 transition-transform delay-300 duration-700 group-data-[reveal=hidden]/reveal:scale-x-0"
          style={center ? { marginInline: 'auto' } : undefined}
        />
        {subtitle && <p className={`mt-3 max-w-2xl text-sm md:text-base ${light ? 'text-white/80' : 'text-slate-600'}`}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {href && (
          <Link href={href} className={`group/link inline-flex items-center gap-1 text-sm font-semibold ${light ? 'text-gold-400' : 'text-brand-700'}`}>
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_2px] bg-bottom bg-no-repeat transition-[background-size] duration-300 group-hover/link:bg-[length:100%_2px]">{hrefLabel}</span>
            <ArrowRight size={16} className="transition-transform duration-300 group-hover/link:translate-x-1" />
          </Link>
        )}
      </div>
    </Reveal>
  );
}
