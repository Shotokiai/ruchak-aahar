'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { COLORS } from '../../lib/constants';
import { SliderCard } from '../shared/ui';
import ImagePickerSheet from '../shared/ImagePickerSheet';
import { api } from '../../lib/api';

const WHATSAPP_NUMBER = '919136906129';

const PREF_OPTS     = [
  { id: 'veg',    emoji: '🥗', label: 'Vegetarian',    desc: 'Plant-based including dairy' },
  { id: 'nonveg', emoji: '🍗', label: 'Non-Vegetarian', desc: 'Meat, poultry, seafood' },
  { id: 'vegan',  emoji: '🥑', label: 'Vegan',          desc: 'Strict plant-based' },
];
const ALLERGY_OPTS  = ['dairy','gluten','nuts','eggs','shellfish','soy','fish'];
const ACTIVITY_OPTS = [
  { id: 'sedentary', icon: '🪑', label: 'Sedentary',      sub: 'Little or no exercise' },
  { id: 'light',     icon: '🚶', label: 'Light Activity',  sub: '2–3 days/week' },
  { id: 'moderate',  icon: '🏋️', label: 'Moderate',       sub: '4–5 days/week workout' },
];
const GOAL_OPTS     = [
  { id: 'lean',     label: 'Lean',     sub: 'Lose fat' },
  { id: 'fit',      label: 'Fit',      sub: 'Stay toned' },
  { id: 'athletic', label: 'Athletic', sub: 'Build muscle' },
];
const PREF_LABEL     = { veg: 'Vegetarian 🥗', nonveg: 'Non-Vegetarian 🍗', vegan: 'Vegan 🥑' };
const ACTIVITY_LABEL = { sedentary: 'Sedentary 🪑', light: 'Light Activity 🚶', moderate: 'Moderate 🏋️' };
const GOAL_LABEL     = { lean: 'Lean — Lose fat', fit: 'Fit — Stay toned', athletic: 'Athletic — Build muscle' };

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date(), birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: `1px solid ${COLORS.border}` }}>
      <span style={{ fontSize: 13.5, color: COLORS.muted }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{value ?? '—'}</span>
    </div>
  );
}

