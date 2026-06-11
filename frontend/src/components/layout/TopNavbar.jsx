import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, ChevronDown, CheckCircle, XCircle, UserPlus, Clock, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAppearance } from '../../context/AppearanceContext';
import { languageFlags, languageNames, t } from '../../i18n/translations';
import API from '../../config';

export function TopNavbar({ onMenuToggle }) {
  const { user, switchRole } = useAuth();
  const { lang, setLang } = useLanguage();
  const { prefs, update } = useAppearance();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.role === 'Admin' || user?.role === 'Super Admin') {
      fetchPendingRequests();
      const interval = setInterval(fetchPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchPendingRequests = () => {
    fetch(`${API}/auth/pending-requests`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(data => setPendingRequests(data))
      .catch(err => console.error('Failed to fetch pending requests:', err));
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API}/auth/approve/${id}`, { method: 'PUT', credentials: 'include' });
      if (res.ok) {
        setActionFeedback({ type: 'success', message: 'User approved!' });
        setTimeout(() => setActionFeedback(null), 2000);
        fetchPendingRequests();
      } else {
        const data = await res.json();
        setActionFeedback({ type: 'error', message: data.detail || 'Failed to approve' });
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (err) {
      setActionFeedback({ type: 'error', message: 'Network error' });
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API}/auth/reject/${id}`, { method: 'PUT', credentials: 'include' });
      if (res.ok) {
        setActionFeedback({ type: 'success', message: 'User rejected!' });
        setTimeout(() => setActionFeedback(null), 2000);
        fetchPendingRequests();
      } else {
        const data = await res.json();
        setActionFeedback({ type: 'error', message: data.detail || 'Failed to reject' });
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (err) {
      setActionFeedback({ type: 'error', message: 'Network error' });
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const allNotifications = pendingRequests.map(req => ({
    id: req.id,
    type: 'pending',
    title: req.name,
    subtitle: req.role,
    email: req.email,
    time: new Date(req.created_at).toLocaleString(),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.name)}&background=6366f1&color=fff&size=40`
  }));

  return (
    <header className="h-16 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center flex-1 gap-4">
        <button onClick={onMenuToggle} className="md:hidden p-2 -ml-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] rounded-lg transition-colors">
          <Menu size={20} />
        </button>
        <div className="relative max-w-xs w-full hidden sm:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
          <input
            type="text"
            placeholder={t(lang, 'searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 bg-[var(--surface-tertiary)] border border-transparent rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-150 focus:bg-[var(--surface)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-ring)] hover:border-[var(--border)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Language */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-2.5 py-2 text-sm text-[var(--text-tertiary)] hover:bg-[var(--surface-tertiary)] rounded-lg transition-colors"
          >
            <span className="text-base leading-none">{languageFlags[lang]}</span>
            <ChevronDown size={12} className={`transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-lg py-1 z-20 animate-slide-in">
                {Object.entries(languageNames).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => { setLang(code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${
                      lang === code ? 'text-[var(--accent)] bg-[var(--accent)]/5 font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]'
                    }`}
                  >
                    <span className="text-base leading-none">{languageFlags[code]}</span>
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => update('theme', prefs.theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] rounded-lg transition-colors"
          title={prefs.theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        >
          {prefs.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] rounded-lg transition-colors"
          >
            <Bell size={18} />
            {(user?.role === 'Admin' || user?.role === 'Super Admin') && pendingRequests.length > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
              </span>
            ) : null}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xl z-20 overflow-hidden animate-slide-in">
                <div className="px-4 py-3 border-b border-[var(--border-light)] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t(lang, 'notifications')}</h3>
                  <span className="text-[11px] bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded-full font-semibold">
                    {pendingRequests.length} {t(lang, 'pending')}
                  </span>
                </div>

                {actionFeedback && (
                  <div className={`px-4 py-2 text-xs font-semibold ${
                    actionFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-b border-[var(--border-light)]'
                      : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-b border-[var(--border-light)]'
                  }`}>
                    {actionFeedback.message}
                  </div>
                )}

                <div className="max-h-80 overflow-y-auto">
                  {allNotifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <Clock className="mx-auto text-[var(--text-muted)] mb-2" size={28} />
                      <p className="text-sm text-[var(--text-tertiary)]">{t(lang, 'noNotifications')}</p>
                    </div>
                  ) : (
                    allNotifications.map((notif) => (
                      <div key={notif.id} className="px-4 py-3 border-b border-[var(--border-light)] hover:bg-[var(--surface-secondary)] transition-colors">
                        <div className="flex items-start gap-3">
                          <img src={notif.avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{notif.title}</p>
                              <span className="text-[10px] bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-semibold">{notif.subtitle}</span>
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)] truncate">{notif.email}</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{notif.time}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleApprove(notif.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
                          >
                            <CheckCircle size={12} /> {t(lang, 'approve')}
                          </button>
                          <button
                            onClick={() => handleReject(notif.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-semibold rounded-lg transition-colors"
                          >
                            <XCircle size={12} /> {t(lang, 'reject')}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 bg-[var(--surface-tertiary)] border-t border-[var(--border-light)] text-center">
                  <a href="/accounts" className="text-xs text-[var(--accent)] hover:text-[var(--accent)] font-semibold transition-colors">
                    {t(lang, 'viewAll')}
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-[var(--border)]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">{user?.name}</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">{user?.role}</p>
          </div>
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=40`}
            alt=""
            className="w-8 h-8 rounded-full border border-[var(--border)] object-cover"
          />
        </div>
      </div>
    </header>
  );
}
