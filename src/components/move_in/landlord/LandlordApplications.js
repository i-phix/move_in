import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, FileText, Calendar, Mail, MessageSquare } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getLandlordApplicationsURL, respondApplicationURL } from '../../../utils/urls';
import { notifySuccess, notifyError } from '../../../utils/toast';
import Breadcrumb from '../../common/Breadcrumb';

const STATUS_COLORS = {
  pending:   { bg: '#fff7e6', color: '#d97706' },
  approved:  { bg: '#dcfce7', color: '#15803d' },
  rejected:  { bg: '#fee2e2', color: '#b91c1c' },
  assigned:  { bg: '#eff6ff', color: '#2563eb' },
  completed: { bg: '#f3f4f6', color: '#6b7280' },
};

const FILTERS = ['All', 'pending', 'approved', 'rejected'];

function LandlordApplications() {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');
  const [acting, setActing]     = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchApps = async () => {
    setLoading(true);
    const q = filter !== 'All' ? `?status=${filter}` : '';
    const res = await makeRequest2(getLandlordApplicationsURL + q, 'GET');
    if (res.success) setApps(res.data?.data || res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, [filter]); // eslint-disable-line

  const respond = async (id, action) => {
    setActing(id + action);
    const res = await makeRequest2(`${respondApplicationURL}/${id}`, 'PUT', { action });
    setActing(null);
    if (res.success) {
      notifySuccess(`Application ${action}d successfully.`);
      fetchApps();
    } else {
      notifyError(res.error || 'Failed to respond.');
    }
  };

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Applications' }]} />

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>Applications</h2>
        <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>Review and respond to tenant rental applications</p>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 16px', borderRadius: 20, border: active ? 'none' : '1px solid var(--mi-line)',
              background: active ? 'var(--mi-button)' : '#fff', color: active ? '#fff' : 'var(--mi-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(n => <div key={n} style={{ height: 76, borderRadius: 14, background: 'var(--mi-line)' }} />)}
        </div>
      ) : apps.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)', padding: '64px 20px', textAlign: 'center' }}>
          <FileText size={40} style={{ color: 'var(--mi-line)', marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 6 }}>No applications found</div>
          <div style={{ fontSize: 13, color: 'var(--mi-muted)' }}>Applications from tenants will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {apps.map(a => {
            const sc = STATUS_COLORS[a.status] || STATUS_COLORS.completed;
            const isOpen = expanded === a._id;
            return (
              <div key={a._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--mi-line)', overflow: 'hidden', boxShadow: '0 1px 6px rgba(17,24,39,0.04)' }}>
                {/* Summary row */}
                <div
                  onClick={() => toggleExpand(a._id)}
                  style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: 'var(--mi-brand-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: 15, fontWeight: 700, color: 'var(--mi-brand)',
                  }}>
                    {(a.tenantName || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-ink)' }}>{a.tenantName || 'Tenant'}</div>
                    <div style={{ fontSize: 12, color: 'var(--mi-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.unitName || '—'} · {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>
                      {a.status}
                    </span>
                    {isOpen ? <ChevronUp size={16} style={{ color: 'var(--mi-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--mi-muted)' }} />}
                  </div>
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--mi-line)', padding: '16px 20px', background: '#fafbfc' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: a.message ? 14 : 0 }}>
                      {a.tenantEmail && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <Mail size={14} style={{ color: 'var(--mi-muted)', marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--mi-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Email</div>
                            <div style={{ fontSize: 13, color: 'var(--mi-ink)' }}>{a.tenantEmail}</div>
                          </div>
                        </div>
                      )}
                      {a.tenantPhone && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ width: 14, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--mi-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Phone</div>
                            <div style={{ fontSize: 13, color: 'var(--mi-ink)' }}>{a.tenantPhone}</div>
                          </div>
                        </div>
                      )}
                      {a.desiredMoveInDate && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <Calendar size={14} style={{ color: 'var(--mi-muted)', marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--mi-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Desired Move-in</div>
                            <div style={{ fontSize: 13, color: 'var(--mi-ink)' }}>{new Date(a.desiredMoveInDate).toLocaleDateString()}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {a.message && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 16, padding: '10px 14px', background: '#fff', borderRadius: 10, border: '1px solid var(--mi-line)' }}>
                        <MessageSquare size={14} style={{ color: 'var(--mi-muted)', flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--mi-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Message from tenant</div>
                          <div style={{ fontSize: 13, color: 'var(--mi-ink)', fontStyle: 'italic' }}>"{a.message}"</div>
                        </div>
                      </div>
                    )}

                    {a.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          disabled={acting === a._id + 'approve'}
                          onClick={() => respond(a._id, 'approve')}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: acting === a._id + 'approve' ? 0.6 : 1 }}>
                          <CheckCircle size={14} /> {acting === a._id + 'approve' ? 'Approving…' : 'Approve'}
                        </button>
                        <button
                          disabled={acting === a._id + 'reject'}
                          onClick={() => respond(a._id, 'reject')}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: acting === a._id + 'reject' ? 0.6 : 1 }}>
                          <XCircle size={14} /> {acting === a._id + 'reject' ? 'Rejecting…' : 'Reject'}
                        </button>
                      </div>
                    )}

                    {a.status !== 'pending' && a.respondedAt && (
                      <div style={{ fontSize: 12, color: 'var(--mi-muted)' }}>
                        Responded on {new Date(a.respondedAt).toLocaleDateString()}
                        {a.landlordNote && ` · "${a.landlordNote}"`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LandlordApplications;
