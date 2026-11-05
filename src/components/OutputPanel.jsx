import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  ShieldAlert,
  FileText,
  ChevronDown,
  ChevronUp,
  Calculator,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';

export default function OutputPanel({
  output = '',
  cipherName = '',
  operation = null,
  steps = [],
  metadata = null,
  onClearOutput
}) {
  const [copied, setCopied] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [stepPage, setStepPage] = useState(1);
  const STEPS_PER_PAGE = 30;

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob(
      [
        `==================================================\n`,
        `Classical Cipher Studio - Cryptographic Export\n`,
        `Cipher:    ${cipherName}\n`,
        `Operation: ${operation || 'Transformation'}\n`,
        `Timestamp: ${new Date().toISOString()}\n`,
        `==================================================\n\n`,
        output,
        `\n\n==================================================\n`,
        `Calculation Steps Count: ${steps.length}\n`
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(cipherName || 'cipher').toLowerCase().replace(/[^a-z0-9]/g, '_')}_${(
      operation || 'result'
    ).toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Determine if padding was applied
  const paddingInfo = (() => {
    if (!metadata) return null;
    if (metadata.paddedCount > 0) {
      return {
        count: metadata.paddedCount,
        message: `${metadata.paddedCount} padding character(s) ('X') appended to complete the final block.`
      };
    }
    if (metadata.paddedIndices && metadata.paddedIndices.length > 0) {
      return {
        count: metadata.paddedIndices.length,
        message: `Filler characters inserted in ${metadata.paddedIndices.length} digraph pair(s) to resolve duplicate letters or odd message length.`
      };
    }
    return null;
  })();

  const totalStepPages = Math.ceil(steps.length / STEPS_PER_PAGE);
  const displayedSteps = steps.slice((stepPage - 1) * STEPS_PER_PAGE, stepPage * STEPS_PER_PAGE);

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Transformation Result / Output
          </h3>
          {operation && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                operation === 'Encryption'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              }`}
            >
              {operation}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              output
                ? 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer shadow-2xs'
                : 'border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
            title={output ? 'Copy output to clipboard' : 'No output to copy'}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!output}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              output
                ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer shadow-2xs'
                : 'border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
            title={output ? 'Download output as .txt' : 'No output to download'}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      {/* Padding / Transformation Notice Banner */}
      {paddingInfo && (
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-950">Padding Notice:</span>
            <span className="ml-1 text-amber-800">{paddingInfo.message}</span>
            {metadata?.fillerNote && (
              <p className="mt-0.5 text-[11px] text-amber-700/90">{metadata.fillerNote}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Output Text Area */}
      <div className="mt-3 flex-1 flex flex-col justify-center">
        {output ? (
          <textarea
            readOnly
            value={output}
            rows={5}
            className="w-full flex-1 resize-y rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 font-mono text-sm leading-relaxed text-slate-800 focus:outline-hidden"
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center min-h-[150px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-sm font-semibold text-slate-700">
              No Output Generated Yet
            </h4>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              Enter plaintext or ciphertext above, configure the key parameters, and click <strong>Encrypt</strong> or <strong>Decrypt</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span>
            Output Length: <strong className="font-semibold text-slate-700">{output.length}</strong> chars
          </span>
          {metadata?.inverseKey !== undefined && (
            <>
              <span className="text-slate-300">&bull;</span>
              <span>
                Modular Inverse K⁻¹: <strong className="font-mono font-semibold text-indigo-600">{metadata.inverseKey}</strong>
              </span>
            </>
          )}
          {metadata?.aInverse !== undefined && (
            <>
              <span className="text-slate-300">&bull;</span>
              <span>
                Inverse Multiplier a⁻¹: <strong className="font-mono font-semibold text-indigo-600">{metadata.aInverse}</strong>
              </span>
            </>
          )}
        </div>

        {/* Expandable Calculation Steps Toggle */}
        {steps && steps.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSteps(!showSteps)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <Calculator className="h-3.5 w-3.5 text-indigo-600" />
            <span>
              {showSteps ? 'Hide Calculation Steps' : `Show Calculation Steps (${steps.length})`}
            </span>
            {showSteps ? (
              <ChevronUp className="h-3.5 w-3.5 text-indigo-600" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-indigo-600" />
            )}
          </button>
        )}
      </div>

      {/* EXPANDABLE EDUCATIONAL CALCULATION STEPS SECTION */}
      {showSteps && steps && steps.length > 0 && (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                Educational Mathematical Walkthrough ({steps.length} total operations)
              </h4>
            </div>

            {totalStepPages > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">
                  Page {stepPage} of {totalStepPages}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={stepPage <= 1}
                    onClick={() => setStepPage((p) => Math.max(1, p - 1))}
                    className="rounded border border-slate-200 bg-white px-2 py-0.5 text-slate-600 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={stepPage >= totalStepPages}
                    onClick={() => setStepPage((p) => Math.min(totalStepPages, p + 1))}
                    className="rounded border border-slate-200 bg-white px-2 py-0.5 text-slate-600 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Rail Fence Specific Visual Rail Row Distribution */}
          {metadata?.railDistribution && (
            <div className="mt-3 mb-4 rounded-lg border border-slate-200 bg-white p-3 text-xs">
              <span className="font-semibold text-slate-700 block mb-2">
                Zig-Zag Rail Wave Allocation:
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                {metadata.railDistribution.map((rd) => (
                  <div key={rd.rail} className="flex items-start gap-2">
                    <span className="inline-block w-16 text-indigo-700 font-semibold shrink-0">
                      Rail {rd.rail} ({rd.count}):
                    </span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-800 break-all">
                      {rd.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps List Table / Grid */}
          <div className="mt-3 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
              <thead className="bg-slate-50 font-semibold text-slate-700 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="py-2 px-3 w-12 text-center">#</th>
                  <th scope="col" className="py-2 px-3">Input</th>
                  <th scope="col" className="py-2 px-3">Mathematical Transformation / Rule</th>
                  <th scope="col" className="py-2 px-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {displayedSteps.map((step, idx) => {
                  const stepIndex = (stepPage - 1) * STEPS_PER_PAGE + idx + 1;
                  return (
                    <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-400 font-sans">{stepIndex}</td>

                      {/* Input Column */}
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {step.inputPair || step.inputBlock || step.char || `Pos ${step.charIndex}`}
                      </td>

                      {/* Formula / Rule Column */}
                      <td className="py-2 px-3 font-sans text-xs">
                        <span className="font-mono text-indigo-700 text-[11px]">
                          {step.formula || step.note || `${step.rule || ''}`}
                        </span>
                        {step.keyOrigin && (
                          <span className="ml-2 text-[10px] text-slate-400 font-sans">
                            ({step.keyOrigin})
                          </span>
                        )}
                        {step.isPadded && (
                          <span className="ml-2 inline-block rounded bg-amber-100 px-1 py-0.2 text-[9px] font-semibold text-amber-800 font-sans">
                            Padded
                          </span>
                        )}
                      </td>

                      {/* Result Column */}
                      <td className="py-2 px-3 text-right font-bold text-indigo-900">
                        {step.outputPair || step.outputBlock || step.resultChar || step.char || ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-[11px] text-slate-500 italic">
            * All modular arithmetic performed strictly over integer ring Z26 (or matrix space GL(n, Z26)).
          </p>
        </div>
      )}
    </div>
  );
}
