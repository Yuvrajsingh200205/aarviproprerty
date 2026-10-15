'use client';
import { useEnquiry } from './EnquiryProvider';

export default function EnquireButton({ children = 'Enquire Now', className = 'btn-gold', ...opts }) {
  const { open } = useEnquiry();
  return (
    <button className={className} onClick={() => open(opts)}>
      {children}
    </button>
  );
}
