import { useCallback } from 'react';
import { useFlowStore } from '../store/flowStore';
import DraggableStepItem from './DraggableStepItem';

function ExecutionOrderPanel() {
  const { steps, reorderSteps, deleteStep, isRunning, resetAllStatuses } = useFlowStore();

  const moveStep = useCallback(
    (fromIndex: number, toIndex: number) => {
      reorderSteps(fromIndex, toIndex);
    },
    [reorderSteps]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteStep(id);
    },
    [deleteStep]
  );

  const handleReset = () => {
    resetAllStatuses();
  };

  const completedCount = steps.filter((s) => s.status === 'done').length;
  const hasErrors = steps.some((s) => s.status === 'error');
  const allDone = completedCount === steps.length && steps.length > 0;

  return (
    <div className="h-full flex flex-col bg-coal-950">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-coal-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm sm:text-base font-semibold text-coal-200">Execution Order</h2>
          {steps.length > 0 && (
            <span className="text-xs text-coal-500 bg-coal-800 px-2 py-0.5 rounded-full">
              {steps.length} step{steps.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-xs text-coal-500">
          <span className="hidden lg:inline">Drag to reorder • </span>
          <span className="lg:hidden">Use ↑↓ buttons to reorder • </span>
          Steps run top to bottom
        </p>
      </div>

      {/* Progress */}
      {steps.length > 0 && (
        <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-coal-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-coal-400">Progress</span>
            <span className="text-xs font-mono text-coal-300">
              {completedCount}/{steps.length}
            </span>
          </div>
          <div className="h-1.5 bg-coal-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                hasErrors ? 'bg-rose-500' : allDone ? 'bg-mint-500' : 'bg-ember-500'
              }`}
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
          {allDone && !hasErrors && (
            <p className="text-xs text-mint-400 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              All steps completed!
            </p>
          )}
          {hasErrors && (
            <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Flow stopped due to error
            </p>
          )}
        </div>
      )}

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
        {steps.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-coal-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-coal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-coal-400 mb-1">No steps yet</p>
              <p className="text-xs text-coal-600">All steps have been removed</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step, index) => (
              <DraggableStepItem
                key={step.id}
                step={step}
                index={index}
                moveStep={moveStep}
                onDelete={handleDelete}
                isRunning={isRunning}
                totalSteps={steps.length}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {steps.length > 0 && (completedCount > 0 || hasErrors) && !isRunning && (
        <div className="p-3 sm:p-4 border-t border-coal-800 flex-shrink-0">
          <button
            onClick={handleReset}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-sm font-medium
                     bg-coal-800 text-coal-300 hover:bg-coal-700 hover:text-coal-200
                     transition-all duration-200 flex items-center justify-center gap-2
                     touch-manipulation min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset All Steps
          </button>
        </div>
      )}

      {/* Tips - Hidden on mobile */}
      <div className="hidden sm:block p-3 sm:p-4 border-t border-coal-800 bg-coal-900/50 flex-shrink-0">
        <div className="text-xs text-coal-500 space-y-1">
          <p className="flex items-center gap-2">
            <span className="text-ember-500">💡</span>
            Tip: The execution order shown here determines how steps run
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExecutionOrderPanel;
