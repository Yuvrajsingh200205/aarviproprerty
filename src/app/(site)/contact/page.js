import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import { telHref, waHref } from '@/lib/utils';
import EnquiryForm from '@/components/site/EnquiryForm';
import { WhatsAppIcon } from '@/components/site/Icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contact Us' };

export default async function ContactPage() {
  const [{ data: s }, { data: meta }] = await Promise.all([api('/settings'), api('/meta')]);
  const wa = waHref(s.whatsapp);
  return (
    <>
      <section className="bg-brand-900 py-12 text-white md:py-16">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-5xl">Contact Us</h1>
          <p className="mt-3 text-lg text-white/80">For everything between a home and a hub.</p>
        </div>
      </section>
      <div className="container grid gap-8 py-12 lg:grid-cols-2">
        <div className="space-y-5">
          {s.address && (
            <div className="card flex gap-4 p-5">
              <MapPin className="mt-1 shrink-0 text-gold-600" />
              <div>
                <h2 className="font-semibold">Address</h2>
                <p className="mt-1 text-slate-600">{s.address}</p>
                {s.mapLink && <a href={s.mapLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">Get directions</a>}
              </div>
            </div>
          )}
          {s.phones?.length > 0 && (
            <div className="card flex gap-4 p-5">
              <Phone className="mt-1 shrink-0 text-gold-600" />
              <div>
                <h2 className="font-semibold">Phone</h2>
                {s.phones.map((p) => <a key={p} href={telHref(p)} className="mt-1 block text-slate-600 hover:text-brand-700">{p}</a>)}
                {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#128C4A]"><WhatsAppIcon width={16} height={16} /> WhatsApp us</a>}
              </div>
            </div>
          )}
          {s.emails?.length > 0 && (
            <div className="card flex gap-4 p-5">
              <Mail className="mt-1 shrink-0 text-gold-600" />
              <div>
                <h2 className="font-semibold">Email</h2>
                {s.emails.map((e) => <a key={e} href={`mailto:${e}`} className="mt-1 block text-slate-600 hover:text-brand-700">{e}</a>)}
              </div>
            </div>
          )}
          {s.workingHours && (
            <div className="card flex gap-4 p-5">
              <Clock className="mt-1 shrink-0 text-gold-600" />
              <div><h2 className="font-semibold">Working hours</h2><p className="mt-1 text-slate-600">{s.workingHours}</p></div>
            </div>
          )}
          {s.mapEmbed && s.mapEmbed.startsWith('https://www.google.com/maps/embed') && (
            <iframe title="Office location map" src={s.mapEmbed} loading="lazy" className="h-72 w-full rounded-xl border-0 shadow-card" referrerPolicy="no-referrer-when-downgrade" />
          )}
        </div>
        <div className="card h-fit p-6">
          <h2 className="font-serif text-2xl text-brand-900">We&apos;re here to help</h2>
          <p className="mb-5 mt-1 text-sm text-slate-600">Leave a message and we will get back to you.</p>
          <EnquiryForm
            enquiryType="Contact Form"
            showEnquiryFor
            enquiryForOptions={meta.categories.map((c) => c.name)}
          />
        </div>
      </div>
    </>
  );
}
