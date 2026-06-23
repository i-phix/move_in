import React from 'react';
import { Home, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

function CompactFooter() {
  return (
    <footer style={{ padding: '1.5rem 2rem', color: 'var(--mi-muted)', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span>© 2026 PayServe Move In. Internal workspace.</span>
        <span>Support: support@payserve.co.ke</span>
      </div>
    </footer>
  );
}

function MarketingFooter() {
  const year = new Date().getFullYear();
  const linkStyle = { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' };
  const muted = { color: 'rgba(255,255,255,0.62)', fontSize: '0.9rem', lineHeight: 1.7 };

  return (
    <footer style={{ background: '#0f172a', color: '#fff', flexShrink: 0 }}>
      <div style={{
        width: 'min(1160px, calc(100% - 48px))',
        margin: '0 auto',
        padding: '3rem 0 2rem',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr',
        gap: '2rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--mi-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home size={19} color="#fff" strokeWidth={2.5} />
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>Move-In</div>
              <div style={{ color: 'var(--mi-brand)', fontSize: '0.72rem', fontWeight: 700 }}>by PayServe</div>
            </div>
          </div>
          <p style={{ ...muted, maxWidth: 340, margin: 0 }}>
            A digital rental journey for verified homes, viewing bookings, applications, payments, and move-in handover.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
              <span key={index} style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                border: '1px solid rgba(255,255,255,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.75)',
              }}>
                <Icon size={15} />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem' }}>Quick Links</h4>
          <div style={{ display: 'grid', gap: 10 }}>
            <a href="/" style={linkStyle}>Home</a>
            <a href="/listings" style={linkStyle}>Listings</a>
            <a href="/#how-it-works" style={linkStyle}>How It Works</a>
            <a href="/#portals" style={linkStyle}>Portals</a>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem' }}>Portals</h4>
          <div style={{ display: 'grid', gap: 10 }}>
            <a href="/login" style={linkStyle}>Tenant Login</a>
            <a href="/landlord-login" style={linkStyle}>Landlord Login</a>
            <a href="/register" style={linkStyle}>Tenant Register</a>
            <a href="/landlord-register" style={linkStyle}>Landlord Register</a>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem' }}>Contact</h4>
          <div style={{ display: 'grid', gap: 10, ...muted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} /> +254 700 000 000</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={14} /> hello@movein.co.ke</span>
            <span>Support: support@payserve.co.ke</span>
            <span>Nairobi, Kenya</span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{
          width: 'min(1160px, calc(100% - 48px))',
          margin: '0 auto',
          padding: '1rem 0',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          color: 'rgba(255,255,255,0.55)',
          fontSize: '0.82rem',
        }}>
          <span>© {year} PayServe Move-In. All rights reserved.</span>
          <span>Secure guest access</span>
        </div>
      </div>
    </footer>
  );
}

function Footer({ variant = 'compact' }) {
  return variant === 'marketing' ? <MarketingFooter /> : <CompactFooter />;
}

export default Footer;
