import { mod, isLetter, charToNum, numToChar, normalizeText } from './utils.js';

/**
 * Validates and extracts the Autokey primer (seed).
 * Supports integer seed (0-25) or alphabetic keyword primer.
 * @param {any} key - Number, string, or object { primer: ..., key: ... }
 * @returns {{ primerValues: number[], primerType: 'numeric'|'keyword', displayKey: string }}
 */
export function validateAutokeyKey(key) {
  let val = key;
  if (typeof key === 'object' && key !== null) {
    val = key.primer !== undefined ? key.primer : key.seed !== undefined ? key.seed : key.key;
  }

  if (val === undefined || val === null || val === '') {
    throw new Error('Seed key or primer keyword is required for Autokey Cipher.');
  }

  if (typeof val === 'string' && val.trim() === '') {
    throw new Error('Seed key or primer keyword is required for Autokey Cipher.');
  }

  // Pure integer number check
  if (typeof val === 'number') {
    if (!Number.isInteger(val)) {
      throw new Error(`Numeric seed key must be an integer. Received: ${val}`);
    }
    const norm = mod(val, 26);
    return {
      primerValues: [norm],
      primerType: 'numeric',
      displayKey: `k0 = ${norm}`
    };
  }

  // String check
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^-?\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      const norm = mod(num, 26);
      return {
        primerValues: [norm],
        primerType: 'numeric',
        displayKey: `k0 = ${norm}`
      };
    }

    const clean = trimmed.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length === 0) {
      throw new Error('Autokey primer keyword must contain at least one alphabetic letter.');
    }
    const primerValues = clean.split('').map((ch) => charToNum(ch));
    return {
      primerValues,
      primerType: 'keyword',
      displayKey: clean
    };
  }

  throw new Error(`Invalid Autokey key format: ${typeof key}. Expected integer seed or keyword string.`);
}

/**
 * Encrypts plaintext using Plaintext-Autokey Cipher.
 * Formula: C[i] = (P[i] + K[i]) mod 26
 * where Keystream K = Primer || Plaintext
 *
 * @param {string} plaintext
 * @param {number|string|{primer: any}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function encrypt(plaintext, key) {
  const text = normalizeText(plaintext);
  const { primerValues, primerType, displayKey } = validateAutokeyKey(key);

  const steps = [];
  let result = '';

  // Extract alphabetic characters to form the plaintext stream
  const plainNums = [];
  for (let i = 0; i < text.length; i++) {
    if (isLetter(text[i])) {
      plainNums.push(charToNum(text[i]));
    }
  }

  // Build keystream: Primer values first, then plaintext character numbers
  const keystream = [...primerValues, ...plainNums];

  let alphaIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const p = plainNums[alphaIndex];
      const k = keystream[alphaIndex];
      const c = mod(p + k, 26);
      const resChar = numToChar(c, isUpper);

      const keyOrigin =
        alphaIndex < primerValues.length
          ? `Seed/Primer[${alphaIndex}]`
          : `Plaintext[${alphaIndex - primerValues.length}] ('${numToChar(k, true)}')`;

      steps.push({
        index: i,
        char: ch,
        alphaIndex,
        plainNum: p,
        keyNum: k,
        keyOrigin,
        resultNum: c,
        resultChar: resChar,
        formula: `${ch}(${p}) + ${numToChar(k, true)}(${k}) [${keyOrigin}] = ${p + k} ≡ ${c} (mod 26) → ${resChar}`
      });

      result += resChar;
      alphaIndex++;
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Autokey Cipher (Plaintext-Autokey)',
      primerType,
      displayKey,
      primerValues,
      operation: 'Encryption',
      formula: 'C[i] = (P[i] + K[i]) mod 26 where K = Primer || Plaintext'
    }
  };
}

/**
 * Decrypts ciphertext using Plaintext-Autokey Cipher.
 * Progressively recovers plaintext and extends the keystream.
 * Formula: P[i] = (C[i] - K[i] + 26) mod 26
 *
 * @param {string} ciphertext
 * @param {number|string|{primer: any}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function decrypt(ciphertext, key) {
  const text = normalizeText(ciphertext);
  const { primerValues, primerType, displayKey } = validateAutokeyKey(key);

  const steps = [];
  let result = '';

  const primerLen = primerValues.length;
  const recoveredPlainNums = [];
  const dynamicKeystream = [...primerValues];

  let alphaIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const c = charToNum(ch);
      const k = dynamicKeystream[alphaIndex];
      const p = mod(c - k, 26);
      const resChar = numToChar(p, isUpper);

      recoveredPlainNums.push(p);
      // Extend dynamic keystream with the newly recovered plaintext character
      dynamicKeystream.push(p);

      const keyOrigin =
        alphaIndex < primerLen
          ? `Seed/Primer[${alphaIndex}]`
          : `RecoveredPlain[${alphaIndex - primerLen}] ('${numToChar(k, true)}')`;

      steps.push({
        index: i,
        char: ch,
        alphaIndex,
        cipherNum: c,
        keyNum: k,
        keyOrigin,
        resultNum: p,
        resultChar: resChar,
        formula: `${ch}(${c}) - ${numToChar(k, true)}(${k}) [${keyOrigin}] = ${c - k} ≡ ${p} (mod 26) → ${resChar}`
      });

      result += resChar;
      alphaIndex++;
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Autokey Cipher (Plaintext-Autokey)',
      primerType,
      displayKey,
      primerValues,
      operation: 'Decryption',
      formula: 'P[i] = (C[i] - K[i] + 26) mod 26'
    }
  };
}

export default {
  encrypt,
  decrypt,
  validateKey: validateAutokeyKey
};
