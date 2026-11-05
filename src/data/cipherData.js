export const CIPHERS = [
  {
    id: "caesar",
    name: "Additive (Caesar) Cipher",
    category: "Substitution",
    subCategory: "Monoalphabetic Substitution Cipher",
    icon: "KeyRound",
    keyType: "Integer shift value k ∈ [0, 25]",
    shortDescription:
      "One of the earliest and simplest monoalphabetic ciphers. Each letter in the plaintext is shifted down the alphabet by a fixed integer key.",
    workingPrinciple:
      "Each character P is transformed into ciphertext C using modular arithmetic: C = (P + k) mod 26. Decryption is the reverse operation: P = (C - k) mod 26. Because there are only 25 usable non-zero keys, it provides minimal secrecy and is vulnerable to direct brute-force attack.",
    formula: "C ≡ (P + k) mod 26",
    samplePlaintext: "ATTACK AT DAWN",
    keyConfig: {
      type: "shift",
      fields: [
        {
          key: "shift",
          label: "Shift Value (k)",
          type: "number",
          min: 0,
          max: 25,
          default: 3,
          placeholder: "e.g., 3",
          hint: "An integer between 0 and 25 (commonly 3 for Julius Caesar's historical key)."
        }
      ]
    }
  },
  {
    id: "multiplicative",
    name: "Multiplicative Cipher",
    category: "Substitution",
    subCategory: "Monoalphabetic Substitution Cipher",
    icon: "Calculator",
    keyType: "Integer multiplier a with gcd(a, 26) = 1",
    shortDescription:
      "A monoalphabetic cipher where each character's numerical position is multiplied by a secret integer key modulo 26.",
    workingPrinciple:
      "Encryption maps P to C = (P × a) mod 26. Decryption requires finding the modular multiplicative inverse a⁻¹ such that (a × a⁻¹) mod 26 = 1, then computing P = (C × a⁻¹) mod 26. The key 'a' must be coprime to 26; otherwise, distinct plaintext characters collide into the same ciphertext character. Only 12 valid keys exist (1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25).",
    formula: "C ≡ (P × a) mod 26",
    samplePlaintext: "HELLO WORLD",
    keyConfig: {
      type: "multiplicative",
      fields: [
        {
          key: "multiplier",
          label: "Multiplier Key (a)",
          type: "number",
          default: 7,
          placeholder: "e.g., 7",
          hint: "Must be coprime to 26 (valid keys: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25)."
        }
      ]
    }
  },
  {
    id: "affine",
    name: "Affine Cipher",
    category: "Substitution",
    subCategory: "Monoalphabetic Substitution Cipher",
    icon: "Binary",
    keyType: "Key pair (a, b) where gcd(a, 26) = 1 and b ∈ [0, 25]",
    shortDescription:
      "Combines multiplicative and additive operations into a single linear congruential equation.",
    workingPrinciple:
      "Encryption: C = (a × P + b) mod 26. Decryption: P = a⁻¹ × (C - b) mod 26, where a⁻¹ is the modular inverse of a modulo 26. With 12 coprime multipliers and 26 additive shifts, the total keyspace is 12 × 26 = 312 keys. It remains vulnerable to frequency analysis because single-letter frequencies are preserved under a different permutation.",
    formula: "C ≡ (a × P + b) mod 26",
    samplePlaintext: "AFFINE CIPHER EXAMPLE",
    keyConfig: {
      type: "affine",
      fields: [
        {
          key: "a",
          label: "Multiplier (a)",
          type: "number",
          default: 5,
          placeholder: "e.g., 5",
          hint: "Must be coprime to 26 (e.g., 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25)."
        },
        {
          key: "b",
          label: "Shift (b)",
          type: "number",
          min: 0,
          max: 25,
          default: 8,
          placeholder: "e.g., 8",
          hint: "Any integer shift between 0 and 25."
        }
      ]
    }
  },
  {
    id: "monoalphabetic",
    name: "Monoalphabetic Substitution Cipher",
    category: "Substitution",
    subCategory: "Monoalphabetic Substitution Cipher",
    icon: "Shuffle",
    keyType: "26-letter unique substitution alphabet mapping",
    shortDescription:
      "Replaces each letter of the plain alphabet with a predetermined substitute letter from a custom 26-character shuffled alphabet.",
    workingPrinciple:
      "Each letter in A-Z maps one-to-one to a unique letter in the cipher alphabet. While the theoretical keyspace is huge (26! ≈ 4.03 × 10²⁶), the cipher completely preserves letter frequency characteristics: 'E', 'T', 'A', digrams like 'TH', and double letters can readily be deduced by frequency analysis.",
    formula: "Mapping: Plain[i] → CipherKey[i]",
    samplePlaintext: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
    keyConfig: {
      type: "monoalphabetic",
      fields: [
        {
          key: "cipherAlphabet",
          label: "Cipher Alphabet (26 unique letters)",
          type: "text",
          default: "QWERTYUIOPASDFGHJKLZXCVBNM",
          placeholder: "26 unique letters A-Z (e.g. QWERTYUIOPASDFGHJKLZXCVBNM)",
          hint: "Enter all 26 uppercase letters in arbitrary permutation order without duplicates."
        }
      ]
    }
  },
  {
    id: "autokey",
    name: "Autokey Cipher",
    category: "Substitution",
    subCategory: "Polyalphabetic Substitution Cipher",
    icon: "Repeat",
    keyType: "Primer keyword or initial numeric shift + Plaintext keystream",
    shortDescription:
      "A polyalphabetic cipher that avoids periodic repetition by using an initial seed keyword followed by the plaintext itself as the running keystream.",
    workingPrinciple:
      "The keystream starts with the seed word (primer) and appends the message itself: Key = Primer + Plaintext. Each character is encrypted via C[i] = (P[i] + K[i]) mod 26. Because the key does not repeat at regular intervals, standard Kasiski examination fails to reveal a simple key period.",
    formula: "C[i] ≡ (P[i] + K[i]) mod 26 where K = Primer || Plaintext",
    samplePlaintext: "RENDEZVOUS AT MIDNIGHT",
    keyConfig: {
      type: "autokey",
      fields: [
        {
          key: "primer",
          label: "Primer / Seed Keyword",
          type: "text",
          default: "QUEEN",
          placeholder: "e.g., QUEEN",
          hint: "Secret priming keyword used to encrypt the first few characters before plaintext takes over."
        }
      ]
    }
  },
  {
    id: "playfair",
    name: "Playfair Cipher",
    category: "Substitution",
    subCategory: "Polygraphic Substitution Cipher",
    icon: "Grid",
    keyType: "Key phrase generating a 5×5 grid (I and J combined)",
    shortDescription:
      "The first practical digraph cipher. It treats the text as pairs of letters (digraphs) encrypted on a 5×5 letter matrix.",
    workingPrinciple:
      "A 5×5 matrix is populated with unique letters of the key phrase, followed by remaining alphabet letters (I and J share a cell). Plaintext is segmented into pairs of letters; identical adjacent letters are separated with filler 'X'. For each pair: same row shifts right; same column shifts down; rectangle swaps column indices. Encrypting pairs flattens single-letter frequencies from 26 down to 676 digraph frequencies.",
    formula: "Geometric coordinates on 5×5 polybius square",
    samplePlaintext: "HIDE THE GOLD IN THE TREE STUMP",
    keyConfig: {
      type: "playfair",
      fields: [
        {
          key: "keyword",
          label: "Matrix Keyword / Key Phrase",
          type: "text",
          default: "MONARCHY",
          placeholder: "e.g., MONARCHY",
          hint: "Duplicates are removed; remaining alphabet fills the 5×5 grid (I/J share cell)."
        }
      ]
    }
  },
  {
    id: "vigenere",
    name: "Vigenère Cipher",
    category: "Substitution",
    subCategory: "Polyalphabetic Substitution Cipher",
    icon: "Layers",
    keyType: "Repeating keyword or phrase",
    shortDescription:
      "A classic polyalphabetic cipher that uses a repeating keyword to cyclically shift plaintext characters by varying amounts.",
    workingPrinciple:
      "The keyword is repeated cyclically until it matches the length of the plaintext: C[i] = (P[i] + K[i mod m]) mod 26. This masks simple single-character frequencies across multiple Caesar shifts. It was broken in 1863 by Friedrich Kasiski using repeated substrings to find the key length m.",
    formula: "C[i] ≡ (P[i] + K[i mod m]) mod 26",
    samplePlaintext: "CRYPTOGRAPHY IS ESSENTIAL FOR SECURITY",
    keyConfig: {
      type: "vigenere",
      fields: [
        {
          key: "keyword",
          label: "Keyword / Key Phrase",
          type: "text",
          default: "LEMON",
          placeholder: "e.g., LEMON",
          hint: "Letters A-Z are used cyclically as shifting offsets (A=0, B=1, ... Z=25)."
        }
      ]
    }
  },
  {
    id: "hill",
    name: "Hill Cipher",
    category: "Substitution",
    subCategory: "Polygraphic Substitution Cipher",
    icon: "Grid3X3",
    keyType: "Invertible n×n matrix modulo 26 (2×2 or 3×3)",
    shortDescription:
      "The first polygraphic cipher operating simultaneously on blocks of n letters using linear algebra and matrix arithmetic modulo 26.",
    workingPrinciple:
      "Plaintext is divided into n-dimensional column vectors P. Encryption computes C = (K · P) mod 26. Decryption requires the inverse matrix: P = (K⁻¹ · C) mod 26. For K⁻¹ to exist modulo 26, det(K) must be non-zero and gcd(det(K), 26) = 1. Hill cipher completely disguises single-letter frequencies.",
    formula: "C = (K · P) mod 26",
    samplePlaintext: "PAY MORE MONEY",
    keyConfig: {
      type: "hill",
      fields: [
        {
          key: "dimension",
          label: "Matrix Dimension",
          type: "select",
          options: [
            { value: "2", label: "2 × 2 Matrix (Blocks of 2)" },
            { value: "3", label: "3 × 3 Matrix (Blocks of 3)" }
          ],
          default: "2",
          hint: "Select block size. Matrix determinant must be coprime to 26."
        },
        {
          key: "matrixValues",
          label: "Key Matrix Entries (Row-wise integers)",
          type: "matrix",
          default: "[[3, 3], [2, 5]]",
          hint: "Default 2×2 key matrix [[3, 3], [2, 5]] has det = 15 - 6 = 9. gcd(9, 26) = 1."
        }
      ]
    }
  },
  {
    id: "railfence",
    name: "Rail Fence Cipher",
    category: "Transposition",
    subCategory: "Transposition Cipher",
    icon: "Waves",
    keyType: "Number of rails / rows (integer d ≥ 2)",
    shortDescription:
      "A classical transposition cipher where plaintext characters are written diagonally down and up across rails in a zig-zag wave, then read row by row.",
    workingPrinciple:
      "Characters are written in a zig-zag diagonal path across d rails. Once the entire message is placed, ciphertext is obtained by reading letters sequentially along each rail from top to bottom. Because letter frequencies remain unchanged, anagramming and anagram-scoring techniques easily decipher it.",
    formula: "Zig-zag position cycle with period 2(d - 1)",
    samplePlaintext: "DEFEND THE EAST WALL AT DAWN",
    keyConfig: {
      type: "railfence",
      fields: [
        {
          key: "rails",
          label: "Number of Rails (Depth)",
          type: "number",
          min: 2,
          max: 20,
          default: 3,
          placeholder: "e.g., 3",
          hint: "Number of horizontal levels in the zig-zag wave (minimum 2)."
        }
      ]
    }
  },
  {
    id: "keyedtransposition",
    name: "Keyed Transposition Cipher",
    category: "Transposition",
    subCategory: "Transposition Cipher",
    icon: "Columns",
    keyType: "Numeric permutation order or keyword determining column reading sequence",
    shortDescription:
      "The message is written horizontally into fixed-width rows of a grid, then read out vertically by columns in an order specified by the key.",
    workingPrinciple:
      "The message is broken into blocks equal to key length and written out row by row. Columns are then reordered according to the key permutation (or alphabetical rank of keyword characters) and read out top-to-bottom. The characters themselves are not substituted, only their spatial positions are scrambled.",
    formula: "Matrix write row-by-row, permute columns by key, read column-by-column",
    samplePlaintext: "ENEMY ATTACKING FROM THE NORTH",
    keyConfig: {
      type: "keyedtransposition",
      fields: [
        {
          key: "keyFormat",
          label: "Key Mode",
          type: "select",
          options: [
            { value: "numeric", label: "Numeric Permutation Order (e.g., 4 1 3 2 5)" },
            { value: "keyword", label: "Keyword Alphabetical Rank (e.g., ZEBRA)" }
          ],
          default: "numeric",
          hint: "Choose whether to specify explicit column numbers or an English keyword."
        },
        {
          key: "permutationKey",
          label: "Permutation Key",
          type: "text",
          default: "4 1 3 2 5",
          placeholder: "e.g., 4 1 3 2 5 or ZEBRA",
          hint: "For numeric: space-separated indices 1 to N. For keyword: letters will be ranked alphabetically."
        }
      ]
    }
  }
];

