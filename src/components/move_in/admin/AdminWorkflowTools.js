import React, { useMemo, useState } from 'react';
import { BellRing, Eye } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import { sendMoveInReminderURL } from '../../../utils/urls';

export const workflowDays = [
    { value: '', label: 'All days' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
];

export function buildWorkflowQuery({ searchTerm, statusFilter, dayFilter, dateFilter }) {
    const params = new URLSearchParams();

    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter && statusFilter !== 'All') params.set('status', statusFilter.toLowerCase());
    if (dayFilter) params.set('day', dayFilter);
    if (dateFilter) params.set('date', dateFilter);
    params.set('sort', 'upcoming');

    const query = params.toString();
    return query ? `?${query}` : '';
}

export function WorkflowFilters({
    searchTerm,
    onSearchTerm,
    statusFilter,
    onStatusFilter,
    dayFilter,
    onDayFilter,
    dateFilter,
    onDateFilter,
    statuses,
    placeholder,
    total,
    totalLabel,
}) {
    return (
        <div className="row g-2 align-items-center">
            <div className="col-md-4">
                <div className="input-group input-group-sm">
                    <span className="input-group-text"><i className="ti ti-search"></i></span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={(e) => onSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="col-md-2">
                <select
                    className="form-select form-select-sm"
                    value={statusFilter}
                    onChange={(e) => onStatusFilter(e.target.value)}
                >
                    {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div className="col-md-2">
                <select
                    className="form-select form-select-sm"
                    value={dayFilter}
                    onChange={(e) => onDayFilter(e.target.value)}
                >
                    {workflowDays.map((day) => (
                        <option key={day.value || 'all'} value={day.value}>{day.label}</option>
                    ))}
                </select>
            </div>
            <div className="col-md-2">
                <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dateFilter}
                    onChange={(e) => onDateFilter(e.target.value)}
                />
            </div>
            <div className="col-md-2 text-end">
                <span className="text-muted small">{total} {totalLabel}</span>
            </div>
        </div>
    );
}

export function WorkflowActions({ row, onView, onReminder }) {
    return (
        <div className="d-flex gap-2">
            <button type="button" className="mi-icon-action" title="View details" onClick={() => onView(row)}>
                <Eye size={14} />
            </button>
            <button type="button" className="mi-icon-action warning" title="Send reminder" onClick={() => onReminder(row)}>
                <BellRing size={14} />
            </button>
        </div>
    );
}

function DetailLine({ label, value }) {
    return (
        <div className="mb-3">
            <div className="small text-muted text-uppercase">{label}</div>
            <div className="fw-semibold">{value || '-'}</div>
        </div>
    );
}

export function WorkflowDetailsModal({ title, row, onClose, children }) {
    if (!row) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header">
                        <h5 className="modal-title fw-semibold">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-6">
                                <DetailLine label="Tenant" value={row.tenantName} />
                                <DetailLine label="Tenant email" value={row.tenantEmail} />
                                <DetailLine label="Tenant phone" value={row.tenantPhone} />
                            </div>
                            <div className="col-md-6">
                                <DetailLine label="Landlord" value={row.landlordName} />
                                <DetailLine label="Landlord email" value={row.landlordEmail} />
                                <DetailLine label="Landlord phone" value={row.landlordPhone} />
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-md-6">
                                <DetailLine label="Unit" value={row.unitName} />
                                <DetailLine label="Facility" value={row.facilityName} />
                            </div>
                            <div className="col-md-6">
                                <DetailLine label="Location" value={row.locationText} />
                                <DetailLine label="Status" value={row.status} />
                            </div>
                        </div>
                        {children}
                        {row.message && (
                            <>
                                <hr />
                                <DetailLine label="Message" value={row.message} />
                            </>
                        )}
                        {(row.reminderCount || row.lastReminderAt) && (
                            <>
                                <hr />
                                <DetailLine label="Reminder count" value={row.reminderCount} />
                                <DetailLine label="Last reminder" value={row.lastReminderAt ? new Date(row.lastReminderAt).toLocaleString() : '-'} />
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ReminderModal({ relatedType, row, onClose, onSent }) {
    const [target, setTarget] = useState('both');
    const [channels, setChannels] = useState(['email']);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const defaultMessage = useMemo(() => {
        if (!row) return '';
        return `Reminder for ${row.unitName || 'this unit'}. Please contact the Move-In call center on +254733902550 if you need assistance.`;
    }, [row]);

    if (!row) return null;

    const toggleChannel = (channel) => {
        setChannels((current) => (
            current.includes(channel)
                ? current.filter((item) => item !== channel)
                : [...current, channel]
        ));
    };

    const sendReminder = async () => {
        if (!channels.length) {
            toastify('Select at least one reminder channel.', 'error');
            return;
        }

        setSending(true);
        const res = await makeRequest2(sendMoveInReminderURL, 'POST', {
            relatedType,
            relatedId: row._id,
            target,
            channels,
            message: message || defaultMessage,
        });
        setSending(false);

        if (res.success) {
            toastify('Reminder sent.', 'success');
            if (onSent) onSent();
            onClose();
            return;
        }

        toastify(res.error || 'Failed to send reminder.', 'error');
    };

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header">
                        <h5 className="modal-title fw-semibold">Send Reminder</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <div className="small text-muted mb-2">{row.unitName || '-'} · {row.tenantName || '-'}</div>
                        <label className="form-label small fw-semibold">Recipient</label>
                        <select className="form-select form-select-sm mb-3" value={target} onChange={(e) => setTarget(e.target.value)}>
                            <option value="both">Tenant and landlord</option>
                            <option value="tenant">Tenant only</option>
                            <option value="landlord">Landlord only</option>
                        </select>
                        <label className="form-label small fw-semibold">Channels</label>
                        <div className="d-flex gap-3 mb-3">
                            {['email', 'sms', 'whatsapp'].map((channel) => (
                                <label key={channel} className="small text-capitalize">
                                    <input
                                        type="checkbox"
                                        className="form-check-input me-1"
                                        checked={channels.includes(channel)}
                                        onChange={() => toggleChannel(channel)}
                                    />
                                    {channel}
                                </label>
                            ))}
                        </div>
                        <label className="form-label small fw-semibold">Message</label>
                        <textarea
                            className="form-control"
                            rows={5}
                            value={message}
                            placeholder={defaultMessage}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <div className="small text-muted mt-2">The call center number +254733902550 is appended automatically.</div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={sendReminder} disabled={sending}>
                            {sending ? 'Sending...' : 'Send Reminder'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
