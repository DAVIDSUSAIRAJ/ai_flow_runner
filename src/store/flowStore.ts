import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { FlowStep, StepStatus, STEP_CONFIGS, StepType } from '../types';

// Simulated AI results for demo
type StepResult = {
  stepType: StepType;
  output: string;
};

type FlowResult = {
  originalInput: string;
  stepResults: StepResult[];
  detectedEmotion: string;
  category: string;
  summary: string;
  quote: string;
  quoteAuthor: string;
};

type FlowState = {
  input: string;
  steps: FlowStep[];
  isRunning: boolean;
  showResults: boolean;
  results: FlowResult | null;
  setInput: (value: string) => void;
  setSteps: (steps: FlowStep[]) => void;
  updateStepStatus: (id: string, status: StepStatus) => void;
  deleteStep: (id: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  resetAllStatuses: () => void;
  closeResults: () => void;
  runFlow: () => Promise<void>;
};

// Quotes based on emotion
const EMOTION_QUOTES: Record<string, { quote: string; author: string }[]> = {
  stressed: [
    { quote: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
    { quote: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
    { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  ],
  happy: [
    { quote: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
    { quote: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
    { quote: "Keep your face always toward the sunshine, and shadows will fall behind you.", author: "Walt Whitman" },
  ],
  sad: [
    { quote: "Every day may not be good, but there's something good in every day.", author: "Alice Morse Earle" },
    { quote: "The sun himself is weak when he first rises, and gathers strength as the day goes on.", author: "Charles Dickens" },
    { quote: "Stars can't shine without darkness.", author: "D.H. Sidebottom" },
  ],
  angry: [
    { quote: "For every minute you remain angry, you give up sixty seconds of peace of mind.", author: "Ralph Waldo Emerson" },
    { quote: "Speak when you are angry and you will make the best speech you will ever regret.", author: "Ambrose Bierce" },
    { quote: "Holding onto anger is like drinking poison and expecting the other person to die.", author: "Buddha" },
  ],
  neutral: [
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { quote: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  ],
};

// Simulated emotion detection
const detectEmotionFromText = (text: string): string => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('stress') || lowerText.includes('overwhelm') || lowerText.includes('anxious') || lowerText.includes('worried')) {
    return 'stressed';
  }
  if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || lowerText.includes('great')) {
    return 'happy';
  }
  if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('down') || lowerText.includes('lonely')) {
    return 'sad';
  }
  if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('annoyed') || lowerText.includes('hate')) {
    return 'angry';
  }
  return 'neutral';
};

// Simulated category detection
const detectCategoryFromText = (text: string): string => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('boss') || lowerText.includes('office')) {
    return 'Work & Career';
  }
  if (lowerText.includes('family') || lowerText.includes('parent') || lowerText.includes('child') || lowerText.includes('spouse')) {
    return 'Family & Relationships';
  }
  if (lowerText.includes('health') || lowerText.includes('sick') || lowerText.includes('doctor') || lowerText.includes('exercise')) {
    return 'Health & Wellness';
  }
  if (lowerText.includes('money') || lowerText.includes('finance') || lowerText.includes('debt') || lowerText.includes('salary')) {
    return 'Finance & Money';
  }
  return 'Personal & General';
};

// Simulated text cleaning
const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?'-]/g, '')
    .trim();
};

// Simulated summary
const summarizeText = (text: string): string => {
  const words = text.split(' ');
  if (words.length <= 10) return text;
  return words.slice(0, 10).join(' ') + '...';
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
  showResults: false,
  results: null,

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

  closeResults: () => set({ showResults: false }),

  runFlow: async () => {
    const { steps, input, updateStepStatus } = get();
    
    if (!input.trim() || steps.length === 0) return;
    
    set({ isRunning: true, showResults: false, results: null });
    
    // Reset all statuses first
    get().resetAllStatuses();
    
    const stepResults: StepResult[] = [];
    let cleanedText = input;
    let detectedEmotion = 'neutral';
    let category = 'General';
    let summary = input;

    // Simulate running each step sequentially
    for (const step of steps) {
      updateStepStatus(step.id, 'running');
      
      // Simulate API call delay (1-2 seconds per step)
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      // Process based on step type
      let output = '';
      switch (step.type) {
        case 'clean_text':
          cleanedText = cleanText(input);
          output = cleanedText;
          break;
        case 'detect_emotion':
          detectedEmotion = detectEmotionFromText(cleanedText);
          output = `Detected: ${detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1)}`;
          break;
        case 'categorize_text':
          category = detectCategoryFromText(cleanedText);
          output = category;
          break;
        case 'summarize':
          summary = summarizeText(cleanedText);
          output = summary;
          break;
      }

      stepResults.push({ stepType: step.type, output });
      
      // 95% success rate for demo (was 90%)
      const success = Math.random() > 0.05;
      updateStepStatus(step.id, success ? 'done' : 'error');
      
      // If a step fails, stop the flow
      if (!success) {
        set({ isRunning: false });
        return;
      }
    }
    
    // Get a random quote based on emotion
    const quotes = EMOTION_QUOTES[detectedEmotion] || EMOTION_QUOTES.neutral;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Set results
    set({
      isRunning: false,
      showResults: true,
      results: {
        originalInput: input,
        stepResults,
        detectedEmotion,
        category,
        summary,
        quote: randomQuote.quote,
        quoteAuthor: randomQuote.author,
      },
    });
  },
}));