function Section({ title, onEdit, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '6px 18px', marginBottom: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0 4px' }}>
        <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.6 }}>{title}</div>
        {onEdit && (
          <button onClick={onEdit} style={{ background: COLORS.light, border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: COLORS.primary, cursor: 'pointer', fontFamily: 'DM Sans' }}>
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Edit bottom sheet ─────────────────────────────────────────────
function EditSheet({ mode, profile, onSave, onClose }) {
  // Body metrics
  const [dob, setDob] = useState(profile?.dob || '');
  const [wt, setWt]     = useState(profile?.weightKg || 70);
  const [ht, setHt]     = useState(profile?.heightCm || 170);
  // Food prefs
  const [pref, setPref]         = useState(profile?.pref || 'nonveg');
  const [allergies, setAllergies] = useState(profile?.allergies?.filter(a => a !== 'none') || []);
  // Fitness
  const [activity, setActivity] = useState(profile?.activity || 'sedentary');
  const [bodyGoal, setBodyGoal] = useState(profile?.bodyGoal || 'fit');
  const [saving, setSaving]     = useState(false);
  const [ageError, setAgeError] = useState(false);

  const age = calcAge(dob);

  const toggleAllergy = (id) =>
    setAllergies((a) => a.includes(id) ? a.filter((x) => x !== id) : [...a, id]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {};
      if (mode === 'body') { 
        if (dob && age < 13) {
          setAgeError(true);
          setSaving(false);
          return;
        }
        if (dob) payload.dob = dob;
        payload.weight_kg = wt; 
        payload.height_cm = ht; 
      }
      if (mode === 'food')    { payload.food_pref = pref; payload.allergies = allergies.length ? allergies : ['none']; }
      if (mode === 'fitness') { payload.activity_level = activity; payload.body_goal = bodyGoal; }
      const result = await api.saveProfile(payload);
      onSave(result);
      onClose();
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const titles = { body: 'Body Metrics', food: 'Food Preferences', fitness: 'Fitness & Goals' };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200 }} />
      <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 38px', zIndex: 210, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#E0D8CC', margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ flex: 1, fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 18 }}>{titles[mode]}</div>
          <div onClick={onClose} style={{ cursor: 'pointer', color: COLORS.muted, fontSize: 22 }}>×</div>
        </div>

        {mode === 'body' && (
          <>
            {/* Date of birth */}
            <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Date of birth</div>
                {age !== null && age >= 13 && (
                  <span style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700, color: COLORS.primary }}>
                    {age} yrs
                  </span>
                )}
              </div>
              <input
                type="date"
                value={dob}
                min={`${new Date().getFullYear() - 100}-01-01`}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setDob(e.target.value);
                  setAgeError(false);
                }}
                style={{
                  width: '100%', border: `1.5px solid ${COLORS.border}`, borderRadius: 12,
                  padding: '10px 14px', fontSize: 16, fontFamily: 'DM Sans',
                  color: dob ? COLORS.text : COLORS.muted, outline: 'none',
                  background: 'transparent',
                }}
              />
              {ageError && (
                <div style={{ color: '#E53935', fontSize: 12, marginTop: 6 }}>Must be at least 13 years old.</div>
              )}
            </div>
            <SliderCard label="Body weight" val={wt} display={`${wt} kg`} set={setWt} min={30} max={150} lo="30 kg" hi="150 kg" />
            <SliderCard label="Height (cm)" val={ht} display={`${ht} cm`} set={setHt} min={130} max={220} lo="130 cm" hi="220 cm" />
          </>
        )}

        {mode === 'food' && (
          <>
            <div style={{ marginBottom: 16 }}>
              {PREF_OPTS.map((o) => (
                <div key={o.id} className="tap" onClick={() => setPref(o.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 14, padding: '12px 16px', marginBottom: 8, cursor: 'pointer', border: `2px solid ${pref === o.id ? COLORS.primary : COLORS.border}`, transition: 'border .2s' }}
                >
                  <span style={{ fontSize: 22 }}>{o.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: pref === o.id ? COLORS.primary : COLORS.text }}>{o.label}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>{o.desc}</div>
                  </div>
                  {pref === o.id && <span style={{ color: COLORS.primary, fontWeight: 700 }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.muted, marginBottom: 10, letterSpacing: 0.4 }}>ALLERGIES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              {ALLERGY_OPTS.map((id) => {
                const sel = allergies.includes(id);
                return (
                  <div key={id} className="tap" onClick={() => toggleAllergy(id)}
                    style={{ background: sel ? '#FDF5F0' : COLORS.light, borderRadius: 12, padding: '9px 12px', cursor: 'pointer', border: `2px solid ${sel ? COLORS.primary : 'transparent'}` }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, color: sel ? COLORS.primary : COLORS.text }}>
                      {id.charAt(0).toUpperCase() + id.slice(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {mode === 'fitness' && (
          <>
            <div style={{ marginBottom: 16 }}>
              {ACTIVITY_OPTS.map((o) => (
                <div key={o.id} className="tap" onClick={() => setActivity(o.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 14, padding: '13px 16px', marginBottom: 9, cursor: 'pointer', border: `2px solid ${activity === o.id ? COLORS.primary : COLORS.border}`, transition: 'border .2s' }}
                >
                  <span style={{ fontSize: 22 }}>{o.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: activity === o.id ? COLORS.primary : COLORS.text }}>{o.label}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>{o.sub}</div>
                  </div>
                  {activity === o.id && <span style={{ color: COLORS.primary, fontWeight: 700 }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.muted, marginBottom: 10, letterSpacing: 0.4 }}>BODY GOAL</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {GOAL_OPTS.map((o) => (
                <div key={o.id} className="tap" onClick={() => setBodyGoal(o.id)}
                  style={{ flex: 1, background: bodyGoal === o.id ? COLORS.primary : COLORS.light, borderRadius: 14, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', transition: 'background .2s' }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: bodyGoal === o.id ? 'white' : COLORS.text }}>{o.label}</div>
                  <div style={{ fontSize: 11, color: bodyGoal === o.id ? 'rgba(255,255,255,.75)' : COLORS.muted, marginTop: 2 }}>{o.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="tap" onClick={save} disabled={saving}
          style={{ width: '100%', padding: '14px', borderRadius: 50, border: 'none', background: COLORS.primary, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', marginTop: 8 }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </>
  );
}

// ── Main Profile Screen ───────────────────────────────────────────
export default function ProfileScreen({ go, profile, setProfile, onLogout }) {
  const { data: session } = useSession();
  const user = session?.user;

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarUrl, setAvatarUrl]               = useState(profile?.customAvatarUrl || null);
  const [editMode, setEditMode]                 = useState(null); // 'body' | 'food' | 'fitness'

  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const displayAvatar = avatarUrl || user?.image;

  const allergies = (profile?.allergies || []).filter((a) => a !== 'none');
  const age = profile?.dob ? calcAge(profile.dob) : profile?.age;

  const waMessage = encodeURIComponent(
    `Hi! I'm ${user?.name || 'a user'} on The Culinary Hearth app. Can we connect for 5 minutes? I have a quick question.`
  );

  const handleAvatarPicked = async (url) => {
    setAvatarUrl(url);
    setShowAvatarPicker(false);
    try {
      await api.saveProfile({ custom_avatar_url: url });
      setProfile?.((p) => ({ ...p, customAvatarUrl: url }));
    } catch (e) { console.error('Avatar save failed', e); }
  };

  const handleEditSave = (result) => {
    if (!result?.profile) return;
    const p = result.profile;
    setProfile?.((prev) => ({
      ...prev,
      weightKg:    p.weight_kg        ?? prev.weightKg,
      heightCm:    p.height_cm        ?? prev.heightCm,
      pref:        p.food_pref        ?? prev.pref,
      allergies:   p.allergies        ?? prev.allergies,
      activity:    p.activity_level   ?? prev.activity,
      bodyGoal:    p.body_goal        ?? prev.bodyGoal,
      target:      result.target      ?? prev.target,
      maintenance: result.maintenance ?? prev.maintenance,
    }));
  };

  const handleLogout = async () => {
    // Keep roomId and inviteCode so user returns to same room after login
    await signOut({ redirect: false });
    onLogout?.();
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: `1px solid ${COLORS.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
        <div className="tap" onClick={() => go('hearth')}
          style={{ width: 34, height: 34, borderRadius: '50%', background: COLORS.light, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
        >←</div>
        <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 17 }}>My Profile</span>
      </div>

      <div style={{ padding: '24px 16px 0' }}>

        {/* ── Identity card ─────────────────────────────────────── */}
        <div style={{ background: 'white', borderRadius: 24, padding: '22px 20px', marginBottom: 14, boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            {/* Tappable avatar */}
            <div className="tap" onClick={() => setShowAvatarPicker(true)}
              style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
            >
              <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${COLORS.primary}` }}>
                {displayAvatar
                  ? <img src={displayAvatar} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'white', fontFamily: 'Playfair Display' }}>{initials}</div>
                }
              </div>
              {/* Camera badge */}
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: COLORS.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', fontSize: 11 }}>
                📷
              </div>
            </div>

            {/* Name + email */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 19, fontWeight: 700, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Chef'}
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
              {profile?.dob && (
                <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 4 }}>
                  🎂 {new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Body metrics ──────────────────────────────────────── */}
        <Section title="BODY METRICS" onEdit={() => setEditMode('body')}>
          <Row label="Age" value={age != null ? `${age} years` : '—'} />
          <Row label="Weight" value={profile?.weightKg ? `${profile.weightKg} kg` : '—'} />
          <Row label="Height" value={profile?.heightCm ? `${profile.heightCm} cm` : '—'} />
        </Section>

        {/* ── Food preferences ──────────────────────────────────── */}
        <Section title="FOOD PREFERENCES" onEdit={() => setEditMode('food')}>
          <Row label="Diet type"  value={PREF_LABEL[profile?.pref] || '—'} />
          <Row label="Allergies"  value={allergies.length ? allergies.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(', ') : 'None'} />
        </Section>

        {/* ── Fitness & goals ───────────────────────────────────── */}
        <Section title="FITNESS & GOALS" onEdit={() => setEditMode('fitness')}>
          <Row label="Activity level" value={ACTIVITY_LABEL[profile?.activity] || '—'} />
          <Row label="Body goal"      value={GOAL_LABEL[profile?.bodyGoal] || '—'} />
          <Row label="Maintenance"    value={profile?.maintenance ? `${profile.maintenance} kcal/day` : '—'} />
        </Section>

        {/* ── WhatsApp support ──────────────────────────────────── */}
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`} target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'block', marginBottom: 14 }}
        >
          <div style={{ background: '#25D366', borderRadius: 20, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 18px rgba(37,211,102,.3)' }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>WhatsApp Support</div>
              <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 12.5 }}>Tap to chat with us directly</div>
            </div>
            <div style={{ color: 'white', fontSize: 18, opacity: 0.7 }}>→</div>
          </div>
        </a>

        {/* ── Logout ────────────────────────────────────────────── */}
        <button className="tap" onClick={handleLogout}
          style={{ width: '100%', padding: '15px', borderRadius: 50, border: '2px solid #E53935', background: 'white', color: '#E53935', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <span style={{ fontSize: 16 }}>🚪</span> Log Out
        </button>
        <div style={{ height: 16 }} />
      </div>

      {/* Avatar picker */}
      {showAvatarPicker && (
        <ImagePickerSheet
          uploadPath="avatars"
          onPicked={(url) => handleAvatarPicked(url)}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}

      {/* Edit sheet */}
      {editMode && (
        <EditSheet
          mode={editMode}
          profile={profile}
          onSave={handleEditSave}
          onClose={() => setEditMode(null)}
        />
      )}
    </div>
  );
}
