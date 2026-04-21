'use client';

import { useState } from 'react';
import { COLORS } from '../../lib/constants';

export default function CreateJoinScreen({ go, userName, setRoomId, setInviteCode }) {
  const [mode, setMode] = useState(null);
  const [roomName, setRoomName] = useState('');

  if (mode === 'create')
    return (
      <div className="slide-up" style={{ padding: '52px 24px 40px', minHeight: '100vh', background: COLORS.bg }}>
        <div
          className="tap"
          onClick={() => setMode(null)}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#E8DDD0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginBottom: 22,
            fontSize: 16,
          }}
        >
          ←
        </div>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          Create your <span style={{ color: COLORS.primary }}>Family Room</span>
        </h1>
        <p style={{ color: COLORS.muted, marginBottom: 22, fontSize: 14 }}>Name your hearth and invite your family</p>
        <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: 0.5 }}>
            FAMILY ROOM NAME
          </label>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g. Sharma Family"
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 16, fontFamily: 'DM Sans', color: COLORS.text, background: 'transparent' }}
          />
        </div>
        <button
          className="tap"
          onClick={async () => {
            try {
              const response = await fetch('/api/rooms/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: roomName }),
              });
              if (!response.ok) throw new Error('Failed to create room');
              const data = await response.json();
              setRoomId(data.room.id);
              setInviteCode(data.room.invite_code);
              go('hearth');
            } catch (error) {
              console.error('Room creation error:', error);
              alert('❌ Failed to create room. Please try again.');
            }
          }}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: 50,
            border: 'none',
            background: roomName.length > 1 ? COLORS.primary : '#D0C8BC',
            color: 'white',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'DM Sans',
          }}
        >
          Create Room & Continue
        </button>
      </div>
    );

  return (
    <div className="fade-in" style={{ padding: '52px 24px 40px', minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 30,
            boxShadow: `0 8px 24px rgba(123,37,37,.3)`,
          }}
        >
          🍽
        </div>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700 }}>
          Welcome, <span style={{ color: COLORS.primary }}>{userName || 'Chef'}</span>!
        </h1>
        <p style={{ color: COLORS.muted, marginTop: 6, fontSize: 14 }}>Set up your family hearth.</p>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          className="tap"
          onClick={() => setMode('create')}
          style={{ background: COLORS.primary, borderRadius: 20, padding: '22px', cursor: 'pointer', boxShadow: `0 8px 28px rgba(123,37,37,.28)` }}
        >
          <div style={{ fontSize: 30, marginBottom: 7 }}>🏡</div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 17, fontFamily: 'Playfair Display', marginBottom: 3 }}>Create Family Room</div>
          <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 13 }}>Start your hearth as Admin</div>
        </div>
        <div className="tap" onClick={() => go('joincode')} style={{ background: 'white', borderRadius: 20, padding: '22px', cursor: 'pointer', border: `2px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 30, marginBottom: 7 }}>🔑</div>
          <div style={{ fontWeight: 700, fontSize: 17, fontFamily: 'Playfair Display', marginBottom: 3 }}>Join Family Room</div>
          <div style={{ color: COLORS.muted, fontSize: 13 }}>Enter an invite code from your family</div>
        </div>
      </div>
    </div>
  );
}
