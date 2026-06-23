import React, { useEffect, useState } from 'react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import Layout from '../component/layout';
import {
    getMoveInPaymentSettingsURL,
    updateMoveInReservationFeeSettingURL,
    updateMoveInViewingFeeSettingURL,
    updateMoveInCommissionSettingURL,
    getMoveInFeaturedPackagesURL,
    createMoveInFeaturedPackageURL,
    updateMoveInFeaturedPackageURL,
    deleteMoveInFeaturedPackageURL,
} from '../../../utils/urls';

const RULE_OPTIONS = [
    { value: 'same_as_rent',       label: 'Same as monthly rent' },
    { value: 'percentage_of_rent', label: 'Percentage of monthly rent (%)' },
    { value: 'fixed_amount',       label: 'Fixed amount (KES)' },
];

// Single fee block (reservation / viewing / commission) with rule selector and
// conditional value input. Saves via its own endpoint to keep validation
// scoped per-block on the backend.
function FeeBlock({ title, subtitle, value, onSave, saving }) {
    const [rule, setRule] = useState(value?.rule || 'same_as_rent');
    const [amount, setAmount] = useState(value?.value ?? 0);

    useEffect(() => {
        setRule(value?.rule || 'same_as_rent');
        setAmount(value?.value ?? 0);
    }, [value]);

    const valueLabel = rule === 'percentage_of_rent'
        ? 'Percentage (0–100)'
        : rule === 'fixed_amount'
            ? 'Amount (KES)'
            : null;

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
                <h6 className="fw-semibold mb-1">{title}</h6>
                <p className="text-muted small mb-3">{subtitle}</p>

                <div className="mb-3">
                    <label className="form-label small fw-semibold">Rule</label>
                    <select
                        className="form-select"
                        value={rule}
                        onChange={(e) => setRule(e.target.value)}
                        disabled={saving}
                    >
                        {RULE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {valueLabel && (
                    <div className="mb-3">
                        <label className="form-label small fw-semibold">{valueLabel}</label>
                        <input
                            type="number"
                            className="form-control"
                            min="0"
                            max={rule === 'percentage_of_rent' ? 100 : undefined}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={saving}
                        />
                    </div>
                )}

                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onSave({ rule, value: rule === 'same_as_rent' ? 0 : Number(amount) || 0 })}
                    disabled={saving}
                >
                    {saving ? 'Saving…' : 'Save'}
                </button>
            </div>
        </div>
    );
}

