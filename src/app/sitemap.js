import { api } from '@/lib/api';
import { SITE_URL } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const now = new Date();
  const staticPages = ['', '/projects', '/developers', '/blogs', '/about', '/contact', '/privacy-policy', '/terms-and-conditions'].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
  }));
  try {
    const [projects, devs, blogs] = await Promise.all([
      api('/projects', { query: { limit: 60 } }),
      api('/developers'),
      api('/blogs', { query: { limit: 50 } }),
    ]);
    const all = [];
    const pages = projects.meta.pages;
    all.push(...projects.data);
    for (let p = 2; p <= pages; p += 1) {
      // eslint-disable-next-line no-await-in-loop
      all.push(...(await api('/projects', { query: { limit: 60, page: p } })).data);
    }
    return [
      ...staticPages,
      ...all.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, lastModified: p.createdAt })),
      ...devs.data.map((d) => ({ url: `${SITE_URL}/developers/${d.slug}` })),
      ...blogs.data.map((b) => ({ url: `${SITE_URL}/blogs/${b.slug}`, lastModified: b.publishedAt })),
    ];
  } catch {
    return staticPages;
  }
}
