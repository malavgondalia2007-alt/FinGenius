import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    text: "Hi! I'm your FinGenius AI assistant. Ask me anything about budgeting, saving, or investing!",
    sender: 'bot',
    timestamp: new Date()
  }]
  );
  const [input, setInput] = useState('');
  const getAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    // Budget queries
    if (lowerMsg.includes('budget') || lowerMsg.includes('how much')) {
      return 'A good rule of thumb is the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Would you like me to help you create a personalized budget?';
    }
    // Savings queries
    if (lowerMsg.includes('save') || lowerMsg.includes('saving')) {
      return 'Great question! Start by setting up automatic transfers to savings on payday. Even ₹500/week adds up to ₹26,000/year! Want to set a savings goal?';
    }
    // Investment queries
    if (
    lowerMsg.includes('invest') ||
    lowerMsg.includes('sip') ||
    lowerMsg.includes('mutual fund'))
    {
      return 'For beginners, I recommend starting with SIPs in diversified equity mutual funds. You can start with as little as ₹500/month. Check out our Investments tab for personalized recommendations!';
    }
    // Goal queries
    if (lowerMsg.includes('goal') || lowerMsg.includes('target')) {
      return 'Setting financial goals is smart! Use our Smart Goal Planner to create SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound). What are you saving for?';
    }
    // Expense queries
    if (
    lowerMsg.includes('expense') ||
    lowerMsg.includes('spending') ||
    lowerMsg.includes('track'))
    {
      return 'Track your expenses in the Expenses tab. You can manually add them or upload a CSV file. Categorizing helps you see where your money goes!';
    }
    // Emergency fund
    if (lowerMsg.includes('emergency') || lowerMsg.includes('fund')) {
      return 'An emergency fund should cover 3-6 months of expenses. Start small - even ₹10,000 is better than nothing. Build it gradually!';
    }
    // Default response
    return 'I can help you with budgeting, saving strategies, investment advice, goal setting, and expense tracking. What would you like to know more about?';
  };
  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    // Simulate AI thinking
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(input),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };
  return (
    <>
      {/* Chat Button */}
      {!isOpen &&
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50 group">

          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      }

      {/* Chat Window */}
      {isOpen &&
      <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">FinGenius AI</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
            </div>
            <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors">

              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) =>
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

                <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>

                  <p className="text-sm">{msg.text}</p>
                  <p
                className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>

                    {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                  </p>
                </div>
              </div>
          )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm" />

              <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors">

                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      }
    </>);

}