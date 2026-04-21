import { COLORS } from '../../lib/constants';

// Icons
export const HouseIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 9L12 2L21 9V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9Z"
      stroke={active ? COLORS.primary : COLORS.muted}
      strokeWidth="2"
      fill={active ? COLORS.primary : 'none'}
    />
  </svg>
);

export const MatchIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21C12 21 3 15 3 8.5C3 6 5 4 7.5 4C9.24 4 10.91 4.96 12 6.5C13.09 4.96 14.76 4 16.5 4C19 4 21 6 21 8.5C21 15 12 21 12 21Z"
      stroke={active ? COLORS.primary : COLORS.muted}
      strokeWidth="2"
      fill={active ? COLORS.primary : 'none'}
    />
  </svg>
);

export const PlanIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={active ? COLORS.primary : COLORS.muted} strokeWidth="2" />
    <path
      d="M16 2V6M8 2V6M3 10H21"
      stroke={active ? COLORS.primary : COLORS.muted}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="8" cy="15" r="1.5" fill={active ? COLORS.primary : COLORS.muted} />
    <circle cx="12" cy="15" r="1.5" fill={active ? COLORS.primary : COLORS.muted} />
  </svg>
);

export const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={active ? COLORS.primary : COLORS.muted} strokeWidth="2" fill={active ? COLORS.primary : 'none'} />
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke={active ? COLORS.primary : COLORS.muted} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const GoogleG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// Bottom Navigation
export const BottomNav = ({ active, go }) => (
  <div
    style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 390,
      background: 'white',
      borderTop: `1px solid ${COLORS.border}`,
      padding: '12px 8px 22px',
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0,0,0,.06)',
    }}
  >
    {[
        { id: 'hearth',  label: 'Hearth',  ic: <HouseIcon  active={active === 'hearth'}  /> },
      { id: 'match',   label: 'Match',   ic: <MatchIcon  active={active === 'match'}   /> },
      { id: 'planner', label: 'Planner', ic: <PlanIcon   active={active === 'planner'} /> },
    ].map((t) => (
      <div
        key={t.id}
        className="tap"
        onClick={() => go(t.id)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          cursor: 'pointer',
          opacity: active === t.id ? 1 : 0.5,
          transition: 'opacity .2s',
        }}
      >
        {t.ic}
        <span
          style={{
            fontSize: 11,
            color: active === t.id ? COLORS.primary : COLORS.muted,
            fontWeight: active === t.id ? 700 : 400,
          }}
        >
          {t.label}
        </span>
      </div>
    ))}
  </div>
);

// Sticky Navigation
export const StickyNav = ({ left, right }) => (
  <div
    style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'white',
      borderBottom: `1px solid ${COLORS.border}`,
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 10px rgba(0,0,0,.06)',
    }}
  >
    <div style={{ flex: 1 }}>{left}</div>
    {right || <div style={{ width: 38 }} />}
  </div>
);

// Slider Card
export const SliderCard = ({ label, val, display, set, min, max, lo, hi }) => (
  <div style={{ background: 'white', borderRadius: 18, padding: '16px 20px', marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
      <span style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700, color: COLORS.primary }}>
        {display || val}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={val}
      onChange={(e) => set(+e.target.value)}
      style={{
        WebkitAppearance: 'none',
        width: '100%',
        height: 4,
        borderRadius: 2,
        background: '#E0D8CC',
        outline: 'none',
      }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.muted, marginTop: 6 }}>
      <span>{lo}</span>
      <span>{hi}</span>
    </div>
  </div>
);

// Toggle Switch
export const Toggle = ({ on, onToggle }) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    style={{
      width: 46,
      height: 26,
      borderRadius: 13,
      background: on ? COLORS.green : '#D0C8BC',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background .25s',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 3,
        left: on ? 23 : 3,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,.2)',
        transition: 'left .25s',
      }}
    />
  </div>
);
