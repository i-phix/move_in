import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw, Search } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getMyApplicationsURL } from '../../../utils/urls';
import Breadcrumb from '../../common/Breadcrumb';

const STATUS_META = {
  pending:   { bg: '#fef9c3', color: '#854d0e',  label: 'Pending',   dot: '#d97706' },
  reviewing: { bg: '#dbeafe', color: '#1e40af',  label: 'Reviewing', dot: '#2563eb' },
  assigned:  { bg: '#dcfce7', color: '#166534',  label: 'Assigned',  dot: '#16a34a' },
  approved:  { bg: '#dcfce7', color: '#166534',  label: 'Approved',  dot: '#16a34a' },
  rejected:  { bg: '#fee2e2', color: '#991b1b',  label: 'Rejected',  dot: '#dc2626' },
  completed: { bg: '#e0f2fe', color: '#0369a1',  label: 'Completed', dot: '#0284c7' },
};

const FILTERS = ['all', 'pending', 'approved', 'rejected'];

function ApplicationCard({ app }) {
  const meta = STATUS_META[app.status] || { bg: '#f3f4f6', color: '#6b7280', label: app.status, dot: '#9ca3af' };
  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)',
      padding: '18px 20px', boxShadow: '0 1px 6px rgba(17,24,39,0.05)',
      transition: 'box-shadow 0.15s',
    }}>
      <div className="d-flex align-items-start gap-3">
        {/* Icon */}
        <div style={{
          width: 42, height: 42, borderRadius: 11, background: 'var(--mi-brand-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FileText size={20} style={{ color: 'var(--mi-brand)' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--mi-ink)', marginBottom: 2 }}>
                {app.unitName || 'Unit'}
              </div>
              {app.facilityName && (
                <div style={{ fontSize: 12, color: 'var(--mi-muted)' }}>{app.facilityName}</div>
              )}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
              background: meta.bg, color: meta.color, flexShrink: 0, whiteSpace: 'nowrap',
            }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: meta.dot, marginRight: 5, verticalAlign: 'middle' }} />
              {meta.label}
            </span>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {app.createdAt && (
              <span style={{ fontSize: 12, color: 'var(--mi-muted)' }}>
                Applied {new Date(app.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            {app.desiredMoveInDate && (
              <span style={{ fontSize: 12, color: 'var(--mi-muted)', borderLeft: '1px solid var(--mi-line)', paddingLeft: 12 }}>
                Move-in {new Date(app.desiredMoveInDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
              </span>
            )}
            {app.source === 'viewing' && (
              <span style={{ fontSize: 12, color: 'var(--mi-brand)', borderLeft: '1px solid var(--mi-line)', paddingLeft: 12, fontWeight: 600 }}>
                From viewing
              </span>
            )}
          </div>

          {app.adminNote && (
            <div style={{
              marginTop: 10, padding: '8px 12px', borderRadius: 8,
              background: '#f9fafb', border: '1px solid var(--mi-line)',
              fontSize: 12, color: '#6b7280', fontStyle: 'italic',
            }}>
              {app.adminNote}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [filter, setFilter]             = useState('all');

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    const res = await makeRequest2(getMyApplicationsURL, 'GET');
    if (res.success && res.data) {
      setApplications(res.data.data || res.data || []);
    } else {
      setError(res.error || 'Failed to load applications.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  return (
    <div>
      <Breadcrumb items={[{ label: 'My Applications' }]} />
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>My Applications</h2>
          <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>Track the status of your rental applications</p>
        </div>
        {!loading && (
          <div style={{ fontSize: 13, color: 'var(--mi-muted)', background: '#fff', border: '1px solid var(--mi-line)', borderRadius: 8, padding: '6px 12px' }}>
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {error && (
        <div className="d-flex align-items-center gap-3 p-3 mb-4"
          style={{ border: '1px solid #fca5a5', borderRadius: 14, background: '#fff5f5', color: '#b91c1c' }}>
          <RefreshCw size={18} />
          <span className="flex-grow-1 small">{error}</span>
          <button className="btn btn-sm"
            style={{ border: '1px solid #b91c1c', color: '#b91c1c', borderRadius: 8, background: 'transparent' }}
            onClick={fetchApplications}>Retry</button>
        </div>
      )}

      {/* Filter pills */}
      {!loading && applications.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: filter === f ? 'none' : '1px solid var(--mi-line)',
                background: filter === f ? 'var(--mi-button)' : '#fff',
                color: filter === f ? '#fff' : 'var(--mi-muted)',
                transition: 'all 0.15s',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ height: 90, borderRadius: 14, background: '#fff', border: '1px solid var(--mi-line)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(app => <ApplicationCard key={app._id} app={app} />)}
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)',
          padding: '60px 24px', textAlign: 'center',
        }}>
          <Search size={40} strokeWidth={1.3} style={{ color: 'var(--mi-line)', marginBottom: 14 }} />
          <p style={{ fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 6 }}>
            {filter !== 'all' ? `No ${filter} applications` : 'No applications yet'}
          </p>
          <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 13 }}>
            Browse listings and submit an application to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default MyApplications;
