'use client';

import { useState } from 'react';
import { COLORS } from '../../lib/constants';

export default function RepeatModal({ dishName, onSelect, onClose }) {
  const [sel, setSel] = useState('once');

  const opts = [
    { id: 'once', label: 'Just once', sub: 'Only this day', ic: '📌' },
    { id: 'daily', label: 'Every day', sub: 'Repeat daily', ic: '🔄' },
    { id: 'weekly', label: 'Every week', sub: 'Same day weekly', ic: '📅' },
    { id: 'monthly', label: 'Every month', sub: 'Same date monthly', ic: '🗓' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 150 }} />
      <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 38px', zIndex: 160 }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#E0D8CC', margin: '0 auto 12px' }} />
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Repeat Schedule</h3>
        <p style={{ color: COLORS.muted, fontSize: 12.5, marginBottom: 12 }}>
          How often for <em style={{ color: COLORS.primary }}>{dishName}</em>?
        </p>
        {opts.map((o) => (
          <div
            key={o.id}
            onClick={() => setSel(o.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 12,
              marginBottom: 6,
              border: `2px solid ${sel === o.id ? COLORS.primary : 'transparent'}`,
              background: sel === o.id ? '#FDF5F0' : '#F9F6F2',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{o.ic}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{o.label}</div>
              <div style={{ fontSize: 11.5, color: COLORS.muted }}>{o.sub}</div>
            </div>
            <div
              style={{
                width: 17,
                height: 17,
                borderRadius: '50%',
                border: `2px solid ${sel === o.id ? COLORS.primary : '#D0C8BC'}`,
                background: sel === o.id ? COLORS.primary : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {sel === o.id && <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>✓</span>}
            </div>
          </div>
        ))}
        <button
          className="tap"
          onClick={() => {
            onSelect(sel);
            onClose();
          }}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: 50,
            border: 'none',
            background: COLORS.primary,
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'DM Sans',
            marginTop: 8,
          }}
        >
          Save Schedule
        </button>
      </div>
    </>
  );
}
