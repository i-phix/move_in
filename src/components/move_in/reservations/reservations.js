import React, { useEffect, useState } from 'react';
import { Home, RefreshCw, X, Clock, AlertCircle } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getMyMoveInReservationsURL, cancelMoveInReservationURL } from '../../../utils/urls';
import { notifySuccess, notifyError } from '../../../utils/toast';
import Breadcrumb from '../../common/Breadcrumb';

const STATUS_META = {
  pending:   { bg: '#fef9c3', color: '#854d0e',  dot: '#d97706', label: 'Pending' },
  confirmed: { bg: '#dcfce7', color: '#166534',  dot: '#16a34a', label: 'Confirmed' },
  expired:   { bg: '#f3f4f6', color: '#6b7280',  dot: '#9ca3af', label: 'Expired' },
  cancelled: { bg: '#fee2e2', color: '#991b1b',  dot: '#dc2626', label: 'Cancelled' },
};

function ExpiryTimer({ expiresAt }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const ms = new Date(expiresAt) - Date.now();
      if (ms <= 0) { setRemaining('Expired'); return; }
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setRemaining(h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [expiresAt]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#d97706' }}>
      <AlertCircle size={12} />
      {remaining}
    </div>
  );
}

function ReservationCard({ reservation, onCancel }) {
  const meta = STATUS_META[reservation.status] || { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af', label: reservation.status };
  const canCancel = reservation.status === 'pending' || reservation.status === 'confirmed';

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)',
      overflow: 'hidden', boxShadow: '0 1px 6px rgba(17,24,39,0.05)',
    }}>
      {/* Accent bar */}
      <div style={{ height: 4, background: canCancel ? 'var(--mi-brand)' : 'var(--mi-line)' }} />

      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11, background: 'var(--mi-brand-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Home size={20} style={{ color: 'var(--mi-brand)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--mi-ink)', marginBottom: 2 }}>
                {reservation.unitName || reservation.unitId || 'Unit'}
              </div>
              {reservation.desiredMoveInDate && (
                <div style={{ fontSize: 12, color: 'var(--mi-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} />
                  Move-in {new Date(reservation.desiredMoveInDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, flexShrink: 0,
            background: meta.bg, color: meta.color,
          }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: meta.dot, marginRight: 5, verticalAlign: 'middle' }} />
            {meta.label}
          </span>
        </div>

        {/* Expiry */}
        {reservation.expiresAt && reservation.status === 'pending' && (
          <div style={{ marginBottom: 10 }}>
            <ExpiryTimer expiresAt={reservation.expiresAt} />
          </div>
        )}

        {/* Admin note */}
        {reservation.adminNote && (
          <div style={{
            padding: '8px 12px', borderRadius: 8, background: '#f9fafb',
            border: '1px solid var(--mi-line)', fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginBottom: 10,
          }}>
            {reservation.adminNote}
          </div>
        )}

        {canCancel && (
          <button
            onClick={() => onCancel(reservation._id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: 8,
              background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 500,
            }}
          >
            <X size={13} /> Cancel reservation
          </button>
        )}
      </div>
    </div>
  );
}

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    const res = await makeRequest2(getMyMoveInReservationsURL, 'GET');
    if (res.success && res.data) {
      const list = res.data.data || res.data || [];
      setReservations(Array.isArray(list) ? list.filter((item) => item.status !== 'cancelled') : []);
    } else {
      setError(res.error || 'Failed to load reservations.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancel = async (reservationId) => {
    const res = await makeRequest2(`${cancelMoveInReservationURL}/${reservationId}`, 'PUT');
    if (res.success) {
      notifySuccess('Reservation cancelled.');
      fetchReservations();
    } else {
      notifyError(res.error || 'Failed to cancel reservation.');
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'My Reservations' }]} />
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>My Reservations</h2>
        <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>Units you have reserved before confirming move-in</p>
      </div>

      {error && (
        <div className="d-flex align-items-center gap-3 p-3 mb-4"
          style={{ border: '1px solid #fca5a5', borderRadius: 14, background: '#fff5f5', color: '#b91c1c' }}>
          <RefreshCw size={18} />
          <span className="flex-grow-1 small">{error}</span>
          <button className="btn btn-sm"
            style={{ border: '1px solid #b91c1c', color: '#b91c1c', borderRadius: 8, background: 'transparent' }}
            onClick={fetchReservations}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(n => (
            <div key={n} style={{ height: 110, borderRadius: 14, background: '#fff', border: '1px solid var(--mi-line)' }} />
          ))}
        </div>
      ) : reservations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reservations.map(r => <ReservationCard key={r._id} reservation={r} onCancel={handleCancel} />)}
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)',
          padding: '60px 24px', textAlign: 'center',
        }}>
          <Home size={40} strokeWidth={1.3} style={{ color: 'var(--mi-line)', marginBottom: 14 }} />
          <p style={{ fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 6 }}>No reservations yet</p>
          <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 13 }}>
            Reserve a unit from a listing to hold your spot.
          </p>
        </div>
      )}
    </div>
  );
}

export default Reservations;
