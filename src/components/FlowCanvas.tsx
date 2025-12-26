import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowStore } from '../store/flowStore';
import StepNode from './StepNode';

const nodeTypes = {
  stepNode: StepNode,
};

// Component to set default zoom level - must be inside ReactFlow
function DefaultZoomSetter() {
  const { fitView } = useReactFlow();
  const hasSetZoom = useRef(false);

  useEffect(() => {
    if (!hasSetZoom.current) {
      // Set default zoom level with fitView
      fitView({ 
        padding: 0.2, 
        duration: 0, // Instant, no animation
        minZoom: 0.5, // Minimum zoom level
        maxZoom: 1.5, // Maximum zoom level
      });
      hasSetZoom.current = true;
    }
  }, [fitView]);

  return null;
}

function FlowCanvas() {
  const { steps } = useFlowStore();

  // Generate nodes from steps - responsive spacing
  const initialNodes: Node[] = useMemo(() => {
    const isMobile = window.innerWidth < 1024;
    const startX = isMobile ? 50 : 100;
    const startY = isMobile ? 50 : 100;
    const horizontalSpacing = isMobile ? 200 : 280;
    const verticalSpacing = isMobile ? 120 : 150;
    const nodesPerRow = isMobile ? 1 : 2;

    return steps.map((step, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      // Create a zigzag pattern (vertical on mobile)
      const x = startX + (col * horizontalSpacing);
      const y = startY + (row * verticalSpacing);

      return {
        id: step.id,
        type: 'stepNode',
        position: { x, y },
        data: {
          label: step.label,
          type: step.type,
          status: step.status,
        },
      };
    });
  }, [steps]);

  // Generate edges connecting nodes in order
  const initialEdges: Edge[] = useMemo(() => {
    return steps.slice(0, -1).map((step, index) => ({
      id: `edge-${step.id}-${steps[index + 1].id}`,
      source: step.id,
      target: steps[index + 1].id,
      animated: step.status === 'running' || steps[index + 1].status === 'running',
      style: {
        stroke: step.status === 'done' 
          ? '#22c55e' 
          : step.status === 'running' 
            ? '#3b82f6' 
            : '#737384',
        strokeWidth: 2,
      },
    }));
  }, [steps]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // Update nodes when steps change (for status updates)
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const step = steps.find((s) => s.id === node.id);
        if (step) {
          return {
            ...node,
            data: {
              ...node.data,
              status: step.status,
            },
          };
        }
        return node;
      })
    );

    setEdges(
      steps.slice(0, -1).map((step, index) => ({
        id: `edge-${step.id}-${steps[index + 1].id}`,
        source: step.id,
        target: steps[index + 1].id,
        animated: step.status === 'running' || steps[index + 1].status === 'running',
        style: {
          stroke: step.status === 'done' 
            ? '#22c55e' 
            : step.status === 'running' 
              ? '#3b82f6' 
              : '#737384',
          strokeWidth: 2,
        },
      }))
    );
  }, [steps, setNodes, setEdges]);

  // Sync nodes when steps array changes (add/remove/reorder)
  useEffect(() => {
    // Rebuild nodes and edges whenever the step order changes
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [steps.map((s, i) => `${i}:${s.id}`).join(','), initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(() => {
    // We don't allow manual connections - order is controlled by the side panel
  }, []);


  return (
    <div className="w-full h-full flow-canvas-bg">
      {/* Header - Hidden on mobile */}
      <div className="hidden lg:block absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="pointer-events-auto bg-coal-900/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-coal-800">
            <h2 className="text-sm font-medium text-coal-300">Flow Visualization</h2>
            <p className="text-xs text-coal-500">Drag nodes to arrange • Order controlled by side panel</p>
          </div>
          <div className="pointer-events-auto bg-coal-900/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-coal-800 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-coal-500" />
              <span className="text-xs text-coal-400">Idle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-azure-500 animate-pulse" />
              <span className="text-xs text-coal-400">Running</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-mint-500" />
              <span className="text-xs text-coal-400">Done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs text-coal-400">Error</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-10 p-2 pointer-events-none">
        <div className="pointer-events-auto bg-coal-900/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-coal-800">
          <h2 className="text-xs font-medium text-coal-300">Flow Visualization</h2>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-coal-800 flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-coal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base text-coal-300 font-medium mb-1">No Steps in Flow</h3>
            <p className="text-xs sm:text-sm text-coal-500">Add steps from the steps tab</p>
          </div>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={1}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          proOptions={{ hideAttribution: true }}
          className="bg-coal-950"
          panOnScroll={true}
          panOnDrag={true}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1} 
            color="#2a2a32"
          />
          <Controls 
            className="!bg-coal-900 !border-coal-700 !rounded-xl !overflow-hidden"
            showInteractive={false}
            showFitView={true}
          />
          <DefaultZoomSetter />
        </ReactFlow>
      )}
    </div>
  );
}

export default FlowCanvas;
