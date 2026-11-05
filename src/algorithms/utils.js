/**
 * Mathematical and cryptographic helper utilities for Classical Cipher Studio.
 * Implements pure modular arithmetic, matrix operations, and character mapping.
 */

/**
 * Mathematical modulo that handles negative numbers correctly.
 * Returns a value in [0, m - 1].
 * @param {number} n - The dividend
 * @param {number} m - The modulus
 * @returns {number} n mod m
 */
export function mod(n, m) {
  if (m <= 0) {
    throw new Error(`Modulus must be positive, received: ${m}`);
  }
  return ((n % m) + m) % m;
}

/**
 * Greatest Common Divisor of two integers using the Euclidean Algorithm.
 * @param {number} a
 * @param {number} b
 * @returns {number} gcd(a, b)
 */
export function gcd(a, b) {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

/**
 * Extended Euclidean Algorithm.
 * Finds integers x, y such that a*x + b*y = gcd(a, b).
 * @param {number} a
 * @param {number} b
 * @returns {{ gcd: number, x: number, y: number }}
 */
export function extendedGcd(a, b) {
  let oldR = Math.trunc(a), r = Math.trunc(b);
  let oldS = 1, s = 0;
  let oldT = 0, t = 1;

  while (r !== 0) {
    const quotient = Math.trunc(oldR / r);
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
    [oldT, t] = [t, oldT - quotient * t];
  }

  return { gcd: oldR, x: oldS, y: oldT };
}

/**
 * Calculates modular multiplicative inverse of a modulo m using Extended Euclidean Algorithm.
 * Finds x such that (a * x) % m === 1.
 * @param {number} a - Integer whose inverse is sought
 * @param {number} [m=26] - Modulus (default 26)
 * @returns {number} Modular inverse in range [1, m - 1]
 * @throws {Error} If gcd(a, m) !== 1 (no inverse exists)
 */
export function modInverse(a, m = 26) {
  const normA = mod(a, m);
  const { gcd: g, x } = extendedGcd(normA, m);
  if (g !== 1) {
    throw new Error(
      `Modular multiplicative inverse does not exist for key ${a} modulo ${m} because gcd(${a}, ${m}) = ${g} != 1.`
    );
  }
  return mod(x, m);
}

/**
 * Checks if a character is an ASCII letter (a-z or A-Z).
 * @param {string} ch
 * @returns {boolean}
 */
export function isLetter(ch) {
  return typeof ch === 'string' && ch.length === 1 && /^[a-zA-Z]$/.test(ch);
}

/**
 * Converts an alphabetic character to 0-indexed number (A=0, ..., Z=25).
 * Case-insensitive.
 * @param {string} ch
 * @returns {number} 0-25
 */
export function charToNum(ch) {
  if (!isLetter(ch)) {
    throw new Error(`Character '${ch}' is not an alphabetic letter.`);
  }
  return ch.toUpperCase().charCodeAt(0) - 65;
}

/**
 * Converts a 0-indexed number (0-25) to an alphabetic character.
 * @param {number} num - 0-25 (modulo 26 applied automatically)
 * @param {boolean} [isUpper=true] - Output case
 * @returns {string} Single character
 */
export function numToChar(num, isUpper = true) {
  const code = mod(num, 26) + (isUpper ? 65 : 97);
  return String.fromCharCode(code);
}

/**
 * Normalizes input text to string.
 * @param {any} text
 * @returns {string}
 */
export function normalizeText(text) {
  if (text === null || text === undefined) return '';
  return String(text);
}

// ==========================================
// MATRIX OPERATIONS (FOR HILL CIPHER)
// ==========================================

/**
 * Computes determinant of a 2x2 matrix.
 * @param {number[][]} m - 2x2 matrix
 * @returns {number}
 */
export function determinant2x2(m) {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

/**
 * Computes determinant of a 3x3 matrix using cofactor expansion.
 * @param {number[][]} m - 3x3 matrix
 * @returns {number}
 */
export function determinant3x3(m) {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

/**
 * Computes adjugate of a 2x2 matrix.
 * adj([[a, b], [c, d]]) = [[d, -b], [-c, a]]
 * @param {number[][]} m
 * @returns {number[][]}
 */
export function adjugate2x2(m) {
  return [
    [m[1][1], -m[0][1]],
    [-m[1][0], m[0][0]]
  ];
}

/**
 * Computes adjugate (transpose of cofactor matrix) of a 3x3 matrix.
 * @param {number[][]} m
 * @returns {number[][]}
 */
export function adjugate3x3(m) {
  const c00 = m[1][1] * m[2][2] - m[1][2] * m[2][1];
  const c01 = -(m[1][0] * m[2][2] - m[1][2] * m[2][0]);
  const c02 = m[1][0] * m[2][1] - m[1][1] * m[2][0];

  const c10 = -(m[0][1] * m[2][2] - m[0][2] * m[2][1]);
  const c11 = m[0][0] * m[2][2] - m[0][2] * m[2][0];
  const c12 = -(m[0][0] * m[2][1] - m[0][1] * m[2][0]);

  const c20 = m[0][1] * m[1][2] - m[0][2] * m[1][1];
  const c21 = -(m[0][0] * m[1][2] - m[0][2] * m[1][0]);
  const c22 = m[0][0] * m[1][1] - m[0][1] * m[1][0];

  // Adjugate is the transpose of the cofactor matrix
  return [
    [c00, c10, c20],
    [c01, c11, c21],
    [c02, c12, c22]
  ];
}

/**
 * Computes modular multiplicative inverse of a 2x2 or 3x3 matrix modulo m.
 * @param {number[][]} matrix
 * @param {number} [m=26]
 * @returns {{ inverseMatrix: number[][], det: number, detInverse: number }}
 */
export function invertMatrixMod(matrix, m = 26) {
  const n = matrix.length;
  if (n !== 2 && n !== 3) {
    throw new Error(`Matrix inversion modulo ${m} only supports 2x2 and 3x3 matrices. Received ${n}x${n}.`);
  }

  let det = n === 2 ? determinant2x2(matrix) : determinant3x3(matrix);
  const detMod = mod(det, m);

  if (detMod === 0 || gcd(detMod, m) !== 1) {
    throw new Error(
      `Matrix is not invertible modulo ${m}. Determinant is ${det} (≡ ${detMod} mod ${m}), which has gcd(${detMod}, ${m}) = ${gcd(
        detMod,
        m
      )} != 1.`
    );
  }

  const detInverse = modInverse(detMod, m);
  const adj = n === 2 ? adjugate2x2(matrix) : adjugate3x3(matrix);

  const inverseMatrix = [];
  for (let r = 0; r < n; r++) {
    const row = [];
    for (let c = 0; c < n; c++) {
      row.push(mod(adj[r][c] * detInverse, m));
    }
    inverseMatrix.push(row);
  }

  return { inverseMatrix, det: detMod, detInverse };
}

/**
 * Multiplies an n x n matrix by an n-dimensional column vector modulo m.
 * Column vector orientation: C = M * V mod m.
 * @param {number[][]} matrix
 * @param {number[]} vector
 * @param {number} [m=26]
 * @returns {number[]} Resulting vector
 */
export function multiplyMatrixVector(matrix, vector, m = 26) {
  const n = matrix.length;
  if (vector.length !== n) {
    throw new Error(`Vector length (${vector.length}) does not match matrix dimension (${n}).`);
  }

  const result = [];
  for (let r = 0; r < n; r++) {
    let sum = 0;
    for (let c = 0; c < n; c++) {
      sum += matrix[r][c] * vector[c];
    }
    result.push(mod(sum, m));
  }
  return result;
}

