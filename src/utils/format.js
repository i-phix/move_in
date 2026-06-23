// One source of truth for currency / date display + a tolerant response
// unwrapper. Every page previously hand-rolled these — 47 date formatters,
// 20 currency formatters, 8+ different status maps — which made polish
// passes a chore and let inconsistencies creep in (KES vs Ksh, en-GB vs
// en-KE, dot- vs comma-separated thousands, etc.).

// ── Currency ─────────────────────────────────────────────────────────────

/**
 * Format an amount as Kenyan currency.
 *   fmtCurrency(35000)            -> "KES 35,000.00"
 *   fmtCurrency(35000, 'USD')     -> "USD 35,000.00"
 *   fmtCurrency(null)             -> "—"
 *
 * Pass { minimal: true } to drop the trailing ".00" for integer amounts.
 */
export function fmtCurrency(amount, currency = 'KES', opts = {}) {
    if (amount === null || amount === undefined || amount === '') return '—';
    const n = Number(amount);
    if (!Number.isFinite(n)) return '—';
    const minimumFractionDigits = opts.minimal && Number.isInteger(n) ? 0 : 2;
    return `${currency} ${n.toLocaleString(undefined, {
        minimumFractionDigits,
        maximumFractionDigits: 2,
    })}`;
}

// ── Dates ────────────────────────────────────────────────────────────────

/**
 * Format a date for display. Returns "—" for missing/invalid input.
 *   fmtDate(new Date())          -> "12 Jun 2026"
 *   fmtDate('2026-07-01')        -> "01 Jul 2026"
 *   fmtDate(null)                -> "—"
 *
 * Pass { withTime: true } for "12 Jun 2026, 14:30".
 */
export function fmtDate(d, opts = {}) {
    if (!d) return '—';
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return '—';
    const base = date.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
    if (!opts.withTime) return base;
    const time = date.toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', hour12: false,
    });
    return `${base}, ${time}`;
}

/**
 * "3 days ago", "in 2 hours" — relative time, capped at "Jun 12, 2026"
 * when older than ~14 days so we don't show "375 days ago".
 */
export function fmtRelative(d) {
    if (!d) return '—';
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return '—';
    const diffMs = date.getTime() - Date.now();
    const absMs = Math.abs(diffMs);
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (absMs > 14 * day) return fmtDate(date);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (absMs < hour) return rtf.format(Math.round(diffMs / minute), 'minute');
    if (absMs < day)  return rtf.format(Math.round(diffMs / hour),   'hour');
    return rtf.format(Math.round(diffMs / day), 'day');
}

// ── Response unwrap ──────────────────────────────────────────────────────

/**
 * makeRequest wraps the API body in `{ success, data: <body> }` where body
 * itself is usually `{ success, data: <real payload> }`. Six different
 * pages were guessing one-vs-two-deep with chains like
 *   res.data?.data || res.data || []
 * Centralise the unwrap so the call sites are obvious.
 *
 *   unwrap(res)           -> data (or null on error)
 *   unwrapList(res)       -> array (always — empty on error)
 */
export function unwrap(res) {
    if (!res?.success) return null;
    return res.data?.data ?? res.data ?? null;
}

export function unwrapList(res) {
    const v = unwrap(res);
    return Array.isArray(v) ? v : [];
}

// ── Status badge / pill maps ─────────────────────────────────────────────
// Centralised so reservation/payment/commission/booking status colours
// stay consistent across the app. Each map returns { bg, color, label }.

const PAYMENT_STATUS = {
    pending:   { bg: '#fef9c3', color: '#854d0e', label: 'Pending'   },
    paid:      { bg: '#dcfce7', color: '#166534', label: 'Paid'      },
    failed:    { bg: '#fee2e2', color: '#991b1b', label: 'Failed'    },
    refunded:  { bg: '#e0f2fe', color: '#0369a1', label: 'Refunded'  },
    waived:    { bg: '#e5e7eb', color: '#374151', label: 'Waived'    },
    cancelled: { bg: '#e5e7eb', color: '#374151', label: 'Cancelled' },
    disputed:  { bg: '#fee2e2', color: '#b91c1c', label: 'Disputed'  },
};

