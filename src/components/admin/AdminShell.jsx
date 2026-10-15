'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Award, BookOpen, Building2, Building, ExternalLink, FolderTree, Inbox, LayoutDashboard, LogOut, MapPin,
  Menu, MessageSquareQuote, Settings, UserCircle, X,
} from 'lucide-react';
import { getToken, request, setToken } from '@/lib/client-api';
import { ToastProvider, Spinner } from './ui';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/projects', label: 'Projects', icon: Building2 },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/locations', label: 'Locations', icon: MapPin },
  { href: '/admin/developers', label: 'Developers', icon: Building },
  { href: '/admin/blogs', label: 'Blogs', icon: BookOpen },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { href: '/admin/awards', label: 'Awards', icon: Award },
  { href: '/admin/settings', label: 'Site settings', icon: Settings },
  { href: '/admin/account', label: 'My account', icon: UserCircle },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [menu, setMenu] = useState(false);
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    if (!getToken()) {
      router.replace('/admin/login');
      return;
    }
    let alive = true;
    request('/auth/me', { auth: true })
      .then((r) => {
        if (!alive) return;
        setUser(r.user);
        setAuthError('');
        setReady(true);
      })
      .catch((err) => {
        if (!alive) return;
        // Only a real 401 means the session is invalid. Network errors / reloads keep the token.
        if (err.status === 401) {
          setToken(null);
          router.replace('/admin/login');
        } else {
          setAuthError(err.message || 'Could not reach the server');
        }
      });
    return () => {
      alive = false;
    };
  }, [isLogin, router, attempt]);

  useEffect(() => setMenu(false), [pathname]);

  const logout = () => {
    setToken(null);
    router.replace('/admin/login');
  };

  if (isLogin) return <ToastProvider>{children}</ToastProvider>;
  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
        <p className="text-sm text-red-600" role="alert">{authError}</p>
        <button className="btn-primary" onClick={() => { setAuthError(''); setAttempt((n) => n + 1); }}>Try again</button>
      </div>
    );
  }
  if (!ready) return <div className="min-h-screen bg-slate-50"><Spinner /></div>;

  const nav = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Admin">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={18} /> {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 font-sans">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-brand-950 lg:flex">
          <div className="border-b border-white/10 px-5 py-5">
            <p className="font-serif text-xl text-white">Aarvi Property</p>
            <p className="text-xs text-white/50">Admin panel</p>
          </div>
          <div className="flex-1 overflow-y-auto">{nav}</div>
          <a href="/" target="_blank" rel="noopener noreferrer" className="m-3 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2.5 text-sm text-white hover:bg-white/20">
            <ExternalLink size={16} /> View website
          </a>
        </aside>

        {menu && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} />
            <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-brand-950">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <p className="font-serif text-xl text-white">Aarvi Property</p>
                <button onClick={() => setMenu(false)} className="text-white" aria-label="Close menu"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto">{nav}</div>
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4">
            <button className="rounded-lg p-2 lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu"><Menu /></button>
            <span className="hidden text-sm text-slate-500 lg:block">Signed in as <b className="text-ink">{user?.name}</b> ({user?.email})</span>
            <button onClick={logout} className="btn-ghost !py-1.5"><LogOut size={16} /> Logout</button>
          </header>
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
