export const cn = (...args) => args.flat().filter(Boolean).join(' ');

export const media = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('/')) return url;
  return `/${url}`;
};

export const telHref = (phone = '') => `tel:${phone.replace(/[^+\d]/g, '')}`;
export const waHref = (number = '', text = '') => {
  const digits = number.replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

export const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const truncate = (s = '', n = 160) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export const stripMarkdown = (s = '') =>
  s
    .replace(/[#>*_`~-]+/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
