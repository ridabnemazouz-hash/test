import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { CreditCard, Download, CheckCircle, Clock, Search, Filter, ArrowUpRight, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PAYMENTS = [
  { id: 1, student: 'Anas Tazi', month: 'May 2026', amount: '1,200', status: 'Paid', date: '2026-05-01', method: 'Credit Card' },
  { id: 2, student: 'Meryem Amrani', month: 'May 2026', amount: '1,200', status: 'Pending', date: '-', method: '-' },
  { id: 3, student: 'Anas Tazi', month: 'April 2026', amount: '1,200', status: 'Paid', date: '2026-04-02', method: 'Cash' },
];

export function Payments() {
  const { user } = useAuth();
  const isAdmin = user.role === 'Admin' || user.role === 'Super Admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial Management</h1>
          <p className="text-slate-500 mt-1">Track tuition fees, invoices, and school expenses.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="bg-white border border-slate-200"><Download size={18} className="mr-2" /> Export</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <DollarSign size={18} className="mr-2" />
            {isAdmin ? 'Record Payment' : 'Pay Online'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 text-white border-0 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <CreditCard size={120} />
          </div>
          <div className="p-6 relative">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Revenue (May)</p>
            <h2 className="text-4xl font-black mt-2 mb-6 tracking-tight">24,500 <span className="text-sm font-medium">DH</span></h2>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} /> +12% from last month
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between border-slate-100 shadow-xl shadow-slate-200/40">
           <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Clock size={24} /></div>
             <span className="text-[10px] font-black text-amber-600 uppercase">Pending</span>
           </div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Outstanding</p>
             <h4 className="text-2xl font-black text-slate-800 tracking-tight">8,400 <span className="text-sm font-medium">DH</span></h4>
           </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between border-slate-100 shadow-xl shadow-slate-200/40">
           <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><CheckCircle size={24} /></div>
             <span className="text-[10px] font-black text-indigo-600 uppercase">Collected</span>
           </div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Collected</p>
             <h4 className="text-2xl font-black text-slate-800 tracking-tight">16,100 <span className="text-sm font-medium">DH</span></h4>
           </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search payments by student or month..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <Button variant="ghost" size="sm" className="text-slate-500"><Filter size={16} className="mr-2" /> Filters</Button>
        </div>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-bold text-slate-700 uppercase text-[10px]">Student / Child</TableHead>
              <TableHead className="font-bold text-slate-700 uppercase text-[10px]">Payment Month</TableHead>
              <TableHead className="font-bold text-slate-700 uppercase text-[10px]">Amount</TableHead>
              <TableHead className="font-bold text-slate-700 uppercase text-[10px]">Method</TableHead>
              <TableHead className="font-bold text-slate-700 uppercase text-[10px]">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-700 uppercase text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PAYMENTS.map((payment) => (
              <TableRow key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-800">{payment.student}</TableCell>
                <TableCell className="text-slate-500 text-sm font-medium">{payment.month}</TableCell>
                <TableCell className="font-black text-slate-900">{payment.amount} DH</TableCell>
                <TableCell className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{payment.method}</TableCell>
                <TableCell>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    payment.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {payment.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <Download size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
