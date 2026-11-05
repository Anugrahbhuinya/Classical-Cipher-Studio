import { isLetter, charToNum, normalizeText } from './utils.js';

const STANDARD_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Validates that the key is a valid 26-letter permutation alphabet.
 * @param {any} key - String of 26 letters or object { cipherAlphabet: string } / { key: string }
 * @returns {string} 26-character uppercase substitution alphabet
 */
export function validateMonoalphabeticKey(key) {
  let val = key;
  if (typeof key === 'object' && key !== null) {
    val = key.cipherAlphabet !== undefined ? key.cipherAlphabet : key.key;
  }

  if (typeof val !== 'string') {
    throw new Error('Substitution alphabet key must be a 26-character string.');
  }

  const clean = val.toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length !== 26) {
    throw new Error(`Substitution alphabet must contain exactly 26 letters. Found ${clean.length} letters in: "${val}".`);
  }

  const uniqueLetters = new Set(clean);
  if (uniqueLetters.size !== 26) {
    const missing = STANDARD_ALPHABET.split('').filter((ch) => !uniqueLetters.has(ch));
    throw new Error(
      `Substitution alphabet contains duplicates. Missing letters: [${missing.join(', ')}].`
    );
  }

  return clean;
}

/**
 * Builds forward and inverse substitution mappings.
 * @param {string} cipherAlphabet
 * @returns {{ forward: Map<string, string>, reverse: Map<string, string> }}
 */
export function buildMapping(cipherAlphabet) {
  const forward = new Map();
  const reverse = new Map();

  for (let i = 0; i < 26; i++) {
    const plainChar = STANDARD_ALPHABET[i];
    const cipherChar = cipherAlphabet[i];
    forward.set(plainChar, cipherChar);
    reverse.set(cipherChar, plainChar);
  }

  return { forward, reverse };
}

/**
 * Encrypts plaintext using Monoalphabetic Substitution Cipher.
 *
 * @param {string} plaintext
 * @param {string|{cipherAlphabet: string}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function encrypt(plaintext, key) {
  const text = normalizeText(plaintext);
  const cipherAlphabet = validateMonoalphabeticKey(key);
  const { forward } = buildMapping(cipherAlphabet);

  const steps = [];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const upperCh = ch.toUpperCase();
      const mappedUpper = forward.get(upperCh);
      const resChar = isUpper ? mappedUpper : mappedUpper.toLowerCase();

      result += resChar;
      steps.push({
        index: i,
        char: ch,
        plainChar: upperCh,
        cipherChar: mappedUpper,
        resultChar: resChar,
        formula: `${ch} → ${resChar}`
      });
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Monoalphabetic Substitution Cipher',
      cipherAlphabet,
      standardAlphabet: STANDARD_ALPHABET,
      operation: 'Encryption'
    }
  };
}

/**
 * Decrypts ciphertext using Monoalphabetic Substitution Cipher.
 *
 * @param {string} ciphertext
 * @param {string|{cipherAlphabet: string}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function decrypt(ciphertext, key) {
  const text = normalizeText(ciphertext);
  const cipherAlphabet = validateMonoalphabeticKey(key);
  const { reverse } = buildMapping(cipherAlphabet);

  const steps = [];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const upperCh = ch.toUpperCase();
      const plainUpper = reverse.get(upperCh);
      const resChar = isUpper ? plainUpper : plainUpper.toLowerCase();

      result += resChar;
      steps.push({
        index: i,
        char: ch,
        cipherChar: upperCh,
        plainChar: plainUpper,
        resultChar: resChar,
        formula: `${ch} → ${resChar}`
      });
    } else {
      result += ch;
    }
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Monoalphabetic Substitution Cipher',
      cipherAlphabet,
      standardAlphabet: STANDARD_ALPHABET,
      operation: 'Decryption'
    }
  };
}

export default {
  encrypt,
  decrypt,
  validateKey: validateMonoalphabeticKey
};

