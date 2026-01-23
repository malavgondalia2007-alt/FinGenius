import React, { useState } from 'react';
import { MessageCircle, X, Send, HelpCircle } from 'lucide-react';
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
export function HelpChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    text: "Hi! I'm here to help you navigate FinGenius. Ask me how to use any feature!",
    sender: 'bot',
    timestamp: new Date()
  }]
  );
  const [input, setInput] = useState('');
  const getHelpResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    if (
    lowerMsg.includes('log') ||
    lowerMsg.includes('add') && lowerMsg.includes('expense'))
    {
      return "To log an expense, go to the Expenses tab and click the 'Add Expense' button. Fill in the amount, category, and description, then save.";
    }
    if (
    lowerMsg.includes('create') && (
    lowerMsg.includes('goal') || lowerMsg.includes('target')))
    {
      return "Visit the Goals page and click 'Quick Add' for a simple goal, or 'Smart Goal Planner' for AI-assisted planning.";
    }
    if (lowerMsg.includes('report') || lowerMsg.includes('monthly')) {
      return "You can find your Monthly Report in the Settings page. Click on 'Monthly Report' to view and download your financial summary.";
    }
    if (lowerMsg.includes('invest') || lowerMsg.includes('portfolio')) {
      return 'The Investments page offers educational resources about stocks and mutual funds. Note that we provide guidance only and do not track real-time portfolio values.';
    }
    if (lowerMsg.includes('delete') || lowerMsg.includes('remove')) {
      return 'You can usually delete items (like expenses or goals) by clicking the trash icon next to the item in its respective list.';
    }
    return 'I can help you with navigating the app, logging expenses, creating goals, or finding reports. What do you need help with?';
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
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getHelpResponse(input),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 600);
  };
  return (
    <>
      {!isOpen &&
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50 group">

          <HelpCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-emerald-500 animate-pulse"></span>
        </button>
      }

      {isOpen &&
      <div className="fixed bottom-6 right-6 w-80 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 animate-fade-in">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">App Help</h3>
                <p className="text-[10px] text-white/80">Usage Guide</p>
              </div>
            </div>
            <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors">

              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) =>
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

                <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-800 border border-gray-200 shadow-sm'}`}>

                  <p>{msg.text}</p>
                </div>
              </div>
          )}
          </div>

          <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="How do I..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-emerald-500 text-sm" />

              <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors">

                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      }
    </>);

}