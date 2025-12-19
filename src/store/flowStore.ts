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
  selectedLanguage: string;
  setInput: (value: string) => void;
  setSteps: (steps: FlowStep[]) => void;
  updateStepStatus: (id: string, status: StepStatus) => void;
  deleteStep: (id: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  resetAllStatuses: () => void;
  closeResults: () => void;
  setSelectedLanguage: (lang: string) => void;
  runFlow: () => Promise<void>;
};

// Quotes based on emotion - English
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

// Multilingual quotes
const MULTILINGUAL_QUOTES: Record<string, Record<string, { quote: string; author: string }[]>> = {
  stressed: {
    ta: [
      { quote: "கடினமான நேரங்களில் வாய்ப்பு உள்ளது.", author: "Albert Einstein" },
      { quote: "மன அழுத்தத்தை எதிர்கொள்ள சிறந்த ஆயுதம் நம் எண்ணங்களைத் தேர்ந்தெடுக்கும் திறன்.", author: "William James" },
    ],
    hi: [
      { quote: "कठिनाई के बीच में अवसर होता है.", author: "Albert Einstein" },
      { quote: "तनाव के खिलाफ सबसे बड़ा हथियार हमारी सोच चुनने की क्षमता है.", author: "William James" },
    ],
    es: [
      { quote: "En medio de la dificultad yace la oportunidad.", author: "Albert Einstein" },
      { quote: "El mayor arma contra el estrés es nuestra capacidad de elegir un pensamiento sobre otro.", author: "William James" },
    ],
  },
  happy: {
    ta: [
      { quote: "மகிழ்ச்சி என்பது தயாராக கிடைக்கும் ஒன்றல்ல. அது உங்கள் செயல்களிலிருந்து வருகிறது.", author: "Dalai Lama" },
      { quote: "நம் வாழ்க்கையின் நோக்கம் மகிழ்ச்சியாக இருக்க வேண்டும்.", author: "Dalai Lama" },
    ],
    hi: [
      { quote: "खुशी तैयार नहीं मिलती, यह आपके कार्यों से आती है.", author: "Dalai Lama" },
      { quote: "हमारे जीवन का उद्देश्य खुश रहना है.", author: "Dalai Lama" },
    ],
    es: [
      { quote: "La felicidad no es algo ya hecho. Viene de tus propias acciones.", author: "Dalai Lama" },
      { quote: "El propósito de nuestras vidas es ser felices.", author: "Dalai Lama" },
    ],
  },
  sad: {
    ta: [
      { quote: "ஒவ்வொரு நாளும் நல்லதாக இருக்காது, ஆனால் ஒவ்வொரு நாளிலும் நல்லது ஒன்று இருக்கும்.", author: "Alice Morse Earle" },
      { quote: "நட்சத்திரங்கள் இருளில்லாமல் பிரகாசிக்க முடியாது.", author: "D.H. Sidebottom" },
    ],
    hi: [
      { quote: "हर दिन अच्छा नहीं हो सकता, लेकिन हर दिन में कुछ अच्छा होता है.", author: "Alice Morse Earle" },
      { quote: "तारे अंधकार के बिना चमक नहीं सकते.", author: "D.H. Sidebottom" },
    ],
    es: [
      { quote: "No todos los días pueden ser buenos, pero hay algo bueno en cada día.", author: "Alice Morse Earle" },
      { quote: "Las estrellas no pueden brillar sin oscuridad.", author: "D.H. Sidebottom" },
    ],
  },
  angry: {
    ta: [
      { quote: "நீங்கள் கோபமாக இருக்கும் ஒவ்வொரு நிமிடமும், நீங்கள் அமைதியின் அறுபது வினாடிகளை இழக்கிறீர்கள்.", author: "Ralph Waldo Emerson" },
      { quote: "கோபத்தை வைத்திருப்பது விஷத்தை குடித்து மற்றவர் இறக்க எதிர்பார்ப்பது போன்றது.", author: "Buddha" },
    ],
    hi: [
      { quote: "आप जितने मिनट क्रोधित रहते हैं, उतने ही मिनट शांति खो देते हैं.", author: "Ralph Waldo Emerson" },
      { quote: "क्रोध को पकड़े रखना जहर पीकर दूसरे के मरने की उम्मीद करने जैसा है.", author: "Buddha" },
    ],
    es: [
      { quote: "Por cada minuto que permaneces enojado, renuncias a sesenta segundos de paz mental.", author: "Ralph Waldo Emerson" },
      { quote: "Aferrarse a la ira es como beber veneno y esperar que la otra persona muera.", author: "Buddha" },
    ],
  },
  neutral: {
    ta: [
      { quote: "சிறந்த வேலையைச் செய்ய ஒரே வழி, நீங்கள் செய்வதை நேசிப்பது.", author: "Steve Jobs" },
      { quote: "வாழ்க்கை என்பது நீங்கள் வேறு திட்டங்களை உருவாக்கும்போது நடக்கும் விஷயம்.", author: "John Lennon" },
    ],
    hi: [
      { quote: "महान काम करने का एकमात्र तरीका है कि आप जो करते हैं उसे प्यार करें.", author: "Steve Jobs" },
      { quote: "जीवन वह है जो तब होता है जब आप अन्य योजनाएं बना रहे होते हैं.", author: "John Lennon" },
    ],
    es: [
      { quote: "La única forma de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
      { quote: "La vida es lo que sucede mientras estás ocupado haciendo otros planes.", author: "John Lennon" },
    ],
  },
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

// Language names mapping
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
  ar: 'Arabic',
  pt: 'Portuguese',
};

// Simulated translation
const translateText = (text: string, targetLang: string): string => {
  // Simulate translation - in real app, this would call translation API
  const langName = LANGUAGE_NAMES[targetLang] || 'English';
  return `[Translated to ${langName}] ${text}`;
};

// Initialize with default steps
const createDefaultSteps = (): FlowStep[] => [
  { id: uuid(), type: 'clean_text', label: STEP_CONFIGS.clean_text.label, status: 'idle' },
  { id: uuid(), type: 'detect_emotion', label: STEP_CONFIGS.detect_emotion.label, status: 'idle' },
  { id: uuid(), type: 'categorize_text', label: STEP_CONFIGS.categorize_text.label, status: 'idle' },
  { id: uuid(), type: 'summarize', label: STEP_CONFIGS.summarize.label, status: 'idle' },
  { id: uuid(), type: 'translate', label: STEP_CONFIGS.translate.label, status: 'idle' },
];

export const useFlowStore = create<FlowState>((set, get) => ({
  input: '',
  steps: createDefaultSteps(),
  isRunning: false,
  showResults: false,
  results: null,
  selectedLanguage: 'en',

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

  setSelectedLanguage: (lang: string) => set({ selectedLanguage: lang }),

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
        case 'translate':
          cleanedText = translateText(cleanedText, get().selectedLanguage);
          output = cleanedText;
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
    
    // Get a random quote based on emotion and selected language
    const { selectedLanguage } = get();
    const multilingualQuotes = MULTILINGUAL_QUOTES[detectedEmotion]?.[selectedLanguage];
    const englishQuotes = EMOTION_QUOTES[detectedEmotion] || EMOTION_QUOTES.neutral;
    const quotes = multilingualQuotes || englishQuotes;
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
