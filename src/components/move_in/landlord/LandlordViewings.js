import React, { useEffect, useState } from 'react';
import { Check, Mail, Plus, RefreshCw, Trash2, Calendar, Clock, Users, X } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getLandlordSlotsURL, createLandlordSlotURL, cancelLandlordSlotURL, getLandlordBookingsURL, getLandlordUnitsURL, respondLandlordBookingURL } from '../../../utils/urls';
import { notifySuccess, notifyError } from '../../../utils/toast';
import Breadcrumb from '../../common/Breadcrumb';

const BOOKING_COLORS = {
  confirmed: { bg: '#dcfce7', color: '#15803d' },
  pending:   { bg: '#fff7e6', color: '#d97706' },
  cancelled: { bg: '#fee2e2', color: '#b91c1c' },
};

function LandlordViewings() {
  const [tab, setTab]           = useState('slots');
  const [slots, setSlots]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [units, setUnits]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ unitId: '', date: '', time: '', capacity: 1, durationMins: 30 });
  const [saving, setSaving]     = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [pendingCancelSlot, setPendingCancelSlot] = useState(null);
  const [bookingAction, setBookingAction] = useState({ booking: null, action: '' });
  const [actionForm, setActionForm] = useState({ scheduledDate: '', scheduledTime: '', message: '' });
  const [acting, setActing] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      makeRequest2(getLandlordSlotsURL, 'GET'),
      makeRequest2(getLandlordBookingsURL, 'GET'),
      makeRequest2(getLandlordUnitsURL, 'GET'),
    ]).then(([s, b, u]) => {
      if (s.success) setSlots(s.data?.data || s.data || []);
      if (b.success) setBookings(b.data?.data || b.data || []);
      if (u.success) setUnits(u.data?.data || u.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.unitId || !form.date || !form.time) { notifyError('Unit, date and time are required.'); return; }
    setSaving(true);
    const res = await makeRequest2(createLandlordSlotURL, 'POST', {
      ...form,
      capacity: Number(form.capacity),
      durationMins: Number(form.durationMins),
    });
    setSaving(false);
    if (res.success) {
      notifySuccess('Viewing slot created.');
      setShowForm(false);
      setForm({ unitId: '', date: '', time: '', capacity: 1, durationMins: 30 });
      const s = await makeRequest2(getLandlordSlotsURL, 'GET');
      if (s.success) setSlots(s.data?.data || s.data || []);
    } else {
      notifyError(res.error || 'Failed to create slot.');
    }
  };

  const handleCancel = async (slotId) => {
    setCancelling(slotId);
    const res = await makeRequest2(`${cancelLandlordSlotURL}/${slotId}`, 'DELETE');
    setCancelling(null);
    setPendingCancelSlot(null);
    if (res.success) {
      notifySuccess('Slot cancelled.');
      setSlots(prev => prev.filter(s => s._id !== slotId));
    } else {
      notifyError(res.error || 'Cannot cancel slot — it may have bookings.');
    }
  };

  const openBookingAction = (booking, action) => {
    const dateValue = booking.scheduledDate ? new Date(booking.scheduledDate).toISOString().split('T')[0] : '';
    setBookingAction({ booking, action });
    setActionForm({
      scheduledDate: action === 'reschedule' ? dateValue : '',
      scheduledTime: action === 'reschedule' ? (booking.scheduledTime || '') : '',
      message: '',
    });
  };

  const submitBookingAction = async () => {
    const { booking, action } = bookingAction;
    if (!booking || !action) return;
    if ((action === 'email' || action === 'cancel') && !actionForm.message.trim()) {
      notifyError('Message is required.');
      return;
    }
    if (action === 'reschedule' && (!actionForm.scheduledDate || !actionForm.scheduledTime)) {
      notifyError('New date and time are required.');
      return;
    }

    setActing(true);
    const res = await makeRequest2(`${respondLandlordBookingURL}/${booking._id}`, 'PUT', {
      action,
      scheduledDate: actionForm.scheduledDate || undefined,
      scheduledTime: actionForm.scheduledTime || undefined,
      message: actionForm.message || undefined,
    });
    setActing(false);
    if (res.success) {
      notifySuccess('Viewing updated and email notification sent.');
      setBookingAction({ booking: null, action: '' });
      fetchAll();
    } else {
      notifyError(res.error || 'Failed to update viewing.');
    }
  };

  const inp = {
    width: '100%', padding: '8px 12px', border: '1px solid var(--mi-line)',
    borderRadius: 8, fontSize: 13, outline: 'none', color: 'var(--mi-ink)', background: '#fff', boxSizing: 'border-box',
  };
  const fieldLabel = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--mi-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Viewings' }]} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>Viewings</h2>
          <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>Manage viewing slots and tenant bookings</p>
        </div>
        {tab === 'slots' && (
          <button
            onClick={() => setShowForm(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', background: showForm ? 'var(--mi-line)' : 'var(--mi-button)', color: showForm ? 'var(--mi-ink)' : '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add Slot</>}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid var(--mi-line)' }}>
        {['slots', 'bookings'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', border: 'none', background: 'transparent',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            color: tab === t ? 'var(--mi-brand)' : 'var(--mi-muted)',
            borderBottom: tab === t ? '2px solid var(--mi-brand)' : '2px solid transparent',
            marginBottom: -2,
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span style={{ marginLeft: 6, fontSize: 11, background: 'var(--mi-line)', borderRadius: 20, padding: '1px 7px', color: 'var(--mi-muted)' }}>
              {t === 'slots' ? slots.length : bookings.length}
            </span>
          </button>
        ))}
      </div>

      {/* Create form */}
      {showForm && tab === 'slots' && (
        <form onSubmit={handleCreate} style={{ border: '1px solid var(--mi-line)', borderRadius: 14, padding: 20, background: '#fafbfc', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--mi-ink)', marginBottom: 16 }}>New Viewing Slot</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={fieldLabel}>Unit *</label>
              <select style={inp} name="unitId" value={form.unitId} onChange={handleChange} required>
                <option value="">— select unit —</option>
                {units.map(u => <option key={u._id} value={u._id}>{u.title}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabel}>Date *</label>
              <input style={inp} type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>
            <div>
              <label style={fieldLabel}>Time *</label>
              <input style={inp} type="time" name="time" value={form.time} onChange={handleChange} required />
            </div>
            <div>
              <label style={fieldLabel}>Capacity</label>
              <input style={inp} type="number" name="capacity" min={1} value={form.capacity} onChange={handleChange} />
            </div>
            <div>
              <label style={fieldLabel}>Duration (mins)</label>
              <input style={inp} type="number" name="durationMins" min={15} step={15} value={form.durationMins} onChange={handleChange} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="submit" disabled={saving} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--mi-button)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Creating…' : 'Create Slot'}
            </button>
          </div>
        </form>
      )}

      {pendingCancelSlot && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          border: '1px solid #fed7aa',
          borderRadius: 12,
          background: '#fff7ed',
          color: '#9a3412',
          padding: '12px 14px',
          marginBottom: 16,
          fontSize: 13,
        }}>
          <span>Cancel this viewing slot? This cannot be undone.</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setPendingCancelSlot(null)} style={{ border: '1px solid #fed7aa', background: '#fff', borderRadius: 8, padding: '6px 10px', color: '#9a3412' }}>Keep slot</button>
            <button type="button" onClick={() => handleCancel(pendingCancelSlot)} disabled={cancelling === pendingCancelSlot} style={{ border: 'none', background: '#dc2626', borderRadius: 8, padding: '6px 10px', color: '#fff' }}>
              {cancelling === pendingCancelSlot ? 'Cancelling...' : 'Cancel slot'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(n => <div key={n} style={{ height: 68, borderRadius: 14, background: 'var(--mi-line)' }} />)}
        </div>
      ) : tab === 'slots' ? (
        slots.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)', padding: '64px 20px', textAlign: 'center' }}>
            <Calendar size={40} style={{ color: 'var(--mi-line)', marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 6 }}>No viewing slots yet</div>
            <div style={{ fontSize: 13, color: 'var(--mi-muted)' }}>Create slots so tenants can book viewings.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {slots.map(s => (
              <div key={s._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(17,24,39,0.04)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={18} style={{ color: '#2563eb' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 3 }}>{s.unitName || 'Unit'}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mi-muted)' }}>
                      <Calendar size={11} /> {new Date(s.date).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mi-muted)' }}>
                      <Clock size={11} /> {s.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mi-muted)' }}>
                      <Users size={11} /> {s.bookedCount}/{s.capacity} booked
                    </span>
                    {s.durationMins && <span style={{ fontSize: 12, color: 'var(--mi-muted)' }}>{s.durationMins} mins</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: s.isAvailable ? '#dcfce7' : '#f3f4f6', color: s.isAvailable ? '#15803d' : '#6b7280' }}>
                    {s.isAvailable ? 'Available' : 'Full'}
                  </span>
                  {s.bookedCount === 0 && (
                    <button
                      disabled={cancelling === s._id}
                      onClick={() => setPendingCancelSlot(s._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: cancelling === s._id ? 0.6 : 1 }}>
                      <Trash2 size={13} /> {cancelling === s._id ? '…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        bookings.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)', padding: '64px 20px', textAlign: 'center' }}>
            <Users size={40} style={{ color: 'var(--mi-line)', marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 6 }}>No bookings yet</div>
            <div style={{ fontSize: 13, color: 'var(--mi-muted)' }}>Tenant booking requests will appear here.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bookings.map(b => {
              const bc = BOOKING_COLORS[b.status] || BOOKING_COLORS.pending;
              return (
                <div key={b._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(17,24,39,0.04)' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: 'var(--mi-brand-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: 14, fontWeight: 700, color: 'var(--mi-brand)',
                  }}>
                    {(b.tenantName || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 3 }}>{b.tenantName || 'Tenant'}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--mi-muted)' }}>{b.unitName || '—'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mi-muted)' }}>
                        <Calendar size={11} /> {b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : '—'}
                      </span>
                      {b.scheduledTime && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mi-muted)' }}>
                          <Clock size={11} /> {b.scheduledTime}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: bc.bg, color: bc.color, flexShrink: 0 }}>
                    {b.status}
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {b.status === 'pending' && (
                      <button type="button" className="mi-icon-action primary" title="Accept" onClick={() => openBookingAction(b, 'accept')}>
                        <Check size={14} /> <span>Accept</span>
                      </button>
                    )}
                    <button type="button" className="mi-icon-action" title="Reschedule" onClick={() => openBookingAction(b, 'reschedule')}>
                      <RefreshCw size={14} /> <span>Reschedule</span>
                    </button>
                    <button type="button" className="mi-icon-action warning" title="Send Email" onClick={() => openBookingAction(b, 'email')}>
                      <Mail size={14} /> <span>Send Email</span>
                    </button>
                    {b.status !== 'cancelled' && (
                      <button type="button" className="mi-icon-action danger" title="Cancel" onClick={() => openBookingAction(b, 'cancel')}>
                        <X size={14} /> <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
      {bookingAction.booking && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: 16 }}>
              <div className="modal-header">
                <h5 className="modal-title fw-semibold text-capitalize">
                  {bookingAction.action === 'email' ? 'Send Email' : bookingAction.action} Viewing
                </h5>
                <button className="btn-close" onClick={() => setBookingAction({ booking: null, action: '' })} />
              </div>
              <div className="modal-body">
                <div className="mb-3 small text-muted">
                  {bookingAction.booking.tenantName || 'Tenant'} · {bookingAction.booking.tenantEmail || 'No email'} · {bookingAction.booking.unitName || 'Unit'}
                </div>
                {bookingAction.action === 'reschedule' && (
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">New date</label>
                      <input className="form-control form-control-sm" type="date" value={actionForm.scheduledDate} onChange={(e) => setActionForm({ ...actionForm, scheduledDate: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">New time</label>
                      <input className="form-control form-control-sm" type="time" value={actionForm.scheduledTime} onChange={(e) => setActionForm({ ...actionForm, scheduledTime: e.target.value })} />
                    </div>
                  </div>
                )}
                <label className="form-label small fw-semibold">
                  {bookingAction.action === 'email' ? 'Email message' : 'Message to tenant'}
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows={4}
                  placeholder="Write a clear note for the tenant..."
                  value={actionForm.message}
                  onChange={(e) => setActionForm({ ...actionForm, message: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setBookingAction({ booking: null, action: '' })}>Close</button>
                <button className="btn btn-primary btn-sm" onClick={submitBookingAction} disabled={acting}>
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

export default LandlordViewings;
