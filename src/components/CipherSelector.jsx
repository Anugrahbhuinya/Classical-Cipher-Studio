import React from 'react';
import {
  ChevronDown,
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

export default function CipherSelector({ selectedCipherId, onSelectCipher }) {
  const currentCipher = CIPHERS.find((c) => c.id === selectedCipherId) || CIPHERS[0];
  const CurrentIcon = iconMap[currentCipher.icon] || KeyRound;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Active Cipher Display */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
            <CurrentIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Cipher
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                  currentCipher.category === 'Substitution'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                }`}
              >
                {currentCipher.category} Cipher
              </span>
              <span className="hidden md:inline text-xs text-slate-400">&bull;</span>
              <span className="hidden md:inline text-xs text-slate-500">{currentCipher.subCategory}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {currentCipher.name}
            </h2>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="relative w-full sm:w-72">
          <label htmlFor="cipher-select" className="sr-only">
            Select a Classical Cipher
          </label>
          <div className="relative">
            <select
              id="cipher-select"
              value={selectedCipherId}
              onChange={(e) => onSelectCipher(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50/50 py-2.5 pl-3.5 pr-10 text-sm font-medium text-slate-800 shadow-xs transition-colors hover:bg-slate-50 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <optgroup label="Substitution Ciphers">
                {CIPHERS.filter((c) => c.category === 'Substitution').map((cipher) => (
                  <option key={cipher.id} value={cipher.id}>
                    {cipher.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Transposition Ciphers">
                {CIPHERS.filter((c) => c.category === 'Transposition').map((cipher) => (
                  <option key={cipher.id} value={cipher.id}>
                    {cipher.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

