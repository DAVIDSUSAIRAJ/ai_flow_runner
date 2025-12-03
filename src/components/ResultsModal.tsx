import { useFlowStore } from '../store/flowStore';
import { STEP_CONFIGS } from '../types';

const emotionEmojis: Record<string, string> = {
  stressed: '😰',
  happy: '😊',
  sad: '😢',
  angry: '😠',
  neutral: '😐',
};

const emotionColors: Record<string, string> = {
  stressed: 'from-amber-500 to-orange-600',
  happy: 'from-emerald-400 to-green-500',
  sad: 'from-blue-400 to-indigo-500',
  angry: 'from-red-500 to-rose-600',
  neutral: 'from-slate-400 to-gray-500',
};

function ResultsModal() {
  const { showResults, results, closeResults } = useFlowStore();

  if (!showResults || !results) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeResults}
      />

      {/* Modal - with max height and scroll */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-coal-900 rounded-3xl border border-coal-700 shadow-2xl animate-slide-up flex flex-col overflow-hidden">
        {/* Gradient Header - Fixed */}
        <div className={`bg-gradient-to-r ${emotionColors[results.detectedEmotion]} p-4 sm:p-6 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">{emotionEmojis[results.detectedEmotion]}</span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Flow Complete!</h2>
                <p className="text-white/80 text-xs sm:text-sm">
                  Processed through {results.stepResults.length} steps
                </p>
              </div>
            </div>
            <button
              onClick={closeResults}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Original Input */}
          <div>
            <h3 className="text-sm font-medium text-coal-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-azure-500"></span>
              Your Input
            </h3>
            <p className="text-coal-200 bg-coal-800 rounded-xl p-3 text-sm italic">
              "{results.originalInput}"
            </p>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Detected Emotion */}
            <div className="bg-coal-800 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{emotionEmojis[results.detectedEmotion]}</span>
                <span className="text-xs font-medium text-coal-400">Emotion</span>
              </div>
              <p className="text-base font-semibold text-coal-100 capitalize">
                {results.detectedEmotion}
              </p>
            </div>

            {/* Category */}
            <div className="bg-coal-800 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🏷️</span>
                <span className="text-xs font-medium text-coal-400">Category</span>
              </div>
              <p className="text-base font-semibold text-coal-100">
                {results.category}
              </p>
            </div>
          </div>

          {/* Step Results - Compact */}
          <div>
            <h3 className="text-sm font-medium text-coal-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mint-500"></span>
              Processing Steps
            </h3>
            <div className="space-y-1.5">
              {results.stepResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 bg-coal-800 rounded-lg p-2"
                >
                  <div className="w-7 h-7 rounded-lg bg-coal-700 flex items-center justify-center text-sm flex-shrink-0">
                    {STEP_CONFIGS[result.stepType].icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-coal-400">{STEP_CONFIGS[result.stepType].label}</p>
                    <p className="text-sm text-coal-200 truncate">{result.output}</p>
                  </div>
                  <svg className="w-4 h-4 text-mint-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Quote Section */}
          <div className={`bg-gradient-to-br ${emotionColors[results.detectedEmotion]} rounded-xl p-4 relative overflow-hidden`}>
            {/* Decorative quote marks */}
            <div className="absolute top-1 left-3 text-4xl text-white/10 font-serif">"</div>
            <div className="absolute bottom-1 right-3 text-4xl text-white/10 font-serif rotate-180">"</div>
            
            <div className="relative z-10">
              <p className="text-white text-base font-medium leading-relaxed mb-2">
                {results.quote}
              </p>
              <p className="text-white/80 text-sm font-medium">
                — {results.quoteAuthor}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="p-4 sm:p-6 pt-0 flex gap-3 flex-shrink-0 border-t border-coal-800 bg-coal-900">
          <button
            onClick={closeResults}
            className="flex-1 py-2.5 px-4 rounded-xl font-medium text-sm
                     bg-coal-800 text-coal-300 hover:bg-coal-700 hover:text-coal-200
                     transition-all duration-200"
          >
            Close
          </button>
          <button
            onClick={() => {
              closeResults();
            }}
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
