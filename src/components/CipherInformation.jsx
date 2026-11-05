import React, { useState } from 'react';
import {
  GraduationCap,
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
  Cpu,
  Layers as LayersIcon,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

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

export default function CipherInformation({ cipher }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const IconComponent = iconMap[cipher.icon] || GraduationCap;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      {/* Title & Category Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isExpanded ? 'border-b border-slate-100 pb-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Educational Dossier
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                  cipher.category === 'Substitution'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                }`}
              >
                {cipher.category} Cipher
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {cipher.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            Class: {cipher.subCategory}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse Educational Dossier' : 'Expand Educational Dossier'}
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Dossier Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Grid of Key Info */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Short Description */}
            <div className="md:col-span-2 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                <span>Overview</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {cipher.shortDescription}
              </p>
            </div>

            {/* Key Type Card */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Cpu className="h-4 w-4 text-indigo-600" />
                <span>Key Specification</span>
              </div>
              <p className="mt-2 font-mono text-xs font-medium text-indigo-900 bg-white p-2.5 rounded border border-slate-200/80 leading-relaxed">
                {cipher.keyType}
              </p>
            </div>
          </div>

          {/* Working Principle & Mathematical Model */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <LayersIcon className="h-4 w-4 text-indigo-600" />
                <span>Basic Working Principle &amp; Mathematical Formulation</span>
              </div>
              {cipher.formula && (
                <span className="rounded bg-indigo-100/70 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-800">
                  {cipher.formula}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {cipher.workingPrinciple}
            </p>
          </div>

          {/* Cryptanalysis & Security Insight */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50/40 p-3.5 text-xs text-amber-900">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-950">Academic Cryptanalysis Insight:</span>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                {cipher.category === 'Substitution'
                  ? 'Substitution ciphers conceal meaning by altering letter identities. Monoalphabetic variants preserve relative letter frequencies (e.g. English letter E ≈ 12.7%), whereas polyalphabetic ciphers flatten single-letter frequencies but remain susceptible to Kasiski examination and index of coincidence tests.'
                  : 'Transposition ciphers scramble letter coordinates without altering the letter set. Frequency distributions remain identical to standard plaintext, meaning character counts alone reveal the language and facilitate anagram-based attacks.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

