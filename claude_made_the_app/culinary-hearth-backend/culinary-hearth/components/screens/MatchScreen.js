'use client';

import { useState } from 'react';
import { COLORS, VEG_IDS } from '../../lib/constants';
import { StickyNav, BottomNav } from '../shared/ui';

export default function MatchScreen({ go, showRecipe, dishPool, votes, onVote, profile, setPlannedMeals }) {
  const [anim, setAnim] = useState(null);

  // VEG_IDS only applies to static demo dishes (integer IDs 1-5).
  // Imported/DB dishes have UUID or Date.now() IDs — always show them regardless of pref.
  const filtered = (profile?.pref === 'veg' || profile?.pref === 'vegan')
    ? dishPool.filter((d) => typeof d.id !== 'number' || VEG_IDS.includes(d.id))
    : dishPool;
  const unvoted = filtered.filter((d) => votes[d.id] === undefined);
  const current = unvoted[0];
  const likedCount = filtered.filter((d) => votes[d.id] === true).length;
  const voted = filtered.length - unvoted.length;

  const vote = (liked) => {
    if (!current) return;
    setAnim(liked ? 'right' : 'left');
    setTimeout(() => {
      onVote(current.id, liked);
      if (liked) {
        const absDay = 3 + likedCount;
        const weekOff = Math.floor(absDay / 7);
        const dayIdx = absDay % 7;
        setPlannedMeals((p) => {
          const k = `${weekOff}_${dayIdx}_7 PM`;
          if (p[k]) return p;
          return { ...p, [k]: { dish: current, repeat: 'once' } };
        });
      }
      setAnim(null);
    }, 260);
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>
      <StickyNav left={<span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 20, color: COLORS.primary }}>Tonight's Contenders</span>} />
      {current ? (
        <div style={{ flex: 1, padding: '14px 20px 0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {filtered.map((d, i) => {
              const done = votes[d.id] !== undefined;
              return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: done ? COLORS.primary : '#E0D8CC', opacity: done ? 0.4 : 1 }} />;
            })}
          </div>
          <div style={{ flex: 1, marginBottom: 16 }}>
            <div
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                background: 'white',
                transform: anim === 'left' ? 'translateX(-70px) rotate(-9deg)' : anim === 'right' ? 'translateX(70px) rotate(9deg)' : 'none',
                opacity: anim ? 0 : 1,
                transition: 'all .24s cubic-bezier(.4,0,.2,1)',
                boxShadow: '0 10px 40px rgba(0,0,0,.13)',
              }}
            >
              <div style={{ position: 'relative', height: 290 }}>
                <img src={current.img} alt={current.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 52%,rgba(0,0,0,.74))' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1.15, flex: 1 }}>{current.name}</h2>
                    <span style={{ background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(4px)', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0, marginBottom: 3 }}>
                      🔥 {current.cal} kcal
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '12px 18px 18px' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
                  {[
                    ['💪', `${current.protein}g`, 'Protein'],
                    ['🌾', `${current.carbs}g`, 'Carbs'],
                    ['🌿', `${current.fiber}g`, 'Fiber'],
                  ].map(([ic, v, l]) => (
                    <div key={l} style={{ background: COLORS.light, borderRadius: 50, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {ic} <span style={{ color: COLORS.primary }}>{v}</span> <span style={{ color: COLORS.muted, fontWeight: 400, fontSize: 11 }}>{l}</span>
                    </div>
                  ))}
                </div>
                <p style={{ color: COLORS.muted, fontSize: 12.5, fontStyle: 'italic', lineHeight: 1.5, marginBottom: 8 }}>{current.desc}</p>
                <div onClick={() => showRecipe(current)} style={{ textAlign: 'right', color: COLORS.muted, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.7 }}>
                  VIEW RECIPE →
                </div>
              </div>
            </div>
          </div>
          {likedCount > 0 && <div style={{ textAlign: 'center', fontSize: 12, color: COLORS.primary, fontWeight: 600, marginBottom: 6 }}>✓ {likedCount} dish{likedCount > 1 ? 'es' : ''} added to your Planner</div>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, paddingBottom: 8 }}>
            <button className="vote-skip" onClick={() => vote(false)} style={{ width: 64, height: 64, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(0,0,0,.11)', fontSize: 24, color: COLORS.muted }}>
              ✕
            </button>
            <button className="vote-love" onClick={() => vote(true)} style={{ width: 80, height: 80, borderRadius: '50%', background: COLORS.primary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, boxShadow: `0 8px 28px rgba(123,37,37,.4)` }}>
              ❤️
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, color: COLORS.muted, fontSize: 12 }}>
            {unvoted.length} left · {voted} voted
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 54, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>All done!</h3>
          <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 4 }}>You've voted on all {filtered.length} dishes.</p>
          {likedCount > 0 && <p style={{ color: COLORS.primary, fontSize: 13.5, fontWeight: 600, marginBottom: 16 }}>❤️ {likedCount} dish{likedCount > 1 ? 'es' : ''} added to your Planner</p>}
          <button className="tap" onClick={() => go('planner')} style={{ background: COLORS.primary, color: 'white', border: 'none', borderRadius: 50, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', marginBottom: 18 }}>
            View in Planner →
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%' }}>
            {filtered.map((d) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 12, padding: '9px 12px', boxShadow: '0 1px 5px rgba(0,0,0,.04)' }}>
                <img src={d.img} alt={d.name} style={{ width: 38, height: 38, borderRadius: 9, objectFit: 'cover' }} />
                <span style={{ flex: 1, fontWeight: 500, fontSize: 13.5, textAlign: 'left' }}>{d.name}</span>
                <span style={{ fontSize: 18 }}>{votes[d.id] ? '❤️' : '✕'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <BottomNav active="match" go={go} />
    </div>
  );
}
