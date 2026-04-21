'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';

const C = {
  bg: '#F5EFE0', primary: '#7B2525', dark: '#1A1A1A', card: '#FFFFFF',
  text: '#1A1A1A', muted: '#9A8E82', green: '#4CAF50', border: '#E8DDD0', light: '#F0E8DC',
};

const calcTarget = (age, wKg, hCm, activity = 'sedentary', bodyGoal = 'fit', gender = 'm') => {
  const bmr = gender === 'm'
    ? 10 * wKg + 6.25 * hCm - 5 * age + 5
    : 10 * wKg + 6.25 * hCm - 5 * age - 161;
  const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55 };
  const maint = Math.round(bmr * (mult[activity] || 1.2) / 10) * 10;
  const adj = { lean: -400, fit: 0, athletic: 250 };
  return { maintenance: maint, target: maint + (adj[bodyGoal] || 0) };
};

const DISH_POOL = [
  { id: 1, name: 'Dal Makhani', img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80', protein: 32, carbs: 18, fiber: 6, cal: 280, desc: '"Yeh sirf dal nahi, emotional support system hai foodie logon ka"', ingredients: ['1 cup whole black lentils', '¼ cup kidney beans', '2 tbsp butter', '1 cup tomato puree', '1 tsp cumin', '½ cup cream', 'Salt'], steps: ['Soak lentils overnight', 'Pressure cook 6-8 whistles', 'Cook butter + tomato till oil separates', 'Add cream + lentils, simmer 25 mins', 'Garnish with cream, serve hot'] },
  { id: 2, name: 'Roasted Salmon', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80', protein: 38, carbs: 15, fiber: 9, cal: 320, desc: '"Light, fresh, 20-min prep. Perfect weeknight dinner."', ingredients: ['2 salmon fillets', 'Asparagus', 'Baby spinach', '1 lemon', 'Olive oil', 'Garlic'], steps: ['Preheat oven 200°C', 'Season salmon with garlic, lemon, salt', 'Roast 15-18 mins', 'Sauté spinach', 'Plate with lemon wedge'] },
  { id: 3, name: 'Butter Chicken', img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80', protein: 28, carbs: 22, fiber: 4, cal: 340, desc: '"The OG comfort food. A warm hug in curry form."', ingredients: ['500g chicken', '200ml cream', 'Tomato puree', '3 tbsp butter', 'Garam masala'], steps: ['Marinate chicken 1hr', 'Grill till charred', 'Butter + tomato sauce', 'Add cream 15 mins', 'Add chicken 10 mins'] },
  { id: 4, name: 'Paneer Tikka', img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80', protein: 24, carbs: 14, fiber: 3, cal: 260, desc: '"Vegetarians deserve drama too — every single time."', ingredients: ['400g paneer', 'Yogurt', 'Tikka masala', 'Capsicum', 'Lemon'], steps: ['Marinate 2 hours', 'Thread on skewers', 'Grill 10-12 mins', 'Chaat masala + lemon', 'Mint chutney'] },
  { id: 5, name: 'Chicken Biryani', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80', protein: 35, carbs: 52, fiber: 5, cal: 480, desc: '"Sunday ki feeling, any day of the week."', ingredients: ['500g chicken', '2 cups basmati', 'Whole spices', 'Saffron milk', 'Fried onions', 'Ghee'], steps: ['Marinate chicken 3hrs', 'Par-cook rice 70%', 'Layer in pot', 'Add saffron milk + onions', 'Dum cook 25-30 mins'] },
];

/* ── Icons ── */
const HouseIcon = ({ a }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9L12 2L21 9V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9Z" stroke={a ? C.primary : C.muted} strokeWidth="2" fill={a ? C.primary : 'none'} /></svg>;
const MatchIcon = ({ a }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 3 15 3 8.5C3 6 5 4 7.5 4C9.24 4 10.91 4.96 12 6.5C13.09 4.96 14.76 4 16.5 4C19 4 21 6 21 8.5C21 15 12 21 12 21Z" stroke={a ? C.primary : C.muted} strokeWidth="2" fill={a ? C.primary : 'none'} /></svg>;
const PlanIcon = ({ a }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={a ? C.primary : C.muted} strokeWidth="2" /><path d="M16 2V6M8 2V6M3 10H21" stroke={a ? C.primary : C.muted} strokeWidth="2" strokeLinecap="round" /><circle cx="8" cy="15" r="1.5" fill={a ? C.primary : C.muted} /><circle cx="12" cy="15" r="1.5" fill={a ? C.primary : C.muted} /></svg>;
const GoogleG = () => <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>;

/* ── Bottom Nav ── */
const BottomNav = ({ active, go }) => (
  <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'white', borderTop: `1px solid ${C.border}`, padding: '12px 8px 22px', display: 'flex', justifyContent: 'space-around', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,.06)' }}>
    {[{ id: 'hearth', label: 'Hearth', ic: <HouseIcon a={active === 'hearth'} /> }, { id: 'match', label: 'Match', ic: <MatchIcon a={active === 'match'} /> }, { id: 'planner', label: 'Planner', ic: <PlanIcon a={active === 'planner'} /> }].map(t => (
      <div key={t.id} className="tap" onClick={() => go(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', opacity: active === t.id ? 1 : .5, transition: 'opacity .2s' }}>
        {t.ic}
        <span style={{ fontSize: 11, color: active === t.id ? C.primary : C.muted, fontWeight: active === t.id ? 700 : 400 }}>{t.label}</span>
      </div>
    ))}
  </div>
);

const StickyNav = ({ left, right }) => (
  <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
    <div style={{ flex: 1 }}>{left}</div>{right || <div style={{ width: 38 }} />}
  </div>
);

const SliderCard = ({ label, val, display, set, min, max, lo, hi }) => (
  <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
      <span style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700, color: C.primary }}>{display || val}</span>
    </div>
    <input type="range" min={min} max={max} value={val} onChange={e => set(+e.target.value)} />
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginTop: 6 }}><span>{lo}</span><span>{hi}</span></div>
  </div>
);

/* ══ WELCOME ══ */
const WelcomeScreen = ({ go }) => {
  const [slide, setSlide] = useState(0);
  const slides = [
    { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80', title: 'No more dinner debates', desc: 'Turn "What\'s for dinner?" into a celebration. We handle the consensus so you can focus on the cooking.' },
    { img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80', title: 'AI-powered recipe extraction', desc: 'Paste a reel or blog link — we extract the dish, ingredients and nutrition instantly.' },
    { img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80', title: 'Family-wide voting', desc: 'Give everyone a seat at the table. Vote on the weekly menu and find meals everyone loves.' },
  ];
  useEffect(() => { const t = setInterval(() => setSlide(s => (s + 1) % 3), 3800); return () => clearInterval(t); }, []);
  const s = slides[slide];
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '52px 24px 40px', background: C.bg }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 26 }}>
        <div style={{ width: 54, height: 54, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(123,37,37,.3)' }}>
          <span style={{ fontSize: 26, color: 'white' }}>🍽</span>
        </div>
        <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, color: C.primary }}>The Culinary Hearth</span>
      </div>
      <div style={{ borderRadius: 28, overflow: 'hidden', height: 254, marginBottom: 24, boxShadow: '0 12px 32px rgba(0,0,0,.14)' }}>
        <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1, minHeight: 86 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700, marginBottom: 9, lineHeight: 1.25, textAlign: 'center' }}>{s.title}</h1>
        <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.65, textAlign: 'center' }}>{s.desc}</p>
      </div>
      <div style={{ display: 'flex', gap: 7, justifyContent: 'center', margin: '14px 0 20px' }}>
        {[0, 1, 2].map(i => <div key={i} onClick={() => setSlide(i)} style={{ height: 6, borderRadius: 3, background: i === slide ? C.primary : '#D8CFBF', width: i === slide ? 28 : 8, transition: 'all .3s', cursor: 'pointer' }} />)}
      </div>
      <button className="tap" onClick={() => signIn('google', { callbackUrl: '/' })} style={{ width: '100%', padding: '15px', borderRadius: 50, border: '2px solid #1A1A1A', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>
        <GoogleG /> Sign in with Google
      </button>
    </div>
  );
};

/* ══ ONBOARDING 1 ══ */
const Onboarding1 = ({ go, setProfile }) => {
  const [age, setAge] = useState(25);
  const [wt, setWt] = useState(70);
  const [ht, setHt] = useState(170);
  const [unit, setUnit] = useState('cm');
  const cmToFt = cm => { const t = Math.round(cm / 2.54); return `${Math.floor(t / 12)}'${t % 12}"`; };
  return (
    <div className="slide-up" style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.bg, padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div className="tap" onClick={() => go('welcome')} style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8DDD0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>✕</div>
          <div><div style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 15 }}>Personalize Your Hearth</div><div style={{ fontSize: 12, color: C.muted }}>Step 1 of 3</div></div>
        </div>
        <div style={{ height: 4, background: '#E0D8CC', borderRadius: 2, marginBottom: 0 }}><div style={{ height: '100%', width: '33%', background: C.primary, borderRadius: 2 }} /></div>
      </div>
      <div style={{ padding: '20px 20px 40px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 27, fontWeight: 700, marginBottom: 22, lineHeight: 1.3 }}>Let's get to know <span style={{ color: C.primary }}>the chef.</span></h1>
        <SliderCard label="What is your age?" val={age} set={setAge} min={13} max={80} lo="13 yrs" hi="80 yrs" />
        <SliderCard label="Body weight" val={wt} display={`${wt} kg`} set={setWt} min={30} max={150} lo="30 kg" hi="150 kg" />
        <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Height</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['cm', 'inch'].map(u => <span key={u} onClick={() => setUnit(u)} style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, background: unit === u ? C.dark : '#F0E8DC', color: unit === u ? 'white' : C.muted, cursor: 'pointer', fontWeight: 500, transition: 'all .2s' }}>{u}</span>)}
              </div>
            </div>
            <span style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700, color: C.primary }}>{unit === 'cm' ? `${ht} cm` : cmToFt(ht)}</span>
          </div>
          <input type="range" min={130} max={220} value={ht} onChange={e => setHt(+e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginTop: 6 }}><span>{unit === 'cm' ? '130 cm' : "4'3\""}</span><span>{unit === 'cm' ? '220 cm' : "7'2\""}</span></div>
        </div>
        <button className="tap" onClick={() => { setProfile(p => ({ ...p, age, weightKg: wt, heightCm: ht })); go('onboarding2'); }} style={{ width: '100%', padding: '15px', borderRadius: 50, border: 'none', background: C.primary, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 10, fontFamily: 'DM Sans' }}>Continue to Preferences →</button>
      </div>
    </div>
  );
};

