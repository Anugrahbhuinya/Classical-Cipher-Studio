import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Binary,
  Layers,
  ArrowRight,
  Lock,
  Unlock,
  KeyRound,
  Calculator,
  Shuffle,
  Repeat,
  Grid,
  Grid3X3,
  Waves,
  Columns,
  AlertTriangle,
  Cpu,
  GraduationCap,
  ChevronDown,
  Table
} from 'lucide-react';

const CIPHER_DETAILS = [
  {
    id: 'caesar',
    name: 'Additive (Caesar) Cipher',
    category: 'Substitution',
    subCategory: 'Monoalphabetic Substitution Cipher',
    icon: KeyRound,
    definition: 'A monoalphabetic substitution cipher in which each letter in the plaintext is shifted along the alphabet by a fixed integer key k modulo 26.',
    workingPrinciple: 'Each letter is mapped to its integer value (A=0, B=1, ..., Z=25). The encryption function adds the secret shift k to each character position modulo 26. Decryption subtracts the same shift value modulo 26.',
    formula: 'Encryption: C = (P + k) mod 26 | Decryption: P = (C - k + 26) mod 26',
    keyRequirements: 'An integer key k ∈ {0, 1, ..., 25}. Historically, Julius Caesar utilized k = 3.',
    example: 'Shift k = 3: Plaintext "ATTACK" → A(0)+3=D(3), T(19)+3=W(22), T(19)+3=W(22), A(0)+3=D(3), C(2)+3=F(5), K(10)+3=N(13) → Ciphertext "DWWDFN".',
    characteristics: 'Extremely small keyspace of only 25 non-trivial keys. It can be broken in seconds via exhaustive brute-force or frequency analysis.'
  },
  {
    id: 'multiplicative',
    name: 'Multiplicative Cipher',
    category: 'Substitution',
    subCategory: 'Monoalphabetic Substitution Cipher',
    icon: Calculator,
    definition: 'A monoalphabetic substitution cipher where each character’s numerical position is multiplied by a secret integer multiplier k modulo 26.',
    workingPrinciple: 'Plaintext letters are multiplied by key k. Decryption requires multiplying by the modular multiplicative inverse k⁻¹ such that (k × k⁻¹) ≡ 1 (mod 26).',
    formula: 'Encryption: C = (P × k) mod 26 | Decryption: P = (C × k⁻¹) mod 26',
    keyRequirements: 'Key k must be coprime to 26 (gcd(k, 26) = 1). Exactly 12 valid keys exist in Z₂₆*: {1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25}.',
    example: 'Key k = 7 (k⁻¹ = 15): Plaintext "HELLO" → H(7)×7=49≡23(X), E(4)×7=28≡2(C), L(11)×7=77≡25(Z), L(11)×7=77≡25(Z), O(14)×7=98≡20(U) → "XCZZU".',
    characteristics: 'Plaintext letter A (value 0) always encrypts to A (0 × k ≡ 0). With only 12 possible keys, it provides minimal secrecy.'
  },
  {
    id: 'affine',
    name: 'Affine Cipher',
    category: 'Substitution',
    subCategory: 'Monoalphabetic Substitution Cipher',
    icon: Binary,
    definition: 'A monoalphabetic substitution cipher that combines multiplicative and additive operations into a single linear congruential equation.',
    workingPrinciple: 'Each letter undergoes multiplication by multiplier a, followed by an additive shift b modulo 26. Decryption inverts the operation by subtracting b and multiplying by modular inverse a⁻¹.',
    formula: 'Encryption: C = (a × P + b) mod 26 | Decryption: P = a⁻¹ × (C - b + 26) mod 26',
    keyRequirements: 'Key pair (a, b) where gcd(a, 26) = 1 and b ∈ {0, 1, ..., 25}. Total keyspace: 12 × 26 = 312 keys.',
    example: 'Key a = 7, b = 2 (a⁻¹ = 15): Plaintext "HELLO" → H(7)×7+2=51≡25(Z), E(4)×7+2=30≡4(E), L(11)×7+2=79≡1(B), L(11)×7+2=79≡1(B), O(14)×7+2=100≡22(W) → "ZEBBW".',
    characteristics: 'Directly susceptible to frequency analysis. Identifying any two frequent ciphertext letters allows solving a system of two linear equations for keys a and b.'
  },
  {
    id: 'monoalphabetic',
    name: 'Monoalphabetic Substitution Cipher',
    category: 'Substitution',
    subCategory: 'Monoalphabetic Substitution Cipher',
    icon: Shuffle,
    definition: 'A cipher where each letter of the 26-letter plaintext alphabet maps one-to-one to a unique substitute character from a custom permuted alphabet.',
    workingPrinciple: 'A fixed 26-letter substitution alphabet is chosen. Each letter in the message is substituted by the corresponding letter in the key alphabet. Decryption applies the inverse mapping.',
    formula: 'Encryption: C = KeyAlphabet[P] | Decryption: P = StandardAlphabet[Index(KeyAlphabet, C)]',
    keyRequirements: 'A full 26-character permutation of the English alphabet with no duplicate or missing letters.',
    example: 'Key: QWERTYUIOPASDFGHJKLZXCVBNM → "HELLO" maps to H→I, E→T, L→S, L→S, O→G → Ciphertext "ITSSG".',
    characteristics: 'Despite an astronomical keyspace of 26! ≈ 4.03 × 10²⁶, it preserves single-letter and digraph frequencies, rendering it vulnerable to frequency analysis.'
  },
  {
    id: 'autokey',
    name: 'Autokey Cipher (Plaintext-Autokey)',
    category: 'Substitution',
    subCategory: 'Polyalphabetic Substitution Cipher',
    icon: Repeat,
    definition: 'A polyalphabetic cipher that prevents periodic repetition by using an initial secret priming key followed by the plaintext itself as the running keystream.',
    workingPrinciple: 'The keystream is constructed by concatenating the seed primer with the plaintext message: Keystream = Primer || Plaintext. Decryption recovers plaintext characters sequentially to extend the keystream.',
    formula: 'Encryption: C[i] = (P[i] + K[i]) mod 26 where K = Primer || Plaintext',
    keyRequirements: 'A secret seed: an initial integer shift k₀ or a short alphabetic keyword primer.',
    example: 'Primer "QUEEN" with message "RENDEZVOUS": Keystream is "QUEEN" + "RENDEZ..." → C[i] = (P[i] + K[i]) mod 26 produces "HYRHRQZBXW".',
    characteristics: 'Eliminates fixed keyword cycles, resisting standard Kasiski examination. However, it can be broken using automated dictionary searches for the primer.'
  },
  {
    id: 'playfair',
    name: 'Playfair Cipher',
    category: 'Substitution',
    subCategory: 'Polygraphic Substitution Cipher',
    icon: Grid,
    definition: 'The first practical polygraphic cipher, encrypting pairs of letters (digraphs) simultaneously using a 5×5 Polybius key matrix.',
    workingPrinciple: 'A 5×5 matrix is populated with the secret keyword (duplicates removed) followed by remaining letters (I and J share a cell). Message is split into pairs with filler "X" inserted between repeated letters. Rules: Same row → shift right; same column → shift down; rectangle → swap horizontal columns.',
    formula: 'Geometric coordinate mapping on 5×5 matrix (Row, Column, or Rectangle rules)',
    keyRequirements: 'A secret keyword or phrase. Letters I and J are combined in a single cell.',
    example: 'Keyword "MONARCHY" on "BALLOON": Digraphs "BA", "LX", "LO", "ON" transform via matrix rules into "IB", "SU", "PM", "NA" → "IBSUPMNA".',
    characteristics: 'Flattens 26 unigram frequencies into 676 digraph frequencies. However, reverse digraphs encrypt to reverse cipher digraphs (e.g., AB → CD implies BA → DC).'
  },
  {
    id: 'vigenere',
    name: 'Vigenère Cipher',
    category: 'Substitution',
    subCategory: 'Polyalphabetic Substitution Cipher',
    icon: Layers,
    definition: 'A polyalphabetic cipher that uses a repeating keyword to cyclically shift plaintext characters by varying Caesar shift values.',
    workingPrinciple: 'The keyword is repeated across the length of the plaintext. Each letter is shifted by the numerical value of the corresponding keyword character: C[i] = (P[i] + K[i mod m]) mod 26.',
    formula: 'Encryption: C[i] = (P[i] + K[i mod m]) mod 26 | Decryption: P[i] = (C[i] - K[i mod m] + 26) mod 26',
    keyRequirements: 'An alphabetic keyword of length m (e.g., "LEMON").',
    example: 'Keyword "LEMON" on "ATTACK": A+L=L, T+E=X, T+M=F, A+O=O, C+N=P, K+L=V → Ciphertext "LXFOPV".',
    characteristics: 'Known historically as "le chiffre indéchiffrable". Broken in 1863 by Friedrich Kasiski using repeated trigram distances to find key length m.'
  },
  {
    id: 'hill',
    name: 'Hill Cipher',
    category: 'Substitution',
    subCategory: 'Polygraphic Substitution Cipher',
    icon: Grid3X3,
    definition: 'A polygraphic block cipher that operates on blocks of n letters simultaneously using linear algebra and matrix multiplication modulo 26.',
    workingPrinciple: 'Plaintext is divided into n-dimensional column vectors P. Encryption computes C = (K · P) mod 26. Decryption computes P = (K⁻¹ · C) mod 26 using the modular inverse matrix.',
    formula: 'Encryption: C = (K · P) mod 26 | Decryption: P = (K⁻¹ · C) mod 26 where K⁻¹ = (det(K)⁻¹ · adj(K)) mod 26',
    keyRequirements: 'An n×n integer matrix K with gcd(det(K) mod 26, 26) = 1 (matrix must be invertible modulo 26).',
    example: '2×2 matrix [[3, 3], [2, 5]] (det = 9, det⁻¹ = 3) on "HELP": Blocks [7, 4] and [11, 15] multiply by K mod 26 to produce "HIAT".',
    characteristics: 'Completely masks unigram and bigram statistics. However, because it is purely linear, it is completely vulnerable to a known-plaintext attack using n linearly independent pairs.'
  },
  {
    id: 'railfence',
    name: 'Rail Fence Cipher',
    category: 'Transposition',
    subCategory: 'Transposition Cipher',
    icon: Waves,
    definition: 'A geometric transposition cipher where plaintext characters are written diagonally down and up across imaginary horizontal rails, then read off row by row.',
    workingPrinciple: 'Letters are placed along a zig-zag wave across d rails with period 2(d - 1). The ciphertext is constructed by concatenating all letters on Rail 1, followed by Rail 2, through Rail d.',
    formula: 'Zig-zag wave coordinates with period 2(d - 1) across d rails',
    keyRequirements: 'Number of rails (depth d ≥ 2).',
    example: 'Depth 3 on "DEFEND THE EAST WALL AT DAWN": Zig-zag placement yields Rail 1: "DNHAW D", Rail 2: "EEDTEES ALA AN", Rail 3: "F  TLTW" → "DNHAW DEEDTEES ALA ANF  TLTW".',
    characteristics: 'Letter identities remain 100% unaltered; only their spatial coordinates are shuffled. Trivial to break by testing depth values up to message length.'
  },
  {
    id: 'keyedtransposition',
    name: 'Keyed Transposition Cipher',
    category: 'Transposition',
    subCategory: 'Transposition Cipher',
    icon: Columns,
    definition: 'A block-permutation transposition cipher that divides the message into blocks of size m and reorders characters within each block according to a secret permutation key.',
    workingPrinciple: 'Plaintext is segmented into fixed-width blocks of length m. Each block B is reordered via B\'[i] = B[π[i]]. Decryption applies the mathematical inverse permutation π⁻¹.',
    formula: 'Encryption: B\'[i] = B[π[i]] | Decryption: B[i] = B\'[π⁻¹[i]] where π⁻¹[k] = IndexOf(π, k)',
    keyRequirements: 'A valid permutation of numbers 1 to m (or keyword whose alphabetical sorting defines the permutation order).',
    example: 'Key [4, 1, 3, 2, 5] on "ENEMY ATTACKING": Blocks of 5 "ENEMY", " ATTA", "CKING" reorder into "MEENY", "T TAA", "NCIKG" → "MEENYT TAANCIKG".',
    characteristics: 'Character frequencies are perfectly preserved. Cryptanalysts use bigram frequency scoring and anagramming across block boundaries to recover the permutation key.'
  }
];

