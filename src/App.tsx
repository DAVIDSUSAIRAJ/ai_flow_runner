import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import TextInputPanel from './components/TextInputPanel';
import FlowCanvas from './components/FlowCanvas';
import ExecutionOrderPanel from './components/ExecutionOrderPanel';
import ResultsModal from './components/ResultsModal';

type MobileTab = 'input' | 'canvas' | 'steps';

function App() {
  const [mobileTab, setMobileTab] = useState<MobileTab>('input');

  return (
    <div className="h-screen w-screen bg-coal-950 flex flex-col lg:flex-row overflow-hidden">
      {/* Desktop: Left Panel - Text Input */}
      <div className="hidden lg:flex w-80 flex-shrink-0 border-r border-coal-800 flex-col">
        <TextInputPanel onRunFlow={() => {}} />
      </div>

      {/* Mobile: Text Input Panel (shown when tab is 'input') */}
      <div className={`lg:hidden flex-1 flex flex-col ${mobileTab === 'input' ? 'flex' : 'hidden'}`}>
        <TextInputPanel onRunFlow={() => setMobileTab('canvas')} />
      </div>

      {/* Desktop: Center - ReactFlow Canvas */}
      <div className="hidden lg:flex flex-1 relative">
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>
      </div>

      {/* Mobile: Canvas (shown when tab is 'canvas') */}
      <div className={`lg:hidden flex-1 relative ${mobileTab === 'canvas' ? 'flex' : 'hidden'}`}>
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>
      </div>

      {/* Desktop: Right Panel - Execution Order */}
      <div className="hidden lg:flex w-72 flex-shrink-0 border-l border-coal-800 flex-col">
        <ExecutionOrderPanel />
      </div>

      {/* Mobile: Steps Panel (shown when tab is 'steps') */}
      <div className={`lg:hidden flex-1 flex flex-col ${mobileTab === 'steps' ? 'flex' : 'hidden'}`}>
        <ExecutionOrderPanel />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-coal-900 border-t border-coal-800 z-40 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          <button
            onClick={() => setMobileTab('input')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-colors ${
              mobileTab === 'input' 
                ? 'text-ember-500 bg-ember-500/10' 
                : 'text-coal-500 hover:text-coal-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-xs font-medium">Input</span>
          </button>

          <button
            onClick={() => setMobileTab('canvas')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-colors ${
              mobileTab === 'canvas' 
                ? 'text-ember-500 bg-ember-500/10' 
                : 'text-coal-500 hover:text-coal-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-xs font-medium">Flow</span>
          </button>

          <button
            onClick={() => setMobileTab('steps')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-colors ${
              mobileTab === 'steps' 
                ? 'text-ember-500 bg-ember-500/10' 
                : 'text-coal-500 hover:text-coal-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs font-medium">Steps</span>
          </button>
        </div>
      </div>

      {/* Results Modal - Shows after flow completes */}
      <ResultsModal />
    </div>
  );
}

export default App;
