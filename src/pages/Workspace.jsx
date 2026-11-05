import React, { useState, useEffect } from 'react';
import { CIPHERS } from '../data/cipherData';
import CipherSelector from '../components/CipherSelector';
import InputPanel from '../components/InputPanel';
import KeyConfiguration from '../components/KeyConfiguration';
import OperationControls from '../components/OperationControls';
import OutputPanel from '../components/OutputPanel';
import CipherInformation from '../components/CipherInformation';
import { getCipherEngine } from '../algorithms/index.js';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * Maps the GUI key configuration state for a cipher into the format expected by its engine.
 */
function resolveKeyForCipher(cipherId, keyStates) {
  const state = keyStates[cipherId] || {};

  switch (cipherId) {
    case 'caesar':
      return { shift: state.shift === '' ? 3 : Number(state.shift ?? 3) };

    case 'multiplicative':
      return { multiplier: state.multiplier === '' ? 7 : Number(state.multiplier ?? 7) };

    case 'affine':
      return {
        a: state.a === '' ? 5 : Number(state.a ?? 5),
        b: state.b === '' ? 8 : Number(state.b ?? 8)
      };

    case 'monoalphabetic':
      return { cipherAlphabet: state.cipherAlphabet || 'QWERTYUIOPASDFGHJKLZXCVBNM' };

    case 'autokey':
      return { primer: state.primer ?? 'QUEEN' };

    case 'playfair':
      return { keyword: state.keyword || 'MONARCHY' };

    case 'vigenere':
      return { keyword: state.keyword || 'LEMON' };

    case 'hill': {
      const is3 = state.dimension === '3' || state.dimension === 3;
      return is3
        ? {
            dimension: 3,
            matrix3: (state.matrix3 || [
              [6, 24, 1],
              [13, 16, 10],
              [20, 17, 15]
            ]).map((row) => row.map((cell) => (cell === '' ? 0 : Number(cell) || 0)))
          }
        : {
            dimension: 2,
            matrix: (state.matrix || [
              [3, 3],
              [2, 5]
            ]).map((row) => row.map((cell) => (cell === '' ? 0 : Number(cell) || 0)))
          };
    }

    case 'railfence':
      return { rails: state.rails === '' ? 3 : Number(state.rails ?? 3) };

    case 'keyedtransposition':
      return {
        keyFormat: state.keyFormat || 'numeric',
        permutationKey: state.permutationKey || '4 1 3 2 5'
      };

    default:
      return state;
  }
}

