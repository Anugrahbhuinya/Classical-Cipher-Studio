import { mod, gcd, modInverse, isLetter, charToNum, numToChar, normalizeText } from './utils.js';
import { VALID_MULTIPLICATIVE_KEYS } from './multiplicativeCipher.js';

/**
 * Validates the Affine cipher key pair (a, b).
 * @param {any} key - Object { a, b } or array [a, b]
 * @returns {{ a: number, b: number, aInverse: number }}
 */
export function validateAffineKey(key) {
  if (!key || typeof key !== 'object') {
    throw new Error('Affine Cipher key must be an object with properties { a, b } or array [a, b].');
  }

  let rawA = Array.isArray(key) ? key[0] : key.a;
  let rawB = Array.isArray(key) ? key[1] : key.b;

  if (rawA === undefined || rawA === null || rawA === '') {
    throw new Error('Affine key parameter "a" (multiplier) is required.');
  }
  if (rawB === undefined || rawB === null || rawB === '') {
    throw new Error('Affine key parameter "b" (shift) is required.');
  }

  const numA = Number(rawA);
  const numB = Number(rawB);

  if (!Number.isInteger(numA)) {
    throw new Error(`Affine key parameter "a" must be an integer. Received: ${rawA}`);
  }
  if (!Number.isInteger(numB)) {
    throw new Error(`Affine key parameter "b" must be an integer. Received: ${rawB}`);
  }

  const normA = mod(numA, 26);
  const normB = mod(numB, 26);

  const g = gcd(normA, 26);
  if (g !== 1 || normA === 0) {
    throw new Error(
      `Invalid Affine multiplier a = ${rawA} (≡ ${normA} mod 26). "a" must be coprime to 26 (gcd(a, 26) = 1). Valid choices are: ${VALID_MULTIPLICATIVE_KEYS.join(', ')}.`
    );
  }

  const aInverse = modInverse(normA, 26);
  return { a: normA, b: normB, aInverse };
}

/**
 * Encrypts plaintext using Affine Cipher.
 * Formula: C = (a * P + b) mod 26
 *
 * @param {string} plaintext
 * @param {{ a: number, b: number }|[number, number]} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function encrypt(plaintext, key) {
  const text = normalizeText(plaintext);
  const { a, b, aInverse } = validateAffineKey(key);

  const steps = [];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const p = charToNum(ch);
      const c = mod(a * p + b, 26);
      const resChar = numToChar(c, isUpper);

      result += resChar;
      steps.push({
        index: i,
        char: ch,
        originalNum: p,
        a,
        b,
        resultNum: c,
        resultChar: resChar,
        formula: `(${a} × ${p} + ${b}) = ${a * p + b} ≡ ${c} (mod 26) → ${resChar}`
      });
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Affine Cipher',
      a,
      b,
      aInverse,
      operation: 'Encryption',
      formula: 'C = (a × P + b) mod 26'
    }
  };
}

/**
 * Decrypts ciphertext using Affine Cipher.
 * Formula: P = a⁻¹ * (C - b) mod 26
 *
 * @param {string} ciphertext
 * @param {{ a: number, b: number }|[number, number]} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function decrypt(ciphertext, key) {
  const text = normalizeText(ciphertext);
  const { a, b, aInverse } = validateAffineKey(key);

  const steps = [];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const c = charToNum(ch);
      const diff = mod(c - b, 26);
      const p = mod(aInverse * diff, 26);
      const resChar = numToChar(p, isUpper);

      result += resChar;
      steps.push({
        index: i,
        char: ch,
        originalNum: c,
        aInverse,
        b,
        diff,
        resultNum: p,
        resultChar: resChar,
        formula: `${aInverse} × (${c} - ${b}) ≡ ${aInverse} × ${diff} = ${aInverse * diff} ≡ ${p} (mod 26) → ${resChar}`
      });
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Affine Cipher',
      a,
      b,
      aInverse,
      operation: 'Decryption',
      formula: 'P = a⁻¹ × (C - b) mod 26'
    }
  };
}

export default {
  encrypt,
  decrypt,
  validateKey: validateAffineKey
};

