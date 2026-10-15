import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function pageList(page, pages) {
  const set = new Set([1, pages, page, page - 1, page + 1, page - 2, page + 2].filter((n) => n >= 1 && n <= pages));
  const arr = [...set].sort((a, b) => a - b);
  const out = [];
  arr.forEach((n, i) => {
    if (i && n - arr[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

export default function Pagination({ page, pages, basePath, params = {} }) {
  if (pages <= 1) return null;
  const href = (n) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && sp.set(k, v));
    if (n > 1) sp.set('page', String(n));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const item = 'inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold';
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className={`${item} bg-white shadow-card hover:bg-brand-50`} aria-label="Previous page"><ChevronLeft size={16} /></Link>
      )}
      {pageList(page, pages).map((n, i) =>
        n === '…' ? (
          <span key={`e${i}`} className="px-1 text-slate-400">…</span>
        ) : (
          <Link key={n} href={href(n)} aria-current={n === page ? 'page' : undefined} className={`${item} ${n === page ? 'bg-brand-800 text-white' : 'bg-white shadow-card hover:bg-brand-50'}`}>{n}</Link>
        )
      )}
      {page < pages && (
        <Link href={href(page + 1)} className={`${item} bg-white shadow-card hover:bg-brand-50`} aria-label="Next page"><ChevronRight size={16} /></Link>
      )}
    </nav>
  );
}
