import React, { useEffect, useState } from 'react';
import { CreditCard, RefreshCw, TrendingUp, ArrowDownLeft } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getMoveInPaymentsURL } from '../../../utils/urls';
import Breadcrumb from '../../common/Breadcrumb';

const STATUS_META = {
  pending:  { bg: '#fef9c3', color: '#854d0e',  dot: '#d97706', label: 'Pending' },
  paid:     { bg: '#dcfce7', color: '#166534',  dot: '#16a34a', label: 'Paid' },
  failed:   { bg: '#fee2e2', color: '#991b1b',  dot: '#dc2626', label: 'Failed' },
  refunded: { bg: '#e0f2fe', color: '#0369a1',  dot: '#0284c7', label: 'Refunded' },
};

const TYPE_LABELS = {
  reservation_fee:  'Reservation Fee',
  deposit:          'Security Deposit',
  first_month_rent: 'First Month Rent',
  other:            'Other',
};

const TYPE_ICONS = {
  reservation_fee:  '#f5a623',
  deposit:          '#1a2456',
  first_month_rent: '#059669',
  other:            '#7c3aed',
};

function PaymentRow({ payment }) {
  const meta  = STATUS_META[payment.status] || { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af', label: payment.status };
  const label = TYPE_LABELS[payment.type] || payment.type || 'Payment';
  const accent = TYPE_ICONS[payment.type] || '#9ca3af';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 20px', borderBottom: '1px solid var(--mi-line)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: accent + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <ArrowDownLeft size={18} style={{ color: accent }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--mi-ink)', marginBottom: 2 }}>{label}</div>
        {payment.createdAt && (
          <div style={{ fontSize: 12, color: 'var(--mi-muted)' }}>
            {new Date(payment.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--mi-ink)' }}>
          {payment.amount != null ? `KES ${Number(payment.amount).toLocaleString()}` : '—'}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: meta.bg, color: meta.color }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: meta.dot, marginRight: 4, verticalAlign: 'middle' }} />
          {meta.label}
        </span>
      </div>
    </div>
  );
}

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    const res = await makeRequest2(getMoveInPaymentsURL, 'GET');
    if (res.success && res.data) {
      setPayments(res.data.data || res.data || []);
    } else {
      setError(res.error || 'Failed to load payment history.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const pending   = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (Number(p.amount) || 0), 0);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Payment History' }]} />
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>Payment History</h2>
        <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>All your move-in related transactions</p>
      </div>

      {error && (
        <div className="d-flex align-items-center gap-3 p-3 mb-4"
          style={{ border: '1px solid #fca5a5', borderRadius: 14, background: '#fff5f5', color: '#b91c1c' }}>
          <RefreshCw size={18} />
          <span className="flex-grow-1 small">{error}</span>
          <button className="btn btn-sm"
            style={{ border: '1px solid #b91c1c', color: '#b91c1c', borderRadius: 8, background: 'transparent' }}
            onClick={fetchPayments}>Retry</button>
        </div>
      )}

      {/* Summary cards */}
      {!loading && payments.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
          <div style={{
            background: 'var(--mi-button)', borderRadius: 14, padding: '18px 20px', color: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <TrendingUp size={16} style={{ color: 'var(--mi-brand)' }} />
              <span style={{ fontSize: 12, opacity: 0.7 }}>Total Paid</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>KES {totalPaid.toLocaleString()}</div>
          </div>
          {pending > 0 && (
            <div style={{
              background: '#fff', borderRadius: 14, padding: '18px 20px',
              border: '1px solid var(--mi-line)', boxShadow: '0 1px 6px rgba(17,24,39,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <CreditCard size={16} style={{ color: '#d97706' }} />
                <span style={{ fontSize: 12, color: 'var(--mi-muted)' }}>Pending</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)' }}>KES {pending.toLocaleString()}</div>
            </div>
          )}
        </div>
      )}

      {/* Transactions */}
      {loading ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)', overflow: 'hidden' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ padding: '14px 20px', borderBottom: '1px solid var(--mi-line)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--mi-line)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 13, borderRadius: 4, background: 'var(--mi-line)', width: '45%', marginBottom: 6 }} />
                <div style={{ height: 11, borderRadius: 4, background: 'var(--mi-line)', width: '25%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : payments.length > 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--mi-line)' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mi-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transactions ({payments.length})
            </span>
          </div>
          {payments.map(p => <PaymentRow key={p._id} payment={p} />)}
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)',
          padding: '60px 24px', textAlign: 'center',
        }}>
          <CreditCard size={40} strokeWidth={1.3} style={{ color: 'var(--mi-line)', marginBottom: 14 }} />
          <p style={{ fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 6 }}>No payments yet</p>
          <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 13 }}>
            Payments will appear here once you begin your move-in process.
          </p>
        </div>
      )}
    </div>
  );
}

export default Payments;
