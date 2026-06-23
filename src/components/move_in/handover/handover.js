import React, { useEffect, useState } from 'react';
import { KeyRound, RefreshCw } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getMoveInHandoversURL } from '../../../utils/urls';

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map(n => (
        <td key={n} style={{ border: 'none', padding: '10px 8px' }}>
          <div style={{ height: 18, borderRadius: 6, background: 'var(--mi-line)' }} />
        </td>
      ))}
    </tr>
  );
}

function statusBadge(status) {
  const map = {
    completed: { bg: '#dcfce7', color: '#15803d' },
    pending:   { bg: '#fff7e6', color: 'var(--mi-accent)' },
    scheduled: { bg: '#eff6ff', color: '#1d4ed8' },
  };
  const s = map[status?.toLowerCase()] || { bg: 'var(--mi-line)', color: 'var(--mi-muted)' };
  return (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, background: s.bg, color: s.color }}>
      {status || 'Unknown'}
    </span>
  );
}

function HandoverQueue() {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchHandovers = async () => {
    setLoading(true);
    setError(null);
    const res = await makeRequest2(getMoveInHandoversURL, 'GET');
    if (res.success) {
      setHandovers(res.data?.data || []);
    } else {
      setError(res.error || 'Failed to load handovers.');
      setHandovers([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchHandovers(); }, []);

  return (
    <div className="panel-card">
      <div className="page-header">
        <nav aria-label="breadcrumb" className="mb-1">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.8rem' }}>
            <li className="breadcrumb-item" style={{ color: 'var(--mi-muted)' }}>Home</li>
            <li className="breadcrumb-item active" style={{ color: 'var(--mi-ink)' }}>Handover Queue</li>
          </ol>
        </nav>
        <h2 className="h4 mb-1">Handover Queue</h2>
        <p className="text-secondary mb-0">Key release and unit handover records.</p>
      </div>
      <div className="page-body">

        {error && (
          <div className="d-flex align-items-center gap-3 p-3 mb-4"
            style={{ border: '1px solid #fca5a5', borderRadius: 14, background: '#fff5f5', color: '#b91c1c' }}>
            <RefreshCw size={18} />
            <span className="flex-grow-1 small">{error}</span>
            <button className="btn btn-sm"
              style={{ border: '1px solid #b91c1c', color: '#b91c1c', borderRadius: 8, background: 'transparent' }}
              onClick={fetchHandovers}>Retry</button>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ marginBottom: 0 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--mi-line)', fontSize: '0.82rem', color: 'var(--mi-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {['Tenant', 'Unit', 'Scheduled Date', 'Status', 'Assigned To'].map(h => (
                  <th key={h} className="fw-semibold pb-2" style={{ background: 'transparent', border: 'none' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1, 2, 3, 4, 5].map(n => <SkeletonRow key={n} />)
                : handovers.map((h, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--mi-line)', fontSize: '0.9rem' }}>
                      <td style={{ border: 'none', paddingTop: 14, paddingBottom: 14 }}><div className="fw-semibold">{h.tenantName || '—'}</div></td>
                      <td style={{ border: 'none', paddingTop: 14, paddingBottom: 14, color: 'var(--mi-muted)' }}>{h.unitName || '—'}</td>
                      <td style={{ border: 'none', paddingTop: 14, paddingBottom: 14, color: 'var(--mi-muted)' }}>{h.scheduledDate ? new Date(h.scheduledDate).toLocaleDateString() : '—'}</td>
                      <td style={{ border: 'none', paddingTop: 14, paddingBottom: 14 }}>{statusBadge(h.status)}</td>
                      <td style={{ border: 'none', paddingTop: 14, paddingBottom: 14, color: 'var(--mi-muted)' }}>{h.assignedTo || '—'}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {!loading && handovers.length === 0 && !error && (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2" style={{ color: 'var(--mi-muted)' }}>
            <KeyRound size={40} strokeWidth={1.4} />
            <p className="mb-0">No handovers found</p>
            <p className="small mb-0">Handover records will appear here once scheduled.</p>
          </div>
        )}

        {!loading && handovers.length > 0 && (
          <div className="pt-3" style={{ color: 'var(--mi-muted)', fontSize: '0.83rem' }}>
            Total: <strong style={{ color: 'var(--mi-ink)' }}>{handovers.length}</strong> handover{handovers.length !== 1 ? 's' : ''}
          </div>
        )}

      </div>
    </div>
  );
}

export default HandoverQueue;
