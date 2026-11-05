import React from 'react';
import { Trash2, Sparkles, Clipboard, AlignLeft } from 'lucide-react';

export default function InputPanel({
  text,
  setText,
  sampleText,
  mode = 'encrypt'
}) {
  const charCount = text.length;
  const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
      }
    } catch {
      // Fallback or permission rejected
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlignLeft className="h-4 w-4 text-indigo-600" />
          <label htmlFor="cipher-input" className="text-sm font-semibold text-slate-800">
            {mode === 'encrypt' ? 'Plaintext Message' : 'Ciphertext to Decrypt'}
          </label>
        </div>

        <div className="flex items-center gap-2">
          {sampleText && (
            <button
              type="button"
              onClick={() => setText(sampleText)}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
              title="Fill with standard lecture sample text"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Load Sample</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePaste}
            className="hidden sm:inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Paste from clipboard"
          >
            <Clipboard className="h-3 w-3" />
            <span>Paste</span>
          </button>

          {text && (
            <button
              type="button"
              onClick={() => setText('')}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              title="Clear input"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Text Area */}
      <div className="mt-3 flex-1 flex flex-col">
        <textarea
          id="cipher-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={
            mode === 'encrypt'
              ? 'Enter plaintext message here (e.g. ATTACK AT DAWN). Classical ciphers traditionally process English alphabetic letters A-Z...'
              : 'Enter ciphertext message here to be decrypted using the current cipher and key...'
          }
          className="w-full flex-1 resize-y rounded-lg border border-slate-200 p-3.5 font-mono text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:font-sans focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Footer Metrics */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span>
            Characters: <strong className="font-semibold text-slate-700">{charCount}</strong>
          </span>
          <span className="text-slate-300">&bull;</span>
          <span>
            Letters: <strong className="font-semibold text-slate-700">{letterCount}</strong>
          </span>
          <span className="text-slate-300">&bull;</span>
          <span>
            Words: <strong className="font-semibold text-slate-700">{wordCount}</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Uppercase &amp; lowercase letters supported
        </span>
      </div>
    </div>
  );
}

