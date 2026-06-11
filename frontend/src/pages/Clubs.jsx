import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import API from '../config';
import { Users, Plus, MapPin, Loader2, X, QrCode } from 'lucide-react';

export function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', city: '' });

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      const res = await fetch(`${API}/tournaments/clubs`, { credentials: 'include' });
      if (res.ok) setClubs(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/tournaments/clubs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      if (res.ok) { setShowAdd(false); setForm({ name: '', city: '' }); fetchClubs(); }
    } catch (err) { console.error(err); }
  };

  const deleteClub = async (id) => {
    if (!confirm('Delete club?')) return;
    await fetch(`${API}/tournaments/clubs/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchClubs();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-blue-500" /> Clubs</h1>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Club</Button>
      </div>

      {loading ? <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(club => (
            <Card key={club.id} className="p-4 space-y-3">
              <h3 className="font-bold text-lg">{club.name}</h3>
              <p className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4" /> {club.city}</p>
              {club.qr_code && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <QrCode className="w-4 h-4" /> {club.qr_code}
                </div>
              )}
              <Button size="sm" variant="danger" onClick={() => deleteClub(club.id)}>Delete</Button>
            </Card>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Club</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Club Name" className="w-full p-2 border rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <input type="text" placeholder="City" className="w-full p-2 border rounded" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}