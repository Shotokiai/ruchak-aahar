'use client';

import { useState } from 'react';
import { COLORS } from '../../lib/constants';

// Shows dishes that the current user has imported/added
export default function NotificationsScreen({ go, dishPool }) {
  // Filter to show only dishes the user has added (imported from URLs)
  // In a real app, this would come from database with user_id filter
  const userDishes = dishPool?.filter((d) => d.source_url) || [];

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: `1px solid ${COLORS.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="tap"
            onClick={() => go('hearth')}
            style={{ width: 34, height: 34, borderRadius: '50%', background: COLORS.light, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
          >←</div>
          <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 17 }}>Notifications</span>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {userDishes.length === 0 ? (
          // Empty state
          <div style={{ textAlign: 'center', padding: '60px 20px', marginTop: 40 }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>📝</div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No dishes imported yet</h3>
            <p style={{ color: COLORS.muted, fontSize: 13.5, lineHeight: 1.6, marginBottom: 20 }}>
              Search or paste a recipe link in the search bar to add dishes to your family pool. They'll appear here!
            </p>
            <button
              onClick={() => go('hearth')}
              style={{
                background: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: 50,
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'DM Sans',
              }}
            >
              Go to Search
            </button>
          </div>
        ) : (
          // Dishes list
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {userDishes.map((dish) => (
              <div
                key={dish.id}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,.06)',
                  display: 'flex',
                  gap: 12,
                }}
              >
                {/* Dish image */}
                {dish.img && (
                  <img src={dish.img} alt={dish.name} style={{ width: 80, height: 80, objectFit: 'cover', flexShrink: 0 }} />
                )}

                {/* Dish info */}
                <div style={{ flex: 1, padding: '12px 0 12px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text, marginBottom: 2 }}>
                    {dish.name}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
                    {dish.cal} kcal • {dish.protein}g protein
                  </div>
                  <span style={{ fontSize: 11, color: COLORS.primary, fontWeight: 600 }}>
                    ✓ Added to pool
                  </span>
                </div>

                {/* Padding on right */}
                <div style={{ width: 12, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
