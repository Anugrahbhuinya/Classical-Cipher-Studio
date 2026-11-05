import test from 'node:test';
import assert from 'node:assert/strict';

import * as utils from '../src/algorithms/utils.js';
import * as additiveCipher from '../src/algorithms/additiveCipher.js';
import * as multiplicativeCipher from '../src/algorithms/multiplicativeCipher.js';
import * as affineCipher from '../src/algorithms/affineCipher.js';
import * as monoalphabeticCipher from '../src/algorithms/monoalphabeticCipher.js';
import * as autokeyCipher from '../src/algorithms/autokeyCipher.js';
import * as playfairCipher from '../src/algorithms/playfairCipher.js';
import * as vigenereCipher from '../src/algorithms/vigenereCipher.js';
import * as hillCipher from '../src/algorithms/hillCipher.js';
import * as railFenceCipher from '../src/algorithms/railFenceCipher.js';
import * as keyedTranspositionCipher from '../src/algorithms/keyedTranspositionCipher.js';
import { getCipherEngine, CIPHER_ENGINES } from '../src/algorithms/index.js';

// ==========================================
// 1. MATHEMATICAL UTILITIES TESTS
// ==========================================
test('Mathematical Utilities - Modular arithmetic, GCD, and Inverses', async (t) => {
  await t.test('mod handles positive, negative, and zero correctly', () => {
    assert.equal(utils.mod(7, 26), 7);
    assert.equal(utils.mod(-1, 26), 25);
    assert.equal(utils.mod(-26, 26), 0);
    assert.equal(utils.mod(26, 26), 0);
    assert.equal(utils.mod(27, 26), 1);
    assert.equal(utils.mod(-27, 26), 25);
    assert.throws(() => utils.mod(5, 0), /Modulus must be positive/);
  });

  await t.test('gcd computes correct greatest common divisor', () => {
    assert.equal(utils.gcd(7, 26), 1);
    assert.equal(utils.gcd(4, 26), 2);
    assert.equal(utils.gcd(13, 26), 13);
    assert.equal(utils.gcd(0, 5), 5);
    assert.equal(utils.gcd(-14, 28), 14);
  });

  await t.test('modInverse computes correct modular inverse in Z26*', () => {
    // 1 * 1 = 1 mod 26
    assert.equal(utils.modInverse(1, 26), 1);
    // 3 * 9 = 27 = 1 mod 26
    assert.equal(utils.modInverse(3, 26), 9);
    // 5 * 21 = 105 = 1 mod 26
    assert.equal(utils.modInverse(5, 26), 21);
    // 7 * 15 = 105 = 1 mod 26
    assert.equal(utils.modInverse(7, 26), 15);
    // 9 * 3 = 27 = 1 mod 26
    assert.equal(utils.modInverse(9, 26), 3);
    // 11 * 19 = 209 = 8 * 26 + 1 = 1 mod 26
    assert.equal(utils.modInverse(11, 26), 19);
    // 15 * 7 = 105 = 1 mod 26
    assert.equal(utils.modInverse(15, 26), 7);
    // 17 * 23 = 391 = 15 * 26 + 1 = 1 mod 26
    assert.equal(utils.modInverse(17, 26), 23);
    // 25 * 25 = 625 = 24 * 26 + 1 = 1 mod 26
    assert.equal(utils.modInverse(25, 26), 25);

    // Non-coprime keys must throw
    assert.throws(() => utils.modInverse(2, 26), /Modular multiplicative inverse does not exist/);
    assert.throws(() => utils.modInverse(13, 26), /Modular multiplicative inverse does not exist/);
    assert.throws(() => utils.modInverse(0, 26), /Modular multiplicative inverse does not exist/);
  });

  await t.test('Matrix operations: 2x2 and 3x3 determinant and modular inversion', () => {
    // 2x2 matrix [[3, 3], [2, 5]]
    // det = 15 - 6 = 9. 9^-1 mod 26 = 3.
    // adj = [[5, -3], [-2, 3]] = [[5, 23], [24, 3]]
    // K^-1 = 3 * [[5, 23], [24, 3]] = [[15, 69], [72, 9]] mod 26 = [[15, 17], [20, 9]]
    const m2 = [
      [3, 3],
      [2, 5]
    ];
    const inv2 = utils.invertMatrixMod(m2, 26);
    assert.equal(inv2.det, 9);
    assert.equal(inv2.detInverse, 3);
    assert.deepEqual(inv2.inverseMatrix, [
      [15, 17],
      [20, 9]
    ]);

    // Test matrix-vector multiplication with K and K^-1
    const v = [7, 4]; // 'H', 'E'
    const encV = utils.multiplyMatrixVector(m2, v, 26); // [33 mod 26, 34 mod 26] = [7, 8] ('H', 'I')
    assert.deepEqual(encV, [7, 8]);
    const decV = utils.multiplyMatrixVector(inv2.inverseMatrix, encV, 26);
    assert.deepEqual(decV, v);

    // 3x3 matrix from Stallings textbook:
    // [[6, 24, 1], [13, 16, 10], [20, 17, 15]]
    const m3 = [
      [6, 24, 1],
      [13, 16, 10],
      [20, 17, 15]
    ];
    const inv3 = utils.invertMatrixMod(m3, 26);
    assert.equal(inv3.det, 25);
    assert.equal(inv3.detInverse, 25);
    assert.deepEqual(inv3.inverseMatrix, [
      [8, 5, 10],
      [21, 8, 21],
      [21, 12, 8]
    ]);

    // Non-invertible matrix (det divisible by 2 or 13)
    const singularM = [
      [2, 4],
      [1, 2]
    ]; // det = 0
    assert.throws(() => utils.invertMatrixMod(singularM, 26), /Matrix is not invertible/);
  });
});

