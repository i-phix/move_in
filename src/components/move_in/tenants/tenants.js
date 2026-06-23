import React, { useEffect, useState } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getMoveInTenantsURL } from '../../../utils/urls';

function statusBadge(status) {
  const map = {
    active:   { bg: '#dcfce7', color: '#15803d' },
    pending:  { bg: '#fff7e6', color: 'var(--mi-accent)' },
    inactive: { bg: 'var(--mi-line)', color: 'var(--mi-muted)' },
  };
  const s = map[status?.toLowerCase()] || { bg: 'var(--mi-line)', color: 'var(--mi-muted)' };
  return (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, background: s.bg, color: s.color }}>
      {status || 'Unknown'}
    </span>
  );
}

function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    const res = await makeRequest2(getMoveInTenantsURL, 'GET');
    if (res.success) {
      setTenants(res.data?.data || []);
    } else {
      setError(res.error || 'Failed to load tenants.');
      setTenants([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTenants(); }, []);

  return (
    <div className="panel-card">
      <div className="page-header">
        <nav aria-label="breadcrumb" className="mb-1">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.8rem' }}>
            <li className="breadcrumb-item" style={{ color: 'var(--mi-muted)' }}>Home</li>
            <li className="breadcrumb-item active" style={{ color: 'var(--mi-ink)' }}>Tenant Intake</li>
          </ol>
        </nav>
        <h2 className="h4 mb-1">Tenant Intake</h2>
        <p className="text-secondary mb-0">Applicant profiles, contacts, and onboarding status.</p>
      </div>
      <div className="page-body">

        {error && (
          <div className="d-flex align-items-center gap-3 p-3 mb-4"
            style={{ border: '1px solid #fca5a5', borderRadius: 14, background: '#fff5f5', color: '#b91c1c' }}>
            <RefreshCw size={18} />
            <span className="flex-grow-1 small">{error}</span>
            <button className="btn btn-sm"
              style={{ border: '1px solid #b91c1c', color: '#b91c1c', borderRadius: 8, background: 'transparent' }}
              onClick={fetchTenants}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="placeholder-list">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} style={{ height: 68, borderRadius: 14, background: 'var(--mi-line)' }} />
            ))}
          </div>
        ) : tenants.length === 0 && !error ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2" style={{ color: 'var(--mi-muted)' }}>
            <Users size={40} strokeWidth={1.4} />
            <p className="mb-0">No tenants found</p>
            <p className="small mb-0">Tenant intake records will appear here once added.</p>
          </div>
        ) : (
          <div className="placeholder-list">
            {tenants.map((t, idx) => (
              <div className="placeholder-row" key={idx}>
                <div>
                  <div className="fw-semibold">{t.name || '—'}</div>
                  <div className="small" style={{ color: 'var(--mi-muted)' }}>
                    {t.email || '—'}
                    {t.phone    && <> &middot; {t.phone}</>}
                    {t.unitName && <> &middot; Unit: {t.unitName}</>}
                    {t.moveInDate && <> &middot; Move-in: {new Date(t.moveInDate).toLocaleDateString()}</>}
                  </div>
                </div>
                {statusBadge(t.status)}
              </div>
            ))}
          </div>
        )}

        {!loading && tenants.length > 0 && (
          <div className="pt-3" style={{ color: 'var(--mi-muted)', fontSize: '0.83rem' }}>
            Total: <strong style={{ color: 'var(--mi-ink)' }}>{tenants.length}</strong> tenant{tenants.length !== 1 ? 's' : ''}
          </div>
        )}

      </div>
    </div>
  );
}

export default Tenants;
