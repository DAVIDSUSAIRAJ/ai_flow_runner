import { useFlowStore } from '../store/flowStore';

function TextInputPanel() {
  const { input, setInput, runFlow, isRunning, steps } = useFlowStore();

  const handleRunFlow = () => {
    if (!isRunning && input.trim() && steps.length > 0) {
      runFlow();
    }
  };

  return (
    <div className="h-full flex flex-col bg-coal-950">
      {/* Header */}
      <div className="p-4 border-b border-coal-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ember-500 to-ember-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-coal-100">AIFlow Runner</h1>
            <p className="text-xs text-coal-500">Text Processing Pipeline</p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="flex-1 flex flex-col">
          <label className="text-sm font-medium text-coal-300 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-azure-500"></span>
            Input Text
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your text here... e.g., 'I feel stressed about my job and overwhelmed with tasks.'"
            className="flex-1 min-h-[200px] bg-coal-900 border border-coal-700 rounded-xl p-4 
                     text-coal-100 placeholder-coal-600 resize-none
                     focus:outline-none focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/20
                     transition-all duration-200 font-mono text-sm leading-relaxed"
            disabled={isRunning}
          />
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-coal-500">
          <span>{input.length} characters</span>
          <span>{input.trim() ? input.trim().split(/\s+/).length : 0} words</span>
        </div>
      </div>

      {/* Run Button */}
      <div className="p-4 border-t border-coal-800">
        <button
          onClick={handleRunFlow}
          disabled={isRunning || !input.trim() || steps.length === 0}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm
                     flex items-center justify-center gap-2 transition-all duration-200
                     ${isRunning 
                       ? 'bg-ember-500/20 text-ember-400 cursor-not-allowed' 
                       : !input.trim() || steps.length === 0
                         ? 'bg-coal-800 text-coal-500 cursor-not-allowed'
                         : 'bg-gradient-to-r from-ember-500 to-ember-600 text-white hover:from-ember-400 hover:to-ember-500 shadow-lg shadow-ember-500/25 hover:shadow-ember-500/40'
                     }`}
        >
          {isRunning ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Running Flow...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Flow
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

