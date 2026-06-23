import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, Check, Edit2, KeyRound } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import Layout from '../component/layout';
import {
    activateMoveInCustomerURL,
    getMoveInCustomersURL,
    resetMoveInCustomerPasswordURL,
    suspendMoveInCustomerURL,
    updateMoveInCustomerURL,
} from '../../../utils/urls';

const MoveInCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [actionLoading, setActionLoading] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '' });
    const [tempPassword, setTempPassword] = useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await makeRequest2(getMoveInCustomersURL, 'GET');
            if (res.success) {
                setCustomers(res.data?.data || []);
            } else {
                toastify(res.error || 'Failed to load customers.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (customerId) => {
        setActionLoading(customerId + '_suspend');
        try {
            const res = await makeRequest2(`${suspendMoveInCustomerURL}/${customerId}`, 'PUT');
            if (res.success) {
                toastify('Customer suspended.', 'success');
                fetchCustomers();
            } else {
                toastify(res.error || 'Failed to suspend customer.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleActivate = async (customerId) => {
        setActionLoading(customerId + '_activate');
        try {
            const res = await makeRequest2(`${activateMoveInCustomerURL}/${customerId}`, 'PUT');
            if (res.success) {
                toastify('Customer activated.', 'success');
                fetchCustomers();
            } else {
                toastify(res.error || 'Failed to activate customer.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const openEdit = (customer) => {
        setEditUser(customer);
        setForm({
            fullName: customer.fullName || customer.name || '',
            email: customer.email || '',
            phoneNumber: customer.phoneNumber || customer.phone || '',
        });
        setTempPassword('');
    };

    const handleSave = async () => {
        const res = await makeRequest2(`${updateMoveInCustomerURL}/${editUser._id}`, 'PUT', form);
        if (res.success) {
            toastify('Customer updated.', 'success');
            setEditUser(null);
            fetchCustomers();
        } else {
            toastify(res.error || 'Failed to update customer.', 'error');
        }
    };

    const handleResetPassword = async (customerId) => {
        setActionLoading(customerId + '_reset');
        const res = await makeRequest2(`${resetMoveInCustomerPasswordURL}/${customerId}`, 'PUT');
        setActionLoading(null);
        if (res.success) {
            setTempPassword(res.data?.data?.tempPassword || res.data?.tempPassword || '');
            toastify('Password reset.', 'success');
        } else {
            toastify(res.error || 'Failed to reset password.', 'error');
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    const filtered = customers.filter(c => {
        const matchSearch = !searchTerm ||
            (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone || '').includes(searchTerm);
        const matchStatus = statusFilter === 'All' || (c.status || '').toLowerCase() === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
    });

    const statusBody = (rowData) => {
        const s = (rowData.status || 'active').toLowerCase();
        const map = { active: 'success', suspended: 'danger', inactive: 'secondary', pending: 'warning' };
        return <span className={`badge bg-${map[s] || 'secondary'} text-capitalize`}>{s}</span>;
    };

    const joinedBody = (rowData) => rowData.createdAt
        ? new Date(rowData.createdAt).toLocaleDateString()
        : '—';

    const actionsBody = (rowData) => {
        const s = (rowData.status || 'active').toLowerCase();
        return (
            <div className="d-flex gap-1">
                <button type="button" className="mi-icon-action" title="Edit" onClick={() => openEdit(rowData)}>
                    <Edit2 size={14} /> <span>Edit</span>
                </button>
                <button type="button" className="mi-icon-action warning" title="Reset Password" onClick={() => { openEdit(rowData); handleResetPassword(rowData._id); }} disabled={actionLoading === rowData._id + '_reset'}>
                    <KeyRound size={14} /> <span>Reset Password</span>
                </button>
                {s !== 'suspended' ? (
                    <button type="button" className="mi-icon-action danger" title="Suspend" onClick={() => handleSuspend(rowData._id)} disabled={actionLoading === rowData._id + '_suspend'}>
                        <Ban size={14} /> <span>Suspend</span>
                    </button>
                ) : (
                    <button type="button" className="mi-icon-action primary" title="Activate" onClick={() => handleActivate(rowData._id)} disabled={actionLoading === rowData._id + '_activate'}>
                        <Check size={14} /> <span>Activate</span>
                    </button>
                )}
            </div>
        );
    };

    return (
        <Layout>
            <div className="page-header bg-light border-bottom">
                <div className="page-block">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <ul className="breadcrumb mb-2">
                                <li className="breadcrumb-item">
                                    <Link to="/move-in/admin/dashboard" className="text-muted">
                                        <i className="ti ti-home me-1"></i>Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link to="/move-in/admin/dashboard" className="text-muted">Move-In</Link>
                                </li>
                                <li className="breadcrumb-item active text-dark">Customers</li>
                            </ul>
                            <div className="page-header-title">
                                <h2 className="mb-1 text-dark fw-semibold">
                                    <i className="ti ti-users me-2 text-primary"></i>Move-In Customers
                                </h2>
                                <p className="mb-0 text-muted">Manage registered Move-In tenants and their account status.</p>
                            </div>
                        </div>
                        <div className="col-md-4 text-end">
                            <button className="btn btn-primary btn-sm" onClick={fetchCustomers} disabled={loading}>
                                <i className="ti ti-refresh me-1"></i>Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-wrapper">
                <div className="page-body">
                    <div className="container-fluid">
                        <div className="card border-0 shadow-sm mt-3">
                            <div className="card-header bg-white border-bottom">
                                <div className="row g-2 align-items-center">
                                    <div className="col-md-5">
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text"><i className="ti ti-search"></i></span>
                                            <input type="text" className="form-control" placeholder="Search by name, email, phone..."
                                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <select className="form-select form-select-sm" value={statusFilter}
                                            onChange={e => setStatusFilter(e.target.value)}>
                                            <option value="All">All Statuses</option>
                                            <option value="active">Active</option>
                                            <option value="pending">Pending</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4 text-end">
                                        <span className="text-muted small">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {loading ? (
                                    <div className="p-3">
                                        {[1, 2, 3, 4].map(n => <Skeleton key={n} height="48px" className="mb-2" />)}
                                    </div>
                                ) : (
                                    <DataTable value={filtered} paginator rows={15} stripedRows
                                        emptyMessage="No customers found." className="border-0">
                                        <Column field="name" header="Name" sortable body={r => r.name || '—'} />
                                        <Column field="email" header="Email" sortable body={r => r.email || '—'} />
                                        <Column header="Phone" body={r => r.phone || '—'} />
                                        <Column header="Applications" body={r => r.applicationCount ?? '—'} />
                                        <Column header="Joined" body={joinedBody} sortable sortField="createdAt" />
                                        <Column header="Status" body={statusBody} />
                                        <Column header="Actions" body={actionsBody} style={{ minWidth: '180px' }} />
                                    </DataTable>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {editUser && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5 className="modal-title fw-semibold">Edit Customer</h5>
                                <button className="btn-close" onClick={() => { setEditUser(null); setTempPassword(''); }} />
                            </div>
                            <div className="modal-body">
                                <label className="form-label small fw-semibold">Full Name</label>
                                <input className="form-control form-control-sm mb-3" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                                <label className="form-label small fw-semibold">Email</label>
                                <input className="form-control form-control-sm mb-3" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                <label className="form-label small fw-semibold">Phone</label>
                                <input className="form-control form-control-sm mb-3" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
                                {tempPassword && (
                                    <div className="alert alert-warning py-2 mb-0">
                                        Temporary password: <strong>{tempPassword}</strong>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary btn-sm" onClick={() => { setEditUser(null); setTempPassword(''); }}>Close</button>
                                <button className="btn btn-primary btn-sm" onClick={handleSave}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MoveInCustomers;
