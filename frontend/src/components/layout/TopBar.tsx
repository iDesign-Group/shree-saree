'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';

export default function TopBar({
  onMenuClick,
}: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-slate-700 shadow-sm hover:bg-slate-50"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
            Dashboard
          </h1>
        </div>
        {/* Later: user avatar / logout */}
      </div>
    </header>
  );
}
