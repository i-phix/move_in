import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, Clock, X, User, MapPin, Users, ChevronDown, ChevronUp, CheckCircle, Send } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getAvailableSlotsURL, getMyMoveInBookingsURL, cancelMoveInBookingURL, bookMoveInSlotURL, submitApplicationURL } from '../../../utils/urls';
import { notifySuccess, notifyError } from '../../../utils/toast';
import Breadcrumb from '../../common/Breadcrumb';

const STATUS_META = {
  pending:   { bg: '#fef9c3', color: '#854d0e',  dot: '#d97706', label: 'Pending' },
  confirmed: { bg: '#dcfce7', color: '#166534',  dot: '#16a34a', label: 'Confirmed' },
  cancelled: { bg: '#fee2e2', color: '#991b1b',  dot: '#dc2626', label: 'Cancelled' },
  completed: { bg: '#e0f2fe', color: '#0369a1',  dot: '#0284c7', label: 'Completed' },
};

// ── Browse tab: unit card with expandable slots ─────────────────────────────
function UnitSlotCard({ group, onBook, bookingId, bookedSlotIds }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)', overflow: 'hidden', boxShadow: '0 1px 6px rgba(17,24,39,0.05)' }}>
      {/* Unit header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, fontWeight: 700, color: '#2563eb' }}>
          {(group.unitName || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 2 }}>{group.unitName || 'Unit'}</div>
          <div style={{ fontSize: 12, color: 'var(--mi-muted)' }}>
            {group.slots.length} available slot{group.slots.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#dcfce7', color: '#15803d' }}>
            {group.slots.length} open
          </span>
          {open ? <ChevronUp size={16} style={{ color: 'var(--mi-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--mi-muted)' }} />}
        </div>
      </div>

      {/* Slots list */}
      {open && (
        <div style={{ borderTop: '1px solid var(--mi-line)' }}>
          {group.slots.map((slot, idx) => {
            const alreadyBooked = bookedSlotIds?.has(String(slot._id));
            const isBooking = bookingId === slot._id;
            const dateStr = new Date(slot.date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' });
            return (
              <div key={slot._id} style={{
                padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                borderBottom: idx < group.slots.length - 1 ? '1px solid var(--mi-line)' : 'none',
                background: idx % 2 === 0 ? '#fafbfc' : '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 110 }}>
                  <CalendarDays size={13} style={{ color: 'var(--mi-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--mi-ink)', fontWeight: 500 }}>{dateStr}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 70 }}>
                  <Clock size={13} style={{ color: 'var(--mi-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--mi-ink)' }}>{slot.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Users size={13} style={{ color: 'var(--mi-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--mi-muted)' }}>{slot.availableSeats} seat{slot.availableSeats !== 1 ? 's' : ''} left</span>
                  {slot.durationMins && <span style={{ fontSize: 12, color: 'var(--mi-muted)' }}>· {slot.durationMins} mins</span>}
                </div>
                <button
                  disabled={alreadyBooked || isBooking}
                  onClick={() => !alreadyBooked && !isBooking && onBook(slot._id, group.unitName)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px',
                    borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600,
                    cursor: alreadyBooked || isBooking ? 'default' : 'pointer',
                    background: alreadyBooked ? '#dcfce7' : isBooking ? 'var(--mi-line)' : 'var(--mi-button)',
                    color: alreadyBooked ? '#15803d' : isBooking ? 'var(--mi-muted)' : '#fff', flexShrink: 0,
                  }}>
                  {alreadyBooked ? <><CheckCircle size={13} /> Booked</> : isBooking ? 'Booking…' : 'Book Slot'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── My Bookings tab ──────────────────────────────────────────────────────────
function BookingCard({ booking, onCancel, onApply, applyingId }) {
  const meta = STATUS_META[booking.status] || { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af', label: booking.status };
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canApply = booking.status !== 'cancelled';
  const isApplying = applyingId === booking._id;
  const dateStr = booking.scheduledDate
    ? new Date(booking.scheduledDate).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)', overflow: 'hidden', boxShadow: '0 1px 6px rgba(17,24,39,0.05)' }}>
      <div style={{ background: 'var(--mi-button)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarDays size={15} style={{ color: 'rgba(255,255,255,0.7)' }} />
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{dateStr || 'Date TBD'}</span>
        </div>
        {booking.scheduledTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} style={{ color: 'rgba(255,255,255,0.7)' }} />
            <span style={{ color: 'var(--mi-brand)', fontSize: 13, fontWeight: 600 }}>{booking.scheduledTime}</span>
          </div>
        )}
      </div>
      <div style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: canCancel || canApply ? 12 : 0 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--mi-ink)', marginBottom: 4 }}>{booking.unitName || 'Unit'}</div>
            {booking.landlordName && (
              <div style={{ fontSize: 12, color: 'var(--mi-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={11} /> {booking.landlordName}
              </div>
            )}
            {booking.location && (
              <div style={{ fontSize: 12, color: 'var(--mi-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <MapPin size={11} /> {booking.location}
              </div>
            )}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, flexShrink: 0, background: meta.bg, color: meta.color }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: meta.dot, marginRight: 5, verticalAlign: 'middle' }} />
            {meta.label}
          </span>
        </div>
        {(canApply || canCancel) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {canApply && (
              <button
                onClick={() => onApply(booking)}
                disabled={isApplying}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  border: 'none', color: '#fff', borderRadius: 8, background: 'var(--mi-button)',
                  cursor: isApplying ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600,
                  opacity: isApplying ? 0.7 : 1,
                }}>
                <Send size={13} /> {isApplying ? 'Submitting...' : 'Apply to rent'}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onCancel(booking._id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                <X size={13} /> Cancel booking
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
function Viewings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedUnitId = searchParams.get('unitId');
  const [tab, setTab]             = useState('browse');
  const [groups, setGroups]       = useState([]);
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [bookingId, setBookingId] = useState(null); // currently booking a slot
  const [applyingId, setApplyingId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const slotsUrl = selectedUnitId
      ? `${getAvailableSlotsURL}?unitId=${encodeURIComponent(selectedUnitId)}`
      : getAvailableSlotsURL;
    const [sRes, bRes] = await Promise.all([
      makeRequest2(slotsUrl, 'GET'),
      makeRequest2(getMyMoveInBookingsURL, 'GET'),
    ]);
    if (sRes.success) {
      const list = sRes.data?.data || sRes.data;
      setGroups(Array.isArray(list) ? list : []);
    }
    if (bRes.success) {
      const list = bRes.data?.data || bRes.data;
      setBookings(Array.isArray(list) ? list : []);
    }
    setLoading(false);
  }, [selectedUnitId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Set of already-booked slotIds so we can disable those buttons
  const bookedSlotIds = new Set(bookings.filter(b => b.status !== 'cancelled').map(b => String(b.slotId)));

  const handleBook = async (slotId, unitName) => {
    if (bookingId) return;
    setBookingId(slotId);
    const res = await makeRequest2(bookMoveInSlotURL, 'POST', { slotId });
    setBookingId(null);
    if (res.success) {
      notifySuccess(`Viewing booked for ${unitName}!`);
      fetchAll();
      setTab('bookings');
    } else {
      notifyError(res.error || 'Failed to book slot.');
    }
  };

  const handleCancel = async (id) => {
    const res = await makeRequest2(`${cancelMoveInBookingURL}/${id}`, 'PUT');
    if (res.success) {
      notifySuccess('Booking cancelled.');
      fetchAll();
    } else {
      notifyError(res.error || 'Failed to cancel booking.');
    }
  };

  const handleApplyFromBooking = async (booking) => {
    if (!booking?.unitId || applyingId) return;

    setApplyingId(booking._id);
    const res = await makeRequest2(submitApplicationURL, 'POST', {
      unitId: booking.unitId,
      facilityId: booking.facilityId || null,
      bookingId: booking._id,
      message: `I booked a viewing for ${booking.unitName || 'this unit'} and would like to apply to rent it.`,
    });
    setApplyingId(null);

    if (res.success) {
      notifySuccess('Application submitted. You can track it from My Applications.');
      navigate('/move-in/applications');
    } else {
      notifyError(res.error || 'Failed to submit application.');
    }
  };

  const upcoming = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const past     = bookings.filter(b => b.status !== 'pending' && b.status !== 'confirmed');

  return (
    <div>
      <Breadcrumb items={[{ label: 'Viewings' }]} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>Viewings</h2>
          <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>
            {selectedUnitId ? 'Book a viewing for the selected home or check your bookings' : 'Browse available viewing slots or check your bookings'}
          </p>
        </div>
        {!loading && upcoming.length > 0 && (
          <div style={{ fontSize: 13, color: '#15803d', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '5px 12px', fontWeight: 600 }}>
            {upcoming.length} upcoming
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid var(--mi-line)' }}>
        {[
          { key: 'browse',   label: 'Browse Available', count: groups.length },
          { key: 'bookings', label: 'My Bookings',       count: bookings.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 20px', border: 'none', background: 'transparent',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            color: tab === t.key ? 'var(--mi-brand)' : 'var(--mi-muted)',
            borderBottom: tab === t.key ? '2px solid var(--mi-brand)' : '2px solid transparent',
            marginBottom: -2,
          }}>
            {t.label}
            <span style={{ marginLeft: 6, fontSize: 11, background: 'var(--mi-line)', borderRadius: 20, padding: '1px 7px', color: 'var(--mi-muted)' }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(n => <div key={n} style={{ height: 72, borderRadius: 14, background: 'var(--mi-line)' }} />)}
        </div>
      ) : tab === 'browse' ? (
        groups.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)', padding: '60px 24px', textAlign: 'center' }}>
            <CalendarDays size={40} strokeWidth={1.3} style={{ color: 'var(--mi-line)', marginBottom: 14 }} />
            <p style={{ fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 6 }}>No viewing slots available</p>
            <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 13 }}>
              Landlords haven't opened any viewing slots yet. Check back soon.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--mi-muted)', marginBottom: 4 }}>
              {groups.length} propert{groups.length !== 1 ? 'ies' : 'y'} with open viewing slots — click to expand
            </div>
            {groups.map(group => (
              <UnitSlotCard
                key={String(group.unitId)}
                group={group}
                onBook={handleBook}
                bookingId={bookingId}
                bookedSlotIds={bookedSlotIds}
              />
            ))}
          </div>
        )
      ) : (
        bookings.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)', padding: '60px 24px', textAlign: 'center' }}>
            <CalendarDays size={40} strokeWidth={1.3} style={{ color: 'var(--mi-line)', marginBottom: 14 }} />
            <p style={{ fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 6 }}>No bookings yet</p>
            <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 13 }}>Browse the available slots tab and book a viewing.</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--mi-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Upcoming</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {upcoming.map(b => (
                    <BookingCard
                      key={b._id}
                      booking={b}
                      onCancel={handleCancel}
                      onApply={handleApplyFromBooking}
                      applyingId={applyingId}
                    />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--mi-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Past</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {past.map(b => (
                    <BookingCard
                      key={b._id}
                      booking={b}
                      onCancel={handleCancel}
                      onApply={handleApplyFromBooking}
                      applyingId={applyingId}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

export default Viewings;
