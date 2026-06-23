import React, { useEffect, useState } from 'react';
import { CheckCircle2, Save, RefreshCw, Shield, User, XCircle } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getMoveInProfileURL, updateMoveInProfileURL } from '../../../utils/urls';
import { notifySuccess, notifyError } from '../../../utils/toast';
import Breadcrumb from '../../common/Breadcrumb';

function SectionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)',
      overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 6px rgba(17,24,39,0.05)',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--mi-line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--mi-brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} style={{ color: 'var(--mi-brand)' }} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--mi-ink)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--mi-muted)' }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

function FieldRow({ label, name, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--mi-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10,
          border: '1px solid var(--mi-line)', background: '#f9fafb',
          fontSize: 14, color: 'var(--mi-ink)', outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--mi-brand)'}
        onBlur={e => e.target.style.borderColor = 'var(--mi-line)'}
      />
    </div>
  );
}

function Profile() {
  const [profile, setProfile] = useState({
    firstName: '', lastName: '', phone: '', nationalId: '', occupation: '',
    emergencyContactName: '', emergencyContactPhone: '', email: '', isEmailVerified: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    const res = await makeRequest2(getMoveInProfileURL, 'GET');
    if (res.success && res.data) {
      const p = res.data.data || res.data || {};
      const nameParts = (p.fullName || '').trim().split(/\s+/);
      setProfile({
        firstName:             p.firstName || nameParts[0] || '',
        lastName:              p.lastName  || nameParts.slice(1).join(' ') || '',
        phone:                 p.phone || p.phoneNumber || '',
        email:                 p.email || '',
        isEmailVerified:       Boolean(p.isEmailVerified),
        nationalId:            p.nationalId || '',
        occupation:            p.occupation || '',
        emergencyContactName:  p.emergencyContactName || '',
        emergencyContactPhone: p.emergencyContactPhone || '',
      });
    } else {
      setError(res.error || 'Failed to load profile.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await makeRequest2(updateMoveInProfileURL, 'PUT', profile);
    if (res.success) {
      notifySuccess('Profile updated successfully.');
    } else {
      notifyError(res.error || 'Failed to update profile.');
    }
    setSaving(false);
  };

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || '?';

  return (
    <div>
      <Breadcrumb items={[{ label: 'My Profile' }]} />
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>My Profile</h2>
        <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>Manage your personal information</p>
      </div>

      {error && (
        <div className="d-flex align-items-center gap-3 p-3 mb-4"
          style={{ border: '1px solid #fca5a5', borderRadius: 14, background: '#fff5f5', color: '#b91c1c' }}>
          <RefreshCw size={18} />
          <span className="flex-grow-1 small">{error}</span>
          <button className="btn btn-sm"
            style={{ border: '1px solid #b91c1c', color: '#b91c1c', borderRadius: 8, background: 'transparent' }}
            onClick={fetchProfile}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[100, 180, 130].map((h, i) => (
            <div key={i} style={{ height: h, borderRadius: 14, background: '#fff', border: '1px solid var(--mi-line)' }} />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSave}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)', marginBottom: 16, boxShadow: '0 1px 6px rgba(17,24,39,0.05)' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'var(--mi-button)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: 'var(--mi-brand)', flexShrink: 0,
            }}>
              {initials !== '?' ? initials : <User size={26} color="rgba(255,255,255,0.6)" />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--mi-ink)' }}>
                {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Your Name'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--mi-muted)', marginTop: 2 }}>Tenant</div>
            </div>
          </div>

          <SectionCard title="Email Verification" subtitle="Controls account recovery and important updates" icon={profile.isEmailVerified ? CheckCircle2 : XCircle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--mi-ink)' }}>{profile.email || 'No email on file'}</div>
                <div style={{ color: 'var(--mi-muted)', fontSize: 13 }}>
                  {profile.isEmailVerified ? 'This email has been verified.' : 'This email has not been verified yet.'}
                </div>
              </div>
              <span style={{
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 800,
                background: profile.isEmailVerified ? '#dcfce7' : '#fee2e2',
                color: profile.isEmailVerified ? '#166534' : '#991b1b',
              }}>
                {profile.isEmailVerified ? 'Verified' : 'Not verified'}
              </span>
            </div>
          </SectionCard>

          {/* Personal Info */}
          <SectionCard title="Personal Information" subtitle="Your basic details" icon={User}>
            <div className="row g-3">
              <div className="col-md-6">
                <FieldRow label="First Name"   name="firstName"  value={profile.firstName}  onChange={handleChange} placeholder="John" />
              </div>
              <div className="col-md-6">
                <FieldRow label="Last Name"    name="lastName"   value={profile.lastName}   onChange={handleChange} placeholder="Doe" />
              </div>
              <div className="col-md-6">
                <FieldRow label="Phone Number" name="phone"      value={profile.phone}      onChange={handleChange} placeholder="+254 700 000 000" type="tel" />
              </div>
              <div className="col-md-6">
                <FieldRow label="National ID"  name="nationalId" value={profile.nationalId} onChange={handleChange} placeholder="12345678" />
              </div>
              <div className="col-12">
                <FieldRow label="Occupation"   name="occupation" value={profile.occupation} onChange={handleChange} placeholder="e.g. Software Engineer" />
              </div>
            </div>
          </SectionCard>

          {/* Emergency Contact */}
          <SectionCard title="Emergency Contact" subtitle="Someone we can reach in case of emergency" icon={Shield}>
            <div className="row g-3">
              <div className="col-md-6">
                <FieldRow label="Contact Name"  name="emergencyContactName"  value={profile.emergencyContactName}  onChange={handleChange} placeholder="Jane Doe" />
              </div>
              <div className="col-md-6">
                <FieldRow label="Contact Phone" name="emergencyContactPhone" value={profile.emergencyContactPhone} onChange={handleChange} placeholder="+254 700 000 000" type="tel" />
              </div>
            </div>
          </SectionCard>

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10, border: 'none',
              background: saving ? '#9ca3af' : 'var(--mi-button)',
              color: '#fff', fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
}

export default Profile;
