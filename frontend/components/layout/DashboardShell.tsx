'use client';

import { useState, useEffect } from 'react';
import SidebarNav from './SidebarNav';
import TopBar from './TopBar';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <SidebarNav
        open={isDesktop || sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDesktop={isDesktop}
      />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: isDesktop ? '256px' : '0',
        transition: 'margin-left 0.2s ease',
      }}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} isDesktop={isDesktop} />
        <main style={{ flex: 1, padding: '24px' }}>
          <div style={{ maxWidth: '1152px', margin: '0 auto' }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
