import { useFlowStore } from '../store/flowStore';

type TextInputPanelProps = {
  onRunFlow?: () => void;
};

function TextInputPanel({ onRunFlow }: TextInputPanelProps) {
  const { input, setInput, runFlow, isRunning, steps, selectedLanguage, setSelectedLanguage, n8nEnabled, setN8nEnabled, userEmail, setUserEmail } = useFlowStore();

  const handleRunFlow = () => {
    if (!isRunning && input.trim() && steps.length > 0) {
      runFlow();
      // Switch to Flow tab on mobile when flow starts
      if (onRunFlow) {
        onRunFlow();
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-coal-950">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-coal-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-ember-500 to-ember-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-coal-100 truncate">AIFlow Runner</h1>
            <p className="text-xs text-coal-500">Text Processing Pipeline</p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <label className="text-sm font-medium text-coal-300 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-azure-500"></span>
            Input Text
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts... e.g., 'I'm excited about starting my new project today!' or 'Feeling grateful for my supportive team.'"
            className="flex-1 min-h-[150px] sm:min-h-[200px] bg-coal-900 border border-coal-700 rounded-xl p-3 sm:p-4 
                     text-coal-100 placeholder-coal-600 resize-none
                     focus:outline-none focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/20
                     transition-all duration-200 font-mono text-sm sm:text-base leading-relaxed
                     touch-manipulation"
            disabled={isRunning}
          />
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-coal-500 flex-shrink-0" style={{transform: 'translateY(8px)'}}>
          <span>{input.length} characters</span>
          <span>{input.trim() ? input.trim().split(/\s+/).length : 0} words</span>
        </div>
      </div>

      {/* Language Selection */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex-shrink-0">
        <label className="text-sm font-medium text-coal-300 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ember-500"></span>
          Translate To
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          disabled={isRunning}
          className="w-full bg-coal-900 border border-coal-700 rounded-xl p-3 
                   text-coal-100 focus:outline-none focus:border-ember-500/50 
                   focus:ring-2 focus:ring-ember-500/20 transition-all duration-200
                   touch-manipulation"
        >
          <option value="en">🇺🇸 English</option>
          <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
          <option value="hi">🇮🇳 हिंदी (Hindi)</option>
          <option value="es">🇪🇸 Español (Spanish)</option>
          <option value="fr">🇫🇷 Français (French)</option>
          <option value="de">🇩🇪 Deutsch (German)</option>
          <option value="ja">🇯🇵 日本語 (Japanese)</option>
          <option value="zh">🇨🇳 中文 (Chinese)</option>
          <option value="ko">🇰🇷 한국어 (Korean)</option>
          <option value="ar">🇸🇦 العربية (Arabic)</option>
          <option value="pt">🇵🇹 Português (Portuguese)</option>
        </select>
      </div>

      {/* N8N Toggle */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex-shrink-0">
        <div className="flex items-center justify-between bg-coal-900 border border-coal-700 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ember-500"></span>
            <span className="text-sm font-medium text-coal-300">N8N Integration</span>
          </div>
          <button
            onClick={() => setN8nEnabled(!n8nEnabled)}
            disabled={isRunning}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
              n8nEnabled ? 'bg-ember-500' : 'bg-coal-700'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                n8nEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {n8nEnabled && (
          <div className="mt-3">
            <label className="text-xs font-medium text-coal-400 mb-1.5 flex items-center gap-1.5">
              <span>📧</span>
              Your Email
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your.email@example.com"
              disabled={isRunning}
              className="w-full bg-coal-900 border border-coal-700 rounded-xl px-3 py-2 
                       text-sm text-coal-100 placeholder-coal-600
                       focus:outline-none focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/20
                       transition-all duration-200 touch-manipulation"
            />
            <p className="text-xs text-coal-500 mt-1.5 px-1">
              we'll send your personalized motivational quote to this email
            </p>
          </div>
        )}
      </div>

      {/* Run Button - Extra padding on mobile for bottom nav */}
      <div className="p-3 sm:p-4 border-t border-coal-800 flex-shrink-0 pb-20 lg:pb-3 sm:pb-4 bg-coal-950">
        <button
          onClick={handleRunFlow}
          disabled={isRunning || !input.trim() || steps.length === 0}
          className={`w-full py-3 sm:py-3.5 px-4 rounded-xl font-semibold text-sm sm:text-base
                     flex items-center justify-center gap-2 transition-all duration-200
                     touch-manipulation min-h-[48px]
                     ${isRunning 
                       ? 'bg-ember-500/20 text-ember-400 cursor-not-allowed' 
                       : !input.trim() || steps.length === 0
                         ? 'bg-coal-800 text-coal-500 cursor-not-allowed'
                         : 'bg-gradient-to-r from-ember-500 to-ember-600 text-white hover:from-ember-400 hover:to-ember-500 shadow-lg shadow-ember-500/25 hover:shadow-ember-500/40 active:scale-[0.98]'
                     }`}
        >
          {isRunning ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Running Flow...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Run Flow</span>
            </>
          )}
        </button>
        
        {steps.length === 0 && (
          <p className="text-xs text-rose-400 mt-2 text-center">
            Add at least one step to run the flow
          </p>
        )}
      </div>
    </div>
  );
}

export default TextInputPanel;