export default function About() {
  const [expandedCiphers, setExpandedCiphers] = useState({});

  const toggleCipher = (id) => {
    setExpandedCiphers((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all = {};
    CIPHER_DETAILS.forEach((c) => {
      all[c.id] = true;
    });
    setExpandedCiphers(all);
  };

  const collapseAll = () => {
    setExpandedCiphers({});
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-3">
          <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
          <span>Academic Reference Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Classical Cryptography Reference Manual
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-4xl leading-relaxed">
          Comprehensive theoretical foundations, mathematical formulations, algorithmic specifications, and cryptanalytic principles of pre-computer cryptographic systems for Computer Science and Network Security undergraduates.
        </p>

        {/* Quick Jump Anchor Bar */}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Jump to section:</span>
          <a href="#section-a" className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs">
            A. Introduction
          </a>
          <a href="#section-b" className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs">
            B. Categories
          </a>
          <a href="#section-c" className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs">
            C. Ten Ciphers
          </a>
          <a href="#section-d" className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs">
            D. Comparison Table
          </a>
          <a href="#section-e" className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs">
            E. Cryptanalysis
          </a>
          <a href="#section-f" className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs">
            F. Significance
          </a>
        </div>
      </div>

      {/* SECTION A: Introduction to Classical Cryptography */}
      <section id="section-a" className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Section A
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Introduction to Classical Cryptography
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-slate-700 leading-relaxed">
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-base">
              Core Definitions &amp; Scope
            </h3>
            <p>
              <strong>Cryptography</strong> is the science and mathematical study of techniques for securing communication in the presence of adversarial third parties. It provides fundamental security objectives: confidentiality, data integrity, authentication, and non-repudiation.
            </p>
            <p>
              <strong>Classical Cryptography</strong> encompasses encryption methods developed prior to the mid-20th century (before digital microprocessors and public-key cryptosystems). While modern cryptography operates on streams of binary bits (zeros and ones) using 128-bit or 256-bit keys, classical ciphers operate directly on <strong>human-readable alphabetic characters</strong> (typically the 26 letters of the English alphabet, A through Z).
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-base">
              Terminology &amp; Key Principles
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <strong className="text-slate-900">Plaintext (P):</strong> The original, intelligible message in human-readable language before transformation.
              </li>
              <li className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <strong className="text-slate-900">Ciphertext (C):</strong> The transformed, scrambled message that appears nonsensical to unauthorized interceptors.
              </li>
              <li className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <strong className="text-slate-900">Encryption Key (K):</strong> The secret parameter that configures the forward mathematical transformation E.
              </li>
              <li className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <strong className="text-slate-900">Decryption Key (K⁻¹ / K):</strong> The parameter required to compute the inverse transformation D and recover P.
              </li>
            </ul>
          </div>
        </div>

        {/* Visual Cryptographic Flow Diagrams */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Symmetric Cryptographic Workflow
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Forward Flow: Encryption */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs uppercase tracking-wide mb-3">
                <Lock className="h-4 w-4" />
                <span>1. Encryption Process (Forward Transformation)</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-center text-xs font-mono">
                <div className="rounded bg-slate-100 px-2.5 py-1.5 font-bold text-slate-800 border border-slate-200">
                  Plaintext (P)
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-500 shrink-0" />
                <div className="rounded bg-indigo-50 px-2.5 py-1.5 font-semibold text-indigo-700 border border-indigo-200">
                  E(K, P)
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-500 shrink-0" />
                <div className="rounded bg-slate-100 px-2.5 py-1.5 font-bold text-slate-800 border border-slate-200">
                  Ciphertext (C)
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 text-center">
                Formula: C = E(K, P). Conceals message content from unauthorized eavesdroppers.
              </p>
            </div>

            {/* Inverse Flow: Decryption */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wide mb-3">
                <Unlock className="h-4 w-4" />
                <span>2. Decryption Process (Inverse Transformation)</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-center text-xs font-mono">
                <div className="rounded bg-slate-100 px-2.5 py-1.5 font-bold text-slate-800 border border-slate-200">
                  Ciphertext (C)
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="rounded bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-700 border border-emerald-200">
                  D(K⁻¹, C)
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="rounded bg-slate-100 px-2.5 py-1.5 font-bold text-slate-800 border border-slate-200">
                  Plaintext (P)
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 text-center">
                Formula: P = D(K, C) = D(K, E(K, P)). Requires exact mathematical invertibility.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50/70 p-3 text-xs text-amber-900 border border-amber-200/60 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-950">Kerckhoffs&apos;s Principle (1883):</strong>
              <span className="ml-1 text-amber-800">
                A cryptographic system must remain secure even if everything about the design, algorithm, and mathematical implementation is public knowledge. Security resides entirely in keeping the secret key confidential.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: Main Categories of Classical Ciphers */}
      <section id="section-b" className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Shuffle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Section B
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Main Categories: Substitution vs. Transposition
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          Classical cryptographic transformations are fundamentally divided into two distinct mathematical paradigms: <strong>Substitution</strong> and <strong>Transposition</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category 1: Substitution */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                Category 1
              </span>
              <h3 className="font-bold text-slate-900 text-base">Substitution Ciphers</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              In a substitution cipher, plaintext characters or groups of characters are systematically replaced with substitute letters, numbers, or symbols based on a secret key or mathematical map.
            </p>
            <div className="rounded-lg bg-white p-3 border border-blue-100 text-xs space-y-1.5">
              <strong className="block font-semibold text-slate-900">Sub-Classifications:</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li><strong>Monoalphabetic:</strong> A single fixed substitution alphabet is used throughout the message (e.g., Caesar, Multiplicative, Affine).</li>
                <li><strong>Polyalphabetic:</strong> Multiple substitution alphabets or progressive keystreams are used across characters (e.g., Vigenère, Autokey).</li>
                <li><strong>Polygraphic:</strong> Blocks of multiple letters are encrypted simultaneously (e.g., Playfair [2-letter digraphs], Hill [n-dimensional vectors]).</li>
              </ul>
            </div>
          </div>

          {/* Category 2: Transposition */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                Category 2
              </span>
              <h3 className="font-bold text-slate-900 text-base">Transposition Ciphers</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              In a transposition cipher, character identities remain completely unaltered; instead, their spatial positions or sequential order is permuted according to a geometric or numerical key.
            </p>
            <div className="rounded-lg bg-white p-3 border border-emerald-100 text-xs space-y-1.5">
              <strong className="block font-semibold text-slate-900">Sub-Classifications:</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li><strong>Geometric Transposition:</strong> Characters are routed along geometric trajectories (such as zig-zag waves on rails or matrices).</li>
                <li><strong>Block / Columnar Permutation:</strong> Message is divided into fixed blocks or columns, and columns are permuted according to key order.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Category Comparison Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 border-b border-slate-200">Category</th>
                <th className="p-3 border-b border-slate-200">Transformation Principle</th>
                <th className="p-3 border-b border-slate-200">What Changes</th>
                <th className="p-3 border-b border-slate-200">What Remains Unchanged</th>
                <th className="p-3 border-b border-slate-200">Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 font-semibold text-blue-700">Substitution</td>
                <td className="p-3">Replace character identities using maps or modular math</td>
                <td className="p-3 font-medium text-slate-900">Character identities (letters A-Z change)</td>
                <td className="p-3 font-medium text-slate-900">Character positions / sequential order</td>
                <td className="p-3 font-mono text-[11px]">Caesar, Affine, Playfair, Hill, Vigenère</td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 font-semibold text-emerald-700">Transposition</td>
                <td className="p-3">Permute character positions without altering identities</td>
                <td className="p-3 font-medium text-slate-900">Spatial positions / order of characters</td>
                <td className="p-3 font-medium text-slate-900">Character identities &amp; exact letter frequencies</td>
                <td className="p-3 font-mono text-[11px]">Rail Fence, Keyed Transposition</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION C: All Ten Implemented Ciphers */}
      <section id="section-c" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
              <Cpu className="h-3.5 w-3.5 text-indigo-600" />
              <span>Section C</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              In-Depth Analysis of All Ten Implemented Ciphers
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Click any cipher card to expand its complete academic dossier, mathematical formula, and examples.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* 10 Detailed Cipher Dossier Cards */}
        <div className="space-y-4">
          {CIPHER_DETAILS.map((cipher, index) => {
            const isExpanded = Boolean(expandedCiphers[cipher.id]);
            const Icon = cipher.icon;

            return (
              <div
                key={cipher.id}
                className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all"
              >
                {/* Clickable Header */}
                <button
                  type="button"
                  onClick={() => toggleCipher(cipher.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-slate-400">
                          #{index + 1}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            cipher.category === 'Substitution'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}
                        >
                          {cipher.category} Cipher
                        </span>
                        <span className="hidden sm:inline text-xs text-slate-400">•</span>
                        <span className="hidden sm:inline text-xs text-slate-500">
                          {cipher.subCategory}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                        {cipher.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-indigo-600' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/30 text-xs sm:text-sm">
                    {/* Definition */}
                    <div className="rounded-lg bg-white p-4 border border-slate-100 shadow-2xs">
                      <strong className="block text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                        Definition:
                      </strong>
                      <p className="text-slate-700 leading-relaxed">
                        {cipher.definition}
                      </p>
                    </div>

                    {/* Working Principle */}
                    <div className="rounded-lg bg-white p-4 border border-slate-100 shadow-2xs">
                      <strong className="block text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                        Working Principle:
                      </strong>
                      <p className="text-slate-700 leading-relaxed">
                        {cipher.workingPrinciple}
                      </p>
                    </div>

                    {/* Mathematical Formula */}
                    <div className="rounded-lg bg-indigo-50/50 p-4 border border-indigo-100">
                      <strong className="block text-xs font-semibold uppercase tracking-wider text-indigo-900 mb-1">
                        Mathematical Formulation:
                      </strong>
                      <p className="font-mono text-xs sm:text-sm text-indigo-950 font-semibold leading-relaxed">
                        {cipher.formula}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Key Requirements */}
                      <div className="rounded-lg bg-white p-4 border border-slate-100 shadow-2xs space-y-1">
                        <strong className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Key Requirements:
                        </strong>
                        <p className="text-slate-700 leading-relaxed text-xs">
                          {cipher.keyRequirements}
                        </p>
                      </div>

                      {/* Illustrative Example */}
                      <div className="rounded-lg bg-white p-4 border border-slate-100 shadow-2xs space-y-1">
                        <strong className="block text-xs font-semibold uppercase tracking-wider text-emerald-700">
                          Illustrative Example:
                        </strong>
                        <p className="text-slate-700 leading-relaxed text-xs">
                          {cipher.example}
                        </p>
                      </div>
                    </div>

                    {/* Limitations & Vulnerabilities */}
                    <div className="rounded-lg bg-amber-50/60 p-3.5 border border-amber-200/60 flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-amber-950 text-xs">
                          Cryptanalytic Limitations:
                        </strong>
                        <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                          {cipher.characteristics}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION D: Comparison of the Ten Ciphers */}
      <section id="section-d" className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Table className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Section D
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Comparative Analysis Matrix of All Ten Ciphers
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Comprehensive synthesis comparing transformation units, key structures, and core mathematical mechanisms across all ten implemented algorithms:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 border-b border-slate-200">#</th>
                <th className="p-3 border-b border-slate-200">Cipher Algorithm</th>
                <th className="p-3 border-b border-slate-200">Category</th>
                <th className="p-3 border-b border-slate-200">Transformation Unit</th>
                <th className="p-3 border-b border-slate-200">Key Specification</th>
                <th className="p-3 border-b border-slate-200">Core Mathematical Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono">1</td>
                <td className="p-3 font-semibold text-slate-900">Additive (Caesar)</td>
                <td className="p-3 text-blue-700 font-medium">Substitution</td>
                <td className="p-3">Character (1 letter)</td>
                <td className="p-3 font-mono">Integer k ∈ [0, 25]</td>
                <td className="p-3">Modular addition: (P + k) mod 26</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono">2</td>
                <td className="p-3 font-semibold text-slate-900">Multiplicative</td>
                <td className="p-3 text-blue-700 font-medium">Substitution</td>
                <td className="p-3">Character (1 letter)</td>
                <td className="p-3 font-mono">Multiplier k with gcd(k, 26)=1</td>
                <td className="p-3">Modular multiplication: (P × k) mod 26</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono">3</td>
                <td className="p-3 font-semibold text-slate-900">Affine</td>
                <td className="p-3 text-blue-700 font-medium">Substitution</td>
                <td className="p-3">Character (1 letter)</td>
                <td className="p-3 font-mono">Pair (a, b), gcd(a, 26)=1</td>
                <td className="p-3">Linear congruential: (aP + b) mod 26</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono">4</td>
                <td className="p-3 font-semibold text-slate-900">Monoalphabetic</td>
                <td className="p-3 text-blue-700 font-medium">Substitution</td>
                <td className="p-3">Character (1 letter)</td>
                <td className="p-3 font-mono">26-letter permutation</td>
                <td className="p-3">Bijective table lookup mapping</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono">5</td>
                <td className="p-3 font-semibold text-slate-900">Autokey</td>
                <td className="p-3 text-blue-700 font-medium">Substitution</td>
                <td className="p-3">Character stream</td>
                <td className="p-3 font-mono">Primer seed + Plaintext</td>
                <td className="p-3">Non-repeating running key stream</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono">6</td>
                <td className="p-3 font-semibold text-slate-900">Playfair</td>
                <td className="p-3 text-blue-700 font-medium">Substitution</td>
                <td className="p-3">Digraph (2-letter block)</td>
                <td className="p-3 font-mono">5×5 Polybius square keyword</td>
                <td className="p-3">Geometric row/col/rect coordinate swap</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono">7</td>
                <td className="p-3 font-semibold text-slate-900">Vigenère</td>
                <td className="p-3 text-blue-700 font-medium">Substitution</td>
                <td className="p-3">Character stream</td>
                <td className="p-3 font-mono">Repeating keyword of length m</td>
                <td className="p-3">Periodic polyalphabetic shift: (P + K[i]) mod 26</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono">8</td>
                <td className="p-3 font-semibold text-slate-900">Hill</td>
                <td className="p-3 text-blue-700 font-medium">Substitution</td>
                <td className="p-3">Vector block (n letters)</td>
                <td className="p-3 font-mono">Invertible n×n matrix mod 26</td>
                <td className="p-3">Matrix-vector multiplication: (K · P) mod 26</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono">9</td>
                <td className="p-3 font-semibold text-slate-900">Rail Fence</td>
                <td className="p-3 text-emerald-700 font-medium">Transposition</td>
                <td className="p-3">Position (wave path)</td>
                <td className="p-3 font-mono">Rail depth d ≥ 2</td>
                <td className="p-3">Zig-zag wave traversal row-wise</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono">10</td>
                <td className="p-3 font-semibold text-slate-900">Keyed Transposition</td>
                <td className="p-3 text-emerald-700 font-medium">Transposition</td>
                <td className="p-3">Fixed block (m letters)</td>
                <td className="p-3 font-mono">Permutation array π of 1..m</td>
                <td className="p-3">Block character reordering via π and π⁻¹</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION E: Cryptanalysis and Security Limitations */}
      <section id="section-e" className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Section E
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Cryptanalysis and Security Limitations
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          Cryptanalysis is the art of breaking ciphers by exploiting mathematical, statistical, or structural weaknesses without knowledge of the secret key. Classical ciphers suffer from critical vulnerabilities:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Weakness 1: Exhaustive Brute-Force */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              1. Exhaustive Keyspace Brute-Force
            </h3>
            <p className="text-slate-600 leading-relaxed">
              When keyspaces are small, attackers can decrypt ciphertext with every conceivable key until intelligible English appears. Caesar (25 keys), Multiplicative (12 keys), and Affine (312 keys) can be searched in microseconds.
            </p>
          </div>

          {/* Weakness 2: Frequency Analysis */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              2. Natural Frequency Analysis
            </h3>
            <p className="text-slate-600 leading-relaxed">
              In natural human languages, letter occurrences follow distinct probability distributions. In English, &ldquo;E&rdquo; occurs ~12.7%, &ldquo;T&rdquo; ~9.1%, &ldquo;A&rdquo; ~8.2%, and common digraphs include &ldquo;TH&rdquo;, &ldquo;HE&rdquo;, &ldquo;IN&rdquo;. All monoalphabetic substitution ciphers preserve these exact unigram frequency signatures.
            </p>
          </div>

          {/* Weakness 3: Kasiski & Periodic Attacks */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              3. Kasiski Examination &amp; Index of Coincidence
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Polyalphabetic ciphers with repeating keywords (like Vigenère) are broken by measuring the distances between identical ciphertext n-grams. The greatest common divisor (GCD) of these intervals reveals the key length m, decomposing the cipher into m independent monoalphabetic Caesar ciphers.
            </p>
          </div>

          {/* Weakness 4: Linear Algebraic Vulnerability */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              4. Known-Plaintext Linear Attacks
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Because the Hill cipher operates via purely linear equations (C = K · P mod 26), an attacker possessing just n linearly independent plaintext-ciphertext vector pairs can compute K = C · P⁻¹ mod 26 directly, recovering the master key with simple matrix inversion.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-rose-50/60 border border-rose-200 p-4 text-xs text-rose-900 leading-relaxed">
          <strong className="font-semibold text-rose-950 block mb-1">
            Why Classical Ciphers Are Inadequate for Modern Security:
          </strong>
          Classical ciphers lack key length (256-bit AES has 1.15 × 10⁷⁷ keys), non-linear transformations (such as Galois field S-boxes), and avalanche effects. A single statistical property or known message fragment collapses the entire security model. They are purely educational instruments used to illustrate cryptographic history and fundamental algebra.
        </div>
      </section>

      {/* SECTION F: Historical and Educational Significance */}
      <section id="section-f" className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Section F
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Historical &amp; Educational Significance in CNS Coursework
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            The evolution of classical cryptography reflects an ongoing intellectual duel between cipher creators and codebreakers throughout world history. From ancient Spartan military dispatches to the diplomatic intrigues of the Renaissance, each breakthrough in cryptanalysis motivated more sophisticated mathematical structures.
          </p>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5 space-y-3">
            <h3 className="font-bold text-indigo-950 text-sm">
              Shannon&apos;s Principles: Confusion and Diffusion (1949)
            </h3>
            <p className="text-xs text-indigo-900 leading-relaxed">
              In his landmark 1949 paper <em>&ldquo;Communication Theory of Secrecy Systems&rdquo;</em>, Claude Shannon proved that secure modern ciphers require two core operations:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-white p-3 border border-indigo-200/60">
                <strong className="text-indigo-900 block font-semibold mb-0.5">Confusion (Substitution):</strong>
                <span className="text-slate-600">
                  Making the mathematical relationship between plaintext, ciphertext, and key as complex and non-linear as possible.
                </span>
              </div>
              <div className="rounded-lg bg-white p-3 border border-indigo-200/60">
                <strong className="text-indigo-900 block font-semibold mb-0.5">Diffusion (Transposition / Permutation):</strong>
                <span className="text-slate-600">
                  Spreading the statistical influence of each individual plaintext character across numerous ciphertext characters.
                </span>
              </div>
            </div>
            <p className="text-[11px] text-indigo-800">
              Modern standard algorithms like AES (Advanced Encryption Standard) alternate multiple rounds of Substitution (SubBytes) with Transposition (ShiftRows, MixColumns) to achieve complete resistance to linear and differential cryptanalysis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 space-y-1">
              <span className="font-semibold text-slate-900">1. Modular Arithmetic</span>
              <p className="text-slate-600">
                Mastering congruences, greatest common divisors, and modular multiplicative inverses in finite rings Z₂₆.
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 space-y-1">
              <span className="font-semibold text-slate-900">2. Linear Algebra</span>
              <p className="text-slate-600">
                Understanding matrix determinant coprimality, adjoint matrices, and modular matrix inversion.
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 space-y-1">
              <span className="font-semibold text-slate-900">3. Statistical Intuition</span>
              <p className="text-slate-600">
                Appreciating how redundancy and language frequencies must be flattened to achieve true confidentiality.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
