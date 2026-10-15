'use client';
import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { request } from '@/lib/client-api';

export default function EnquiryForm({
  enquiryType = 'Quick Enquiry',
  enquiryFor = '',
  projectSlug,
  submitLabel = 'Submit',
  compact = false,
  dark = false,
  showEnquiryFor = false,
  enquiryForOptions = [],
  autoFocus = false,
  onSuccess,
}) {
  const [values, setValues] = useState({ name: '', phone: '', email: '', message: '', enquiryFor, website: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [serverError, setServerError] = useState('');

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (values.name.trim().length < 2) e.name = 'Please enter your name';
    if (!/^[+()\-\s\d]{7,18}$/.test(values.phone.trim())) e.phone = 'Enter a valid phone number';
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email.trim())) e.email = 'Enter a valid email';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setStatus('sending');
    try {
      await request('/enquiries', {
        method: 'POST',
        body: {
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          enquiryType,
          enquiryFor: values.enquiryFor,
          projectSlug,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          website: values.website,
        },
      });
      setStatus('done');
      onSuccess?.();
    } catch (err) {
      setServerError(err.message);
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className={`flex flex-col items-center gap-2 py-6 text-center ${dark ? 'text-white' : 'text-brand-900'}`} role="status">
        <CheckCircle2 size={44} className="text-brand-500" />
        <p className="text-lg font-semibold">Thank you!</p>
        <p className={`text-sm ${dark ? 'text-white/80' : 'text-slate-600'}`}>
          Your enquiry has been received. Our team will contact you shortly.
        </p>
      </div>
    );
  }

  const field = 'input';
  return (
    <form onSubmit={submit} noValidate className="space-y-3" aria-label={enquiryType}>
      <div>
        <label className={`label ${dark ? '!text-white/80' : ''}`} htmlFor={`name-${enquiryType}`}>Name*</label>
        <input id={`name-${enquiryType}`} className={field} value={values.name} onChange={set('name')} autoFocus={autoFocus} autoComplete="name" placeholder="Your full name" />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>
      <div className={compact ? '' : 'grid gap-3 sm:grid-cols-2'}>
        <div className={compact ? 'mb-3' : ''}>
          <label className={`label ${dark ? '!text-white/80' : ''}`} htmlFor={`phone-${enquiryType}`}>Phone*</label>
          <input id={`phone-${enquiryType}`} className={field} value={values.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="+91 98XXXXXXXX" />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>
        {!compact && (
          <div>
            <label className="label" htmlFor={`email-${enquiryType}`}>Email</label>
            <input id={`email-${enquiryType}`} type="email" className={field} value={values.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
        )}
      </div>
      {showEnquiryFor && (
        <div>
          <label className="label" htmlFor={`for-${enquiryType}`}>Interested in</label>
          <select id={`for-${enquiryType}`} className={field} value={values.enquiryFor} onChange={set('enquiryFor')}>
            <option value="">Select</option>
            {enquiryForOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      )}
      {!compact && (
        <div>
          <label className="label" htmlFor={`msg-${enquiryType}`}>Message</label>
          <textarea id={`msg-${enquiryType}`} rows={3} className={field} value={values.message} onChange={set('message')} placeholder="Tell us what you are looking for" />
        </div>
      )}
      {/* honeypot: hidden from humans */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>Website<input tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} /></label>
      </div>
      {serverError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">{serverError}</p>}
      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
        {status === 'sending' ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : submitLabel}
      </button>
    </form>
  );
}
