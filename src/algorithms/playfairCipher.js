import { normalizeText } from './utils.js';

const PLAYFAIR_ALPHABET = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // 25 letters, J replaced by I

/**
 * Validates and extracts the Playfair keyword.
 * @param {any} key - String or object { keyword: string } / { key: string }
 * @returns {string} Normalized uppercase keyword
 */
export function validatePlayfairKey(key) {
  let val = key;
  if (typeof key === 'object' && key !== null) {
    val = key.keyword !== undefined ? key.keyword : key.key;
  }

  if (typeof val !== 'string') {
    throw new Error('Playfair Cipher keyword must be a string.');
  }

  const clean = val.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  if (clean.length === 0) {
    throw new Error('Playfair Cipher keyword must contain at least one alphabetic character.');
  }

  return clean;
}

/**
 * Generates 5x5 Playfair key matrix from keyword.
 * Combines I and J into I.
 *
 * @param {string} keyword
 * @returns {{ matrix: string[][], posMap: Map<string, { row: number, col: number }> }}
 */
export function generatePlayfairMatrix(keyword) {
  const cleanKey = validatePlayfairKey(keyword);
  const seen = new Set();
  const sequence = [];

  for (const ch of cleanKey) {
    if (!seen.has(ch)) {
      seen.add(ch);
      sequence.push(ch);
    }
  }

  for (const ch of PLAYFAIR_ALPHABET) {
    if (!seen.has(ch)) {
      seen.add(ch);
      sequence.push(ch);
    }
  }

  const matrix = [];
  const posMap = new Map();

  for (let r = 0; r < 5; r++) {
    const row = [];
    for (let c = 0; c < 5; c++) {
      const ch = sequence[r * 5 + c];
      row.push(ch);
      posMap.set(ch, { row: r, col: c });
    }
    matrix.push(row);
  }

  // Also map 'J' to 'I''s position
  const posI = posMap.get('I');
  if (posI) {
    posMap.set('J', posI);
  }

  return { matrix, posMap };
}

/**
 * Prepares plaintext into Playfair digraphs:
 * - Converts to uppercase and maps J to I
 * - Inserts 'X' (or 'Z' if repeated is 'X') between identical consecutive letters
 * - Appends 'X' (or 'Z') if total length is odd
 *
 * @param {string} text
 * @returns {{ digraphs: Array<[string, string]>, rawChars: string[], paddedIndices: number[] }}
 */
export function prepareDigraphs(text) {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I').split('');
  const digraphs = [];
  const paddedIndices = [];

  let i = 0;
  while (i < letters.length) {
    const first = letters[i];
    if (i + 1 < letters.length) {
      const second = letters[i + 1];
      if (first === second) {
        const filler = first === 'X' ? 'Z' : 'X';
        digraphs.push([first, filler]);
        paddedIndices.push(digraphs.length - 1);
        i += 1; // Process second letter in next pair
      } else {
        digraphs.push([first, second]);
        i += 2;
      }
    } else {
      const filler = first === 'X' ? 'Z' : 'X';
      digraphs.push([first, filler]);
      paddedIndices.push(digraphs.length - 1);
      i += 1;
    }
  }

  return { digraphs, rawChars: letters, paddedIndices };
}

