'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'aarvi_saved_projects';
const Ctx = createContext({ slugs: [], has: () => false, toggle: () => {}, count: 0 });
export const useWishlist = () => useContext(Ctx);

const read = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((s) => typeof s === 'string').slice(0, 60) : [];
  } catch {
    return [];
  }
};

// Saved ("favourite") projects, kept in this browser only.
export default function WishlistProvider({ children }) {
  const [slugs, setSlugs] = useState([]);

  useEffect(() => {
    setSlugs(read());
    const onStorage = (e) => e.key === KEY && setSlugs(read());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((slug) => {
    setSlugs((cur) => {
      const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [slug, ...cur].slice(0, 60);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ slugs, count: slugs.length, has: (s) => slugs.includes(s), toggle }), [slugs, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
