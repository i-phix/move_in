import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from 'primereact/skeleton';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import Layout from '../component/layout';
import { getMoveInPreferencesURL } from '../../../utils/urls';

const MoveInPreferences = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPreferences = async () => {
        setLoading(true);
        try {
            const res = await makeRequest2(getMoveInPreferencesURL, 'GET');
            if (res.success) {
                setData(res.data?.data || null);
            } else {
                toastify(res.error || 'Failed to load preferences data.', 'error');
            }
        } catch (err) {
            toastify('Error: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPreferences(); }, []);

    const bedroomLabel = (value) => {
        const text = String(value || '').replace(/_/g, ' ');
        const match = text.match(/^(\d+)/);
        if (text.includes('studio')) return 'Studio';
        if (text.includes('bedsitter')) return 'Bedsitter';
        if (match) return `${match[1]} bedroom${match[1] === '1' ? '' : 's'}`;
        return value || 'Any';
    };

    // Render a ranked list with a percentage bar
    const RankedList = ({ title, icon, items = [], valueLabel = 'searches', color = 'primary' }) => {
        const max = items[0]?.count || 1;
        return (
            <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-bottom d-flex align-items-center gap-2">
                    <i className={`${icon} text-${color}`}></i>
                    <h6 className="mb-0 fw-semibold">{title}</h6>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-3">
                            {[1, 2, 3, 4, 5].map(n => <Skeleton key={n} height="36px" className="mb-2" />)}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-4 text-muted small">No data yet.</div>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {items.map((item, idx) => (
                                <li key={idx} className="list-group-item px-3 py-2">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small fw-semibold">{item.label || item._id || '—'}</span>
                                        <span className="small text-muted">{item.count} {valueLabel}</span>
                                    </div>
                                    <div className="progress" style={{ height: 6 }}>
                                        <div
                                            className={`progress-bar bg-${color}`}
                                            role="progressbar"
                                            style={{ width: `${Math.round((item.count / max) * 100)}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    };

    // Summary stat cards
    const SummaryCard = ({ title, value, icon, color }) => (
        <div className="col-xl-3 col-md-6 mb-3">
            <div className={`card bg-${color} text-white border-0 shadow-sm`}>
                <div className="card-body">
                    <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                            <h6 className="text-white-50 mb-2">{title}</h6>
                            <h3 className="mb-0 text-white">
                                {loading ? <Skeleton width="60px" height="32px" /> : value}
                            </h3>
                        </div>
                        <i className={`${icon} fs-2 text-white-50`}></i>
                    </div>
                </div>
            </div>
        </div>
    );

    // Price range distribution
    const PriceRanges = ({ ranges = [] }) => {
        const max = ranges[0]?.count || 1;
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom d-flex align-items-center gap-2">
                    <i className="ti ti-coin text-success"></i>
                    <h6 className="mb-0 fw-semibold">Price Range Preferences (KES/month)</h6>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-3">
                            {[1, 2, 3, 4].map(n => <Skeleton key={n} height="36px" className="mb-2" />)}
                        </div>
                    ) : ranges.length === 0 ? (
                        <div className="text-center py-4 text-muted small">No data yet.</div>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {ranges.map((r, idx) => (
                                <li key={idx} className="list-group-item px-3 py-2">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small fw-semibold">{r.label}</span>
                                        <span className="small text-muted">{r.count} searches</span>
                                    </div>
                                    <div className="progress" style={{ height: 6 }}>
                                        <div
                                            className="progress-bar bg-success"
                                            role="progressbar"
                                            style={{ width: `${Math.round((r.count / max) * 100)}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
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
                                <li className="breadcrumb-item active text-dark">Preferences Analytics</li>
                            </ul>
                            <div className="page-header-title">
                                <h2 className="mb-1 text-dark fw-semibold">
                                    <i className="ti ti-chart-dots me-2 text-primary"></i>Tenant Preferences Analytics
                                </h2>
                                <p className="mb-0 text-muted">
                                    Aggregated insights on what tenants are searching for on the Move-In platform.
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4 text-end">
                            <button className="btn btn-primary btn-sm" onClick={fetchPreferences} disabled={loading}>
                                <i className="ti ti-refresh me-1"></i>Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-wrapper">
                <div className="page-body">
                    <div className="container-fluid">

                        {/* Summary row */}
                        <div className="row mt-3">
                            <SummaryCard
                                title="Total Preference Submissions"
                                value={(data?.totalSubmissions || 0).toLocaleString()}
                                icon="ti ti-users"
                                color="primary"
                            />
                            <SummaryCard
                                title="Most Searched Location"
                                value={data?.topLocation || '—'}
                                icon="ti ti-map-pin"
                                color="info"
                            />
                            <SummaryCard
                                title="Most Searched Bedrooms"
                                value={data?.topBedrooms != null ? `${data.topBedrooms} bed` : '—'}
                                icon="ti ti-bed"
                                color="warning"
                            />
                            <SummaryCard
                                title="Median Price Range"
                                value={data?.medianPriceRange || '—'}
                                icon="ti ti-coin"
                                color="success"
                            />
                        </div>

                        {/* Ranked lists */}
                        <div className="row mt-2 g-3">
                            <div className="col-md-6">
                                <RankedList
                                    title="Top Searched Locations"
                                    icon="ti ti-map-pin"
                                    items={data?.locations || []}
                                    color="primary"
                                />
                            </div>
                            <div className="col-md-6">
                                <RankedList
                                    title="Bedroom Preferences"
                                    icon="ti ti-bed"
                                    items={(data?.bedrooms || []).map(b => ({
                                        ...b,
                                        label: bedroomLabel(b.label || b._id),
                                    }))}
                                    color="warning"
                                />
                            </div>
                            <div className="col-md-6">
                                <RankedList
                                    title="Listing Type Preferences"
                                    icon="ti ti-building-estate"
                                    items={data?.listingTypes || []}
                                    color="info"
                                />
                            </div>
                            <div className="col-md-6">
                                <RankedList
                                    title="Most Wanted Amenities"
                                    icon="ti ti-star"
                                    items={data?.amenities || []}
                                    color="success"
                                />
                            </div>
                        </div>

                        {/* Price ranges */}
                        <div className="row mt-3 mb-4">
                            <div className="col-12">
                                <PriceRanges ranges={data?.priceRanges || []} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MoveInPreferences;
