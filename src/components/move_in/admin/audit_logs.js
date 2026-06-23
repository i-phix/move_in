import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import Layout from '../component/layout';
import { getMoveInAuditLogsURL } from '../../../utils/urls';

const MoveInAuditLogs = () => {
    const [logs, setLogs]             = useState([]);
    const [loading, setLoading]       = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('All');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await makeRequest2(getMoveInAuditLogsURL, 'GET');
            if (res.success) {
                setLogs(res.data?.logs || res.data?.data || []);
            } else {
                toastify(res.error || 'Failed to load audit logs.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const uniqueActions = ['All', ...new Set(logs.map(l => l.action).filter(Boolean))];

    const filtered = logs.filter(l => {
        const matchAction = actionFilter === 'All' || l.action === actionFilter;
        const matchSearch = !searchTerm ||
            (l.action       || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.resourceType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.adminId      || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchAction && matchSearch;
    });

    const dateBodyTemplate = (row) => {
        if (!row.createdAt) return '—';
        return new Date(row.createdAt).toLocaleString();
    };

    const detailsBodyTemplate = (row) => {
        if (!row.details) return '—';
        return <span title={row.details} style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.details}</span>;
    };

    const skeletonRows = Array.from({ length: 8 }).map((_, i) => ({ id: i }));

    return (
        <Layout>
            <div className="container-fluid">
                <div className="row mb-3 align-items-center">
                    <div className="col">
                        <h4 className="mb-0">Move-In Audit Logs</h4>
                        <small className="text-muted">Admin action history for Move-In module</small>
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-sm btn-outline-secondary" onClick={fetchLogs}>
                            <i className="pi pi-refresh me-1" /> Refresh
                        </button>
                    </div>
                </div>

                <div className="row g-2 mb-3">
                    <div className="col-md-6 col-lg-4">
                        <input
                            className="form-control form-control-sm"
                            placeholder="Search action, resource, admin..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4 col-lg-3">
                        <select
                            className="form-select form-select-sm"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            {uniqueActions.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <DataTable value={skeletonRows} className="p-datatable-sm">
                        {['Admin', 'Action', 'Resource Type', 'Resource ID', 'Details', 'IP', 'Date'].map(col => (
                            <Column key={col} header={col} body={<Skeleton />} />
                        ))}
                    </DataTable>
                ) : (
                    <DataTable
                        value={filtered}
                        paginator
                        rows={20}
                        className="p-datatable-sm"
                        emptyMessage="No audit logs found."
                        sortMode="multiple"
                    >
                        <Column field="adminId"      header="Admin"         sortable />
                        <Column field="action"       header="Action"        sortable />
                        <Column field="resourceType" header="Resource Type" sortable />
                        <Column field="resourceId"   header="Resource ID"   sortable />
                        <Column field="details"      header="Details"       body={detailsBodyTemplate} />
                        <Column field="ipAddress"    header="IP Address"    sortable />
                        <Column field="createdAt"    header="Date"          body={dateBodyTemplate} sortable />
                    </DataTable>
                )}
            </div>
        </Layout>
    );
};

export default MoveInAuditLogs;
