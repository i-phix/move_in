import React, { useEffect, useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { unwrapList } from '../../../utils/format';
import { notifyError } from '../../../utils/toast';
import { getLandlordFeaturedPackagesURL } from '../../../utils/urls';
import PaymentModal from './PaymentModal';

// Two-step modal for the featured-listing boost flow:
//   1. Pick a package (tiered cards rendered from admin config)
//   2. Confirm + pay via PaymentModal
//
// The split exists because we need the chosen package's price + duration
// to render the price preview before STK push fires.
export default function BoostPickerModal({ open, onClose, onSuccess, unit, initiate }) {
    const [packages, setPackages] = useState([]);
    const [loadingPackages, setLoadingPackages] = useState(false);
    const [chosen, setChosen] = useState(null);

    useEffect(() => {
        if (!open) {
            setChosen(null);
            return;
        }
        (async () => {
            setLoadingPackages(true);
            const res = await makeRequest2(getLandlordFeaturedPackagesURL, 'GET');
            setLoadingPackages(false);
            if (res.success) {
                setPackages(unwrapList(res));
            } else {
                notifyError(res.error);
            }
        })();
    }, [open]);

    if (!open) return null;

    // Step 2 — PaymentModal opens once a package is picked. Wrapping the
    // caller's initiate so we always pass the chosen packageId through.
    if (chosen) {
        return (
            <PaymentModal
                open={true}
                onClose={() => setChosen(null)}
                onSuccess={(data) => {
                    setChosen(null);
                    onSuccess && onSuccess(data, chosen);
                }}
                title={`Boost ${unit?.title || 'this unit'}`}
                subtitle={`${chosen.name} — featured for ${chosen.durationDays} day${chosen.durationDays === 1 ? '' : 's'}.`}
                payCta="Pay & boost"
                feePreview={{
                    amount: chosen.price,
                    currency: 'KES',
                    label: 'Boost cost',
                    hint: `${chosen.durationDays} day${chosen.durationDays === 1 ? '' : 's'} featured`,
                }}
                initiate={({ phone }) => initiate({ phone, packageId: chosen._id })}
            />
        );
    }

    // Step 1 — package picker
    return (
        <div style={backdrop} onClick={onClose}>
            <div style={card} onClick={(e) => e.stopPropagation()}>
                <div style={headerRow}>
                    <div>
                        <h3 style={titleStyle}>
                            <Sparkles size={18} style={{ marginRight: 8, verticalAlign: '-3px' }} />
                            Boost this listing
                        </h3>
                        <p style={subtitleStyle}>
                            Featured listings appear at the top of search results.
                            Pick how long you want to be featured.
                        </p>
                    </div>
                    <button type="button" onClick={onClose} style={closeBtn}>×</button>
                </div>

                <div style={body}>
                    {loadingPackages && <div style={muted}>Loading packages…</div>}
                    {!loadingPackages && packages.length === 0 && (
                        <div style={muted}>
                            No boost packages are available right now.
                            Check back once the admin team has set them up.
                        </div>
                    )}
                    {packages.map(pkg => (
                        <button
                            key={pkg._id}
                            type="button"
                            onClick={() => setChosen(pkg)}
                            style={packageCard}
                            className="boost-package-card"
                        >
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={{ fontWeight: 700, color: 'var(--mi-ink)', fontSize: '0.98rem' }}>
                                    {pkg.name}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--mi-muted)', marginTop: 4 }}>
                                    {pkg.durationDays} day{pkg.durationDays === 1 ? '' : 's'} featured
                                    {pkg.description ? ` — ${pkg.description}` : ''}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 800, color: 'var(--mi-brand)', fontSize: '1.1rem' }}>
                                    KES {Number(pkg.price).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--mi-muted)' }}>
                                    <Check size={11} style={{ verticalAlign: '-1px' }} /> M-Pesa
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div style={footer}>
                    <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

const backdrop = {
    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 16,
};
const card = {
    width: 'min(520px, 100%)', background: '#fff', borderRadius: 16,
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)', overflow: 'hidden',
};
const headerRow = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 22px 10px', gap: 12 };
const titleStyle = { margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--mi-ink)' };
const subtitleStyle = { margin: '4px 0 0', color: 'var(--mi-muted)', fontSize: '0.85rem' };
const closeBtn = { background: 'none', border: 'none', fontSize: 26, color: 'var(--mi-muted)', cursor: 'pointer', lineHeight: 1 };
const body = { padding: '6px 22px 18px', display: 'flex', flexDirection: 'column', gap: 10 };
const footer = { padding: '12px 22px 20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--mi-line)' };
const muted = { fontSize: '0.88rem', color: 'var(--mi-muted)', textAlign: 'center', padding: '18px 0' };
const packageCard = {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    border: '1.5px solid var(--mi-line)',
    background: '#fff',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'border-color 120ms ease, transform 120ms ease',
    width: '100%',
    fontFamily: 'inherit',
};
