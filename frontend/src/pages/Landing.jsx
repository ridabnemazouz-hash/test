import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Users, 
  BarChart3, 
  MessageSquare,
  ArrowRight,
  Globe,
  LayoutDashboard
} from 'lucide-react';

export const Landing = () => {
  const features = [
    {
      title: "Smart Attendance",
      desc: "Automated tracking for students and staff with real-time notifications.",
      icon: <Users className="w-6 h-6 text-emerald-400" />
    },
    {
      title: "AI Learning Assistant",
      desc: "Personalized AI-powered tutoring and content generation.",
      icon: <Zap className="w-6 h-6 text-amber-400" />
    },
    {
      title: "Financial Center",
      desc: "Manage fees, salaries, and expenses with comprehensive analytics.",
      icon: <BarChart3 className="w-6 h-6 text-blue-400" />
    },
    {
      title: "Secure Communication",
      desc: "Encrypted real-time chat for teachers, parents, and admins.",
      icon: <MessageSquare className="w-6 h-6 text-purple-400" />
    },
    {
      title: "Enterprise Security",
      desc: "Role-based access, audit logs, and military-grade encryption.",
      icon: <ShieldCheck className="w-6 h-6 text-rose-400" />
    },
    {
      title: "Multi-Tenant OS",
      desc: "Manage multiple schools from a single, high-performance platform.",
      icon: <Globe className="w-6 h-6 text-cyan-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              EduSaaS <span className="text-emerald-500 font-mono text-sm ml-1">OS</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Solutions</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-6 inline-block">
              Next-Gen School Management
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
              The OS for Modern <br /> 
              <span className="text-emerald-500">Educational Institutions</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Empower your school with AI-driven management, real-time analytics, and enterprise-grade security. Built for the future of learning.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl shadow-emerald-500/20 group">
                Launch My School <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all backdrop-blur-sm">
                View Demo
              </Link>
            </div>
          </motion.div>

          {/* App Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-slate-900/50 p-2 backdrop-blur-sm shadow-2xl">
              <div className="rounded-xl border border-white/5 overflow-hidden bg-slate-950 aspect-[16/9] flex items-center justify-center">
                 {/* Visual placeholder for app UI */}
                 <div className="text-center p-8">
                    <LayoutDashboard className="w-20 h-20 text-emerald-500/20 mx-auto mb-4" />
                    <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Interactive Dashboard Interface</p>
                 </div>
              </div>
            </div>
            {/* Glowing effect under mockup */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-emerald-500/20 blur-[100px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Powerful Core Features</h2>
            <p className="text-slate-400">Everything you need to run an elite educational institution.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-6 border border-white/10">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <BookOpen className="text-emerald-500 w-5 h-5" />
            <span className="font-bold">EduSaaS OS</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 EduSaaS Systems. All rights reserved.</p>
          <div className="flex gap-6 text-slate-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
