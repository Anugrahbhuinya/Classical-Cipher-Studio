import { normalizeText } from './utils.js';

/**
 * Validates the number of rails.
 * @param {any} key - Integer or object { rails: number } / { key: number }
 * @returns {number} Number of rails d >= 1
 */
export function validateRailFenceKey(key) {
  let val = key;
  if (typeof key === 'object' && key !== null) {
    val = key.rails !== undefined ? key.rails : key.key;
  }

  if (val === undefined || val === null || val === '') {
    throw new Error('Number of rails is required for Rail Fence Cipher.');
  }

  const num = Number(val);
  if (!Number.isInteger(num) || num < 1) {
    throw new Error(`Number of rails must be an integer >= 1. Received: ${val}`);
  }

  return num;
}

/**
 * Computes rail index for position i with d rails.
 * Trajectory: 0, 1, ..., d-1, d-2, ..., 1, 0, 1, ...
 * @param {number} i - Character index
 * @param {number} d - Number of rails
 * @returns {number} Rail index in [0, d - 1]
 */
export function getRailIndex(i, d) {
  if (d === 1) return 0;
  const cycle = 2 * (d - 1);
  const pos = i % cycle;
  return pos < d ? pos : cycle - pos;
}

/**
 * Encrypts text using Rail Fence (Zig-Zag) Cipher.
 * Preserves all characters, spaces, and punctuation consistently.
 *
 * @param {string} plaintext
 * @param {number|{rails: number}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function encrypt(plaintext, key) {
  const text = normalizeText(plaintext);
  const rails = validateRailFenceKey(key);

  if (text.length === 0 || rails === 1 || rails >= text.length) {
    return {
      result: text,
      steps: [
        {
          note: rails === 1 ? 'Single rail specified: text remains unaltered.' : 'Text length <= rails: no transposition occurs.',
          text
        }
      ],
      metadata: {
        algorithm: 'Rail Fence Cipher',
        rails,
        cycleLength: rails > 1 ? 2 * (rails - 1) : 1,
        operation: 'Encryption'
      }
    };
  }

  // Initialize rail buckets
  const railBuckets = Array.from({ length: rails }, () => []);
  const steps = [];

  for (let i = 0; i < text.length; i++) {
    const r = getRailIndex(i, rails);
    railBuckets[r].push(text[i]);
    steps.push({
      charIndex: i,
      char: text[i],
      rail: r,
      formula: `Position ${i} placed on Rail ${r + 1} (0-indexed ${r})`
    });
  }

  // Read off rails row by row
  const result = railBuckets.map((bucket) => bucket.join('')).join('');

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Rail Fence Cipher',
      rails,
      cycleLength: 2 * (rails - 1),
      railLengths: railBuckets.map((b) => b.length),
      operation: 'Encryption',
      railDistribution: railBuckets.map((bucket, idx) => ({
        rail: idx + 1,
        content: bucket.join(''),
        count: bucket.length
      }))
    }
  };
}

/**
 * Decrypts text using Rail Fence (Zig-Zag) Cipher.
 * Reconstructs the exact zigzag path.
 *
 * @param {string} ciphertext
 * @param {number|{rails: number}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function decrypt(ciphertext, key) {
  const text = normalizeText(ciphertext);
  const rails = validateRailFenceKey(key);

  if (text.length === 0 || rails === 1 || rails >= text.length) {
    return {
      result: text,
      steps: [
        {
          note: rails === 1 ? 'Single rail specified: text remains unaltered.' : 'Text length <= rails: no transposition occurs.',
          text
        }
      ],
      metadata: {
        algorithm: 'Rail Fence Cipher',
        rails,
        cycleLength: rails > 1 ? 2 * (rails - 1) : 1,
        operation: 'Decryption'
      }
    };
  }

  // Step 1: Calculate character count per rail
  const railCounts = Array(rails).fill(0);
  for (let i = 0; i < text.length; i++) {
    const r = getRailIndex(i, rails);
    railCounts[r]++;
  }

  // Step 2: Slice ciphertext into rail segments
  const railSegments = [];
  let currentIdx = 0;
  for (let r = 0; r < rails; r++) {
    const count = railCounts[r];
    railSegments.push(text.slice(currentIdx, currentIdx + count).split(''));
    currentIdx += count;
  }

  // Step 3: Reconstruct plaintext by following zigzag trajectory
  const steps = [];
  const resultChars = [];

  for (let i = 0; i < text.length; i++) {
    const r = getRailIndex(i, rails);
    const ch = railSegments[r].shift();
    resultChars.push(ch);
    steps.push({
      charIndex: i,
      rail: r,
      char: ch,
      formula: `Take next character from Rail ${r + 1} → '${ch}'`
    });
  }

  const result = resultChars.join('');

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Rail Fence Cipher',
      rails,
      cycleLength: 2 * (rails - 1),
      railCounts,
      operation: 'Decryption'
    }
  };
}

export default {
  encrypt,
  decrypt,
  validateKey: validateRailFenceKey,
  getRailIndex
};

