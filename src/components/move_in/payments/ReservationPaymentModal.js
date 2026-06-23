import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Smartphone, XCircle, RefreshCw } from 'lucide-react';
import { makeRequest, makeRequest2 } from '../../../utils/makeRequest';
import { displayError } from '../../../utils/displayError';
import { getUnitFeesURL } from '../../../utils/urls';

// Reservation fee payment modal (Phase C — Option A).
//
// Lifecycle:
//   1. "form"      — collect phone + (for guests) name/email, show fee preview
//   2. "initiating" — POST /reservations/initiate-payment(/guest)
//   3. "awaiting"  — STK push sent, poll /payments/:accountNumber/status
//   4. "success"   — payment paid, reservation created on the server
//   5. "failed"    — payment failed/timeout, offer retry
//
// We deliberately keep this component standalone so the same UI can be
// reused later for viewing fees + featured-listing checkout in phases E/F.
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS  = 90_000; // 90 seconds — Safaricom STK push window

const INITIATE_URL_TENANT = '/api/move_in/reservations/initiate-payment';
const INITIATE_URL_GUEST  = '/api/move_in/reservations/initiate-payment/guest';
const STATUS_URL_PREFIX   = '/api/move_in/payments';

export default function ReservationPaymentModal({
    open,
    onClose,
    onSuccess, // (data) => void — fired on payment.completed
    unit,
    isGuest,
    initialPhone = '',
    initialName  = '',
    initialEmail = '',
    initialMoveInDate = '',
}) {
    const [stage, setStage] = useState('form');
    const [phone, setPhone] = useState(initialPhone);
    const [name,  setName]  = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [moveInDate, setMoveInDate] = useState(initialMoveInDate);
    const [errorText, setErrorText] = useState('');
    const [paymentInfo, setPaymentInfo] = useState(null); // { accountNumber, amount, fee, ... }
    const [statusInfo, setStatusInfo] = useState(null);   // { status, paidAt, invoice, reservation }
    const [feePreview, setFeePreview] = useState(null);   // { amount, rule } loaded on open
    const pollTimerRef = useRef(null);
    const pollDeadlineRef = useRef(0);

    // Clear any lingering polling timer when modal closes / unmounts.
    const stopPolling = () => {
        if (pollTimerRef.current) {
            clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
    };

    useEffect(() => () => stopPolling(), []);

    useEffect(() => {
        if (open) {
            setStage('form');
            setErrorText('');
            setPaymentInfo(null);
            setStatusInfo(null);
            setFeePreview(null);
            stopPolling();
            // Fetch fee preview in the background so user sees the amount before paying
            const unitId = unit?._id;
            if (unitId) {
                makeRequest2(`${getUnitFeesURL}/${unitId}/fees`, 'GET').then((res) => {
                    if (res.success) {
                        const fees = res.data?.data || res.data || {};
                        if (fees.reservation_fee > 0) {
                            setFeePreview({ amount: fees.reservation_fee, rule: fees.reservation_fee_rule });
                        }
                    }
                }).catch(() => {});
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    if (!open) return null;

    // Fee rule preview — what the tenant is about to pay. We render this
    // even before initiation so they know the amount before tapping Pay.
    const feeAmount = paymentInfo?.amount;
    const feeRule = paymentInfo?.fee?.rule;
    const feeValue = paymentInfo?.fee?.value;

    const ruleSummary = () => {
        if (!feeRule) return null;
        if (feeRule === 'same_as_rent')       return 'Equal to one month rent';
        if (feeRule === 'percentage_of_rent') return `${feeValue}% of monthly rent`;
        if (feeRule === 'fixed_amount')       return `Fixed amount`;
        return null;
    };

    const initiate = async () => {
        setErrorText('');
        if (!phone || phone.replace(/\D+/g, '').length < 9) {
            setErrorText('Enter a valid M-Pesa phone number (e.g. 0712345678).');
            return;
        }
        if (isGuest) {
            if (!name?.trim() || !email?.trim()) {
                setErrorText('Name and email are required.');
                return;
            }
        }

        setStage('initiating');
        const payload = {
            unitId: unit?._id,
            facilityId: unit?.facilityId?._id || unit?.facilityId || null,
            phone,
            desiredMoveInDate: moveInDate || null,
            ...(isGuest ? { fullName: name, email } : {}),
        };
        const url = isGuest ? INITIATE_URL_GUEST : INITIATE_URL_TENANT;
        const res = isGuest
            ? await makeRequest(url, 'POST', payload)
            : await makeRequest2(url, 'POST', payload);

        if (!res.success) {
            const message = displayError(res.error, 'Could not start the M-Pesa prompt.');
            setErrorText(message);
            setStage('failed');
            return;
        }

        const data = res.data?.data || {};
        setPaymentInfo(data);
        setStage('awaiting');
        pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS;
        pollOnce(data.accountNumber);
    };

    const pollOnce = async (accountNumber) => {
        const res = await makeRequest(`${STATUS_URL_PREFIX}/${accountNumber}/status`, 'GET');
        if (res.success) {
            const data = res.data?.data;
            setStatusInfo(data);
            if (data?.status === 'paid') {
                stopPolling();
                setStage('success');
                onSuccess && onSuccess(data);
                return;
            }
            if (data?.status === 'failed') {
                stopPolling();
                setErrorText('The M-Pesa payment did not complete. Please try again.');
                setStage('failed');
                return;
            }
        }
        if (Date.now() >= pollDeadlineRef.current) {
            stopPolling();
            setErrorText('No M-Pesa confirmation received in time. If you completed the payment, your reservation will still be created — check your invoices list shortly.');
            setStage('failed');
            return;
        }
        pollTimerRef.current = setTimeout(() => pollOnce(accountNumber), POLL_INTERVAL_MS);
    };

    const handleClose = () => {
        if (stage === 'awaiting') {
            if (!window.confirm('The M-Pesa prompt is still active. Close anyway? Your payment will still be processed if you complete it on your phone.')) {
                return;
            }
        }
        stopPolling();
        onClose && onClose();
    };

    return (
        <div style={backdrop} onClick={handleClose}>
            <div style={card} onClick={(e) => e.stopPropagation()}>
                <div style={headerRow}>
                    <div>
                        <h3 style={title}>Reserve this unit</h3>
                        <p style={subtitle}>
                            Pay the reservation fee via M-Pesa to lock in this unit.
                            <br />
                            <strong>Reservation fees are non-refundable.</strong>
                        </p>
                    </div>
                    <button type="button" onClick={handleClose} style={closeBtn}>×</button>
                </div>

                {stage === 'form' && (
                    <Form
                        unit={unit}
                        isGuest={isGuest}
                        feePreview={feePreview}
                        phone={phone} setPhone={setPhone}
                        name={name} setName={setName}
                        email={email} setEmail={setEmail}
                        moveInDate={moveInDate} setMoveInDate={setMoveInDate}
                        errorText={errorText}
                        onCancel={handleClose}
                        onSubmit={initiate}
                    />
                )}

                {stage === 'initiating' && (
                    <StatusBlock
                        icon={<Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />}
                        title="Sending M-Pesa prompt…"
                        subtitle="Keep this window open."
                    />
                )}

                {stage === 'awaiting' && (
                    <StatusBlock
                        icon={<Smartphone size={36} />}
                        title="Check your phone"
                        subtitle={
                            <>
                                We sent an M-Pesa prompt to <strong>{phone}</strong> for
                                <strong> KES {Number(feeAmount || 0).toLocaleString()}</strong>.
                                {ruleSummary() && <span style={hint}> ({ruleSummary()})</span>}
                                <br />
                                Enter your M-Pesa PIN to complete the reservation.
                            </>
                        }
                        extra={
                            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--mi-muted)', fontSize: 12 }}>
                                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                Waiting for confirmation…
                            </div>
                        }
                    />
                )}

                {stage === 'success' && (
                    <StatusBlock
                        icon={<CheckCircle2 size={36} color="#16A34A" />}
                        title="Reservation confirmed"
                        subtitle={
                            <>
                                Payment received. Your reservation for <strong>{unit?.title || 'this unit'}</strong> is now active.
                                <br />
                                A receipt has been emailed to you.
                            </>
                        }
                        extra={
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
                                <button onClick={handleClose} className="btn btn-primary">Done</button>
                            </div>
                        }
                    />
                )}

                {stage === 'failed' && (
                    <StatusBlock
                        icon={<XCircle size={36} color="#DC2626" />}
                        title="Payment incomplete"
                        subtitle={errorText || 'Something went wrong. Try again.'}
                        extra={
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
                                <button onClick={handleClose} className="btn btn-outline-secondary">Close</button>
                                <button onClick={() => setStage('form')} className="btn btn-primary">
                                    <RefreshCw size={14} style={{ marginRight: 6 }} /> Try again
                                </button>
                            </div>
                        }
                    />
                )}
            </div>

            {/* Inline keyframes so we don't depend on a global stylesheet. */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function Form({ unit, isGuest, feePreview, phone, setPhone, name, setName, email, setEmail, moveInDate, setMoveInDate, errorText, onCancel, onSubmit }) {
    return (
        <>
            <div style={body}>
                <div style={pricePreview}>
                    <div style={pricePreviewLabel}>Reservation fee for this unit</div>
                    {feePreview ? (
                        <div style={{ fontWeight: 800, color: '#0369A1', fontSize: '1.2rem', marginTop: 4 }}>
                            KES {Number(feePreview.amount).toLocaleString()}
                        </div>
                    ) : (
                        <div style={pricePreviewHint}>Fetching fee…</div>
                    )}
                    <div style={pricePreviewHint}>Non-refundable · Paid via M-Pesa</div>
                </div>

                {isGuest && (
                    <>
                        <label style={label}>Full name</label>
                        <input
                            className="auth-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Jane Wanjiku"
                        />
                        <label style={label}>Email</label>
                        <input
                            className="auth-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jane@example.com"
                        />
                    </>
                )}

                <label style={label}>M-Pesa phone number</label>
                <input
                    className="auth-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712345678"
                    inputMode="tel"
                />

                <label style={label}>Desired move-in date</label>
                <input
                    type="date"
                    className="auth-input"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                />

                {errorText && (
                    <div style={errorBox}>{errorText}</div>
                )}
            </div>

            <div style={footer}>
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={onSubmit}>
                    Pay reservation fee
                </button>
            </div>
        </>
    );
}

function StatusBlock({ icon, title, subtitle, extra }) {
    return (
        <div style={{ padding: '36px 28px 28px', textAlign: 'center' }}>
            <div>{icon}</div>
            <h4 style={{ margin: '14px 0 6px', fontSize: '1.05rem', color: 'var(--mi-ink)' }}>{title}</h4>
            <div style={{ color: 'var(--mi-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>{subtitle}</div>
            {extra}
        </div>
    );
}

const backdrop = {
    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 16,
};
const card = {
    width: 'min(460px, 100%)', background: '#fff', borderRadius: 16,
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)', overflow: 'hidden',
};
const headerRow = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 22px 10px', gap: 12 };
const title = { margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--mi-ink)' };
const subtitle = { margin: '4px 0 0', color: 'var(--mi-muted)', fontSize: '0.85rem' };
const closeBtn = { background: 'none', border: 'none', fontSize: 26, color: 'var(--mi-muted)', cursor: 'pointer', lineHeight: 1 };
const body = { padding: '6px 22px 18px', display: 'flex', flexDirection: 'column', gap: 10 };
const footer = { padding: '12px 22px 20px', display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--mi-line)' };
const label = { fontSize: '0.82rem', fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 4, marginTop: 6 };
const pricePreview = { background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10, padding: '10px 12px', marginBottom: 4 };
const pricePreviewLabel = { fontWeight: 700, color: '#0369A1', fontSize: '0.85rem' };
const pricePreviewHint = { fontSize: '0.78rem', color: '#0369A1', marginTop: 2 };
const errorBox = { background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 8, padding: '8px 10px', fontSize: '0.85rem' };
const hint = { color: 'var(--mi-muted)', fontStyle: 'italic' };