// Featured-package CRUD table — admin tier configuration for landlord boosts.
function FeaturedPackagesCard({ packages, refetch, busy, setBusy }) {
    const empty = { name: '', durationDays: 7, price: 0, description: '', isActive: true, sortOrder: 0 };
    const [draft, setDraft] = useState(empty);
    const [editingId, setEditingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null); // pkg to delete

    const startEdit = (pkg) => {
        setEditingId(pkg._id);
        setDraft({
            name: pkg.name || '',
            durationDays: pkg.durationDays ?? 7,
            price: pkg.price ?? 0,
            description: pkg.description || '',
            isActive: pkg.isActive !== false,
            sortOrder: pkg.sortOrder ?? 0,
        });
    };

    const cancel = () => {
        setEditingId(null);
        setDraft(empty);
    };

    const save = async () => {
        if (!draft.name.trim()) {
            toastify('Package name is required', 'error');
            return;
        }
        setBusy(true);
        const url = editingId
            ? `${updateMoveInFeaturedPackageURL}/${editingId}`
            : createMoveInFeaturedPackageURL;
        const method = editingId ? 'PUT' : 'POST';
        const res = await makeRequest2(url, method, draft);
        setBusy(false);
        if (res.success) {
            toastify(editingId ? 'Package updated' : 'Package created', 'success');
            cancel();
            refetch();
        } else {
            toastify(res.error || 'Failed to save package', 'error');
        }
    };

    const remove = async (pkg) => {
        setConfirmDelete(pkg);
    };

    const doDelete = async () => {
        if (!confirmDelete) return;
        const pkg = confirmDelete;
        setConfirmDelete(null);
        setBusy(true);
        const res = await makeRequest2(`${deleteMoveInFeaturedPackageURL}/${pkg._id}`, 'DELETE');
        setBusy(false);
        if (res.success) {
            toastify('Package deleted', 'success');
            refetch();
        } else {
            toastify(res.error || 'Failed to delete package', 'error');
        }
    };

    return (
        <>
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">
                <div>
                    <h6 className="fw-semibold mb-0">Featured listing packages</h6>
                    <small className="text-muted">Tiered packages landlords can buy to boost their listings.</small>
                </div>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th className="text-end">Duration (days)</th>
                                <th className="text-end">Price (KES)</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-4">No packages yet. Add one below.</td>
                                </tr>
                            )}
                            {packages.map(pkg => (
                                <tr key={pkg._id}>
                                    <td>
                                        <div className="fw-semibold">{pkg.name}</div>
                                        {pkg.description && <small className="text-muted d-block">{pkg.description}</small>}
                                    </td>
                                    <td className="text-end">{pkg.durationDays}</td>
                                    <td className="text-end">KES {Number(pkg.price || 0).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${pkg.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                            {pkg.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(pkg)} disabled={busy}>
                                            Edit
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(pkg)} disabled={busy}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card-footer bg-light">
                <h6 className="fw-semibold mb-3">{editingId ? 'Edit package' : 'Add a new package'}</h6>
                <div className="row g-2">
                    <div className="col-md-3">
                        <input
                            className="form-control"
                            placeholder="Name (e.g. 7-day boost)"
                            value={draft.name}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        />
                    </div>
                    <div className="col-md-2">
                        <input
                            type="number"
                            className="form-control"
                            min="1"
                            placeholder="Days"
                            value={draft.durationDays}
                            onChange={(e) => setDraft({ ...draft, durationDays: Number(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="col-md-2">
                        <input
                            type="number"
                            className="form-control"
                            min="0"
                            placeholder="Price (KES)"
                            value={draft.price}
                            onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            className="form-control"
                            placeholder="Description (optional)"
                            value={draft.description}
                            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        />
                    </div>
                    <div className="col-md-2 d-flex align-items-center gap-2">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="pkgActive"
                                checked={draft.isActive}
                                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                            />
                            <label className="form-check-label small" htmlFor="pkgActive">Active</label>
                        </div>
                    </div>
                </div>
                <div className="mt-3 d-flex gap-2">
                    <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>
                        {busy ? 'Saving…' : editingId ? 'Update package' : 'Add package'}
                    </button>
                    {editingId && (
                        <button className="btn btn-outline-secondary btn-sm" onClick={cancel} disabled={busy}>
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>

        {confirmDelete && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.45)' }}>
                <div className="modal-dialog modal-dialog-centered modal-sm">
                    <div className="modal-content border-0 shadow" style={{ borderRadius: 14 }}>
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-semibold">Delete package</h6>
                            <button className="btn-close" onClick={() => setConfirmDelete(null)} />
                        </div>
                        <div className="modal-body pt-2 pb-0 small text-muted">
                            Delete <strong>{confirmDelete.name}</strong>? This cannot be undone.
                        </div>
                        <div className="modal-footer border-0">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={doDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

const PaymentSettings = () => {
    const [settings, setSettings] = useState(null);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingBlock, setSavingBlock] = useState(null); // 'reservation' | 'viewing' | 'commission'
    const [pkgBusy, setPkgBusy] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        const [s, p] = await Promise.all([
            makeRequest2(getMoveInPaymentSettingsURL, 'GET'),
            makeRequest2(getMoveInFeaturedPackagesURL, 'GET'),
        ]);
        if (s.success) setSettings(s.data?.data || null);
        else toastify(s.error || 'Failed to load payment settings', 'error');

        if (p.success) setPackages(Array.isArray(p.data?.data) ? p.data.data : []);
        else toastify(p.error || 'Failed to load featured packages', 'error');

        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const saveBlock = async (block, url, body) => {
        setSavingBlock(block);
        const res = await makeRequest2(url, 'PUT', body);
        setSavingBlock(null);
        if (res.success) {
            toastify('Saved', 'success');
            fetchAll();
        } else {
            toastify(res.error || 'Failed to save', 'error');
        }
    };

    return (
        <Layout>
            <div className="container py-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h4 className="fw-bold mb-1">Payment settings</h4>
                        <small className="text-muted">
                            Defaults applied across all listings. Landlords can override reservation
                            and viewing fees per-unit; commission applies system-wide.
                        </small>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm" onClick={fetchAll} disabled={loading}>
                        {loading ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>

                {loading && !settings ? (
                    <p className="text-muted">Loading…</p>
                ) : (
                    <>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <FeeBlock
                                    title="Reservation fee (tenant pays)"
                                    subtitle="Charged when a tenant reserves a unit. Non-refundable."
                                    value={settings?.reservation}
                                    saving={savingBlock === 'reservation'}
                                    onSave={(v) => saveBlock('reservation', updateMoveInReservationFeeSettingURL, v)}
                                />
                            </div>
                            <div className="col-md-4">
                                <FeeBlock
                                    title="Viewing fee (tenant pays)"
                                    subtitle="Optional fee to deter no-shows. Use 'Fixed amount' = 0 for free viewings."
                                    value={settings?.viewing}
                                    saving={savingBlock === 'viewing'}
                                    onSave={(v) => saveBlock('viewing', updateMoveInViewingFeeSettingURL, v)}
                                />
                            </div>
                            <div className="col-md-4">
                                <FeeBlock
                                    title="Commission (landlord pays)"
                                    subtitle="What the platform earns when a deal is marked rented."
                                    value={settings?.commission}
                                    saving={savingBlock === 'commission'}
                                    onSave={(v) => saveBlock('commission', updateMoveInCommissionSettingURL, v)}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <FeaturedPackagesCard
                                packages={packages}
                                refetch={fetchAll}
                                busy={pkgBusy}
                                setBusy={setPkgBusy}
                            />
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default PaymentSettings;
