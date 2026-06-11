import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils';
import {
  LayoutDashboard, School, CreditCard, Shield, Settings, LogOut, Crown, X,
  HardDrive, Plug, FileText, Code
} from 'lucide-react';

export function OwnerSidebar({ mobileOpen = false, onClose }) {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Schools', path: '/schools', icon: School },
    { name: 'Security', path: '/security-center', icon: Shield },
    { name: 'Backups', path: '/backups', icon: HardDrive },
    { name: 'Billing', path: '/billing', icon: CreditCard },
    { name: 'Integrations', path: '/integrations', icon: Plug },
    { name: 'Logs', path: '/security', icon: FileText },
    { name: 'Dev Console', path: '/dev-db', icon: Code },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-sm">
            <Crown size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-semibold text-[var(--sidebar-text)] tracking-tight">EduSaaS</span>
            <span className="block text-[10px] text-[var(--sidebar-muted)] font-medium uppercase tracking-wider leading-none">Owner</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-[var(--sidebar-muted)] hover:text-[var(--sidebar-text)] p-1">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <p className="px-3 text-[10px] font-semibold text-[var(--sidebar-muted)] uppercase tracking-widest mb-2">Platform</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-[var(--sidebar-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 mb-2 px-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--sidebar-text)] truncate">{user?.name}</p>
            <p className="text-[10px] text-[var(--sidebar-muted)] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); if (onClose) onClose(); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--sidebar-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors duration-150"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in" onClick={onClose} />
      )}
      <aside className="hidden md:flex w-64 flex-col h-screen fixed left-0 top-0 z-30 bg-[var(--sidebar-bg)] border-r border-white/5">
        {sidebarContent}
      </aside>
      <aside className={`fixed inset-y-0 left-0 w-64 flex-col h-screen z-50 bg-[var(--sidebar-bg)] border-r border-white/5 transform transition-transform duration-300 md:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>
    </>
  );
}
