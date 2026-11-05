import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';

export default function Header({ onOpenMobileMenu, onNavigate, activeTab }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('home')}
                className="text-left text-xl sm:text-2xl font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                aria-label="Classical Cipher Studio - Return to Home"
              >
                Classical Cipher Studio
              </button>
              <span className="hidden sm:inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                Interactive Lab
              </span>
            </div>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 line-clamp-1 sm:line-clamp-none">
              Explore, encrypt and decrypt messages using classical cryptographic techniques.
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Client-Side Sandbox</span>
          </div>
        </div>
      </div>
    </header>
  );
}

