'use client';

import { useState, useEffect } from 'react';
import { COLORS } from '../../lib/constants';
import { api } from '../../lib/api';

export default function JoinCodeScreen({ go, setRoomId, setInviteCode }) {
  const [code, setCode] = useState('');
  const [found, setFound] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => setFound(code.length === 6), [code]);

  return (
    <div className="slide-up" style={{ padding: '52px 24px 40px', minHeight: '100vh', background: COLORS.bg }}>
      <div
        className="tap"
        onClick={() => go('createjoin')}
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: '#E8DDD0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginBottom: 24,
          fontSize: 16,
        }}
      >
        ←
      </div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 28,
            boxShadow: `0 8px 24px rgba(123,37,37,.3)`,
          }}
        >
          🔑
        </div>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700 }}>Join a Family Room</h1>
        <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 6 }}>Enter the 6-char code your family shared</p>
      </div>
      <div style={{ background: 'white', borderRadius: 18, padding: '18px 20px', marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>
          INVITE CODE
        </label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
          placeholder="DISH42"
          maxLength={6}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: 36,
            fontFamily: 'Playfair Display',
            fontWeight: 700,
            letterSpacing: 8,
            color: COLORS.primary,
            background: 'transparent',
            textAlign: 'center',
          }}
        />
      </div>
      {found && !joining && (
        <div style={{ background: '#FFF8E1', borderRadius: 12, padding: '10px 14px', marginBottom: 12, color: '#B57F00', fontSize: 13.5, textAlign: 'center' }}>
          ✓ Found: <strong>Sharma Family</strong> · 3 members
        </div>
      )}
      {joining && (
        <div style={{ background: '#E8F5E9', borderRadius: 12, padding: '10px 14px', marginBottom: 12, color: '#2E7D32', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>
          Joining…
        </div>
      )}
      <button
        className="tap"
        onClick={async () => {
          if (!found || joining) return;
          setJoining(true);
          try {
            const data = await api.joinRoom(code);
            setRoomId(data.room.id);
            setInviteCode(code); // the entered code IS the invite code
            go('hearth');
          } catch (err) {
            alert(err.message || 'Room not found. Check the code and try again.');
            setJoining(false);
          }
        }}
        style={{
          width: '100%',
          padding: '15px',
          borderRadius: 50,
          border: 'none',
          background: found ? COLORS.primary : '#D0C8BC',
          color: 'white',
          fontSize: 15,
          fontWeight: 600,
          cursor: found ? 'pointer' : 'default',
          fontFamily: 'DM Sans',
          transition: 'background .2s',
        }}
      >
        Join Room
      </button>
    </div>
  );
}
