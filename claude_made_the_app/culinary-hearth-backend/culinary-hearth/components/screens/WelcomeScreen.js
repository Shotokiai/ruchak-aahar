'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { COLORS } from '../../lib/constants';
import { GoogleG } from '../shared/ui';

const slides = [
  {
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80',
    title: 'No more dinner debates',
    desc: 'Turn "What\'s for dinner?" into a celebration. We handle the consensus so you can focus on the cooking.',
  },
  {
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80',
    title: 'AI-powered recipe extraction',
    desc: 'Paste a reel or blog link — we extract the dish, ingredients and nutrition instantly.',
  },
  {
    img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80',
    title: 'Family-wide voting',
    desc: 'Give everyone a seat at the table. Vote on the weekly menu and find meals everyone loves.',
  },
];

export default function WelcomeScreen({ go }) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % 3), 3800);
    return () => clearInterval(t);
  }, []);

  const s = slides[slide];

  return (
    <div
      className="fade-in"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '52px 24px 40px', background: COLORS.bg }}
    >
      {/* CENTRED logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 26 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px rgba(123,37,37,.3)`,
          }}
        >
          <span style={{ fontSize: 26, color: 'white' }}>🍽</span>
        </div>
        <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, color: COLORS.primary }}>
          The Culinary Hearth
        </span>
      </div>

      <div style={{ borderRadius: 28, overflow: 'hidden', height: 254, marginBottom: 24, boxShadow: '0 12px 32px rgba(0,0,0,.14)' }}>
        <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ flex: 1, minHeight: 86 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700, marginBottom: 9, lineHeight: 1.25, textAlign: 'center' }}>
          {s.title}
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 13.5, lineHeight: 1.65, textAlign: 'center' }}>{s.desc}</p>
      </div>

      <div style={{ display: 'flex', gap: 7, justifyContent: 'center', margin: '14px 0 20px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            onClick={() => setSlide(i)}
            style={{
              height: 6,
              borderRadius: 3,
              background: i === slide ? COLORS.primary : '#D8CFBF',
              width: i === slide ? 28 : 8,
              transition: 'all .3s',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      <button
        className="tap"
        onClick={() => signIn('google', { callbackUrl: '/' })}
        style={{
          width: '100%',
          padding: '15px',
          borderRadius: 50,
          border: '2px solid #1A1A1A',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'DM Sans',
        }}
      >
        <GoogleG /> Sign in with Google
      </button>
    </div>
  );
}
