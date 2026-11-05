/**
 * Classical Cipher Studio - Central Algorithm Export & Registry
 * Exports mathematical implementations for all 10 classical cryptographic algorithms.
 */

import * as additiveCipher from './additiveCipher.js';
import * as multiplicativeCipher from './multiplicativeCipher.js';
import * as affineCipher from './affineCipher.js';
import * as monoalphabeticCipher from './monoalphabeticCipher.js';
import * as autokeyCipher from './autokeyCipher.js';
import * as playfairCipher from './playfairCipher.js';
import * as vigenereCipher from './vigenereCipher.js';
import * as hillCipher from './hillCipher.js';
import * as railFenceCipher from './railFenceCipher.js';
import * as keyedTranspositionCipher from './keyedTranspositionCipher.js';
import * as utils from './utils.js';

export {
  additiveCipher,
  multiplicativeCipher,
  affineCipher,
  monoalphabeticCipher,
  autokeyCipher,
  playfairCipher,
  vigenereCipher,
  hillCipher,
  railFenceCipher,
  keyedTranspositionCipher,
  utils
};

/**
 * Registry mapping cipher ID to its algorithm module.
 */
export const CIPHER_ENGINES = {
  caesar: additiveCipher,
  additive: additiveCipher,
  multiplicative: multiplicativeCipher,
  affine: affineCipher,
  monoalphabetic: monoalphabeticCipher,
  autokey: autokeyCipher,
  playfair: playfairCipher,
  vigenere: vigenereCipher,
  hill: hillCipher,
  railfence: railFenceCipher,
  keyedtransposition: keyedTranspositionCipher
};

/**
 * Retrieves the cryptographic engine for a given cipher identifier.
 * @param {string} cipherId
 * @returns {{ encrypt: Function, decrypt: Function, validateKey?: Function }}
 */
export function getCipherEngine(cipherId) {
  const normalizedId = String(cipherId).toLowerCase().replace(/[^a-z]/g, '');
  const engine = CIPHER_ENGINES[normalizedId];
  if (!engine) {
    throw new Error(`Unsupported cipher algorithm ID: "${cipherId}".`);
  }
  return engine;
}

export default CIPHER_ENGINES;

