import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { makeRequest } from '../../utils/makeRequest';
import { setItem } from '../../utils/localStorage';
import { landlordVerifyHandoffURL } from '../../utils/urls';
import { notifyError } from '../../utils/toast';

// /landlord-entry?token=<handoffToken>
// Consumed once — exchanges handoff token for a Move-In landlord JWT.
function LandlordEntry() {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const consumedRef   = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;

    const token = params.get('token');
    if (!token) {
      notifyError('Invalid entry link.');
      navigate('/landlord-login', { replace: true });
      return;
    }

    (async () => {
      const res = await makeRequest(landlordVerifyHandoffURL, 'POST', { handoffToken: token });
      if (res.success && res.data?.success) {
        const { user, authToken, refreshToken } = res.data;
        await setItem('AGENTUSER', { ...user, authToken, refreshToken });
        navigate('/move-in/landlord/dashboard', { replace: true });
      } else {
        notifyError(res.error || res.data?.error || 'Entry link expired. Please try again.');
        navigate('/landlord-login', { replace: true });
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div className="spinner-border text-primary" role="status" style={{ width: 36, height: 36 }} />
      <p style={{ color: 'var(--mi-muted)', fontSize: '0.9rem' }}>Signing you in…</p>
    </div>
  );
}

export default LandlordEntry;
