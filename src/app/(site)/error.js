'use client';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

// Shown when a page cannot load its data (for example the API is down).
export default function SiteError({ reset }) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="font-serif text-3xl text-brand-900">We&apos;re having trouble loading this page</h1>
      <p className="max-w-md text-slate-600">
        The server did not respond. Please try again in a moment. If you manage this site, check that the API server and database are running.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary"><RefreshCw size={16} /> Try again</button>
        <Link href="/contact" className="btn-outline">Contact us</Link>
      </div>
    </div>
  );
}
