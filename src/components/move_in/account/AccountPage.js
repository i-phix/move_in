import React, { useEffect, useState } from 'react';
import { Settings, UserCircle } from 'lucide-react';
import { getItem } from '../../../utils/localStorage';
import Breadcrumb from '../../common/Breadcrumb';

function AccountPage({ mode = 'profile' }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getItem('AGENTUSER').then(setUser);
  }, []);

  const title = mode === 'settings' ? 'Settings' : 'Profile';
  const Icon = mode === 'settings' ? Settings : UserCircle;

  return (
    <div>
      <Breadcrumb items={[{ label: title }]} />
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>{title}</h2>
        <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>
          {mode === 'settings' ? 'Manage workspace preferences.' : 'Review your account details.'}
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--mi-line)', borderRadius: 16, padding: 20, maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--mi-brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mi-brand)' }}>
            <Icon size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--mi-ink)' }}>{user?.fullName || user?.name || user?.email || 'Move-In User'}</div>
            <div style={{ color: 'var(--mi-muted)', fontSize: 13 }}>{user?.email || 'No email available'}</div>
          </div>
        </div>

        {mode === 'settings' ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: '1px solid var(--mi-line)' }}>
              <span>
                <strong style={{ color: 'var(--mi-ink)' }}>In-app notifications</strong>
                <span style={{ display: 'block', color: 'var(--mi-muted)', fontSize: 13 }}>Receive Move-In alerts in the header.</span>
              </span>
              <input type="checkbox" checked readOnly />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: '1px solid var(--mi-line)' }}>
              <span>
                <strong style={{ color: 'var(--mi-ink)' }}>Email updates</strong>
                <span style={{ display: 'block', color: 'var(--mi-muted)', fontSize: 13 }}>Receive important viewing, reservation, and account emails.</span>
              </span>
              <input type="checkbox" checked readOnly />
            </label>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10, color: 'var(--mi-ink)' }}>
            <div><strong>Role:</strong> {user?.role || 'tenant'}</div>
            <div><strong>Portal:</strong> Move-In</div>
            <div style={{ color: 'var(--mi-muted)', fontSize: 13 }}>Tenant profiles can also be edited from the tenant Profile page.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountPage;
