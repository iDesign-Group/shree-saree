'use client';

import { useState } from 'react';
import SidebarNav from './SidebarNav';
import TopBar from './TopBar';

export default function DashboardShell({
  children,
}: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar – fixed on desktop, overlay on mobile */}
      <SidebarNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
