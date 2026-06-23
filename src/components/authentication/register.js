import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Home, ArrowRight } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { makeRequest } from '../../utils/makeRequest';
import { registerCustomerURL } from '../../utils/urls';
import { notifyError, notifySuccess } from '../../utils/toast';
import { getLocalPreferences } from '../../utils/preferences';
import GuestHeader from '../layout/GuestHeader';
import GuestFooter from '../layout/guestFooter';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedCountry, setSelectedCountry] = useState('ke');

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    if (!/^[a-zA-Z\s-]{2,50}$/.test(form.fullName.trim())) {
      notifyError('Full name must be 2–50 characters (letters, spaces, hyphens only).');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      notifyError('Please enter a valid email address.');
      return false;
    }
    if (!form.phone || form.phone.length < 8) {
      notifyError('Please enter a valid phone number.');
      return false;
    }
    if (form.password.length < 8) {
      notifyError('Password must be at least 8 characters.');
      return false;
    }
    if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      notifyError('Password must include uppercase, lowercase, and a number.');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      notifyError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: '+' + form.phone,
      password: form.password,
    };
    const response = await makeRequest(registerCustomerURL, 'POST', payload);
    setLoading(false);

    if (response.success) {
      // Attach guestId to the registration so backend can link preferences later on login
      const localPrefs = getLocalPreferences();
      if (localPrefs?.guestId && response.data?.userId) {
        makeRequest('/api/move_in/preferences/sync', 'POST', {
          guestId: localPrefs.guestId,
          userId: response.data.userId,
        });
      }
      notifySuccess('Account created! Please sign in.');
      navigate('/login');
    } else {
      notifyError(response.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <GuestHeader />
      <div className="auth-shell">
        {/* ── Left panel ── */}
        <div className="auth-panel">
          <div className="auth-panel-brand">
            <div className="auth-panel-logo">
              <Home size={20} color="#fff" strokeWidth={2.5} />
            </div>
            Move-In
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', alignSelf: 'flex-end', marginBottom: 3 }}>by PayServe</span>
          </div>

          <div className="auth-panel-copy">
            <h1>Find and move into your perfect space</h1>
            <p>Create your free account to browse verified listings, submit applications, and track your move-in from start to finish.</p>
            <ul className="auth-panel-list">
              {['Browse available properties', 'Submit move-in applications', 'Track your handover status', 'Communicate with your landlord'].map((item) => (
                <li key={item}><span className="dot" /> {item}</li>
              ))}
            </ul>
          </div>

          <div className="auth-panel-footer">
            <Home size={13} />
            Kenya&apos;s trusted rental platform
          </div>
        </div>

        {/* ── Right form ── */}
        <div className="auth-form-side">
          <div className="auth-card" style={{ maxWidth: 460 }}>
            <h2 className="auth-card-title">Create your account</h2>
            <p className="auth-card-sub">
              Already have one?{' '}
              <Link to="/login" style={{ color: 'var(--mi-brand)', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  name="fullName"
                  type="text"
                  className="auth-input"
                  placeholder="Jane Doe"
                  value={form.fullName}
                  onChange={set('fullName')}
                  autoComplete="name"
                  required
                />
              </div>

              {/* Email */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Phone — react-phone-input-2 */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-phone">Phone Number</label>
                <PhoneInput
                  country={selectedCountry}
                  value={form.phone}
                  onChange={(phone, country) => {
                    setForm((prev) => ({ ...prev, phone }));
                    setSelectedCountry(country.countryCode);
                  }}
                  inputProps={{ id: 'reg-phone', name: 'phone', required: true, autoComplete: 'tel' }}
                  containerClass="auth-phone-container"
                  inputClass="auth-phone-lib-input"
                  buttonClass="auth-phone-lib-btn"
                  dropdownClass="auth-phone-lib-dropdown"
                  countryCodeEditable={false}
                  enableSearch
                  searchPlaceholder="Search country..."
                  disableSearchIcon
                />
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-password">Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Min 8 chars, upper, lower, number"
                    value={form.password}
                    onChange={set('password')}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="reg-confirm"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1} aria-label="Toggle confirm password visibility">
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Creating account…' : <><span>Create Account</span> <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
      <GuestFooter />
    </div>
  );
}

export default Register;
