import React, { useEffect, useState } from 'react';
import { Calendar, Check, Home, Mail, Phone, RefreshCw, UserRound, X } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getLandlordReservationsURL, respondLandlordReservationURL } from '../../../utils/urls';
import { notifyError, notifySuccess } from '../../../utils/toast';
import Breadcrumb from '../../common/Breadcrumb';

const COLORS = {
  pending:   { bg: '#fff7e6', color: '#d97706' },
  confirmed: { bg: '#dcfce7', color: '#15803d' },
  cancelled: { bg: '#fee2e2', color: '#b91c1c' },
  expired:   { bg: '#f3f4f6', color: '#6b7280' },
};

function LandlordReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [reservationAction, setReservationAction] = useState({ reservation: null, action: '' });
  const [actionForm, setActionForm] = useState({ desiredMoveInDate: '', message: '' });
  const [acting, setActing] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    const q = filter !== 'All' ? `?status=${filter}` : '';
    const res = await makeRequest2(getLandlordReservationsURL + q, 'GET');
    if (res.success) setReservations(res.data?.data || res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReservations(); }, [filter]); // eslint-disable-line

  const openAction = (reservation, action) => {
    setReservationAction({ reservation, action });
    setActionForm({
      desiredMoveInDate: action === 'reschedule' && reservation.desiredMoveInDate
        ? new Date(reservation.desiredMoveInDate).toISOString().split('T')[0]
        : '',
      message: '',
    });
  };

  const submitAction = async () => {
    const { reservation, action } = reservationAction;
    if (!reservation || !action) return;
    if ((action === 'email' || action === 'cancel') && !actionForm.message.trim()) {
      notifyError('Message is required.');
      return;
    }
    if (action === 'reschedule' && !actionForm.desiredMoveInDate) {
      notifyError('New move-in date is required.');
      return;
    }

    setActing(true);
    const res = await makeRequest2(`${respondLandlordReservationURL}/${reservation._id}`, 'PUT', {
      action,
      desiredMoveInDate: actionForm.desiredMoveInDate || undefined,
      message: actionForm.message || undefined,
    });
    setActing(false);
    if (res.success) {
      notifySuccess('Reservation updated and email notification sent.');
      setReservationAction({ reservation: null, action: '' });
      fetchReservations();
    } else {
      notifyError(res.error || 'Failed to update reservation.');
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Reservations' }]} />

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>Reservations</h2>
        <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>Reservation requests sent directly to your units</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['All', 'pending', 'confirmed', 'cancelled', 'expired'].map((item) => {
          const active = filter === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                border: active ? 'none' : '1px solid var(--mi-line)',
                background: active ? 'var(--mi-button)' : '#fff',
                color: active ? '#fff' : 'var(--mi-muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {item === 'All' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map((n) => <div key={n} style={{ height: 76, borderRadius: 14, background: 'var(--mi-line)' }} />)}
        </div>
      ) : reservations.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)', padding: '64px 20px', textAlign: 'center' }}>
          <Home size={40} style={{ color: 'var(--mi-line)', marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 6 }}>No reservations found</div>
          <div style={{ fontSize: 13, color: 'var(--mi-muted)' }}>Reservation requests from prospects will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reservations.map((r) => {
            const color = COLORS[r.status] || COLORS.pending;
            return (
              <div key={r._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(17,24,39,0.04)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--mi-brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, color: 'var(--mi-brand)' }}>
                  {(r.tenantName || 'T').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 3 }}>{r.tenantName || 'Prospect'}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mi-muted)' }}><Home size={11} /> {r.unitName || '—'}</span>
                    {r.tenantEmail && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mi-muted)' }}><Mail size={11} /> {r.tenantEmail}</span>}
                    {r.tenantPhone && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mi-muted)' }}><Phone size={11} /> {r.tenantPhone}</span>}
                    {r.desiredMoveInDate && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mi-muted)' }}><Calendar size={11} /> {new Date(r.desiredMoveInDate).toLocaleDateString()}</span>}
                    {r.isGuest && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mi-muted)' }}><UserRound size={11} /> Guest</span>}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: color.bg, color: color.color, flexShrink: 0 }}>
                  {r.status || 'pending'}
                </span>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {r.status === 'pending' && (
                    <button type="button" className="mi-icon-action primary" title="Accept" onClick={() => openAction(r, 'accept')}>
                      <Check size={14} /> <span>Accept</span>
                    </button>
                  )}
                  <button type="button" className="mi-icon-action" title="Reschedule" onClick={() => openAction(r, 'reschedule')}>
                    <RefreshCw size={14} /> <span>Reschedule</span>
                  </button>
                  <button type="button" className="mi-icon-action warning" title="Send Email" onClick={() => openAction(r, 'email')}>
                    <Mail size={14} /> <span>Send Email</span>
                  </button>
                  {r.status !== 'cancelled' && (
                    <button type="button" className="mi-icon-action danger" title="Cancel" onClick={() => openAction(r, 'cancel')}>
                      <X size={14} /> <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reservationAction.reservation && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: 16 }}>
              <div className="modal-header">
                <h5 className="modal-title fw-semibold text-capitalize">
                  {reservationAction.action === 'email' ? 'Send Email' : reservationAction.action} Reservation
                </h5>
                <button className="btn-close" onClick={() => setReservationAction({ reservation: null, action: '' })} />
              </div>
              <div className="modal-body">
                <div className="mb-3 small text-muted">
                  {reservationAction.reservation.tenantName || 'Prospect'} · {reservationAction.reservation.tenantEmail || 'No email'} · {reservationAction.reservation.unitName || 'Unit'}
                </div>
                {reservationAction.action === 'reschedule' && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">New move-in date</label>
                    <input
                      className="form-control form-control-sm"
                      type="date"
                      value={actionForm.desiredMoveInDate}
                      onChange={(e) => setActionForm({ ...actionForm, desiredMoveInDate: e.target.value })}
                    />
                  </div>
                )}
                <label className="form-label small fw-semibold">
                  {reservationAction.action === 'email' ? 'Email message' : 'Message to prospect'}
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows={4}
                  placeholder="Write a clear note..."
                  value={actionForm.message}
                  onChange={(e) => setActionForm({ ...actionForm, message: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setReservationAction({ reservation: null, action: '' })}>Close</button>
                <button className="btn btn-primary btn-sm" onClick={submitAction} disabled={acting}>
                  {acting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandlordReservations;
