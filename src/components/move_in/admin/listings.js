import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Edit2, Eye, EyeOff, X } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import Layout from '../component/layout';
import {
    getMoveInListingsURL,
    approveMoveInListingURL,
    rejectMoveInListingURL,
    toggleMoveInListingURL,
    overrideMoveInListingPriceURL,
} from '../../../utils/urls';

const MoveInListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [overrideModal, setOverrideModal] = useState({ show: false, unitId: null, currentPrice: '' });
    const [overridePrice, setOverridePrice] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await makeRequest2(getMoveInListingsURL, 'GET');
            if (res.success) {
                setListings(res.data?.data || []);
            } else {
                toastify(res.error || 'Failed to load listings.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (unitId) => {
        setActionLoading(unitId + '_approve');
        try {
            const res = await makeRequest2(`${approveMoveInListingURL}/${unitId}`, 'PUT');
            if (res.success) {
                toastify('Listing approved.', 'success');
                fetchListings();
            } else {
                toastify(res.error || 'Failed to approve listing.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (unitId) => {
        setActionLoading(unitId + '_reject');
        try {
            const res = await makeRequest2(`${rejectMoveInListingURL}/${unitId}`, 'PUT');
            if (res.success) {
                toastify('Listing rejected.', 'success');
                fetchListings();
            } else {
                toastify(res.error || 'Failed to reject listing.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggle = async (unitId, currentlyListed) => {
        setActionLoading(unitId + '_toggle');
        try {
            const res = await makeRequest2(`${toggleMoveInListingURL}/${unitId}`, 'PUT', {
                listedInMoveIn: !currentlyListed,
            });
            if (res.success) {
                toastify(`Listing ${!currentlyListed ? 'activated' : 'deactivated'}.`, 'success');
                fetchListings();
            } else {
                toastify(res.error || 'Failed to toggle listing.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleOverridePrice = async () => {
        if (!overridePrice || isNaN(Number(overridePrice))) {
            toastify('Enter a valid price.', 'warning');
            return;
        }
        setActionLoading('override');
        try {
            const res = await makeRequest2(`${overrideMoveInListingPriceURL}/${overrideModal.unitId}`, 'PUT', {
                moveInPrice: Number(overridePrice),
            });
            if (res.success) {
                toastify('Price overridden successfully.', 'success');
                setOverrideModal({ show: false, unitId: null, currentPrice: '' });
                setOverridePrice('');
                fetchListings();
            } else {
                toastify(res.error || 'Failed to override price.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => { fetchListings(); }, []);

    const filtered = listings.filter(l => {
        const matchSearch = !searchTerm ||
            (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.facilityId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.facilityId?.location || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'All' ||
            (statusFilter === 'Listed' && l.listedInMoveIn) ||
            (statusFilter === 'Pending' && l.moveInApproval === 'pending') ||
            (statusFilter === 'Unlisted' && !l.listedInMoveIn);
        return matchSearch && matchStatus;
    });

    const statusBadge = (rowData) => {
        if (rowData.moveInApproval === 'pending') {
            return <span className="badge bg-warning text-dark">Pending Approval</span>;
        }
        if (rowData.moveInApproval === 'rejected') {
            return <span className="badge bg-danger">Rejected</span>;
        }
        return rowData.listedInMoveIn
            ? <span className="badge bg-success">Active</span>
            : <span className="badge bg-secondary">Inactive</span>;
    };

    const priceBody = (rowData) => (
        <span>KES {(rowData.moveInPrice || 0).toLocaleString()}</span>
    );

    const actionsBody = (rowData) => (
        <div className="d-flex gap-1 flex-wrap">
            {rowData.moveInApproval === 'pending' && (
                <>
                    <button type="button" className="mi-icon-action primary" title="Approve" disabled={actionLoading === rowData._id + '_approve'} onClick={() => handleApprove(rowData._id)}>
                        <Check size={14} /> <span>Approve</span>
                    </button>
                    <button type="button" className="mi-icon-action danger" title="Reject" disabled={actionLoading === rowData._id + '_reject'} onClick={() => handleReject(rowData._id)}>
                        <X size={14} /> <span>Reject</span>
                    </button>
                </>
            )}
            <button type="button" className={rowData.listedInMoveIn ? 'mi-icon-action' : 'mi-icon-action primary'} title={rowData.listedInMoveIn ? 'Deactivate' : 'Activate'} disabled={actionLoading === rowData._id + '_toggle'} onClick={() => handleToggle(rowData._id, rowData.listedInMoveIn)}>
                {rowData.listedInMoveIn ? <EyeOff size={14} /> : <Eye size={14} />} <span>{rowData.listedInMoveIn ? 'Deactivate' : 'Activate'}</span>
            </button>
            <button type="button" className="mi-icon-action warning" title="Override Price" onClick={() => {
                    setOverrideModal({ show: true, unitId: rowData._id, currentPrice: rowData.moveInPrice || 0 });
                    setOverridePrice(String(rowData.moveInPrice || ''));
                }}>
                <Edit2 size={14} /> <span>Override Price</span>
            </button>
        </div>
    );

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
                                <li className="breadcrumb-item active text-dark">Listings</li>
                            </ul>
                            <div className="page-header-title">
                                <h2 className="mb-1 text-dark fw-semibold">
                                    <i className="ti ti-building-estate me-2 text-primary"></i>Move-In Listings
                                </h2>
                                <p className="mb-0 text-muted">Review, approve, and manage all rental listings.</p>
                            </div>
                        </div>
                        <div className="col-md-4 text-end">
                            <button className="btn btn-primary btn-sm" onClick={fetchListings} disabled={loading}>
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
                                    <div className="col-md-6">
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text"><i className="ti ti-search"></i></span>
                                            <input type="text" className="form-control" placeholder="Search by name, facility, location..."
                                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <select className="form-select form-select-sm" value={statusFilter}
                                            onChange={e => setStatusFilter(e.target.value)}>
                                            <option value="All">All Statuses</option>
                                            <option value="Listed">Active</option>
                                            <option value="Pending">Pending Approval</option>
                                            <option value="Unlisted">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3 text-end">
                                        <span className="text-muted small">{filtered.length} listing{filtered.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {loading ? (
                                    <div className="p-3">
                                        {[1, 2, 3, 4].map(n => (
                                            <Skeleton key={n} height="48px" className="mb-2" />
                                        ))}
                                    </div>
                                ) : (
                                    <DataTable value={filtered} paginator rows={15} stripedRows
                                        emptyMessage="No listings found."
                                        className="border-0">
                                        <Column field="name" header="Unit" sortable />
                                        <Column header="Facility" body={r => r.facilityId?.name || '—'} sortable />
                                        <Column header="Location" body={r => r.facilityId?.location || '—'} sortable />
                                        <Column header="Type" body={r => r.listingType || '—'} />
                                        <Column header="Bedrooms" body={r => r.moveInBedrooms ?? '—'} />
                                        <Column header="Price (KES)" body={priceBody} sortable sortField="moveInPrice" />
                                        <Column header="Status" body={statusBadge} />
                                        <Column header="Actions" body={actionsBody} style={{ minWidth: '280px' }} />
                                    </DataTable>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Override Price Modal */}
            {overrideModal.show && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5 className="modal-title fw-semibold">Override Listing Price</h5>
                                <button className="btn-close" onClick={() => setOverrideModal({ show: false, unitId: null, currentPrice: '' })} />
                            </div>
                            <div className="modal-body">
                                <p className="text-muted small mb-3">
                                    Current price: <strong>KES {Number(overrideModal.currentPrice).toLocaleString()}</strong>
                                </p>
                                <label className="form-label fw-semibold">New Price (KES)</label>
                                <input type="number" className="form-control" placeholder="Enter new price"
                                    value={overridePrice} onChange={e => setOverridePrice(e.target.value)} />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary btn-sm"
                                    onClick={() => setOverrideModal({ show: false, unitId: null, currentPrice: '' })}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary btn-sm" disabled={actionLoading === 'override'} onClick={handleOverridePrice}>
                                    {actionLoading === 'override' ? 'Saving...' : 'Save Override'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MoveInListings;
