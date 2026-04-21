'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { COLORS } from '../../lib/constants';
import { StickyNav, BottomNav } from '../shared/ui';
import MemberMenuModal from '../modals/MemberMenuModal';
import AddDishModal from '../modals/AddDishModal';

export default function HearthScreen({ go, showRecipe, profile, members, setMembers, plannedMeals, dishPool, setDishPool, userName, roomId, setRoomId, inviteCode }) {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = (user?.name || userName || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const [memberMenu, setMemberMenu] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const target = profile?.target || 2000;
  const ate = 0,
    burned = 0,
    remain = target;
  const pct = Math.max(ate / target, 0.04);
  const r = 36,
    circ = 2 * Math.PI * r;

  const todayEntry = Object.entries(plannedMeals).find(([k]) => k.startsWith('2_'));
  const todaysDish = todayEntry?.[1]?.dish || null;

  const toggleEating = (id) => setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, eating: !m.eating } : m)));
  const setCook = (id) => setMembers((ms) => ms.map((m) => ({ ...m, isCook: m.id === id })));

  const handleImportUrl = async () => {
    if (!urlInput.trim()) return;
    if (!roomId) {
      alert('⚠️ Please create or join a room first.');
      return;
    }
    
    setImporting(true);
    try {
      const response = await fetch('/api/dishes/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: urlInput,
          room_id: roomId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to import dish');
      }
      
      // Add the new dish to the pool
      if (data.dish) {
        setDishPool((prev) => [...prev, {
          id: Date.now(),
          name: data.dish.name,
          img: data.dish.image_url || 'https://via.placeholder.com/300?text=' + encodeURIComponent(data.dish.name),
          protein: data.dish.protein || 0,
          carbs: data.dish.carbs || 0,
          fiber: data.dish.fiber || 0,
          cal: data.dish.calories || 0,
          desc: data.dish.description || '"Imported from reel"',
          ingredients: data.dish.ingredients || [],
          steps: data.dish.steps || [],
        }]);
        setUrlInput('');
        alert(`✅ ${data.dish.name} added to the pool!`);
      }
    } catch (error) {
      console.error('Import error:', error);
      // Open manual entry modal instead of ugly alert
      setShowAddModal(true);
    } finally {
      setImporting(false);
    }
  };

  const handleAddMember = () => {
    const code = inviteCode || '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const joinLink = `${appUrl}/join?code=${code}`;
    const text = `Hey! Join my family room on The Culinary Hearth 🍽\n\nTap the link to sign in and join instantly:\n${joinLink}`;
    if (navigator.share) {
      navigator.share({ title: 'Join The Culinary Hearth', text, url: joinLink }).catch(() => {});
    } else {
      setShareOpen(true);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode || 'DISH42');
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div style={{ paddingBottom: 100, minHeight: '100vh', background: COLORS.bg }}>
      <StickyNav
        left={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              className="tap"
              onClick={() => go('profile')}
              title="View profile"
              style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, border: `2px solid ${COLORS.primary}` }}
            >
              {user?.image
                ? <img src={user.image} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'Playfair Display' }}>{initials}</div>
              }
            </div>
            <div>
              <div style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 15, color: COLORS.primary }}>The Culinary Hearth</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, color: COLORS.muted }}>Code: {inviteCode || '——'}</span>
                {inviteCode && (
                  <button
                    onClick={copyCode}
                    title="Copy invite code"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px', borderRadius: 4, display: 'flex', alignItems: 'center' }}
                  >
                    {codeCopied
                      ? <span style={{ fontSize: 10, color: COLORS.green, fontWeight: 700 }}>✓</span>
                      : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={COLORS.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        }
        right={<div onClick={() => go('notifications')} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.light, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>🔔</div>}
      />
      <div style={{ padding: '14px 20px 0' }}>
        {/* Search bar */}
        <div style={{ display: 'flex', background: 'white', borderRadius: 50, overflow: 'hidden', alignItems: 'center', padding: '4px 4px 4px 14px', boxShadow: '0 2px 10px rgba(0,0,0,.07)', marginBottom: 14 }}>
          <span style={{ fontSize: 14, marginRight: 7, color: COLORS.muted, flexShrink: 0 }}>🔍</span>
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleImportUrl()}
            placeholder="Search or paste link to add a dish…"
            disabled={importing}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12.5, background: 'transparent', fontFamily: 'DM Sans', color: COLORS.text, minWidth: 0 }}
          />
          <button
            className="tap"
            onClick={handleImportUrl}
            disabled={importing}
            style={{
              background: importing ? '#D0C8BC' : COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: 50,
              padding: '9px 13px',
              fontSize: 12,
              fontWeight: 600,
              cursor: importing ? 'default' : 'pointer',
              fontFamily: 'DM Sans',
              flexShrink: 0,
            }}
          >
            {importing ? '⏳ Loading...' : 'Add to pool'}
          </button>
        </div>

        {/* Calorie ring - New design */}
        <div style={{ background: '#1A1A1A', borderRadius: 20, padding: '20px 18px', marginBottom: 16, border: '2px solid #3A3A3A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Circle with progress */}
            <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle cx="60" cy="60" r={44} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="8" />
                {/* Progress arc - using gold color */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r={44} 
                  fill="none" 
                  stroke="#D4AF37" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  strokeDasharray={`${(circ * pct)} ${circ * (1 - pct)}`}
                  style={{ transition: 'stroke-dasharray 0.3s' }}
                />
              </svg>
              {/* Center text */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 24, fontFamily: 'Playfair Display', lineHeight: 1 }}>{remain}</div>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, marginTop: 2 }}>Remaining</div>
              </div>
            </div>

            {/* Right side - Food and Exercise */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginBottom: 4 }}>🍽️ Food</div>
                <div style={{ color: 'white', fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700 }}>{ate} <span style={{ fontSize: 13, fontWeight: 400 }}>Cal</span></div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginBottom: 4 }}>💪 Exercise</div>
                <div style={{ color: 'white', fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700 }}>{burned} <span style={{ fontSize: 13, fontWeight: 400 }}>Cal</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* At The Table */}
        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, marginBottom: 12 }}>At The Table Today</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {members.map((m) => (
            <div key={m.id} style={{ background: 'white', borderRadius: 18, padding: '14px', textAlign: 'center', position: 'relative' }}>
              <div onClick={() => setMemberMenu(m)} style={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer', fontSize: 13, color: COLORS.muted, fontWeight: 900, letterSpacing: 0.5, padding: '2px 4px' }}>
                •••
              </div>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 7 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: m.color || '#D4956A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white', fontFamily: 'Playfair Display' }}>
                  {m.initials}
                </div>
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: m.eating ? COLORS.green : '#F44336', border: '2px solid white' }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name}</div>
              {(m.isCook || m.role === 'admin') && <div style={{ fontSize: 10, color: COLORS.primary, fontWeight: 700, marginTop: 2, letterSpacing: 0.3 }}>COOKING TONIGHT</div>}
            </div>
          ))}
          <div className="tap" onClick={handleAddMember} style={{ background: 'white', borderRadius: 18, padding: '14px', textAlign: 'center', border: `2px dashed ${COLORS.border}`, cursor: 'pointer' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: COLORS.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 7px', color: COLORS.muted }}>
              +
            </div>
            <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.text }}>Add Member</div>
            <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2, letterSpacing: 0.3 }}>GROW THE GROUP</div>
          </div>
        </div>

        {/* Tonight's Plan */}
        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 19, marginBottom: 12 }}>Tonight's Plan</h2>
        {todaysDish ? (
          <div style={{ background: 'white', borderRadius: 22, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.07)', marginBottom: 20 }}>
            {todaysDish.img && <img src={todaysDish.img} alt={todaysDish.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />}
            <div style={{ padding: '14px 18px 18px' }}>
              <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>CONFIRMED</span>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 21, fontWeight: 700, margin: '9px 0 5px' }}>{todaysDish.name}</h3>
              {todaysDish.desc && <p style={{ color: COLORS.muted, fontSize: 13, fontStyle: 'italic', marginBottom: 14, lineHeight: 1.5 }}>{todaysDish.desc}</p>}
              <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
                {[
                  ['PROTEIN', todaysDish.protein],
                  ['FIBER', todaysDish.fiber],
                  ['CARBS', todaysDish.carbs],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
                      {v}<span style={{ fontSize: 12 }}> gm</span>
                    </div>
                    <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 700, marginTop: 2, letterSpacing: 0.5 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'right' }}>
                <button className="tap" onClick={() => showRecipe(todaysDish)} style={{ background: COLORS.primary, color: 'white', border: 'none', borderRadius: 50, padding: '10px 22px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>
                  View Recipe
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 22, padding: '60px 24px', textAlign: 'center', marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: 50, marginBottom: 10 }}>🍲</div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, marginBottom: 7 }}>No dishes yet!</h3>
            <p style={{ color: COLORS.muted, fontSize: 13.5, lineHeight: 1.65 }}>
              Your family hasn't voted on tonight's dinner yet.
            </p>
          </div>
        )}
      </div>
      <BottomNav active="hearth" go={go} />
      {memberMenu && <MemberMenuModal member={memberMenu} isAdmin={true} allMembers={members} onClose={() => setMemberMenu(null)} onToggleEating={() => toggleEating(memberMenu.id)} onSetCook={(id) => setCook(id)} />}

      {/* Manual add dish modal (fallback when URL import fails) */}
      {showAddModal && (
        <AddDishModal
          onAdd={(dish) => { setDishPool((p) => [...p, dish]); setShowAddModal(false); }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Share / Invite bottom sheet (desktop fallback) */}
      {shareOpen && (
        <>
          <div onClick={() => setShareOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 150 }} />
          <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 38px', zIndex: 160 }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: '#E0D8CC', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 19, fontWeight: 700, marginBottom: 4 }}>Invite to Your Hearth</h3>
            <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 18 }}>Share this code with your family to join</p>

            {/* Invite code display */}
            <div style={{ background: COLORS.light, borderRadius: 16, padding: '16px 20px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 700, letterSpacing: 6, color: COLORS.primary }}>{inviteCode || '——'}</span>
              <button onClick={copyCode} style={{ padding: '8px 16px', borderRadius: 20, background: codeCopied ? COLORS.green : COLORS.dark, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background .3s' }}>
                {codeCopied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            {/* Share options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href={(() => {
                  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
                  const joinLink = `${appUrl}/join?code=${inviteCode || ''}`;
                  const msg = `Hey! Join my family room on The Culinary Hearth 🍽\n\nTap to sign in and join instantly:\n${joinLink}`;
                  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#25D366', color: 'white', borderRadius: 14, padding: '13px 18px', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
              >
                <span style={{ fontSize: 20 }}>💬</span> Share via WhatsApp
              </a>
              <button
                onClick={() => {
                  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
                  const joinLink = `${appUrl}/join?code=${inviteCode || ''}`;
                  const msg = `Hey! Join my family room on The Culinary Hearth 🍽\n\nTap to sign in and join instantly:\n${joinLink}`;
                  navigator.clipboard.writeText(msg);
                  setCodeCopied(true);
                  setTimeout(() => { setCodeCopied(false); setShareOpen(false); }, 1500);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, background: COLORS.light, color: COLORS.text, border: 'none', borderRadius: 14, padding: '13px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans' }}
              >
                <span style={{ fontSize: 20 }}>📋</span> Copy invite message
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
