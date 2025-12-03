export type StepStatus = 'idle' | 'running' | 'done' | 'error';

export type StepType = 'clean_text' | 'detect_emotion' | 'categorize_text' | 'summarize';

export type FlowStep = {
  id: string;
  type: StepType;
  label: string;
  status: StepStatus;
};

export type StepConfig = {
  type: StepType;
  label: string;
  icon: string;
  description: string;
};

export const STEP_CONFIGS: Record<StepType, StepConfig> = {
  clean_text: {
    type: 'clean_text',
    label: 'Clean Text',
    icon: '✨',
    description: 'Remove noise, fix typos, normalize formatting',
  },
  detect_emotion: {
    type: 'detect_emotion',
    label: 'Detect Emotion',
    icon: '🎭',
    description: 'Analyze emotional tone and sentiment',
  },
  categorize_text: {
    type: 'categorize_text',
    label: 'Categorize',
    icon: '🏷️',
    description: 'Classify text into categories',
  },
  summarize: {
    type: 'summarize',
    label: 'Summarize',
    icon: '📝',
    description: 'Generate a concise summary',
  },
};

