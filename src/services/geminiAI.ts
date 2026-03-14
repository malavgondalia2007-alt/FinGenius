// ─── AI Service (Groq Primary + Gemini Fallback) ─────────────────────
// Shared service used by all chatbots (Main, Goals, Investments)
// Uses Groq (Llama 3.3) as primary, Gemini as fallback

// ─── Provider Configuration ──────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const getGroqApiKey = (): string => {
  return (import.meta as any).env?.VITE_GROQ_API_KEY || '';
};
const GROQ_API_KEY = getGroqApiKey();
const GROQ_MODELS = [
'llama-3.3-70b-versatile',
'llama-3.1-8b-instant',
'mixtral-8x7b-32768'];


const GEMINI_BASE_URL =
'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODELS = [
'gemini-2.0-flash',
'gemini-1.5-flash',
'gemini-1.5-flash-latest',
'gemini-pro'];

const FALLBACK_GEMINI_KEY = '';

const getGeminiApiKey = (): string => {
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  return envKey || FALLBACK_GEMINI_KEY;
};

// Track which provider/model works
let activeProvider: 'groq' | 'gemini' = 'groq';
let groqModelIndex = 0;
let geminiModelIndex = 0;

// ─── Types ───────────────────────────────────────────────────────────

interface GeminiMessage {
  role: 'user' | 'model';
  parts: {text: string;}[];
}

interface GeminiRequest {
  systemInstruction?: {parts: {text: string;}[];};
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
  };
}

// ─── Error Classification ────────────────────────────────────────────

export type GeminiErrorType =
'NO_API_KEY' |
'INVALID_API_KEY' |
'RATE_LIMITED' |
'MODEL_NOT_FOUND' |
'NETWORK_ERROR' |
'EMPTY_RESPONSE' |
'UNKNOWN';

export class GeminiError extends Error {
  type: GeminiErrorType;
  statusCode?: number;

  constructor(type: GeminiErrorType, message: string, statusCode?: number) {
    super(message);
    this.name = 'GeminiError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

function classifyHttpError(status: number, errorData: any): GeminiErrorType {
  if (status === 400) {
    const msg = JSON.stringify(errorData).toLowerCase();
    if (
    msg.includes('api key') ||
    msg.includes('api_key') ||
    msg.includes('authentication'))

    return 'INVALID_API_KEY';
    if (msg.includes('not found') || msg.includes('model'))
    return 'MODEL_NOT_FOUND';
    return 'UNKNOWN';
  }
  if (status === 401 || status === 403) return 'INVALID_API_KEY';
  if (status === 404) return 'MODEL_NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  return 'UNKNOWN';
}

export function getErrorMessage(type: GeminiErrorType): string {
  switch (type) {
    case 'NO_API_KEY':
      return '🔑 AI API key is missing. Please check your configuration.';
    case 'INVALID_API_KEY':
      return '🔑 AI API key appears to be invalid or expired. Please check your API key.';
    case 'RATE_LIMITED':
      return '⏳ API rate limit reached. Please wait a moment and try again.';
    case 'MODEL_NOT_FOUND':
      return '🤖 AI model not available. Trying alternative models...';
    case 'NETWORK_ERROR':
      return '🌐 Network error — please check your internet connection and try again.';
    case 'EMPTY_RESPONSE':
      return '🤔 The AI returned an empty response. Please try rephrasing your question.';
    default:
      return "Sorry, I'm having trouble connecting. Please try again in a moment! 🔄";
  }
}

// ─── Groq API Call ───────────────────────────────────────────────────

async function callGroqWithModel(
model: string,
systemPrompt: string,
conversationHistory: GeminiMessage[])
: Promise<string> {
  // Convert Gemini message format to OpenAI format
  const messages: {role: string;content: string;}[] = [
  { role: 'system', content: systemPrompt }];


  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts.map((p) => p.text).join('')
    });
  }

  let response: Response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9
      })
    });
  } catch (networkErr) {
    throw new GeminiError('NETWORK_ERROR', `Network error: ${networkErr}`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorType = classifyHttpError(response.status, errorData);
    console.error(`Groq API error [${model}]:`, response.status, errorData);
    throw new GeminiError(
      errorType,
      `Groq API error ${response.status}: ${JSON.stringify(errorData)}`,
      response.status
    );
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';

  if (!text) {
    throw new GeminiError('EMPTY_RESPONSE', 'Empty response from Groq');
  }

  return text;
}

// ─── Gemini API Call ─────────────────────────────────────────────────

async function callGeminiWithModel(
model: string,
systemPrompt: string,
conversationHistory: GeminiMessage[],
apiKey: string)
: Promise<string> {
  const request: GeminiRequest = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: conversationHistory,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      topP: 0.9
    }
  };

  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  } catch (networkErr) {
    throw new GeminiError('NETWORK_ERROR', `Network error: ${networkErr}`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorType = classifyHttpError(response.status, errorData);
    console.error(`Gemini API error [${model}]:`, response.status, errorData);
    throw new GeminiError(
      errorType,
      `Gemini API error ${response.status}: ${JSON.stringify(errorData)}`,
      response.status
    );
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!text) {
    throw new GeminiError('EMPTY_RESPONSE', 'Empty response from Gemini');
  }

  return text;
}

