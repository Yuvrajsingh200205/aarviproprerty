'use client';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { request } from '@/lib/client-api';
import { PageHeader, useToast } from '@/components/admin/ui';

export default function AccountPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    request('/auth/me', { auth: true }).then((r) => { setName(r.user.name); setEmail(r.user.email); }).catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy('profile');
    try {
      await request('/auth/me', { method: 'PUT', body: { name }, auth: true });
      toast('Profile updated');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy('');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError('');
    if (pw.newPassword !== pw.confirm) return setError('New passwords do not match');
    if (pw.newPassword.length < 8) return setError('New password must be at least 8 characters');
    setBusy('password');
    try {
      await request('/auth/change-password', { method: 'POST', body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword }, auth: true });
      toast('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
    return undefined;
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="My account" />
      <form onSubmit={saveProfile} className="card mb-6 space-y-4 p-6">
        <h2 className="font-sans text-base font-semibold">Profile</h2>
        <div><label className="label" htmlFor="acc-email">Email</label><input id="acc-email" className="input" value={email} disabled /></div>
        <div><label className="label" htmlFor="acc-name">Name</label><input id="acc-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} /></div>
        <button className="btn-primary" disabled={busy === 'profile'}>{busy === 'profile' && <Loader2 size={16} className="animate-spin" />} Save profile</button>
      </form>

      <form onSubmit={changePassword} className="card space-y-4 p-6">
        <h2 className="font-sans text-base font-semibold">Change password</h2>
        <div><label className="label" htmlFor="pw-cur">Current password</label><input id="pw-cur" type="password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" required /></div>
        <div><label className="label" htmlFor="pw-new">New password</label><input id="pw-new" type="password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" required /></div>
        <div><label className="label" htmlFor="pw-conf">Confirm new password</label><input id="pw-conf" type="password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" required /></div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">{error}</p>}
        <button className="btn-primary" disabled={busy === 'password'}>{busy === 'password' && <Loader2 size={16} className="animate-spin" />} Update password</button>
      </form>
    </div>
  );
}
