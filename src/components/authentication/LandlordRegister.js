import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { makeRequest } from '../../utils/makeRequest';
import { landlordRegisterURL } from '../../utils/urls';
import { notifyError, notifySuccess } from '../../utils/toast';
import GuestHeader from '../layout/GuestHeader';
import GuestFooter from '../layout/guestFooter';

function LandlordRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', companyName: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { notifyError('Passwords do not match.'); return; }
    if (form.password.length < 8) { notifyError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const res = await makeRequest(landlordRegisterURL, 'POST', {
      fullName: form.fullName, email: form.email, phoneNumber: form.phoneNumber,
      password: form.password, companyName: form.companyName || undefined,
    });
    setLoading(false);
    if (res.success && res.data?.success) {
      notifySuccess('Account created. You can now log in.');
      navigate('/landlord-login');
    } else {
      notifyError(res.error || res.data?.error || 'Registration failed.');
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
            <h1>List your properties</h1>
            <p>Create a free landlord account to list units, manage applications, and coordinate viewings.</p>
            <ul className="auth-panel-list">
              {['List your units for free', 'Receive & review tenant applications', 'Schedule property viewings', 'Message tenants directly'].map(item => (
                <li key={item}><span className="dot" /> {item}</li>
              ))}
            </ul>
          </div>
          <div className="auth-panel-footer"><i className="fa-solid fa-shield-halved" /> Secure &amp; encrypted</div>
        </div>

        <div className="auth-form-side">
          <div className="auth-card">
            <h2 className="auth-card-title">Create a landlord account</h2>
            <p className="auth-card-sub">Already have one? <Link to="/landlord-login" style={{ color: 'var(--mi-brand)', fontWeight: 600 }}>Sign in</Link></p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-2 mb-2">
                <div className="col-12">
                  <label className="auth-label">Full Name</label>
                  <input className="auth-input" name="fullName" value={form.fullName} onChange={handleChange} required />
                </div>
                <div className="col-12">
                  <label className="auth-label">Company / Business Name <span style={{ color: 'var(--mi-muted)', fontSize: '0.8rem' }}>(optional)</span></label>
                  <input className="auth-input" name="companyName" value={form.companyName} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="auth-label">Email Address</label>
                  <input className="auth-input" type="email" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="auth-label">Phone Number</label>
                  <input className="auth-input" type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="auth-label">Password</label>
                  <input className="auth-input" type="password" name="password" value={form.password} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="auth-label">Confirm Password</label>
                  <input className="auth-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'} <i className="fa-solid fa-arrow-right" />
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

export default LandlordRegister;
