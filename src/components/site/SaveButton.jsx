'use client';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from './WishlistProvider';

export default function SaveButton({ slug, name, className = 'absolute right-3 top-3', size = 18 }) {
  const { has, toggle } = useWishlist();
  const [burst, setBurst] = useState(0);
  const saved = has(slug);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!saved) setBurst((b) => b + 1);
        toggle(slug);
      }}
      className={`z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-card backdrop-blur transition hover:scale-110 ${className}`}
    >
      {burst > 0 && saved && <span key={burst} className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping2" aria-hidden="true" />}
      <Heart
        key={`${saved}-${burst}`}
        size={size}
        className={`${saved ? 'animate-pop fill-red-500 text-red-500' : 'text-slate-600'}`}
      />
    </button>
  );
}
