'use client';
// Browser-side API access. Same origin: Next.js rewrites /api -> backend.
const TOKEN_KEY = 'aarvi_admin_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (t) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};

export class ClientApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function request(path, { method = 'GET', body, auth = false, formData, raw } = {}) {
  const headers = {};
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  let payload;
  if (formData) payload = formData;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: payload });
  } catch {
    throw new ClientApiError(0, 'Network error. Please check your connection and try again.');
  }
  if (raw) {
    if (!res.ok) throw new ClientApiError(res.status, 'Request failed');
    return res;
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (auth && res.status === 401) {
      setToken(null);
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    throw new ClientApiError(res.status, json.message || 'Something went wrong', json.details);
  }
  return json;
}

export const adminApi = {
  get: (p) => request(`/admin${p}`, { auth: true }),
  post: (p, body) => request(`/admin${p}`, { method: 'POST', body, auth: true }),
  put: (p, body) => request(`/admin${p}`, { method: 'PUT', body, auth: true }),
  del: (p) => request(`/admin${p}`, { method: 'DELETE', auth: true }),
  upload: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request('/admin/upload', { method: 'POST', formData: fd, auth: true });
  },
  raw: (p) => request(`/admin${p}`, { auth: true, raw: true }),
};
