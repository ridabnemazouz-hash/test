import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, MoreVertical, Trash2, BookOpen, Users } from 'lucide-react';

const GRADES = ['1st Grade','2nd Grade','3rd Grade','4th Grade','5th Grade','6th Grade','7th Grade','8th Grade','9th Grade','10th Grade','11th Grade','12th Grade'];


function ActionMenu({ item, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1">
          <button onClick={() => { onDelete(item.id); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={15} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function Classes() {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ name: '', grade: '10th Grade', teacher: '', capacity: 30 });

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const handleAdd = (e) => {
    e.preventDefault();
    const newClass = {
      id: Date.now(),
      name: formData.name,
      grade: formData.grade,
      teacher: formData.teacher,
      capacity: Number(formData.capacity),
      students: 0,
    };
    setClasses(prev => [...prev, newClass]);
    setIsModalOpen(false);
    setFormData({ name: '', grade: '10th Grade', teacher: '', capacity: 30 });
    showSuccess('✅ Class added successfully!');
  };

  const handleDelete = (id) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
    showSuccess('🗑️ Class removed!');
  };

  const filtered = classes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.grade.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classes Management</h1>
          <p className="text-slate-500 mt-1">Manage all school classes and their assignments.</p>
        </div>
        <Button className="shrink-0" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" /> Add Class
        </Button>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">{success}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Classes', value: classes.length, color: 'text-blue-700' },
          { label: 'Total Students', value: classes.reduce((a, c) => a + c.students, 0), color: 'text-green-700' },
          { label: 'Total Capacity', value: classes.reduce((a, c) => a + c.capacity, 0), color: 'text-purple-700' },
          { label: 'Avg. Occupancy', value: classes.length ? Math.round(classes.reduce((a, c) => a + (c.students / c.capacity) * 100, 0) / classes.length) + '%' : '0%', color: 'text-orange-700' },
        ].map(stat => (
          <Card key={stat.label} className="p-4">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search classes, grades or teachers..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mauve-500/20" />
          </div>
          <span className="text-sm text-slate-400 ml-4">{filtered.length} class{filtered.length !== 1 ? 'es' : ''}</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Head Teacher</TableHead>
              <TableHead>Students / Capacity</TableHead>
              <TableHead>Occupancy</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-10">No classes found.</TableCell></TableRow>
            ) : filtered.map(cls => {
              const pct = Math.round((cls.students / cls.capacity) * 100);
              return (
                <TableRow key={cls.id}>
                  <TableCell className="font-bold text-slate-800">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">{cls.name}</span>
                  </TableCell>
                  <TableCell className="text-slate-600">{cls.grade}</TableCell>
                  <TableCell className="text-slate-600 flex items-center gap-2">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(cls.teacher)}&background=6366f1&color=fff&size=28`}
                      alt={cls.teacher} className="w-7 h-7 rounded-full" />
                    {cls.teacher}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Users size={14} /> {cls.students} / {cls.capacity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-400' : 'bg-green-500'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{pct}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionMenu item={cls} onDelete={(id) => setDeleteConfirm(id)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to delete this class?</p>
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200">Cancel</Button>
            <Button type="button" onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white"><Trash2 size={16} className="mr-2" />Delete</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Class">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500/20" placeholder="e.g. 10-A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
            <select value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500/20">
              {GRADES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Head Teacher</label>
            <input type="text" required value={formData.teacher} onChange={e => setFormData({ ...formData, teacher: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500/20" placeholder="Teacher name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
            <input type="number" required min={1} max={50} value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500/20" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200">Cancel</Button>
            <Button type="submit" className="flex-1">Add Class</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
