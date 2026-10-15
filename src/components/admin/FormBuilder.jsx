'use client';
import { ImageField, ImagesField, ListField, MarkdownField, RefField, TagsField } from './fields';

export const getIn = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
export const setIn = (obj, path, val) => {
  const keys = path.split('.');
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = clone;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = val;
    else {
      cur[k] = cur[k] && typeof cur[k] === 'object' ? { ...cur[k] } : {};
      cur = cur[k];
    }
  });
  return clone;
};

// Turns an API document into editable form values (populated refs -> ids).
export function toFormValues(doc, fields, defaults = {}) {
  let out = { ...defaults, ...doc };
  fields.forEach((f) => {
    if (f.type === 'ref') {
      const v = getIn(doc, f.name);
      if (v && typeof v === 'object') out = setIn(out, f.name, v._id);
    }
    if (f.type === 'datetime' || f.type === 'date') {
      const v = getIn(doc, f.name);
      if (v) out = setIn(out, f.name, new Date(v).toISOString().slice(0, 16));
    }
  });
  return out;
}

export function Field({ field: f, values, onChange }) {
  const value = getIn(values, f.name);
  const set = (v) => onChange(f.name, v);
  const id = `f-${f.name}`;

  let control;
  switch (f.type) {
    case 'textarea':
      control = <textarea id={id} rows={f.rows || 4} className="input" value={value ?? ''} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} />;
      break;
    case 'markdown':
      control = <MarkdownField id={id} value={value ?? ''} onChange={set} rows={f.rows || 10} />;
      break;
    case 'number':
      control = <input id={id} type="number" className="input" value={value ?? ''} onChange={(e) => set(e.target.value === '' ? '' : Number(e.target.value))} />;
      break;
    case 'checkbox':
      control = (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input id={id} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600" checked={Boolean(value)} onChange={(e) => set(e.target.checked)} />
          <span>{f.checkboxLabel || f.label}</span>
        </label>
      );
      break;
    case 'select':
      control = (
        <select id={id} className="input" value={value ?? ''} onChange={(e) => set(e.target.value)}>
          {f.options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
      );
      break;
    case 'ref':
      control = <RefField id={id} value={value} onChange={set} endpoint={f.endpoint} required={f.required} allowEmpty={!f.required} />;
      break;
    case 'image':
      control = <ImageField value={value} onChange={set} />;
      break;
    case 'file':
      control = <ImageField value={value} onChange={set} accept="application/pdf" kind="file" />;
      break;
    case 'images':
      control = <ImagesField value={value || []} onChange={set} />;
      break;
    case 'tags':
      control = <TagsField id={id} value={value || []} onChange={set} placeholder={f.placeholder} />;
      break;
    case 'list':
      control = <ListField value={value || []} onChange={set} itemFields={f.itemFields} addLabel={f.addLabel} />;
      break;
    case 'datetime':
      control = <input id={id} type="datetime-local" className="input" value={value ?? ''} onChange={(e) => set(e.target.value)} />;
      break;
    default:
      control = <input id={id} type={f.type === 'url' ? 'url' : 'text'} className="input" value={value ?? ''} placeholder={f.placeholder} required={f.required} onChange={(e) => set(e.target.value)} />;
  }

  return (
    <div className={f.span === 2 || ['markdown', 'images', 'list', 'tags', 'textarea'].includes(f.type) ? 'sm:col-span-2' : ''}>
      {f.type !== 'checkbox' && (
        <label htmlFor={id} className="label">
          {f.label}{f.required && <span aria-hidden="true" className="text-red-500"> *</span>}
        </label>
      )}
      {control}
      {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
    </div>
  );
}

export default function FormBuilder({ fields, values, onChange }) {
  return (
    <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
      {fields.map((f) => <Field key={f.name} field={f} values={values} onChange={onChange} />)}
    </div>
  );
}
