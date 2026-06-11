import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { OwnerSidebar } from './OwnerSidebar';
import { useAuth } from '../../context/AuthContext';

export function OwnerDashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const isPlatformOwner = user.role === 'Owner' || (user.role === 'Super Admin' && !user.school_id);
  if (!isPlatformOwner) return <Navigate to="/school" replace />;

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)] flex">
      <OwnerSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-[var(--text-tertiary)] hover:bg-[var(--surface-tertiary)] rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider hidden sm:block">Platform Owner</span>
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
