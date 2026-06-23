import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import Layout from '../component/layout';
import { getMoveInViewingsURL } from '../../../utils/urls';

const statusSeverity = {
    pending:   'warning',
    confirmed: 'success',
    cancelled: 'danger',
    completed: 'info',
};

const MoveInViewings = () => {
    const [viewings, setViewings]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm]     = useState('');

    const fetchViewings = async () => {
        setLoading(true);
        try {
            const res = await makeRequest2(getMoveInViewingsURL, 'GET');
            if (res.success) {
                setViewings(res.data?.viewings || res.data?.data || []);
            } else {
                toastify(res.error || 'Failed to load viewings.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchViewings(); }, []);

    const filtered = viewings.filter(v => {
        const matchStatus = statusFilter === 'All' || v.status === statusFilter.toLowerCase();
        const matchSearch = !searchTerm ||
            (v.tenantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.unitName   || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.landlordName || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    const statusBodyTemplate = (row) => {
        const sev = statusSeverity[row.status] || 'secondary';
        return <span className={`p-badge p-badge-${sev}`}>{row.status}</span>;
    };

    const dateBodyTemplate = (row) => {
        if (!row.scheduledDate) return '—';
        return new Date(row.scheduledDate).toLocaleDateString();
    };

    const skeletonRows = Array.from({ length: 6 }).map((_, i) => ({ id: i }));

    return (
        <Layout>
            <div className="container-fluid">
                <div className="row mb-3 align-items-center">
                    <div className="col">
                        <h4 className="mb-0">Move-In Viewings</h4>
                        <small className="text-muted">All scheduled property viewings</small>
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-sm btn-outline-secondary" onClick={fetchViewings}>
                            <i className="pi pi-refresh me-1" /> Refresh
                        </button>
                    </div>
                </div>

                <div className="row g-2 mb-3">
                    <div className="col-md-6 col-lg-4">
                        <input
                            className="form-control form-control-sm"
                            placeholder="Search tenant, unit, landlord..."
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
                            {['All', 'Pending', 'Confirmed', 'Cancelled', 'Completed'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <DataTable value={skeletonRows} className="p-datatable-sm">
                        {['Tenant', 'Unit', 'Landlord', 'Date', 'Time', 'Status'].map(col => (
                            <Column key={col} header={col} body={<Skeleton />} />
                        ))}
                    </DataTable>
                ) : (
                    <DataTable
                        value={filtered}
                        paginator
                        rows={15}
                        className="p-datatable-sm"
                        emptyMessage="No viewings found."
                        sortMode="multiple"
                    >
                        <Column field="tenantName"   header="Tenant"   sortable />
                        <Column field="unitName"     header="Unit"     sortable />
                        <Column field="landlordName" header="Landlord" sortable />
                        <Column field="scheduledDate" header="Date"    body={dateBodyTemplate} sortable />
                        <Column field="scheduledTime" header="Time"    sortable />
                        <Column field="status"       header="Status"   body={statusBodyTemplate} sortable />
                    </DataTable>
                )}
            </div>
        </Layout>
    );
};

export default MoveInViewings;
