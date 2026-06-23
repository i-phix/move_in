import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Smartphone, XCircle, RefreshCw } from 'lucide-react';
import { makeRequest, makeRequest2 } from '../../../utils/makeRequest';
import { displayError } from '../../../utils/displayError';

// Generic M-Pesa payment modal — shared by every revenue flow.
//
// Each flow plugs in three things:
//   - `initiate({ phone, ...extraFormFields })` — kicks off the STK push
//     and returns { accountNumber, amount, currency }.
//   - `extraFields` — optional renderProp for type-specific form inputs
//     (e.g. name/email for guests, move-in date for reservations).
//   - copy props (title, subtitle, payCta) so each call site reads right.
//
// Lifecycle stays identical:  form → initiating → awaiting → success/failed.
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS  = 90_000;
const STATUS_URL_PREFIX = '/api/move_in/payments';

export default function PaymentModal({
    open,
    onClose,
    onSuccess,
    title = 'M-Pesa payment',
    subtitle = 'Complete this payment via M-Pesa.',
    nonRefundableNote = false,
    payCta = 'Pay now',
    initialPhone = '',
    feePreview,            // { amount, currency, label } | null
    initiate,              // ({ phone, formValues }) => Promise<{ accountNumber, amount, currency }>
    extraFields = null,    // ({ values, setValues, disabled }) => ReactNode
    initialFormValues = {},
}) {
    const [stage, setStage] = useState('form');
    const [phone, setPhone] = useState(initialPhone);
    const [values, setValues] = useState(initialFormValues);
    const [errorText, setErrorText] = useState('');
    const [paymentInfo, setPaymentInfo] = useState(null);
    const pollTimerRef = useRef(null);
    const pollDeadlineRef = useRef(0);

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
            setPhone(initialPhone);
            setValues(initialFormValues);
            stopPolling();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    if (!open) return null;

    const runInitiate = async () => {
        setErrorText('');
        if (!phone || phone.replace(/\D+/g, '').length < 9) {
            setErrorText('Enter a valid M-Pesa phone number (e.g. 0712345678).');
            return;
        }
        setStage('initiating');
        try {
            const result = await initiate({ phone, values });
            if (!result?.accountNumber) {
                setErrorText(displayError(result?.error, 'Could not start the M-Pesa prompt.'));
                setStage('failed');
                return;
            }
            setPaymentInfo(result);
            setStage('awaiting');
            pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS;
            pollOnce(result.accountNumber);
        } catch (err) {
            setErrorText(displayError(err?.message, 'Could not start the M-Pesa prompt.'));
            setStage('failed');
        }
    };

    const pollOnce = async (accountNumber) => {
        const res = await makeRequest(`${STATUS_URL_PREFIX}/${accountNumber}/status`, 'GET');
        if (res.success) {
            const data = res.data?.data;
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
            setErrorText('No M-Pesa confirmation received in time. If you completed the payment, it will still apply — check your invoices shortly.');
            setStage('failed');
            return;
        }
        pollTimerRef.current = setTimeout(() => pollOnce(accountNumber), POLL_INTERVAL_MS);
    };

    const handleClose = () => {
        if (stage === 'awaiting') {
            // Payment prompt is live — closing here abandons the poll but the
            // webhook will still fire if the user completes M-Pesa on their phone.
            // Show a gentler exit rather than silently disappearing.
            if (!window.confirm('The M-Pesa prompt is still active. Close anyway? Your payment will still be processed if you complete it on your phone.')) {
                return;
            }
        }
        stopPolling();
        onClose && onClose();
    };

    const amount = paymentInfo?.amount ?? feePreview?.amount;
    const currency = paymentInfo?.currency ?? feePreview?.currency ?? 'KES';

    return (
        <div style={backdrop} onClick={handleClose}>
            <div style={card} onClick={(e) => e.stopPropagation()}>
                <div style={headerRow}>
                    <div>
                        <h3 style={titleStyle}>{title}</h3>
                        <p style={subtitleStyle}>
                            {subtitle}
                            {nonRefundableNote && (
                                <><br /><strong>This payment is non-refundable.</strong></>
                            )}
                        </p>
                    </div>
                    <button type="button" onClick={handleClose} style={closeBtn}>×</button>
                </div>

                {stage === 'form' && (
                    <>
                        <div style={body}>
                            {feePreview && (
                                <div style={pricePreview}>
                                    <div style={pricePreviewLabel}>{feePreview.label || 'Amount'}</div>
                                    <div style={pricePreviewValue}>
                                        {currency} {Number(feePreview.amount || 0).toLocaleString()}
                                    </div>
                                    {feePreview.hint && (
                                        <div style={pricePreviewHint}>{feePreview.hint}</div>
                                    )}
                                </div>
                            )}

                            {typeof extraFields === 'function' && extraFields({ values, setValues, disabled: false })}

                            <label style={label}>M-Pesa phone number</label>
                            <input
                                className="auth-input"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0712345678"
                                inputMode="tel"
                            />

                            {errorText && <div style={errorBox}>{errorText}</div>}
                        </div>
                        <div style={footer}>
                            <button type="button" className="btn btn-outline-secondary" onClick={handleClose}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={runInitiate}>{payCta}</button>
                        </div>
                    </>
                )}

                {stage === 'initiating' && (
                    <StatusBlock
                        icon={<Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />}
                        titleText="Sending M-Pesa prompt…"
                        subtitleText="Keep this window open."
                    />
                )}

                {stage === 'awaiting' && (
                    <StatusBlock
                        icon={<Smartphone size={36} />}
                        titleText="Check your phone"
                        subtitleText={
                            <>
                                We sent an M-Pesa prompt to <strong>{phone}</strong> for
                                <strong> {currency} {Number(amount || 0).toLocaleString()}</strong>.
                                <br />
                                Enter your M-Pesa PIN to complete the payment.
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
                        titleText="Payment received"
                        subtitleText={<>Your invoice has been emailed. Thank you.</>}
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
                        titleText="Payment incomplete"
                        subtitleText={errorText || 'Something went wrong. Try again.'}
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
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function StatusBlock({ icon, titleText, subtitleText, extra }) {
    return (
        <div style={{ padding: '36px 28px 28px', textAlign: 'center' }}>
            <div>{icon}</div>
            <h4 style={{ margin: '14px 0 6px', fontSize: '1.05rem', color: 'var(--mi-ink)' }}>{titleText}</h4>
            <div style={{ color: 'var(--mi-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>{subtitleText}</div>
            {extra}
        </div>
    );
}

// ── styles ─────────────────────────────────────────────────────────────
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
const titleStyle = { margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--mi-ink)' };
const subtitleStyle = { margin: '4px 0 0', color: 'var(--mi-muted)', fontSize: '0.85rem' };
const closeBtn = { background: 'none', border: 'none', fontSize: 26, color: 'var(--mi-muted)', cursor: 'pointer', lineHeight: 1 };
const body = { padding: '6px 22px 18px', display: 'flex', flexDirection: 'column', gap: 10 };
const footer = { padding: '12px 22px 20px', display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--mi-line)' };
const label = { fontSize: '0.82rem', fontWeight: 600, color: 'var(--mi-ink)', marginBottom: 4, marginTop: 6 };
const pricePreview = { background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10, padding: '10px 12px', marginBottom: 4 };
const pricePreviewLabel = { fontSize: '0.78rem', color: '#0369A1' };
const pricePreviewValue = { fontWeight: 700, color: '#0369A1', fontSize: '1.15rem', marginTop: 2 };
const pricePreviewHint = { fontSize: '0.72rem', color: '#0369A1', marginTop: 2 };
const errorBox = { background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 8, padding: '8px 10px', fontSize: '0.85rem' };
