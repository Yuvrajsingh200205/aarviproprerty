'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Reveal from './Reveal';

// Scroll-snap carousel: touch friendly, optional autoplay (pauses on hover / focus / touch).
export default function Carousel({ children, itemClass = 'w-[78%] sm:w-[46%] lg:w-[31%] xl:w-[23.5%]', autoplay = 0 }) {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);
  const items = Array.isArray(children) ? children : [children];

  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!autoplay || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: el.clientWidth * 0.5, behavior: 'smooth' });
    }, autoplay);
    return () => clearInterval(t);
  }, [autoplay, paused]);

  // 4 cards fit on wide screens, so arrows are only needed there for 5+ items; 3-4 items still scroll on tablets.
  const arrows = items.length > 4 ? 'md:flex' : items.length > 2 ? 'md:flex xl:hidden' : 'hidden';
  const arrowCls = `absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lift transition hover:scale-110 hover:bg-brand-800 hover:text-white ${arrows}`;
  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <button onClick={() => scroll(-1)} aria-label="Previous" className={`${arrowCls} -left-3`}>
        <ChevronLeft size={20} />
      </button>
      <div ref={ref} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4 pt-1">
        {items.map((child, i) => (
          <Reveal key={i} delay={(i % 4) * 90} className={`shrink-0 snap-start ${itemClass}`}>{child}</Reveal>
        ))}
      </div>
      <button onClick={() => scroll(1)} aria-label="Next" className={`${arrowCls} -right-3`}>
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
