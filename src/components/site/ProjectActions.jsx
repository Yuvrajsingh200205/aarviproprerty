'use client';
import { Download, MessageCircle, PhoneCall } from 'lucide-react';
import { useEnquiry } from './EnquiryProvider';
import { media, waHref, telHref } from '@/lib/utils';

// Primary CTAs on a project page. Brochure download is gated by a short enquiry form (lead capture).
export default function ProjectActions({ project, whatsapp, phone, layout = 'row' }) {
  const { open } = useEnquiry();
  const wa = waHref(whatsapp, `Hi, I am interested in ${project.name}. Please share details.`);

  const enquire = () =>
    open({
      title: `Enquire about ${project.name}`,
      projectSlug: project.slug,
      projectName: project.name,
      enquiryType: 'Quick Enquiry',
    });

  const brochure = () => {
    if (!project.brochure) return enquire();
    open({
      title: 'Download Brochure',
      subtitle: `Share your details to download the ${project.name} brochure.`,
      projectSlug: project.slug,
      projectName: project.name,
      enquiryType: 'Brochure Download',
      submitLabel: 'Submit & Download',
      onSuccess: () => {
        window.open(media(project.brochure), '_blank', 'noopener');
      },
    });
  };

  const wrap = layout === 'col' ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2';
  return (
    <div className={wrap}>
      <button onClick={enquire} className="btn-gold">Enquire Now</button>
      {project.brochure && (
        <button onClick={brochure} className="btn-outline"><Download size={16} /> Brochure</button>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn border border-[#25D366] text-[#128C4A] hover:bg-[#25D366] hover:text-white">
          <MessageCircle size={16} /> WhatsApp
        </a>
      )}
      {phone && (
        <a href={telHref(phone)} className="btn-ghost border border-slate-300"><PhoneCall size={16} /> Call</a>
      )}
    </div>
  );
}
