import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import API from '../config';
import { User, Plus, Loader2, X, Trophy, QrCode } from 'lucide-react';

export function Players() {
  const [players, setPlayers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', level: 'intermediate', club_id: '' });

  useEffect(() => { fetchPlayers(); fetchClubs(); }, []);

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`${API}/tournaments/players`, { credentials: 'include' });
      if (res.ok) setPlayers(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchClubs = async () => {
    try {
      const res = await fetch(`${API}/tournaments/clubs`, { credentials: 'include' });
      if (res.ok) setClubs(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/tournaments/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, age: form.age ? parseInt(form.age) : null, club_id: form.club_id ? parseInt(form.club_id) : null })
      });
      if (res.ok) { setShowAdd(false); setForm({ name: '', age: '', level: 'intermediate', club_id: '' }); fetchPlayers(); }
    } catch (err) { console.error(err); }
  };

  const deletePlayer = async (id) => {
    if (!confirm('Delete player?')) return;
    await fetch(`${API}/tournaments/players/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchPlayers();
  };

  const getLevelLabel = (level) => {
    const labels = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', professional: 'Professional' };
    return labels[level] || level;
  };

  const getLevelColor = (level) => {
    const colors = { beginner: 'bg-gray-100', intermediate: 'bg-blue-100', advanced: 'bg-purple-100', professional: 'bg-amber-100' };
    return colors[level] || 'bg-gray-100';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6 text-green-500" /> Players</h1>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Player</Button>
      </div>

      {loading ? <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-right">Name</th>
                <th className="p-3 text-right">Age</th>
                <th className="p-3 text-right">Level</th>
                <th className="p-3 text-right">Club</th>
                <th className="p-3 text-right">Points</th>
                <th className="p-3 text-right">Wins/Losses</th>
                <th className="p-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.age || '-'}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${getLevelColor(p.level)}`}>{getLevelLabel(p.level)}</span></td>
                  <td className="p-3">{clubs.find(c => c.id === p.club_id)?.name || '-'}</td>
                  <td className="p-3"><span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-amber-500" /> {p.points}</span></td>
                  <td className="p-3"><span className="text-green-600">{p.wins}W</span> / <span className="text-red-600">{p.losses}L</span></td>
                  <td className="p-3"><Button size="sm" variant="danger" onClick={() => deletePlayer(p.id)}>Delete</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Player</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Player Name" className="w-full p-2 border rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <input type="number" placeholder="Age (Optional)" className="w-full p-2 border rounded" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
              <select className="w-full p-2 border rounded" value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </select>
              <select className="w-full p-2 border rounded" value={form.club_id} onChange={e => setForm({...form, club_id: e.target.value})}>
                <option value="">No Club</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}