/**
 * Encrypts plaintext using Playfair Cipher.
 *
 * @param {string} plaintext
 * @param {string|{keyword: string}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function encrypt(plaintext, key) {
  const text = normalizeText(plaintext);
  const keyword = validatePlayfairKey(key);
  const { matrix, posMap } = generatePlayfairMatrix(keyword);
  const { digraphs, paddedIndices } = prepareDigraphs(text);

  const steps = [];
  const resultPairs = [];

  for (let idx = 0; idx < digraphs.length; idx++) {
    const [c1, c2] = digraphs[idx];
    const pos1 = posMap.get(c1);
    const pos2 = posMap.get(c2);

    let res1, res2, rule;

    if (pos1.row === pos2.row) {
      // Rule 1: Same row -> shift right (col + 1) mod 5
      rule = 'Same Row (Shift Right)';
      res1 = matrix[pos1.row][(pos1.col + 1) % 5];
      res2 = matrix[pos2.row][(pos2.col + 1) % 5];
    } else if (pos1.col === pos2.col) {
      // Rule 2: Same column -> shift down (row + 1) mod 5
      rule = 'Same Column (Shift Down)';
      res1 = matrix[(pos1.row + 1) % 5][pos1.col];
      res2 = matrix[(pos2.row + 1) % 5][pos2.col];
    } else {
      // Rule 3: Rectangle -> exchange columns
      rule = 'Rectangle (Swap Columns)';
      res1 = matrix[pos1.row][pos2.col];
      res2 = matrix[pos2.row][pos1.col];
    }

    resultPairs.push(res1 + res2);
    steps.push({
      pairIndex: idx,
      inputPair: `${c1}${c2}`,
      pos1: `(${pos1.row}, ${pos1.col})`,
      pos2: `(${pos2.row}, ${pos2.col})`,
      rule,
      outputPair: `${res1}${res2}`,
      isPadded: paddedIndices.includes(idx),
      formula: `[${c1}, ${c2}] → [${res1}, ${res2}] via ${rule}`
    });
  }

  const result = resultPairs.join('');

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Playfair Cipher',
      keyword,
      matrix,
      digraphCount: digraphs.length,
      paddedIndices,
      operation: 'Encryption',
      note: 'Letter J is merged with I in the 5x5 key matrix.'
    }
  };
}

/**
 * Decrypts ciphertext using Playfair Cipher.
 * Ciphertext is processed in 2-letter blocks.
 *
 * @param {string} ciphertext
 * @param {string|{keyword: string}} key
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function decrypt(ciphertext, key) {
  const text = normalizeText(ciphertext);
  const keyword = validatePlayfairKey(key);
  const { matrix, posMap } = generatePlayfairMatrix(keyword);

  const cleanChars = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  if (cleanChars.length % 2 !== 0) {
    throw new Error(
      `Ciphertext length for Playfair decryption must be even. Found ${cleanChars.length} letters.`
    );
  }

  const steps = [];
  const resultPairs = [];

  for (let idx = 0; idx < cleanChars.length; idx += 2) {
    const c1 = cleanChars[idx];
    const c2 = cleanChars[idx + 1];
    const pos1 = posMap.get(c1);
    const pos2 = posMap.get(c2);

    if (!pos1 || !pos2) {
      throw new Error(`Character '${!pos1 ? c1 : c2}' not found in Playfair key matrix.`);
    }

    let res1, res2, rule;

    if (pos1.row === pos2.row) {
      // Rule 1: Same row -> shift left (col - 1 + 5) mod 5
      rule = 'Same Row (Shift Left)';
      res1 = matrix[pos1.row][(pos1.col + 4) % 5];
      res2 = matrix[pos2.row][(pos2.col + 4) % 5];
    } else if (pos1.col === pos2.col) {
      // Rule 2: Same column -> shift up (row - 1 + 5) mod 5
      rule = 'Same Column (Shift Up)';
      res1 = matrix[(pos1.row + 4) % 5][pos1.col];
      res2 = matrix[(pos2.row + 4) % 5][pos2.col];
    } else {
      // Rule 3: Rectangle -> exchange columns
      rule = 'Rectangle (Swap Columns)';
      res1 = matrix[pos1.row][pos2.col];
      res2 = matrix[pos2.row][pos1.col];
    }

    resultPairs.push(res1 + res2);
    steps.push({
      pairIndex: idx / 2,
      inputPair: `${c1}${c2}`,
      pos1: `(${pos1.row}, ${pos1.col})`,
      pos2: `(${pos2.row}, ${pos2.col})`,
      rule,
      outputPair: `${res1}${res2}`,
      formula: `[${c1}, ${c2}] → [${res1}, ${res2}] via ${rule}`
    });
  }

  const result = resultPairs.join('');

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Playfair Cipher',
      keyword,
      matrix,
      digraphCount: cleanChars.length / 2,
      operation: 'Decryption',
      fillerNote:
        "Filler characters ('X' / 'Z') inserted during encryption are retained in decrypted output to prevent accidental truncation of genuine plaintext letters."
    }
  };
}

export default {
  encrypt,
  decrypt,
  validateKey: validatePlayfairKey,
  generateMatrix: generatePlayfairMatrix
};

