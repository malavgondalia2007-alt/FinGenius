import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  Component } from
'react';
import {
  X,
  Send,
  Bot,
  User,
  Brain,
  Sparkles,
  RotateCcw,
  AlertCircle } from
'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/database';
import { calculateNetSavings } from '../utils/savingsCalculations';
import { Expense, Income, Goal, UserProfile } from '../types';
import {
  callGemini,
  buildHistory,
  buildFinancialSystemPrompt,
  GeminiError,
  getErrorMessage } from
'../services/geminiAI';
// ─── Types ───────────────────────────────────────────────────────────
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
// ─── Main Component ──────────────────────────────────────────────────
export function ChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Get financial context for system prompt
  const getFinancialContext = useCallback(() => {
    if (!user) return null;
    const expenses = db.expenses.getByUserId(user.id);
    const income = db.income.getByUserId(user.id);
    const goals = db.goals.getByUserId(user.id);
    const profile = db.profiles.getByUserId(user.id);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = income.reduce((sum, i) => i.amount, 0);
    const savingsData = profile ?
    calculateNetSavings(profile, expenses, income) :
    null;
    const monthlyIncome =
    savingsData?.monthlyIncome || profile?.monthlyIncome || 0;
    const netSavings = savingsData?.netSavings || 0;
    const savingsRate =
    monthlyIncome > 0 ? Math.round(netSavings / monthlyIncome * 100) : 0;
    const categoryBreakdown: Record<string, number> = {};
    expenses.forEach((e) => {
      categoryBreakdown[e.category] =
      (categoryBreakdown[e.category] || 0) + e.amount;
    });
    const topCategoryEntry = Object.entries(categoryBreakdown).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const topCategory = topCategoryEntry ?
    {
      name: topCategoryEntry[0],
      amount: topCategoryEntry[1]
    } :
    null;
    const essentialTotal = expenses.
    filter((e) => e.type === 'essential').
    reduce((s, e) => s + e.amount, 0);
    const nonEssentialTotal = expenses.
    filter((e) => e.type === 'non-essential').
    reduce((s, e) => s + e.amount, 0);
    return {
      userName: user.name?.split(' ')[0] || 'there',
      monthlyIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      essentialTotal,
      nonEssentialTotal,
      categoryBreakdown,
      topCategory,
      activeGoals: goals.
      filter((g) => g.savedAmount < g.targetAmount).
      map((g) => ({
        name: g.name,
        targetAmount: g.targetAmount,
        savedAmount: g.savedAmount,
        deadline: g.deadline
      })),
      age: profile?.age,
      profileType: profile?.type,
      loans: profile?.loans
    };
  }, [user]);
  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const ctx = getFinancialContext();
      const name = user?.name?.split(' ')[0] || 'there';
      let greeting = `Hey ${name}! 👋 I'm your FinGenius AI assistant powered by Gemini.`;
      if (ctx && ctx.netSavings > 0) {
        greeting += ` Quick update: you have ₹${ctx.netSavings.toLocaleString()} in net savings this month. How can I help?`;
      } else if (ctx && ctx.netSavings < 0) {
        greeting += ` I noticed your expenses are running high this month. Want me to help analyze?`;
      } else {
        greeting += ` I can analyze your spending, track goals, and give personalized financial advice. What's on your mind?`;
      }
      setMessages([
      {
        id: 'init',
        text: greeting,
        sender: 'bot',
        timestamp: new Date()
      }]
      );
    }
  }, [isOpen, user, getFinancialContext]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);
  // ─── Send to Gemini AI ───────────────────────────────────────────
  const handleSend = useCallback(
    async (text: string = input) => {
      if (!text.trim() || isTyping) return;
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsTyping(true);
      try {
        const ctx = getFinancialContext();
        const systemPrompt = ctx ?
        buildFinancialSystemPrompt(ctx) :
        'You are FinGenius AI, a helpful Indian personal finance assistant. Give general financial advice since user data is not available.';
        // Build conversation history (last 10 messages for context)
        const allMessages = [...messages, userMessage];
        const recentMessages = allMessages.slice(-10);
        const history = buildHistory(
          recentMessages.map((m) => ({
            text: m.text,
            sender: m.sender
          }))
        );
        const response = await callGemini(systemPrompt, history);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error('Gemini API error:', error);
        const errorText =
        error instanceof GeminiError ?
        getErrorMessage(error.type) :
        "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄";
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: errorText,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, messages, getFinancialContext]
  );
  const handleReset = () => {
    setMessages([]);
    setTimeout(() => {
      const name = user?.name?.split(' ')[0] || 'there';
      setMessages([
      {
        id: 'init-' + Date.now(),
        text: `Fresh start! 🔄 Hey ${name}, what would you like to explore?`,
        sender: 'bot',
        timestamp: new Date()
      }]
      );
    }, 100);
  };
  return (
    <>
      {/* Floating Button */}
      {!isOpen &&
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50">

          <div className="relative">
            <Brain className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-600 animate-pulse" />
          </div>
        </button>
      }

      {/* Chat Window */}
      {isOpen &&
      <div className="fixed bottom-6 right-6 w-[92vw] sm:w-[400px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between shadow-md flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  FinGenius AI
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Powered by Groq AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
              onClick={handleReset}
              className="text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
              title="Reset conversation">

                <RotateCcw className="w-4 h-4" />
              </button>
              <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">

                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth">
            {messages.map((msg) =>
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

                {msg.sender === 'bot' &&
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0 border border-purple-200 mt-1">
                    <Bot className="w-3.5 h-3.5 text-purple-600" />
                  </div>
            }
                <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>

                  <p className="text-[13px] whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </p>
                  <p
                className={`text-[10px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>

                    {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                  </p>
                </div>
                {msg.sender === 'user' &&
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                  </div>
            }
              </div>
          )}

            {isTyping &&
          <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0 border border-purple-200 mt-1">
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{
                  animationDelay: '0ms'
                }} />

                  <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{
                  animationDelay: '150ms'
                }} />

                  <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{
                  animationDelay: '300ms'
                }} />

                </div>
              </div>
          }
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-100 rounded-b-2xl flex-shrink-0">
            <div className="p-3">
              <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                e.key === 'Enter' && !e.shiftKey && handleSend()
                }
                placeholder="Ask me anything about your finances..."
                className="flex-1 px-3 py-2 bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder:text-gray-400"
                disabled={isTyping} />

                <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-all shadow-sm">

                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-center text-gray-400 mt-1.5">
                Powered by Groq AI (Llama 3.3) • Personalized to your data
              </p>
            </div>
          </div>
        </div>
      }
    </>);

}