'use client';

import { useState } from 'react';
import { COLORS } from '../../lib/constants';
import ImagePickerSheet from '../shared/ImagePickerSheet';

// ── Main Modal ────────────────────────────────────────────────────
export default function AddDishModal({ onAdd, onClose }) {
  const [name,    setName]    = useState('');
  const [imgUrl,  setImgUrl]  = useState('');
  const [imgPreview, setImgPreview] = useState('');
  const [cal,     setCal]     = useState('');
  const [protein, setProtein] = useState('');
  const [carbs,   setCarbs]   = useState('');
  const [fiber,   setFiber]   = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const ok = name.trim() && cal;
  const iSt = {
    width: '100%', border: `1.5px solid ${COLORS.border}`,
    borderRadius: 12, padding: '9px 14px', fontSize: 14,
    fontFamily: 'DM Sans', outline: 'none', color: COLORS.text,
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 150 }} />
      <div
        className="slide-up"
        style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 390, background: 'white',
          borderRadius: '22px 22px 0 0', padding: '14px 20px 38px',
          zIndex: 160, maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#E0D8CC', margin: '0 auto 12px' }} />
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Add Dish Manually</h3>

        {/* Image picker area */}
        <div
          onClick={() => setShowPicker(true)}
          style={{
            marginBottom: 12, borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
            border: `2px dashed ${imgUrl ? 'transparent' : COLORS.border}`,
            height: imgUrl ? 160 : 90,
            background: imgUrl ? 'transparent' : COLORS.light,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}
        >
          {imgUrl ? (
            <>
              <img src={imgPreview || imgUrl} alt="dish" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ color: 'white', fontSize: 12, fontWeight: 700, background: 'rgba(0,0,0,.4)', padding: '5px 12px', borderRadius: 20 }}>
                  📷 Change photo
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>📷</div>
              <div style={{ fontSize: 12.5, color: COLORS.muted, fontWeight: 600 }}>Add a photo</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Camera · Gallery</div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 9 }}>
          <label style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: 0.4 }}>DISH NAME *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chole Bhature" style={iSt} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            ['CALORIES *', cal, setCal],
            ['PROTEIN (g)', protein, setProtein],
            ['CARBS (g)', carbs, setCarbs],
            ['FIBER (g)', fiber, setFiber],
          ].map(([l, v, s]) => (
            <div key={l}>
              <label style={{ fontSize: 10, color: COLORS.muted, fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: 0.3 }}>{l}</label>
              <input
                type="number" value={v} onChange={(e) => s(e.target.value)} placeholder="0"
                style={{ ...iSt, textAlign: 'center', fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 20, color: COLORS.primary, padding: '8px 6px' }}
              />
            </div>
          ))}
        </div>

        <button
          className="tap"
          onClick={() => {
            if (ok) {
              onAdd({
                id:       Date.now(),
                name:     name.trim(),
                img:      imgUrl || null,
                cal:      +cal    || 0,
                protein:  +protein || 0,
                carbs:    +carbs   || 0,
                fiber:    +fiber   || 0,
                personal: true,
              });
              onClose();
            }
          }}
          style={{
            width: '100%', padding: '13px', borderRadius: 50, border: 'none',
            background: ok ? COLORS.primary : '#D0C8BC', color: 'white',
            fontSize: 14, fontWeight: 600, cursor: ok ? 'pointer' : 'default',
            fontFamily: 'DM Sans',
          }}
        >
          Add to Planner
        </button>
      </div>

      {showPicker && (
        <ImagePickerSheet
          onPicked={(url, preview) => {
            setImgUrl(url);
            setImgPreview(preview);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
