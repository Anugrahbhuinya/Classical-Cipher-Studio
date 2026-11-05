import { normalizeText } from './utils.js';

/**
 * Parses and validates a permutation key.
 * Supports:
 * - Array of numbers: [4, 1, 3, 2, 5] (1-based) or [3, 0, 2, 1, 4] (0-based)
 * - Delimited string: "4 1 3 2 5" or "4, 1, 3, 2, 5"
 * - Alphabetic keyword: "ZEBRA" (ranks letters alphabetically)
 * - Object: { permutationKey: ..., keyFormat: ... }
 *
 * @param {any} key
 * @returns {{ permutation: number[], inversePermutation: number[], blockSize: number, displayKey: string }}
 */
export function validateKeyedTranspositionKey(key) {
  let val = key;
  let keyFormat = 'auto';

  if (typeof key === 'object' && key !== null && !Array.isArray(key)) {
    keyFormat = key.keyFormat || 'auto';
    val = key.permutationKey !== undefined ? key.permutationKey : key.key;
  }

  if (val === undefined || val === null || val === '') {
    throw new Error('Permutation key is required for Keyed Transposition Cipher.');
  }

  let permutation = [];
  let displayKey = '';

  // 1. Array of numbers
  if (Array.isArray(val)) {
    if (val.length < 2) {
      throw new Error(`Permutation length must be at least 2. Received length ${val.length}.`);
    }
    const nums = val.map((x) => Number(x));
    if (nums.some((x) => !Number.isInteger(x))) {
      throw new Error('All elements of permutation key array must be integers.');
    }
    permutation = normalizePermutationNumbers(nums);
    displayKey = val.join(' ');
  } else if (typeof val === 'string') {
    const trimmed = val.trim();
    // Check if it's a numeric string (numbers separated by spaces/commas)
    const isNumericString = /^[\d\s,]+$/.test(trimmed);

    if (keyFormat === 'keyword' || (!isNumericString && /^[a-zA-Z]+$/.test(trimmed))) {
      // Keyword mode
      const cleanKeyword = trimmed.toUpperCase().replace(/[^A-Z]/g, '');
      if (cleanKeyword.length < 2) {
        throw new Error('Keyword for permutation must contain at least 2 alphabetic characters.');
      }
      permutation = keywordToPermutation(cleanKeyword);
      displayKey = cleanKeyword;
    } else {
      // Numeric mode
      const rawTokens = trimmed.split(/[\s,]+/).filter(Boolean);
      if (rawTokens.length < 2) {
        throw new Error(`Numeric permutation must contain at least 2 numbers. Found: ${rawTokens.length}.`);
      }
      const nums = rawTokens.map((t) => {
        const n = Number(t);
        if (!Number.isInteger(n)) {
          throw new Error(`Invalid permutation token: "${t}". Must be an integer.`);
        }
        return n;
      });
      permutation = normalizePermutationNumbers(nums);
      displayKey = rawTokens.join(' ');
    }
  } else {
    throw new Error(`Unsupported permutation key format: ${typeof key}`);
  }

  const blockSize = permutation.length;

  // Compute inverse permutation
  // If B'[i] = B[π[i]], then B[π[i]] = B'[i] => π⁻¹[π[i]] = i
  const inversePermutation = Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    inversePermutation[permutation[i]] = i;
  }

  return {
    permutation,
    inversePermutation,
    blockSize,
    displayKey
  };
}

/**
 * Converts array of 1-based or 0-based numbers into valid 0-based permutation [0, ..., m-1].
 * @param {number[]} nums
 * @returns {number[]} 0-based permutation
 */
function normalizePermutationNumbers(nums) {
  const m = nums.length;
  const min = Math.min(...nums);
  const max = Math.max(...nums);

  let zeroBased;
  if (min === 1 && max === m) {
    // Standard 1-based permutation (e.g. 1 to m)
    zeroBased = nums.map((x) => x - 1);
  } else if (min === 0 && max === m - 1) {
    // 0-based permutation (0 to m - 1)
    zeroBased = [...nums];
  } else {
    throw new Error(
      `Permutation must contain numbers from 1 to ${m} (or 0 to ${m - 1}) without gaps or duplicates. Received: [${nums.join(
        ', '
      )}].`
    );
  }

  const seen = new Set(zeroBased);
  if (seen.size !== m) {
    throw new Error(`Permutation numbers must be distinct without duplicates. Received: [${nums.join(', ')}].`);
  }

  return zeroBased;
}

/**
 * Converts alphabetic keyword into permutation based on alphabetical rank of characters.
 * E.g., "ZEBRA" -> A=1, B=2, E=3, R=4, Z=5 -> [4, 1, 0, 3, 2]
 * @param {string} keyword
 * @returns {number[]} 0-based permutation
 */
function keywordToPermutation(keyword) {
  const indexed = keyword.split('').map((char, index) => ({ char, index }));
  // Stable sort by character
  indexed.sort((a, b) => a.char.localeCompare(b.char) || a.index - b.index);

  const perm = Array(keyword.length);
  for (let rank = 0; rank < indexed.length; rank++) {
    perm[rank] = indexed[rank].index;
  }
  return perm;
}

