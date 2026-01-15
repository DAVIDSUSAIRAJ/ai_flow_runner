import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { FlowStep, StepStatus, STEP_CONFIGS, StepType } from '../types';
import { 
  processStepWithAI, 
  formatEmotionResult, 
  formatCategoryResult,
  generateContextAwareQuote,
  ChatHistory,
  ChatMessage 
} from '../services/aiAgent';

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
  n8nResults?: any; // N8N response for comparison
  n8nEnabled?: boolean; // Track if N8N was enabled during execution
};

type FlowState = {
  input: string;
  steps: FlowStep[];
  isRunning: boolean;
  showResults: boolean;
  results: FlowResult | null;
  selectedLanguage: string;
  chatHistory: ChatHistory;
  n8nEnabled: boolean;
  setInput: (value: string) => void;
  setSteps: (steps: FlowStep[]) => void;
  updateStepStatus: (id: string, status: StepStatus) => void;
  deleteStep: (id: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  resetAllStatuses: () => void;
  closeResults: () => void;
  setSelectedLanguage: (lang: string) => void;
  addToChatHistory: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  setN8nEnabled: (enabled: boolean) => void;
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

// Note: Simulated functions removed - now using AI agent service

// Function to get or create session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('aiflow_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('aiflow_session_id', sessionId);
  }
  return sessionId;
};

// Function to send data to n8n webhook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendToN8N = async (input: any, language: string) => {
  try {
    const response = await fetch('https://n8n-t2i5.onrender.com/webhook-test/ai-runnner-flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInput: input,
        sessionId: getSessionId(),
        language: language,
      }),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.statusText}`);
    }

   let data = await response.json();
    // Temporary mock data - remove when N8N is ready
    data = {
      input: "I was very good",
      language: "en",
      clean_text: "I was very good.",
      detect_emotion: "Happy",
      categorize_text: "Personal & General",
      summarize: "The speaker expresses positive self-assessment. They feel they were very good.",
      translate: "Keep up that positive energy! Your good work makes a difference."
    };
    
    return data;
  } catch (error) {
    console.error('Error sending to N8N:', error);
    // Don't throw error - allow flow to continue even if webhook fails
    return null;
  }
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
  chatHistory: [],
  n8nEnabled: true,

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

  addToChatHistory: (message: ChatMessage) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, message],
    })),

  clearChatHistory: () => set({ chatHistory: [] }),

  setN8nEnabled: (enabled: boolean) => set({ n8nEnabled: enabled }),

  runFlow: async () => {
    const { steps, input, updateStepStatus, selectedLanguage, chatHistory, addToChatHistory, n8nEnabled } = get();
    
    if (!input.trim() || steps.length === 0) return;
    
    set({ isRunning: true, showResults: false, results: null });
    
    // Reset all statuses first
    get().resetAllStatuses();
    
    // Send data to n8n webhook only if enabled
    let n8nResponse = null;
    if (n8nEnabled) {
      n8nResponse = await sendToN8N(input, selectedLanguage);
    }
    
    // Add user input to chat history
    addToChatHistory({ role: 'user', content: input });
    
    const stepResults: StepResult[] = [];
    let processedText = input;
    let detectedEmotion = 'neutral';
    let category = 'General';
    let summary = input;
    let currentHistory: ChatHistory = [...chatHistory];

    try {
      // Run each step sequentially with AI agent
      for (const step of steps) {
        updateStepStatus(step.id, 'running');
        
        try {
          // Process step with AI agent
          const aiResponse = await processStepWithAI(
            step.type,
            processedText,
            selectedLanguage,
            currentHistory
          );
          
          let output = '';
          
          // Process based on step type
          switch (step.type) {
            case 'clean_text':
              processedText = aiResponse.trim();
              output = processedText;
              break;
            
            case 'detect_emotion':
              detectedEmotion = formatEmotionResult(aiResponse).toLowerCase();
              output = formatEmotionResult(aiResponse);
              break;
            
            case 'categorize_text':
              category = formatCategoryResult(aiResponse);
              output = category;
              break;
            
            case 'summarize':
              // Generate short mindset summary
              const mindsetPrompt = `User said: "${processedText}"

Provide a brief 1-2 sentence summary focusing on:
- What mindset/emotional state the user is in
- What they're feeling or thinking

Keep it short and focused on their mental/emotional state.`;
              
              const mindsetResponse = await processStepWithAI(
                'summarize',
                mindsetPrompt,
                selectedLanguage,
                currentHistory
              );
              summary = mindsetResponse.trim();
              output = summary;
              processedText = summary; // Update processed text for next steps
              break;
            
            case 'translate':
              // Generate motivational quote based on emotion
              const motivationalQuotePrompt = `User said: "${processedText}"
Their emotion: ${detectedEmotion}
Category: ${category}

Generate a short, meaningful motivational quote or supportive message that addresses their situation.
Keep it concise (1-2 sentences). Make it encouraging and uplifting.`;
              
              const motivationalResponse = await processStepWithAI(
                'translate',
                motivationalQuotePrompt,
                selectedLanguage,
                currentHistory
              );
              processedText = motivationalResponse.trim();
              output = processedText;
              break;
            
            default:
              output = aiResponse;
          }

          stepResults.push({ stepType: step.type, output });
          
          // Add AI response to chat history
          addToChatHistory({ role: 'assistant', content: output });
          currentHistory = get().chatHistory;
          
          updateStepStatus(step.id, 'done');
          
        } catch (error) {
          console.error(`Error processing step ${step.type}:`, error);
          stepResults.push({ 
            stepType: step.type, 
            output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
          });
          updateStepStatus(step.id, 'error');
          
          // Stop flow on error
          set({ isRunning: false });
          return;
        }
      }
      
      // Generate context-aware quote using AI
      let quote = '';
      let quoteAuthor = '';
      
      try {
        // Try to generate dynamic, context-aware quote from AI
        const aiQuote = await generateContextAwareQuote(
          input,
          detectedEmotion,
          category,
          selectedLanguage
        );
        quote = aiQuote.quote;
        quoteAuthor = aiQuote.author;
      } catch (error) {
        console.error('Error generating AI quote, falling back to static quotes:', error);
        
        // Fallback to static quotes if AI generation fails
        const multilingualQuotes = MULTILINGUAL_QUOTES[detectedEmotion]?.[selectedLanguage];
        const englishQuotes = EMOTION_QUOTES[detectedEmotion] || EMOTION_QUOTES.neutral;
        const quotes = multilingualQuotes || englishQuotes;
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quote = randomQuote.quote;
        quoteAuthor = randomQuote.author;
      }

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
          quote,
          quoteAuthor,
          n8nResults: n8nResponse,
          n8nEnabled: n8nEnabled,
        },
      });
      
    } catch (error) {
      console.error('Flow execution error:', error);
      set({ isRunning: false });
    }
  },
}));
