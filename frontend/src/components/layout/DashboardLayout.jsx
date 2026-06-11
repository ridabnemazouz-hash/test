import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { useAuth } from '../../context/AuthContext';
import { MobileBottomNav } from './MobileBottomNav';

export function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const isPlatformOwner = user.role === 'Owner' || (user.role === 'Super Admin' && !user.school_id);
  if (isPlatformOwner) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)] flex">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-5 sm:p-6 lg:p-8 overflow-auto pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full animate-slide-up">
            <Outlet />
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