export const CATEGORIES = [
  {
    id: "substitution",
    name: "Substitution Ciphers",
    tagline: "Replacing characters with other characters or symbols",
    description:
      "In substitution techniques, the letters of plaintext are replaced by other letters, numbers, or symbols. If the plaintext is viewed as a sequence of bits, substitution involves replacing plaintext bit patterns with ciphertext bit patterns.",
    characteristics: [
      "Letter identities are changed while their positions are preserved.",
      "Divided into Monoalphabetic, Polyalphabetic, and Polygraphic types.",
      "Subject to frequency analysis if the mapping is simple or short-period."
    ],
    cipherIds: [
      "caesar",
      "multiplicative",
      "affine",
      "monoalphabetic",
      "autokey",
      "playfair",
      "vigenere",
      "hill"
    ]
  },
  {
    id: "transposition",
    name: "Transposition Ciphers",
    tagline: "Rearranging the order of characters without changing their identities",
    description:
      "In transposition techniques, the characters of the plaintext message are rearranged (permuted) rather than substituted. The exact set of plaintext letters is retained, but their relative positions are shuffled according to a geometric or algorithmic key.",
    characteristics: [
      "Letter positions are shuffled while their identities remain identical.",
      "Exact character frequency distribution matches the plaintext perfectly.",
      "Often combined with substitution in modern ciphers (e.g., Shannon's Confusion and Diffusion principles)."
    ],
    cipherIds: [
      "railfence",
      "keyedtransposition"
    ]
  }
];

