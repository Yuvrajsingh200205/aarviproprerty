import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <p className="font-serif text-7xl font-bold text-brand-800">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-md text-slate-600">The page you are looking for does not exist or may have been moved.</p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">Back to home</Link>
        <Link href="/projects" className="btn-outline">Browse projects</Link>
      </div>
    </div>
  );
}