/* ══ ONBOARDING 2 ══ */
const Onboarding2 = ({ go, setProfile }) => {
  const [pref, setPref] = useState('nonveg');
  const [allergies, setAllergies] = useState([]);
  const prefOpts = [{ id: 'veg', emoji: '🥗', label: 'Veg', desc: 'Plant-based including dairy' }, { id: 'nonveg', emoji: '🍗', label: 'Non-Veg', desc: 'Meat, poultry, seafood' }, { id: 'vegan', emoji: '🥑', label: 'Vegan', desc: 'Strict plant-based' }];
  const allergyOpts = [
    { id: 'dairy', label: 'Dairy 🥛', sub: 'Milk, cheese, butter' }, { id: 'gluten', label: 'Gluten 🌾', sub: 'Wheat, rye, barley' },
    { id: 'nuts', label: 'Tree Nuts 🥜', sub: 'Almonds, walnuts, cashews' }, { id: 'eggs', label: 'Eggs 🥚', sub: 'All egg products' },
    { id: 'shellfish', label: 'Shellfish 🦐', sub: 'Shrimp, crab, lobster' }, { id: 'soy', label: 'Soy 🫘', sub: 'Tofu, edamame, soy milk' },
    { id: 'fish', label: 'Fish 🐟', sub: 'All fish varieties' }, { id: 'none', label: 'No Allergies ✅', sub: 'I can eat everything' },
  ];
  const toggle = id => { if (id === 'none') { setAllergies(['none']); return; } setAllergies(a => { const n = a.filter(x => x !== 'none'); return n.includes(id) ? n.filter(x => x !== id) : [...n, id]; }); };
  return (
    <div className="slide-up" style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.bg, padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div className="tap" onClick={() => go('onboarding1')} style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8DDD0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>←</div>
          <div><div style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 15 }}>Personalize Your Hearth</div><div style={{ fontSize: 12, color: C.muted }}>Step 2 of 3</div></div>
        </div>
        <div style={{ height: 4, background: '#E0D8CC', borderRadius: 2 }}><div style={{ height: '100%', width: '66%', background: C.primary, borderRadius: 2 }} /></div>
      </div>
      <div style={{ padding: '18px 20px 40px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>Food <span style={{ color: C.primary }}>Preferences</span></h1>
        <p style={{ color: C.muted, fontSize: 13.5, marginBottom: 16 }}>Choose your diet type and any food allergies</p>
        <div style={{ marginBottom: 18 }}>
          {prefOpts.map(o => (
            <div key={o.id} className="tap" onClick={() => setPref(o.id)} style={{ background: 'white', borderRadius: 16, padding: '12px 16px', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', border: `2px solid ${pref === o.id ? C.primary : 'transparent'}`, transition: 'border .2s' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{o.emoji}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{o.label}</div><div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{o.desc}</div></div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: pref === o.id ? C.primary : 'transparent', border: `2px solid ${pref === o.id ? C.primary : '#D0C8BC'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {pref === o.id && <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>✓</span>}
              </div>
            </div>
          ))}
        </div>
        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>Any <span style={{ color: C.primary }}>food allergies</span>?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
          {allergyOpts.map(o => { const sel = allergies.includes(o.id); return (
            <div key={o.id} className="tap" onClick={() => toggle(o.id)} style={{ background: sel ? '#FDF5F0' : 'white', borderRadius: 14, padding: '10px 12px', cursor: 'pointer', border: `2px solid ${sel ? C.primary : 'transparent'}`, transition: 'all .2s' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: sel ? C.primary : C.text, marginBottom: 2 }}>{o.label}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.35 }}>{o.sub}</div>
            </div>
          ); })}
        </div>
        <button className="tap" onClick={() => { setProfile(p => ({ ...p, pref, allergies })); go('onboarding3'); }} style={{ width: '100%', padding: '15px', borderRadius: 50, border: 'none', background: C.primary, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>Continue →</button>
      </div>
    </div>
  );
};

/* ══ ONBOARDING 3 ══ */
const Onboarding3 = ({ go, profile, setProfile }) => {
  const [activity, setActivity] = useState('sedentary');
  const [bodyGoal, setBodyGoal] = useState('fit');
  const activityOpts = [
    { id: 'sedentary', label: 'Sedentary', sub: 'Little or no exercise', icon: '🪑', burn: '~0 extra kcal/day' },
    { id: 'light', label: 'Light Activity', sub: '2–3 days/week gym or walk', icon: '🚶', burn: '300–500 kcal/day' },
    { id: 'moderate', label: 'Moderate', sub: '4–5 days/week workout', icon: '🏋️', burn: '500–700 kcal/day' },
  ];
  const bodyOpts = [
    { id: 'lean', label: 'Lean', sub: 'Lose fat', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80' },
    { id: 'fit', label: 'Fit', sub: 'Stay toned', img: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=300&q=80' },
    { id: 'athletic', label: 'Athletic', sub: 'Build muscle', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&q=80' },
  ];
  const { maintenance, target } = calcTarget(profile.age || 25, profile.weightKg || 70, profile.heightCm || 170, activity, bodyGoal);
  return (
    <div className="slide-up" style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.bg, padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div className="tap" onClick={() => go('onboarding2')} style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8DDD0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>←</div>
          <div><div style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 15 }}>Personalize Your Hearth</div><div style={{ fontSize: 12, color: C.muted }}>Step 3 of 3</div></div>
        </div>
        <div style={{ height: 4, background: '#E0D8CC', borderRadius: 2 }}><div style={{ height: '100%', width: '100%', background: C.primary, borderRadius: 2 }} /></div>
      </div>
      <div style={{ padding: '18px 20px 40px' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, marginBottom: 14 }}>Activity <span style={{ color: C.primary }}>Level</span></h2>
        <div style={{ marginBottom: 22 }}>
          {activityOpts.map(o => (
            <div key={o.id} className="tap" onClick={() => setActivity(o.id)} style={{ background: 'white', borderRadius: 16, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', border: `2px solid ${activity === o.id ? C.primary : 'transparent'}`, transition: 'all .2s' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: activity === o.id ? '#FDF5F0' : C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{o.icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14, color: activity === o.id ? C.primary : C.text }}>{o.label}</div><div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{o.sub}</div></div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}><div style={{ fontSize: 11.5, fontWeight: 700, color: activity === o.id ? C.primary : C.muted }}>{o.burn}</div></div>
            </div>
          ))}
        </div>
        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, marginBottom: 12 }}>Body <span style={{ color: C.primary }}>Goal</span></h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {bodyOpts.map(o => (
            <div key={o.id} className="tap" onClick={() => setBodyGoal(o.id)} style={{ flex: 1, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', border: `3px solid ${bodyGoal === o.id ? C.primary : 'transparent'}`, transition: 'all .2s', position: 'relative' }}>
              <img src={o.img} alt={o.label} style={{ width: '100%', height: 130, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: bodyGoal === o.id ? 'rgba(123,37,37,.15)' : 'rgba(0,0,0,.15)' }} />
              <div style={{ background: bodyGoal === o.id ? C.primary : 'rgba(0,0,0,.55)', padding: '7px 6px', textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{o.label}</div>
                <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 10, marginTop: 1 }}>{o.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: 14, padding: '12px 16px', marginBottom: 18, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: C.muted }}>Your daily target</div>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, color: C.primary }}>{target} kcal</div>
        </div>
        <button className="tap" onClick={() => { setProfile(p => ({ ...p, activity, bodyGoal, maintenance, target })); go('createjoin'); }} style={{ width: '100%', padding: '15px', borderRadius: 50, border: 'none', background: C.primary, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>Complete Setup →</button>
      </div>
    </div>
  );
};

/* ══ JOIN CODE ══ */
const JoinCodeScreen = ({ go }) => {
  const [code, setCode] = useState('');
  const [found, setFound] = useState(false);
  const [joining, setJoining] = useState(false);
  useEffect(() => setFound(code.length === 6), [code]);
  return (
    <div className="slide-up" style={{ padding: '52px 24px 40px', minHeight: '100vh', background: C.bg }}>
      <div className="tap" onClick={() => go('createjoin')} style={{ width: 38, height: 38, borderRadius: '50%', background: '#E8DDD0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 24, fontSize: 16 }}>←</div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28, boxShadow: '0 8px 24px rgba(123,37,37,.3)' }}>🔑</div>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700 }}>Join a Family Room</h1>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 6 }}>Enter the 6-char code your family shared</p>
      </div>
      <div style={{ background: 'white', borderRadius: 18, padding: '18px 20px', marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 8, letterSpacing: .5 }}>INVITE CODE</label>
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} placeholder="DISH42" maxLength={6} style={{ width: '100%', border: 'none', outline: 'none', fontSize: 36, fontFamily: 'Playfair Display', fontWeight: 700, letterSpacing: 8, color: C.primary, background: 'transparent', textAlign: 'center' }} />
      </div>
      {found && !joining && <div style={{ background: '#FFF8E1', borderRadius: 12, padding: '10px 14px', marginBottom: 12, color: '#B57F00', fontSize: 13.5, textAlign: 'center' }}>✓ Found: <strong>Sharma Family</strong> · 3 members</div>}
      {joining && <div style={{ background: '#E8F5E9', borderRadius: 12, padding: '10px 14px', marginBottom: 12, color: '#2E7D32', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>Joining…</div>}
      <button className="tap" onClick={() => { if (found) { setJoining(true); setTimeout(() => go('hearth'), 1100); } }} style={{ width: '100%', padding: '15px', borderRadius: 50, border: 'none', background: found ? C.primary : '#D0C8BC', color: 'white', fontSize: 15, fontWeight: 600, cursor: found ? 'pointer' : 'default', fontFamily: 'DM Sans', transition: 'background .2s' }}>Join Room</button>
    </div>
  );
};

/* ══ CREATE/JOIN ══ */
const CreateJoinScreen = ({ go, userName }) => {
  const [mode, setMode] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [copied, setCopied] = useState(false);
  if (mode === 'create') return (
    <div className="slide-up" style={{ padding: '52px 24px 40px', minHeight: '100vh', background: C.bg }}>
      <div className="tap" onClick={() => setMode(null)} style={{ width: 38, height: 38, borderRadius: '50%', background: '#E8DDD0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 22, fontSize: 16 }}>←</div>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create your <span style={{ color: C.primary }}>Family Room</span></h1>
      <p style={{ color: C.muted, marginBottom: 22, fontSize: 14 }}>Name your hearth and invite your family</p>
      <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: .5 }}>FAMILY ROOM NAME</label>
        <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="e.g. Sharma Family" style={{ width: '100%', border: 'none', outline: 'none', fontSize: 16, fontFamily: 'DM Sans', color: C.text, background: 'transparent' }} />
      </div>
      {roomName.length > 1 && (
        <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 8, letterSpacing: .5 }}>YOUR INVITE CODE</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Playfair Display', fontSize: 34, fontWeight: 700, letterSpacing: 6, color: C.primary }}>DISH42</span>
            <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 16px', borderRadius: 20, background: copied ? '#4CAF50' : C.dark, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background .3s' }}>{copied ? '✓ Copied' : 'Copy'}</button>
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 7 }}>Share this with your family to invite them</p>
        </div>
      )}
      <button className="tap" onClick={() => go('hearth')} style={{ width: '100%', padding: '15px', borderRadius: 50, border: 'none', background: roomName.length > 1 ? C.primary : '#D0C8BC', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>Create Room & Continue</button>
    </div>
  );
  return (
    <div className="fade-in" style={{ padding: '52px 24px 40px', minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 30, boxShadow: '0 8px 24px rgba(123,37,37,.3)' }}>🍽</div>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700 }}>Welcome, <span style={{ color: C.primary }}>{userName || 'Chef'}</span>!</h1>
        <p style={{ color: C.muted, marginTop: 6, fontSize: 14 }}>Set up your family hearth.</p>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="tap" onClick={() => setMode('create')} style={{ background: C.primary, borderRadius: 20, padding: '22px', cursor: 'pointer', boxShadow: '0 8px 28px rgba(123,37,37,.28)' }}>
          <div style={{ fontSize: 30, marginBottom: 7 }}>🏡</div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 17, fontFamily: 'Playfair Display', marginBottom: 3 }}>Create Family Room</div>
          <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 13 }}>Start your hearth as Admin</div>
        </div>
        <div className="tap" onClick={() => go('joincode')} style={{ background: 'white', borderRadius: 20, padding: '22px', cursor: 'pointer', border: `2px solid ${C.border}` }}>
          <div style={{ fontSize: 30, marginBottom: 7 }}>🔑</div>
          <div style={{ fontWeight: 700, fontSize: 17, fontFamily: 'Playfair Display', marginBottom: 3 }}>Join Family Room</div>
          <div style={{ color: C.muted, fontSize: 13 }}>Enter an invite code from your family</div>
        </div>
      </div>
    </div>
  );
};

/* ── Toggle ── */
const Toggle = ({ on, onToggle }) => (
  <div onClick={e => { e.stopPropagation(); onToggle(); }} style={{ width: 46, height: 26, borderRadius: 13, background: on ? C.green : '#D0C8BC', position: 'relative', cursor: 'pointer', transition: 'background .25s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .25s' }} />
  </div>
);

/* ── Member Menu Modal ── */
const MemberMenuModal = ({ member, isAdmin, allMembers, onClose, onToggleEating, onSetCook }) => {
  const [showCookPicker, setShowCookPicker] = useState(false);
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 150 }} />
      <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 36px', zIndex: 160 }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#E0D8CC', margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: member.color || '#D4956A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white' }}>{member.initials}</div>
          <div><div style={{ fontFamily: 'Playfair Display', fontSize: 17, fontWeight: 700 }}>{member.name}</div><div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{member.role === 'admin' ? 'Admin' : 'Member'}</div></div>
        </div>
        {!showCookPicker ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 14, background: '#F9F6F2', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Eating tonight?</div>
                <div style={{ fontSize: 12, color: C.muted }}>{member.eating ? 'Currently marked as eating' : 'Currently skipping tonight'}</div>
              </div>
              <Toggle on={member.eating} onToggle={() => { onToggleEating(); }} />
            </div>
            {isAdmin && (
              <div className="tap" onClick={() => setShowCookPicker(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 14, background: '#F9F6F2', cursor: 'pointer' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>👨‍🍳 Who's cooking tonight?</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Transfer cooking duty to another member</div>
                </div>
                <span style={{ fontSize: 14, color: C.muted }}>›</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor: 'pointer' }} onClick={() => setShowCookPicker(false)}>
              <span style={{ fontSize: 14, color: C.primary }}>‹</span>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.primary }}>Who's cooking tonight?</div>
            </div>
            <p style={{ fontSize: 12.5, color: C.muted, marginBottom: 12 }}>Select the member who will cook tonight's dinner</p>
            {allMembers.map(m => (
              <div key={m.id} className="tap" onClick={() => { onSetCook(m.id); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 13, marginBottom: 8, background: m.isCook ? '#FDF5F0' : '#F9F6F2', border: `2px solid ${m.isCook ? C.primary : 'transparent'}`, cursor: 'pointer', transition: 'all .2s' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.color || '#D4956A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>{m.initials}</div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name}</div><div style={{ fontSize: 11.5, color: C.muted }}>{m.role === 'admin' ? 'Admin' : 'Member'}</div></div>
                {m.isCook && <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>COOKING</span>}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};

/* ══ PROFILE SCREEN ══ */
const ProfileScreen = ({ go, profile, setProfile }) => {
  const [editMode, setEditMode] = useState(null);
  const [activity, setActivity] = useState(profile?.activity || 'sedentary');
  const [bodyGoal, setBodyGoal] = useState(profile?.bodyGoal || 'fit');
  
  const age = profile?.age || (profile?.dob ? Math.floor((new Date() - new Date(profile.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null);
  const PREF_LABEL = { veg: 'Vegetarian 🥗', nonveg: 'Non-Vegetarian 🍗', vegan: 'Vegan 🥑' };
  const ACTIVITY_LABEL = { sedentary: 'Sedentary 🪑', light: 'Light Activity 🚶', moderate: 'Moderate 🏋️' };
  const GOAL_LABEL = { lean: 'Lean — Lose fat', fit: 'Fit — Stay toned', athletic: 'Athletic — Build muscle' };
  
  const Row = ({ label, value }) => <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: `1px solid ${C.border}` }}><span style={{ fontSize: 13.5, color: C.muted }}>{label}</span><span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{value ?? '—'}</span></div>;
  const Section = ({ title, onEdit, children }) => (
    <div style={{ background: 'white', borderRadius: 20, padding: '6px 18px', marginBottom: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0 4px' }}>
        <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.6 }}>{title}</div>
        {onEdit && <button onClick={onEdit} style={{ background: C.light, border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: C.primary, cursor: 'pointer', fontFamily: 'DM Sans' }}>Edit</button>}
      </div>
      {children}
    </div>
  );

  const handleLogout = async () => {
    // In real app, call signOut here
    go('welcome');
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 100 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
        <div className="tap" onClick={() => go('hearth')} style={{ width: 34, height: 34, borderRadius: '50%', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>←</div>
        <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 17 }}>My Profile</span>
      </div>

      <div style={{ padding: '24px 16px 0' }}>
        {/* Identity card */}
        <div style={{ background: 'white', borderRadius: 24, padding: '22px 20px', marginBottom: 14, boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${C.primary}`, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'white', fontWeight: 700 }}>👤</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 19, fontWeight: 700, marginBottom: 3 }}>Chef</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 4 }}>user@culinary.app</div>
              {age && <div style={{ fontSize: 11.5, color: C.muted }}>🎂 {age} years old</div>}
            </div>
          </div>
        </div>

        {/* Body metrics */}
        <Section title="BODY METRICS" onEdit={() => setEditMode('body')}>
          <Row label="Age" value={age != null ? `${age} years` : '—'} />
          <Row label="Weight" value={profile?.weightKg ? `${profile.weightKg} kg` : '—'} />
          <Row label="Height" value={profile?.heightCm ? `${profile.heightCm} cm` : '—'} />
        </Section>

        {/* Food preferences */}
        <Section title="FOOD PREFERENCES" onEdit={() => setEditMode('food')}>
          <Row label="Diet type" value={PREF_LABEL[profile?.pref] || '—'} />
          <Row label="Allergies" value={profile?.allergies?.length ? profile.allergies.join(', ') : 'None'} />
        </Section>

        {/* Fitness & goals */}
        <Section title="FITNESS & GOALS" onEdit={() => setEditMode('fitness')}>
          <Row label="Activity level" value={ACTIVITY_LABEL[profile?.activity] || '—'} />
          <Row label="Body goal" value={GOAL_LABEL[profile?.bodyGoal] || '—'} />
          <Row label="Maintenance" value={profile?.maintenance ? `${profile.maintenance} kcal/day` : '—'} />
        </Section>

        {/* Help & Support */}
        <a href="https://wa.me/919136906129" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 14 }}>
          <div style={{ background: '#25D366', borderRadius: 20, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 18px rgba(37,211,102,.3)' }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>💬</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>WhatsApp Support</div>
              <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 12.5 }}>Tap to chat with us directly</div>
            </div>
            <div style={{ color: 'white', fontSize: 18, opacity: 0.7 }}>→</div>
          </div>
        </a>

        {/* Logout */}
        <button className="tap" onClick={handleLogout} style={{ width: '100%', padding: '15px', borderRadius: 50, border: '2px solid #E53935', background: 'white', color: '#E53935', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🚪</span> Log Out
        </button>
        <div style={{ height: 16 }} />
      </div>

      {/* Edit Sheet */}
      {editMode && (
        <>
          <div onClick={() => setEditMode(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200 }} />
          <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 38px', zIndex: 210, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 14px' }} />
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ flex: 1, fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 18 }}>{editMode === 'body' ? 'Body Metrics' : editMode === 'food' ? 'Food Preferences' : 'Fitness & Goals'}</div>
              <div onClick={() => setEditMode(null)} style={{ cursor: 'pointer', color: C.muted, fontSize: 22 }}>×</div>
            </div>

            {editMode === 'fitness' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  {[{ id: 'sedentary', icon: '🪑', label: 'Sedentary', sub: 'Little or no exercise' }, { id: 'light', icon: '🚶', label: 'Light Activity', sub: '2–3 days/week' }, { id: 'moderate', icon: '🏋️', label: 'Moderate', sub: '4–5 days/week workout' }].map(o => (
                    <div key={o.id} className="tap" onClick={() => setActivity(o.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 14, padding: '13px 16px', marginBottom: 9, cursor: 'pointer', border: `2px solid ${activity === o.id ? C.primary : C.border}`, transition: 'border .2s' }}>
                      <span style={{ fontSize: 22 }}>{o.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: activity === o.id ? C.primary : C.text }}>{o.label}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{o.sub}</div>
                      </div>
                      {activity === o.id && <span style={{ color: C.primary, fontWeight: 700 }}>✓</span>}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 10, letterSpacing: 0.4 }}>BODY GOAL</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {[{ id: 'lean', label: 'Lean', sub: 'Lose fat' }, { id: 'fit', label: 'Fit', sub: 'Stay toned' }, { id: 'athletic', label: 'Athletic', sub: 'Build muscle' }].map(o => (
                    <div key={o.id} className="tap" onClick={() => setBodyGoal(o.id)} style={{ flex: 1, background: bodyGoal === o.id ? C.primary : C.light, borderRadius: 14, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', transition: 'background .2s' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: bodyGoal === o.id ? 'white' : C.text }}>{o.label}</div>
                      <div style={{ fontSize: 11, color: bodyGoal === o.id ? 'rgba(255,255,255,.75)' : C.muted, marginTop: 2 }}>{o.sub}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {editMode === 'food' && (
              <div style={{ marginBottom: 16 }}>
                {[{ id: 'veg', emoji: '🥗', label: 'Vegetarian', desc: 'Plant-based including dairy' }, { id: 'nonveg', emoji: '🍗', label: 'Non-Vegetarian', desc: 'Meat, poultry, seafood' }, { id: 'vegan', emoji: '🥑', label: 'Vegan', desc: 'Strict plant-based' }].map(o => (
                  <div key={o.id} className="tap" onClick={() => setProfile(p => ({ ...p, pref: o.id }))} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 14, padding: '12px 16px', marginBottom: 8, cursor: 'pointer', border: `2px solid ${profile?.pref === o.id ? C.primary : C.border}`, transition: 'border .2s' }}>
                    <span style={{ fontSize: 22 }}>{o.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: profile?.pref === o.id ? C.primary : C.text }}>{o.label}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{o.desc}</div>
                    </div>
                    {profile?.pref === o.id && <span style={{ color: C.primary, fontWeight: 700 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}

            {editMode === 'body' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ background: 'white', borderRadius: 14, padding: '12px 14px', marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: 0.4 }}>AGE</label>
                  <div style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, color: C.primary }}>{age || '—'} yrs</div>
                </div>
                <div style={{ background: 'white', borderRadius: 14, padding: '12px 14px', marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: 0.4 }}>WEIGHT (KG)</label>
                  <input type="number" value={profile?.weightKg || ''} onChange={e => setProfile(p => ({ ...p, weightKg: +e.target.value }))} style={{ width: '100%', border: 'none', outline: 'none', fontSize: 16, fontFamily: 'Playfair Display', fontWeight: 700, color: C.primary, background: 'transparent' }} />
                </div>
                <div style={{ background: 'white', borderRadius: 14, padding: '12px 14px' }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: 0.4 }}>HEIGHT (CM)</label>
                  <input type="number" value={profile?.heightCm || ''} onChange={e => setProfile(p => ({ ...p, heightCm: +e.target.value }))} style={{ width: '100%', border: 'none', outline: 'none', fontSize: 16, fontFamily: 'Playfair Display', fontWeight: 700, color: C.primary, background: 'transparent' }} />
                </div>
              </div>
            )}

            <button className="tap" onClick={() => setEditMode(null)} style={{ width: '100%', padding: '14px', borderRadius: 50, border: 'none', background: C.primary, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>
              Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ══ NOTIFICATIONS SCREEN ══ */
const NotificationsScreen = ({ go, dishPool }) => {
  const userDishes = dishPool?.slice(0, 2) || [];
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="tap" onClick={() => go('hearth')} style={{ width: 34, height: 34, borderRadius: '50%', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>←</div>
          <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 17 }}>Notifications</span>
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        {userDishes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', marginTop: 40 }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>📝</div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No dishes added yet</h3>
            <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.6, marginBottom: 20 }}>Dishes added to your family pool will appear here.</p>
            <button onClick={() => go('hearth')} style={{ background: C.primary, color: 'white', border: 'none', borderRadius: 50, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>Go back</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {userDishes.map((d) => (
              <div key={d.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.06)', display: 'flex', gap: 12 }}>
                {d.img && <img src={d.img} alt={d.name} style={{ width: 80, height: 80, objectFit: 'cover', flexShrink: 0 }} />}
                <div style={{ flex: 1, padding: '12px 0 12px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{d.cal} kcal · {d.protein}g protein</div>
                  <span style={{ fontSize: 11, color: C.primary, fontWeight: 600 }}>✓ Added to pool</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ══ HEARTH ══ */
const HearthScreen = ({ go, showRecipe, profile, members, setMembers, plannedMeals }) => {
  const [memberMenu, setMemberMenu] = useState(null);
  const target = profile?.target || 2000;
  const ate = 0, burned = 0, remain = target;
  const pct = Math.max(ate / target, .04);
  const r = 36, circ = 2 * Math.PI * r;
  const todayEntry = Object.entries(plannedMeals).find(([k]) => k.startsWith('2_'));
  const todaysDish = todayEntry?.[1]?.dish || null;
  const toggleEating = id => setMembers(ms => ms.map(m => m.id === id ? { ...m, eating: !m.eating } : m));
  const setCook = id => setMembers(ms => ms.map(m => ({ ...m, isCook: m.id === id })));
  return (
    <div style={{ paddingBottom: 100, minHeight: '100vh', background: C.bg }}>
      <StickyNav
        left={<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="tap" onClick={() => go('profile')} style={{ width: 36, height: 36, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, cursor: 'pointer' }}>👤</div>
          <div><div style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 15, color: C.primary }}>The Culinary Hearth</div><div style={{ fontSize: 11, color: C.muted }}>Code: DISH42</div></div>
        </div>}
        right={<div className="tap" onClick={() => go('notifications')} style={{ width: 36, height: 36, borderRadius: '50%', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>🔔</div>}
      />
      <div style={{ padding: '14px 20px 0' }}>
        {/* Search */}
        <div style={{ display: 'flex', background: 'white', borderRadius: 50, overflow: 'hidden', alignItems: 'center', padding: '4px 4px 4px 14px', boxShadow: '0 2px 10px rgba(0,0,0,.07)', marginBottom: 14 }}>
          <span style={{ fontSize: 14, marginRight: 7, color: C.muted, flexShrink: 0 }}>🔍</span>
          <input placeholder="Search or paste link to add a dish…" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12.5, background: 'transparent', fontFamily: 'DM Sans', color: C.text, minWidth: 0 }} />
          <button className="tap" style={{ background: C.primary, color: 'white', border: 'none', borderRadius: 50, padding: '9px 13px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', flexShrink: 0 }}>Add to pool</button>
        </div>
        {/* Calorie ring */}
        <div style={{ background: C.dark, borderRadius: 20, padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 82, height: 82, flexShrink: 0 }}>
              <svg width="82" height="82" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="41" cy="41" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="7" />
                <circle cx="41" cy="41" r={r} fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`} />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 14, fontFamily: 'Playfair Display', lineHeight: 1 }}>{ate}</div>
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 10 }}>kcal ate</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, marginBottom: 2 }}>Daily calorie target</div>
              <div style={{ color: 'white', fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{target} <span style={{ fontSize: 12, fontWeight: 400 }}>kcal</span></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,.07)', borderRadius: 8, padding: '5px 8px' }}>
                  <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 10 }}>🍴 Food</div>
                  <div style={{ color: 'white', fontSize: 11.5, fontWeight: 600, marginTop: 1 }}>{ate} kcal</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,.07)', borderRadius: 8, padding: '5px 8px' }}>
                  <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 10 }}>🏃 Exercise</div>
                  <div style={{ color: 'white', fontSize: 11.5, fontWeight: 600, marginTop: 1 }}>+{burned} kcal</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 10, padding: '7px 12px', background: 'rgba(255,255,255,.07)', borderRadius: 9, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,.55)', fontSize: 12 }}>Remaining today</span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{remain} kcal</span>
          </div>
        </div>
        {/* At The Table */}
        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, marginBottom: 12 }}>At The Table Today</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {members.map(m => (
            <div key={m.id} style={{ background: 'white', borderRadius: 18, padding: '14px', textAlign: 'center', position: 'relative' }}>
              <div onClick={() => setMemberMenu(m)} style={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer', fontSize: 13, color: C.muted, fontWeight: 900, letterSpacing: .5, padding: '2px 4px' }}>•••</div>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 7 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: m.color || '#D4956A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white', fontFamily: 'Playfair Display' }}>{m.initials}</div>
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: m.eating ? C.green : '#F44336', border: '2px solid white' }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name}</div>
              {m.isCook && <div style={{ fontSize: 10, color: C.primary, fontWeight: 700, marginTop: 2, letterSpacing: .3 }}>COOKING TONIGHT</div>}
            </div>
          ))}
          <div className="tap" style={{ background: 'white', borderRadius: 18, padding: '14px', textAlign: 'center', border: `2px dashed ${C.border}`, cursor: 'pointer' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 7px', color: C.muted }}>+</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>Add Member</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: .3 }}>GROW THE GROUP</div>
          </div>
        </div>
        {/* Tonight's Plan */}
        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, marginBottom: 12 }}>Tonight's Plan</h2>
        {todaysDish ? (
          <div style={{ background: 'white', borderRadius: 22, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.07)', marginBottom: 20 }}>
            {todaysDish.img && <img src={todaysDish.img} alt={todaysDish.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />}
            <div style={{ padding: '14px 18px 18px' }}>
              <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: .5 }}>CONFIRMED</span>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 21, fontWeight: 700, margin: '9px 0 5px' }}>{todaysDish.name}</h3>
              {todaysDish.desc && <p style={{ color: C.muted, fontSize: 13, fontStyle: 'italic', marginBottom: 14, lineHeight: 1.5 }}>{todaysDish.desc}</p>}
              <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
                {[['PROTEIN', todaysDish.protein], ['FIBER', todaysDish.fiber], ['CARBS', todaysDish.carbs]].map(([l, v]) => (
                  <div key={l}><div style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{v}<span style={{ fontSize: 12 }}> gm</span></div><div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2, letterSpacing: .5 }}>{l}</div></div>
                ))}
              </div>
              <div style={{ textAlign: 'right' }}><button className="tap" onClick={() => showRecipe(todaysDish)} style={{ background: C.primary, color: 'white', border: 'none', borderRadius: 50, padding: '10px 22px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>View Recipe</button></div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 22, padding: '32px 24px', textAlign: 'center', marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: 50, marginBottom: 10 }}>🍲</div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, marginBottom: 7 }}>No dishes yet!</h3>
            <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.65, marginBottom: 18 }}>Your family hasn't voted on tonight's dinner yet.<br />Start voting or add directly to the Planner.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="tap" onClick={() => go('match')} style={{ background: C.primary, color: 'white', border: 'none', borderRadius: 50, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>Vote in Match</button>
              <button className="tap" onClick={() => go('planner')} style={{ background: 'white', color: C.text, border: `2px solid ${C.border}`, borderRadius: 50, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>Open Planner</button>
            </div>
          </div>
        )}
      </div>
      <BottomNav active="hearth" go={go} />
      {memberMenu && <MemberMenuModal member={memberMenu} isAdmin={true} allMembers={members} onClose={() => setMemberMenu(null)} onToggleEating={() => toggleEating(memberMenu.id)} onSetCook={id => { setCook(id); }} />}
    </div>
  );
};

