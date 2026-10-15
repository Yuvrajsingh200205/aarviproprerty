// Server-side API access (React Server Components / route handlers).
const SERVER_API = process.env.API_URL || 'http://localhost:5001';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api(path, { revalidate, query } = {}) {
  const qs = query
    ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
    : '';
  let res;
  try {
    res = await fetch(`${SERVER_API}/api${path}${qs}`, revalidate ? { next: { revalidate } } : { cache: 'no-store' });
  } catch {
    throw new ApiError(503, `Cannot reach the API server at ${SERVER_API}. Is the backend running?`);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.message || 'Request failed', json.details);
  return json;
}

// Same as api() but resolves to null on 404 (for notFound() handling) and on network failure returns fallback.
export async function apiOrNull(path, opts) {
  try {
    return await api(path, opts);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getSettings() {
  try {
    return (await api('/settings')).data;
  } catch {
    return null;
  }
}
