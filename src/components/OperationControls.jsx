import React from 'react';
import { Lock, Unlock, ArrowDownUp, RotateCcw } from 'lucide-react';

export default function OperationControls({
  onEncrypt,
  onDecrypt,
  onSwap,
  onReset,
  hasOutput = false,
  hasInput = false
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Encrypt Button */}
        <button
          type="button"
          onClick={onEncrypt}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 active:bg-indigo-800 transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
        >
          <Lock className="h-4 w-4" />
          <span>Encrypt Message</span>
        </button>

        {/* Decrypt Button */}
        <button
          type="button"
          onClick={onDecrypt}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-all focus:outline-hidden focus:ring-2 focus:ring-slate-400/20"
        >
          <Unlock className="h-4 w-4 text-slate-500" />
          <span>Decrypt Message</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Swap Button */}
        <button
          type="button"
          onClick={onSwap}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Swap Input and Output text"
        >
          <ArrowDownUp className="h-3.5 w-3.5 text-slate-500" />
          <span>Swap I/O</span>
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
          title="Reset input, output, and cipher keys"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}

