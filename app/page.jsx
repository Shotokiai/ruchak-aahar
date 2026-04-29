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

const MenuIcon = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill={C.dark}>
    <rect width="20" height="2.5" rx="1.25"/><rect y="5.75" width="20" height="2.5" rx="1.25"/><rect y="11.5" width="20" height="2.5" rx="1.25"/>
  </svg>
);
const BellIcon = ({ filled }) => filled ? (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={C.dark}>
    <path d="M12 2a1.5 1.5 0 0 0-1.5 1.5v.74C7.57 5.04 6 7.34 6 10v5l-2 2.67V19h16v-1.33L18 15v-5c0-2.66-1.57-4.96-4.5-5.76V3.5A1.5 1.5 0 0 0 12 2z"/>
    <path d="M10 20a2 2 0 0 0 4 0h-4z"/>
    <path d="M4 8.5C3.2 9.6 2.8 11 3 12.3" stroke={C.dark} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <path d="M20 8.5c.8 1.1 1.2 2.5 1 3.8" stroke={C.dark} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
  </svg>
) : (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a1.5 1.5 0 0 0-1.5 1.5v.74C7.57 5.04 6 7.34 6 10v5l-2 2.67V19h16v-1.33L18 15v-5c0-2.66-1.57-4.96-4.5-5.76V3.5A1.5 1.5 0 0 0 12 2z"/>
    <path d="M10 20a2 2 0 0 0 4 0"/>
    <path d="M4 8.5C3.2 9.6 2.8 11 3 12.3"/>
    <path d="M20 8.5c.8 1.1 1.2 2.5 1 3.8"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const WhatsAppIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.43 12.43 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.527 5.845L.057 23.012a.75.75 0 0 0 .931.931l5.167-1.47A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.58-.5-5.07-1.37l-.36-.21-3.74 1.065 1.065-3.738-.213-.363A9.934 9.934 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

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
        <button className="tap" onClick={async () => {
          setProfile(p => ({ ...p, activity, bodyGoal, maintenance, target }));
          try {
            await fetch('/api/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                age: profile.age, weight_kg: profile.weightKg, height_cm: profile.heightCm,
                food_pref: profile.pref, allergies: profile.allergies,
                activity_level: activity, body_goal: bodyGoal,
              }),
            });
          } catch (_) {}
          go('createjoin');
        }} style={{ width: '100%', padding: '15px', borderRadius: 50, border: 'none', background: C.primary, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>Complete Setup →</button>
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

const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeLocalCode = () => Array.from({ length: 6 }, () => INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)]).join('');