// ==========================================
// 2. ADDITIVE / CAESAR CIPHER TESTS
// ==========================================
test('Additive (Caesar) Cipher', async (t) => {
  await t.test('Normal encryption and decryption with shift 3', () => {
    const plain = 'HELLO';
    const enc = additiveCipher.encrypt(plain, 3);
    assert.equal(enc.result, 'KHOOR');
    assert.equal(enc.steps.length, 5);

    const dec = additiveCipher.decrypt(enc.result, 3);
    assert.equal(dec.result, plain);
  });

  await t.test('Preserves letter case, spaces, and punctuation', () => {
    const input = 'Attack at Dawn, 123!';
    const enc = additiveCipher.encrypt(input, { shift: 3 });
    assert.equal(enc.result, 'Dwwdfn dw Gdzq, 123!');

    const dec = additiveCipher.decrypt(enc.result, { shift: 3 });
    assert.equal(dec.result, input);
  });

  await t.test('Edge cases: shift 0, shift 25, shift > 26, negative shift', () => {
    assert.equal(additiveCipher.encrypt('ABC', 0).result, 'ABC');
    assert.equal(additiveCipher.encrypt('ABC', 26).result, 'ABC');
    assert.equal(additiveCipher.encrypt('ABC', 52).result, 'ABC');
    assert.equal(additiveCipher.encrypt('ABC', 29).result, 'DEF'); // 29 mod 26 = 3
    assert.equal(additiveCipher.encrypt('A', -1).result, 'Z');
    assert.equal(additiveCipher.encrypt('', 3).result, '');
  });

  await t.test('Throws meaningful error on invalid key', () => {
    assert.throws(() => additiveCipher.encrypt('TEST', null), /Shift key is required/);
    assert.throws(() => additiveCipher.encrypt('TEST', 'invalid'), /must be an integer/);
  });
});

// ==========================================
// 3. MULTIPLICATIVE CIPHER TESTS
// ==========================================
test('Multiplicative Cipher', async (t) => {
  await t.test('Normal encryption and decryption with key 7', () => {
    // H(7)*7=49=23(X), E(4)*7=28=2(C), L(11)*7=77=25(Z), O(14)*7=98=20(U)
    const plain = 'HELLO';
    const enc = multiplicativeCipher.encrypt(plain, 7);
    assert.equal(enc.result, 'XCZZU');
    assert.equal(enc.metadata.inverseKey, 15);

    const dec = multiplicativeCipher.decrypt(enc.result, 7);
    assert.equal(dec.result, plain);
  });

  await t.test('Preserves letter case and non-alphabetic characters', () => {
    const input = 'Hello, World! 2026';
    const enc = multiplicativeCipher.encrypt(input, { multiplier: 7 });
    assert.equal(enc.result, 'Xczzu, Yupzv! 2026');

    const dec = multiplicativeCipher.decrypt(enc.result, { multiplier: 7 });
    assert.equal(dec.result, input);
  });

  await t.test('All 12 coprime keys round-trip successfully', () => {
    const text = 'THE QUICK BROWN FOX JUMPS OVER 13 LAZY DOGS.';
    const validKeys = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
    for (const k of validKeys) {
      const enc = multiplicativeCipher.encrypt(text, k);
      const dec = multiplicativeCipher.decrypt(enc.result, k);
      assert.equal(dec.result, text, `Failed on key ${k}`);
    }
  });

  await t.test('Rejects invalid keys not in Z26*', () => {
    assert.throws(() => multiplicativeCipher.encrypt('TEST', 2), /coprime to 26/);
    assert.throws(() => multiplicativeCipher.encrypt('TEST', 4), /coprime to 26/);
    assert.throws(() => multiplicativeCipher.encrypt('TEST', 13), /coprime to 26/);
    assert.throws(() => multiplicativeCipher.encrypt('TEST', 26), /coprime to 26/);
    assert.throws(() => multiplicativeCipher.encrypt('TEST', 0), /coprime to 26/);
  });
});

