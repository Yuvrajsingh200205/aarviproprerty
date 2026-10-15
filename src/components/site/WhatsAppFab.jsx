'use client';
import { Phone } from 'lucide-react';
import { WhatsAppIcon } from './Icons';
import { telHref, waHref } from '@/lib/utils';

export default function WhatsAppFab({ whatsapp, phone, siteName }) {
  const wa = waHref(whatsapp, `Hi ${siteName || ''}, I am interested in a property.`);
  if (!wa && !phone) return null;
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-3">
      {phone && (
        <a href={telHref(phone)} aria-label="Call us" className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-800 text-white shadow-lift hover:bg-brand-900 lg:hidden">
          <Phone size={22} />
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift hover:brightness-95">
          <WhatsAppIcon width={26} height={26} />
        </a>
      )}
    </div>
  );
}
