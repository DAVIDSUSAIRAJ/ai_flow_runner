import { useFlowStore } from '../store/flowStore';
import { STEP_CONFIGS } from '../types';

const emotionEmojis: Record<string, string> = {
  stressed: '😰',
  happy: '😊',
  sad: '😢',
  angry: '😠',
  neutral: '😐',
};

function ResultsModal() {
  const { showResults, results, closeResults } = useFlowStore();

  if (!showResults || !results) return null;

  // Use n8n results from store or fallback to mock data
  const n8nData = results.n8nResults || {
    input: "I was very good",
    language: "en",
    clean_text: "I was very good.",
    detect_emotion: "Happy",
    categorize_text: "Personal & General",
    summarize: "The speaker expresses positive self-assessment. They feel they were very good.",
    translate: "Keep up that positive energy! Your good work makes a difference."
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeResults}
      />

      {/* Modal Container - Side by Side */}
      <div className="relative w-full max-w-7xl max-h-[90vh] bg-coal-950 rounded-2xl p-6 animate-slide-up flex flex-col overflow-hidden">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{emotionEmojis[results.detectedEmotion]}</span>
            <div>
              <h2 className="text-xl font-bold text-white">Results Ready!</h2>
              <p className="text-coal-400 text-sm">
                {results.aiProcessingEnabled && results.n8nEnabled
                  ? 'compare ai vs workflow results'
                  : results.aiProcessingEnabled
                  ? 'ai processing complete'
                  : results.n8nEnabled
                  ? 'workflow processing complete'
                  : 'processing complete'}
              </p>
            </div>
          </div>
          <button
            onClick={closeResults}
            className="p-2 rounded-xl bg-coal-800 hover:bg-coal-700 transition-colors text-coal-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Side by Side Cards */}
        <div className={`grid ${results.aiProcessingEnabled && results.n8nEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-4 flex-1 overflow-hidden`}>
          {/* LEFT CARD - AI Processing Output (only show if enabled) */}
          {results.aiProcessingEnabled && (
            <div className="bg-coal-900 rounded-2xl border border-coal-700 flex flex-col overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-azure-500 to-azure-600 p-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Processing
              </h3>
              <p className="text-white/70 text-xs mt-1">real-time ai analysis</p>
            </div>

            {/* Card Content - Scrollable */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {/* Input */}
              <div className="bg-coal-800 rounded-lg p-3">
                <p className="text-xs text-coal-400 mb-1">Your Input</p>
                <p className="text-sm text-coal-200 italic">"{results.originalInput}"</p>
              </div>

              {/* Processing Steps */}
              <div className="space-y-2">
                {results.stepResults.map((result, index) => (
                  <div key={index} className="bg-coal-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{STEP_CONFIGS[result.stepType].icon}</span>
                      <p className="text-xs font-medium text-coal-400">{STEP_CONFIGS[result.stepType].label}</p>
                      <svg className="w-3 h-3 text-mint-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-coal-100">{result.output}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* RIGHT CARD - N8N Output (only show if enabled) */}
          {results.n8nEnabled && (
            <div className="bg-coal-900 rounded-2xl border border-coal-700 flex flex-col overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-ember-500 to-ember-600 p-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  N8N Workflow
                </h3>
                <p className="text-white/70 text-xs mt-1">automated processing pipeline</p>
              </div>

              {/* Card Content - Scrollable */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {/* Input */}
                <div className="bg-coal-800 rounded-lg p-3">
                  <p className="text-xs text-coal-400 mb-1">Your Input</p>
                  <p className="text-sm text-coal-200 italic">"{n8nData.input || results.originalInput}"</p>
                </div>

                {/* N8N Processing Steps */}
                <div className="space-y-2">
                  {Object.entries(n8nData).filter(([key]) => !['input', 'language'].includes(key)).map(([stepType, output], index) => {
                    const stepConfig = STEP_CONFIGS[stepType as keyof typeof STEP_CONFIGS];
                    if (!stepConfig) return null;
                    return (
                      <div key={index} className="bg-coal-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{stepConfig.icon}</span>
                          <p className="text-xs font-medium text-coal-400">{stepConfig.label}</p>
                          <svg className="w-3 h-3 text-mint-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-sm text-coal-100">{output as string}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={closeResults}
            className="flex-1 py-2.5 px-4 rounded-xl font-medium text-sm
                     bg-coal-800 text-coal-300 hover:bg-coal-700 hover:text-coal-200
                     transition-all duration-200"
          >
            Close
          </button>
          <button
            onClick={closeResults}
            className="flex-1 py-2.5 px-4 rounded-xl font-medium text-sm
                     bg-gradient-to-r from-ember-500 to-ember-600 text-white
                     hover:from-ember-400 hover:to-ember-500
                     shadow-lg shadow-ember-500/25 hover:shadow-ember-500/40
                     transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Another
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsModal;
