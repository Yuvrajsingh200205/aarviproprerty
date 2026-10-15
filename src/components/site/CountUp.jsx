'use client';
import { useEffect, useRef, useState } from 'react';

// "1000+" -> animates 0 -> 1000 and keeps the suffix. Non numeric values are shown as is.
export default function CountUp({ value, duration = 1600, className = '' }) {
  const text = String(value ?? '');
  const m = text.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
  const ref = useRef(null);
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const target = parseFloat(m[2].replace(/,/g, ''));
    const decimals = (m[2].split('.')[1] || '').length;
    const useCommas = m[2].includes(',');
    const fmt = (n) => (useCommas ? n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : n.toFixed(decimals));
    let raf;
    const run = () => {
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - (1 - p) ** 3;
        setShown(`${m[1]}${fmt(target * eased)}${m[3]}`);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        setShown(`${m[1]}${fmt(0)}${m[3]}`);
        run();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, duration]);

  return <span ref={ref} className={className} aria-label={text}>{shown}</span>;
}
