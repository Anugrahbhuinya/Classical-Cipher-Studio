import {
  mod,
  gcd,
  charToNum,
  numToChar,
  invertMatrixMod,
  multiplyMatrixVector,
  normalizeText
} from './utils.js';

/**
 * Validates and normalizes the Hill Cipher key matrix.
 * Supports 2x2 and 3x3 square matrices.
 *
 * @param {any} key - 2D array, flat array, or object { matrix, matrix3, dimension }
 * @returns {{ matrix: number[][], dimension: number, inverseMatrix: number[][], det: number, detInverse: number }}
 */
export function validateHillKey(key) {
  let rawMatrix = key;
  let dimension = null;

  if (typeof key === 'object' && key !== null && !Array.isArray(key)) {
    if (key.dimension === 3 || key.dimension === '3') {
      rawMatrix = key.matrix3 || key.matrix || key.key;
      dimension = 3;
    } else {
      rawMatrix = key.matrix || key.matrix3 || key.key;
      dimension = key.dimension ? Number(key.dimension) : null;
    }
  }

  if (!rawMatrix) {
    throw new Error('Hill Cipher requires a 2x2 or 3x3 key matrix.');
  }

  // Handle flat 1D array of 4 or 9 numbers
  if (Array.isArray(rawMatrix) && rawMatrix.length > 0 && !Array.isArray(rawMatrix[0])) {
    if (rawMatrix.length === 4) {
      rawMatrix = [
        [rawMatrix[0], rawMatrix[1]],
        [rawMatrix[2], rawMatrix[3]]
      ];
      dimension = 2;
    } else if (rawMatrix.length === 9) {
      rawMatrix = [
        [rawMatrix[0], rawMatrix[1], rawMatrix[2]],
        [rawMatrix[3], rawMatrix[4], rawMatrix[5]],
        [rawMatrix[6], rawMatrix[7], rawMatrix[8]]
      ];
      dimension = 3;
    } else {
      throw new Error(`Flat matrix array must contain exactly 4 or 9 numbers. Received length ${rawMatrix.length}.`);
    }
  }

  if (!Array.isArray(rawMatrix) || (rawMatrix.length !== 2 && rawMatrix.length !== 3)) {
    throw new Error('Hill Cipher matrix must be 2x2 or 3x3.');
  }

  const n = rawMatrix.length;
  dimension = n;

  // Validate matrix cells are integers
  const matrix = [];
  for (let r = 0; r < n; r++) {
    const row = rawMatrix[r];
    if (!Array.isArray(row) || row.length !== n) {
      throw new Error(`Matrix row ${r} must contain exactly ${n} numbers.`);
    }
    const cleanRow = [];
    for (let c = 0; c < n; c++) {
      const val = Number(row[c]);
      if (!Number.isInteger(val)) {
        throw new Error(`Matrix element at [${r}][${c}] must be an integer. Received: ${row[c]}`);
      }
      cleanRow.push(mod(val, 26));
    }
    matrix.push(cleanRow);
  }

  // Compute modular inverse matrix
  const { inverseMatrix, det, detInverse } = invertMatrixMod(matrix, 26);

  return {
    matrix,
    dimension: n,
    inverseMatrix,
    det,
    detInverse
  };
}