export default function Workspace({
  selectedCipherId,
  setSelectedCipherId
}) {
  const currentCipher = CIPHERS.find((c) => c.id === selectedCipherId) || CIPHERS[0];

  // Workspace State
  const [inputText, setInputText] = useState(currentCipher.samplePlaintext || '');
  const [lastLoadedSample, setLastLoadedSample] = useState(currentCipher.samplePlaintext || '');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encrypt'); // 'encrypt' or 'decrypt'
  const [lastOperation, setLastOperation] = useState(null);
  const [calculationSteps, setCalculationSteps] = useState([]);
  const [algorithmMetadata, setAlgorithmMetadata] = useState(null);
  const [notification, setNotification] = useState(null);

  // Synchronize when selected cipher changes from any source (Sidebar, Home, Selector)
  useEffect(() => {
    setOutputText('');
    setCalculationSteps([]);
    setAlgorithmMetadata(null);
    setLastOperation(null);
    setNotification(null);

    const newCipher = CIPHERS.find((c) => c.id === selectedCipherId);
    if (newCipher) {
      // If input was empty or still matches previous cipher's default sample, update to new sample
      if (!inputText || inputText === lastLoadedSample) {
        setInputText(newCipher.samplePlaintext || '');
        setLastLoadedSample(newCipher.samplePlaintext || '');
      }
    }
  }, [selectedCipherId]);

  // Key state map for all 10 ciphers
  const [keyStates, setKeyStates] = useState({
    caesar: { shift: 3 },
    multiplicative: { multiplier: 7 },
    affine: { a: 5, b: 8 },
    monoalphabetic: { cipherAlphabet: 'QWERTYUIOPASDFGHJKLZXCVBNM' },
    autokey: { primer: 'QUEEN' },
    playfair: { keyword: 'MONARCHY' },
    vigenere: { keyword: 'LEMON' },
    hill: {
      dimension: '2',
      matrix: [[3, 3], [2, 5]],
      matrix3: [
        [6, 24, 1],
        [13, 16, 10],
        [20, 17, 15]
      ]
    },
    railfence: { rails: 3 },
    keyedtransposition: { keyFormat: 'numeric', permutationKey: '4 1 3 2 5' }
  });

  const handleKeyChange = (cipherId, newKey) => {
    setKeyStates((prev) => ({
      ...prev,
      [cipherId]: newKey
    }));
  };

  // Switch cipher
  const handleSelectCipher = (cipherId) => {
    setSelectedCipherId(cipherId);
    const newCipher = CIPHERS.find((c) => c.id === cipherId);
    if (newCipher && !inputText) {
      setInputText(newCipher.samplePlaintext || '');
    }
    setOutputText('');
    setCalculationSteps([]);
    setAlgorithmMetadata(null);
    setLastOperation(null);
    setNotification(null);
  };

  // Encrypt clicked: Call mathematical engine
  const handleEncrypt = () => {
    if (!inputText || inputText.trim() === '') {
      setNotification({
        type: 'warning',
        title: 'Input Text Required',
        message: 'Please enter a message in the input panel before encrypting.'
      });
      return;
    }

    try {
      const engine = getCipherEngine(currentCipher.id);
      const key = resolveKeyForCipher(currentCipher.id, keyStates);
      const res = engine.encrypt(inputText, key);

      setOutputText(res.result);
      setCalculationSteps(res.steps || []);
      setAlgorithmMetadata(res.metadata || null);
      setLastOperation('Encryption');
      setMode('encrypt');

      let successMsg = `Successfully encrypted message with ${currentCipher.name}.`;
      if (res.metadata?.paddedCount > 0) {
        successMsg += ` (${res.metadata.paddedCount} padding character(s) added).`;
      }

      setNotification({
        type: 'success',
        title: 'Encryption Complete',
        message: successMsg
      });
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Encryption Failed',
        message: err.message || 'An error occurred during encryption.'
      });
    }
  };

  // Decrypt clicked: Call mathematical engine
  const handleDecrypt = () => {
    if (!inputText || inputText.trim() === '') {
      setNotification({
        type: 'warning',
        title: 'Input Text Required',
        message: 'Please enter ciphertext in the input panel before decrypting.'
      });
      return;
    }

    try {
      const engine = getCipherEngine(currentCipher.id);
      const key = resolveKeyForCipher(currentCipher.id, keyStates);
      const res = engine.decrypt(inputText, key);

      setOutputText(res.result);
      setCalculationSteps(res.steps || []);
      setAlgorithmMetadata(res.metadata || null);
      setLastOperation('Decryption');
      setMode('decrypt');

      setNotification({
        type: 'success',
        title: 'Decryption Complete',
        message: `Successfully decrypted message with ${currentCipher.name}.`
      });
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Decryption Failed',
        message: err.message || 'An error occurred during decryption.'
      });
    }
  };

  // Swap input and output text
  const handleSwap = () => {
    if (!outputText) {
      setNotification({
        type: 'warning',
        title: 'Swap Notice',
        message: 'No output text available to swap into the input panel. Encrypt or decrypt a message first.'
      });
      return;
    }
    const tempInput = inputText;
    setInputText(outputText);
    setOutputText(tempInput);
    const newMode = mode === 'encrypt' ? 'decrypt' : 'encrypt';
    setMode(newMode);
    setNotification({
      type: 'info',
      title: 'Input / Output Swapped',
      message: `Output moved to input panel. Mode toggled to ${newMode === 'decrypt' ? 'Decryption' : 'Encryption'}.`
    });
  };

  // Reset workspace
  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setCalculationSteps([]);
    setAlgorithmMetadata(null);
    setLastOperation(null);
    setKeyStates({
      caesar: { shift: 3 },
      multiplicative: { multiplier: 7 },
      affine: { a: 5, b: 8 },
      monoalphabetic: { cipherAlphabet: 'QWERTYUIOPASDFGHJKLZXCVBNM' },
      autokey: { primer: 'QUEEN' },
      playfair: { keyword: 'MONARCHY' },
      vigenere: { keyword: 'LEMON' },
      hill: {
        dimension: '2',
        matrix: [[3, 3], [2, 5]],
        matrix3: [
          [6, 24, 1],
          [13, 16, 10],
          [20, 17, 15]
        ]
      },
      railfence: { rails: 3 },
      keyedtransposition: { keyFormat: 'numeric', permutationKey: '4 1 3 2 5' }
    });
    setNotification({
      type: 'info',
      title: 'Workspace Reset',
      message: 'Input text, output text, calculation steps, and all cipher keys restored to defaults.'
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Cipher Selector Banner */}
      <CipherSelector
        selectedCipherId={selectedCipherId}
        onSelectCipher={handleSelectCipher}
      />

      {/* Dynamic Notification Banner */}
      {notification && (
        <div
          className={`flex items-start justify-between rounded-xl p-4 transition-all shadow-xs ${
            notification.type === 'info'
              ? 'border border-blue-200 bg-blue-50 text-blue-900'
              : notification.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
              : notification.type === 'error'
              ? 'border border-rose-200 bg-rose-50 text-rose-900'
              : 'border border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {notification.type === 'info' && <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />}
            {notification.type === 'success' && <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />}
            {notification.type === 'error' && <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />}
            {notification.type === 'warning' && <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />}
            <div>
              <h4 className="text-sm font-semibold">{notification.title}</h4>
              <p className="mt-0.5 text-xs leading-relaxed opacity-95">{notification.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="rounded p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. Primary Workspace Grid: Input Panel & Key Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <InputPanel
          text={inputText}
          setText={setInputText}
          sampleText={currentCipher.samplePlaintext}
          mode={mode}
        />

        <KeyConfiguration
          cipher={currentCipher}
          keyState={keyStates[currentCipher.id] || {}}
          onKeyChange={handleKeyChange}
        />
      </div>

      {/* 3. Operation Controls Bar */}
      <OperationControls
        onEncrypt={handleEncrypt}
        onDecrypt={handleDecrypt}
        onSwap={handleSwap}
        onReset={handleReset}
        hasOutput={Boolean(outputText)}
        hasInput={Boolean(inputText)}
      />

      {/* 4. Output Panel with Actual Results and Expandable Calculation Steps */}
      <OutputPanel
        output={outputText}
        cipherName={currentCipher.name}
        operation={lastOperation}
        steps={calculationSteps}
        metadata={algorithmMetadata}
      />

      {/* 5. Cipher Information Dossier Card */}
      <CipherInformation cipher={currentCipher} />
    </div>
  );
}
