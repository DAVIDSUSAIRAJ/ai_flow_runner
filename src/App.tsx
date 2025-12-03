import { ReactFlowProvider } from 'reactflow';
import TextInputPanel from './components/TextInputPanel';
import FlowCanvas from './components/FlowCanvas';
import ExecutionOrderPanel from './components/ExecutionOrderPanel';

function App() {
  return (
    <div className="h-screen w-screen bg-coal-950 flex overflow-hidden">
      {/* Left Panel - Text Input */}
      <div className="w-80 flex-shrink-0 border-r border-coal-800 flex flex-col">
        <TextInputPanel />
      </div>

      {/* Center - ReactFlow Canvas */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>
      </div>

      {/* Right Panel - Execution Order */}
      <div className="w-72 flex-shrink-0 border-l border-coal-800 flex flex-col">
        <ExecutionOrderPanel />
      </div>
    </div>
  );
}

export default App;