// ─── Try a provider with model fallback ──────────────────────────────

async function tryGroq(
systemPrompt: string,
conversationHistory: GeminiMessage[])
: Promise<string> {
  for (let i = groqModelIndex; i < GROQ_MODELS.length; i++) {
    const model = GROQ_MODELS[i];
    try {
      console.log(`🚀 Trying Groq model: ${model}`);
      const result = await callGroqWithModel(
        model,
        systemPrompt,
        conversationHistory
      );
      groqModelIndex = i;
      console.log(`✅ Success with Groq: ${model}`);
      return result;
    } catch (error) {
      if (error instanceof GeminiError) {
        if (
        error.type === 'INVALID_API_KEY' ||
        error.type === 'NETWORK_ERROR')
        {
          throw error; // Don't retry these
        }
        if (error.type === 'RATE_LIMITED') {
          throw error;
        }
        console.warn(`⚠️ Groq ${model} failed (${error.type}), trying next...`);
        continue;
      }
      throw error;
    }
  }
  groqModelIndex = 0;
  throw new GeminiError('MODEL_NOT_FOUND', 'All Groq models failed');
}

async function tryGemini(
systemPrompt: string,
conversationHistory: GeminiMessage[])
: Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new GeminiError('NO_API_KEY', 'No Gemini API key available');
  }

  for (let i = geminiModelIndex; i < GEMINI_MODELS.length; i++) {
    const model = GEMINI_MODELS[i];
    try {
      console.log(`🤖 Trying Gemini model: ${model}`);
      const result = await callGeminiWithModel(
        model,
        systemPrompt,
        conversationHistory,
        apiKey
      );
      geminiModelIndex = i;
      console.log(`✅ Success with Gemini: ${model}`);
      return result;
    } catch (error) {
      if (error instanceof GeminiError) {
        if (error.type === 'INVALID_API_KEY' || error.type === 'NO_API_KEY') {
          throw error;
        }
        if (error.type === 'RATE_LIMITED' || error.type === 'NETWORK_ERROR') {
          throw error;
        }
        console.warn(
          `⚠️ Gemini ${model} failed (${error.type}), trying next...`
        );
        continue;
      }
      throw error;
    }
  }
  geminiModelIndex = 0;
  throw new GeminiError('MODEL_NOT_FOUND', 'All Gemini models failed');
}

// ─── Main API Call (Groq → Gemini fallback) ──────────────────────────

export async function callGemini(
systemPrompt: string,
conversationHistory: GeminiMessage[])
: Promise<string> {
  // Try Groq first (primary provider)
  try {
    console.log('🔄 Attempting Groq (primary)...');
    const result = await tryGroq(systemPrompt, conversationHistory);
    activeProvider = 'groq';
    return result;
  } catch (groqError) {
    console.warn('⚠️ Groq failed, falling back to Gemini...', groqError);
  }

  // Fall back to Gemini
  try {
    console.log('🔄 Attempting Gemini (fallback)...');
    const result = await tryGemini(systemPrompt, conversationHistory);
    activeProvider = 'gemini';
    return result;
  } catch (geminiError) {
    console.error('❌ Both providers failed:', geminiError);
    if (geminiError instanceof GeminiError) {
      throw geminiError;
    }
    throw new GeminiError(
      'UNKNOWN',
      'All AI providers failed. Please try again later.'
    );
  }
}

// ─── Helper: Build conversation history ─────────────────────────────

export function buildHistory(
messages: {text: string;sender: 'user' | 'bot';}[])
: GeminiMessage[] {
  return messages.
  filter((m) => m.text && m.text.trim()).
  map((m) => ({
    role: m.sender === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: m.text }]
  }));
}

// ─── System Prompts ─────────────────────────────────────────────────

export function buildFinancialSystemPrompt(context: {
  userName: string;
  monthlyIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  essentialTotal: number;
  nonEssentialTotal: number;
  categoryBreakdown: Record<string, number>;
  activeGoals: {
    name: string;
    targetAmount: number;
    savedAmount: number;
    deadline: string;
  }[];
  topCategory: {name: string;amount: number;} | null;
  age?: number;
  profileType?: string;
  loans?: Record<string, number>;
}): string {
  const goalsText =
  context.activeGoals.length > 0 ?
  context.activeGoals.
  map(
    (g) =>
    `- ${g.name}: ₹${g.savedAmount.toLocaleString()} saved of ₹${g.targetAmount.toLocaleString()} target, deadline ${g.deadline}`
  ).
  join('\n') :
  'No active goals';

  const categoryText = Object.entries(context.categoryBreakdown).
  sort((a, b) => b[1] - a[1]).
  slice(0, 8).
  map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString()}`).
  join('\n');

  const loansText = context.loans ?
  Object.entries(context.loans).
  filter(([_, amt]) => amt > 0).
  map(([type, amt]) => `- ${type}: ₹${amt.toLocaleString()}/month`).
  join('\n') || 'No loans' :
  'Unknown';

  return `You are FinGenius AI, a smart personal finance assistant for Indian users. You are warm, encouraging, and knowledgeable about Indian financial products (SIPs, mutual funds, PPF, NPS, ELSS, FDs, etc.).

