import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from 'primereact/skeleton';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import Layout from '../component/layout';
import { getAdminMoveInDashboardURL } from '../../../utils/urls';

const MoveInDashboard = () => {
    const [stats, setStats] = useState({
        totalListings: 0,
        pendingApprovals: 0,
        activeCustomers: 0,
        openApplications: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await makeRequest2(getAdminMoveInDashboardURL, 'GET');
            if (res.success) {
                setStats(res.data?.stats || stats);
                setRecentActivity(res.data?.recentActivity || []);
            } else {
                toastify(res.error || 'Failed to load Move-In dashboard.', 'error');
            }
        } catch (err) {
            toastify('Error loading dashboard: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const StatCard = ({ title, value, icon, color, link }) => (
        <div className="col-xl-3 col-md-6 mb-3">
            <div className={`card bg-${color} text-white border-0 shadow-sm h-100`}>
                <div className="card-body">
                    <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                            <h6 className="text-white-50 mb-2">{title}</h6>
                            <h3 className="mb-0 text-white">
                                {loading ? <Skeleton width="60px" height="32px" /> : value.toLocaleString()}
                            </h3>
                        </div>
                        <div className="flex-shrink-0">
                            <i className={`${icon} fs-2 text-white-50`}></i>
                        </div>
                    </div>
                    {link && (
                        <div className="mt-3">
                            <Link to={link} className="text-white-50 small text-decoration-none">
                                View details <i className="ti ti-arrow-right ms-1"></i>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
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
                                <li className="breadcrumb-item active text-dark">Move-In</li>
                            </ul>
                            <div className="page-header-title">
                                <h2 className="mb-1 text-dark fw-semibold">
                                    <i className="ti ti-building me-2 text-primary"></i>Move-In Overview
                                </h2>
                                <p className="mb-0 text-muted">
                                    Monitor rental listings, applications, and tenant activity.
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4 text-end">
                            <button className="btn btn-primary btn-sm" onClick={fetchDashboard} disabled={loading}>
                                <i className="ti ti-refresh me-1"></i>Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-wrapper">
                <div className="page-body">
                    <div className="container-fluid">
                        <div className="row mt-3">
                            <StatCard title="Total Listings" value={stats.totalListings} icon="ti ti-building-estate" color="primary" link="/move-in/admin/listings" />
                            <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon="ti ti-clock-hour-4" color="warning" link="/move-in/admin/listings" />
                            <StatCard title="Active Customers" value={stats.activeCustomers} icon="ti ti-users" color="success" link="/move-in/admin/customers" />
                            <StatCard title="Open Applications" value={stats.openApplications} icon="ti ti-file-text" color="info" link="/move-in/admin/applications" />
                        </div>

                        <div className="row mt-2">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0 fw-semibold">
                                            <i className="ti ti-activity me-2 text-primary"></i>Recent Activity
                                        </h5>
                                    </div>
                                    <div className="card-body p-0">
                                        {loading ? (
                                            <div className="p-3">
                                                {[1, 2, 3].map(n => (
                                                    <div key={n} className="d-flex align-items-center gap-3 mb-3">
                                                        <Skeleton shape="circle" size="36px" />
                                                        <div className="flex-grow-1">
                                                            <Skeleton width="60%" height="14px" className="mb-1" />
                                                            <Skeleton width="40%" height="12px" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : recentActivity.length === 0 ? (
                                            <div className="text-center py-5 text-muted">
                                                <i className="ti ti-inbox fs-1 d-block mb-2"></i>
                                                <p className="mb-0">No recent activity to display.</p>
                                            </div>
                                        ) : (
                                            <ul className="list-group list-group-flush">
                                                {recentActivity.map((item, idx) => (
                                                    <li key={idx} className="list-group-item d-flex align-items-center gap-3 py-3">
                                                        <div className="flex-shrink-0 rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                                            <i className="ti ti-clock text-primary small"></i>
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <div className="fw-semibold small">{item.title || item.description || 'Activity'}</div>
                                                            {item.time && <div className="text-muted" style={{ fontSize: '0.78rem' }}>{item.time}</div>}
                                                        </div>
                                                        {item.status && <span className="badge bg-light text-dark">{item.status}</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row mt-3 mb-4">
                            <div className="col-md-3 mb-3">
                                <Link to="/move-in/admin/listings" className="card border-0 shadow-sm h-100 text-decoration-none">
                                    <div className="card-body d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                            <i className="ti ti-building-estate text-primary fs-5"></i>
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark">Listings</div>
                                            <div className="text-muted small">Approve, reject & manage units</div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-md-3 mb-3">
                                <Link to="/move-in/admin/applications" className="card border-0 shadow-sm h-100 text-decoration-none">
                                    <div className="card-body d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                            <i className="ti ti-file-text text-success fs-5"></i>
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark">Applications</div>
                                            <div className="text-muted small">Review tenant enquiries</div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-md-3 mb-3">
                                <Link to="/move-in/admin/customers" className="card border-0 shadow-sm h-100 text-decoration-none">
                                    <div className="card-body d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                            <i className="ti ti-users text-warning fs-5"></i>
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark">Customers</div>
                                            <div className="text-muted small">Manage Move-In tenants</div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-md-3 mb-3">
                                <Link to="/move-in/admin/deals" className="card border-0 shadow-sm h-100 text-decoration-none">
                                    <div className="card-body d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                            <i className="ti ti-cash-banknote text-info fs-5"></i>
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark">Deals</div>
                                            <div className="text-muted small">Track rentals & commissions</div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MoveInDashboard;
