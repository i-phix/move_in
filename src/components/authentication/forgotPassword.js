import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { makeRequest } from '../../utils/makeRequest';
import { moveInForgotPasswordURL } from '../../utils/urls';
import { notifyError, notifySuccess } from '../../utils/toast';
import GuestHeader from '../layout/GuestHeader';
import GuestFooter from '../layout/guestFooter';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await makeRequest(moveInForgotPasswordURL, 'POST', { email });

    if (response.success && response.data?.success) {
      notifySuccess('If that email exists, a reset code has been sent.');
      navigate('/reset-password', { state: { email } });
      return;
    }

    notifyError(response.error || response.data?.error || 'Unable to submit request.');
  };

  return (
    <div>
      <GuestHeader />
      <div className="auth-shell">
        <div className="auth-panel">
          <div className="auth-panel-brand">
            <div className="auth-panel-logo">
              <i className="fa-solid fa-envelope-open-text" />
            </div>
            Password Recovery
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', alignSelf: 'flex-end', marginBottom: 3 }}>Move-In</span>
          </div>

          <div className="auth-panel-copy">
            <h1>Reset access quickly</h1>
            <p>Enter your email to receive a password reset link for the move-in portal.</p>
          </div>

          <div className="auth-panel-footer">
            <i className="fa-solid fa-lock" />
            Secure recovery
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-card">
            <h2 className="auth-card-title">Forgot Password</h2>
            <p className="auth-card-sub">We will send a reset link to your email.</p>
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <button className="auth-btn" type="submit">Send Reset Request</button>
            </form>
            <div className="auth-footer-links">
              <Link to="/">Back to login</Link>
            </div>
          </div>
        </div>
      </div>
      <GuestFooter />
    </div>
  );
}

export default ForgotPassword;
