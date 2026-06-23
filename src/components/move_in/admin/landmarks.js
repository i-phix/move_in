import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, MapPin, Plus, Save, Trash2, X } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import Layout from '../component/layout';
import {
    getMoveInLandmarksURL,
    createMoveInLandmarkURL,
    updateMoveInLandmarkURL,
    deleteMoveInLandmarkURL,
} from '../../../utils/urls';

const CATEGORIES = [
    'school',
    'hospital',
    'mall',
    'restaurant',
    'transport',
    'office',
    'market',
    'park',
    'road',
    'other',
];

const blankForm = {
    name: '',
    category: 'other',
    area: '',
    city: '',
    county: '',
    address: '',
    details: '',
    lat: '',
    lng: '',
};

const inputClass = 'form-control form-control-sm';

const AdminLandmarks = () => {
    const [landmarks, setLandmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(blankForm);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('active');

    const fetchLandmarks = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (status) params.set('status', status);
        const res = await makeRequest2(`${getMoveInLandmarksURL}?${params.toString()}`, 'GET');
        if (res.success) {
            setLandmarks(res.data?.data || []);
        } else {
            toastify(res.error || 'Failed to load landmarks.', 'error');
        }
        setLoading(false);
    };

    useEffect(() => { fetchLandmarks(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const activeCount = useMemo(() => landmarks.filter(item => item.isActive !== false).length, [landmarks]);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const resetForm = () => {
        setForm(blankForm);
        setEditingId(null);
        setShowForm(false);
    };

    const startEdit = (item) => {
        setEditingId(item._id);
        setShowForm(true);
        setForm({
            name: item.name || '',
            category: item.category || 'other',
            area: item.area || '',
            city: item.city || '',
            county: item.county || '',
            address: item.address || '',
            details: item.details || '',
            lat: item.coordinates?.lat ?? '',
            lng: item.coordinates?.lng ?? '',
        });
    };

    const saveLandmark = async () => {
        if (!form.name.trim()) return toastify('Landmark name is required.', 'warning');
        if (form.lat === '' || form.lng === '') return toastify('Latitude and longitude are required.', 'warning');

        setSaving(true);
        const payload = {
            name: form.name.trim(),
            category: form.category,
            area: form.area || null,
            city: form.city || null,
            county: form.county || null,
            address: form.address || null,
            details: form.details || null,
            coordinates: { lat: Number(form.lat), lng: Number(form.lng) },
            isActive: true,
        };
        const url = editingId ? `${updateMoveInLandmarkURL}/${editingId}` : createMoveInLandmarkURL;
        const method = editingId ? 'PUT' : 'POST';
        const res = await makeRequest2(url, method, payload);
        setSaving(false);

        if (res.success) {
            toastify(editingId ? 'Landmark updated.' : 'Landmark created.', 'success');
            resetForm();
            fetchLandmarks();
        } else {
            toastify(res.error || 'Failed to save landmark.', 'error');
        }
    };

    const deactivateLandmark = async (item) => {
        const res = await makeRequest2(`${deleteMoveInLandmarkURL}/${item._id}`, 'DELETE');
        if (res.success) {
            toastify('Landmark deactivated.', 'success');
            fetchLandmarks();
        } else {
            toastify(res.error || 'Failed to deactivate landmark.', 'error');
        }
    };

    const locationBody = (row) => [row.area, row.city, row.county, row.address].filter(Boolean).join(', ') || '—';
    const coordinatesBody = (row) => row.coordinates
        ? `${Number(row.coordinates.lat).toFixed(6)}, ${Number(row.coordinates.lng).toFixed(6)}`
        : '—';
    const statusBody = (row) => row.isActive === false
        ? <span className="badge bg-secondary">Inactive</span>
        : <span className="badge bg-success">Active</span>;
    const actionsBody = (row) => (
        <div className="d-flex gap-1">
            <button type="button" className="mi-icon-action" title="Edit" onClick={() => startEdit(row)}>
                <Edit2 size={14} /><span>Edit</span>
            </button>
            {row.isActive !== false && (
                <button type="button" className="mi-icon-action danger" title="Deactivate" onClick={() => deactivateLandmark(row)}>
                    <Trash2 size={14} /><span>Deactivate</span>
                </button>
            )}
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
                                <li className="breadcrumb-item active text-dark">Landmarks</li>
                            </ul>
                            <div className="page-header-title">
                                <h2 className="mb-1 text-dark fw-semibold">
                                    <i className="ti ti-map-pin me-2 text-primary"></i>Move-In Landmarks
                                </h2>
                                <p className="mb-0 text-muted">Maintain landmark coordinates used to calculate nearby places for listings.</p>
                            </div>
                        </div>
                        <div className="col-md-4 text-end">
                            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                                <Plus size={14} className="me-1" />Add Landmark
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-wrapper">
                <div className="page-body">
                    <div className="container-fluid">
                        {showForm && (
                            <div className="card border-0 shadow-sm mt-3">
                                <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">
                                    <h6 className="mb-0 fw-semibold">{editingId ? 'Edit Landmark' : 'New Landmark'}</h6>
                                    <button type="button" className="mi-icon-action" title="Close" onClick={resetForm}>
                                        <X size={14} /><span>Close</span>
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label small fw-semibold">Name *</label>
                                            <input className={inputClass} name="name" value={form.name} onChange={handleChange} placeholder="e.g. CJs Hotel" />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-semibold">Category</label>
                                            <select className="form-select form-select-sm" name="category" value={form.category} onChange={handleChange}>
                                                {CATEGORIES.map(item => <option key={item} value={item}>{item}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-semibold">Area</label>
                                            <input className={inputClass} name="area" value={form.area} onChange={handleChange} placeholder="e.g. Hurlingham" />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-semibold">City</label>
                                            <input className={inputClass} name="city" value={form.city} onChange={handleChange} placeholder="e.g. Nairobi" />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-semibold">County</label>
                                            <input className={inputClass} name="county" value={form.county} onChange={handleChange} placeholder="e.g. Nairobi" />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-semibold">Address</label>
                                            <input className={inputClass} name="address" value={form.address} onChange={handleChange} placeholder="Street or estate" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold">Latitude *</label>
                                            <input className={inputClass} type="number" step="any" name="lat" value={form.lat} onChange={handleChange} placeholder="-1.292066" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold">Longitude *</label>
                                            <input className={inputClass} type="number" step="any" name="lng" value={form.lng} onChange={handleChange} placeholder="36.821945" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">Details</label>
                                            <textarea className="form-control form-control-sm" rows={3} name="details" value={form.details} onChange={handleChange} placeholder="Internal details for admin context." />
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer bg-white border-top d-flex gap-2">
                                    <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={saveLandmark}>
                                        <Save size={14} className="me-1" />{saving ? 'Saving...' : 'Save Landmark'}
                                    </button>
                                    <button type="button" className="btn btn-light btn-sm" onClick={resetForm}>Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="card border-0 shadow-sm mt-3">
                            <div className="card-header bg-white border-bottom">
                                <div className="row g-2 align-items-center">
                                    <div className="col-md-5">
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text"><MapPin size={14} /></span>
                                            <input type="text" className="form-control" placeholder="Search name, area, city, address..."
                                                value={search} onChange={e => setSearch(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <select className="form-select form-select-sm" value={category} onChange={e => setCategory(e.target.value)}>
                                            <option value="">All Categories</option>
                                            {CATEGORIES.map(item => <option key={item} value={item}>{item}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <select className="form-select form-select-sm" value={status} onChange={e => setStatus(e.target.value)}>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="all">All</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2 text-end">
                                        <button className="btn btn-primary btn-sm" onClick={fetchLandmarks} disabled={loading}>
                                            Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {loading ? (
                                    <div className="p-3">
                                        {[1, 2, 3, 4].map(n => <Skeleton key={n} height="48px" className="mb-2" />)}
                                    </div>
                                ) : (
                                    <DataTable value={landmarks} paginator rows={10} stripedRows emptyMessage="No landmarks found.">
                                        <Column field="name" header="Landmark" sortable />
                                        <Column field="category" header="Category" sortable />
                                        <Column header="Location" body={locationBody} sortable />
                                        <Column header="Coordinates" body={coordinatesBody} />
                                        <Column header="Status" body={statusBody} sortable sortField="isActive" />
                                        <Column header="Actions" body={actionsBody} style={{ minWidth: '180px' }} />
                                    </DataTable>
                                )}
                            </div>
                            <div className="card-footer bg-white border-top text-muted small">
                                {activeCount} active landmark{activeCount !== 1 ? 's' : ''}. Coordinates are internal and only derived distances are shown to tenants.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminLandmarks;
