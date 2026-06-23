import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { makeRequest } from '../../utils/makeRequest';
import { verifyMoveInEmailURL } from '../../utils/urls';
import GuestHeader from '../layout/GuestHeader';
import GuestFooter from '../layout/guestFooter';

function VerifyEmail() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, success: false, message: 'Verifying your email...' });

  useEffect(() => {
    makeRequest(`${verifyMoveInEmailURL}/${token}`, 'GET').then((res) => {
      setState({
        loading: false,
        success: Boolean(res.success && res.data?.success),
        message: res.data?.message || res.error || 'Unable to verify this email link.',
      });
    });
  }, [token]);

  return (
    <div>
      <GuestHeader />
      <div className="auth-shell">
        <div className="auth-panel">
          <div className="auth-panel-brand">
            <div className="auth-panel-logo"><i className="fa-solid fa-shield-check" /></div>
            Email Verification
          </div>
          <div className="auth-panel-copy">
            <h1>{state.loading ? 'Checking link' : state.success ? 'Email verified' : 'Link not valid'}</h1>
            <p>{state.message}</p>
          </div>
        </div>
        <div className="auth-form-side">
          <div className="auth-card">
            <h2 className="auth-card-title">{state.success ? 'You are verified' : 'Verification'}</h2>
            <p className="auth-card-sub">{state.message}</p>
            <Link className="auth-btn text-center text-decoration-none" to="/login">Go to login</Link>
          </div>
        </div>
      </div>
      <GuestFooter />
    </div>
  );
}

export default VerifyEmail;
