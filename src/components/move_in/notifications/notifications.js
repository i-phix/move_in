import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Check, RefreshCw, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import {
  getMoveInNotificationsURL,
  markMoveInNotifReadURL,
  markAllMoveInNotifsReadURL,
} from '../../../utils/urls';
import Breadcrumb from '../../common/Breadcrumb';
import { notifySuccess } from '../../../utils/toast';

const TYPE_ICON = {
  info:    { icon: Info,          color: '#2563eb', bg: '#eff6ff' },
  success: { icon: CheckCircle,   color: '#16a34a', bg: '#f0fdf4' },
  warning: { icon: AlertTriangle, color: '#d97706', bg: '#fffbeb' },
  default: { icon: Bell,          color: 'var(--mi-brand)', bg: 'var(--mi-brand-light)' },
};

function NotificationRow({ notif, onMarkRead }) {
  const meta = TYPE_ICON[notif.type] || TYPE_ICON.default;
  const Icon = meta.icon;

  return (
    <div
      onClick={() => !notif.isRead && onMarkRead(notif._id)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '14px 20px', cursor: notif.isRead ? 'default' : 'pointer',
        background: notif.isRead ? 'transparent' : 'var(--mi-brand-light)',
        borderBottom: '1px solid var(--mi-line)', transition: 'background 0.15s',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: meta.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={17} style={{ color: meta.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: notif.isRead ? 400 : 600,
          color: 'var(--mi-ink)', marginBottom: 3,
        }}>
          {notif.title}
        </div>
        {notif.body && (
          <div style={{ fontSize: 12, color: 'var(--mi-muted)', lineHeight: 1.5 }}>{notif.body}</div>
        )}
        {notif.createdAt && (
          <div style={{ fontSize: 11, color: 'var(--mi-muted)', marginTop: 4 }}>
            {new Date(notif.createdAt).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      {!notif.isRead && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mi-brand)', marginTop: 6, flexShrink: 0 }} />
      )}
    </div>
  );
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    const res = await makeRequest2(getMoveInNotificationsURL, 'GET');
    if (res.success && res.data) {
      const list = res.data.data || res.data;
      setNotifications(Array.isArray(list) ? list : []);
    } else {
      setError(res.error || 'Failed to load notifications.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (notifId) => {
    const res = await makeRequest2(`${markMoveInNotifReadURL}/${notifId}`, 'PUT');
    if (res.success) {
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    const res = await makeRequest2(markAllMoveInNotifsReadURL, 'PUT');
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      notifySuccess('All notifications marked as read.');
    }
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Notifications' }]} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>Notifications</h2>
          <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>
            Stay updated on your applications and bookings
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              border: '1px solid var(--mi-brand)', color: 'var(--mi-brand)',
              background: 'var(--mi-brand-light)', cursor: 'pointer',
            }}
          >
            <Check size={14} />
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {error && (
        <div className="d-flex align-items-center gap-3 p-3 mb-4"
          style={{ border: '1px solid #fca5a5', borderRadius: 14, background: '#fff5f5', color: '#b91c1c' }}>
          <RefreshCw size={18} />
          <span className="flex-grow-1 small">{error}</span>
          <button className="btn btn-sm"
            style={{ border: '1px solid #b91c1c', color: '#b91c1c', borderRadius: 8, background: 'transparent' }}
            onClick={fetchNotifications}>Retry</button>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)', overflow: 'hidden' }}>
        {loading ? (
          [1, 2, 3, 4].map(n => (
            <div key={n} style={{ padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, borderBottom: '1px solid var(--mi-line)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--mi-line)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 13, borderRadius: 4, background: 'var(--mi-line)', width: '55%', marginBottom: 6 }} />
                <div style={{ height: 11, borderRadius: 4, background: 'var(--mi-line)', width: '75%' }} />
              </div>
            </div>
          ))
        ) : notifications.length > 0 ? (
          notifications.map(notif => (
            <NotificationRow key={notif._id} notif={notif} onMarkRead={handleMarkRead} />
          ))
        ) : (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <BellOff size={40} strokeWidth={1.3} style={{ color: 'var(--mi-line)', marginBottom: 14 }} />
            <p style={{ fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 6 }}>All clear!</p>
            <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 13 }}>No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
