'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { media } from '@/lib/utils';

export default function Gallery({ images = [], name = '' }) {
  const [idx, setIdx] = useState(null);
  const close = () => setIdx(null);
  const prev = () => setIdx((i) => (i + images.length - 1) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    if (idx === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, images.length]);

  if (!images.length) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((src, i) => (
          <button key={src + i} onClick={() => setIdx(i)} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100" aria-label={`Open image ${i + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media(src)} alt={`${name} ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          </button>
        ))}
      </div>
      {idx !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" onClick={close}>
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white" onClick={close} aria-label="Close"><X /></button>
          {images.length > 1 && (
            <>
              <button className="absolute left-3 rounded-full bg-white/10 p-3 text-white" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous"><ChevronLeft /></button>
              <button className="absolute right-3 rounded-full bg-white/10 p-3 text-white" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next"><ChevronRight /></button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media(images[idx])} alt={`${name} ${idx + 1}`} className="max-h-[88vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
