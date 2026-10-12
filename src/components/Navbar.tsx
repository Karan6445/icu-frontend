import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 border-b ${isScrolled
          ? 'bg-white/95 backdrop-blur-md border-sky-200/80 shadow-md py-3'
          : 'bg-gradient-to-r from-sky-50/90 via-blue-50/90 to-sky-100/80 border-sky-200 py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 group relative min-w-0 flex-1 sm:flex-none">
            <div className="relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0">
              {/* ECG Pulse Wave Animation Layer */}
              <div className="absolute -inset-x-4 sm:-inset-x-6 inset-y-0 flex items-center pointer-events-none z-0">
                <svg className="w-full h-8 sm:h-10 overflow-visible opacity-95" viewBox="0 0 100 30" fill="none">
                  <path
                    d="M 0 15 L 20 15 L 24 15 L 28 8 L 32 22 L 36 2 L 42 28 L 46 15 L 50 15 L 100 15"
                    stroke="#0F766E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-ecg-line"
                  />
                </svg>
              </div>

              {/* Logo Icon Box */}
              <div className="relative z-10 w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-slate-950 border border-teal-600/50 overflow-hidden flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform p-1">
                <img
                  src="/Naimify-logo-large.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>
            </div>

            <div className="z-10 min-w-0">
              <span className="text-xs sm:text-base font-black tracking-wider uppercase font-sans text-slate-900 leading-none block truncate">
                NAIMIFY <span className="text-teal-700 font-black">SMART ICU</span>
              </span>
              <p className="text-[10px] sm:text-xs block mt-0.5 sm:mt-1 truncate">
                <span className="font-serif italic font-semibold text-teal-800">enfinix</span>
                <span className="text-slate-400 mx-1 sm:mx-1.5 font-sans">|</span>
                <span className="text-slate-600 font-medium font-sans">Smart Clinical Decision</span>
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#platform" className="text-xs font-bold text-slate-800 hover:text-blue-900 transition-colors">
              Platform
            </a>
            <a href="#how-it-works" className="text-xs font-bold text-slate-800 hover:text-blue-900 transition-colors">
              How It Works
            </a>
            <a href="#about-us" className="text-xs font-bold text-slate-800 hover:text-blue-900 transition-colors">
              About Us
            </a>
            <a href="#security" className="text-xs font-bold text-slate-800 hover:text-blue-900 transition-colors">
              Security
            </a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-blue-900/20 border border-blue-800 active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-300" />
              Staff Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-800 hover:text-blue-900 p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-sky-50 border-b border-sky-200 px-4 py-4 space-y-3">
          <a href="#platform" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-800 py-1 hover:text-blue-900">
            Platform
          </a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-800 py-1 hover:text-blue-900">
            How It Works
          </a>
          <a href="#about-us" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-800 py-1 hover:text-blue-900">
            About Us
          </a>
          <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-800 py-1 hover:text-blue-900">
            Security
          </a>
          <div className="pt-3 border-t border-sky-200 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-900 rounded-lg text-center shadow-md"
            >
              Staff Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