IMPORTANT RULES:
- Always respond in plain text (no markdown bold/italic syntax like ** or *)
- Use emojis sparingly for warmth
- Keep responses concise (under 200 words unless detailed analysis is asked)
- Use ₹ for currency, Indian number formatting (lakhs, crores)
- Give personalized advice based on the user's ACTUAL data below
- Be empathetic if user is stressed about money
- Never give specific stock picks or guarantee returns
- Mention that investments are subject to market risks when discussing investments

USER PROFILE:
- Name: ${context.userName}
- Age: ${context.age || 'Unknown'}
- Type: ${context.profileType || 'Unknown'}
- Monthly Income: ₹${context.monthlyIncome.toLocaleString()}

FINANCIAL SNAPSHOT:
- Total Expenses: ₹${context.totalExpenses.toLocaleString()}
- Net Savings: ₹${context.netSavings.toLocaleString()}
- Savings Rate: ${context.savingsRate}%
- Essential Spending: ₹${context.essentialTotal.toLocaleString()}
- Non-Essential Spending: ₹${context.nonEssentialTotal.toLocaleString()}
- Top Expense Category: ${context.topCategory ? `${context.topCategory.name} (₹${context.topCategory.amount.toLocaleString()})` : 'None'}

EXPENSE BREAKDOWN:
${categoryText || 'No expenses recorded'}

ACTIVE GOALS:
${goalsText}

LOANS/EMIs:
${loansText}

Respond naturally to the user's questions using this data. If they ask about something not in the data, give general Indian financial advice.`;
}

export function buildGoalSystemPrompt(context: {
  goalName: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  category: string;
  monthlyRequired: number;
  monthsRemaining: number;
  savingsCapacity: number;
  userName?: string;
}): string {
  const progress = Math.round(
    context.savedAmount / context.targetAmount * 100
  );
  const isOnTrack = context.monthlyRequired <= context.savingsCapacity;

  return `You are a Goal Planning Assistant for FinGenius, an Indian personal finance app. You help users achieve their financial goals.

IMPORTANT RULES:
- Respond in plain text (no markdown bold/italic like ** or *)
- Keep responses concise and actionable (under 150 words)
- Use ₹ for currency
- Be encouraging and supportive
- Suggest practical strategies to reach the goal faster
- If user asks about investments, suggest they check the Investment Guidance section for detailed fund recommendations

CURRENT GOAL:
- Goal: ${context.goalName}
- Category: ${context.category}
- Target: ₹${context.targetAmount.toLocaleString()}
- Saved: ₹${context.savedAmount.toLocaleString()} (${progress}%)
- Remaining: ₹${(context.targetAmount - context.savedAmount).toLocaleString()}
- Deadline: ${context.deadline}
- Months Left: ${context.monthsRemaining}
- Monthly Required: ₹${Math.round(context.monthlyRequired).toLocaleString()}
- Monthly Savings Capacity: ₹${Math.round(context.savingsCapacity).toLocaleString()}
- On Track: ${isOnTrack ? 'Yes' : 'No - needs more savings or timeline extension'}

Help the user with tips, timeline adjustments, and motivation for this specific goal.`;
}

export function buildInvestmentSystemPrompt(context: {
  age: number;
  monthlyIncome: number;
  savingsCapacity: number;
  riskTolerance?: string;
  userName?: string;
}): string {
  const riskProfile =
  context.riskTolerance || (
  context.age < 30 ?
  'aggressive' :
  context.age < 45 ?
  'moderate' :
  'conservative');

  return `You are an Investment Guidance Assistant for FinGenius, an Indian personal finance app. You help users understand and plan investments.

IMPORTANT RULES:
- Respond in plain text (no markdown bold/italic like ** or *)
- Keep responses informative but concise (under 200 words)
- Use ₹ for currency, Indian number formatting
- Focus on Indian investment products: SIPs, Mutual Funds, Stocks (NSE/BSE), PPF, NPS, ELSS, FDs, Gold (SGBs, ETFs)
- Always mention "investments are subject to market risks" when recommending
- Never guarantee specific returns
- Suggest diversification
- For beginners, recommend index funds and SIPs as starting point

INVESTOR PROFILE:
- Age: ${context.age}
- Monthly Income: ₹${context.monthlyIncome.toLocaleString()}
- Available for Investment: ~₹${Math.round(context.savingsCapacity).toLocaleString()}/month
- Risk Profile: ${riskProfile}
- Suggested Equity Allocation: ${100 - context.age}% (age-based rule)

Help the user understand investment options, compare products, plan SIPs, and build wealth. Be educational and practical.`;
}