// ==========================================
// 4. AFFINE CIPHER TESTS
// ==========================================
test('Affine Cipher', async (t) => {
  await t.test('Normal encryption and decryption with key a=7, b=2', () => {
    // C = (7 * P + 2) mod 26
    // H(7) -> (49 + 2) = 51 = 25 (Z)
    // E(4) -> (28 + 2) = 30 = 4 (E)
    // L(11) -> (77 + 2) = 79 = 1 (B)
    // O(14) -> (98 + 2) = 100 = 22 (W)
    const plain = 'HELLO';
    const enc = affineCipher.encrypt(plain, { a: 7, b: 2 });
    assert.equal(enc.result, 'ZEBBW');
    assert.equal(enc.metadata.aInverse, 15);

    const dec = affineCipher.decrypt(enc.result, { a: 7, b: 2 });
    assert.equal(dec.result, plain);
  });

  await t.test('Accepts array format [a, b] and preserves case and punctuation', () => {
    const input = 'Affine Cipher: Example #1!';
    const enc = affineCipher.encrypt(input, [5, 8]);
    const dec = affineCipher.decrypt(enc.result, [5, 8]);
    assert.equal(dec.result, input);
  });

  await t.test('Rejects invalid multiplier a', () => {
    assert.throws(() => affineCipher.encrypt('TEST', { a: 2, b: 5 }), /must be coprime to 26/);
    assert.throws(() => affineCipher.encrypt('TEST', { a: 13, b: 5 }), /must be coprime to 26/);
  });
});

// ==========================================
// 5. MONOALPHABETIC SUBSTITUTION CIPHER TESTS
// ==========================================
test('Monoalphabetic Substitution Cipher', async (t) => {
  const cipherAlpha = 'QWERTYUIOPASDFGHJKLZXCVBNM';

  await t.test('Normal encryption and decryption', () => {
    // H -> I, E -> T, L -> S, O -> G
    const plain = 'HELLO';
    const enc = monoalphabeticCipher.encrypt(plain, cipherAlpha);
    assert.equal(enc.result, 'ITSSG');

    const dec = monoalphabeticCipher.decrypt(enc.result, cipherAlpha);
    assert.equal(dec.result, plain);
  });

  await t.test('Preserves letter case, spaces, and punctuation', () => {
    const input = 'Hello, World! 123';
    const enc = monoalphabeticCipher.encrypt(input, { cipherAlphabet: cipherAlpha });
    assert.equal(enc.result, 'Itssg, Vgksr! 123');

    const dec = monoalphabeticCipher.decrypt(enc.result, { cipherAlphabet: cipherAlpha });
    assert.equal(dec.result, input);
  });

  await t.test('Rejects incomplete or duplicate alphabets', () => {
    assert.throws(() => monoalphabeticCipher.encrypt('TEST', 'QWERTY'), /exactly 26 letters/);
    // 26 chars but duplicate 'A'
    assert.throws(
      () => monoalphabeticCipher.encrypt('TEST', 'QWERTYUIOPASDFGHJKLZXCVBNA'),
      /contains duplicates/
    );
  });
});

