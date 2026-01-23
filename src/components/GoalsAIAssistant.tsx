import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Sparkles, Send, User, Bot } from 'lucide-react';
import { UserProfile, Goal } from '../types';
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
    text: "I'm your Goal Assistant. I can help analyze your goals based on your savings capacity. Ask me about feasibility or timelines!",
    sender: 'bot'
  }]
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const analyzeGoal = (text: string): string => {
    const lower = text.toLowerCase();
    if (
    lower.includes('achievable') ||
    lower.includes('feasible') ||
    lower.includes('can i'))
    {
      if (monthlySavings <= 0) {
        return "Based on your current finances, you don't have monthly savings surplus. Consider reducing non-essential expenses to make your goals achievable.";
      }
      return `You have a monthly savings capacity of ₹${monthlySavings.toLocaleString()}. You can comfortably achieve goals within this limit. Which goal are you concerned about?`;
    }
    if (lower.includes('timeline') || lower.includes('how long')) {
      if (goals.length === 0)
      return "You haven't set any goals yet. Create one and I can help estimate the timeline!";
      const totalTarget = goals.reduce(
        (sum, g) => sum + (g.targetAmount - g.savedAmount),
        0
      );
      const months = Math.ceil(totalTarget / (monthlySavings || 1));
      return `At your current savings rate of ₹${monthlySavings.toLocaleString()}/mo, it will take approximately ${months} months to achieve all your active goals.`;
    }
    if (lower.includes('faster') || lower.includes('speed')) {
      return 'To reach your goals faster, try the 50/30/20 rule: allocate 50% to needs, 30% to wants, and 20% to savings. Even a 5% reduction in non-essential spending can significantly shorten your timeline.';
    }
    return 'I can analyze goal feasibility, estimate timelines, or suggest savings strategies based on your profile. What would you like to know?';
  };
  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user'
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: analyzeGoal(input),
        sender: 'bot'
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };
  return (
    <Card className="h-[500px] flex flex-col bg-gradient-to-br from-white to-purple-50 border-purple-100">
      <div className="p-4 border-b border-purple-100 flex items-center gap-2">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">AI Goal Assistant</h3>
          <p className="text-xs text-gray-500">Personalized guidance</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) =>
        <div
          key={msg.id}
          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

            <div
            className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-purple-100'}`}>

                {msg.sender === 'user' ?
              <User className="w-4 h-4 text-blue-600" /> :

              <Bot className="w-4 h-4 text-purple-600" />
              }
              </div>
              <div
              className={`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-purple-100 text-gray-800 rounded-tl-none shadow-sm'}`}>

                {msg.text}
              </div>
            </div>
          </div>
        )}
        {isTyping &&
        <div className="flex gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-white border border-purple-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                <span
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{
                  animationDelay: '0.2s'
                }}>
              </span>
                <span
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{
                  animationDelay: '0.4s'
                }}>
              </span>
              </div>
            </div>
          </div>
        }
      </div>

      <div className="p-4 border-t border-purple-100 bg-white/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your goals..."
            className="bg-white" />

          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-purple-600 hover:bg-purple-700 px-4">

            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>);

}