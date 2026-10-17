import React, { useState, useEffect } from 'react';
import {
  FileText,
  LayoutDashboard,
  UploadCloud,
  Users,
  Briefcase,
  Search,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { checkHealth } from '../services/api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'healthy' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    let isMounted = true;
    const testStatus = async () => {
      try {
        const res = await checkHealth();
        if (isMounted) {
          setBackendStatus(res.status === 'healthy' ? 'healthy' : 'offline');
        }
      } catch {
        if (isMounted) setBackendStatus('offline');
      }
    };
    testStatus();
    const interval = setInterval(testStatus, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload & Parse', icon: UploadCloud },
    { id: 'candidates', label: 'Candidate Explorer', icon: Users },
    { id: 'matching', label: 'Job Matcher', icon: Briefcase },
    { id: 'analysis', label: 'Resume Analysis', icon: Search },
    { id: 'settings', label: 'Settings & Privacy', icon: ShieldCheck },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Resumate</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">Intelligent Resume Assistant</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Backend Status indicator & CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                backendStatus === 'healthy'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : backendStatus === 'checking'
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={backendStatus === 'healthy' ? 'FastAPI Backend Online' : 'FastAPI Backend Offline'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'healthy'
                    ? 'bg-emerald-500 animate-pulse'
                    : backendStatus === 'checking'
                    ? 'bg-slate-400'
                    : 'bg-rose-500'
                }`}
              />
              <span className="capitalize">{backendStatus === 'healthy' ? 'API Live' : backendStatus}</span>
            </div>

            <button
              onClick={() => handleNavClick('upload')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Resume</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span>Backend {backendStatus}</span>
            </div>
            <button
              onClick={() => handleNavClick('upload')}
              className="bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xs"
            >
              Upload Resume
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
