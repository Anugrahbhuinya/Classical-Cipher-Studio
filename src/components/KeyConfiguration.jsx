import React, { useMemo } from 'react';
import { Key, Info, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

// Math helper for coprime check
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export default function KeyConfiguration({
  cipher,
  keyState,
  onKeyChange
}) {
  // Common updater
  const updateKey = (field, value) => {
    onKeyChange(cipher.id, {
      ...keyState,
      [field]: value
    });
  };

  // Playfair matrix generator preview
  const playfairGrid = useMemo(() => {
    if (cipher.id !== 'playfair') return null;
    const rawKey = (keyState.keyword || 'MONARCHY').toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    const seen = new Set();
    const sequence = [];

    for (const char of rawKey) {
      if (!seen.has(char)) {
        seen.add(char);
        sequence.push(char);
      }
    }

    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // 25 letters, J merged with I
    for (const char of alphabet) {
      if (!seen.has(char)) {
        seen.add(char);
        sequence.push(char);
      }
    }

    // 5x5 grid
    const grid = [];
    for (let r = 0; r < 5; r++) {
      grid.push(sequence.slice(r * 5, (r + 1) * 5));
    }
    return grid;
  }, [cipher.id, keyState.keyword]);

  // Hill determinant check
  const hillStatus = useMemo(() => {
    if (cipher.id !== 'hill') return null;
    const dim = Number(keyState.dimension || 2);

    if (dim === 2) {
      const m = keyState.matrix || [[3, 3], [2, 5]];
      if (m[0] && m[1]) {
        const a = Number(m[0][0]) || 0;
        const b = Number(m[0][1]) || 0;
        const c = Number(m[1][0]) || 0;
        const d = Number(m[1][1]) || 0;
        let det = (a * d - b * c) % 26;
        if (det < 0) det += 26;
        const isCoprime = gcd(det, 26) === 1;
        return { det, isCoprime };
      }
    } else if (dim === 3) {
      const m = keyState.matrix3 || [
        [6, 24, 1],
        [13, 16, 10],
        [20, 17, 15]
      ];
      if (m[0] && m[1] && m[2]) {
        const a = Number(m[0][0]) || 0, b = Number(m[0][1]) || 0, c = Number(m[0][2]) || 0;
        const d = Number(m[1][0]) || 0, e = Number(m[1][1]) || 0, f = Number(m[1][2]) || 0;
        const g = Number(m[2][0]) || 0, h = Number(m[2][1]) || 0, k = Number(m[2][2]) || 0;
        const rawDet = a * (e * k - f * h) - b * (d * k - f * g) + c * (d * h - e * g);
        let det = rawDet % 26;
        if (det < 0) det += 26;
        const isCoprime = gcd(det, 26) === 1;
        return { det, isCoprime };
      }
    }
    return { det: null, isCoprime: true };
  }, [cipher.id, keyState.dimension, keyState.matrix, keyState.matrix3]);

  // Multiplicative coprime check
  const multCoprime = useMemo(() => {
    if (cipher.id !== 'multiplicative') return null;
    const a = Number(keyState.multiplier || 7);
    return gcd(a, 26) === 1;
  }, [cipher.id, keyState.multiplier]);

  // Affine coprime check
  const affineCoprime = useMemo(() => {
    if (cipher.id !== 'affine') return null;
    const a = Number(keyState.a || 5);
    return gcd(a, 26) === 1;
  }, [cipher.id, keyState.a]);

  // Generate random monoalphabetic alphabet
  const generateRandomAlphabet = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    updateKey('cipherAlphabet', letters.join(''));
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Key Configuration
          </h3>
        </div>
        <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
          {cipher.name}
        </span>
      </div>

      {/* Dynamic Key Fields */}
      <div className="mt-4 flex-1 space-y-4">
        {/* 1. CAESAR / ADDITIVE */}
        {cipher.id === 'caesar' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Shift Value (k)
                </label>
                <span className="font-mono text-xs font-semibold text-indigo-600">
                  k = {keyState.shift ?? 3}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={keyState.shift ?? 3}
                  onChange={(e) => updateKey('shift', parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={keyState.shift ?? 3}
                  onChange={(e) => {
                    const raw = e.target.value;
                    updateKey('shift', raw === '' ? '' : isNaN(parseInt(raw, 10)) ? '' : Math.max(0, Math.min(25, parseInt(raw, 10))));
                  }}
                  className="w-16 rounded-md border border-slate-300 py-1.5 px-2 text-center font-mono text-sm focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
              <p className="font-medium text-slate-700">Mathematical Shift Rule:</p>
              <p className="mt-1 font-mono text-indigo-700">C ≡ (P + {keyState.shift ?? 3}) mod 26</p>
              <p className="mt-1 text-slate-500">
                Shift value ranges from 0 to 25. Shift of 3 corresponds to the original Caesar cipher used by Julius Caesar.
              </p>
            </div>
          </div>
        )}

        {/* 2. MULTIPLICATIVE CIPHER */}
        {cipher.id === 'multiplicative' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Multiplier Key (a)
                </label>
                <div className="flex items-center gap-1">
                  {multCoprime ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> Coprime to 26
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                      <AlertCircle className="h-3 w-3" /> Not Coprime (Invalid)
                    </span>
                  )}
                </div>
              </div>
              <input
                type="number"
                value={keyState.multiplier ?? 7}
                onChange={(e) => updateKey('multiplier', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="mt-1.5 w-full rounded-md border border-slate-300 py-1.5 px-3 font-mono text-sm focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. 7"
              />
            </div>

            {/* Quick Coprime Presets */}
            <div>
              <span className="text-[11px] font-medium text-slate-500">Valid Coprime Keys:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {[1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateKey('multiplier', val)}
                    className={`rounded px-2 py-0.5 text-xs font-mono transition-colors ${
                      (keyState.multiplier ?? 7) === val
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
              <p className="font-medium text-slate-700">Multiplicative Condition:</p>
              <p className="mt-1 text-slate-500">
                Key <code className="font-mono text-indigo-700">a</code> must satisfy gcd(a, 26) = 1 to guarantee a unique modular inverse for decryption.
              </p>
            </div>
          </div>
        )}

        {/* 3. AFFINE CIPHER */}
        {cipher.id === 'affine' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">
                    Multiplier (a)
                  </label>
                  {affineCoprime ? (
                    <span className="text-[10px] text-emerald-600 font-semibold">gcd(a,26)=1</span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-semibold">Invalid</span>
                  )}
                </div>
                <input
                  type="number"
                  value={keyState.a ?? 5}
                  onChange={(e) => updateKey('a', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="mt-1 w-full rounded-md border border-slate-300 py-1.5 px-3 font-mono text-sm focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. 5"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">
                    Shift (b)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">0 - 25</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={keyState.b ?? 8}
                  onChange={(e) => updateKey('b', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="mt-1 w-full rounded-md border border-slate-300 py-1.5 px-3 font-mono text-sm focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. 8"
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
              <p className="font-medium text-slate-700">Affine Transformation:</p>
              <p className="mt-1 font-mono text-indigo-700">
                C ≡ ({keyState.a ?? 5} · P + {keyState.b ?? 8}) mod 26
              </p>
              <p className="mt-1 text-slate-500">
                Keyspace size = 12 (coprime choices for a) × 26 (choices for b) = 312 possible keys.
              </p>
            </div>
          </div>
        )}

        {/* 4. MONOALPHABETIC SUBSTITUTION */}
        {cipher.id === 'monoalphabetic' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Substitution Alphabet (26 Letters)
                </label>
                <button
                  type="button"
                  onClick={generateRandomAlphabet}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <RefreshCw className="h-3 w-3" /> Random Shuffle
                </button>
              </div>
              <input
                type="text"
                maxLength={26}
                value={keyState.cipherAlphabet ?? 'QWERTYUIOPASDFGHJKLZXCVBNM'}
                onChange={(e) => updateKey('cipherAlphabet', e.target.value.toUpperCase())}
                className="mt-1.5 w-full rounded-md border border-slate-300 py-1.5 px-3 font-mono text-sm tracking-widest uppercase focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                placeholder="26 distinct uppercase letters"
              />
            </div>

            {/* Alphabet mapping preview table */}
            <div className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50/50 p-2 text-[10px]">
              <div className="flex font-mono text-slate-400 gap-1 pb-1 border-b border-slate-200">
                <span className="w-8 font-semibold text-slate-600 shrink-0">Plain:</span>
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch) => (
                  <span key={ch} className="w-4 text-center shrink-0">{ch}</span>
                ))}
              </div>
              <div className="flex font-mono text-indigo-700 font-semibold gap-1 pt-1">
                <span className="w-8 font-semibold text-indigo-900 shrink-0">Cipher:</span>
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((_, i) => {
                  const ch = (keyState.cipherAlphabet || 'QWERTYUIOPASDFGHJKLZXCVBNM')[i] || '-';
                  return (
                    <span key={i} className="w-4 text-center shrink-0">{ch}</span>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Each plain letter A-Z is mapped one-to-one to the corresponding cipher alphabet position.
            </p>
          </div>
        )}

        {/* 5. AUTOKEY CIPHER */}
        {cipher.id === 'autokey' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700">
                Primer Keyword (Seed)
              </label>
              <input
                type="text"
                value={keyState.primer ?? 'QUEEN'}
                onChange={(e) => updateKey('primer', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                className="mt-1.5 w-full rounded-md border border-slate-300 py-1.5 px-3 font-mono text-sm tracking-wider uppercase focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. QUEEN"
              />
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
              <p className="font-medium text-slate-700">Continuous Keystream Generation:</p>
              <p className="mt-1 font-mono text-indigo-700">
                Key = &ldquo;{keyState.primer || 'QUEEN'}&rdquo; + Plaintext
              </p>
              <p className="mt-1 text-slate-500">
                The primer key encrypts the initial block, after which the plaintext message itself serves as the keystream to eliminate periodicity.
              </p>
            </div>
          </div>
        )}

        {/* 6. PLAYFAIR CIPHER */}
        {cipher.id === 'playfair' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700">
                Key Phrase / Word
              </label>
              <input
                type="text"
                value={keyState.keyword ?? 'MONARCHY'}
                onChange={(e) => updateKey('keyword', e.target.value.toUpperCase())}
                className="mt-1.5 w-full rounded-md border border-slate-300 py-1.5 px-3 font-mono text-sm tracking-wider uppercase focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. MONARCHY"
              />
            </div>

            {/* 5x5 Matrix Visualizer */}
            {playfairGrid && (
              <div>
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Generated 5×5 Polybius Grid (I/J combined):
                </span>
                <div className="mt-1.5 grid grid-cols-5 gap-1 max-w-[200px] rounded-lg border border-slate-200 bg-slate-50 p-2">
                  {playfairGrid.flat().map((char, idx) => (
                    <div
                      key={idx}
                      className="flex h-7 w-7 items-center justify-center rounded bg-white font-mono text-xs font-semibold text-slate-800 shadow-2xs border border-slate-200/80"
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500">
              Duplicates are removed from the key word and remaining alphabet fills the 5×5 matrix. Letters I and J occupy the same cell.
            </p>
          </div>
        )}

        {/* 7. VIGENERE CIPHER */}
        {cipher.id === 'vigenere' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700">
                Repeating Keyword
              </label>
              <input
                type="text"
                value={keyState.keyword ?? 'LEMON'}
                onChange={(e) => updateKey('keyword', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                className="mt-1.5 w-full rounded-md border border-slate-300 py-1.5 px-3 font-mono text-sm tracking-wider uppercase focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. LEMON"
              />
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
              <p className="font-medium text-slate-700">Polyalphabetic Repetition:</p>
              <p className="mt-1 text-slate-500">
                Key length: <strong className="font-mono text-slate-800">{(keyState.keyword || 'LEMON').length}</strong> characters.
                The keyword repeats cyclically across each letter of the message.
              </p>
              <p className="mt-1 font-mono text-indigo-700">
                C[i] ≡ (P[i] + Key[i mod {(keyState.keyword || 'LEMON').length || 1}]) mod 26
              </p>
            </div>
          </div>
        )}

        {/* 8. HILL CIPHER */}
        {cipher.id === 'hill' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">
                Matrix Dimension
              </label>
              <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => updateKey('dimension', '2')}
                  className={`rounded px-2.5 py-1 font-medium transition-colors ${
                    (keyState.dimension || '2') === '2'
                      ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2 × 2
                </button>
                <button
                  type="button"
                  onClick={() => updateKey('dimension', '3')}
                  className={`rounded px-2.5 py-1 font-medium transition-colors ${
                    (keyState.dimension || '2') === '3'
                      ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  3 × 3
                </button>
              </div>
            </div>

            {/* Matrix Cells */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  Matrix Coefficients (K mod 26):
                </span>
                {hillStatus && hillStatus.det !== null && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      hillStatus.isCoprime
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    det ≡ {hillStatus.det} ({hillStatus.isCoprime ? 'Invertible' : 'Not Invertible'})
                  </span>
                )}
              </div>

              {(keyState.dimension || '2') === '2' ? (
                <div className="mt-2 grid grid-cols-2 gap-2 max-w-[160px]">
                  {[[0, 0], [0, 1], [1, 0], [1, 1]].map(([r, c]) => {
                    const matrix = keyState.matrix || [[3, 3], [2, 5]];
                    const val = matrix[r]?.[c] ?? (r === 0 && c === 0 ? 3 : r === 0 && c === 1 ? 3 : r === 1 && c === 0 ? 2 : 5);
                    return (
                      <input
                        key={`${r}-${c}`}
                        type="number"
                        value={val}
                        onChange={(e) => {
                          const newMatrix = [
                            [...(matrix[0] || [3, 3])],
                            [...(matrix[1] || [2, 5])]
                          ];
                          newMatrix[r][c] = e.target.value === '' ? '' : (parseInt(e.target.value, 10) || 0);
                          updateKey('matrix', newMatrix);
                        }}
                        className="rounded border border-slate-300 py-1.5 text-center font-mono text-sm focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-3 gap-1.5 max-w-[210px]">
                  {[0, 1, 2].map((r) =>
                    [0, 1, 2].map((c) => {
                      const matrix = keyState.matrix3 || [
                        [6, 24, 1],
                        [13, 16, 10],
                        [20, 17, 15]
                      ];
                      const val = matrix[r]?.[c] ?? 0;
                      return (
                        <input
                          key={`${r}-${c}`}
                          type="number"
                          value={val}
                          onChange={(e) => {
                            const newM = (matrix || []).map((row) => [...row]);
                            if (!newM[r]) newM[r] = [];
                            newM[r][c] = e.target.value === '' ? '' : (parseInt(e.target.value, 10) || 0);
                            updateKey('matrix3', newM);
                          }}
                          className="rounded border border-slate-300 py-1 text-center font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                        />
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              The matrix determinant must satisfy gcd(det(K), 26) = 1 to permit modular inversion during decryption.
            </p>
          </div>
        )}

        {/* 9. RAIL FENCE CIPHER */}
        {cipher.id === 'railfence' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Number of Rails (Depth d)
                </label>
                <span className="font-mono text-xs font-semibold text-indigo-600">
                  {keyState.rails ?? 3} rails
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={keyState.rails ?? 3}
                  onChange={(e) => updateKey('rails', parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={keyState.rails ?? 3}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') {
                      updateKey('rails', '');
                    } else {
                      const val = parseInt(v, 10);
                      updateKey('rails', isNaN(val) ? '' : Math.max(2, val));
                    }
                  }}
                  className="w-16 rounded-md border border-slate-300 py-1.5 px-2 text-center font-mono text-sm focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Zigzag wave visual diagram */}
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
              <span className="font-medium text-slate-700">Zig-Zag Wave Period:</span>
              <p className="mt-1 font-mono text-indigo-700">
                Cycle length = 2 × ({keyState.rails ?? 3} - 1) = {2 * ((keyState.rails ?? 3) - 1)} characters
              </p>
              <div className="mt-2 font-mono text-[11px] text-slate-500 leading-tight space-y-0.5">
                {Array.from({ length: Math.min(5, keyState.rails ?? 3) }).map((_, r) => (
                  <div key={r} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-12">Rail {r + 1}:</span>
                    <span className="text-indigo-600">
                      {'· '.repeat(r) + '●' + ' · '.repeat(Math.max(0, (keyState.rails ?? 3) - r - 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 10. KEYED TRANSPOSITION CIPHER */}
        {cipher.id === 'keyedtransposition' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700">
                Permutation Key / Keyword
              </label>
              <input
                type="text"
                value={keyState.permutationKey ?? '4 1 3 2 5'}
                onChange={(e) => updateKey('permutationKey', e.target.value)}
                className="mt-1.5 w-full rounded-md border border-slate-300 py-1.5 px-3 font-mono text-sm focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. 4 1 3 2 5 or ZEBRA"
              />
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
              <p className="font-medium text-slate-700">Column Permutation Scheme:</p>
              <p className="mt-1 text-slate-500">
                Accepts either a numeric sequence (e.g., &ldquo;4 1 3 2 5&rdquo;) or an alphabetic keyword (e.g., &ldquo;ZEBRA&rdquo; mapped to alphabetical ranks 5 2 1 4 3).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Required Key Format Explanation Callout */}
      <div className="mt-4 rounded-lg bg-indigo-50/60 p-3 text-xs text-indigo-900 border border-indigo-100/80">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-950">Key Specification:</span>
            <p className="mt-0.5 text-indigo-800 leading-relaxed">
              {cipher.keyType}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

