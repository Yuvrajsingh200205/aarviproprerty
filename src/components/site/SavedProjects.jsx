'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { request } from '@/lib/client-api';
import ProjectCard from './ProjectCard';
import { useWishlist } from './WishlistProvider';

export default function SavedProjects() {
  const { slugs } = useWishlist();
  const [items, setItems] = useState(null);
  const key = slugs.join(',');

  useEffect(() => {
    if (!key) {
      setItems([]);
      return undefined;
    }
    let alive = true;
    request(`/projects?slugs=${encodeURIComponent(key)}&limit=60`)
      .then((r) => alive && setItems(r.data))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [key]);

  if (items === null) return <p className="py-16 text-center text-slate-500" role="status">Loading your saved projects…</p>;
  if (!items.length) {
    return (
      <div className="card flex flex-col items-center gap-3 py-16 text-center">
        <Heart size={44} className="text-slate-300" />
        <p className="font-semibold">You have not saved any projects yet.</p>
        <p className="text-sm text-slate-500">Tap the heart on any project card to keep it here.</p>
        <Link href="/projects" className="btn-primary">Browse projects</Link>
      </div>
    );
  }
  // keep the order in which the user saved them
  const ordered = slugs.map((s) => items.find((p) => p.slug === s)).filter(Boolean);
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {ordered.map((p) => <ProjectCard key={p._id} project={p} />)}
    </div>
  );
}
