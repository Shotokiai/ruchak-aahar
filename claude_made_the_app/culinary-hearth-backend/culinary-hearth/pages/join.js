// pages/join.js
// Deep link: /join?code=XXXXXX
// Flow:
//   - Not signed in → save code to sessionStorage → Google sign-in → back here → auto-join → hearth
//   - Already signed in → auto-join → hearth

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { COLORS } from '../lib/constants';
import { api } from '../lib/api';

export default function JoinPage() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const { code } = router.query;

  const [phase, setPhase] = useState('loading'); // loading | confirm | joining | error
  const [roomName, setRoomName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Persist code across the OAuth redirect
  useEffect(() => {
    if (!code) return;
    sessionStorage.setItem('pending_invite_code', code);
  }, [code]);

  // Once signed in, auto-join
  useEffect(() => {
    if (status === 'loading') return;

    const pendingCode = code || sessionStorage.getItem('pending_invite_code');
    if (!pendingCode) { router.replace('/'); return; }

    if (status === 'unauthenticated') {
      // Show sign-in prompt — the code is already saved in sessionStorage
      setPhase('signin');
      return;
    }

    // Authenticated — look up room then join
    setPhase('joining');
    api.joinRoom(pendingCode)
      .then((data) => {
        // Persist to localStorage (same keys CulinaryApp reads)
        localStorage.setItem('culinary_room_id',     data.room.id);
        localStorage.setItem('culinary_invite_code', pendingCode);
        sessionStorage.removeItem('pending_invite_code');
        setRoomName(data.room.name);
        setPhase('done');
        setTimeout(() => router.replace('/'), 1200);
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Room not found. The code may be invalid.');
        setPhase('error');
      });
  }, [status, code]);

  const displayCode = code || sessionStorage.getItem('pending_invite_code') || '';

  // ── UI ──────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: COLORS.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px', fontFamily: 'DM Sans',
    }}>
      {/* Logo */}
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, boxShadow: '0 8px 24px rgba(123,37,37,.3)', marginBottom: 18 }}>
        🍽
      </div>
      <div style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 22, color: COLORS.primary, marginBottom: 6 }}>
        The Culinary Hearth
      </div>

      {/* Code badge */}
      {displayCode && (
        <div style={{ background: 'white', borderRadius: 14, padding: '8px 20px', marginBottom: 28, boxShadow: '0 2px 10px rgba(0,0,0,.07)' }}>
          <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5 }}>ROOM CODE · </span>
          <span style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, letterSpacing: 4, color: COLORS.primary }}>{displayCode}</span>
        </div>
      )}

      {/* Phase: loading */}
      {phase === 'loading' && (
        <div style={{ color: COLORS.muted, fontSize: 14 }}>Loading…</div>
      )}

      {/* Phase: sign-in prompt */}
      {phase === 'signin' && (
        <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>You're invited!</h2>
          <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Sign in with Google to join this family room. It only takes a second.
          </p>
          <button
            onClick={() => signIn('google', { callbackUrl: `/join?code=${displayCode}` })}
            style={{
              width: '100%', padding: '15px', borderRadius: 50,
              border: '2px solid #1A1A1A', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      )}

      {/* Phase: joining */}
      {phase === 'joining' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Joining room…</div>
          <div style={{ color: COLORS.muted, fontSize: 13 }}>Just a moment</div>
        </div>
      )}

      {/* Phase: done */}
      {phase === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>🎉</div>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
            Welcome to {roomName || 'the family'}!
          </div>
          <div style={{ color: COLORS.muted, fontSize: 13 }}>Taking you to your Hearth…</div>
        </div>
      )}

      {/* Phase: error */}
      {phase === 'error' && (
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Couldn't join</div>
          <div style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>{errorMsg}</div>
          <button
            onClick={() => router.replace('/')}
            style={{ background: COLORS.primary, color: 'white', border: 'none', borderRadius: 50, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}
          >
            Go to Home
          </button>
        </div>
      )}
    </div>
  );
}
