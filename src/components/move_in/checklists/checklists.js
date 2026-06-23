import React, { useEffect, useState } from 'react';
import { ClipboardCheck, RefreshCw } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getMoveInChecklistsURL } from '../../../utils/urls';

function statusBadge(status) {
  const map = {
    completed:   { bg: '#dcfce7', color: '#15803d' },
    pending:     { bg: '#fff7e6', color: 'var(--mi-accent)' },
    in_progress: { bg: '#eff6ff', color: '#1d4ed8' },
  };
  const s = map[status?.toLowerCase()] || { bg: 'var(--mi-line)', color: 'var(--mi-muted)' };
  return (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, background: s.bg, color: s.color }}>
      {status || 'Unknown'}
    </span>
  );
}

function Checklists() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetchChecklists = async () => {
    setLoading(true);
    setError(null);
    const res = await makeRequest2(getMoveInChecklistsURL, 'GET');
    if (res.success) {
      setChecklists(res.data?.data || []);
    } else {
      setError(res.error || 'Failed to load checklists.');
      setChecklists([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchChecklists(); }, []);

  return (
    <div className="panel-card">
      <div className="page-header">
        <nav aria-label="breadcrumb" className="mb-1">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.8rem' }}>
            <li className="breadcrumb-item" style={{ color: 'var(--mi-muted)' }}>Home</li>
            <li className="breadcrumb-item active" style={{ color: 'var(--mi-ink)' }}>Move-In Checklists</li>
          </ol>
        </nav>
        <h2 className="h4 mb-1">Move-In Checklists</h2>
        <p className="text-secondary mb-0">Unit readiness, documentation, and completion status.</p>
      </div>
      <div className="page-body">

        {error && (
          <div className="d-flex align-items-center gap-3 p-3 mb-4"
            style={{ border: '1px solid #fca5a5', borderRadius: 14, background: '#fff5f5', color: '#b91c1c' }}>
            <RefreshCw size={18} />
            <span className="flex-grow-1 small">{error}</span>
            <button className="btn btn-sm"
              style={{ border: '1px solid #b91c1c', color: '#b91c1c', borderRadius: 8, background: 'transparent' }}
              onClick={fetchChecklists}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="placeholder-list">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} style={{ height: 64, borderRadius: 14, background: 'var(--mi-line)' }} />
            ))}
          </div>
        ) : checklists.length === 0 && !error ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2" style={{ color: 'var(--mi-muted)' }}>
            <ClipboardCheck size={40} strokeWidth={1.4} />
            <p className="mb-0">No checklists found</p>
            <p className="small mb-0">Move-in checklists will appear here once created.</p>
          </div>
        ) : (
          <div className="placeholder-list">
            {checklists.map((c, idx) => (
              <div className="placeholder-row" key={idx}>
                <div>
                  <div className="fw-semibold">{c.unitName || 'Unit'}</div>
                  <div className="small" style={{ color: 'var(--mi-muted)' }}>
                    Tenant: {c.tenantName || '—'}
                    {c.completionDate && <> &middot; Completed: {new Date(c.completionDate).toLocaleDateString()}</>}
                  </div>
                </div>
                {statusBadge(c.status)}
              </div>
            ))}
          </div>
        )}

        {!loading && checklists.length > 0 && (
          <div className="pt-3" style={{ color: 'var(--mi-muted)', fontSize: '0.83rem' }}>
            Total: <strong style={{ color: 'var(--mi-ink)' }}>{checklists.length}</strong> checklist{checklists.length !== 1 ? 's' : ''}
          </div>
        )}

      </div>
    </div>
  );
}

export default Checklists;
