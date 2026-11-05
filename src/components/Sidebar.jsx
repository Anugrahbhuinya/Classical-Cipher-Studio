import React from 'react';
import {
  Home,
  Terminal,
  BookOpen,
  KeyRound,
  Calculator,
  Binary,
  Shuffle,
  Repeat,
  Grid,
  Layers,
  Grid3X3,
  Waves,
  Columns,
  ShieldCheck,
  X
} from 'lucide-react';
import { CIPHERS } from '../data/cipherData';

const iconMap = {
  KeyRound,
  Calculator,
  Binary,
  Shuffle,
  Repeat,
  Grid,
  Layers,
  Grid3X3,
  Waves,
  Columns
};

export default function Sidebar({
  activeTab,
  setActiveTab,
  selectedCipherId,
  onSelectCipher,
  isMobileOpen,
  setIsMobileOpen
}) {
  const substitutionCiphers = CIPHERS.filter((c) => c.category === 'Substitution');
  const transpositionCiphers = CIPHERS.filter((c) => c.category === 'Transposition');

  const isAboutActive =
    activeTab === 'about' ||
    activeTab === 'about-ciphers' ||
    activeTab === 'about-classical-ciphers';

  const handleNavClick = (tabId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveTab(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
    window.scrollTo(0, 0);
  };

  const handleCipherClick = (cipherId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onSelectCipher(cipherId);
    setActiveTab('workspace');
    if (setIsMobileOpen) setIsMobileOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-5">
          <button
            type="button"
            onClick={(e) => handleNavClick('home', e)}
            className="flex items-center gap-3 text-left cursor-pointer group"
            aria-label="Return to Home page"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-navy-900 text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight text-navy-900 group-hover:text-indigo-600 transition-colors">
                Classical Cipher
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-indigo-600">
                Studio Lab
              </span>
            </div>
          </button>

          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden cursor-pointer"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Main Sections */}
          <div>
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            <nav className="mt-2 space-y-1">
              <button
                type="button"
                onClick={(e) => handleNavClick('home', e)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Home className={`h-4 w-4 shrink-0 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleNavClick('workspace', e)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'workspace'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Terminal className={`h-4 w-4 shrink-0 ${activeTab === 'workspace' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>Cipher Workspace</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleNavClick('about', e)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  isAboutActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <BookOpen className={`h-4 w-4 shrink-0 ${isAboutActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>About Classical Ciphers</span>
              </button>
            </nav>
          </div>

          {/* Substitution Ciphers */}
          <div>
            <div className="flex items-center justify-between px-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Substitution Ciphers
              </span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                8
              </span>
            </div>
            <nav className="mt-2 space-y-0.5">
              {substitutionCiphers.map((cipher, index) => {
                const IconComponent = iconMap[cipher.icon] || KeyRound;
                const isSelected = activeTab === 'workspace' && selectedCipherId === cipher.id;
                return (
                  <button
                    key={cipher.id}
                    type="button"
                    onClick={(e) => handleCipherClick(cipher.id, e)}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconComponent
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isSelected ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                        }`}
                      />
                      <span className="truncate">{cipher.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono shrink-0 ml-1.5 px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-indigo-700/60 text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Transposition Ciphers */}
          <div>
            <div className="flex items-center justify-between px-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Transposition Ciphers
              </span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                2
              </span>
            </div>
            <nav className="mt-2 space-y-0.5">
              {transpositionCiphers.map((cipher, index) => {
                const IconComponent = iconMap[cipher.icon] || Waves;
                const isSelected = activeTab === 'workspace' && selectedCipherId === cipher.id;
                return (
                  <button
                    key={cipher.id}
                    type="button"
                    onClick={(e) => handleCipherClick(cipher.id, e)}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconComponent
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isSelected ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                        }`}
                      />
                      <span className="truncate">{cipher.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono shrink-0 ml-1.5 px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-indigo-700/60 text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      #{index + 9}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="border-t border-slate-200/80 p-3.5 bg-slate-50/50">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Academic Studio
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              CNS Coursework Edition &bull; Interactive Cryptography Lab
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