// ==========================================
// 6. AUTOKEY CIPHER TESTS
// ==========================================
test('Autokey Cipher (Plaintext-Autokey)', async (t) => {
  await t.test('Numeric seed k0 = 7 encryption and decryption', () => {
    // Plaintext: H(7) E(4) L(11) L(11) O(14)
    // Keystream: 7(seed), 7(H), 4(E), 11(L), 11(L)
    // C0 = (7+7) = 14 (O)
    // C1 = (4+7) = 11 (L)
    // C2 = (11+4) = 15 (P)
    // C3 = (11+11) = 22 (W)
    // C4 = (14+11) = 25 (Z)
    // Ciphertext: OLPWZ
    const plain = 'HELLO';
    const enc = autokeyCipher.encrypt(plain, 7);
    assert.equal(enc.result, 'OLPWZ');

    // Progressive decryption recovers original text exactly
    const dec = autokeyCipher.decrypt('OLPWZ', 7);
    assert.equal(dec.result, 'HELLO');
  });

  await t.test('Keyword primer seed encryption and decryption', () => {
    const plain = 'RENDEZVOUS AT MIDNIGHT';
    const key = { primer: 'QUEEN' };
    const enc = autokeyCipher.encrypt(plain, key);
    const dec = autokeyCipher.decrypt(enc.result, key);
    assert.equal(dec.result, plain);
  });

  await t.test('Preserves spaces, punctuation, and letter case', () => {
    const input = 'Secret Attack: 10:00 PM!';
    const enc = autokeyCipher.encrypt(input, 12);
    const dec = autokeyCipher.decrypt(enc.result, 12);
    assert.equal(dec.result, input);
  });

  await t.test('Throws on missing or empty primer', () => {
    assert.throws(() => autokeyCipher.encrypt('TEST', ''), /Seed key or primer keyword is required/);
    assert.throws(() => autokeyCipher.encrypt('TEST', '   '), /Seed key or primer keyword is required/);
    assert.throws(() => autokeyCipher.encrypt('TEST', '!@#$'), /must contain at least one alphabetic letter/);
  });
});

// ==========================================
// 7. PLAYFAIR CIPHER TESTS
// ==========================================
test('Playfair Cipher', async (t) => {
  const keyword = 'MONARCHY';

  await t.test('Digraph preparation handles duplicate adjacent letters and odd length', () => {
    const { digraphs, paddedIndices } = playfairCipher.prepareDigraphs('BALLOON');
    // B A, L L -> L X, L O, O N (4 pairs)
    assert.deepEqual(digraphs, [
      ['B', 'A'],
      ['L', 'X'],
      ['L', 'O'],
      ['O', 'N']
    ]);
    assert.deepEqual(paddedIndices, [1]);

    // Odd length text: 'TREE' -> 'TR', 'EX', 'EX'
    const odd = playfairCipher.prepareDigraphs('TREE');
    assert.deepEqual(odd.digraphs, [
      ['T', 'R'],
      ['E', 'X'],
      ['E', 'X']
    ]);
  });

  await t.test('Normal encryption and decryption round trip', () => {
    const plain = 'INSTRUMENTS';
    const enc = playfairCipher.encrypt(plain, keyword);
    assert.equal(enc.result.length % 2, 0);

    const dec = playfairCipher.decrypt(enc.result, keyword);
    // Output must contain the prepared characters ('INSTRUMENTSX' or equivalent)
    assert.ok(dec.result.startsWith('INSTRUMENTS'));
  });

  await t.test('Decryption rejects odd-length ciphertexts', () => {
    assert.throws(() => playfairCipher.decrypt('ABC', keyword), /must be even/);
  });
});

// ==========================================
// 8. VIGENERE CIPHER TESTS
// ==========================================
test('Vigenère Cipher', async (t) => {
  await t.test('Standard textbook example: LEMON on ATTACKATDAWN', () => {
    const plain = 'ATTACKATDAWN';
    const key = 'LEMON';
    const enc = vigenereCipher.encrypt(plain, key);
    assert.equal(enc.result, 'LXFOPVEFRNHR');

    const dec = vigenereCipher.decrypt(enc.result, key);
    assert.equal(dec.result, plain);
  });

  await t.test('Preserves letter case, spaces, and punctuation', () => {
    const input = 'Attack at Dawn, Soldier! 123';
    const key = { keyword: 'LEMON' };
    const enc = vigenereCipher.encrypt(input, key);
    assert.equal(enc.result, 'Lxfopv ef Rnhr, Ecyomqf! 123');

    const dec = vigenereCipher.decrypt(enc.result, key);
    assert.equal(dec.result, input);
  });

  await t.test('Rejects empty or non-alphabetic keyword', () => {
    assert.throws(() => vigenereCipher.encrypt('TEST', ''), /at least one alphabetic letter/);
    assert.throws(() => vigenereCipher.encrypt('TEST', '12345'), /at least one alphabetic letter/);
  });
});

