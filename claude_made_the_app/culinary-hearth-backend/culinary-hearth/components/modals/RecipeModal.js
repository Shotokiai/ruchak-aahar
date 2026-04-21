'use client';

import { COLORS } from '../../lib/constants';

export default function RecipeModal({ dish, close }) {
  if (!dish) return null;

  return (
    <div className="slide-up" style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, height: '100vh', background: COLORS.bg, zIndex: 200, overflowY: 'auto' }}>
      <div style={{ position: 'relative' }}>
        {dish.img ? (
          <img src={dish.img} alt={dish.name} style={{ width: '100%', height: 248, objectFit: 'cover' }} />
        ) : (
          <div style={{ height: 100, background: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
            🍽
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%,rgba(0,0,0,.22))' }} />
        <button className="tap" onClick={close} style={{ position: 'absolute', top: 48, left: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,.45)', border: 'none', color: 'white', fontSize: 17, cursor: 'pointer' }}>
          ←
        </button>
      </div>
      <div style={{ padding: '18px 20px 100px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 23, fontWeight: 700, marginBottom: 9, lineHeight: 1.2 }}>{dish.name}</h1>
        {dish.desc && <p style={{ color: COLORS.muted, fontStyle: 'italic', fontSize: 12.5, marginBottom: 13, lineHeight: 1.5 }}>{dish.desc}</p>}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['🔥', (dish.cal || 0) + ' kcal'], ['💪', (dish.protein || 0) + 'g'], ['🌾', (dish.carbs || 0) + 'g'], ['🌿', (dish.fiber || 0) + 'g']].map(([ic, v]) => (
            <span key={v} style={{ background: COLORS.light, borderRadius: 50, padding: '5px 11px', fontSize: 12, fontWeight: 500 }}>
              {ic} {v}
            </span>
          ))}
        </div>
        {dish.ingredients && (
          <>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 700, marginBottom: 9 }}>Ingredients</h3>
            <div style={{ background: 'white', borderRadius: 14, padding: '10px 14px', marginBottom: 16 }}>
              {dish.ingredients.map((ing, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < dish.ingredients.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                  <span style={{ color: COLORS.primary, fontWeight: 800, flexShrink: 0 }}>·</span>
                  <span style={{ fontSize: 13.5, lineHeight: 1.4 }}>{ing}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {dish.steps && (
          <>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 700, marginBottom: 10 }}>How to Make</h3>
            {dish.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: COLORS.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.65, paddingTop: 3 }}>{step}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
