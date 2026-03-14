import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Sparkles, Send, User, Bot, Loader2 } from 'lucide-react';
import { UserProfile, Goal } from '../types';
import {
  callGemini,
  buildHistory,
  GeminiError,
  getErrorMessage } from
'../services/geminiAI';
interface GoalsAIAssistantProps {
  profile: UserProfile | null;
  goals: Goal[];
  monthlySavings: number;
}
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}
export function GoalsAIAssistant({
  profile,
  goals,
  monthlySavings
}: GoalsAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    text: "Hello! I'm your AI Goal Assistant powered by Groq. I can help you analyze your goals, suggest savings strategies, or check if your timelines are realistic. What would you like to know?",
    sender: 'bot'
  }]
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  // Build system prompt with goals context
  const getSystemPrompt = useCallback(() => {
    const goalsText =
    goals.length > 0 ?
    goals.
    map((g) => {
      const remaining = g.targetAmount - g.savedAmount;
      const progress = Math.round(
        g.savedAmount / g.targetAmount * 100
      );
      return `- ${g.name}: ₹${g.savedAmount.toLocaleString()} saved of ₹${g.targetAmount.toLocaleString()} (${progress}%), deadline: ${g.deadline}, category: ${g.category}`;
    }).
    join('\n') :
    'No active goals set yet.';
    const totalRemaining = goals.reduce(
      (sum, g) => sum + (g.targetAmount - g.savedAmount),
      0
    );
    return `You are a Goal Planning Assistant for FinGenius, an Indian personal finance app. You help users achieve their financial goals.

IMPORTANT RULES:
- Respond in plain text (no markdown bold/italic like ** or *)
- Keep responses concise and actionable (under 200 words)
- Use ₹ for currency, Indian number formatting (lakhs, crores)
- Be encouraging and supportive
- Suggest practical strategies to reach goals faster
- If user asks about investments, suggest they check the Investment Guidance section

USER CONTEXT:
- Age: ${profile?.age || 'Unknown'}
- Type: ${profile?.type || 'Unknown'}
- Monthly Savings Capacity: ₹${monthlySavings.toLocaleString()}
- Total Remaining Across Goals: ₹${totalRemaining.toLocaleString()}

ACTIVE GOALS:
${goalsText}

Help the user with tips, timeline analysis, feasibility checks, and motivation for their goals.`;
  }, [profile, goals, monthlySavings]);
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user'
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const systemPrompt = getSystemPrompt();
      const allMessages = [...messages, userMsg];
      const recentMessages = allMessages.slice(-10);
      const history = buildHistory(
        recentMessages.map((m) => ({
          text: m.text,
          sender: m.sender
        }))
      );
      const response = await callGemini(systemPrompt, history);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot'
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('AI error:', error);
      const errorText =
      error instanceof GeminiError ?
      getErrorMessage(error.type) :
      "Sorry, I'm having trouble connecting right now. Please try again! 🔄";
      setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'bot'
      }]
      );
    } finally {
      setIsTyping(false);
    }
  };
  return (
    <Card className="h-[500px] flex flex-col bg-gradient-to-br from-white to-purple-50 border-purple-100 shadow-lg">
      <div className="p-4 border-b border-purple-100 flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-t-2xl">
        <div className="p-2 bg-purple-100 rounded-xl shadow-sm">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">AI Goal Assistant</h3>
          <p className="text-xs text-gray-500">Powered by Groq AI</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) =>
        <div
          key={msg.id}
          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

            <div
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-purple-100'}`}>

                {msg.sender === 'user' ?
              <User className="w-4 h-4 text-blue-600" /> :

              <Bot className="w-4 h-4 text-purple-600" />
              }
              </div>
              <div
              className={`p-3.5 rounded-2xl text-sm whitespace-pre-line shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-purple-100 text-gray-800 rounded-tl-none'}`}>

                {msg.text}
              </div>
            </div>
          </div>
        )}
        {isTyping &&
        <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-white border border-purple-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
              <span
              className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
              style={{
                animationDelay: '0.1s'
              }}>
            </span>
              <span
              className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
              style={{
                animationDelay: '0.2s'
              }}>
            </span>
            </div>
          </div>
        }
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-purple-100 bg-white/80 backdrop-blur-sm rounded-b-2xl">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your goals..."
            className="bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-100" />

          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-purple-600 hover:bg-purple-700 px-4 shadow-md shadow-purple-200">

            {isTyping ?
            <Loader2 className="w-4 h-4 animate-spin" /> :

            <Send className="w-4 h-4" />
            }
          </Button>
        </div>
      </div>
    </Card>);

}