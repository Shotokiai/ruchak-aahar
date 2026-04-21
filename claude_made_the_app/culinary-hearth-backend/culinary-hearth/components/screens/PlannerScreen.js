'use client';

import { useState } from 'react';
import { COLORS, DAYS, BASE_DATES, HOURS } from '../../lib/constants';
import { StickyNav, BottomNav } from '../shared/ui';
import AddDishModal from '../modals/AddDishModal';
import RepeatModal from '../modals/RepeatModal';

export default function PlannerScreen({ go, showRecipe, isAdmin, plannedMeals, setPlannedMeals }) {
  const [selDay, setSelDay] = useState(2);
  const [addTarget, setAddTarget] = useState(null);
  const [repeatTarget, setRepeatTarget] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const weekOffset = Math.floor(selDay / 7);
  const dayIdx = selDay % 7;
  const weekStart = weekOffset * 7;
  const dates = BASE_DATES.map((d) => d + weekOffset * 7);

  const key = (abs, h) => `${Math.floor(abs / 7)}_${abs % 7}_${h}`;
  const getMeal = (h) => plannedMeals[key(selDay, h)] || null;
  const addMeal = (h, dish) => setPlannedMeals((p) => ({ ...p, [key(selDay, h)]: { dish, repeat: 'once' } }));
  const removeMeal = (h) => setPlannedMeals((p) => { const n = { ...p }; delete n[key(selDay, h)]; return n; });
  const setRepeatFn = (h, rep) => setPlannedMeals((p) => ({ ...p, [key(selDay, h)]: { ...p[key(selDay, h)], repeat: rep } }));
  const absHasMeal = (abs) => HOURS.some((h) => plannedMeals[key(abs, h)]);
  const rl = { once: '', daily: 'Every day', weekly: 'Every week', monthly: 'Every month' };

  const monthLabel = weekOffset === 0 ? 'April 2025' : weekOffset === 1 ? 'April – Wk 2' : weekOffset === -1 ? 'March – Wk 4' : 'April 2025';
  const prevDay = () => setSelDay((d) => Math.max(0, d - 1));
  const nextDay = () => setSelDay((d) => d + 1);
  const goToday = () => setSelDay(2);

  return (
    <div style={{ paddingBottom: 100, minHeight: '100vh', background: COLORS.bg }} onClick={() => setOpenMenu(null)}>
      <StickyNav left={<span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 21 }}>Meal Plan</span>} />

      <div style={{ background: 'white', margin: '12px 20px', borderRadius: 18, padding: '14px', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 15 }}>📅</span>
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{monthLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              onClick={prevDay}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: COLORS.light,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.text,
                userSelect: 'none',
              }}
            >
              ◀
            </div>
            <span onClick={goToday} style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, cursor: 'pointer', padding: '4px 10px', borderRadius: 20, background: '#FDF5F0' }}>
              Today
            </span>
            <div
              onClick={nextDay}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: COLORS.light,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.text,
                userSelect: 'none',
              }}
            >
              ▶
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
          {DAYS.map((d, i) => {
            const absIdx = weekStart + i;
            return (
              <div key={d} onClick={() => setSelDay(absIdx)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontWeight: 500 }}>{d}</div>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    margin: '0 auto',
                    background: selDay === absIdx ? COLORS.primary : 'transparent',
                    color: selDay === absIdx ? 'white' : COLORS.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: selDay === absIdx ? 700 : 400,
                    fontSize: 13,
                    transition: 'all .2s',
                  }}
                >
                  {dates[i]}
                </div>
                <div style={{ width: '55%', height: 3, borderRadius: 2, background: absHasMeal(absIdx) ? COLORS.primary : '#E0D8CC', margin: '4px auto 0', opacity: 0.7 }} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {HOURS.map((t) => {
          const meal = getMeal(t);
          const mk = `${selDay}_${t}`;
          return (
            <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minHeight: meal ? 94 : 40 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 44, fontSize: 12, color: COLORS.muted, paddingTop: 12, flexShrink: 0, textAlign: 'right' }}>{t}</div>
              <div style={{ flex: 1, borderLeft: `1.5px solid ${COLORS.border}`, paddingLeft: 12, paddingBottom: 4, paddingTop: 8 }}>
                {meal ? (
                  <div style={{ background: 'white', borderRadius: 14, padding: '9px 11px', display: 'flex', gap: 9, alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,.06)', position: 'relative' }}>
                    {meal.dish.img ? (
                      <img src={meal.dish.img} alt="" style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: COLORS.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        🍽
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.dish.name}</div>
                      <div style={{ fontSize: 10.5, color: COLORS.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        🔥{meal.dish.cal} · 💪{meal.dish.protein}g · 🌾{meal.dish.carbs}g · 🌿{meal.dish.fiber}g
                      </div>
                      {meal.repeat && meal.repeat !== 'once' && <div style={{ fontSize: 10, color: COLORS.primary, fontWeight: 600, marginTop: 2 }}>🔄 {rl[meal.repeat]}</div>}
                    </div>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === mk ? null : mk);
                        }}
                        style={{ padding: '3px 6px', cursor: 'pointer', color: COLORS.muted, fontWeight: 900, fontSize: 14, letterSpacing: 1 }}
                      >
                        •••
                      </div>
                      {openMenu === mk && (
                        <div style={{ position: 'absolute', right: 0, top: 24, background: 'white', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,.16)', zIndex: 80, overflow: 'hidden', minWidth: 162 }} onClick={(e) => e.stopPropagation()}>
                          <div
                            onClick={() => {
                              setOpenMenu(null);
                              showRecipe(meal.dish);
                            }}
                            style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}` }}
                          >
                            🍽 View Recipe
                          </div>
                          <div
                            onClick={() => {
                              setOpenMenu(null);
                              setRepeatTarget({ hour: t, meal: meal.dish });
                            }}
                            style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderBottom: isAdmin ? `1px solid ${COLORS.border}` : 'none' }}
                          >
                            🔄 Repeat Schedule
                          </div>
                          {isAdmin && (
                            <div
                              onClick={() => {
                                setOpenMenu(null);
                                removeMeal(t);
                              }}
                              style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#E53935' }}
                            >
                              🗑 Remove
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setAddTarget({ hour: t })}
                    style={{ color: '#C4B8A8', fontSize: 22, cursor: 'pointer', lineHeight: 1, paddingTop: 2, display: 'inline-block' }}
                  >
                    +
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav active="planner" go={go} />
      {addTarget && <AddDishModal onAdd={(d) => { addMeal(addTarget.hour, d); setAddTarget(null); }} onClose={() => setAddTarget(null)} />}
      {repeatTarget && <RepeatModal dishName={repeatTarget.meal.name} onSelect={(rep) => setRepeatFn(repeatTarget.hour, rep)} onClose={() => setRepeatTarget(null)} />}
    </div>
  );
}
