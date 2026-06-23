import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { makeRequest2 } from '../../utils/makeRequest';
import { getPlaceSuggestionsURL } from '../../utils/urls';

function LocationSuggestions({ value = '', onChange, placeholder = 'e.g. Kilimani', style = {}, inputStyle = {}, label }) {
  const [query, setQuery]      = useState(value);
  const [suggestions, setSugg] = useState([]);
  const [open, setOpen]        = useState(false);
  const [loading, setLoading]  = useState(false);
  const debounceRef            = useRef(null);
  const wrapperRef             = useRef();

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(async (q) => {
    setLoading(true);
    const res = await makeRequest2(
      `${getPlaceSuggestionsURL}?q=${encodeURIComponent(q.trim())}&limit=8`,
      'GET'
    );
    if (res.success) {
      setSugg(res.data?.data || []);
      setOpen(true);
    }
    setLoading(false);
  }, []);

  const handleFocus = () => {
    fetchSuggestions(query || 'a');
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val || 'a'), 250);
  };

  const handleSelect = (loc) => {
    setQuery(loc.name);
    setOpen(false);
    setSugg([]);
    onChange && onChange(loc);
  };

  const handleClear = () => {
    setQuery('');
    setSugg([]);
    setOpen(false);
    onChange && onChange(null);
  };

  const placeLabel = (place) => {
    const map = {
      city: 'City', town: 'Town', village: 'Village',
      suburb: 'Suburb', neighbourhood: 'Neighbourhood', county: 'County'
    };
    return map[place] || 'Place';
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', ...style }}>
      {label && (
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'var(--mi-muted)',
          marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>
          {label}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        border: open ? '1.5px solid var(--mi-brand)' : '1.5px solid var(--mi-line)',
        borderRadius: 999, padding: '10px 16px', background: '#fff',
        transition: 'border-color 0.15s', ...inputStyle,
      }}>
        <MapPin size={15} style={{ color: open ? 'var(--mi-brand)' : 'var(--mi-muted)', flexShrink: 0 }} />
        <input
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: 13,
            color: 'var(--mi-ink)', background: 'transparent', fontFamily: 'inherit',
          }}
        />
        {loading && <span style={{ fontSize: 11, color: 'var(--mi-muted)' }}>…</span>}
        {query && !loading && (
          <button onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={13} style={{ color: 'var(--mi-muted)' }} />
          </button>
        )}
        {!query && !loading && <Search size={13} style={{ color: 'var(--mi-muted)', flexShrink: 0 }} />}
      </div>

      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#fff', border: '1px solid var(--mi-line)', borderRadius: 16,
          boxShadow: '0 8px 32px rgba(17,24,39,0.12)', zIndex: 1000,
          maxHeight: 280, overflowY: 'auto', padding: '8px 0',
        }}>
          {suggestions.map((loc, i) => (
            <button
              key={i}
              onClick={() => handleSelect(loc)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--mi-line)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: '#f0f4ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <MapPin size={14} style={{ color: 'var(--mi-brand)' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mi-ink)' }}>{loc.name}</div>
                <div style={{ fontSize: 11, color: 'var(--mi-muted)' }}>{placeLabel(loc.place)} · Kenya</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationSuggestions;