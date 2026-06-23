import React, { useEffect, useState } from 'react';
import { Ban, Edit2, KeyRound, Plus } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { Dialog } from 'primereact/dialog';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import Layout from '../component/layout';
import {
    assignMoveInModuleURL,
    getMoveInLandlordsURL,
    resetMoveInLandlordPasswordURL,
    revokeMoveInModuleURL,
    updateMoveInLandlordURL,
} from '../../../utils/urls';

const MoveInLandlords = () => {
    const [landlords, setLandlords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState('');

    // Assign dialog
    const [assignDialog, setAssignDialog] = useState(false);
    const [landlordId, setLandlordId] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '' });
    const [tempPassword, setTempPassword] = useState('');

    const fetchLandlords = async () => {
        setLoading(true);
        const res = await makeRequest2(getMoveInLandlordsURL, 'GET');
        setLoading(false);
        if (res.success) {
            setLandlords(Array.isArray(res.data?.data) ? res.data.data : []);
        } else {
            toastify(res.error || 'Failed to load landlords', 'error');
        }
    };

    useEffect(() => { fetchLandlords(); }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!landlordId.trim()) { toastify('Enter a Landlord ID', 'error'); return; }
        setAssigning(true);
        const res = await makeRequest2(assignMoveInModuleURL, 'POST', { landlordId: landlordId.trim() });
        setAssigning(false);
        if (res.success) {
            toastify(res.data?.message || 'Module assigned', 'success');
            setAssignDialog(false);
            setLandlordId('');
            fetchLandlords();
        } else {
            toastify(res.error || 'Failed to assign module', 'error');
        }
    };

    const handleRevoke = async (id) => {
        setActionLoading(id);
        const res = await makeRequest2(`${revokeMoveInModuleURL}/${id}`, 'PUT');
        setActionLoading('');
        if (res.success) {
            toastify('Move-In access revoked', 'success');
            fetchLandlords();
        } else {
            toastify(res.error || 'Failed to revoke access', 'error');
        }
    };

    const openEdit = (landlord) => {
        setEditUser(landlord);
        setForm({
            fullName: landlord.fullName || '',
            email: landlord.email || '',
            phoneNumber: landlord.phoneNumber || '',
        });
        setTempPassword('');
    };

    const handleSave = async () => {
        const id = editUser.landlordId || editUser._id;
        const res = await makeRequest2(`${updateMoveInLandlordURL}/${id}`, 'PUT', form);
        if (res.success) {
            toastify('Landlord updated.', 'success');
            setEditUser(null);
            fetchLandlords();
        } else {
            toastify(res.error || 'Failed to update landlord.', 'error');
        }
    };

    const handleResetPassword = async (landlord) => {
        const id = landlord.landlordId || landlord._id;
        setActionLoading(id + '_reset');
        const res = await makeRequest2(`${resetMoveInLandlordPasswordURL}/${id}`, 'PUT');
        setActionLoading('');
        if (res.success) {
            setTempPassword(res.data?.data?.tempPassword || res.data?.tempPassword || '');
            toastify('Password reset.', 'success');
        } else {
            toastify(res.error || 'Failed to reset password.', 'error');
        }
    };

    const filtered = landlords.filter((l) => {
        const q = searchTerm.toLowerCase();
        return (
            (l.fullName || '').toLowerCase().includes(q) ||
            (l.email || '').toLowerCase().includes(q)
        );
    });

    const statusBody = (row) => (
        <span className={`badge bg-${row.isEnabled ? 'success' : 'danger'}-light text-${row.isEnabled ? 'success' : 'danger'}`}>
            {row.isEnabled ? 'Active' : 'Revoked'}
        </span>
    );

    const actionBody = (row) => (
        <div className="d-flex gap-1">
            <button type="button" className="mi-icon-action" title="Edit" onClick={() => openEdit(row)}>
                <Edit2 size={14} /> <span>Edit</span>
            </button>
            <button type="button" className="mi-icon-action warning" title="Reset Password" onClick={() => { openEdit(row); handleResetPassword(row); }}>
                <KeyRound size={14} /> <span>Reset Password</span>
            </button>
            {row.isEnabled && (
                <button type="button" className="mi-icon-action danger" title="Revoke" onClick={() => handleRevoke(row.landlordId || row._id)} disabled={actionLoading === (row.landlordId || row._id)}>
                    <Ban size={14} /> <span>Revoke</span>
                </button>
            )}
        </div>
    );

    const dateBody = (row) => row.assignedAt
        ? new Date(row.assignedAt).toLocaleDateString()
        : '—';

    return (
        <Layout>
            <div className="pc-content">
                <div className="page-header">
                    <div className="page-block">
                        <div className="row align-items-center">
                            <div className="col-md-12">
                                <div className="page-header-title">
                                    <h5 className="m-b-10">Move-In Landlords</h5>
                                </div>
                                <p className="text-muted">Manage landlords with access to the Move-In module.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        style={{ width: 240 }}
                                        placeholder="Search by name or email…"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <span className="text-muted small">{filtered.length} landlord{filtered.length !== 1 ? 's' : ''}</span>
                                </div>
                                <button type="button" className="btn btn-primary btn-sm" onClick={() => setAssignDialog(true)}>
                                    <Plus size={14} /> Assign Module
                                </button>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div>
                                        {[1,2,3,4,5].map(i => <Skeleton key={i} height="2.5rem" className="mb-2" />)}
                                    </div>
                                ) : (
                                    <DataTable
                                        value={filtered}
                                        paginator
                                        rows={15}
                                        emptyMessage="No landlords with Move-In access yet."
                                        className="p-datatable-sm"
                                    >
                                        <Column field="fullName" header="Landlord Name" sortable />
                                        <Column field="email" header="Email" sortable />
                                        <Column header="Status" body={statusBody} />
                                        <Column header="Assigned Date" body={dateBody} sortable sortField="assignedAt" />
                                        <Column header="Actions" body={actionBody} style={{ minWidth: 190 }} />
                                    </DataTable>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign dialog */}
            <Dialog
                header="Assign Move-In Module"
                visible={assignDialog}
                style={{ width: 420 }}
                onHide={() => { setAssignDialog(false); setLandlordId(''); }}
                modal
            >
                <form onSubmit={handleAssign}>
                    <div className="mb-3">
                        <label className="form-label">Landlord ID</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Paste the MongoDB _id of the landlord"
                            value={landlordId}
                            onChange={(e) => setLandlordId(e.target.value)}
                            required
                        />
                        <div className="form-text">
                            Find the landlord's ID from the Users section and paste it here.
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setAssignDialog(false); setLandlordId(''); }}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={assigning}>{assigning ? 'Assigning...' : 'Assign'}</button>
                    </div>
                </form>
            </Dialog>

            {editUser && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5 className="modal-title fw-semibold">Edit Landlord</h5>
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

export default MoveInLandlords;
