import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Settings, Sparkles } from 'lucide-react';
import { cn } from '../../utils';
import { useAuth } from '../../context/AuthContext';

export function MobileBottomNav() {
  const { user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, path: '/school', label: 'Home' },
    { icon: Users, path: '/school/students', label: 'Students', roles: ['Super Admin', 'Admin'] },
    { icon: Sparkles, path: '/school/ai-tutor', label: 'AI Tutor', roles: ['Student', 'Teacher', 'Parent'] },
    { icon: MessageSquare, path: '/school/chat', label: 'Chat' },
    { icon: Settings, path: '/school/settings', label: 'Settings' },
  ];

  const filteredItems = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)]/90 backdrop-blur-xl border-t border-[var(--border)] px-4 pb-safe">
      <div className="flex items-center justify-between h-16 max-w-md mx-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/school'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 transition-all duration-150',
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'rounded-lg p-1 transition-colors duration-150',
                  isActive && 'bg-[var(--accent)]/10'
                )}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  'text-[10px] font-semibold mt-0.5',
                  isActive ? 'opacity-100' : 'opacity-70'
                )}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