/* ══ MATCH ══ */
const VEG_IDS = [1, 4];
const MatchScreen = ({ go, showRecipe, dishPool, votes, onVote, profile, setPlannedMeals }) => {
  const [anim, setAnim] = useState(null);
  const filtered = profile?.pref === 'veg' || profile?.pref === 'vegan' ? dishPool.filter(d => VEG_IDS.includes(d.id)) : dishPool;
  const unvoted = filtered.filter(d => votes[d.id] === undefined);
  const current = unvoted[0];
  const likedCount = filtered.filter(d => votes[d.id] === true).length;
  const voted = filtered.length - unvoted.length;
  const vote = liked => {
    if (!current) return;
    setAnim(liked ? 'right' : 'left');
    setTimeout(() => {
      onVote(current.id, liked);
      if (liked) {
        const absDay = 3 + likedCount;
        const weekOff = Math.floor(absDay / 7);
        const dayIdx = absDay % 7;
        setPlannedMeals(p => {
          const k = `${weekOff}_${dayIdx}_7 PM`;
          if (p[k]) return p;
          return { ...p, [k]: { dish: current, repeat: 'once' } };
        });
      }
      setAnim(null);
    }, 260);
  };
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>
      <StickyNav left={<span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 20, color: C.primary }}>Tonight's Contenders</span>} />
      {current ? (
        <div style={{ flex: 1, padding: '14px 20px 0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {filtered.map((d, i) => { const done = votes[d.id] !== undefined; return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: done ? C.primary : '#E0D8CC', opacity: done ? .4 : 1 }} />; })}
          </div>
          <div style={{ flex: 1, marginBottom: 16 }}>
            <div style={{ borderRadius: 24, overflow: 'hidden', background: 'white', transform: anim === 'left' ? 'translateX(-70px) rotate(-9deg)' : anim === 'right' ? 'translateX(70px) rotate(9deg)' : 'none', opacity: anim ? 0 : 1, transition: 'all .24s cubic-bezier(.4,0,.2,1)', boxShadow: '0 10px 40px rgba(0,0,0,.13)' }}>
              <div style={{ position: 'relative', height: 290 }}>
                <img src={current.img} alt={current.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 52%,rgba(0,0,0,.74))' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1.15, flex: 1 }}>{current.name}</h2>
                    <span style={{ background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(4px)', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0, marginBottom: 3 }}>🔥 {current.cal} kcal</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '12px 18px 18px' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
                  {[['💪', `${current.protein}g`, 'Protein'], ['🌾', `${current.carbs}g`, 'Carbs'], ['🌿', `${current.fiber}g`, 'Fiber']].map(([ic, v, l]) => (
                    <div key={l} style={{ background: C.light, borderRadius: 50, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{ic} <span style={{ color: C.primary }}>{v}</span> <span style={{ color: C.muted, fontWeight: 400, fontSize: 11 }}>{l}</span></div>
                  ))}
                </div>
                <p style={{ color: C.muted, fontSize: 12.5, fontStyle: 'italic', lineHeight: 1.5, marginBottom: 8 }}>{current.desc}</p>
                <div onClick={() => showRecipe(current)} style={{ textAlign: 'right', color: C.muted, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', letterSpacing: .7 }}>VIEW RECIPE →</div>
              </div>
            </div>
          </div>
          {likedCount > 0 && <div style={{ textAlign: 'center', fontSize: 12, color: C.primary, fontWeight: 600, marginBottom: 6 }}>✓ {likedCount} dish{likedCount > 1 ? 'es' : ''} added to your Planner</div>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, paddingBottom: 8 }}>
            <button className="vote-skip" onClick={() => vote(false)} style={{ width: 64, height: 64, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(0,0,0,.11)', fontSize: 24, color: C.muted }}>✕</button>
            <button className="vote-love" onClick={() => vote(true)} style={{ width: 80, height: 80, borderRadius: '50%', background: C.primary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, boxShadow: '0 8px 28px rgba(123,37,37,.4)' }}>❤️</button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, color: C.muted, fontSize: 12 }}>{unvoted.length} left · {voted} voted</div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 54, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>All done!</h3>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 4 }}>You've voted on all {filtered.length} dishes.</p>
          {likedCount > 0 && <p style={{ color: C.primary, fontSize: 13.5, fontWeight: 600, marginBottom: 16 }}>❤️ {likedCount} dish{likedCount > 1 ? 'es' : ''} added to your Planner</p>}
          <button className="tap" onClick={() => go('planner')} style={{ background: C.primary, color: 'white', border: 'none', borderRadius: 50, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', marginBottom: 18 }}>View in Planner →</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%' }}>
            {filtered.map(d => (
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
};

/* ══ ADD DISH MODAL ══ */
const AddDishModal = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [cal, setCal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fiber, setFiber] = useState('');
  const ok = name.trim() && cal;
  const iSt = { width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '9px 14px', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', color: C.text };
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 150 }} />
      <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 38px', zIndex: 160, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#E0D8CC', margin: '0 auto 12px' }} />
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 19, fontWeight: 700, marginBottom: 12 }}>Add to Planner</h3>
        <div style={{ marginBottom: 9 }}><label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: .4 }}>DISH NAME *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chole Bhature" style={iSt} /></div>
        <div style={{ marginBottom: 9 }}><label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: .4 }}>IMAGE URL (optional)</label><input value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="https://..." style={iSt} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[['CALORIES *', cal, setCal], ['PROTEIN (g)', protein, setProtein], ['CARBS (g)', carbs, setCarbs], ['FIBER (g)', fiber, setFiber]].map(([l, v, s]) => (
            <div key={l}><label style={{ fontSize: 10, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: .3 }}>{l}</label>
              <input type="number" value={v} onChange={e => s(e.target.value)} placeholder="0" style={{ ...iSt, textAlign: 'center', fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 20, color: C.primary, padding: '8px 6px' }} /></div>
          ))}
        </div>
        <button className="tap" onClick={() => { if (ok) { onAdd({ id: Date.now(), name: name.trim(), img: imgUrl || null, cal: +cal || 0, protein: +protein || 0, carbs: +carbs || 0, fiber: +fiber || 0, personal: true }); onClose(); } }} style={{ width: '100%', padding: '13px', borderRadius: 50, border: 'none', background: ok ? C.primary : '#D0C8BC', color: 'white', fontSize: 14, fontWeight: 600, cursor: ok ? 'pointer' : 'default', fontFamily: 'DM Sans' }}>Add to Planner</button>
      </div>
    </>
  );
};