// ==========================================
// 9. HILL CIPHER TESTS
// ==========================================
test('Hill Cipher', async (t) => {
  await t.test('2x2 Hill Cipher encryption and decryption: HELP with [[3, 3], [2, 5]]', () => {
    // 'HELP': H(7), E(4) -> [3*7 + 3*4, 2*7 + 5*4] = [33, 34] mod 26 = [7, 8] ('H', 'I')
    // 'LP': L(11), P(15) -> [3*11 + 3*15, 2*11 + 5*15] = [78, 97] mod 26 = [0, 19] ('A', 'T')
    // Result: 'HIAT'
    const matrix = [
      [3, 3],
      [2, 5]
    ];
    const enc = hillCipher.encrypt('HELP', matrix);
    assert.equal(enc.result, 'HIAT');

    const dec = hillCipher.decrypt('HIAT', matrix);
    assert.equal(dec.result, 'HELP');
  });

  await t.test('3x3 Hill Cipher encryption and decryption: ACT with Stallings matrix', () => {
    const matrix3 = [
      [6, 24, 1],
      [13, 16, 10],
      [20, 17, 15]
    ];
    // 'ACT': A(0), C(2), T(19) -> 'POH'
    const enc = hillCipher.encrypt('ACT', { dimension: 3, matrix3 });
    assert.equal(enc.result, 'POH');

    const dec = hillCipher.decrypt('POH', { dimension: 3, matrix3 });
    assert.equal(dec.result, 'ACT');
  });

  await t.test('Handles message padding when length is not a multiple of dimension', () => {
    const matrix = [
      [3, 3],
      [2, 5]
    ];
    // Length 3 ('CAT') pads with 'X' to 4 ('CATX')
    const enc = hillCipher.encrypt('CAT', matrix);
    assert.equal(enc.result.length, 4);
    assert.equal(enc.metadata.paddedCount, 1);

    const dec = hillCipher.decrypt(enc.result, matrix);
    assert.equal(dec.result, 'CATX');
  });

  await t.test('Rejects non-invertible matrix (gcd(det, 26) != 1)', () => {
    const nonInvertible = [
      [2, 4],
      [1, 2]
    ]; // det = 0
    assert.throws(() => hillCipher.encrypt('TEST', nonInvertible), /Matrix is not invertible modulo 26/);

    const evenDet = [
      [2, 1],
      [0, 2]
    ]; // det = 4 (gcd(4, 26) = 2)
    assert.throws(() => hillCipher.encrypt('TEST', evenDet), /Matrix is not invertible modulo 26/);
  });
});

// ==========================================
// 10. RAIL FENCE CIPHER TESTS
// ==========================================
test('Rail Fence Cipher (Zig-Zag)', async (t) => {
  await t.test('Lecture example: DEFEND THE EAST WALL AT DAWN with 3 rails', () => {
    const text = 'DEFEND THE EAST WALL AT DAWN';
    const enc = railFenceCipher.encrypt(text, 3);
    const dec = railFenceCipher.decrypt(enc.result, 3);
    assert.equal(dec.result, text);
  });

  await t.test('Exact 100% round trip preserving spaces, numbers, and symbols', () => {
    const text = 'Classical Cryptography 2026: Zig-Zag Wave Test!';
    for (const d of [2, 3, 4, 5, 8]) {
      const enc = railFenceCipher.encrypt(text, d);
      const dec = railFenceCipher.decrypt(enc.result, d);
      assert.equal(dec.result, text, `Failed on depth ${d}`);
    }
  });

  await t.test('Handles 1 rail and text shorter than rails', () => {
    assert.equal(railFenceCipher.encrypt('HELLO', 1).result, 'HELLO');
    assert.equal(railFenceCipher.decrypt('HELLO', 1).result, 'HELLO');
    assert.equal(railFenceCipher.encrypt('HI', 5).result, 'HI');
    assert.equal(railFenceCipher.decrypt('HI', 5).result, 'HI');
    assert.equal(railFenceCipher.encrypt('', 3).result, '');
  });

  await t.test('Rejects invalid rail count', () => {
    assert.throws(() => railFenceCipher.encrypt('TEST', 0), /must be an integer >= 1/);
    assert.throws(() => railFenceCipher.encrypt('TEST', -3), /must be an integer >= 1/);
  });
});

