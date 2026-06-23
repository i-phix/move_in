import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText, RefreshCw, Search } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { backend_url } from '../../../utils/urls';
import { getItem } from '../../../utils/localStorage';
import { displayError } from '../../../utils/displayError';
import { notifyError } from '../../../utils/toast';
import { unwrapList, statusFor, fmtCurrency, fmtDate, paymentTypeLabel } from '../../../utils/format';
import Breadcrumb from '../../common/Breadcrumb';

// Shared invoice list — used by tenant, landlord and admin via the
// `scope` prop which picks the correct endpoint. We deliberately reuse
// one component so visual + accessibility tweaks ripple to every role.
//
// scope: 'tenant' | 'landlord' | 'admin'
export default function InvoicesPage({ scope = 'tenant' }) {
    const [invoices, setInvoices]   = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const endpoint = useMemo(() => {
        switch (scope) {
            case 'landlord': return '/api/move_in/landlord/invoices';
            case 'admin':    return '/api/move_in/admin/invoices';
            default:         return '/api/move_in/invoices';
        }
    }, [scope]);

    const fetchInvoices = async (page = 1) => {
        setLoading(true);
        const params = new URLSearchParams();
        if (typeFilter)   params.set('type', typeFilter);
        if (statusFilter) params.set('status', statusFilter);
        if (search)       params.set('q', search);
        params.set('page', String(page));
        params.set('limit', '25');

        const res = await makeRequest2(`${endpoint}?${params.toString()}`, 'GET');
        if (res.success) {
            setInvoices(unwrapList(res));
            setPagination(res.data?.pagination || { total: 0, page: 1, pages: 1 });
        } else {
            notifyError(res.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInvoices(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scope, typeFilter, statusFilter]);

    // PDFs come from an authenticated endpoint, so we have to attach the
    // bearer token. Easiest is fetch() + blob -> object URL -> open.
    const downloadPdf = async (invoice) => {
        try {
            const user = await getItem('AGENTUSER');
            const token = user?.authToken;
            const base = backend_url || '';
            const url = `${base}${endpoint}/${invoice._id}/pdf`;
            const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!resp.ok) {
                const errorText = await resp.text().catch(() => '');
                notifyError(displayError(`Error: ${resp.status} - ${errorText}`, 'Failed to load invoice.'));
                return;
            }
            const blob = await resp.blob();
            const objectUrl = URL.createObjectURL(blob);
            const filename = invoice.invoiceNumber ? `${invoice.invoiceNumber}.pdf` : `invoice-${invoice._id}.pdf`;
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(objectUrl), 5_000);
        } catch (err) {
            notifyError(displayError(err.message, 'Failed to load invoice.'));
        }
    };

    const headerTitle = scope === 'admin' ? 'All Move-In invoices' :
        scope === 'landlord' ? 'My invoices' : 'My invoices';

    return (
        <div style={{ padding: '1.5rem 1.75rem' }}>
            <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Invoices' }]} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--mi-ink)', margin: 0 }}>{headerTitle}</h1>
                    <p style={{ color: 'var(--mi-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                        Download the PDF of any invoice — paid or unpaid.
                    </p>
                </div>
                <button
                    onClick={() => fetchInvoices(pagination.page || 1)}
                    className="mi-icon-action"
                    style={{ gap: 6 }}
                    disabled={loading}
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 220px' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--mi-muted)' }} />
                    <input
                        type="search"
                        placeholder="Search invoice number or name…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') fetchInvoices(1); }}
                        className="mi-input"
                        style={{ paddingLeft: 30, width: '100%' }}
                    />
                </div>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="mi-input">
                    <option value="">All types</option>
                    {['reservation_fee','viewing_fee','commission','featured_listing','deposit','first_month_rent','other'].map(k => <option key={k} value={k}>{paymentTypeLabel(k)}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mi-input">
                    <option value="">All statuses</option>
                    <option value="paid">Paid</option>
                    <option value="issued">Unpaid</option>
                    <option value="void">Void</option>
                    <option value="refunded">Refunded</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', border: '1px solid var(--mi-line)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead style={{ background: 'var(--mi-bg)' }}>
                            <tr>
                                <th style={th}>Invoice #</th>
                                <th style={th}>Issued</th>
                                <th style={th}>Type</th>
                                <th style={th}>Recipient</th>
                                <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                                <th style={th}>Status</th>
                                <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={7} style={tdMuted}>Loading…</td></tr>
                            )}
                            {!loading && invoices.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ ...tdMuted, padding: '40px 16px' }}>
                                        <FileText size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                                        <div>No invoices yet.</div>
                                    </td>
                                </tr>
                            )}
                            {!loading && invoices.map(inv => {
                                const badge = statusFor.invoice(inv.status);
                                return (
                                    <tr key={inv._id} style={{ borderTop: '1px solid var(--mi-line)' }}>
                                        <td style={{ ...td, fontWeight: 600, color: 'var(--mi-ink)' }}>{inv.invoiceNumber}</td>
                                        <td style={td}>{fmtDate(inv.issuedAt)}</td>
                                        <td style={td}>{paymentTypeLabel(inv.type)}</td>
                                        <td style={td}>
                                            <div style={{ fontWeight: 600 }}>{inv.recipient?.name || '—'}</div>
                                            <div style={{ fontSize: 11, color: 'var(--mi-muted)' }}>{inv.recipient?.email || ''}</div>
                                        </td>
                                        <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{fmtCurrency(inv.total, inv.currency)}</td>
                                        <td style={td}>
                                            <span style={{
                                                background: badge.bg,
                                                color:  badge.color,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                padding: '3px 8px',
                                                borderRadius: 20,
                                            }}>{badge.label}</span>
                                        </td>
                                        <td style={{ ...td, textAlign: 'right' }}>
                                            <button
                                                onClick={() => downloadPdf(inv)}
                                                className="mi-icon-action"
                                                style={{ background: 'var(--mi-brand)', color: '#fff', borderColor: 'var(--mi-brand)', gap: 6 }}
                                                title="Download PDF"
                                            >
                                                <Download size={14} /> PDF
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--mi-line)' }}>
                        <span style={{ fontSize: 12, color: 'var(--mi-muted)' }}>
                            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => fetchInvoices(pagination.page - 1)}
                                className="mi-icon-action"
                            >Previous</button>
                            <button
                                disabled={pagination.page >= pagination.pages}
                                onClick={() => fetchInvoices(pagination.page + 1)}
                                className="mi-icon-action"
                            >Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const th = {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--mi-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
};
const td = { padding: '12px 16px', verticalAlign: 'middle' };
const tdMuted = { ...td, textAlign: 'center', color: 'var(--mi-muted)' };
