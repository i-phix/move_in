import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  setUser,
  setToken,
  updateSpinner,
} from '../../features/authentication/authenticationReducer';
import { makeRequest } from '../../utils/makeRequest';
import { verifyOTPURL, loginURL, resendCodeURL, codeVerificationURL } from '../../utils/urls';
import { setItem, getItem } from '../../utils/localStorage';
import { notifyError, notifySuccess } from '../../utils/toast';
import GuestHeader from '../layout/GuestHeader';
import GuestFooter from '../layout/guestFooter';

function CodeVerification() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginEmail = useSelector((state) => state.authenticationReducer.loginEmail);
  const loginPassword = useSelector((state) => state.authenticationReducer.loginPassword);

  const [codeInputs, setCodeInputs] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const codeSent = useRef(false);

  useEffect(() => {
    const init = async () => {
      const existing = await getItem('AGENTUSER');
      const token = existing?.authToken || (typeof existing === 'string' ? JSON.parse(existing)?.authToken : null);
      if (token) {
        navigate('/move-in/dashboard');
        return;
      }
      if (!codeSent.current) {
        codeSent.current = true;
        await makeRequest(codeVerificationURL, 'POST', { userName: loginEmail });
      }
    };
    init();
  }, [navigate, loginEmail]);

  const handleInputChange = (index) => (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...codeInputs];
    next[index] = val;
    setCodeInputs(next);
    if (val && index < 4) inputRefs.current[index + 1]?.focus();
    if (!val && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleKeyDown = (index) => (e) => {
    if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    if (!pasted) return;
    const next = ['', '', '', '', ''];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setCodeInputs(next);
    inputRefs.current[Math.min(pasted.length, 4)]?.focus();
  };

  const handleResend = async () => {
    dispatch(updateSpinner(true));
    const response = await makeRequest(resendCodeURL, 'POST', { userName: loginEmail });
    dispatch(updateSpinner(false));
    if (response.success) {
      notifySuccess('A new code has been sent.');
    } else {
      notifyError('Failed to resend code. Please try again.');
    }
  };

  const handleVerify = async () => {
    const code = codeInputs.join('');
    if (code.length < 5) {
      notifyError('Please enter the full 5-digit code.');
      return;
    }

    setLoading(true);
    dispatch(updateSpinner(true));

    const verifyResponse = await makeRequest(verifyOTPURL, 'POST', {
      code,
      userName: loginEmail,
    });

    if (!verifyResponse.success) {
      notifyError(verifyResponse.error || 'Invalid or expired code.');
      setLoading(false);
      dispatch(updateSpinner(false));
      return;
    }

    const loginResponse = await makeRequest(loginURL, 'POST', {
      userName: loginEmail,
      password: loginPassword,
    });

    setLoading(false);
    dispatch(updateSpinner(false));

    if (!loginResponse.success) {
      notifyError(loginResponse.error || 'Login failed. Please try again.');
      return;
    }

    const authData = loginResponse.data;
    const token = authData.authToken || '';

    await setItem('AGENTUSER', { ...authData, authToken: token });
    dispatch(setUser(authData.user || authData));
    dispatch(setToken(token));

    notifySuccess('Signed in successfully.');
    navigate('/move-in/dashboard');
  };

  const maskedEmail = loginEmail
    ? loginEmail.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : 'your email';

  const allFilled = codeInputs.every((v) => v !== '');

  return (
    <div>
      <GuestHeader />
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'grid',
        placeItems: 'center',
        padding: '6rem 2rem 4rem',
        boxSizing: 'border-box',
      }}>
        <div style={{ width: '440px', maxWidth: '100%' }}>

        {/* Icon badge */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'var(--mi-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          boxShadow: '0 6px 16px rgba(29, 78, 216, 0.25)',
        }}>
          <i className="fa-solid fa-shield-halved" style={{ color: '#fff' }} />
        </div>

        <h2 className="auth-card-title">Check your email</h2>
        <p className="auth-card-sub">
          We sent a 5-digit code to{' '}
          <strong style={{ color: 'var(--mi-ink)' }}>{maskedEmail}</strong>.
          <br />Enter it below to sign in.
        </p>

        {/* OTP inputs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }} onPaste={handlePaste}>
          {codeInputs.map((val, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              onChange={handleInputChange(i)}
              onKeyDown={handleKeyDown(i)}
              ref={(el) => (inputRefs.current[i] = el)}
              style={{
                flex: 1,
                minWidth: 0,
                height: 56,
                border: `1.5px solid ${val ? 'var(--mi-brand)' : 'var(--mi-line)'}`,
                borderRadius: 12,
                fontSize: '1.35rem',
                fontWeight: 700,
                textAlign: 'center',
                color: 'var(--mi-ink)',
                background: val ? '#eff6ff' : 'var(--mi-surface)',
                outline: 'none',
                transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                fontFamily: 'inherit',
                caretColor: 'var(--mi-brand)',
                boxShadow: val ? '0 0 0 3px rgba(29,78,216,0.08)' : 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--mi-brand)';
                e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = val ? 'var(--mi-brand)' : 'var(--mi-line)';
                e.target.style.boxShadow = val ? '0 0 0 3px rgba(29,78,216,0.08)' : 'none';
              }}
            />
          ))}
        </div>

        <button
          type="button"
          className="auth-btn"
          onClick={handleVerify}
          disabled={loading || !allFilled}
        >
          {loading
            ? 'Verifying...'
            : <><span>Verify &amp; Sign In</span><i className="fa-solid fa-arrow-right" /></>}
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
          fontSize: '0.85rem',
        }}>
          <Link to="/login" style={{ color: 'var(--mi-muted)' }}>
            ← Back to login
          </Link>
          <button
            type="button"
            onClick={handleResend}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--mi-brand)', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: 'inherit', padding: 0,
            }}
          >
            <i className="fa-solid fa-rotate-right" />
            Resend code
          </button>
        </div>

        </div>
      </div>
      <GuestFooter />
    </div>
  );
}

export default CodeVerification;
