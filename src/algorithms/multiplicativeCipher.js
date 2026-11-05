import { mod, gcd, modInverse, isLetter, charToNum, numToChar, normalizeText } from './utils.js';

export const VALID_MULTIPLICATIVE_KEYS = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

/**
 * Validates the multiplicative cipher key.
 * Key must be an integer coprime to 26 (i.e. in Z26*).
 * @param {any} key
 * @returns {{ multiplier: number, inverse: number }}
 */
export function validateMultiplicativeKey(key) {
  let val = key;
  if (typeof key === 'object' && key !== null) {
    val = key.multiplier !== undefined ? key.multiplier : key.key;
  }

  if (val === undefined || val === null || val === '') {
    throw new Error('Multiplier key is required for Multiplicative Cipher.');
  }

  const num = Number(val);
  if (!Number.isInteger(num)) {
    throw new Error(`Multiplier key must be an integer. Received: ${val}`);
  }

  const normalized = mod(num, 26);
  const g = gcd(normalized, 26);
  if (g !== 1 || normalized === 0) {
    throw new Error(
      `Invalid key ${val} (≡ ${normalized} mod 26). In Multiplicative Cipher, key must be coprime to 26 (gcd(k, 26) = 1). Valid keys in Z26* are: ${VALID_MULTIPLICATIVE_KEYS.join(', ')}.`
    );
  }

  const inverse = modInverse(normalized, 26);
  return { multiplier: normalized, inverse };
}

/**
 * Encrypts plaintext using Multiplicative Cipher.
 * Formula: C = (P * K) mod 26
 *
 * @param {string} plaintext
 * @param {number|{multiplier?: number, key?: number}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function encrypt(plaintext, key) {
  const text = normalizeText(plaintext);
  const { multiplier, inverse } = validateMultiplicativeKey(key);

  const steps = [];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const p = charToNum(ch);
      const c = mod(p * multiplier, 26);
      const resChar = numToChar(c, isUpper);

      result += resChar;
      steps.push({
        index: i,
        char: ch,
        originalNum: p,
        multiplier,
        resultNum: c,
        resultChar: resChar,
        formula: `${ch}(${p}) × ${multiplier} = ${p * multiplier} ≡ ${c} (mod 26) → ${resChar}`
      });
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Multiplicative Cipher',
      key: multiplier,
      inverseKey: inverse,
      operation: 'Encryption',
      formula: 'C = (P × K) mod 26'
    }
  };
}

/**
 * Decrypts ciphertext using Multiplicative Cipher.
 * Formula: P = (C * K⁻¹) mod 26
 *
 * @param {string} ciphertext
 * @param {number|{multiplier?: number, key?: number}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function decrypt(ciphertext, key) {
  const text = normalizeText(ciphertext);
  const { multiplier, inverse } = validateMultiplicativeKey(key);

  const steps = [];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const c = charToNum(ch);
      const p = mod(c * inverse, 26);
      const resChar = numToChar(p, isUpper);

      result += resChar;
      steps.push({
        index: i,
        char: ch,
        originalNum: c,
        inverseKey: inverse,
        resultNum: p,
        resultChar: resChar,
        formula: `${ch}(${c}) × ${inverse} = ${c * inverse} ≡ ${p} (mod 26) → ${resChar}`
      });
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Multiplicative Cipher',
      key: multiplier,
      inverseKey: inverse,
      operation: 'Decryption',
      formula: 'P = (C × K⁻¹) mod 26'
    }
  };
}

export default {
  encrypt,
  decrypt,
  validateKey: validateMultiplicativeKey
};

