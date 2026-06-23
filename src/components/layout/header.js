import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Settings, User, UserCircle } from 'lucide-react';
import { makeRequest2 } from '../../utils/makeRequest';
import { getMoveInNotificationsURL, markMoveInNotifReadURL } from '../../utils/urls';
import { clearStorage, getItem } from '../../utils/localStorage';

const titles = {
  '/move-in/dashboard':     'Dashboard',
  '/move-in/applications':  'My Applications',
  '/move-in/viewings':      'My Viewings',
  '/move-in/reservations':  'My Reservations',
  '/move-in/messages':      'Messages',
  '/move-in/notifications': 'Notifications',
  '/move-in/landlord/dashboard':    'Move In',
  '/move-in/landlord/units':        'My Units',
  '/move-in/landlord/applications': 'Applications',
  '/move-in/landlord/viewings':     'Viewings',
  '/move-in/landlord/reservations': 'Reservations',
  '/move-in/landlord/messages':     'Messages',
  '/move-in/payments':      'Payment History',
  '/move-in/checklists':    'Move-In Checklists',
  '/move-in/handovers':     'Handover Queue',
  '/move-in/profile':       'My Profile',
  '/move-in/settings':      'Settings',
  '/move-in/landlord/profile':  'Profile',
  '/move-in/landlord/settings': 'Settings',
  '/move-in/admin/profile':     'Profile',
  '/move-in/admin/settings':    'Settings',
  '/move-in/units':         'Houses & Units',
  '/move-in/tenants':       'Tenant Intake',
  '/move-in/admin/dashboard':    'Move-In Admin Overview',
  '/move-in/admin/listings':     'Move-In Listings',
  '/move-in/admin/applications': 'Move-In Applications',
  '/move-in/admin/customers':    'Move-In Customers',
  '/move-in/admin/preferences':  'Preference Analytics',
  '/move-in/admin/landlords':    'Landlord Access',
  '/move-in/admin/viewings':     'Move-In Viewings',
  '/move-in/admin/reservations': 'Move-In Reservations',
  '/move-in/admin/deals':        'Move-In Deals',
  '/move-in/admin/audit-logs':   'Move-In Audit Logs',
};

function getInitials(name) {
  if (!name) return null;
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = titles[location.pathname] || 'Move In';
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPage, setNotifPage] = useState(1);
  const [notifPages, setNotifPages] = useState(1);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    getItem('AGENTUSER').then(u => { if (u) setUser(u); });
  }, []);

  useEffect(() => {
    if (!user) return;
    makeRequest2(`${getMoveInNotificationsURL}?page=${notifPage}&limit=5`, 'GET').then((res) => {
      if (res.success) {
        setNotifications(res.data?.data || []);
        setUnreadCount(res.data?.unreadCount || 0);
        setNotifPages(res.data?.pagination?.pages || 1);
      }
    }).catch(() => {});
  }, [user, notifPage]);

  useEffect(() => {
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeMenus = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', closeMenus);
    return () => document.removeEventListener('mousedown', closeMenus);
  }, []);

  const displayName = user?.fullName || user?.name || user?.email || 'User';
  const displaySub = user?.email || 'Move-In Portal';
  const initials    = getInitials(user?.fullName || user?.name || user?.email);
  const profilePath = user?.role === 'admin'
    ? '/move-in/admin/profile'
    : (user?.role === 'landlord' ? '/move-in/landlord/profile' : '/move-in/profile');
  const settingsPath = user?.role === 'admin'
    ? '/move-in/admin/settings'
    : (user?.role === 'landlord' ? '/move-in/landlord/settings' : '/move-in/settings');

  const notificationTarget = (item) => {
    if (user?.role === 'landlord') {
      if (item.type === 'viewing') return '/move-in/landlord/viewings';
      if (item.type === 'reservation') return '/move-in/landlord/reservations';
      if (item.type === 'application') return '/move-in/landlord/applications';
      if (item.type === 'message') return '/move-in/landlord/messages';
      return '/move-in/landlord/dashboard';
    }
    if (user?.role === 'admin') {
      if (item.type === 'viewing') return '/move-in/admin/viewings';
      if (item.type === 'reservation') return '/move-in/admin/reservations';
      if (item.type === 'application') return '/move-in/admin/applications';
      if (item.type === 'listing' || item.type === 'unit_approval') return '/move-in/admin/listings';
      if (item.type === 'commission' || item.type === 'payment') return '/move-in/admin/dashboard';
      return '/move-in/admin/dashboard';
    }
    if (item.type === 'viewing') return '/move-in/viewings';
    if (item.type === 'reservation') return '/move-in/reservations';
    if (item.type === 'application') return '/move-in/applications';
    if (item.type === 'message') return '/move-in/messages';
    return '/move-in/dashboard';
  };

  const handleNotificationClick = async (item) => {
    if (!item.isRead) {
      await makeRequest2(`${markMoveInNotifReadURL}/${item._id}`, 'PUT').catch(() => {});
      setUnreadCount((count) => Math.max(0, count - 1));
      setNotifications((items) => items.map((n) => n._id === item._id ? { ...n, isRead: true } : n));
    }
    setNotifOpen(false);
    navigate(notificationTarget(item));
  };

  const handleLogout = async () => {
    await clearStorage();
    navigate('/');
  };

  return (
    <header className="app-topbar">
      <h1 className="h5 mb-0 fw-semibold">{title}</h1>
      <div className="d-flex align-items-center gap-2">
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="mi-topbar-icon"
            aria-label="Notifications"
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
          >
            <Bell size={18} strokeWidth={1.9} />
            {unreadCount > 0 && <span className="mi-notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="mi-topbar-menu mi-notification-menu">
              <div className="mi-menu-title">Notifications</div>
              {notifications.length === 0 ? (
                <div className="mi-menu-empty">No notifications</div>
              ) : notifications.map((item) => (
                <button key={item._id} type="button" className={`mi-notification-item ${item.isRead ? 'read' : ''}`} onClick={() => handleNotificationClick(item)}>
                  <div className="fw-semibold small">{item.title}</div>
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{item.body}</div>
                </button>
              ))}
              {notifPages > 1 && (
                <div className="mi-notification-pager">
                  <button type="button" disabled={notifPage <= 1} onClick={() => setNotifPage((p) => Math.max(1, p - 1))}>Prev</button>
                  <span>{notifPage} / {notifPages}</span>
                  <button type="button" disabled={notifPage >= notifPages} onClick={() => setNotifPage((p) => Math.min(notifPages, p + 1))}>Next</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-end d-none d-md-block">
          <div className="fw-semibold small">{displayName}</div>
          <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{displaySub}</div>
        </div>
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="mi-topbar-avatar"
            aria-label="Account menu"
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
          >
            {initials || <User size={17} strokeWidth={1.9} />}
          </button>
          {profileOpen && (
            <div className="mi-topbar-menu">
              <button type="button" className="mi-menu-action" onClick={() => navigate(profilePath)}>
                <UserCircle size={15} /> <span>Profile</span>
              </button>
              <button type="button" className="mi-menu-action" onClick={() => navigate(settingsPath)}>
                <Settings size={15} /> <span>Settings</span>
              </button>
              <button type="button" className="mi-menu-action danger" onClick={handleLogout}>
                <LogOut size={15} /> <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