/* ══ REPEAT MODAL ══ */
const RepeatModal = ({ dishName, onSelect, onClose }) => {
  const [sel, setSel] = useState('once');
  const opts = [{ id: 'once', label: 'Just once', sub: 'Only this day', ic: '📌' }, { id: 'daily', label: 'Every day', sub: 'Repeat daily', ic: '🔄' }, { id: 'weekly', label: 'Every week', sub: 'Same day weekly', ic: '📅' }, { id: 'monthly', label: 'Every month', sub: 'Same date monthly', ic: '🗓' }];
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 150 }} />
      <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 38px', zIndex: 160 }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#E0D8CC', margin: '0 auto 12px' }} />
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Repeat Schedule</h3>
        <p style={{ color: C.muted, fontSize: 12.5, marginBottom: 12 }}>How often for <em style={{ color: C.primary }}>{dishName}</em>?</p>
        {opts.map(o => (
          <div key={o.id} onClick={() => setSel(o.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, marginBottom: 6, border: `2px solid ${sel === o.id ? C.primary : 'transparent'}`, background: sel === o.id ? '#FDF5F0' : '#F9F6F2', cursor: 'pointer' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{o.ic}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{o.label}</div><div style={{ fontSize: 11.5, color: C.muted }}>{o.sub}</div></div>
            <div style={{ width: 17, height: 17, borderRadius: '50%', border: `2px solid ${sel === o.id ? C.primary : '#D0C8BC'}`, background: sel === o.id ? C.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {sel === o.id && <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>✓</span>}
            </div>
          </div>
        ))}
        <button className="tap" onClick={() => { onSelect(sel); onClose(); }} style={{ width: '100%', padding: '13px', borderRadius: 50, border: 'none', background: C.primary, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', marginTop: 8 }}>Save Schedule</button>
      </div>
    </>
  );
};

/* ══ PLANNER ══ */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BASE_DATES = [7, 8, 9, 10, 11, 12, 13];

const PlannerScreen = ({ go, showRecipe, isAdmin, plannedMeals, setPlannedMeals }) => {
  const [selDay, setSelDay] = useState(2);
  const [addTarget, setAddTarget] = useState(null);
  const [repeatTarget, setRepeatTarget] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const HOURS = ['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'];
  const weekOffset = Math.floor(selDay / 7);
  const weekStart = weekOffset * 7;
  const dates = BASE_DATES.map(d => d + weekOffset * 7);
  const key = (abs, h) => `${Math.floor(abs / 7)}_${abs % 7}_${h}`;
  const getMeal = h => plannedMeals[key(selDay, h)] || null;
  const addMeal = (h, dish) => setPlannedMeals(p => ({ ...p, [key(selDay, h)]: { dish, repeat: 'once' } }));
  const removeMeal = h => setPlannedMeals(p => { const n = { ...p }; delete n[key(selDay, h)]; return n; });
  const setRepeatFn = (h, rep) => setPlannedMeals(p => ({ ...p, [key(selDay, h)]: { ...p[key(selDay, h)], repeat: rep } }));
  const absHasMeal = abs => HOURS.some(h => plannedMeals[key(abs, h)]);
  const rl = { once: '', daily: 'Every day', weekly: 'Every week', monthly: 'Every month' };
  const monthLabel = weekOffset === 0 ? 'April 2025' : weekOffset === 1 ? 'April – Wk 2' : weekOffset === -1 ? 'March – Wk 4' : 'April 2025';
  return (
    <div style={{ paddingBottom: 100, minHeight: '100vh', background: C.bg }} onClick={() => setOpenMenu(null)}>
      <StickyNav left={<span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 21 }}>Meal Plan</span>} />
      <div style={{ background: 'white', margin: '12px 20px', borderRadius: 18, padding: '14px', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 15 }}>📅</span><span style={{ fontWeight: 600, fontSize: 13.5 }}>{monthLabel}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div onClick={() => setSelDay(d => Math.max(0, d - 1))} style={{ width: 28, height: 28, borderRadius: '50%', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 700, userSelect: 'none' }}>◀</div>
            <span onClick={() => setSelDay(2)} style={{ fontSize: 12, fontWeight: 600, color: C.primary, cursor: 'pointer', padding: '4px 10px', borderRadius: 20, background: '#FDF5F0' }}>Today</span>
            <div onClick={() => setSelDay(d => d + 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 700, userSelect: 'none' }}>▶</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
          {DAYS.map((d, i) => {
            const absIdx = weekStart + i;
            return (
              <div key={d} onClick={() => setSelDay(absIdx)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 500 }}>{d}</div>
                <div style={{ width: 30, height: 30, borderRadius: '50%', margin: '0 auto', background: selDay === absIdx ? C.primary : 'transparent', color: selDay === absIdx ? 'white' : C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: selDay === absIdx ? 700 : 400, fontSize: 13, transition: 'all .2s' }}>{dates[i]}</div>
                <div style={{ width: '55%', height: 3, borderRadius: 2, background: absHasMeal(absIdx) ? C.primary : '#E0D8CC', margin: '4px auto 0', opacity: .7 }} />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: '0 20px' }}>
        {HOURS.map(t => {
          const meal = getMeal(t);
          const mk = `${selDay}_${t}`;
          return (
            <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minHeight: meal ? 94 : 40 }} onClick={e => e.stopPropagation()}>
              <div style={{ width: 44, fontSize: 12, color: C.muted, paddingTop: 12, flexShrink: 0, textAlign: 'right' }}>{t}</div>
              <div style={{ flex: 1, borderLeft: `1.5px solid ${C.border}`, paddingLeft: 12, paddingBottom: 4, paddingTop: 8 }}>
                {meal ? (
                  <div style={{ background: 'white', borderRadius: 14, padding: '9px 11px', display: 'flex', gap: 9, alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,.06)', position: 'relative' }}>
                    {meal.dish.img ? <img src={meal.dish.img} alt="" style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 42, height: 42, borderRadius: 10, background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🍽</div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.dish.name}</div>
                      <div style={{ fontSize: 10.5, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🔥{meal.dish.cal} · 💪{meal.dish.protein}g · 🌾{meal.dish.carbs}g · 🌿{meal.dish.fiber}g</div>
                      {meal.repeat && meal.repeat !== 'once' && <div style={{ fontSize: 10, color: C.primary, fontWeight: 600, marginTop: 2 }}>🔄 {rl[meal.repeat]}</div>}
                    </div>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === mk ? null : mk); }} style={{ padding: '3px 6px', cursor: 'pointer', color: C.muted, fontWeight: 900, fontSize: 14, letterSpacing: 1 }}>•••</div>
                      {openMenu === mk && (
                        <div style={{ position: 'absolute', right: 0, top: 24, background: 'white', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,.16)', zIndex: 80, overflow: 'hidden', minWidth: 162 }} onClick={e => e.stopPropagation()}>
                          <div onClick={() => { setOpenMenu(null); showRecipe(meal.dish); }} style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderBottom: `1px solid ${C.border}` }}>🍽 View Recipe</div>
                          <div onClick={() => { setOpenMenu(null); setRepeatTarget({ hour: t, meal: meal.dish }); }} style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderBottom: isAdmin ? `1px solid ${C.border}` : 'none' }}>🔄 Repeat Schedule</div>
                          {isAdmin && <div onClick={() => { setOpenMenu(null); removeMeal(t); }} style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#E53935' }}>🗑 Remove</div>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setAddTarget({ hour: t })} style={{ color: '#C4B8A8', fontSize: 22, cursor: 'pointer', lineHeight: 1, paddingTop: 2, display: 'inline-block' }}>+</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav active="planner" go={go} />
      {addTarget && <AddDishModal onAdd={d => { addMeal(addTarget.hour, d); setAddTarget(null); }} onClose={() => setAddTarget(null)} />}
      {repeatTarget && <RepeatModal dishName={repeatTarget.meal.name} onSelect={rep => setRepeatFn(repeatTarget.hour, rep)} onClose={() => setRepeatTarget(null)} />}
    </div>
  );
};

/* ══ RECIPE MODAL ══ */
const RecipeModal = ({ dish, close }) => {
  if (!dish) return null;
  return (
    <div className="slide-up" style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, height: '100vh', background: C.bg, zIndex: 200, overflowY: 'auto' }}>
      <div style={{ position: 'relative' }}>
        {dish.img ? <img src={dish.img} alt={dish.name} style={{ width: '100%', height: 248, objectFit: 'cover' }} /> : <div style={{ height: 100, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>🍽</div>}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%,rgba(0,0,0,.22))' }} />
        <button className="tap" onClick={close} style={{ position: 'absolute', top: 48, left: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,.45)', border: 'none', color: 'white', fontSize: 17, cursor: 'pointer' }}>←</button>
      </div>
      <div style={{ padding: '18px 20px 100px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 23, fontWeight: 700, marginBottom: 9, lineHeight: 1.2 }}>{dish.name}</h1>
        {dish.desc && <p style={{ color: C.muted, fontStyle: 'italic', fontSize: 12.5, marginBottom: 13, lineHeight: 1.5 }}>{dish.desc}</p>}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['🔥', (dish.cal || 0) + ' kcal'], ['💪', (dish.protein || 0) + 'g'], ['🌾', (dish.carbs || 0) + 'g'], ['🌿', (dish.fiber || 0) + 'g']].map(([ic, v]) => (
            <span key={v} style={{ background: C.light, borderRadius: 50, padding: '5px 11px', fontSize: 12, fontWeight: 500 }}>{ic} {v}</span>
          ))}
        </div>
        {dish.ingredients && <>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 700, marginBottom: 9 }}>Ingredients</h3>
          <div style={{ background: 'white', borderRadius: 14, padding: '10px 14px', marginBottom: 16 }}>
            {dish.ingredients.map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < dish.ingredients.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ color: C.primary, fontWeight: 800, flexShrink: 0 }}>·</span><span style={{ fontSize: 13.5, lineHeight: 1.4 }}>{ing}</span>
              </div>
            ))}
          </div>
        </>}
        {dish.steps && <>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 700, marginBottom: 10 }}>How to Make</h3>
          {dish.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: C.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, paddingTop: 3 }}>{step}</p>
            </div>
          ))}
        </>}
      </div>
    </div>
  );
};