const RESERVATION_STATUS = {
    pending:   { bg: '#fff7e6', color: '#d97706', label: 'Pending'   },
    confirmed: { bg: '#dcfce7', color: '#15803d', label: 'Confirmed' },
    cancelled: { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' },
    expired:   { bg: '#f3f4f6', color: '#6b7280', label: 'Expired'   },
    rented:    { bg: '#e0e7ff', color: '#3730a3', label: 'Rented'    },
};

const APPLICATION_STATUS = {
    pending:   { bg: '#fef9c3', color: '#854d0e', label: 'Pending'  },
    approved:  { bg: '#dcfce7', color: '#166534', label: 'Approved' },
    assigned:  { bg: '#dcfce7', color: '#166534', label: 'Assigned' },
    rejected:  { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
    completed: { bg: '#e0f2fe', color: '#0369a1', label: 'Completed'},
    rented:    { bg: '#e0e7ff', color: '#3730a3', label: 'Rented'   },
};

const COMMISSION_STATUS = {
    due:       { bg: '#fef3c7', color: '#92400e', label: 'Due'              },
    invoiced:  { bg: '#e0e7ff', color: '#3730a3', label: 'Awaiting payment' },
    paid:      { bg: '#dcfce7', color: '#15803d', label: 'Paid'             },
    waived:    { bg: '#e5e7eb', color: '#374151', label: 'Waived'           },
    refunded:  { bg: '#e0e7ff', color: '#3730a3', label: 'Refunded'         },
    disputed:  { bg: '#fee2e2', color: '#b91c1c', label: 'Disputed'         },
    cancelled: { bg: '#e5e7eb', color: '#374151', label: 'Cancelled'        },
};

const INVOICE_STATUS = {
    issued:    { bg: '#fef3c7', color: '#92400e', label: 'Unpaid'   },
    paid:      { bg: '#dcfce7', color: '#15803d', label: 'Paid'     },
    void:      { bg: '#fee2e2', color: '#b91c1c', label: 'Void'     },
    refunded:  { bg: '#e0e7ff', color: '#3730a3', label: 'Refunded' },
    failed:    { bg: '#fee2e2', color: '#b91c1c', label: 'Failed'   },
};

const FALLBACK = { bg: '#f3f4f6', color: '#6b7280', label: 'Unknown' };

function pick(map, status) {
    if (!status) return FALLBACK;
    return map[status] || { ...FALLBACK, label: String(status) };
}

export const statusFor = {
    payment:     (s) => pick(PAYMENT_STATUS, s),
    reservation: (s) => pick(RESERVATION_STATUS, s),
    application: (s) => pick(APPLICATION_STATUS, s),
    commission:  (s) => pick(COMMISSION_STATUS, s),
    invoice:     (s) => pick(INVOICE_STATUS, s),
};

// ── Payment-type labels + icon colours ───────────────────────────────────
// Used by tenant /payments page, landlord commission summaries, admin
// invoice list. Adding a new payment type? Update here once.

export const PAYMENT_TYPE_LABEL = {
    reservation_fee:   'Reservation fee',
    viewing_fee:       'Viewing fee',
    commission:        'Commission',
    featured_listing:  'Featured listing',
    deposit:           'Security deposit',
    first_month_rent:  'First month rent',
    other:             'Other',
};

export const PAYMENT_TYPE_ACCENT = {
    reservation_fee:   '#f5a623',
    viewing_fee:       '#0EA5E9',
    commission:        '#7c3aed',
    featured_listing:  '#DB2777',
    deposit:           '#1a2456',
    first_month_rent:  '#059669',
    other:             '#9ca3af',
};

export function paymentTypeLabel(type) {
    return PAYMENT_TYPE_LABEL[type] || String(type || 'Payment');
}
