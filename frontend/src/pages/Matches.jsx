import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import API from '../config';
import { Calendar, Plus, Loader2, X, Trophy, Play, CheckCircle } from 'lucide-react';

export function Matches() {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [form, setForm] = useState({ tournament_id: '', round: 1, match_number: 1, player1_id: '', player2_id: '', venue: '', scheduled_time: '' });
  const [showScore, setShowScore] = useState(null);

  useEffect(() => { fetchTournaments(); fetchMatches(); }, []);

  const fetchTournaments = async () => {
    try {
      const res = await fetch(`${API}/tournaments/`, { credentials: 'include' });
      if (res.ok) setTournaments(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchMatches = async () => {
    try {
      const url = selectedTournament ? `${API}/tournaments/matches?tournament_id=${selectedTournament}` : `${API}/tournaments/matches/`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) setMatches(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchMatches(); }, [selectedTournament]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/tournaments/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, tournament_id: parseInt(form.tournament_id), round: parseInt(form.round), match_number: parseInt(form.match_number), player1_id: form.player1_id ? parseInt(form.player1_id) : null, player2_id: form.player2_id ? parseInt(form.player2_id) : null, scheduled_time: form.scheduled_time ? new Date(form.scheduled_time).toISOString() : null })
      });
      if (res.ok) { setShowAdd(false); setForm({ tournament_id: '', round: 1, match_number: 1, player1_id: '', player2_id: '', venue: '', scheduled_time: '' }); fetchMatches(); }
    } catch (err) { console.error(err); }
  };

  const startMatch = async (id) => {
    await fetch(`${API}/tournaments/matches/${id}/start`, { method: 'POST', credentials: 'include' });
    fetchMatches();
  };

  const completeMatch = async (id, score1, score2, winnerId) => {
    await fetch(`${API}/tournaments/matches/${id}/complete?score1=${score1}&score2=${score2}&winner_id=${winnerId}`, { method: 'POST', credentials: 'include' });
    setShowScore(null);
    fetchMatches();
  };

  const getStatusColor = (status) => {
    const colors = { scheduled: 'bg-gray-100 text-gray-600', in_progress: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700' };
    return colors[status] || 'bg-gray-100';
  };

  const getStatusLabel = (status) => {
    const labels = { scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed' };
    return labels[status] || status;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6 text-purple-500" /> Matches</h1>
        <div className="flex gap-2">
          <select className="p-2 border rounded" value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)}>
            <option value="">All Tournaments</option>
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Match</Button>
        </div>
      </div>

      {loading ? <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
        <div className="space-y-4">
          {[...new Set(matches.map(m => m.round))].sort((a, b) => a - b).map(round => (
            <div key={round}>
              <h3 className="font-bold text-lg mb-2">Round {round}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matches.filter(m => m.round === round).map(m => (
                  <Card key={m.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">Match {m.match_number}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(m.status)}`}>{getStatusLabel(m.status)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <p className="font-medium">{m.player1_name || '----'}</p>
                        {m.score1 !== null && <p className="text-2xl font-bold">{m.score1}</p>}
                      </div>
                      <span className="text-gray-400">VS</span>
                      <div className="text-center">
                        <p className="font-medium">{m.player2_name || '----'}</p>
                        {m.score2 !== null && <p className="text-2xl font-bold">{m.score2}</p>}
                      </div>
                    </div>
                    {m.venue && <p className="text-sm text-gray-500 mt-2">Venue: {m.venue}</p>}
                    <div className="flex gap-2 mt-3">
                      {m.status === 'scheduled' && <Button size="sm" onClick={() => startMatch(m.id)}><Play className="w-4 h-4" /> Start</Button>}
                      {m.status === 'in_progress' && m.player1_id && m.player2_id && <Button size="sm" onClick={() => setShowScore(m.id)}>Record Score</Button>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Match</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select className="w-full p-2 border rounded" value={form.tournament_id} onChange={e => setForm({...form, tournament_id: e.target.value})} required>
                <option value="">Select Tournament</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Round" className="p-2 border rounded" value={form.round} onChange={e => setForm({...form, round: e.target.value})} required />
                <input type="number" placeholder="Match Number" className="p-2 border rounded" value={form.match_number} onChange={e => setForm({...form, match_number: e.target.value})} required />
              </div>
              <input type="text" placeholder="Venue" className="w-full p-2 border rounded" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
              <input type="datetime-local" className="w-full p-2 border rounded" value={form.scheduled_time} onChange={e => setForm({...form, scheduled_time: e.target.value})} />
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </Card>
        </div>
      )}

      {showScore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm p-6 space-y-4">
            <h2 className="text-xl font-bold">Record Score</h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-medium mb-2">Team 1</p>
                <input type="number" id="score1" className="w-full p-2 border rounded text-center text-xl" defaultValue="0" />
              </div>
              <div className="flex items-center justify-center"><span className="text-gray-400">-</span></div>
              <div>
                <p className="font-medium mb-2">Team 2</p>
                <input type="number" id="score2" className="w-full p-2 border rounded text-center text-xl" defaultValue="0" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => {
                const match = matches.find(m => m.id === showScore);
                const score1 = parseInt(document.getElementById('score1').value);
                const score2 = parseInt(document.getElementById('score2').value);
                const winnerId = score1 > score2 ? match.player1_id : match.player2_id;
                completeMatch(showScore, score1, score2, winnerId);
              }}><CheckCircle className="w-4 h-4" /> Save</Button>
              <Button variant="secondary" onClick={() => setShowScore(null)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}