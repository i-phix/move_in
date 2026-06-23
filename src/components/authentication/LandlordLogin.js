import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { makeRequest } from '../../utils/makeRequest';
import { setItem } from '../../utils/localStorage';
import { landlordLoginURL } from '../../utils/urls';
import { notifyError } from '../../utils/toast';
import GuestHeader from '../layout/GuestHeader';
import GuestFooter from '../layout/guestFooter';

function LandlordLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email)    { notifyError('Email is required.');    return; }
    if (!password) { notifyError('Password is required.'); return; }
    setLoading(true);
    const res = await makeRequest(landlordLoginURL, 'POST', { email, password });
    setLoading(false);
    if (res.success && res.data?.success) {
      const { user, authToken, refreshToken } = res.data;
      await setItem('AGENTUSER', { ...user, authToken, refreshToken });
      navigate('/move-in/landlord/dashboard', { replace: true });
    } else {
      notifyError(res.error || res.data?.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="auth-page">
      <GuestHeader />
      <div className="auth-shell">
        <div className="auth-panel">
          <div className="auth-panel-brand">
            <div className="auth-panel-logo"><i className="fa-solid fa-building" /></div>
            Landlord Portal
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', alignSelf: 'flex-end', marginBottom: 3 }}>Move-In</span>
          </div>
          <div className="auth-panel-copy">
            <h1>Manage your properties</h1>
            <p>PayServe landlords can also sign in here using their existing credentials.</p>
          </div>
          <div className="auth-panel-footer"><i className="fa-solid fa-shield-halved" /> Secure &amp; encrypted</div>
        </div>

        <div className="auth-form-side">
          <div className="auth-card">
            <h2 className="auth-card-title">Landlord sign in</h2>
            <p className="auth-card-sub">No account? <Link to="/landlord-register" style={{ color: 'var(--mi-brand)', fontWeight: 600 }}>Register for free</Link></p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                    {showPassword ? <i className="fa-solid fa-eye-slash" /> : <i className="fa-solid fa-eye" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'} <i className="fa-solid fa-arrow-right" />
              </button>
            </form>
            <div className="auth-footer-links">
              <Link to="/login">Looking for the tenant portal?</Link>
            </div>
          </div>
        </div>
      </div>
      <GuestFooter />
    </div>
  );
}

export default LandlordLogin;