/**
 * Encrypts plaintext using Hill Cipher.
 * Formula: C = (K * P) mod 26
 * Column vector orientation: C_vector = Matrix * P_vector (mod 26).
 *
 * @param {string} plaintext
 * @param {any} key - Key matrix specification
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function encrypt(plaintext, key) {
  const text = normalizeText(plaintext);
  const { matrix, dimension, inverseMatrix, det, detInverse } = validateHillKey(key);

  const letters = text.toUpperCase().replace(/[^A-Z]/g, '').split('');
  if (letters.length === 0) {
    return {
      result: '',
      steps: [],
      metadata: {
        algorithm: 'Hill Cipher',
        dimension,
        matrix,
        inverseMatrix,
        det,
        detInverse,
        paddedCount: 0,
        orientation: 'Column Vector: C = K · P (mod 26)'
      }
    };
  }

  // Handle padding to a multiple of dimension
  const remainder = letters.length % dimension;
  let paddedCount = 0;
  if (remainder !== 0) {
    paddedCount = dimension - remainder;
    for (let p = 0; p < paddedCount; p++) {
      letters.push('X');
    }
  }

  const steps = [];
  let result = '';

  for (let i = 0; i < letters.length; i += dimension) {
    const blockChars = letters.slice(i, i + dimension);
    const vectorP = blockChars.map((ch) => charToNum(ch));
    const vectorC = multiplyMatrixVector(matrix, vectorP, 26);
    const resultChars = vectorC.map((num) => numToChar(num, true));

    const blockResult = resultChars.join('');
    result += blockResult;

    steps.push({
      blockIndex: i / dimension,
      inputBlock: blockChars.join(''),
      vectorP,
      matrix,
      vectorC,
      outputBlock: blockResult,
      isPadded: i + dimension > letters.length - paddedCount,
      formula: `K · [${vectorP.join(', ')}]ᵀ ≡ [${vectorC.join(', ')}]ᵀ (mod 26) → ${blockResult}`
    });
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Hill Cipher',
      dimension,
      matrix,
      inverseMatrix,
      det,
      detInverse,
      paddedCount,
      orientation: 'Column Vector: C = K · P (mod 26)',
      operation: 'Encryption',
      note: 'Processed in alphabetic vector blocks; non-letters excluded from vector math.'
    }
  };
}

/**
 * Decrypts ciphertext using Hill Cipher.
 * Formula: P = (K⁻¹ * C) mod 26
 *
 * @param {string} ciphertext
 * @param {any} key - Key matrix specification
 * @returns {{ result: string, steps: Array, metadata: Object }}
 */
export function decrypt(ciphertext, key) {
  const text = normalizeText(ciphertext);
  const { matrix, dimension, inverseMatrix, det, detInverse } = validateHillKey(key);

  const letters = text.toUpperCase().replace(/[^A-Z]/g, '').split('');
  if (letters.length === 0) {
    return {
      result: '',
      steps: [],
      metadata: {
        algorithm: 'Hill Cipher',
        dimension,
        matrix,
        inverseMatrix,
        det,
        detInverse,
        orientation: 'Column Vector: P = K⁻¹ · C (mod 26)'
      }
    };
  }

  if (letters.length % dimension !== 0) {
    throw new Error(
      `Ciphertext letter length (${letters.length}) must be a multiple of matrix dimension (${dimension}).`
    );
  }

  const steps = [];
  let result = '';

  for (let i = 0; i < letters.length; i += dimension) {
    const blockChars = letters.slice(i, i + dimension);
    const vectorC = blockChars.map((ch) => charToNum(ch));
    const vectorP = multiplyMatrixVector(inverseMatrix, vectorC, 26);
    const resultChars = vectorP.map((num) => numToChar(num, true));

    const blockResult = resultChars.join('');
    result += blockResult;

    steps.push({
      blockIndex: i / dimension,
      inputBlock: blockChars.join(''),
      vectorC,
      inverseMatrix,
      vectorP,
      outputBlock: blockResult,
      formula: `K⁻¹ · [${vectorC.join(', ')}]ᵀ ≡ [${vectorP.join(', ')}]ᵀ (mod 26) → ${blockResult}`
    });
  }

  return {
    result,
    steps,
    metadata: {
      algorithm: 'Hill Cipher',
      dimension,
      matrix,
      inverseMatrix,
      det,
      detInverse,
      orientation: 'Column Vector: P = K⁻¹ · C (mod 26)',
      operation: 'Decryption',
      paddingNote: 'Any trailing padding letters (e.g., X) added during encryption are retained in the decrypted output.'
    }
  };
}

export default {
  encrypt,
  decrypt,
  validateKey: validateHillKey
};

