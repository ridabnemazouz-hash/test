import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../utils';
import { t } from '../../i18n/translations';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, FileText,
  CalendarCheck, Settings, LogOut, Bus, UserPlus, FileDown, MessageSquare, Calendar, CreditCard, X,
  Sparkles, TrendingUp, Wallet, Shield, Video, School, Trophy, User,
  ChevronLeft
} from 'lucide-react';

export function Sidebar({ mobileOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const getNavItems = () => {
    const navKeys = {
      dashboard: 'dashboard', admins: 'admins', accounts: 'accounts',
      schools: 'schools', students: 'students', teachers: 'teachers',
      parents: 'parents', classes: 'classes', subjects: 'subjects',
      transport: 'transport', myClasses: 'myClasses', myStudents: 'myStudents',
      planning: 'planning', aiTutor: 'aiTutor', expenses: 'expenses',
      salaries: 'salaries', security: 'security', payments: 'payments',
      grades: 'grades', attendance: 'attendance', lessons: 'lessons',
      chat: 'chat', rooms: 'rooms', settings: 'settings',
      tournaments: 'tournaments', clubs: 'clubs', players: 'players', matches: 'matches',
      logout: 'logout',
    };

    const items = [
      { name: t(lang, navKeys.dashboard), path: '/school', icon: LayoutDashboard, roles: ['Super Admin', 'Admin', 'Teacher', 'Student', 'Parent'] },
      { name: t(lang, navKeys.admins), path: '/school/admins', icon: Users, roles: ['Super Admin'] },
      { name: t(lang, navKeys.accounts), path: '/school/accounts', icon: UserPlus, roles: ['Super Admin', 'Admin'] },
      { name: t(lang, navKeys.schools), path: '/schools', icon: School, roles: ['Super Admin'], ownerOnly: true },
      { name: t(lang, navKeys.security), path: '/school/security', icon: Shield, roles: ['Super Admin'], ownerOnly: true },
      { name: t(lang, navKeys.students), path: '/school/students', icon: Users, roles: ['Super Admin', 'Admin'] },
      { name: t(lang, navKeys.teachers), path: '/school/teachers', icon: GraduationCap, roles: ['Super Admin', 'Admin'] },
      { name: t(lang, navKeys.parents), path: '/school/parents', icon: Users, roles: ['Super Admin', 'Admin'] },
      { name: t(lang, navKeys.classes), path: '/school/classes', icon: BookOpen, roles: ['Super Admin', 'Admin'] },
      { name: t(lang, navKeys.subjects), path: '/school/subjects', icon: BookOpen, roles: ['Super Admin', 'Admin', 'Teacher'] },
      { name: t(lang, navKeys.grades), path: '/school/grades', icon: FileText, roles: ['Super Admin', 'Admin', 'Teacher', 'Student', 'Parent'] },
      { name: t(lang, navKeys.planning), path: '/school/planning', icon: Calendar, roles: ['Super Admin', 'Admin', 'Teacher', 'Student', 'Parent'] },
      { name: t(lang, navKeys.transport), path: '/school/transport', icon: Bus, roles: ['Super Admin', 'Admin'] },
      { name: t(lang, navKeys.expenses), path: '/school/expenses', icon: TrendingUp, roles: ['Super Admin', 'Admin'] },
      { name: t(lang, navKeys.salaries), path: '/school/salaries', icon: Wallet, roles: ['Super Admin', 'Admin'] },
      { name: t(lang, navKeys.myClasses), path: '/school/my-classes', icon: BookOpen, roles: ['Teacher'] },
      { name: t(lang, navKeys.myStudents), path: '/school/my-students', icon: Users, roles: ['Teacher'] },
      { name: t(lang, navKeys.aiTutor), path: '/school/ai-tutor', icon: Sparkles, roles: ['Student', 'Teacher', 'Parent'] },
      { name: t(lang, navKeys.payments), path: '/school/payments', icon: CreditCard, roles: ['Super Admin', 'Admin', 'Parent'] },
      { name: t(lang, navKeys.attendance), path: '/school/attendance', icon: CalendarCheck, roles: ['Teacher', 'Student', 'Parent'] },
      { name: t(lang, navKeys.lessons), path: '/school/content', icon: FileDown, roles: ['Teacher', 'Student', 'Parent'] },
      { name: t(lang, navKeys.chat), path: '/school/chat', icon: MessageSquare, roles: ['Super Admin', 'Admin', 'Teacher', 'Student', 'Parent'] },
      { name: t(lang, navKeys.rooms), path: '/school/rooms', icon: Video, roles: ['Super Admin', 'Admin', 'Teacher', 'Student', 'Parent'] },
      { name: t(lang, navKeys.settings), path: '/school/settings', icon: Settings, roles: ['Super Admin', 'Admin', 'Teacher', 'Student', 'Parent'] },
      { name: 'البطولات', path: '/school/tournaments', icon: Trophy, roles: ['Super Admin', 'Admin'] },
      { name: 'الكلوبات', path: '/school/clubs', icon: Users, roles: ['Super Admin', 'Admin'] },
      { name: 'اللاعبون', path: '/school/players', icon: User, roles: ['Super Admin', 'Admin'] },
      { name: 'المباريات', path: '/school/matches', icon: Calendar, roles: ['Super Admin', 'Admin'] },
    ];

    return items.filter(item => {
      const roleMatch = item.roles.includes(user?.role);
      const ownerMatch = item.ownerOnly ? (user?.role === 'Owner' || !user?.school_id) : true;
      return roleMatch && ownerMatch;
    });
  };

  const renderNavLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={onClose}
        className={({ isActive }) =>
          cn(
            'sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
            isActive
              ? 'text-[var(--sidebar-active)] bg-[var(--sidebar-active)]/10'
              : 'text-[var(--sidebar-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]'
          )
        }
      >
        {({ isActive }) => (
          <>
            <div className={cn(
              'w-5 h-5 flex items-center justify-center rounded-md transition-all duration-150',
              isActive ? 'text-[var(--sidebar-active)]' : 'text-[var(--sidebar-muted)] group-hover:text-[var(--sidebar-text)]'
            )}>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>{item.name}</span>
          </>
        )}
      </NavLink>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--sidebar-active)] flex items-center justify-center shadow-sm">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-semibold text-[var(--sidebar-text)] tracking-tight">EduSaaS</span>
            <span className="block text-[10px] text-[var(--sidebar-muted)] font-medium uppercase tracking-wider leading-none">Platform</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-[var(--sidebar-muted)] hover:text-[var(--sidebar-text)] p-1">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-thin">
        <div className="space-y-0.5">
          {getNavItems().map(renderNavLink)}
        </div>
      </nav>

      {/* User / Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => { logout(); if (onClose) onClose(); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--sidebar-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors duration-150"
        >
          <LogOut size={18} />
          <span>{t(lang, 'logout')}</span>
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

      <aside
        className={`fixed inset-y-0 left-0 w-64 flex-col h-screen z-50 bg-[var(--sidebar-bg)] border-r border-white/5 transform transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
