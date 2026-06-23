// Lightweight wrapper that turns the raw `res.error` string returned from
// makeRequest into user-friendly copy. We never want internal stack text
// like "Error: 502 - Cannot read properties of undefined (reading 'X')"
// to land in a toast, banner or empty state.
//
// IMPORTANT: this module does NOT modify makeRequest.js — the helper is
// shared across all Payserve frontends and must stay identical. We sanitise
// at the call site instead.

const GENERIC_NETWORK = "We couldn't reach the server. Please check your connection and try again.";
const GENERIC_SERVER = "Something went wrong on our side. Please try again in a moment.";

function looksInternal(text) {
  if (!text || typeof text !== 'string') return false;
  return (
    text.length > 200 ||
    /Cannot (read|set) propert(y|ies) of/i.test(text) ||
    /\bTypeError\b|\bReferenceError\b|\bSyntaxError\b/i.test(text) ||
    /undefined is not a function/i.test(text) ||
    /ER_|SQLSTATE|ECONN|ENOTFOUND|EAI_AGAIN/i.test(text)
  );
}

function statusFromMessage(text) {
  if (!text || typeof text !== 'string') return null;
  const m = text.match(/^Error:\s*(\d{3})\b/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Turn `res.error` (or a thrown Error message) into something safe to
 * surface to the user.
 *
 *   displayError(res.error)
 *   displayError(res.error, 'Registration failed.')   // custom fallback
 */
export function displayError(raw, fallback = GENERIC_SERVER) {
  if (!raw) return fallback;

  const status = statusFromMessage(raw);
  if (status && status >= 500) return GENERIC_SERVER;
  if (raw === 'Error: No response received from server') return GENERIC_NETWORK;
  if (looksInternal(raw)) return fallback;

  // Strip a leading "Error: 4xx - " prefix when the trailing text is
  // user-meaningful (e.g. validation message from the API).
  if (status && status >= 400 && status < 500) {
    const trimmed = raw.replace(/^Error:\s*\d{3}\s*-\s*/, '');
    return looksInternal(trimmed) ? fallback : trimmed;
  }

  return raw;
}
