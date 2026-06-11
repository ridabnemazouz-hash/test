import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import API from '../config';
import { Trophy, Plus, Calendar, MapPin, Users, Loader2, Search, X, Volleyball } from 'lucide-react';

export function Tournaments() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', city: '', venue: '', tournament_type: 'Singles',
    format: 'knockout', num_teams: 8, start_date: ''
  });

  useEffect(() => { fetchTournaments(); fetchStats(); }, []);

  const fetchTournaments = async () => {
    try {
      const res = await fetch(`${API}/tournaments/`, { credentials: 'include' });
      if (res.ok) setTournaments(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/tournaments/stats`, { credentials: 'include' });
      if (res.ok) setStats(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/tournaments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, start_date: new Date(form.start_date).toISOString() })
      });
      if (res.ok) { setShowAdd(false); setForm({ name: '', city: '', venue: '', tournament_type: 'Singles', format: 'knockout', num_teams: 8, start_date: '' }); fetchTournaments(); fetchStats(); }
    } catch (err) { console.error(err); }
  };

  const generateBracket = async (id) => {
    try {
      await fetch(`${API}/tournaments/${id}/generate-bracket`, { method: 'POST', credentials: 'include' });
      alert('Bracket generated!');
    } catch (err) { console.error(err); }
  };

  const deleteTournament = async (id) => {
    if (!confirm('Delete tournament?')) return;
    await fetch(`${API}/tournaments/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchTournaments(); fetchStats();
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'text-[var(--text-tertiary)] bg-[var(--surface-tertiary)]',
      registration: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
      in_progress: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
      completed: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
    };
    return colors[status] || 'text-[var(--text-tertiary)] bg-[var(--surface-tertiary)]';
  };

  const getStatusLabel = (status) => {
    const labels = { draft: 'مسودة', registration: 'تسجيل', in_progress: 'جارية', completed: 'مكتملة' };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">البطولات</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">إدارة وتنظيم البطولات الرياضية</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          إضافة بطاقة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي البطولات', value: stats.totalTournaments || 0, icon: Trophy, color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/30' },
          { label: 'نشطة', value: stats.activeTournaments || 0, icon: Volleyball, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'مكتملة', value: stats.completedTournaments || 0, icon: Calendar, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
          { label: 'لاعبون', value: stats.totalPlayers || 0, icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                  <p className="text-sm text-[var(--text-tertiary)] mt-1">{stat.label}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tournament List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : tournaments.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--surface-tertiary)] flex items-center justify-center">
            <Trophy size={24} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">لا توجد بطولات بعد</h3>
          <p className="text-sm text-[var(--text-tertiary)] mb-4">أنشئ أول بطولة لبدء التنظيم</p>
          <Button onClick={() => setShowAdd(true)}>إنشاء بطولة</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tournaments.map(t => (
            <Card key={t.id} hover className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate">{t.name}</h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {t.tournament_type === 'Singles' ? 'فردي' : 'زوجي'} · {t.num_teams} فريق
                  </p>
                </div>
                <span className={`shrink-0 badge ${getStatusColor(t.status)}`}>
                  {getStatusLabel(t.status)}
                </span>
              </div>
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-2.5">
                  <MapPin size={14} className="text-[var(--text-muted)] shrink-0" />
                  <span className="truncate">{t.city} · {t.venue}</span>
                </div>
                {t.start_date && (
                  <div className="flex items-center gap-2.5">
                    <Calendar size={14} className="text-[var(--text-muted)] shrink-0" />
                    <span>{new Date(t.start_date).toLocaleDateString('ar')}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-1 border-t border-[var(--border-light)]">
                {t.status === 'registration' && (
                  <Button size="sm" variant="secondary" onClick={() => generateBracket(t.id)}>
                    Generate Bracket
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => deleteTournament(t.id)}>
                  حذف
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Tournament Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-0">
            <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">إضافة دورة جديدة</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input type="text" placeholder="اسم الدورة" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="المدينة" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
                <input type="text" placeholder="القاعة" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.tournament_type} onChange={e => setForm({...form, tournament_type: e.target.value})}>
                  <option value="Singles">فردي</option>
                  <option value="Doubles">زوجي</option>
                </select>
                <select value={form.format} onChange={e => setForm({...form, format: e.target.value})}>
                  <option value="knockout">إقصاء مباشر</option>
                  <option value="groups_knockout">مجموعات + إقصاء</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="عدد الفرق" value={form.num_teams} onChange={e => setForm({...form, num_teams: parseInt(e.target.value)})} />
                <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
              </div>
              <Button type="submit" className="w-full">إنشاء</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
