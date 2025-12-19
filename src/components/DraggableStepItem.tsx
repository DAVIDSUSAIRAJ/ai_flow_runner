import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FlowStep, STEP_CONFIGS, StepStatus } from '../types';

const ITEM_TYPE = 'STEP';

type DraggableStepItemProps = {
  step: FlowStep;
  index: number;
  moveStep: (fromIndex: number, toIndex: number) => void;
  onDelete: (id: string) => void;
  isRunning: boolean;
  totalSteps: number;
};

const statusColors: Record<StepStatus, string> = {
  idle: 'bg-coal-600',
  running: 'bg-azure-500 animate-pulse',
  done: 'bg-mint-500',
  error: 'bg-rose-500',
};

function DraggableStepItem({ step, index, moveStep, onDelete, isRunning, totalSteps }: DraggableStepItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const config = STEP_CONFIGS[step.type];

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    canDrag: !isRunning,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveStep(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0 && !isRunning) {
      moveStep(index, index - 1);
    }
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < totalSteps - 1 && !isRunning) {
      moveStep(index, index + 1);
    }
  };

  return (
    <div
      ref={ref}
      className={`
        group relative flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl
        bg-coal-900 border transition-all duration-200 
        min-h-[60px] sm:min-h-[70px]
        ${isDragging 
          ? 'opacity-50 scale-105 border-ember-500 shadow-lg shadow-ember-500/20' 
          : isOver
            ? 'border-ember-500/50 bg-coal-800'
            : 'border-coal-700 hover:border-coal-600'
        }
        ${isRunning ? 'opacity-75' : ''}
        ${!isRunning ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}
      `}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* Mobile: Up/Down Buttons - Visible only on mobile */}
      <div className="lg:hidden flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={handleMoveUp}
          disabled={isRunning || index === 0}
          className={`
            p-1.5 rounded-lg transition-all duration-200
            touch-manipulation min-w-[36px] min-h-[36px]
            flex items-center justify-center
            ${isRunning || index === 0
              ? 'opacity-30 cursor-not-allowed text-coal-600'
              : 'bg-coal-800 text-coal-400 hover:bg-coal-700 hover:text-ember-400 active:bg-coal-600'
            }
          `}
          title="Move up"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={handleMoveDown}
          disabled={isRunning || index === totalSteps - 1}
          className={`
            p-1.5 rounded-lg transition-all duration-200
            touch-manipulation min-w-[36px] min-h-[36px]
            flex items-center justify-center
            ${isRunning || index === totalSteps - 1
              ? 'opacity-30 cursor-not-allowed text-coal-600'
              : 'bg-coal-800 text-coal-400 hover:bg-coal-700 hover:text-ember-400 active:bg-coal-600'
            }
          `}
          title="Move down"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Desktop: Drag Handle */}
      <div className={`
        hidden lg:flex flex-col gap-0.5 text-coal-500 flex-shrink-0
        ${isRunning ? 'opacity-30' : 'group-hover:text-coal-400'}
      `}>
        <div className="flex gap-0.5">
          <div className="w-1 h-1 rounded-full bg-current" />
          <div className="w-1 h-1 rounded-full bg-current" />
        </div>
        <div className="flex gap-0.5">
          <div className="w-1 h-1 rounded-full bg-current" />
          <div className="w-1 h-1 rounded-full bg-current" />
        </div>
        <div className="flex gap-0.5">
          <div className="w-1 h-1 rounded-full bg-current" />
          <div className="w-1 h-1 rounded-full bg-current" />
        </div>
      </div>

      {/* Step Number */}
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-coal-800 flex items-center justify-center text-xs font-mono text-coal-400 flex-shrink-0">
        {index + 1}
      </div>

      {/* Icon */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-coal-800 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm sm:text-base font-medium text-coal-200 truncate">{step.label}</h4>
        <p className="text-xs text-coal-500 truncate hidden sm:block">{config.description}</p>
      </div>

      {/* Status Indicator */}
      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${statusColors[step.status]} flex-shrink-0`} />

      {/* Delete Button - Always visible on mobile */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(step.id);
        }}
        disabled={isRunning}
        className={`
          p-2 sm:p-1.5 rounded-lg transition-all duration-200 flex-shrink-0
          touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0
          flex items-center justify-center
          ${isRunning 
            ? 'opacity-30 cursor-not-allowed' 
            : 'sm:opacity-0 sm:group-hover:opacity-100 hover:bg-rose-500/20 text-coal-500 hover:text-rose-400 active:bg-rose-500/30'
          }
        `}
        title="Remove step"
      >
        <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

export default DraggableStepItem;
