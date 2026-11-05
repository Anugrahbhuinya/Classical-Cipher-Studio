import React from 'react';
import {
  ArrowRight,
  Shield,
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
  Sparkles,
  BookOpen,
  Terminal
} from 'lucide-react';
import { CIPHERS, CATEGORIES } from '../data/cipherData';

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

export default function Home({ onNavigateToWorkspace, onSelectCipher, onNavigateToAbout }) {
  const substitutionCiphers = CIPHERS.filter((c) => c.category === 'Substitution');
  const transpositionCiphers = CIPHERS.filter((c) => c.category === 'Transposition');

  const handleCipherLaunch = (cipherId) => {
    onSelectCipher(cipherId);
    onNavigateToWorkspace();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/70 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Interactive Cryptography Learning Lab</span>
          </div>

          <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Welcome to Classical Cipher Studio
          </h2>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
            Classical cryptography relies on two foundational transformation principles:
            <strong className="text-slate-800"> substitution</strong> (replacing characters with alternate symbols) and
            <strong className="text-slate-800"> transposition</strong> (reordering the sequence of characters).
            Explore these historical mathematical techniques through interactive simulations, custom key parameters, and academic analysis.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToWorkspace}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 active:bg-indigo-800 transition-colors cursor-pointer"
            >
              <Terminal className="h-4 w-4" />
              <span>Open Cipher Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {onNavigateToAbout && (
              <button
                type="button"
                onClick={onNavigateToAbout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>About Classical Ciphers</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>10 Classical Ciphers Configured</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Core Category Cards */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Cryptographic Categories
          </h3>
          <p className="text-xs text-slate-500">
            Select a category or launch any specific algorithm directly into the interactive workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Substitution Ciphers */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
                  8 Algorithms
                </span>
                <h4 className="mt-2 text-xl font-bold text-slate-900">
                  Substitution Ciphers
                </h4>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Shield className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Plaintext characters or character groups are systematically replaced with substitute letters, numbers, or symbols based on a secret mapping or key sequence.
            </p>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Available Algorithms:
              </span>
              <div className="mt-2.5 space-y-1.5">
                {substitutionCiphers.map((c) => {
                  const Icon = iconMap[c.icon] || KeyRound;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCipherLaunch(c.id)}
                      className="group flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-900 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600" />
                        <span>{c.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 flex items-center gap-1 font-sans">
                        Configure <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Transposition Ciphers */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                  2 Algorithms
                </span>
                <h4 className="mt-2 text-xl font-bold text-slate-900">
                  Transposition Ciphers
                </h4>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Columns className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              The order or positions of characters are rearranged (permuted) without modifying the identities of the original letters. Frequency counts of individual letters are fully preserved.
            </p>

            <div className="mt-4 border-t border-slate-100 pt-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Available Algorithms:
                </span>
                <div className="mt-2.5 space-y-1.5">
                  {transpositionCiphers.map((c) => {
                    const Icon = iconMap[c.icon] || Waves;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCipherLaunch(c.id)}
                        className="group flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-900 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
                          <span>{c.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 flex items-center gap-1 font-sans">
                          Configure <ArrowRight className="h-3 w-3" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Informative Transposition Principle callout */}
              <div className="mt-6 rounded-lg bg-emerald-50/50 p-3 text-xs text-emerald-900 border border-emerald-100">
                <span className="font-semibold">Claude Shannon's Principle:</span>
                <p className="mt-0.5 text-emerald-800">
                  Modern block ciphers like AES combine rounds of substitution (Confusion) with transposition/permutation (Diffusion) to resist statistical cryptanalysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Footer Callout */}
      <section className="rounded-xl border border-slate-200 bg-slate-100/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">
            Ready to explore cipher transformations?
          </h4>
          <p className="text-xs text-slate-500">
            Open the workspace to input custom messages, adjust shift keys, matrix dimensions, and inspect algorithm dossiers.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateToWorkspace}
          className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <span>Launch Workspace</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </section>
    </div>
  );
}

