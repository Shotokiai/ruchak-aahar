'use client';

import { useState } from 'react';
import { COLORS, calcTarget } from '../../lib/constants';
import { api } from '../../lib/api';

export default function Onboarding3({ go, profile, setProfile }) {
  const [activity, setActivity] = useState('sedentary');
  const [bodyGoal, setBodyGoal] = useState('fit');

  const activityOpts = [
    { id: 'sedentary', label: 'Sedentary', sub: 'Little or no exercise', icon: '🪑', burn: '~0 extra kcal/day', detail: 'Office job, no gym' },
    { id: 'light', label: 'Light Activity', sub: '2–3 days/week gym or walk', icon: '🚶', burn: '300–500 kcal/day', detail: 'Light workouts or daily walks' },
    { id: 'moderate', label: 'Moderate', sub: '4–5 days/week workout', icon: '🏋️', burn: '500–700 kcal/day', detail: 'Regular training sessions' },
  ];

  const bodyOpts = [
    { id: 'lean', label: 'Lean', sub: 'Lose fat', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80' },
    { id: 'fit', label: 'Fit', sub: 'Stay toned', img: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=300&q=80' },
    { id: 'athletic', label: 'Athletic', sub: 'Build muscle', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&q=80' },
  ];

  const { maintenance, target } = calcTarget(profile.age || 25, profile.weightKg || 70, profile.heightCm || 170, activity, bodyGoal);

  return (
    <div className="slide-up" style={{ minHeight: '100vh', background: COLORS.bg }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: COLORS.bg, padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div
            className="tap"
            onClick={() => go('onboarding2')}
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
            <div style={{ fontSize: 12, color: COLORS.muted }}>Step 3 of 3</div>
          </div>
        </div>
        <div style={{ height: 4, background: '#E0D8CC', borderRadius: 2 }}>
          <div style={{ height: '100%', width: '100%', background: COLORS.primary, borderRadius: 2 }} />
        </div>
      </div>

      <div style={{ padding: '18px 20px 40px' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, marginBottom: 14 }}>
          Activity <span style={{ color: COLORS.primary }}>Level</span>
        </h2>
        <div style={{ marginBottom: 22 }}>
          {activityOpts.map((o) => (
            <div
              key={o.id}
              className="tap"
              onClick={() => setActivity(o.id)}
              style={{
                background: 'white',
                borderRadius: 16,
                padding: '14px 16px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                border: `2px solid ${activity === o.id ? COLORS.primary : 'transparent'}`,
                transition: 'all .2s',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: activity === o.id ? '#FDF5F0' : COLORS.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {o.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: activity === o.id ? COLORS.primary : COLORS.text }}>
                  {o.label}
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 1 }}>{o.sub}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: activity === o.id ? COLORS.primary : COLORS.muted }}>
                  {o.burn}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, marginBottom: 12 }}>
          Body <span style={{ color: COLORS.primary }}>Goal</span>
        </h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {bodyOpts.map((o) => (
            <div
              key={o.id}
              className="tap"
              onClick={() => setBodyGoal(o.id)}
              style={{
                flex: 1,
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                border: `3px solid ${bodyGoal === o.id ? COLORS.primary : 'transparent'}`,
                transition: 'all .2s',
                position: 'relative',
              }}
            >
              <img src={o.img} alt={o.label} style={{ width: '100%', height: 130, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: bodyGoal === o.id ? 'rgba(123,37,37,.15)' : 'rgba(0,0,0,.15)' }} />
              <div style={{ background: bodyGoal === o.id ? COLORS.primary : 'rgba(0,0,0,.55)', padding: '7px 6px', textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{o.label}</div>
                <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 10, marginTop: 1 }}>{o.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="tap"
          onClick={async () => {
            try {
              const result = await api.saveProfile({
                dob:            profile.dob,
                weight_kg:      profile.weightKg,
                height_cm:      profile.heightCm,
                food_pref:      profile.pref || 'nonveg',
                allergies:      profile.allergies || [],
                activity_level: activity,
                body_goal:      bodyGoal,
              });
              setProfile((p) => ({ ...p, activity, bodyGoal, maintenance: result.maintenance, target: result.target }));
            } catch (e) {
              console.error('Profile save failed:', e);
              setProfile((p) => ({ ...p, activity, bodyGoal, maintenance, target }));
            }
            go('createjoin');
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
          Complete Setup →
        </button>
      </div>
    </div>
  );
}
