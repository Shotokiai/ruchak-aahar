'use client';

import { useState } from 'react';
import { COLORS } from '../../lib/constants';
import { Toggle } from '../shared/ui';

export default function MemberMenuModal({ member, isAdmin, allMembers, onClose, onToggleEating, onSetCook }) {
  const [showCookPicker, setShowCookPicker] = useState(false);
  const otherMembers = allMembers.filter((m) => m.id !== member.id);
  // Get the current member from allMembers to get the latest eating state
  const currentMember = allMembers.find((m) => m.id === member.id) || member;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 150 }} />
      <div className="slide-up" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: 'white', borderRadius: '22px 22px 0 0', padding: '14px 20px 36px', zIndex: 160 }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#E0D8CC', margin: '0 auto 14px' }} />
        {/* Member name + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: member.color || '#D4956A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              fontWeight: 700,
              color: 'white',
            }}
          >
            {member.initials}
          </div>
          <div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 17, fontWeight: 700 }}>{member.name}</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 1 }}>{member.role === 'admin' ? 'Admin' : 'Member'}</div>
          </div>
        </div>

        {!showCookPicker ? (
          <>
            {/* Row 1: Eating tonight toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 14, background: '#F9F6F2', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Eating tonight?</div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>{currentMember.eating ? 'Currently marked as eating' : 'Currently skipping tonight'}</div>
              </div>
              <Toggle on={currentMember.eating} onToggle={() => onToggleEating()} />
            </div>

            {/* Row 2: Transfer cook (admin only, opens picker) */}
            {isAdmin && (
              <div
                className="tap"
                onClick={() => setShowCookPicker(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: '#F9F6F2',
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>👨‍🍳 Who's cooking tonight?</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>Transfer cooking duty to another member</div>
                </div>
                <span style={{ fontSize: 14, color: COLORS.muted }}>›</span>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Cook picker */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor: 'pointer' }}
              onClick={() => setShowCookPicker(false)}
            >
              <span style={{ fontSize: 14, color: COLORS.primary }}>‹</span>
              <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.primary }}>Who's cooking tonight?</div>
            </div>
            <p style={{ fontSize: 12.5, color: COLORS.muted, marginBottom: 12 }}>Select the member who will cook tonight's dinner</p>
            {allMembers.map((m) => (
              <div
                key={m.id}
                className="tap"
                onClick={() => {
                  onSetCook(m.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 13,
                  marginBottom: 8,
                  background: m.isCook || (m.role === 'admin' && !allMembers.some((x) => x.isCook && x.role !== 'admin')) ? '#FDF5F0' : '#F9F6F2',
                  border: `2px solid ${m.isCook ? COLORS.primary : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: m.color || '#D4956A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0,
                  }}
                >
                  {m.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.muted }}>{m.role === 'admin' ? 'Admin' : 'Member'}</div>
                </div>
                {(m.isCook || (m.role === 'admin' && !allMembers.some((x) => x.isCook && x.role !== 'admin'))) && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary }}>COOKING</span>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
