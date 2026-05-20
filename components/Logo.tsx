'use client';

interface LogoProps {
  size?: number;
  withBackground?: boolean;
  className?: string;
}

export function MinDoraIcon({ size = 64, withBackground = true, className = '' }: LogoProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', display: 'inline-flex' }}>
      {withBackground && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: '#1A3448',
        }} />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Wind lines */}
        <path d="M30 28 Q40 22 50 26 Q60 30 68 24" stroke="#A8C8D8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M34 22 Q44 16 52 20" stroke="#A8C8D8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        {/* Main leaf */}
        <ellipse cx="50" cy="60" rx="20" ry="28" fill="#A8C8D8" transform="rotate(-10 50 60)" />
        <ellipse cx="50" cy="60" rx="20" ry="28" fill="none" stroke="#1A3448" strokeWidth="2" transform="rotate(-10 50 60)" />
        {/* Leaf vein */}
        <path d="M44 42 Q48 60 46 78" stroke="#1A3448" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
        {/* Accent leaves */}
        <ellipse cx="72" cy="52" rx="9" ry="14" fill="#C4A98A" transform="rotate(30 72 52)" opacity="0.8" />
        <ellipse cx="30" cy="68" rx="7" ry="11" fill="#C4A98A" transform="rotate(-20 30 68)" opacity="0.6" />
        {/* Gentle particles */}
        <circle cx="68" cy="35" r="2.5" fill="#A8C8D8" opacity="0.6" />
        <circle cx="75" cy="42" r="1.8" fill="#A8C8D8" opacity="0.4" />
        <circle cx="62" cy="29" r="1.5" fill="#C4A98A" opacity="0.5" />
      </svg>
    </div>
  );
}

export function MinDoraAvatar({ size = 32 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#1A3448', overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 100 100" fill="none">
        <ellipse cx="50" cy="60" rx="20" ry="28" fill="#A8C8D8" transform="rotate(-10 50 60)" />
        <path d="M30 28 Q40 22 50 26 Q60 30 68 24" stroke="#A8C8D8" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="72" cy="52" rx="9" ry="14" fill="#C4A98A" transform="rotate(30 72 52)" opacity="0.8" />
      </svg>
    </div>
  );
}

export function MinDoraLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeMap = { sm: 32, md: 48, lg: 64, xl: 88 };
  const fontSize = { sm: 18, md: 24, lg: 32, xl: 42 };
  const px = sizeMap[size];
  const fs = fontSize[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <MinDoraIcon size={px} withBackground={false} />
      <span style={{
        fontFamily: 'var(--font-boogaloo), cursive',
        fontSize: fs,
        color: '#1A3448',
        fontWeight: 400,
      }}>MinDora</span>
    </div>
  );
}
