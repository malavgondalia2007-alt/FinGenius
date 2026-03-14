import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Loader2,
  Calculator,
  TrendingUp,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Sparkles } from
'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { fetchMutualFunds } from '../../services/liveMarketData';
import { fetchLiveStocks, LiveStock } from '../../services/liveMarketData';
import { formatCurrency } from '../../utils/sipCalculations';
import {
  callGemini,
  buildHistory,
  buildInvestmentSystemPrompt,
  GeminiError,
  getErrorMessage } from
'../../services/geminiAI';
// Topic tracking to avoid repetitive responses
interface ConversationContext {
  discussedTopics: Set<string>;
  lastTopic: string | null;
  questionCount: number;
}
interface UserProfile {
  monthlyIncome: number;
  age: number;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
}
interface SavingsCapacity {
  remainingIncome: number;
}
interface GoalChatMessage {
  id: string;
  goalId: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type?:
  'text' |
  'investment_options' |
  'sip_recommendations' |
  'stock_recommendations';
  recommendations?: any[];
  stockRecommendations?: LiveStock[];
  calculatorData?: any;
}
interface InvestmentRecommendation {
  fundId: string;
  fundName: string;
  category: string;
  risk: string;
  minSip: number;
  returns3Yr: number;
  suitabilityScore: number;
  reason: string;
}
interface InvestmentGuidanceChatProps {
  profile: UserProfile | null;
  capacity: SavingsCapacity | null;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  onSIPCalculatorClick?: () => void;
  showSIPCalculatorExternal?: boolean;
}
export function InvestmentGuidanceChat({
  profile,
  capacity,
  isOpen: externalIsOpen,
  onToggle,
  onSIPCalculatorClick,
  showSIPCalculatorExternal = false
}: InvestmentGuidanceChatProps) {
  const navigate = useNavigate();
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const [messages, setMessages] = useState<GoalChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recommendations, setRecommendations] = useState<
    InvestmentRecommendation[]>(
    []);
  const [stockRecommendations, setStockRecommendations] = useState<LiveStock[]>(
    []
  );
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Track conversation context to provide varied responses
  const conversationContext = useRef<ConversationContext>({
    discussedTopics: new Set(),
    lastTopic: null,
    questionCount: 0
  });
  const handleToggle = () => {
    const newState = !isOpen;
    if (onToggle) {
      onToggle(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);
  // Build system prompt
  const getSystemPrompt = useCallback(() => {
    return buildInvestmentSystemPrompt({
      age: profile?.age || 30,
      monthlyIncome: profile?.monthlyIncome || 0,
      savingsCapacity: capacity?.remainingIncome || 10000,
      riskTolerance: profile?.riskTolerance
    });
  }, [profile, capacity]);
  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const savingsAmount = capacity?.remainingIncome || 0;
      const initialText = profile ?
      `Hi! I'm your AI Investment Guide.\n\nBased on your profile, you have a savings capacity of roughly ₹${savingsAmount.toLocaleString()}/month.\n\nI can help you with:\n• Finding suitable Stocks and Mutual Funds\n• Understanding investment risks\n• Comparing different asset classes\n• Planning SIPs and long-term wealth\n\nWhat are you looking to invest in today?` :
      `Hi! I'm your AI Investment Guide. I can help you explore investment options, compare funds, and plan your financial future. What would you like to know?`;
      const initialMsg: GoalChatMessage = {
        id: 'init',
        goalId: 'investment-chat',
        text: initialText,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setIsTyping(true);
      setTimeout(() => {
        setMessages([initialMsg]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, profile, capacity]);
  const fetchRecommendations = async (
  type: 'low' | 'moderate' | 'high' = 'moderate') =>
  {
    setIsLoadingRecs(true);
    try {
      const riskLevel =
      type === 'low' ? 'Low' : type === 'high' ? 'High' : 'Moderate';
      const funds = await fetchMutualFunds();
      // Filter by risk
      const filteredFunds = funds.filter((f) => f.risk === riskLevel);
      const fundsToShow =
      filteredFunds.length > 0 ? filteredFunds : funds.slice(0, 3);
      const recs: InvestmentRecommendation[] = fundsToShow.
      slice(0, 3).
      map((f) => ({
        fundId: f.id,
        fundName: f.name,
        category: f.category,
        risk: f.risk,
        minSip: f.minInvestment,
        returns3Yr: f.returns3Y,
        suitabilityScore: 85,
        reason: `Matches your ${type} risk preference with consistent returns.`
      }));
      setRecommendations(recs);
      return recs;
    } catch (error) {
      console.error('Error fetching recommendations', error);
      return [];
    } finally {
      setIsLoadingRecs(false);
    }
  };
  const fetchStockRecommendations = async () => {
    setIsLoadingRecs(true);
    try {
      const allStocks = await fetchLiveStocks();
      const savings = capacity?.remainingIncome || 10000;
      // Filter affordable stocks
      const affordableStocks = allStocks.filter((s) => s.price <= savings * 0.5);
      // Sort by performance/suitability (mock logic)
      const sortedStocks = affordableStocks.
      sort((a, b) => b.changePercent - a.changePercent).
      slice(0, 3);
      setStockRecommendations(sortedStocks);
      return sortedStocks;
    } catch (error) {
      console.error('Error fetching stocks', error);
      return [];
    } finally {
      setIsLoadingRecs(false);
    }
  };
  // ─── Send to Gemini AI ───────────────────────────────────────────
  const handleSend = async (text?: string) => {
    const msgText = text || input;
    if (!msgText.trim() || isTyping) return;
    const userMsg: GoalChatMessage = {
      id: Date.now().toString(),
      goalId: 'investment-chat',
      text: msgText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      // Check if user is asking for stock recommendations
      const lower = msgText.toLowerCase();
      const wantsStocks = /stock|share|equity|nifty|sensex|buy.*stock/i.test(
        lower
      );
      const wantsFunds =
      /recommend|suggest|best fund|top fund|mutual fund|sip.*fund/i.test(
        lower
      );
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
      // If user asked for stocks, also fetch live stock data
      if (wantsStocks) {
        const stocks = await fetchStockRecommendations();
        if (stocks.length > 0) {
          const botMsg: GoalChatMessage = {
            id: (Date.now() + 1).toString(),
            goalId: 'investment-chat',
            text: response,
            sender: 'bot',
            timestamp: new Date().toISOString(),
            type: 'stock_recommendations',
            stockRecommendations: stocks
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsTyping(false);
          return;
        }
      }
      // If user asked for fund recommendations, fetch them too
      if (wantsFunds) {
        const risk =
        profile?.riskTolerance === 'aggressive' ?
        'high' :
        profile?.riskTolerance === 'conservative' ?
        'low' :
        'moderate';
        await fetchRecommendations(risk);
      }
      const botMsg: GoalChatMessage = {
        id: (Date.now() + 1).toString(),
        goalId: 'investment-chat',
        text: response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: wantsFunds ? 'investment_options' : 'text'
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Gemini error:', error);
      const errorText =
      error instanceof GeminiError ?
      getErrorMessage(error.type) :
      "Sorry, I'm having trouble connecting right now. Please try again! 🔄";
      setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        goalId: 'investment-chat',
        text: errorText,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]
      );
    } finally {
      setIsTyping(false);
    }
  };
  const handleSIPClick = () => {
    navigate('/calculators');
  };
  const renderRecommendations = (recs: any[], calcData: any) => {
    return (
      <div className="space-y-3 max-w-full">
        {recs.map((fund: any, index: number) =>
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 hover:shadow-md transition-all">

            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                    {fund.fundName}
                  </h4>
                </div>
                <p className="text-xs text-gray-500">{fund.category}</p>
              </div>
              <div
              className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${fund.risk === 'Low' ? 'bg-green-100 text-green-700' : fund.risk === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>

                {fund.risk}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <p className="text-gray-500">Min. SIP</p>
                <p className="font-semibold text-gray-900">
                  ₹{fund.minSip.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">3Y Returns</p>
                <p className="font-semibold text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {fund.returns3Yr.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-2.5 rounded-lg mb-3 text-xs text-blue-800">
              💡 {fund.reason}
            </div>
          </div>
        )}
      </div>);

  };
  const renderStockRecommendations = (stocks: LiveStock[]) => {
    return (
      <div className="space-y-3 max-w-full">
        {stocks.map((stock, index) =>
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 hover:shadow-md transition-all">

            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                    {stock.symbol}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {stock.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  ₹{stock.price.toLocaleString()}
                </p>
                <p
                className={`text-xs font-medium flex items-center justify-end gap-0.5 ${stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>

                  {stock.change >= 0 ?
                <ArrowUpRight className="w-3 h-3" /> :

                <ArrowDownRight className="w-3 h-3" />
                }
                  {Math.abs(stock.changePercent).toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5"
              onClick={() => window.open(stock.externalLink, '_blank')}>

                View Details
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>);

  };
  const quickQuestions = [
  'Best SIPs for 5 years?',
  'Safe stocks to buy now?',
  'Explain mutual fund risks',
  'How to start investing with ₹500?'];

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/investments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            title="Back to Investments">

            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="bg-blue-100 p-2 rounded-lg">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Investment Assistant
            </h3>
            <p className="text-xs text-gray-500">
              Powered by Groq AI • Ask about funds, SIPs, or market trends
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSIPClick}
          className="hidden md:flex items-center gap-2">

          <Calculator className="h-4 w-4" />
          Calculator
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {messages.map((msg) =>
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>

              <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-green-600'}`}>

                {msg.sender === 'user' ?
              <User className="h-4 w-4 text-white" /> :

              <Bot className="h-4 w-4 text-white" />
              }
              </div>
              <div
              className={`${msg.type === 'sip_recommendations' || msg.type === 'stock_recommendations' ? 'max-w-[90%]' : 'max-w-[80%]'} ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none p-3 rounded-2xl' : msg.type === 'sip_recommendations' || msg.type === 'stock_recommendations' ? '' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm p-3 rounded-2xl'}`}>

                {msg.type === 'sip_recommendations' && msg.recommendations ?
              renderRecommendations(msg.recommendations, msg.calculatorData) :
              msg.type === 'stock_recommendations' &&
              msg.stockRecommendations ?
              <>
                    <p className="text-sm leading-relaxed whitespace-pre-line mb-3">
                      {msg.text}
                    </p>
                    {renderStockRecommendations(msg.stockRecommendations)}
                  </> :

              <p className="text-sm leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>
              }
              </div>
            </div>
          )}
          {isTyping &&
          <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{
                  animationDelay: '0.1s'
                }}>
              </span>
                <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{
                  animationDelay: '0.2s'
                }}>
              </span>
              </div>
            </div>
          }
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions & Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 space-y-3">
        {messages.length < 3 &&
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {quickQuestions.map((q, i) =>
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors flex items-center gap-1">

                <Sparkles className="w-3 h-3 text-purple-500" />
                {q}
              </button>
          )}
          </div>
        }

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2">

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about SIPs, mutual funds, risk..."
            className="flex-1" />

          <Button type="submit" disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>);

}