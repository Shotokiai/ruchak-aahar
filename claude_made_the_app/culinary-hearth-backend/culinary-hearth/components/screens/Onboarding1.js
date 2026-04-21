'use client';

import { useState } from 'react';
import { COLORS } from '../../lib/constants';
import { SliderCard } from '../shared/ui';

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function Onboarding1({ go, setProfile }) {
  const [dob, setDob] = useState('');
  const [wt, setWt]   = useState(70);
  const [ht, setHt]   = useState(170);
  const [unit, setUnit] = useState('cm');

  const age = calcAge(dob);

  const cmToFt = (cm) => {
    const t = Math.round(cm / 2.54);
    return `${Math.floor(t / 12)}'${t % 12}"`;
  };

  // Max DOB = today, min = 100 years ago
  const today = new Date().toISOString().split('T')[0];
  const minDob = `${new Date().getFullYear() - 100}-01-01`;

  const canContinue = dob && age !== null && age >= 13;

  return (
    <div className="slide-up" style={{ minHeight: '100vh', background: COLORS.bg }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: COLORS.bg, padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div
            className="tap"
            onClick={() => go('welcome')}
            style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8DDD0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}
          >
            ✕
          </div>
          <div>
            <div style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 15 }}>Personalize Your Hearth</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>Step 1 of 3</div>
          </div>
        </div>
        <div style={{ height: 4, background: '#E0D8CC', borderRadius: 2 }}>
          <div style={{ height: '100%', width: '33%', background: COLORS.primary, borderRadius: 2 }} />
        </div>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 27, fontWeight: 700, marginBottom: 22, lineHeight: 1.3 }}>
          Let's get to know <span style={{ color: COLORS.primary }}>the chef.</span>
        </h1>

        {/* Date of birth */}
        <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Date of birth</div>
            {age !== null && age >= 13 && (
              <span style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700, color: COLORS.primary }}>
                {age} yrs
              </span>
            )}
          </div>
          <input
            type="date"
            value={dob}
            min={minDob}
            max={today}
            onChange={(e) => setDob(e.target.value)}
            style={{
              width: '100%', border: `1.5px solid ${COLORS.border}`, borderRadius: 12,
              padding: '10px 14px', fontSize: 16, fontFamily: 'DM Sans',
              color: dob ? COLORS.text : COLORS.muted, outline: 'none',
              background: 'transparent',
            }}
          />
          {age !== null && age < 13 && (
            <div style={{ color: '#E53935', fontSize: 12, marginTop: 6 }}>Must be at least 13 years old.</div>
          )}
        </div>

        <SliderCard label="Body weight" val={wt} display={`${wt} kg`} set={setWt} min={30} max={150} lo="30 kg" hi="150 kg" />

        {/* Height with unit toggle */}
        <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Height</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['cm', 'inch'].map((u) => (
                  <span
                    key={u}
                    onClick={() => setUnit(u)}
                    style={{
                      padding: '3px 12px', borderRadius: 20, fontSize: 12,
                      background: unit === u ? COLORS.dark : '#F0E8DC',
                      color: unit === u ? 'white' : COLORS.muted,
                      cursor: 'pointer', fontWeight: 500, transition: 'all .2s',
                    }}
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>
            <span style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700, color: COLORS.primary }}>
              {unit === 'cm' ? `${ht} cm` : cmToFt(ht)}
            </span>
          </div>
          <input
            type="range" min={130} max={220} value={ht}
            onChange={(e) => setHt(+e.target.value)}
            style={{ WebkitAppearance: 'none', width: '100%', height: 4, borderRadius: 2, background: '#E0D8CC', outline: 'none' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.muted, marginTop: 6 }}>
            <span>{unit === 'cm' ? '130 cm' : '4\'3"'}</span>
            <span>{unit === 'cm' ? '220 cm' : '7\'2"'}</span>
          </div>
        </div>

        <button
          className="tap"
          onClick={() => {
            if (!canContinue) return;
            setProfile((p) => ({ ...p, dob, age, weightKg: wt, heightCm: ht }));
            go('onboarding2');
          }}
          style={{
            width: '100%', padding: '15px', borderRadius: 50, border: 'none',
            background: canContinue ? COLORS.primary : '#D0C8BC',
            color: 'white', fontSize: 15, fontWeight: 600,
            cursor: canContinue ? 'pointer' : 'default', marginTop: 10, fontFamily: 'DM Sans',
          }}
        >
          Continue to Preferences →
        </button>
      </div>
    </div>
  );
}
