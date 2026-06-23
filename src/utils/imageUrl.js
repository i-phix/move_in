import { backend_url } from './urls';

// Resolves a stored image record to a browser-loadable URL.
//
// Accepts:
//   - null / undefined     → returns null
//   - string               → treated as a URL or path
//   - { url } / { path }   → uses whichever is present
//
// Behaviour:
//   - Already-absolute URLs (http/https/data/blob) are returned as-is.
//     This keeps older records that were saved with a full host working.
//   - Relative paths (starting with `/`) get backend_url prefixed.
//     This is the canonical format for new uploads — the backend stores
//     `/uploads/<filename>` so the URL works behind a reverse proxy and
//     doesn't trigger mixed-content blocking when the frontend is on
//     https and the legacy implementation accidentally saved http URLs.
export function resolveImageUrl(image) {
    if (!image) return null;
    const raw = typeof image === 'string'
        ? image
        : (image.url || image.path || null);
    if (!raw) return null;

    // Absolute or data/blob URLs — return as-is.
    if (/^(https?:|data:|blob:)/i.test(raw)) return raw;

    // Relative path — prefix with backend_url.
    const base = (backend_url || '').replace(/\/+$/, '');
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    return `${base}${path}`;
}
