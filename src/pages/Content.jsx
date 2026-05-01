import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, FileText, Download, Link as LinkIcon, Video, Plus, FolderOpen, Calendar } from 'lucide-react';

const LESSONS = [
  { id: 1, title: 'Linear Equations & Functions', subject: 'Mathematics', type: 'PDF', size: '2.4 MB', date: '2026-04-28', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  { id: 2, title: 'Introduction to Quantum Physics', subject: 'Physics', type: 'Video', size: '15 min', date: '2026-04-30', icon: Video, color: 'text-purple-600 bg-purple-50' },
  { id: 3, title: 'Shakespeare: Hamlet Analysis', subject: 'English', type: 'Link', size: 'Article', date: '2026-05-01', icon: LinkIcon, color: 'text-emerald-600 bg-emerald-50' },
];

export function Content() {
  const [filter, setFilter] = useState('All');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Learning Resources</h1>
          <p className="text-slate-500 mt-1">Access lessons, assignments, and educational materials.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={18} className="mr-2" />
          Upload Content
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Mathematics', 'Physics', 'English', 'Science'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
              filter === f ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LESSONS.filter(l => filter === 'All' || l.subject === filter).map(lesson => (
          <Card key={lesson.id} className="p-0 overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all border-slate-100">
            <div className={`p-6 ${lesson.color} flex items-center justify-center relative`}>
              <lesson.icon size={48} className="transition-transform group-hover:scale-110 duration-300" />
              <span className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {lesson.type}
              </span>
            </div>
            <div className="p-6">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">{lesson.subject}</p>
              <h3 className="font-bold text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-1">{lesson.title}</h3>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Details</span>
                  <span className="text-xs font-semibold text-slate-600">{lesson.size}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Added on</span>
                  <span className="text-xs font-semibold text-slate-600">{lesson.date}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="primary" className="flex-1 text-xs py-2 bg-indigo-600">View Resource</Button>
                <Button variant="ghost" className="p-2 border border-slate-100"><Download size={16} /></Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Empty state for demo */}
        <Card className="p-6 border-dashed border-2 border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-300 transition-colors">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 mb-4 group-hover:text-indigo-500 transition-colors">
            <Plus size={24} />
          </div>
          <h4 className="font-bold text-slate-600">New Topic</h4>
          <p className="text-xs text-slate-400 mt-1">Create a new learning module for your students.</p>
        </Card>
      </div>
    </div>
  );
}
