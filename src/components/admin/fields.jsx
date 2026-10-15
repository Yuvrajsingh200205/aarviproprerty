'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { FileText, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { adminApi } from '@/lib/client-api';
import { media } from '@/lib/utils';
import { useToast } from './ui';

// ---------- single image / file upload ----------
export function ImageField({ value, onChange, accept = 'image/*', kind = 'image' }) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef();
  const { toast } = useToast();

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const res = await adminApi.upload(file);
      onChange(res.data.url);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
        {value && kind === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media(value)} alt="" className="h-full w-full object-cover" />
        ) : value ? (
          <FileText className="text-slate-400" />
        ) : (
          <ImagePlus className="text-slate-300" />
        )}
      </div>
      <div className="min-w-0 space-y-1.5">
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={pick} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline !px-3 !py-1.5" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : null} {value ? 'Replace' : 'Upload'}
          </button>
          {value && (
            <button type="button" className="btn-ghost !px-3 !py-1.5 text-red-600" onClick={() => onChange('')}>Remove</button>
          )}
        </div>
        {value && <p className="max-w-[240px] truncate text-xs text-slate-500">{value}</p>}
      </div>
    </div>
  );
}

// ---------- multiple images ----------
export function ImagesField({ value = [], onChange }) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef();
  const { toast } = useToast();

  const pick = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const f of files) {
        // eslint-disable-next-line no-await-in-loop
        const res = await adminApi.upload(f);
        urls.push(res.data.url);
      }
      onChange([...value, ...urls]);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const move = (i, d) => {
    const arr = [...value];
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {value.map((src, i) => (
          <div key={src + i} className="group relative aspect-square overflow-hidden rounded-lg border bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media(src)} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1 opacity-0 transition group-hover:opacity-100">
              <button type="button" onClick={() => move(i, -1)} className="px-1.5 text-xs text-white" aria-label="Move left">◀</button>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="px-1.5 text-white" aria-label="Remove image"><Trash2 size={14} /></button>
              <button type="button" onClick={() => move(i, 1)} className="px-1.5 text-xs text-white" aria-label="Move right">▶</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:bg-slate-50">
          {busy ? <Loader2 className="animate-spin" size={20} /> : <ImagePlus size={20} />}
          {busy ? 'Uploading…' : 'Add images'}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={pick} />
    </div>
  );
}

// ---------- tags (string[]) ----------
export function TagsField({ value = [], onChange, placeholder = 'Type and press Enter', id }) {
  const [text, setText] = useState('');
  const add = () => {
    const parts = text.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setText('');
  };
  return (
    <div className="rounded-lg border border-slate-300 bg-white p-2 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/20">
      <div className="flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X size={12} /></button>
          </span>
        ))}
        <input
          id={id}
          className="min-w-[140px] flex-1 border-0 bg-transparent px-1.5 py-1 text-sm outline-none"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
        />
      </div>
    </div>
  );
}

// ---------- repeatable group of sub-fields ----------
export function ListField({ value = [], onChange, itemFields, addLabel = 'Add item' }) {
  const uid = useId();
  const update = (i, key, v) => onChange(value.map((it, k) => (k === i ? { ...it, [key]: v } : it)));
  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            {itemFields.map((f) => (
              <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="label" htmlFor={`${uid}-${i}-${f.name}`}>{f.label}</label>
                {f.type === 'image' ? (
                  <ImageField value={item[f.name]} onChange={(v) => update(i, f.name, v)} />
                ) : f.type === 'textarea' ? (
                  <textarea id={`${uid}-${i}-${f.name}`} rows={3} className="input" value={item[f.name] || ''} onChange={(e) => update(i, f.name, e.target.value)} />
                ) : (
                  <input id={`${uid}-${i}-${f.name}`} className="input" value={item[f.name] || ''} placeholder={f.placeholder} onChange={(e) => update(i, f.name, e.target.value)} />
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="self-start rounded p-1.5 text-red-600 hover:bg-red-50" aria-label="Remove item">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" className="btn-outline !py-1.5" onClick={() => onChange([...value, {}])}>
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}

// ---------- markdown editor with preview ----------
export function MarkdownField({ value = '', onChange, rows = 10, id }) {
  const [preview, setPreview] = useState(false);
  return (
    <div>
      <div className="mb-1.5 flex gap-1 text-xs">
        <button type="button" onClick={() => setPreview(false)} className={`rounded px-2.5 py-1 font-semibold ${!preview ? 'bg-brand-800 text-white' : 'bg-slate-100'}`}>Write</button>
        <button type="button" onClick={() => setPreview(true)} className={`rounded px-2.5 py-1 font-semibold ${preview ? 'bg-brand-800 text-white' : 'bg-slate-100'}`}>Preview</button>
        <span className="ml-auto self-center text-slate-400">Markdown supported (## heading, **bold**, - list)</span>
      </div>
      {preview ? (
        <div className="prose prose-sm prose-slate min-h-[180px] max-w-none rounded-lg border bg-white p-4">
          {value ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown> : <p className="text-slate-400">Nothing to preview</p>}
        </div>
      ) : (
        <textarea id={id} rows={rows} className="input font-mono text-[13px]" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

// ---------- ref select (loads options from admin API) ----------
export function RefField({ value, onChange, endpoint, labelKey = 'name', allowEmpty = true, required, id }) {
  const [opts, setOpts] = useState(null);
  useEffect(() => {
    let alive = true;
    adminApi
      .get(`/${endpoint}?limit=100&sort=name`)
      .then((r) => alive && setOpts(r.data))
      .catch(() => alive && setOpts([]));
    return () => {
      alive = false;
    };
  }, [endpoint]);
  return (
    <select id={id} className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} required={required} disabled={!opts}>
      <option value="">{!opts ? 'Loading…' : allowEmpty ? '— None —' : 'Select…'}</option>
      {(opts || []).map((o) => (
        <option key={o._id} value={o._id}>{o[labelKey]}</option>
      ))}
    </select>
  );
}
