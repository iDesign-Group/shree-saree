'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: '🏠 Overview' },
  { href: '/dashboard/products', label: '🛍️ Products' },
  { href: '/dashboard/orders', label: '📦 Orders' },
  { href: '/dashboard/account', label: '👤 Account' },
  { href: '/dashboard/settings', label: '⚙️ Settings' },
];

export default function SidebarNav({
  open,
  onClose,
  isDesktop,
}: {
  open: boolean;
  onClose: () => void;
  isDesktop: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 30,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: '256px',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid #1e293b',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.3px' }}>
              Shree Saree
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Customer Panel
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => !isDesktop && onClose()}
                style={{
                  display: 'block',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  backgroundColor: active ? '#1e293b' : 'transparent',
                  color: active ? '#ffffff' : '#cbd5e1',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
