'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { getToken, request, setToken } from '@/lib/client-api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace('/admin');
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await request('/auth/login', { method: 'POST', body: { email, password } });
      setToken(res.token);
      router.replace('/admin');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 to-brand-800 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lift" aria-label="Admin login">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-800"><Lock size={22} /></span>
          <h1 className="font-sans text-2xl font-bold">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your website</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />} Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
