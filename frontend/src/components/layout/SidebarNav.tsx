'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/orders', label: 'Orders' },
  { href: '/dashboard/account', label: 'Account' },
];

export default function SidebarNav({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 lg:hidden ${
          open ? 'block' : 'hidden'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 transform
        transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="http://localhost:5000/assets/shree-saree-logo-3d_1.jpg"
                alt="Shree Saree"
                fill
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-sm">Shree Saree</div>
              <div className="text-xs text-slate-400">Customer Panel</div>
            </div>
          </div>
        </div>

        <nav className="mt-4 space-y-1 px-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium
                  transition-colors
                  ${active
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
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
