'use client';

import { useState, useRef } from 'react';
import { COLORS } from '../../lib/constants';

// Reusable Google-Lens-style photo picker bottom sheet
// Props:
//   onPicked(publicUrl, localPreviewUrl) — called after successful upload
//   onClose() — called when dismissed
//   uploadPath — Supabase storage sub-folder, e.g. "dishes" or "avatars"

export default function ImagePickerSheet({ onPicked, onClose, uploadPath = 'dishes' }) {
  const cameraRef  = useRef(null);
  const galleryRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(null);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    const local = URL.createObjectURL(file);
    setPreview(local);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('path', uploadPath);
      const res  = await fetch('/api/upload/image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onPicked(data.url, local);
    } catch (err) {
      alert('Upload failed: ' + err.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300 }} />
      <div
        className="slide-up"
        style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 390, background: 'white',
          borderRadius: '22px 22px 0 0', zIndex: 310, paddingBottom: 34,
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#E0D8CC', margin: '10px auto 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px 10px', borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ flex: 1, fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 17 }}>Add a photo</div>
          <div onClick={onClose} style={{ cursor: 'pointer', color: COLORS.muted, fontSize: 22, lineHeight: 1 }}>×</div>
        </div>

        {uploading ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            {preview && <img src={preview} alt="" style={{ width: 90, height: 90, borderRadius: 12, objectFit: 'cover', marginBottom: 12 }} />}
            <div style={{ color: COLORS.muted, fontSize: 13 }}>Uploading…</div>
          </div>
        ) : (
          <>
            <div
              onClick={() => cameraRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}` }}
            >
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: COLORS.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📷</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Open Camera</div>
                <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>Take a photo right now</div>
              </div>
            </div>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment"
              style={{ display: 'none' }} onChange={(e) => upload(e.target.files?.[0])} />

            <div style={{ padding: '12px 20px 8px', fontSize: 11, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5 }}>RECENTS</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, padding: '0 2px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  onClick={() => galleryRef.current?.click()}
                  style={{
                    aspectRatio: '1', background: i === 0 ? COLORS.primary : COLORS.light,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden',
                  }}
                >
                  {i === 0
                    ? <div style={{ textAlign: 'center', padding: 8 }}><div style={{ fontSize: 22, marginBottom: 4 }}>🖼️</div><div style={{ color: 'white', fontSize: 10, fontWeight: 600 }}>Choose Photo</div></div>
                    : <div style={{ color: COLORS.muted, fontSize: 22, opacity: 0.3 }}>+</div>
                  }
                </div>
              ))}
            </div>
            <input ref={galleryRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={(e) => upload(e.target.files?.[0])} />

            <div style={{ padding: '10px 20px 0', textAlign: 'center', color: COLORS.muted, fontSize: 11.5 }}>
              Tap any cell to choose from your photos
            </div>
          </>
        )}
      </div>
    </>
  );
}
