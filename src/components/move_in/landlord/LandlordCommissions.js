import React, { useEffect, useState } from 'react';
import { CreditCard, RefreshCw, Receipt } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { notifyError } from '../../../utils/toast';
import { displayError } from '../../../utils/displayError';
import { unwrapList, unwrap, statusFor, fmtCurrency, fmtDate } from '../../../utils/format';
import Breadcrumb from '../../common/Breadcrumb';
import PaymentModal from '../payments/PaymentModal';

const GET_URL = '/api/move_in/landlord/commissions';
const PAY_URL = (id) => `/api/move_in/landlord/commissions/${id}/pay`;

function ruleSummary(c) {
    if (c.ruleType === 'percentage_of_rent') {
        return `${c.ruleValue}% of rent`;
    }
    if (c.ruleType === 'fixed') return 'Fixed amount';
    return 'Manual';
}

export default function LandlordCommissions() {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCommission, setActiveCommission] = useState(null);

    const fetchCommissions = async () => {
        setLoading(true);
        const res = await makeRequest2(GET_URL, 'GET');
        if (res.success) {
            setCommissions(unwrapList(res));
        } else {
            notifyError(res.error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchCommissions(); }, []);

    const initiateCommissionPayment = async ({ phone }) => {
        const res = await makeRequest2(PAY_URL(activeCommission._id), 'POST', { phone });
        if (!res.success) {
            return { error: displayError(res.error, 'Could not start the payment.') };
        }
        return unwrap(res) || {};
    };

    return (
        <div style={{ padding: '1.5rem 1.75rem' }}>
            <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Commissions' }]} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--mi-ink)', margin: 0 }}>Commissions</h1>
                    <p style={{ color: 'var(--mi-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                        Settle platform commissions for deals you've marked rented.
                    </p>
                </div>
                <button onClick={fetchCommissions} className="mi-icon-action" style={{ gap: 6 }} disabled={loading}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--mi-line)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead style={{ background: 'var(--mi-bg)' }}>
                            <tr>
                                <th style={th}>Unit</th>
                                <th style={th}>Marked due</th>
                                <th style={th}>Rule</th>
                                <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                                <th style={th}>Status</th>
                                <th style={{ ...th, textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan={6} style={tdMuted}>Loading…</td></tr>}
                            {!loading && commissions.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ ...tdMuted, padding: '40px 16px' }}>
                                        <Receipt size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                                        <div>No commissions yet. They'll appear here once you mark a deal rented.</div>
                                    </td>
                                </tr>
                            )}
                            {!loading && commissions.map(c => {
                                const badge = statusFor.commission(c.status);
                                const canPay = c.status === 'due' || c.status === 'invoiced';
                                return (
                                    <tr key={c._id} style={{ borderTop: '1px solid var(--mi-line)' }}>
                                        <td style={{ ...td, fontWeight: 600, color: 'var(--mi-ink)' }}>{c.unitName || '—'}</td>
                                        <td style={td}>{fmtDate(c.dueAt || c.createdAt)}</td>
                                        <td style={td}>{ruleSummary(c)}</td>
                                        <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{fmtCurrency(c.amount, c.currency)}</td>
                                        <td style={td}>
                                            <span style={{
                                                background: badge.bg,
                                                color: badge.color,
                                                fontSize: 11, fontWeight: 700,
                                                padding: '3px 8px', borderRadius: 20,
                                            }}>{badge.label}</span>
                                        </td>
                                        <td style={{ ...td, textAlign: 'right' }}>
                                            {canPay ? (
                                                <button
                                                    onClick={() => setActiveCommission(c)}
                                                    className="mi-icon-action"
                                                    style={{ background: 'var(--mi-brand)', color: '#fff', borderColor: 'var(--mi-brand)', gap: 6 }}
                                                >
                                                    <CreditCard size={14} /> Pay
                                                </button>
                                            ) : c.status === 'paid' ? (
                                                <span style={{ fontSize: 12, color: 'var(--mi-muted)' }}>
                                                    Paid {fmtDate(c.paidAt)}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 12, color: 'var(--mi-muted)' }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <PaymentModal
                open={!!activeCommission}
                onClose={() => setActiveCommission(null)}
                onSuccess={() => {
                    setActiveCommission(null);
                    fetchCommissions();
                }}
                title="Pay commission"
                subtitle={
                    activeCommission
                        ? `For ${activeCommission.unitName || 'unit'}. ${ruleSummary(activeCommission)}.`
                        : ''
                }
                payCta="Pay via M-Pesa"
                feePreview={activeCommission ? {
                    amount: activeCommission.amount,
                    currency: activeCommission.currency || 'KES',
                    label: 'Amount due',
                    hint: ruleSummary(activeCommission),
                } : null}
                initiate={initiateCommissionPayment}
            />
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