/* ══ ROOT APP ══ */
export default function App() {
  const { data: session, status } = useSession();
  const [screen, setScreen] = useState('welcome');
  const [recipe, setRecipe] = useState(null);
  const [profile, setProfileRaw] = useState({});
  const [votes, setVotes] = useState({});
  const [plannedMeals, setPlannedMeals] = useState({});
  const [roomId, setRoomId] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('culinary_room_id') : null);
  const [inviteCode, setInviteCode] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('culinary_invite_code') : null);
  const [members, setMembers] = useState([{ id: 1, name: 'Sushant', role: 'admin', initials: 'SU', eating: true, color: '#D4956A', isCook: true }]);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (roomId) localStorage.setItem('culinary_room_id', roomId);
    else localStorage.removeItem('culinary_room_id');
  }, [roomId]);

  // After Google sign-in: check profile + room → route to correct screen
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { setScreen('welcome'); hasNavigated.current = false; return; }
    if (status !== 'authenticated' || hasNavigated.current) return;
    hasNavigated.current = true;

    fetch('/api/profile')
      .then(r => r.json())
      .then(async p => {
        if (p && (p.age || p.date_of_birth)) {
          setProfileRaw({
            age: p.age, weightKg: p.weight_kg, heightCm: p.height_cm,
            pref: p.food_pref, allergies: p.allergies,
            activity: p.activity_level, bodyGoal: p.body_goal,
            target: p.target_cal, maintenance: p.maintenance_cal,
          });
          // Check localStorage first (fast path)
          const savedRoom = localStorage.getItem('culinary_room_id');
          if (savedRoom) { go('hearth'); return; }
          // Fallback: check DB
          try {
            const r = await fetch('/api/rooms/join');
            if (r.ok) {
              const { roomId: dbRoom, inviteCode: dbInvite } = await r.json();
              if (dbRoom) { setRoomId(dbRoom); if (dbInvite) setInviteCode(dbInvite); go('hearth'); return; }
            }
          } catch (_) {}
          go('createjoin');
        } else {
          go('onboarding1');
        }
      })
      .catch(() => go('onboarding1'));
  }, [status]);

  const setProfile = fn => setProfileRaw(fn);
  const go = s => { setScreen(s); if (typeof window !== 'undefined') window.scrollTo(0, 0); };
  const onVote = (id, liked) => setVotes(v => ({ ...v, [id]: liked }));
  const screens = {
    welcome: <WelcomeScreen go={go} />,
    onboarding1: <Onboarding1 go={go} setProfile={setProfile} />,
    onboarding2: <Onboarding2 go={go} setProfile={setProfile} />,
    onboarding3: <Onboarding3 go={go} profile={profile} setProfile={setProfile} />,
    createjoin: <CreateJoinScreen go={go} userName={members[0]?.name || 'Chef'} />,
    joincode: <JoinCodeScreen go={go} />,
    hearth: <HearthScreen go={go} showRecipe={setRecipe} profile={profile} members={members} setMembers={setMembers} plannedMeals={plannedMeals} />,
    match: <MatchScreen go={go} showRecipe={setRecipe} dishPool={DISH_POOL} votes={votes} onVote={onVote} profile={profile} setPlannedMeals={setPlannedMeals} />,
    planner: <PlannerScreen go={go} showRecipe={setRecipe} isAdmin={true} plannedMeals={plannedMeals} setPlannedMeals={setPlannedMeals} />,
    profile: <ProfileScreen go={go} profile={profile} setProfile={setProfile} />,
    notifications: <NotificationsScreen go={go} dishPool={DISH_POOL} />,
  };
  if (status === 'loading') return (
    <div id="root-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🍽</div>
        <div style={{ fontSize: 14, color: C.muted }}>Loading…</div>
      </div>
    </div>
  );

  return (
    <div id="root-wrapper">
      {screens[screen] || screens.welcome}
      {recipe && <RecipeModal dish={recipe} close={() => setRecipe(null)} />}
    </div>
  );
}
