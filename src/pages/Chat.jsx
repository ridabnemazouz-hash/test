import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Search, Send, Paperclip, Image, MoreVertical, Loader, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000';

export function Chat() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id);
      const interval = setInterval(() => fetchMessages(activeContact.id), 3000); // Poll every 3s
      return () => clearInterval(interval);
    }
  }, [activeContact]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/chat/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/chat/messages/${contactId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/chat/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: activeContact.id,
          content: newMessage
        })
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(activeContact.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="font-black text-slate-900 text-xl mb-4 tracking-tight">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center p-10 text-slate-400"><Loader className="animate-spin mr-2" size={18}/> Loading...</div>
          ) : contacts.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">No contacts found</div>
          ) : contacts.map((contact) => (
            <div 
              key={contact.id} 
              onClick={() => setActiveContact(contact)}
              className={`p-3 flex items-center gap-3 cursor-pointer rounded-xl transition-all ${
                activeContact?.id === contact.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-white text-slate-600'
              }`}
            >
              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${activeContact?.id === contact.id ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'}`}>
                  {contact.name.charAt(0)}
                </div>
                {contact.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className={`text-sm font-bold truncate ${activeContact?.id === contact.id ? 'text-white' : 'text-slate-800'}`}>{contact.name}</h4>
                </div>
                <p className={`text-[10px] uppercase font-black tracking-widest ${activeContact?.id === contact.id ? 'text-indigo-100' : 'text-slate-400'}`}>{contact.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {activeContact ? (
        <div className="flex-1 flex flex-col bg-white">
          <div className="h-20 border-b border-slate-100 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
                {activeContact.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-slate-800 tracking-tight">{activeContact.name}</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online</p>
                </div>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                <MessageSquareIcon size={48} className="mb-4" />
                <p className="text-sm font-medium">No messages yet. Say hello!</p>
              </div>
            ) : messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[80%] ${msg.sender_id === user.id ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 mt-auto flex items-center justify-center text-[10px] font-bold ${
                  msg.sender_id === user.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  {msg.sender_id === user.id ? user.name.charAt(0) : activeContact.name.charAt(0)}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.sender_id === user.id 
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-100' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-slate-100'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-wider mt-2 block ${
                    msg.sender_id === user.id ? 'text-indigo-200' : 'text-slate-400'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
            <form onSubmit={handleSend} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
              <button type="button" className="text-slate-400 hover:text-indigo-600 transition-colors p-1"><Paperclip size={20} /></button>
              <button type="button" className="text-slate-400 hover:text-indigo-600 transition-colors p-1"><Image size={20} /></button>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..." 
                className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 font-medium text-slate-700"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim() || sending}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-indigo-200"
              >
                {sending ? <Loader className="animate-spin" size={20} /> : <Send size={20} className="ml-0.5" />}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400">
          <div className="p-10 bg-white rounded-full shadow-2xl shadow-indigo-100 mb-6">
             <MessageSquareIcon size={64} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Select a conversation</h3>
          <p className="text-sm font-medium mt-2">Pick someone from the list to start chatting.</p>
        </div>
      )}
    </div>
  );
}

function MessageSquareIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  );
}