/**
 * Encrypts plaintext using Keyed Block-Permutation Transposition Cipher.
 * Divides message into blocks of size m and applies permutation independently.
 *
 * @param {string} plaintext
 * @param {any} key - Permutation key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function encrypt(plaintext, key) {
  const text = normalizeText(plaintext);
  const { permutation, inversePermutation, blockSize, displayKey } = validateKeyedTranspositionKey(key);

  if (text.length === 0) {
    return {
      result: '',
      steps: [],
      metadata: {
        algorithm: 'Keyed Transposition Cipher',
        blockSize,
        permutation,
        inversePermutation,
        displayKey,
        paddedCount: 0,
        operation: 'Encryption'
      }
    };
  }

  // Handle padding for incomplete final block
  const remainder = text.length % blockSize;
  let paddedCount = 0;
  let paddedText = text;

  if (remainder !== 0) {
    paddedCount = blockSize - remainder;
    paddedText += 'X'.repeat(paddedCount);
  }

  const steps = [];
  const resultBlocks = [];
  const numBlocks = paddedText.length / blockSize;

  for (let b = 0; b < numBlocks; b++) {
    const blockStart = b * blockSize;
    const blockChars = paddedText.slice(blockStart, blockStart + blockSize);
    const transformed = Array(blockSize);

    for (let i = 0; i < blockSize; i++) {
      transformed[i] = blockChars[permutation[i]];
    }

    const transformedBlock = transformed.join('');
    resultBlocks.push(transformedBlock);

    steps.push({
      blockIndex: b,
      inputBlock: blockChars,
      permutation: permutation.map((x) => x + 1), // 1-based display
      outputBlock: transformedBlock,
      isPadded: b === numBlocks - 1 && paddedCount > 0,
      formula: `Block ${b + 1}: "${blockChars}" permuted by [${permutation
        .map((x) => x + 1)
        .join(', ')}] → "${transformedBlock}"`
    });
  }

  const result = resultBlocks.join('');

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Keyed Transposition Cipher',
      blockSize,
      permutation: permutation.map((x) => x + 1),
      permutation0Based: permutation,
      inversePermutation: inversePermutation.map((x) => x + 1),
      displayKey,
      paddedCount,
      blockCount: numBlocks,
      paddingChar: 'X',
      operation: 'Encryption',
      note: 'Block-permutation: each block of length m is reordered via B\'[i] = B[π[i]].'
    }
  };
}

/**
 * Decrypts ciphertext using Keyed Block-Permutation Transposition Cipher.
 * Applies the inverse permutation π⁻¹ to each block.
 *
 * @param {string} ciphertext
 * @param {any} key - Permutation key
 * @param {{ unpad?: boolean, paddedCount?: number }} [options={}]
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function decrypt(ciphertext, key, options = {}) {
  const text = normalizeText(ciphertext);
  const { permutation, inversePermutation, blockSize, displayKey } = validateKeyedTranspositionKey(key);

  if (text.length === 0) {
    return {
      result: '',
      steps: [],
      metadata: {
        algorithm: 'Keyed Transposition Cipher',
        blockSize,
        permutation,
        inversePermutation,
        displayKey,
        operation: 'Decryption'
      }
    };
  }

  if (text.length % blockSize !== 0) {
    throw new Error(
      `Ciphertext length (${text.length}) is not a multiple of permutation block size (${blockSize}).`
    );
  }

  const steps = [];
  const resultBlocks = [];
  const numBlocks = text.length / blockSize;

  for (let b = 0; b < numBlocks; b++) {
    const blockStart = b * blockSize;
    const blockChars = text.slice(blockStart, blockStart + blockSize);
    const transformed = Array(blockSize);

    for (let i = 0; i < blockSize; i++) {
      transformed[i] = blockChars[inversePermutation[i]];
    }

    const transformedBlock = transformed.join('');
    resultBlocks.push(transformedBlock);

    steps.push({
      blockIndex: b,
      inputBlock: blockChars,
      inversePermutation: inversePermutation.map((x) => x + 1), // 1-based display
      outputBlock: transformedBlock,
      formula: `Block ${b + 1}: "${blockChars}" inverted by [${inversePermutation
        .map((x) => x + 1)
        .join(', ')}] → "${transformedBlock}"`
    });
  }

  let result = resultBlocks.join('');
  let unpaddedResult = result;

  const padCount =
    typeof options.paddedCount === 'number'
      ? options.paddedCount
      : typeof key === 'object' && typeof key?.paddedCount === 'number'
      ? key.paddedCount
      : 0;

  if (padCount > 0 && padCount < result.length) {
    unpaddedResult = result.slice(0, result.length - padCount);
  }

  return {
    result: options.unpad ? unpaddedResult : result,
    rawResult: result,
    unpaddedResult,
    steps,
    metadata: {
      algorithm: 'Keyed Transposition Cipher',
      blockSize,
      permutation: permutation.map((x) => x + 1),
      inversePermutation: inversePermutation.map((x) => x + 1),
      displayKey,
      blockCount: numBlocks,
      paddedCount: padCount,
      operation: 'Decryption',
      paddingNote: 'Padding characters (X) are preserved in the raw block result to maintain block integrity.'
    }
  };
}

export default {
  encrypt,
  decrypt,
  validateKey: validateKeyedTranspositionKey
};
