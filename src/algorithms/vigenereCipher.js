import { mod, isLetter, charToNum, numToChar, normalizeText } from './utils.js';

/**
 * Validates and normalizes the Vigenère keyword.
 * @param {any} key - String or object { keyword: string } / { key: string }
 * @returns {string} Uppercase keyword containing only A-Z
 */
export function validateVigenereKey(key) {
  let val = key;
  if (typeof key === 'object' && key !== null) {
    val = key.keyword !== undefined ? key.keyword : key.key;
  }

  if (typeof val !== 'string') {
    throw new Error('Vigenère Cipher keyword must be a string.');
  }

  const clean = val.toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length === 0) {
    throw new Error('Vigenère Cipher keyword must contain at least one alphabetic letter.');
  }

  return clean;
}

/**
 * Encrypts plaintext using Vigenère Cipher.
 * Formula: C[i] = (P[i] + K[i mod m]) mod 26
 *
 * @param {string} plaintext
 * @param {string|{keyword: string}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function encrypt(plaintext, key) {
  const text = normalizeText(plaintext);
  const keyword = validateVigenereKey(key);
  const m = keyword.length;

  const steps = [];
  let result = '';
  let keyIndex = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const p = charToNum(ch);
      const kChar = keyword[keyIndex % m];
      const k = charToNum(kChar);
      const c = mod(p + k, 26);
      const resChar = numToChar(c, isUpper);

      result += resChar;
      steps.push({
        index: i,
        char: ch,
        alphaIndex: keyIndex,
        plainNum: p,
        keyChar: kChar,
        keyNum: k,
        resultNum: c,
        resultChar: resChar,
        formula: `${ch}(${p}) + ${kChar}(${k}) = ${p + k} ≡ ${c} (mod 26) → ${resChar}`
      });

      keyIndex++;
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Vigenère Cipher',
      keyword,
      keyLength: m,
      alphabeticCharsEncrypted: keyIndex,
      operation: 'Encryption',
      formula: 'C[i] = (P[i] + K[i mod m]) mod 26'
    }
  };
}

/**
 * Decrypts ciphertext using Vigenère Cipher.
 * Formula: P[i] = (C[i] - K[i mod m] + 26) mod 26
 *
 * @param {string} ciphertext
 * @param {string|{keyword: string}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function decrypt(ciphertext, key) {
  const text = normalizeText(ciphertext);
  const keyword = validateVigenereKey(key);
  const m = keyword.length;

  const steps = [];
  let result = '';
  let keyIndex = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const c = charToNum(ch);
      const kChar = keyword[keyIndex % m];
      const k = charToNum(kChar);
      const p = mod(c - k, 26);
      const resChar = numToChar(p, isUpper);

      result += resChar;
      steps.push({
        index: i,
        char: ch,
        alphaIndex: keyIndex,
        cipherNum: c,
        keyChar: kChar,
        keyNum: k,
        resultNum: p,
        resultChar: resChar,
        formula: `${ch}(${c}) - ${kChar}(${k}) = ${c - k} ≡ ${p} (mod 26) → ${resChar}`
      });

      keyIndex++;
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Vigenère Cipher',
      keyword,
      keyLength: m,
      alphabeticCharsDecrypted: keyIndex,
      operation: 'Decryption',
      formula: 'P[i] = (C[i] - K[i mod m] + 26) mod 26'
    }
  };
}

export default {
  encrypt,
  decrypt,
  validateKey: validateVigenereKey
};

