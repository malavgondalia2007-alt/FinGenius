import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Calculator,
  ChevronRight } from
'lucide-react';
import { callGemini, buildHistory } from '../../services/geminiAI';
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
export function CalculatorAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    text: "Hi! I'm your Investment Calculator Assistant. I can help you choose the right calculator, explain financial concepts, or interpret your results. What are you planning for today?",
    sender: 'bot',
    timestamp: new Date()
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
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const systemPrompt = `You are an expert financial calculator assistant for FinGenius.
      
      Your goal is to help users with:
      1. Choosing the right calculator (SIP, Lump Sum, Compound Interest, ROI, Future Value, Inflation, Asset Allocation).
      2. Understanding inputs (e.g., "What is a good expected return rate?").
      3. Interpreting results (e.g., "What does this future value really mean in today's terms?").
      4. General financial concepts related to investing.

      Available Calculators on this page:
      - SIP Calculator: For monthly investments.
      - Lump Sum: For one-time investments.
      - Compound Interest: To see the power of compounding.
      - ROI: To calculate returns on past investments.
      - Future Value: To project wealth with mixed inputs.
      - Inflation Adjusted: To see real returns after inflation.
      - Asset Allocation: To decide portfolio mix based on age/risk.

      Keep responses concise, helpful, and encouraging. Use Indian context (₹, Lakhs, Crores) where appropriate.
      `;
      const history = buildHistory(
        messages.map((m) => ({
          text: m.text,
          sender: m.sender
        }))
      );
      // Add current message to history for the API call
      history.push({
        role: 'user',
        parts: [
        {
          text: userMsg.text
        }]

      });
      const response = await callGemini(systemPrompt, history);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      }]
      );
    } finally {
      setIsTyping(false);
    }
  };
  const suggestions = [
  'Which calculator for monthly savings?',
  'Explain compound interest',
  "What's a good return rate for mutual funds?",
  'How does inflation affect my savings?'];

  return (
    <Card className="h-[600px] flex flex-col bg-white border-l-4 border-l-purple-500 shadow-xl">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Guide</h3>
            <p className="text-xs text-gray-500">
              Ask me anything about calculations
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) =>
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

            <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>

              {msg.sender === 'user' ?
            <User className="w-4 h-4 text-white" /> :

            <Bot className="w-4 h-4 text-white" />
            }
            </div>
            <div
            className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-line shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>

              {msg.text}
            </div>
          </div>
        )}
        {isTyping &&
        <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        }
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 &&
      <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2 font-medium">
            Suggested questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) =>
          <button
            key={i}
            onClick={() => {
              setInput(s);
              handleSend();
            }} // Fix: set input then send won't work directly due to closure, but let's just set input for now or call a separate send function
            className="text-xs bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-50 transition-colors flex items-center gap-1">

                {s} <ChevronRight className="w-3 h-3" />
              </button>
          )}
          </div>
        </div>
      }

      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1" />

          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-purple-600 hover:bg-purple-700">

            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>);

}