// ==========================================
// 11. KEYED TRANSPOSITION CIPHER TESTS
// ==========================================
test('Keyed Transposition Cipher (Block Permutation)', async (t) => {
  await t.test('Block permutation with numeric key 4 1 3 2 5', () => {
    // Plaintext: 'ENEMY ATTACKING' (15 chars = 3 blocks of 5)
    // Block 1: 'ENEMY' -> B[3]='M', B[0]='E', B[2]='E', B[1]='N', B[4]='Y' -> 'MEENY'
    // Block 2: ' ATTA' -> B[3]='T', B[0]=' ', B[2]='T', B[1]='A', B[4]='A' -> 'T TAA'
    // Block 3: 'CKING' -> B[3]='N', B[0]='C', B[2]='I', B[1]='K', B[4]='G' -> 'NCIKG'
    const plain = 'ENEMY ATTACKING';
    const key = [4, 1, 3, 2, 5];
    const enc = keyedTranspositionCipher.encrypt(plain, key);
    assert.equal(enc.result, 'MEENYT TAANCIKG');

    const dec = keyedTranspositionCipher.decrypt(enc.result, key);
    assert.equal(dec.result, plain);
  });

  await t.test('Handles keyword permutation and incomplete block padding', () => {
    const text = 'SECRET MESSAGE'; // 14 chars
    const key = 'ZEBRA'; // 5 letters -> blocks of 5 -> padded to 15 chars ('X')
    const enc = keyedTranspositionCipher.encrypt(text, { keyFormat: 'keyword', permutationKey: key });
    assert.equal(enc.result.length, 15);
    assert.equal(enc.metadata.paddedCount, 1);

    const dec = keyedTranspositionCipher.decrypt(
      enc.result,
      { keyFormat: 'keyword', permutationKey: key },
      { paddedCount: enc.metadata.paddedCount }
    );
    assert.ok(dec.result.startsWith(text));
    assert.equal(dec.unpaddedResult, text);
  });

  await t.test('Rejects invalid permutations (gaps, duplicates, length < 2)', () => {
    assert.throws(() => keyedTranspositionCipher.encrypt('TEST', [1]), /length must be at least 2/);
    assert.throws(() => keyedTranspositionCipher.encrypt('TEST', [1, 2, 4]), /without gaps or duplicates/);
    assert.throws(() => keyedTranspositionCipher.encrypt('TEST', [1, 2, 2]), /without gaps or duplicates/);
  });
});

// ==========================================
// 12. CENTRAL REGISTRY & DISPATCHER TESTS
// ==========================================
test('Central Algorithm Dispatcher', () => {
  const ids = [
    'caesar',
    'additive',
    'multiplicative',
    'affine',
    'monoalphabetic',
    'autokey',
    'playfair',
    'vigenere',
    'hill',
    'railfence',
    'keyedtransposition'
  ];

  for (const id of ids) {
    const engine = getCipherEngine(id);
    assert.ok(engine, `Engine for ${id} must exist`);
    assert.equal(typeof engine.encrypt, 'function', `Engine ${id} must have encrypt`);
    assert.equal(typeof engine.decrypt, 'function', `Engine ${id} must have decrypt`);
  }

  assert.throws(() => getCipherEngine('unsupported_cipher'), /Unsupported cipher algorithm ID/);
});

