'use client';
import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';

const inr = (n) => `₹ ${Math.round(n).toLocaleString('en-IN')}`;
const compact = (n) => {
  if (n >= 1e7) return `₹ ${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹ ${(n / 1e5).toFixed(2)} L`;
  return inr(n);
};

function Slider({ id, label, value, min, max, step, onChange, display }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <label htmlFor={id} className="font-medium text-slate-700">{label}</label>
        <output htmlFor={id} className="rounded-md bg-brand-50 px-2.5 py-1 font-semibold text-brand-800">{display}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full"
        style={{ background: `linear-gradient(90deg,#1d7a65 ${pct}%,#e2e8f0 ${pct}%)` }}
      />
    </div>
  );
}

export default function EmiCalculator({ title = 'EMI Calculator', compactLayout = false }) {
  const [amount, setAmount] = useState(10000000); // ₹1 Cr
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const { emi, total, interest, principalPct } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = years * 12;
    const e = r === 0 ? amount / n : (amount * r * (1 + r) ** n) / ((1 + r) ** n - 1);
    const t = e * n;
    return { emi: e, total: t, interest: t - amount, principalPct: (amount / t) * 100 };
  }, [amount, rate, years]);

  const C = 2 * Math.PI * 52;
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 border-b bg-brand-900 px-5 py-4 text-white">
        <Calculator size={20} className="text-gold-400" />
        <h3 className="font-serif text-xl">{title}</h3>
      </div>
      <div className={`grid gap-6 p-5 md:p-6 ${compactLayout ? '' : 'md:grid-cols-2'}`}>
        <div className="space-y-5">
          <Slider id="emi-amount" label="Loan amount" value={amount} min={1000000} max={100000000} step={500000} onChange={setAmount} display={compact(amount)} />
          <Slider id="emi-rate" label="Interest rate (p.a.)" value={rate} min={6} max={14} step={0.1} onChange={(v) => setRate(Math.round(v * 10) / 10)} display={`${rate.toFixed(1)}%`} />
          <Slider id="emi-years" label="Tenure" value={years} min={5} max={30} step={1} onChange={setYears} display={`${years} yrs`} />
        </div>
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="relative h-40 w-40">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#c8a24a" strokeWidth="14" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#1d7a65"
                strokeWidth="14"
                strokeLinecap="butt"
                strokeDasharray={`${(principalPct / 100) * C} ${C}`}
                style={{ transition: 'stroke-dasharray .5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] uppercase tracking-wide text-slate-500">Monthly EMI</span>
              <span data-testid="emi-value" className="font-serif text-xl font-bold text-brand-900">{inr(emi)}</span>
            </div>
          </div>
          <dl className="grid w-full grid-cols-2 gap-3 text-left text-sm">
            <div className="rounded-lg bg-brand-50 p-3">
              <dt className="flex items-center gap-1.5 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-brand-600" />Principal</dt>
              <dd className="font-semibold">{compact(amount)}</dd>
            </div>
            <div className="rounded-lg bg-gold-400/15 p-3">
              <dt className="flex items-center gap-1.5 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-gold-500" />Interest</dt>
              <dd className="font-semibold">{compact(interest)}</dd>
            </div>
            <div className="col-span-2 rounded-lg bg-slate-100 p-3">
              <dt className="text-xs text-slate-500">Total payable</dt>
              <dd className="font-semibold">{compact(total)}</dd>
            </div>
          </dl>
        </div>
      </div>
      <p className="border-t px-5 py-3 text-xs text-slate-500">Indicative only. Actual EMI depends on your lender&apos;s rate and policies.</p>
    </div>
  );
}
