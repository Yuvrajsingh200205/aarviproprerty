'use client';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

// Top progress bar + back-to-top button.
export default function ScrollEffects() {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      setShow(window.scrollY > 700);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden="true">
        <div className="h-full bg-gradient-to-r from-brand-500 via-gold-400 to-gold-500" style={{ width: `${progress}%` }} />
      </div>
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-[7.5rem] right-4 z-40 lg:bottom-20 flex h-11 w-11 items-center justify-center rounded-full bg-brand-900 text-white shadow-lift transition-all duration-300 hover:-translate-y-1 hover:bg-gold-500 hover:text-brand-950 ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      >
        <ArrowUp size={20} />
      </button>
    </>
  );
}