// ==========================================
// 13. COMPREHENSIVE EDGE CASES & REGRESSION TESTS
// ==========================================
test('Edge Cases and Robustness Across All Algorithms', async (t) => {
  await t.test('All algorithms handle punctuation and whitespace without letters gracefully', () => {
    const symbols = '   !@#$%^&*()_+-=[]{}|;:\'",.<>/?`~\n\t   ';

    // Stream / Substitution ciphers preserve symbols
    assert.equal(additiveCipher.encrypt(symbols, 3).result, symbols);
    assert.equal(additiveCipher.decrypt(symbols, 3).result, symbols);

    assert.equal(multiplicativeCipher.encrypt(symbols, 7).result, symbols);
    assert.equal(multiplicativeCipher.decrypt(symbols, 7).result, symbols);

    assert.equal(affineCipher.encrypt(symbols, { a: 5, b: 8 }).result, symbols);
    assert.equal(affineCipher.decrypt(symbols, { a: 5, b: 8 }).result, symbols);

    const monoKey = 'QWERTYUIOPASDFGHJKLZXCVBNM';
    assert.equal(monoalphabeticCipher.encrypt(symbols, monoKey).result, symbols);
    assert.equal(monoalphabeticCipher.decrypt(symbols, monoKey).result, symbols);

    assert.equal(autokeyCipher.encrypt(symbols, 'QUEEN').result, symbols);
    assert.equal(autokeyCipher.decrypt(symbols, 'QUEEN').result, symbols);

    assert.equal(vigenereCipher.encrypt(symbols, 'LEMON').result, symbols);
    assert.equal(vigenereCipher.decrypt(symbols, 'LEMON').result, symbols);

    // Transposition ciphers preserve symbols and transpose them
    const rfEnc = railFenceCipher.encrypt(symbols, 3);
    assert.equal(railFenceCipher.decrypt(rfEnc.result, 3).result, symbols);

    const ktEnc = keyedTranspositionCipher.encrypt(symbols, [2, 1]);
    const ktDec = keyedTranspositionCipher.decrypt(ktEnc.result, [2, 1], { paddedCount: ktEnc.metadata.paddedCount });
    assert.equal(ktDec.unpaddedResult, symbols);

    // Letter-only block ciphers return empty result gracefully
    assert.equal(playfairCipher.encrypt(symbols, 'MONARCHY').result, '');
    assert.equal(hillCipher.encrypt(symbols, { dimension: 2, matrix: [[3, 3], [2, 5]] }).result, '');
  });

  await t.test('All algorithms handle single character inputs correctly', () => {
    // Caesar
    const cEnc = additiveCipher.encrypt('A', 5);
    assert.equal(cEnc.result, 'F');
    assert.equal(additiveCipher.decrypt('F', 5).result, 'A');

    // Multiplicative: 'C' (2) * 5 = 10 ('K')
    const mEnc = multiplicativeCipher.encrypt('C', 5);
    assert.equal(mEnc.result, 'K');
    assert.equal(multiplicativeCipher.decrypt('K', 5).result, 'C');

    // Affine: 'A' (0) * 5 + 8 = 8 ('I')
    const afEnc = affineCipher.encrypt('A', { a: 5, b: 8 });
    assert.equal(afEnc.result, 'I');
    assert.equal(affineCipher.decrypt('I', { a: 5, b: 8 }).result, 'A');

    // Monoalphabetic: 'A' -> 'Q'
    const monoKey = 'QWERTYUIOPASDFGHJKLZXCVBNM';
    assert.equal(monoalphabeticCipher.encrypt('A', monoKey).result, 'Q');
    assert.equal(monoalphabeticCipher.decrypt('Q', monoKey).result, 'A');

    // Autokey single char
    const autoEnc = autokeyCipher.encrypt('Z', 'K');
    assert.equal(autokeyCipher.decrypt(autoEnc.result, 'K').result, 'Z');

    // Vigenère single char
    const vigEnc = vigenereCipher.encrypt('M', 'X');
    assert.equal(vigenereCipher.decrypt(vigEnc.result, 'X').result, 'M');

    // Playfair: 'A' padded to 'AX' -> encrypted digraph
    const pfEnc = playfairCipher.encrypt('A', 'MONARCHY');
    assert.equal(pfEnc.result.length, 2);
    const pfDec = playfairCipher.decrypt(pfEnc.result, 'MONARCHY');
    assert.equal(pfDec.result, 'AX');

    // Hill: 'A' padded to 'AX'
    const hillEnc = hillCipher.encrypt('A', { dimension: 2, matrix: [[3, 3], [2, 5]] });
    assert.equal(hillEnc.result.length, 2);
    const hillDec = hillCipher.decrypt(hillEnc.result, { dimension: 2, matrix: [[3, 3], [2, 5]] });
    assert.equal(hillDec.result, 'AX');

    // Rail Fence single char
    assert.equal(railFenceCipher.encrypt('A', 5).result, 'A');
    assert.equal(railFenceCipher.decrypt('A', 5).result, 'A');

    // Keyed Transposition single char (padded to block size 3)
    const ktEnc = keyedTranspositionCipher.encrypt('A', [3, 1, 2]);
    const ktDec = keyedTranspositionCipher.decrypt(ktEnc.result, [3, 1, 2], { paddedCount: ktEnc.metadata.paddedCount });
    assert.equal(ktDec.unpaddedResult, 'A');
  });

  await t.test('All algorithms handle long text (>500 characters) accurately without overflow or corruption', () => {
    const longText = `Classical cryptography encompasses methods of encryption that were used prior to the invention of modern computer systems. These ciphers are generally divided into two major categories: substitution ciphers and transposition ciphers. In substitution ciphers, units of plaintext are systematically replaced with ciphertext according to a fixed system or key. Examples include the additive Caesar cipher, multiplicative cipher, affine cipher, and polyalphabetic ciphers such as the Vigenere and Autokey ciphers. Transposition ciphers, on the other hand, rearrange the positions of characters without altering their identities, such as the Rail Fence and Keyed Transposition ciphers.`;
    assert.ok(longText.length > 500, 'Test input must exceed 500 characters');

    // 1. Additive
    const addEnc = additiveCipher.encrypt(longText, 17);
    assert.equal(additiveCipher.decrypt(addEnc.result, 17).result, longText);

    // 2. Multiplicative
    const multEnc = multiplicativeCipher.encrypt(longText, 11);
    assert.equal(multiplicativeCipher.decrypt(multEnc.result, 11).result, longText);

    // 3. Affine
    const affEnc = affineCipher.encrypt(longText, { a: 7, b: 15 });
    assert.equal(affineCipher.decrypt(affEnc.result, { a: 7, b: 15 }).result, longText);

    // 4. Monoalphabetic
    const monoKey = 'ZYXWVUTSRQPONMLKJIHGFEDCBA';
    const monoEnc = monoalphabeticCipher.encrypt(longText, monoKey);
    assert.equal(monoalphabeticCipher.decrypt(monoEnc.result, monoKey).result, longText);

    // 5. Autokey
    const autoEnc = autokeyCipher.encrypt(longText, 'COMPUTER');
    assert.equal(autokeyCipher.decrypt(autoEnc.result, 'COMPUTER').result, longText);

    // 6. Vigenère
    const vigEnc = vigenereCipher.encrypt(longText, 'SECURITY');
    assert.equal(vigenereCipher.decrypt(vigEnc.result, 'SECURITY').result, longText);

    // 7. Rail Fence
    const rfEnc = railFenceCipher.encrypt(longText, 6);
    assert.equal(railFenceCipher.decrypt(rfEnc.result, 6).result, longText);

    // 8. Keyed Transposition
    const ktEnc = keyedTranspositionCipher.encrypt(longText, [5, 2, 4, 1, 3]);
    const ktDec = keyedTranspositionCipher.decrypt(ktEnc.result, [5, 2, 4, 1, 3], { paddedCount: ktEnc.metadata.paddedCount });
    assert.equal(ktDec.unpaddedResult, longText);

    // 9. Hill 2x2
    const hillEnc = hillCipher.encrypt(longText, { dimension: 2, matrix: [[3, 3], [2, 5]] });
    const hillDec = hillCipher.decrypt(hillEnc.result, { dimension: 2, matrix: [[3, 3], [2, 5]] });
    // Check decrypted text matches original alphabetic letters (Hill strips punctuation and pads)
    const cleanLetters = longText.toUpperCase().replace(/[^A-Z]/g, '');
    assert.ok(hillDec.result.startsWith(cleanLetters));

    // 10. Playfair
    const pfEnc = playfairCipher.encrypt(longText, 'MONARCHY');
    const pfDec = playfairCipher.decrypt(pfEnc.result, 'MONARCHY');
    assert.ok(pfDec.result.length >= cleanLetters.length);
  });

  await t.test('Hill 3x3 singular matrix rejection and 3x3 invertible round-trip', () => {
    // Singular matrix (det ≡ 0)
    const singularMatrix = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ];
    assert.throws(
      () => hillCipher.encrypt('TESTING', { dimension: 3, matrix3: singularMatrix }),
      /not invertible modulo 26/
    );

    // Non-coprime matrix (det divisible by 2: det=2)
    const evenDetMatrix = [
      [2, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    assert.throws(
      () => hillCipher.encrypt('TESTING', { dimension: 3, matrix3: evenDetMatrix }),
      /not invertible modulo 26/
    );

    // Valid invertible 3x3 matrix (Stallings textbook example)
    const valid3x3 = [
      [6, 24, 1],
      [13, 16, 10],
      [20, 17, 15]
    ];
    const plain = 'PAYMOREMONEY';
    const enc = hillCipher.encrypt(plain, { dimension: 3, matrix3: valid3x3 });
    const dec = hillCipher.decrypt(enc.result, { dimension: 3, matrix3: valid3x3 });
    assert.equal(dec.result, plain);
  });

  await t.test('Autokey rejects empty or whitespace seeds and non-alphanumeric inputs', () => {
    assert.throws(() => autokeyCipher.encrypt('SECRET', '   '), /required for Autokey Cipher/);
    assert.throws(() => autokeyCipher.encrypt('SECRET', '\t\n'), /required for Autokey Cipher/);
    assert.throws(() => autokeyCipher.encrypt('SECRET', '@#$%'), /must contain at least one alphabetic letter/);

    // Valid numeric seed string accepts and parses
    const numSeedEnc = autokeyCipher.encrypt('ATTACK', '7');
    assert.equal(autokeyCipher.decrypt(numSeedEnc.result, '7').result, 'ATTACK');
  });

  await t.test('Keyed Transposition empty string handling', () => {
    const enc = keyedTranspositionCipher.encrypt('', [2, 1]);
    assert.equal(enc.result, '');
    const dec = keyedTranspositionCipher.decrypt('', [2, 1]);
    assert.equal(dec.result, '');
  });
});
