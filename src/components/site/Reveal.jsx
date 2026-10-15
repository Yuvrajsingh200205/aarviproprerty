'use client';
import { useEffect, useRef, useState } from 'react';

// Fades + slides children in when they scroll into view. Content is fully visible without JS and for
// elements that are already on screen at load, so nothing flashes or stays hidden.
export default function Reveal({ as: Tag = 'div', delay = 0, y = 28, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [state, setState] = useState('ssr'); // ssr (visible) -> hidden -> shown

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return undefined;
    setState('hidden');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('shown');
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style =
    state === 'hidden'
      ? { opacity: 0, transform: `translateY(${y}px)` }
      : state === 'shown'
        ? {
            opacity: 1,
            transform: 'none',
            transition: `opacity .7s ease ${delay}ms, transform .8s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
          }
        : undefined;

  return (
    <Tag ref={ref} data-reveal={state === 'ssr' ? 'shown' : state} className={`group/reveal ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}
