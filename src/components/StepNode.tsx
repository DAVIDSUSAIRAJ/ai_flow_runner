import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { StepStatus, STEP_CONFIGS, StepType } from '../types';

type StepNodeData = {
  label: string;
  type: StepType;
  status: StepStatus;
};

const statusConfig: Record<StepStatus, { color: string; bgColor: string; label: string; animate?: boolean }> = {
  idle: {
    color: 'text-coal-400',
    bgColor: 'bg-coal-700',
    label: 'Idle',
  },
  running: {
    color: 'text-azure-400',
    bgColor: 'bg-azure-500/20',
    label: 'Running',
    animate: true,
  },
  done: {
    color: 'text-mint-400',
    bgColor: 'bg-mint-500/20',
    label: 'Done',
  },
  error: {
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    label: 'Error',
  },
};

function StepNode({ data }: NodeProps<StepNodeData>) {
  const config = STEP_CONFIGS[data.type];
  const status = statusConfig[data.status];

  return (
    <div
      className={`
        relative bg-coal-900 border-2 rounded-2xl p-4 min-w-[180px]
        transition-all duration-300 animate-fade-in
        ${data.status === 'running' 
          ? 'border-azure-500 shadow-lg shadow-azure-500/20' 
          : data.status === 'done'
            ? 'border-mint-500/50'
            : data.status === 'error'
              ? 'border-rose-500/50'
              : 'border-coal-700 hover:border-coal-600'
        }
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-coal-600 !border-2 !border-coal-500 hover:!bg-ember-500 hover:!border-ember-400 transition-colors"
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center text-xl
          ${data.status === 'running' 
            ? 'bg-azure-500/20' 
            : data.status === 'done'
              ? 'bg-mint-500/20'
              : data.status === 'error'
                ? 'bg-rose-500/20'
                : 'bg-coal-800'
          }
        `}>
          {config.icon}
        </div>
        <div>
          <h3 className="font-semibold text-coal-100 text-sm">{data.label}</h3>
          <p className="text-xs text-coal-500 max-w-[120px] truncate">{config.description}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
        ${status.bgColor} ${status.color}
        ${status.animate ? 'status-running' : ''}
      `}>
        {data.status === 'running' && (
          <div className="w-1.5 h-1.5 rounded-full bg-azure-400 animate-pulse" />
        )}
        {data.status === 'done' && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {data.status === 'error' && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {status.label}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-coal-600 !border-2 !border-coal-500 hover:!bg-ember-500 hover:!border-ember-400 transition-colors"
      />

      {/* Running glow effect */}
      {data.status === 'running' && (
        <div className="absolute inset-0 rounded-2xl bg-azure-500/5 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}

export default memo(StepNode);

