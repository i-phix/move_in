import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import Layout from '../component/layout';
import { getMoveInReservationsURL } from '../../../utils/urls';

const statusSeverity = {
    pending:   'warning',
    confirmed: 'success',
    expired:   'secondary',
    cancelled: 'danger',
};

const MoveInReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm]     = useState('');
    const [selected, setSelected]       = useState(null);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const res = await makeRequest2(getMoveInReservationsURL, 'GET');
            if (res.success) {
                setReservations(res.data?.reservations || res.data?.data || []);
            } else {
                toastify(res.error || 'Failed to load reservations.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReservations(); }, []);

    const filtered = reservations.filter(r => {
        const matchStatus = statusFilter === 'All' || r.status === statusFilter.toLowerCase();
        const matchSearch = !searchTerm ||
            (r.tenantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.unitName   || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    const statusBodyTemplate = (row) => {
        const sev = statusSeverity[row.status] || 'secondary';
        return <span className={`p-badge p-badge-${sev}`}>{row.status}</span>;
    };

    const dateBodyTemplate = (row) => {
        if (!row.desiredMoveInDate) return '—';
        return new Date(row.desiredMoveInDate).toLocaleDateString();
    };

    const expiresBodyTemplate = (row) => {
        if (!row.expiresAt) return '—';
        return new Date(row.expiresAt).toLocaleString();
    };

    const actionsBodyTemplate = (row) => (
        <button type="button" className="mi-icon-action" title="View" onClick={() => setSelected(row)}>
            <Eye size={14} /> <span>View</span>
        </button>
    );

    const skeletonRows = Array.from({ length: 6 }).map((_, i) => ({ id: i }));

    return (
        <Layout>
            <div className="container-fluid">
                <div className="row mb-3 align-items-center">
                    <div className="col">
                        <h4 className="mb-0">Move-In Reservations</h4>
                        <small className="text-muted">Monitor reservation requests sent directly to landlords</small>
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-sm btn-outline-secondary" onClick={fetchReservations}>
                            <i className="pi pi-refresh me-1" /> Refresh
                        </button>
                    </div>
                </div>

                <div className="row g-2 mb-3">
                    <div className="col-md-6 col-lg-4">
                        <input
                            className="form-control form-control-sm"
                            placeholder="Search tenant or unit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4 col-lg-3">
                        <select
                            className="form-select form-select-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {['All', 'Pending', 'Confirmed', 'Expired', 'Cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <DataTable value={skeletonRows} className="p-datatable-sm">
                        {['Tenant', 'Unit', 'Move-in Date', 'Expires', 'Status', 'Actions'].map(col => (
                            <Column key={col} header={col} body={<Skeleton />} />
                        ))}
                    </DataTable>
                ) : (
                    <DataTable
                        value={filtered}
                        paginator
                        rows={15}
                        className="p-datatable-sm"
                        emptyMessage="No reservations found."
                        sortMode="multiple"
                    >
                        <Column field="tenantName"        header="Tenant"       sortable />
                        <Column field="unitName"          header="Unit"         sortable />
                        <Column field="desiredMoveInDate" header="Move-in Date" body={dateBodyTemplate} sortable />
                        <Column field="expiresAt"         header="Expires"      body={expiresBodyTemplate} sortable />
                        <Column field="status"            header="Status"       body={statusBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ minWidth: 160 }} />
                    </DataTable>
                )}
            </div>

            {selected && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5 className="modal-title fw-semibold">Reservation Details</h5>
                                <button className="btn-close" onClick={() => setSelected(null)} />
                            </div>
                            <div className="modal-body">
                                <div className="small text-muted mb-2">Tenant</div>
                                <div className="fw-semibold mb-2">{selected.tenantName || '—'}</div>
                                <div className="small mb-1">{selected.tenantEmail || '—'}</div>
                                <div className="small mb-3">{selected.tenantPhone || '—'}</div>
                                <div className="small text-muted mb-2">Unit</div>
                                <div className="fw-semibold mb-3">{selected.unitName || '—'}</div>
                                <div className="small text-muted mb-2">Move-in Date</div>
                                <div className="small">{dateBodyTemplate(selected)}</div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MoveInReservations;
