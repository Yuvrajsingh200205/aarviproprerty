import { api } from '@/lib/api';
import EnquiryProvider from '@/components/site/EnquiryProvider';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import WhatsAppFab from '@/components/site/WhatsAppFab';
import WishlistProvider from '@/components/site/WishlistProvider';
import ScrollEffects from '@/components/site/ScrollEffects';

export async function generateMetadata() {
  try {
    const { data } = await api('/settings');
    return {
      title: { default: data.seoTitle || data.siteName, template: `%s | ${data.siteName}` },
      description: data.seoDescription || undefined,
      icons: data.favicon ? { icon: data.favicon } : undefined,
    };
  } catch {
    return {};
  }
}

export default async function SiteLayout({ children }) {
  let settings = null;
  let categories = [];
  try {
    const [s, m] = await Promise.all([api('/settings'), api('/meta')]);
    settings = s.data;
    categories = m.data.categories.filter((c) => c.showInMenu);
  } catch {
    /* API down: render shell without dynamic data */
  }
  return (
    <WishlistProvider>
      <EnquiryProvider>
        <ScrollEffects />
        <Header settings={settings} categories={categories} />
        <main id="main">{children}</main>
        <Footer settings={settings} categories={categories} />
        <WhatsAppFab whatsapp={settings?.whatsapp} phone={settings?.phones?.[0]} siteName={settings?.siteName} />
      </EnquiryProvider>
    </WishlistProvider>
  );
}
