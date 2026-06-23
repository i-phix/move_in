import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb
 * @param {Array} items  e.g. [{ label: 'Dashboard', to: '/move-in/dashboard' }, { label: 'My Units' }]
 */
function Breadcrumb({ items = [] }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
      <Link
        to="/move-in/dashboard"
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: 'var(--mi-muted)', fontSize: 12, textDecoration: 'none',
          fontWeight: 500, transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--mi-brand)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--mi-muted)'}
      >
        <Home size={13} />
        Home
      </Link>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={12} style={{ color: 'var(--mi-line)' }} />
          {item.to ? (
            <Link
              to={item.to}
              style={{
                fontSize: 12, color: 'var(--mi-muted)', textDecoration: 'none',
                fontWeight: 500, transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--mi-brand)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--mi-muted)'}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--mi-ink)', fontWeight: 600 }}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumb;
