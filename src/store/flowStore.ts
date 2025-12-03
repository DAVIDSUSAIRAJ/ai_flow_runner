import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { FlowStep, StepStatus, STEP_CONFIGS } from '../types';

type FlowState = {
  input: string;
  steps: FlowStep[];
  isRunning: boolean;
  setInput: (value: string) => void;
  setSteps: (steps: FlowStep[]) => void;
  updateStepStatus: (id: string, status: StepStatus) => void;
  deleteStep: (id: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  resetAllStatuses: () => void;
  runFlow: () => Promise<void>;
};

// Initialize with default steps
const createDefaultSteps = (): FlowStep[] => [
  { id: uuid(), type: 'clean_text', label: STEP_CONFIGS.clean_text.label, status: 'idle' },
  { id: uuid(), type: 'detect_emotion', label: STEP_CONFIGS.detect_emotion.label, status: 'idle' },
  { id: uuid(), type: 'categorize_text', label: STEP_CONFIGS.categorize_text.label, status: 'idle' },
  { id: uuid(), type: 'summarize', label: STEP_CONFIGS.summarize.label, status: 'idle' },
];

export const useFlowStore = create<FlowState>((set, get) => ({
  input: '',
  steps: createDefaultSteps(),
  isRunning: false,

  setInput: (value: string) => set({ input: value }),

  setSteps: (steps: FlowStep[]) => set({ steps }),

  updateStepStatus: (id: string, status: StepStatus) =>
    set((state) => ({
      steps: state.steps.map((step) =>
        step.id === id ? { ...step, status } : step
      ),
    })),

  deleteStep: (id: string) =>
    set((state) => ({
      steps: state.steps.filter((step) => step.id !== id),
    })),

  reorderSteps: (fromIndex: number, toIndex: number) =>
    set((state) => {
      const newSteps = [...state.steps];
      const [removed] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, removed);
      return { steps: newSteps };
    }),

  resetAllStatuses: () =>
    set((state) => ({
      steps: state.steps.map((step) => ({ ...step, status: 'idle' as StepStatus })),
    })),

  runFlow: async () => {
    const { steps, input, updateStepStatus } = get();
    
    if (!input.trim() || steps.length === 0) return;
    
    set({ isRunning: true });
    
    // Reset all statuses first
    get().resetAllStatuses();
    
    // Simulate running each step sequentially
    for (const step of steps) {
      updateStepStatus(step.id, 'running');
      
      // Simulate API call delay (1-2 seconds per step)
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      // Randomly succeed or fail (90% success rate for demo)
      const success = Math.random() > 0.1;
      updateStepStatus(step.id, success ? 'done' : 'error');
      
      // If a step fails, stop the flow
      if (!success) {
        set({ isRunning: false });
        return;
      }
    }
    
    set({ isRunning: false });
  },
}));

