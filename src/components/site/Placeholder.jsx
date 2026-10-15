import { Building2 } from 'lucide-react';

// Shown when a project has no uploaded image yet.
export default function Placeholder({ label, className = '' }) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-4 text-center text-white/90 ${className}`}>
      <Building2 size={32} className="text-gold-400" />
      {label && <span className="line-clamp-2 font-serif text-lg leading-tight">{label}</span>}
    </div>
  );
}