/* ══ CREATE/JOIN ══ */
const CreateJoinScreen = ({ go, userName, onRoomCreated }) => {
  const [mode, setMode] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [localCode, setLocalCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleRoomNameChange = e => {
    setRoomName(e.target.value);
    if (!localCode && e.target.value.length > 1) setLocalCode(makeLocalCode());
  };

  const handleCreate = async () => {
    if (roomName.length < 2 || creating) return;
    setCreating(true); setError('');
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName, suggestedCode: localCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create room'); setCreating(false); return; }
      onRoomCreated(data.roomId, data.inviteCode, data.roomName);
    } catch (e) {
      setError('Network error. Please try again.');
      setCreating(false);
    }
  };

  if (mode === 'create') return (
    <div className="slide-up" style={{ padding: '52px 24px 40px', minHeight: '100vh', background: C.bg }}>
      <div className="tap" onClick={() => setMode(null)} style={{ width: 38, height: 38, borderRadius: '50%', background: '#E8DDD0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 22, fontSize: 16 }}>←</div>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create your <span style={{ color: C.primary }}>Family Room</span></h1>
      <p style={{ color: C.muted, marginBottom: 22, fontSize: 14 }}>Name your hearth and invite your family</p>
      <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: .5 }}>FAMILY ROOM NAME</label>
        <input value={roomName} onChange={handleRoomNameChange} placeholder="e.g. Sharma Family" style={{ width: '100%', border: 'none', outline: 'none', fontSize: 16, fontFamily: 'DM Sans', color: C.text, background: 'transparent' }} />
      </div>
      {roomName.length > 1 && localCode && (
        <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 8, letterSpacing: .5 }}>YOUR INVITE CODE</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Playfair Display', fontSize: 34, fontWeight: 700, letterSpacing: 6, color: C.primary }}>{localCode}</span>
            <button onClick={() => { navigator.clipboard?.writeText(localCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '8px 16px', borderRadius: 20, background: copied ? '#4CAF50' : C.dark, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background .3s' }}>{copied ? '✓ Copied' : 'Copy'}</button>
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 7 }}>Share this code with your family to invite them</p>
        </div>
      )}
      {error && <p style={{ color: '#E53935', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>{error}</p>}
      <button className="tap" onClick={handleCreate} disabled={creating} style={{ width: '100%', padding: '15px', borderRadius: 50, border: 'none', background: roomName.length > 1 && !creating ? C.primary : '#D0C8BC', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>
        {creating ? 'Creating…' : 'Create Room & Continue'}
      </button>
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
      <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 36px', zIndex: 160 }}>
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
const ProfileScreen = ({ go, profile, setProfile, session }) => {
  const [editMode, setEditMode] = useState(null);
  const [editAge, setEditAge] = useState(25);
  const [editWeight, setEditWeight] = useState(70);
  const [editHeight, setEditHeight] = useState(170);
  const [editActivity, setEditActivity] = useState('sedentary');
  const [editBodyGoal, setEditBodyGoal] = useState('fit');
  const [editPref, setEditPref] = useState('nonveg');
  const [editAllergies, setEditAllergies] = useState([]);

  const openEdit = mode => {
    if (mode === 'body') { setEditAge(profile?.age || 25); setEditWeight(profile?.weightKg || 70); setEditHeight(profile?.heightCm || 170); }
    if (mode === 'fitness') { setEditActivity(profile?.activity || 'sedentary'); setEditBodyGoal(profile?.bodyGoal || 'fit'); }
    if (mode === 'food') { setEditPref(profile?.pref || 'nonveg'); setEditAllergies(profile?.allergies || []); }
    setEditMode(mode);
  };

  const toggleAllergyEdit = id => {
    if (id === 'none') { setEditAllergies(['none']); return; }
    setEditAllergies(a => { const n = a.filter(x => x !== 'none'); return n.includes(id) ? n.filter(x => x !== id) : [...n, id]; });
  };

  const bodyChanged = editAge !== (profile?.age || 25) || editWeight !== (profile?.weightKg || 70) || editHeight !== (profile?.heightCm || 170);
  const fitnessChanged = editActivity !== (profile?.activity || 'sedentary') || editBodyGoal !== (profile?.bodyGoal || 'fit');
  const foodChanged = editPref !== (profile?.pref || 'nonveg') ||
    JSON.stringify([...(editAllergies)].sort()) !== JSON.stringify([...(profile?.allergies || [])].sort());
  const hasChanged = editMode === 'body' ? bodyChanged : editMode === 'fitness' ? fitnessChanged : foodChanged;

  const saveChanges = async () => {
    const apiBody = {};
    if (editMode === 'body') {
      apiBody.age = editAge; apiBody.weight_kg = editWeight; apiBody.height_cm = editHeight;
      setProfile(p => ({ ...p, age: editAge, weightKg: editWeight, heightCm: editHeight }));
    }
    if (editMode === 'fitness') {
      apiBody.activity_level = editActivity; apiBody.body_goal = editBodyGoal;
      setProfile(p => ({ ...p, activity: editActivity, bodyGoal: editBodyGoal }));
    }
    if (editMode === 'food') {
      apiBody.food_pref = editPref; apiBody.allergies = editAllergies;
      setProfile(p => ({ ...p, pref: editPref, allergies: editAllergies }));
    }
    setEditMode(null);
    try { await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiBody) }); } catch (_) {}
  };

  const age = profile?.age || (profile?.dob ? Math.floor((new Date() - new Date(profile.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null);
  const PREF_LABEL = { veg: 'Vegetarian 🥗', nonveg: 'Non-Vegetarian 🍗', vegan: 'Vegan 🥑' };
  const ACTIVITY_LABEL = { sedentary: 'Sedentary 🪑', light: 'Light Activity 🚶', moderate: 'Moderate 🏋️' };
  const GOAL_LABEL = { lean: 'Lean — Lose fat', fit: 'Fit — Stay toned', athletic: 'Athletic — Build muscle' };
  
  const Row = ({ label, value, last }) => <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: last ? 'none' : `1px solid ${C.border}` }}><span style={{ fontSize: 13.5, color: C.muted }}>{label}</span><span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{value ?? '—'}</span></div>;
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
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${C.primary}`, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'white', fontWeight: 700, flexShrink: 0 }}>
              {session?.user?.image ? <img src={session.user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 19, fontWeight: 700, marginBottom: 3 }}>{session?.user?.name || 'Chef'}</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 4 }}>{session?.user?.email || ''}</div>
              {age && <div style={{ fontSize: 11.5, color: C.muted }}>🎂 {age} years old</div>}
            </div>
          </div>
        </div>

        {/* Body metrics */}
        <Section title="BODY METRICS" onEdit={() => openEdit('body')}>
          <Row label="Age" value={age != null ? `${age} years` : '—'} />
          <Row label="Weight" value={profile?.weightKg ? `${profile.weightKg} kg` : '—'} />
          <Row label="Height" value={profile?.heightCm ? `${profile.heightCm} cm` : '—'} last />
        </Section>

        {/* Food preferences */}
        <Section title="FOOD PREFERENCES" onEdit={() => openEdit('food')}>
          <Row label="Diet type" value={PREF_LABEL[profile?.pref] || '—'} />
          <Row label="Allergies" value={profile?.allergies?.length ? profile.allergies.join(', ') : 'None'} last />
        </Section>

        {/* Fitness & goals */}
        <Section title="FITNESS & GOALS" onEdit={() => openEdit('fitness')}>
          <Row label="Activity level" value={ACTIVITY_LABEL[profile?.activity] || '—'} />
          <Row label="Body goal" value={GOAL_LABEL[profile?.bodyGoal] || '—'} />
          <Row label="Maintenance" value={profile?.maintenance ? `${profile.maintenance} kcal/day` : '—'} last />
        </Section>

        {/* Help & Support */}
        <a href="https://wa.me/919136906129" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 14 }}>
          <div style={{ background: '#075E54', borderRadius: 20, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 18px rgba(7,94,84,.4)' }}>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WhatsAppIcon size={40} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>WhatsApp Support</div>
              <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12.5 }}>Tap to chat with us directly</div>
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
          <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 38px', zIndex: 210, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 14px' }} />
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ flex: 1, fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 18 }}>{editMode === 'body' ? 'Body Metrics' : editMode === 'food' ? 'Food Preferences' : 'Fitness & Goals'}</div>
              <div onClick={() => setEditMode(null)} style={{ cursor: 'pointer', color: C.muted, fontSize: 22 }}>×</div>
            </div>

            {editMode === 'body' && (
              <div style={{ marginBottom: 16 }}>
                <SliderCard label="Age" val={editAge} set={setEditAge} min={13} max={80} lo="13 yrs" hi="80 yrs" display={`${editAge} yrs`} />
                <SliderCard label="Body weight" val={editWeight} set={setEditWeight} min={30} max={150} lo="30 kg" hi="150 kg" display={`${editWeight} kg`} />
                <SliderCard label="Height" val={editHeight} set={setEditHeight} min={130} max={220} lo="130 cm" hi="220 cm" display={`${editHeight} cm`} />
              </div>
            )}

            {editMode === 'fitness' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  {[{ id: 'sedentary', icon: '🪑', label: 'Sedentary', sub: 'Little or no exercise' }, { id: 'light', icon: '🚶', label: 'Light Activity', sub: '2–3 days/week' }, { id: 'moderate', icon: '🏋️', label: 'Moderate', sub: '4–5 days/week workout' }].map(o => (
                    <div key={o.id} className="tap" onClick={() => setEditActivity(o.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 14, padding: '13px 16px', marginBottom: 9, cursor: 'pointer', border: `2px solid ${editActivity === o.id ? C.primary : C.border}`, transition: 'border .2s' }}>
                      <span style={{ fontSize: 22 }}>{o.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: editActivity === o.id ? C.primary : C.text }}>{o.label}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{o.sub}</div>
                      </div>
                      {editActivity === o.id && <span style={{ color: C.primary, fontWeight: 700 }}>✓</span>}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 10, letterSpacing: 0.4 }}>BODY GOAL</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {[{ id: 'lean', label: 'Lean', sub: 'Lose fat' }, { id: 'fit', label: 'Fit', sub: 'Stay toned' }, { id: 'athletic', label: 'Athletic', sub: 'Build muscle' }].map(o => (
                    <div key={o.id} className="tap" onClick={() => setEditBodyGoal(o.id)} style={{ flex: 1, background: editBodyGoal === o.id ? C.primary : C.light, borderRadius: 14, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', transition: 'background .2s' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: editBodyGoal === o.id ? 'white' : C.text }}>{o.label}</div>
                      <div style={{ fontSize: 11, color: editBodyGoal === o.id ? 'rgba(255,255,255,.75)' : C.muted, marginTop: 2 }}>{o.sub}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {editMode === 'food' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: 0.5, marginBottom: 10 }}>DIET TYPE</div>
                {[{ id: 'veg', emoji: '🥗', label: 'Vegetarian', desc: 'Plant-based including dairy' }, { id: 'nonveg', emoji: '🍗', label: 'Non-Vegetarian', desc: 'Meat, poultry, seafood' }, { id: 'vegan', emoji: '🥑', label: 'Vegan', desc: 'Strict plant-based' }].map(o => (
                  <div key={o.id} className="tap" onClick={() => setEditPref(o.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 14, padding: '12px 16px', marginBottom: 8, cursor: 'pointer', border: `2px solid ${editPref === o.id ? C.primary : C.border}`, transition: 'border .2s' }}>
                    <span style={{ fontSize: 22 }}>{o.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: editPref === o.id ? C.primary : C.text }}>{o.label}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{o.desc}</div>
                    </div>
                    {editPref === o.id && <span style={{ color: C.primary, fontWeight: 700 }}>✓</span>}
                  </div>
                ))}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: 0.5, margin: '16px 0 10px' }}>FOOD ALLERGIES</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[{ id: 'dairy', label: 'Dairy 🥛', sub: 'Milk, cheese, butter' }, { id: 'gluten', label: 'Gluten 🌾', sub: 'Wheat, rye, barley' }, { id: 'nuts', label: 'Tree Nuts 🥜', sub: 'Almonds, walnuts' }, { id: 'eggs', label: 'Eggs 🥚', sub: 'All egg products' }, { id: 'shellfish', label: 'Shellfish 🦐', sub: 'Shrimp, crab, lobster' }, { id: 'soy', label: 'Soy 🫘', sub: 'Tofu, edamame' }, { id: 'fish', label: 'Fish 🐟', sub: 'All fish varieties' }, { id: 'none', label: 'No Allergies ✅', sub: 'I can eat everything' }].map(o => {
                    const sel = editAllergies.includes(o.id);
                    return (
                      <div key={o.id} className="tap" onClick={() => toggleAllergyEdit(o.id)} style={{ background: sel ? '#FDF5F0' : 'white', borderRadius: 14, padding: '10px 12px', cursor: 'pointer', border: `2px solid ${sel ? C.primary : 'transparent'}`, transition: 'all .2s' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: sel ? C.primary : C.text, marginBottom: 2 }}>{o.label}</div>
                        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.35 }}>{o.sub}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button className="tap" onClick={saveChanges} disabled={!hasChanged} style={{ width: '100%', padding: '14px', borderRadius: 50, border: 'none', background: hasChanged ? C.primary : '#D0C8BC', color: 'white', fontSize: 15, fontWeight: 600, cursor: hasChanged ? 'pointer' : 'default', fontFamily: 'DM Sans', transition: 'background .2s' }}>
              Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ══ NOTIFICATIONS SCREEN ══ */
const NotificationsScreen = ({ go, notifications, setNotifications }) => {
  const [viewingDish, setViewingDish] = useState(null);

  const handleClick = notif => {
    if (notif.viewed) return;
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, viewed: true } : n));
    setViewingDish(notif.dish);
  };

  const ordinal = d => { const s = ['th','st','nd','rd'], v = d % 100; return d + (s[(v-20)%10] || s[v] || s[0]); };
  const fmtDate = iso => { const d = new Date(iso); return `${ordinal(d.getDate())} ${d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`; };

  const grouped = {};
  (notifications || []).forEach(n => {
    const key = new Date(n.addedAt).toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <>
      <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 40 }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
          <div className="tap" onClick={() => go('hearth')} style={{ width: 34, height: 34, borderRadius: '50%', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>←</div>
          <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 17 }}>Notifications</span>
        </div>
        <div style={{ padding: '16px 16px' }}>
          {sortedDates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', marginTop: 40 }}>
              <div style={{ fontSize: 50, marginBottom: 12 }}>🔔</div>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No notifications yet</h3>
              <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.6 }}>When your family adds dishes to the pool, they'll show up here.</p>
            </div>
          ) : (
            sortedDates.map(dateKey => (
              <div key={dateKey} style={{ marginBottom: 26 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontFamily: 'Playfair Display', fontSize: 15, fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>{fmtDate(grouped[dateKey][0].addedAt)}</span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {grouped[dateKey].map(notif => (
                    <div key={notif.id} onClick={() => handleClick(notif)} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.06)', display: 'flex', cursor: notif.viewed ? 'default' : 'pointer', position: 'relative' }}>
                      {notif.dish.img && <img src={notif.dish.img} alt={notif.dish.name} style={{ width: 80, height: 80, objectFit: 'cover', flexShrink: 0 }} />}
                      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>{notif.dish.name}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{notif.dish.cal} kcal · {notif.dish.protein}g protein</div>
                        <span style={{ fontSize: 11, color: notif.viewed ? C.muted : C.primary, fontWeight: 600 }}>✓ {notif.viewed ? 'Viewed' : 'Added to pool — tap to view recipe'}</span>
                      </div>
                      {notif.viewed && <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,239,224,.55)', pointerEvents: 'none' }} />}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {viewingDish && <RecipeModal dish={viewingDish} close={() => setViewingDish(null)} />}
    </>
  );
};

/* ══ HEARTH ══ */
const HearthScreen = ({ go, showRecipe, profile, members, setMembers, plannedMeals, inviteCode, roomName, hasNotif, setDishPool, onDishAddedToPool }) => {
  const [memberMenu, setMemberMenu] = useState(null);
  const [navCopied, setNavCopied] = useState(false);
  const [fitness, setFitness] = useState({ steps: 0, calories: 0 });
  const [linkInput, setLinkInput] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');

  const handleAddToPool = async () => {
    const url = linkInput.trim();
    if (!url) return;
    if (url.includes('instagram.com') || url.includes('instagr.am')) {
      setLinkError("Instagram links can't be auto-extracted. Please use Add Manually in the Planner instead.");
      return;
    }
    setLinkLoading(true); setLinkError('');
    try {
      const res = await fetch('/api/extract-dish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (!res.ok || data.error) { setLinkError(data.message || 'Could not extract dish from this link.'); setLinkLoading(false); return; }
      if (setDishPool) setDishPool(prev => [...prev, data.dish]);
      if (onDishAddedToPool) onDishAddedToPool(data.dish);
      setLinkInput('');
      setLinkError('');
    } catch { setLinkError('Network error. Please try again.'); }
    setLinkLoading(false);
  };

  useEffect(() => {
    fetch('/api/fitness')
      .then(r => r.json())
      .then(d => { if (d.steps !== undefined) setFitness(d); })
      .catch(() => {});
  }, []);

  const handleAddMember = async () => {
    const code = inviteCode || '——';
    const userName = members[0]?.name || 'A friend';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const text = `Hey, ${userName} here!\n\nI've just joined Ruchak Aadhar and wanted to invite you to join the family pool so we can curate and create multiple dishes together.\n\nUse this invite code: ${code}\nDownload & open the app: ${appUrl}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Join me on Ruchak Aahar', text }); } catch (_) {}
    } else {
      await navigator.clipboard?.writeText(text);
      alert('Invite message copied to clipboard!');
    }
  };
  const target = profile?.target || 2000;
  const burned = fitness.calories;
  const foodCal = Object.entries(plannedMeals)
    .filter(([k]) => k.startsWith(`0_${TODAY_DOW}_`))
    .reduce((sum, [, v]) => sum + (v?.dish?.cal || 0), 0);
  const remain = Math.max(target - foodCal + burned, 0);
  const rR = 46, circR = 2 * Math.PI * rR;
  const todayEntry = Object.entries(plannedMeals).find(([k]) => k.startsWith(`0_${TODAY_DOW}_`));
  const todaysDish = todayEntry?.[1]?.dish || null;
  const toggleEating = id => setMembers(ms => ms.map(m => m.id === id ? { ...m, eating: !m.eating } : m));
  const setCook = id => setMembers(ms => ms.map(m => ({ ...m, isCook: m.id === id })));
  return (
    <div style={{ paddingBottom: 100, minHeight: '100vh', background: C.bg }}>
      <StickyNav
        left={<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="tap" onClick={() => go('profile')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: '4px 6px 4px 0' }}>
            <MenuIcon />
          </div>
          <div>
            <div style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 15, color: C.primary, lineHeight: 1.3 }}>{roomName || 'The Culinary Hearth'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.muted, marginTop: 2 }}>
              <span>Code: {inviteCode || '——'}</span>
              {inviteCode && (
                <span onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(inviteCode); setNavCopied(true); setTimeout(() => setNavCopied(false), 1800); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: navCopied ? C.green : C.primary }}>
                  {navCopied ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : <CopyIcon />}
                </span>
              )}
            </div>
          </div>
        </div>}
        right={<div className="tap" onClick={() => go('notifications')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '6px' }}><BellIcon filled={!!hasNotif} /></div>}
      />
      <div style={{ padding: '14px 20px 0' }}>
        {/* Search / link */}
        <div>
          <div style={{ display: 'flex', background: 'white', borderRadius: 50, overflow: 'hidden', alignItems: 'center', padding: '4px 4px 4px 14px', boxShadow: '0 2px 10px rgba(0,0,0,.07)', marginBottom: linkError ? 6 : 14 }}>
            <span style={{ fontSize: 14, marginRight: 7, color: C.muted, flexShrink: 0 }}>🔍</span>
            <input value={linkInput} onChange={e => { setLinkInput(e.target.value); setLinkError(''); }} onKeyDown={e => e.key === 'Enter' && handleAddToPool()} placeholder="Paste a recipe link to add a dish…" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12.5, background: 'transparent', fontFamily: 'DM Sans', color: C.text, minWidth: 0 }} />
            <button className="tap" onClick={handleAddToPool} disabled={linkLoading || !linkInput.trim()} style={{ background: linkInput.trim() ? C.primary : '#D0C8BC', color: 'white', border: 'none', borderRadius: 50, padding: '9px 13px', fontSize: 12, fontWeight: 600, cursor: linkInput.trim() ? 'pointer' : 'default', fontFamily: 'DM Sans', flexShrink: 0, transition: 'background .2s' }}>{linkLoading ? '…' : 'Add to pool'}</button>
          </div>
          {linkError && <div style={{ fontSize: 12, color: '#E53935', paddingLeft: 14, marginBottom: 10 }}>{linkError}</div>}
        </div>
        {/* Calorie ring */}
        <div style={{ background: C.dark, borderRadius: 20, padding: '18px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Ring — arc grows clockwise from 3 o'clock as food is logged */}
            <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
              <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="55" cy="55" r={rR} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" />
                {foodCal > 0 && (
                  <circle cx="55" cy="55" r={rR} fill="none" stroke={C.primary} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${circR * Math.min(foodCal / target, 1)} ${circR}`} />
                )}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', width: '100%' }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 20, fontFamily: 'Playfair Display', lineHeight: 1.1 }}>{remain}</div>
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 10.5, marginTop: 2 }}>Remaining</div>
              </div>
            </div>
            {/* Divider */}
            <div style={{ width: 1, height: 76, background: 'rgba(255,255,255,.15)', flexShrink: 0, margin: '0 14px' }} />
            {/* Stats */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4956A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 11 }}>Food</div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 17, fontFamily: 'Playfair Display', lineHeight: 1.2 }}>{foodCal} <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,.5)' }}>/ {target} cal</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4956A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="4" r="2"/><path d="m15.5 8.5-1.5 3-3 1.5-1.5 3M9 12l-3 4"/><path d="m15 12 3 4"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 11 }}>Exercise · {fitness.steps.toLocaleString()} steps</div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 17, fontFamily: 'Playfair Display', lineHeight: 1.2 }}>+{burned} <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,.5)' }}>cal burned</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* At The Table */}
        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, marginBottom: 12 }}>At The Table Today</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {members.map(m => (
            <div key={m.id} style={{ background: 'white', borderRadius: 18, padding: '14px', textAlign: 'center', position: 'relative' }}>
              <div onClick={() => setMemberMenu(m)} style={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer', fontSize: 13, color: C.muted, fontWeight: 900, letterSpacing: .5, padding: '2px 4px' }}>•••</div>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 7 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: m.color || '#D4956A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white', fontFamily: 'Playfair Display', overflow: 'hidden' }}>
                  {m.avatar_url ? <img src={m.avatar_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.initials}
                </div>
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: m.eating ? C.green : '#F44336', border: '2px solid white' }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name}</div>
              {m.isCook && <div style={{ fontSize: 10, color: C.primary, fontWeight: 700, marginTop: 2, letterSpacing: .3 }}>COOKING TONIGHT</div>}
            </div>
          ))}
          <div className="tap" onClick={handleAddMember} style={{ background: 'white', borderRadius: 18, padding: '14px', textAlign: 'center', border: `2px dashed ${C.border}`, cursor: 'pointer' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 7px', color: C.muted }}>+</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>Add Member</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: .3 }}>GROW THE GROUP</div>
          </div>
        </div>
        {/* Tonight's Plan */}
        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, marginBottom: 12 }}>Tonight's Plan</h2>
        <div style={{ background: 'white', borderRadius: 22, padding: '32px 24px', textAlign: 'center', marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
          <div style={{ fontSize: 50, marginBottom: 10 }}>🍲</div>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, marginBottom: 7 }}>No dishes yet!</h3>
          <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.65, marginBottom: 18 }}>Your family hasn't voted on tonight's dinner yet.<br />Start voting or add directly to the Planner.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="tap" onClick={() => go('match')} style={{ background: C.primary, color: 'white', border: 'none', borderRadius: 50, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>Vote in Match</button>
            <button className="tap" onClick={() => go('planner')} style={{ background: 'white', color: C.text, border: `2px solid ${C.border}`, borderRadius: 50, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>Open Planner</button>
          </div>
        </div>
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
const AddDishModal = ({ onAdd, onClose, roomId }) => {
  const [name, setName] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [cal, setCal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fiber, setFiber] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const ok = name.trim() && cal && protein && carbs && fiber;
  const iSt = { width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '9px 14px', fontSize: 14, fontFamily: 'DM Sans', outline: 'none', color: C.text, background: 'white' };
  const handleImagePick = e => {
    const file = e.target.files?.[0];
    if (file) { setImgFile(file); setImgPreview(URL.createObjectURL(file)); }
  };
  const handleSubmit = async () => {
    if (!ok || loading) return;
    setLoading(true); setApiError('');
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('calories', cal);
      fd.append('protein', protein);
      fd.append('carbs', carbs);
      fd.append('fiber', fiber);
      if (roomId) fd.append('room_id', roomId);
      if (imgFile) fd.append('image', imgFile);
      const res = await fetch('/api/dishes', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error || 'Failed to save'); setLoading(false); return; }
      onAdd({ id: data.dish.id, name: data.dish.name, img: data.dish.image_url || imgPreview, cal: data.dish.calories, protein: data.dish.protein, carbs: data.dish.carbs, fiber: data.dish.fiber, personal: true });
      onClose();
    } catch (_) { setApiError('Network error, please retry.'); setLoading(false); }
  };
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 150 }} />
      <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 38px', zIndex: 160, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#E0D8CC', margin: '0 auto 14px' }} />
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Add to Planner</h3>

        {/* Image picker */}
        <label style={{ display: 'block', marginBottom: 12, cursor: 'pointer' }}>
          <div style={{ borderRadius: 16, height: 130, overflow: 'hidden', border: `2px dashed ${C.border}`, background: C.light, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {imgPreview ? (
              <img src={imgPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 6 }}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>Add Dish Photo</span>
                <span style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Camera · Gallery</span>
              </>
            )}
            {imgPreview && (
              <div onClick={e => { e.preventDefault(); setImgPreview(null); }} style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700, zIndex: 2 }}>×</div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />
        </label>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: .4 }}>DISH NAME *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chole Bhature" style={iSt} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[['CALORIES *', cal, setCal], ['PROTEIN (g) *', protein, setProtein], ['CARBS (g) *', carbs, setCarbs], ['FIBER (g) *', fiber, setFiber]].map(([l, v, s]) => (
            <div key={l}>
              <label style={{ fontSize: 10, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: .3 }}>{l}</label>
              <input type="number" value={v} onChange={e => s(e.target.value)} placeholder="0" style={{ ...iSt, textAlign: 'center', fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 20, color: C.primary, padding: '8px 6px' }} />
            </div>
          ))}
        </div>
        {apiError && <p style={{ color: '#E53935', fontSize: 12.5, textAlign: 'center', marginBottom: 8 }}>{apiError}</p>}
        <button className="tap" onClick={handleSubmit} disabled={!ok || loading} style={{ width: '100%', padding: '13px', borderRadius: 50, border: 'none', background: ok && !loading ? C.primary : '#D0C8BC', color: 'white', fontSize: 14, fontWeight: 600, cursor: ok && !loading ? 'pointer' : 'default', fontFamily: 'DM Sans' }}>
          {loading ? 'Saving…' : 'Add to Planner'}
        </button>
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
      <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 38px', zIndex: 160 }}>
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

/* ══ ADD MEAL SHEET ══ */
const getTabForHour = hour => {
  const breakfast = ['7 AM', '8 AM', '9 AM', '10 AM'];
  const lunch = ['11 AM', '12 PM', '1 PM', '2 PM'];
  if (breakfast.includes(hour)) return 'breakfast';
  if (lunch.includes(hour)) return 'lunch';
  return 'dinner';
};

const getMealTypeForDish = dish => {
  const cal = dish.cal || 0;
  if (dish.mealType) return dish.mealType;
  if (cal < 300) return 'breakfast';
  if (cal <= 450) return 'dinner';
  return 'lunch';
};

const AddMealSheet = ({ hour, dishPool, onSelectDish, onAddManually, onClose }) => {
  const [tab, setTab] = useState(() => getTabForHour(hour));
  const [search, setSearch] = useState('');
  const filtered = (dishPool || []).filter(d =>
    getMealTypeForDish(d) === tab &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 150 }} />
      <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 34px', zIndex: 160, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#E0D8CC', margin: '0 auto 16px' }} />
        {/* Meal type tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['breakfast', '🌅', 'Breakfast'], ['lunch', '☀️', 'Lunch'], ['dinner', '🌙', 'Dinner']].map(([id, ic, label]) => (
            <div key={id} onClick={() => setTab(id)} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 12, background: tab === id ? C.primary : C.light, color: tab === id ? 'white' : C.muted, cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all .2s' }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{ic}</div>{label}
            </div>
          ))}
        </div>
        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', background: C.light, borderRadius: 12, padding: '9px 14px', marginBottom: 12 }}>
          <span style={{ color: C.muted, fontSize: 15, marginRight: 8 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontFamily: 'DM Sans', color: C.text }} />
          {search && <span onClick={() => setSearch('')} style={{ cursor: 'pointer', color: C.muted, fontSize: 18, lineHeight: 1 }}>×</span>}
        </div>
        {/* Dish list */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 20px', color: C.muted }}>
              <div style={{ fontSize: 38, marginBottom: 8 }}>{tab === 'breakfast' ? '🌅' : tab === 'lunch' ? '☀️' : '🌙'}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No {tab} dishes yet</div>
              <div style={{ fontSize: 12 }}>{search ? 'Try a different search or' : 'Add a dish manually or switch tabs to'} find something</div>
            </div>
          ) : (
            filtered.map(d => (
              <div key={d.id} onClick={() => onSelectDish(d)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F9F6F2', borderRadius: 14, padding: '10px 12px', marginBottom: 8, cursor: 'pointer' }}>
                {d.img ? <img src={d.img} alt={d.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 48, height: 48, borderRadius: 10, background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🍽</div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize: 11.5, color: C.muted }}>🔥 {d.cal} kcal · 💪 {d.protein}g · 🌾 {d.carbs}g</div>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>+</div>
              </div>
            ))
          )}
        </div>
        {/* Add manually */}
        <div onClick={onAddManually} style={{ textAlign: 'center', padding: '13px', borderRadius: 14, border: `2px dashed ${C.border}`, cursor: 'pointer' }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: C.primary }}>+ Can't find your dish? Add manually</span>
        </div>
      </div>
    </>
  );
};

/* ══ PLANNER ══ */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const _plannerToday = new Date();
_plannerToday.setHours(0, 0, 0, 0);
const TODAY_DOW = (_plannerToday.getDay() + 6) % 7; // 0=Mon … 6=Sun

const getDateForIdx = absIdx => {
  const d = new Date(_plannerToday);
  d.setDate(_plannerToday.getDate() - TODAY_DOW + absIdx);
  return d;
};

const PlannerScreen = ({ go, showRecipe, isAdmin, plannedMeals, setPlannedMeals, roomId, dishPool, setDishPool, onDishAddedToPool }) => {
  const [selDay, setSelDay] = useState(TODAY_DOW);
  const [addTarget, setAddTarget] = useState(null);
  const [addManual, setAddManual] = useState(false);
  const [repeatTarget, setRepeatTarget] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState('');
  const isFutureDay = selDay > TODAY_DOW;
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800); };
  const HOURS = ['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'];
  const weekOffset = Math.floor(selDay / 7);
  const weekStart = weekOffset * 7;
  const weekDates = Array.from({ length: 7 }, (_, i) => getDateForIdx(weekStart + i));
  const dates = weekDates.map(d => d.getDate());
  const key = (abs, h) => `${Math.floor(abs / 7)}_${abs % 7}_${h}`;
  const getMeal = h => plannedMeals[key(selDay, h)] || null;
  const addMeal = (h, dish) => setPlannedMeals(p => ({ ...p, [key(selDay, h)]: { dish, repeat: 'once' } }));
  const removeMeal = h => setPlannedMeals(p => { const n = { ...p }; delete n[key(selDay, h)]; return n; });
  const setRepeatFn = (h, rep) => setPlannedMeals(p => ({ ...p, [key(selDay, h)]: { ...p[key(selDay, h)], repeat: rep } }));
  const absHasMeal = abs => HOURS.some(h => plannedMeals[key(abs, h)]);
  const rl = { once: '', daily: 'Every day', weekly: 'Every week', monthly: 'Every month' };
  const monthLabel = getDateForIdx(selDay).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  return (
    <div style={{ paddingBottom: 100, minHeight: '100vh', background: C.bg }} onClick={() => setOpenMenu(null)}>
      <StickyNav left={<span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 21 }}>Meal Plan</span>} />
      <div style={{ background: 'white', margin: '12px 20px', borderRadius: 18, padding: '14px', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 15 }}>📅</span><span style={{ fontWeight: 600, fontSize: 13.5 }}>{monthLabel}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div onClick={() => setSelDay(d => d - 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 700, userSelect: 'none' }}>◀</div>
            <span onClick={() => setSelDay(TODAY_DOW)} style={{ fontSize: 12, fontWeight: 600, color: C.primary, cursor: 'pointer', padding: '4px 10px', borderRadius: 20, background: '#FDF5F0' }}>Today</span>
            <div onClick={() => setSelDay(d => d + 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 700, userSelect: 'none' }}>▶</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
          {DAYS.map((d, i) => {
            const absIdx = weekStart + i;
            const isToday = absIdx === TODAY_DOW;
            const isSelected = selDay === absIdx;
            return (
              <div key={d} onClick={() => setSelDay(absIdx)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 10, color: isToday ? C.primary : C.muted, marginBottom: 4, fontWeight: isToday ? 700 : 500 }}>{d}</div>
                <div style={{ width: 30, height: 30, borderRadius: '50%', margin: '0 auto', background: isSelected ? C.primary : isToday ? '#FDF5F0' : 'transparent', color: isSelected ? 'white' : isToday ? C.primary : C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: isSelected || isToday ? 700 : 400, fontSize: 13, transition: 'all .2s', border: isToday && !isSelected ? `1.5px solid ${C.primary}` : 'none' }}>{dates[i]}</div>
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
                  <div onClick={() => {
                    if (isFutureDay) {
                      const dayName = getDateForIdx(selDay).toLocaleDateString('en-IN', { weekday: 'long' });
                      showToast(`Add dishes on ${dayName} when it arrives ✨`);
                    } else {
                      setAddTarget({ hour: t });
                    }
                  }} style={{ color: '#C4B8A8', fontSize: 22, cursor: isFutureDay ? 'default' : 'pointer', lineHeight: 1, paddingTop: 2, display: 'inline-block' }}>+</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav active="planner" go={go} />
      {toast && (
        <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: C.dark, color: 'white', padding: '11px 20px', borderRadius: 50, fontSize: 13, fontWeight: 500, zIndex: 300, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,.25)', pointerEvents: 'none' }}>
          {toast}
        </div>
      )}
      {addTarget && !addManual && (
        <AddMealSheet
          hour={addTarget.hour}
          dishPool={dishPool || []}
          onSelectDish={d => { addMeal(addTarget.hour, d); setAddTarget(null); }}
          onAddManually={() => setAddManual(true)}
          onClose={() => setAddTarget(null)}
        />
      )}
      {addTarget && addManual && (
        <AddDishModal
          onAdd={d => {
            if (setDishPool) setDishPool(prev => [...prev, d]);
            if (onDishAddedToPool) onDishAddedToPool(d);
            addMeal(addTarget.hour, d);
            setAddTarget(null);
            setAddManual(false);
          }}
          onClose={() => { setAddTarget(null); setAddManual(false); }}
          roomId={roomId}
        />
      )}
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
  const [dishPool, setDishPool] = useState(DISH_POOL);
  const [notifications, setNotifications] = useState([]);
  const [roomId, setRoomId] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('culinary_room_id') : null);
  const [inviteCode, setInviteCode] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('culinary_invite_code') : null);
  const [roomName, setRoomName] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('culinary_room_name') : null);
  const [members, setMembers] = useState([{ id: 1, name: 'You', role: 'admin', initials: 'YO', eating: true, color: '#D4956A', isCook: true }]);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!session?.user) return;
    const name = session.user.name || 'You';
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    setMembers(ms => ms.map((m, i) => i === 0 ? { ...m, name, initials, avatar_url: session.user.image } : m));
  }, [session?.user?.email]);

  useEffect(() => {
    if (roomId) localStorage.setItem('culinary_room_id', roomId);
    else localStorage.removeItem('culinary_room_id');
  }, [roomId]);

  useEffect(() => {
    if (inviteCode) localStorage.setItem('culinary_invite_code', inviteCode);
    else localStorage.removeItem('culinary_invite_code');
  }, [inviteCode]);

  useEffect(() => {
    if (roomName) localStorage.setItem('culinary_room_name', roomName);
    else localStorage.removeItem('culinary_room_name');
  }, [roomName]);

  // After Google sign-in: check profile + room → route to correct screen
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { setScreen('welcome'); hasNavigated.current = false; return; }
    if (status !== 'authenticated' || hasNavigated.current) return;
    hasNavigated.current = true;

    fetch('/api/profile')
      .then(r => r.json())
      .then(async p => {
        if (p && (p.age || p.date_of_birth || p.weight_kg)) {
          setProfileRaw({
            age: p.age, weightKg: p.weight_kg, heightCm: p.height_cm,
            pref: p.food_pref, allergies: p.allergies,
            activity: p.activity_level, bodyGoal: p.body_goal,
            target: p.target_cal, maintenance: p.maintenance_cal,
          });
          // Always check DB for latest room info
          try {
            const r = await fetch('/api/rooms/join');
            if (r.ok) {
              const { roomId: dbRoom, inviteCode: dbInvite, roomName: dbRoomName } = await r.json();
              if (dbRoom) {
                setRoomId(dbRoom);
                if (dbInvite) setInviteCode(dbInvite);
                if (dbRoomName) setRoomName(dbRoomName);
                go('hearth'); return;
              }
            }
          } catch (_) {}
          // Fallback: localStorage fast path
          const savedRoom = localStorage.getItem('culinary_room_id');
          if (savedRoom) { go('hearth'); return; }
          go('createjoin');
        } else {
          go('onboarding1');
        }
      })
      .catch(() => go('onboarding1'));
  }, [status]);

  const setProfile = fn => setProfileRaw(fn);
  const go = s => { setScreen(s); if (typeof window !== 'undefined') window.scrollTo(0, 0); };
  const hasNotif = notifications.some(n => !n.viewed);
  const addDishNotification = dish => setNotifications(prev => [...prev, { id: Date.now(), dish, addedAt: new Date().toISOString(), viewed: false }]);
  const onVote = (id, liked) => setVotes(v => ({ ...v, [id]: liked }));
  const onRoomCreated = (rId, rCode, rName) => {
    setRoomId(rId); setInviteCode(rCode); setRoomName(rName); go('hearth');
  };
  const screens = {
    welcome: <WelcomeScreen go={go} />,
    onboarding1: <Onboarding1 go={go} setProfile={setProfile} />,
    onboarding2: <Onboarding2 go={go} setProfile={setProfile} />,
    onboarding3: <Onboarding3 go={go} profile={profile} setProfile={setProfile} />,
    createjoin: <CreateJoinScreen go={go} userName={members[0]?.name || 'Chef'} onRoomCreated={onRoomCreated} />,
    joincode: <JoinCodeScreen go={go} />,
    hearth: <HearthScreen go={go} showRecipe={setRecipe} profile={profile} members={members} setMembers={setMembers} plannedMeals={plannedMeals} inviteCode={inviteCode} roomName={roomName} hasNotif={hasNotif} setDishPool={setDishPool} onDishAddedToPool={addDishNotification} />,
    match: <MatchScreen go={go} showRecipe={setRecipe} dishPool={dishPool} votes={votes} onVote={onVote} profile={profile} setPlannedMeals={setPlannedMeals} />,
    planner: <PlannerScreen go={go} showRecipe={setRecipe} isAdmin={true} plannedMeals={plannedMeals} setPlannedMeals={setPlannedMeals} roomId={roomId} dishPool={dishPool} setDishPool={setDishPool} onDishAddedToPool={addDishNotification} />,
    profile: <ProfileScreen go={go} profile={profile} setProfile={setProfile} session={session} />,
    notifications: <NotificationsScreen go={go} notifications={notifications} setNotifications={setNotifications} />,
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
