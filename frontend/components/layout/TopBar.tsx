'use client';

type Props = { onMenuClick: () => void; isDesktop: boolean };

export default function TopBar({ onMenuClick, isDesktop }: Props) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      backgroundColor: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isDesktop && (
          <button
            onClick={onMenuClick}
            style={{
              background: 'none', border: '1px solid #cbd5e1',
              borderRadius: '6px', padding: '6px 10px',
              cursor: 'pointer', fontSize: '18px', lineHeight: 1,
            }}
          >
            ☰
          </button>
        )}
        <span style={{ fontWeight: 600, fontSize: '18px', color: '#0f172a' }}>
          Dashboard
        </span>
      </div>
      <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
        Shree Saree
      </div>
    </header>
  );
}
