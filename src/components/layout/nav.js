import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  CalendarCheck,
  ChartLine,
  CreditCard,
  ClipboardList,
  FileText,
  Home,
  House,
  KeyRound,
  ListChecks,
  LogOut,
  MessageCircle,
  ShieldCheck,
  User,
  Users,
  WalletCards,
} from 'lucide-react';
import { getItem, clearStorage } from '../../utils/localStorage';

const TENANT_NAV = [
  { to: '/move-in/dashboard',     label: 'Dashboard',     icon: ChartLine },
  { to: '/move-in/listings',      label: 'Browse Homes',  icon: House },
  { to: '/move-in/applications',  label: 'Applications',  icon: FileText },
  { to: '/move-in/viewings',      label: 'Viewings',      icon: CalendarCheck },
  { to: '/move-in/reservations',  label: 'Reservations',  icon: Home },
  { to: '/move-in/messages',      label: 'Messages',      icon: MessageCircle },
  { to: '/move-in/notifications', label: 'Notifications', icon: Bell },
  { to: '/move-in/payments',      label: 'Payments',      icon: CreditCard },
  { to: '/move-in/checklists',    label: 'Checklists',    icon: ListChecks },
  { to: '/move-in/handovers',     label: 'Handovers',     icon: KeyRound },
  { to: '/move-in/profile',       label: 'Profile',       icon: User },
];

const LANDLORD_NAV = [
  { to: '/move-in/landlord/dashboard',    label: 'Dashboard',    icon: ChartLine },
  { to: '/move-in/landlord/units',        label: 'My Units',     icon: Building2 },
  { to: '/move-in/landlord/applications', label: 'Applications', icon: FileText },
  { to: '/move-in/landlord/viewings',     label: 'Viewings',     icon: CalendarCheck },
  { to: '/move-in/landlord/reservations', label: 'Reservations', icon: Home },
  { to: '/move-in/landlord/messages',     label: 'Messages',     icon: MessageCircle },
];

const ADMIN_NAV = [
  { to: '/move-in/admin/dashboard',    label: 'Overview',              icon: ChartLine },
  { to: '/move-in/admin/listings',     label: 'Listings',              icon: ClipboardList },
  { to: '/move-in/admin/applications', label: 'Applications',          icon: FileText },
  { to: '/move-in/admin/customers',    label: 'Customers',             icon: Users },
  { to: '/move-in/admin/preferences',  label: 'Preferences Analytics', icon: ListChecks },
  { to: '/move-in/admin/landlords',    label: 'Landlord Access',       icon: Building2 },
  { to: '/move-in/admin/viewings',     label: 'Viewings',              icon: CalendarCheck },
  { to: '/move-in/admin/reservations', label: 'Reservations',          icon: Home },
  { to: '/move-in/admin/deals',        label: 'Deals & Commissions',   icon: WalletCards },
  { to: '/move-in/admin/audit-logs',   label: 'Audit Logs',            icon: ShieldCheck },
];

function Nav() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    getItem('AGENTUSER').then(user => setRole(user?.role || 'tenant'));
  }, []);

  const handleLogout = async () => {
    await clearStorage();
    navigate('/');
  };

  const navItems = role === 'admin' ? ADMIN_NAV : (role === 'landlord' ? LANDLORD_NAV : TENANT_NAV);
  const workspaceLabel = role === 'admin'
    ? 'Admin workspace'
    : (role === 'landlord' ? 'Landlord workspace' : 'Move In workspace');

  return (
    <aside className="app-sidebar">
      <div className="brand-card">
        <div className="brand-mark">PayServe</div>
        <div className="brand-subtext">{workspaceLabel}</div>
      </div>

      <div>
        <div className="nav-section-label">Navigation</div>
        <div className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <div className="nav-section-label">Session</div>
        <button
          type="button"
          className="nav-link-item w-100 text-start bg-transparent"
          onClick={handleLogout}
        >
          <LogOut size={17} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Nav;
