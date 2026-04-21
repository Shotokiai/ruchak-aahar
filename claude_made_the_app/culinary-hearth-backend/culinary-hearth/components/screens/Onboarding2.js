'use client';

import { useState } from 'react';
import { COLORS } from '../../lib/constants';

export default function Onboarding2({ go, setProfile }) {
  const [pref, setPref] = useState('nonveg');
  const [allergies, setAllergies] = useState([]);

  const prefOpts = [
    { id: 'veg', emoji: '🥗', label: 'Veg', desc: 'Plant-based including dairy' },
    { id: 'nonveg', emoji: '🍗', label: 'Non-Veg', desc: 'Meat, poultry, seafood' },
    { id: 'vegan', emoji: '🥑', label: 'Vegan', desc: 'Strict plant-based' },
  ];

  const allergyOpts = [
    { id: 'dairy', label: 'Dairy 🥛', sub: 'Milk, cheese, butter' },
    { id: 'gluten', label: 'Gluten 🌾', sub: 'Wheat, rye, barley' },
    { id: 'nuts', label: 'Tree Nuts 🥜', sub: 'Almonds, walnuts, cashews' },
    { id: 'eggs', label: 'Eggs 🥚', sub: 'All egg products' },
    { id: 'shellfish', label: 'Shellfish 🦐', sub: 'Shrimp, crab, lobster' },
    { id: 'soy', label: 'Soy 🫘', sub: 'Tofu, edamame, soy milk' },
    { id: 'fish', label: 'Fish 🐟', sub: 'All fish varieties' },
    { id: 'none', label: 'No Allergies ✅', sub: 'I can eat everything' },
  ];

  const toggle = (id) => {
    if (id === 'none') {
      setAllergies(['none']);
      return;
    }
    setAllergies((a) => {
      const n = a.filter((x) => x !== 'none');
      return n.includes(id) ? n.filter((x) => x !== id) : [...n, id];
    });
  };

  return (
    <div className="slide-up" style={{ minHeight: '100vh', background: COLORS.bg }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: COLORS.bg, padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div
            className="tap"
            onClick={() => go('onboarding1')}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#E8DDD0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ←
          </div>
          <div>
            <div style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 15 }}>Personalize Your Hearth</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>Step 2 of 3</div>
          </div>
        </div>
        <div style={{ height: 4, background: '#E0D8CC', borderRadius: 2 }}>
          <div style={{ height: '100%', width: '66%', background: COLORS.primary, borderRadius: 2 }} />
        </div>
      </div>

      <div style={{ padding: '18px 20px 40px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>
          Food <span style={{ color: COLORS.primary }}>Preferences</span>
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 13.5, marginBottom: 16 }}>Choose your diet type and any food allergies</p>

        <div style={{ marginBottom: 18 }}>
          {prefOpts.map((o) => (
            <div
              key={o.id}
              className="tap"
              onClick={() => setPref(o.id)}
              style={{
                background: 'white',
                borderRadius: 16,
                padding: '12px 16px',
                marginBottom: 9,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                border: `2px solid ${pref === o.id ? COLORS.primary : 'transparent'}`,
                transition: 'border .2s',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#F5EFE0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {o.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{o.label}</div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 1 }}>{o.desc}</div>
              </div>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: pref === o.id ? COLORS.primary : 'transparent',
                  border: `2px solid ${pref === o.id ? COLORS.primary : '#D0C8BC'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {pref === o.id && <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>✓</span>}
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>
          Any <span style={{ color: COLORS.primary }}>food allergies</span>?
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
          {allergyOpts.map((o) => {
            const sel = allergies.includes(o.id);
            return (
              <div
                key={o.id}
                className="tap"
                onClick={() => toggle(o.id)}
                style={{
                  background: sel ? '#FDF5F0' : 'white',
                  borderRadius: 14,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  border: `2px solid ${sel ? COLORS.primary : 'transparent'}`,
                  transition: 'all .2s',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, color: sel ? COLORS.primary : COLORS.text, marginBottom: 2 }}>
                  {o.label}
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.35 }}>{o.sub}</div>
              </div>
            );
          })}
        </div>

        <button
          className="tap"
          onClick={() => {
            setProfile((p) => ({ ...p, pref, allergies }));
            go('onboarding3');
          }}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: 50,
            border: 'none',
            background: COLORS.primary,
            color: 'white',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'DM Sans',
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
