// AI Agent Service for handling API calls to backend

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatHistory = ChatMessage[];

// Language code mapping for API
const LANGUAGE_MAP: Record<string, string> = {
  en: 'en',
  ta: 'ta',
  hi: 'hi',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ja: 'ja',
  zh: 'zh',
  ko: 'ko',
  ar: 'ar',
  pt: 'pt',
};

/**
 * Get language code for API
 */
export const getLanguageForAPI = (language: string): string => {
  return LANGUAGE_MAP[language] || 'en';
};

/**
 * AI Agent API call
 */
export const callAIAgent = async (
  text: string,
  language: string,
  history: ChatHistory = [],
  stepType?: string
): Promise<string> => {
  try {
    const response = await fetch('https://ai-flow-runner-backend.onrender.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language: getLanguageForAPI(language),
        history: history, // Send previous conversation history
        stepType: stepType, // Send step type for prompt generation
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract response text from API response
    return data.response || data.text || data.message || JSON.stringify(data);
  } catch (error) {
    console.error('AI Agent API Error:', error);
    throw error;
  }
};

/**
 * Process text through AI agent for specific step type
 * Backend will generate the prompt based on stepType
 */
export const processStepWithAI = async (
  stepType: string,
  text: string,
  language: string,
  history: ChatHistory
): Promise<string> => {
  // Send text and stepType to backend - backend will generate the prompt
  return await callAIAgent(text, language, history, stepType);
};

/**
 * Format emotion detection result
 */
export const formatEmotionResult = (result: string): string => {
  const emotions = ['stressed', 'happy', 'sad', 'angry', 'neutral'];
  const lowerResult = result.toLowerCase().trim();
  
  // Find matching emotion
  for (const emotion of emotions) {
    if (lowerResult.includes(emotion)) {
      return emotion.charAt(0).toUpperCase() + emotion.slice(1);
    }
  }
  
  return 'Neutral';
};

/**
 * Format category result
 */
export const formatCategoryResult = (result: string): string => {
  const categories = [
    'Work & Career',
    'Family & Relationships',
    'Health & Wellness',
    'Finance & Money',
    'Personal & General',
  ];
  
  const lowerResult = result.toLowerCase().trim();
  
  // Find matching category
  for (const category of categories) {
    if (lowerResult.includes(category.toLowerCase())) {
      return category;
    }
  }
  
  return 'Personal & General';
};

/**
 * Generate a context-aware motivational quote using AI
 * Returns an object with quote and author
 */
export const generateContextAwareQuote = async (
  userInput: string,
  emotion: string,
  category: string,
  language: string
): Promise<{ quote: string; author: string }> => {
  try {
    const promptText = `Based on the user's input: "${userInput}"
Detected emotion: ${emotion}
Category: ${category}

Generate a meaningful, context-aware motivational quote that:
1. Directly relates to their specific situation and mindset
2. Matches their ${emotion} emotion
3. Is relevant to the ${category} context
4. Provides genuine encouragement and perspective
5. Is appropriate for the language: ${language}

Format your response EXACTLY as:
QUOTE: [the motivational quote]
AUTHOR: [famous author name if applicable, or "Suggested by David"]

Make it personal and meaningful, not generic.`;

    const response = await callAIAgent(promptText, language, [], 'generate_quote');
    
    // Parse the response to extract quote and author
    const quoteMatch = response.match(/QUOTE:\s*(.+?)(?=\nAUTHOR:|$)/s);
    const authorMatch = response.match(/AUTHOR:\s*(.+?)$/s);
    
    if (quoteMatch && authorMatch) {
      return {
        quote: quoteMatch[1].trim().replace(/^["']|["']$/g, ''),
        author: authorMatch[1].trim().replace(/^["']|["']$/g, ''),
      };
    }
    
    // Fallback parsing if format is different
    const lines = response.split('\n').filter(line => line.trim());
    if (lines.length >= 2) {
      return {
        quote: lines[0].replace(/^(QUOTE:|Quote:)\s*/i, '').trim().replace(/^["']|["']$/g, ''),
        author: lines[lines.length - 1].replace(/^(AUTHOR:|Author:|-)\s*/i, '').trim().replace(/^["']|["']$/g, ''),
      };
    }
    
    // If parsing fails, return the whole response as quote
    return {
      quote: response.trim(),
      author: 'Suggested by David',
    };
  } catch (error) {
    console.error('Error generating context-aware quote:', error);
    throw error;
  }
};

