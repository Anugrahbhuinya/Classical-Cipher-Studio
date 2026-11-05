import { mod, isLetter, charToNum, numToChar, normalizeText } from './utils.js';

/**
 * Normalizes and validates the additive/Caesar shift key.
 * Accepts an integer directly or an object `{ shift: k }` / `{ key: k }`.
 * @param {any} key
 * @returns {number} Normalized shift key in range [0, 25]
 */
export function validateAdditiveKey(key) {
  let val = key;
  if (typeof key === 'object' && key !== null) {
    val = key.shift !== undefined ? key.shift : key.key;
  }

  if (val === undefined || val === null || val === '') {
    throw new Error('Shift key is required for Additive (Caesar) Cipher.');
  }

  const num = Number(val);
  if (!Number.isInteger(num)) {
    throw new Error(`Shift key must be an integer. Received: ${val}`);
  }

  return mod(num, 26);
}

/**
 * Encrypts plaintext using Additive (Caesar) Cipher.
 * Formula: C = (P + K) mod 26
 * Preserves letter case, spaces, and non-alphabetic characters.
 *
 * @param {string} plaintext
 * @param {number|{shift?: number, key?: number}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function encrypt(plaintext, key) {
  const text = normalizeText(plaintext);
  const shift = validateAdditiveKey(key);

  const steps = [];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const p = charToNum(ch);
      const c = mod(p + shift, 26);
      const resChar = numToChar(c, isUpper);

      result += resChar;
      steps.push({
        index: i,
        char: ch,
        originalNum: p,
        shift,
        resultNum: c,
        resultChar: resChar,
        formula: `${ch}(${p}) + ${shift} = ${p + shift} ≡ ${c} (mod 26) → ${resChar}`
      });
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Additive (Caesar) Cipher',
      shift,
      operation: 'Encryption',
      formula: 'C = (P + K) mod 26'
    }
  };
}

/**
 * Decrypts ciphertext using Additive (Caesar) Cipher.
 * Formula: P = (C - K + 26) mod 26
 * Preserves letter case, spaces, and non-alphabetic characters.
 *
 * @param {string} ciphertext
 * @param {number|{shift?: number, key?: number}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function decrypt(ciphertext, key) {
  const text = normalizeText(ciphertext);
  const shift = validateAdditiveKey(key);

  const steps = [];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const c = charToNum(ch);
      const p = mod(c - shift, 26);
      const resChar = numToChar(p, isUpper);

      result += resChar;
      steps.push({
        index: i,
        char: ch,
        originalNum: c,
        shift,
        resultNum: p,
        resultChar: resChar,
        formula: `${ch}(${c}) - ${shift} = ${c - shift} ≡ ${p} (mod 26) → ${resChar}`
      });
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Additive (Caesar) Cipher',
      shift,
      operation: 'Decryption',
      formula: 'P = (C - K + 26) mod 26'
    }
  };
}

export default {
  encrypt,
  decrypt,
  validateKey: validateAdditiveKey
};

