import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Goal, GoalChatMessage, InvestmentRecommendation } from '../../types';
import { SavingsCapacity } from '../../utils/savingsCalculations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import {
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  TrendingUp,
  Shield,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Info } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInvestmentSuitability } from '../../utils/goalCalculations';
import { useNavigate } from 'react-router-dom';
import {
  callGemini,
  buildHistory,
  buildGoalSystemPrompt,
  GeminiError,
  getErrorMessage } from
'../../services/geminiAI';
interface GoalChatInterfaceProps {
  goal: Goal;
  capacity: SavingsCapacity | null;
  isNewGoal?: boolean;
  onChatOpened?: () => void;
}
export function GoalChatInterface({
  goal,
  capacity,
  isNewGoal = false,
  onChatOpened
}: GoalChatInterfaceProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<GoalChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInvestments, setShowInvestments] = useState(false);
  const [investmentData, setInvestmentData] = useState<{
    riskProfile: 'Low' | 'Moderate' | 'High';
    recommendations: InvestmentRecommendation[];
  } | null>(null);
  const [isLoadingInvestments, setIsLoadingInvestments] = useState(false);
  const [hasPromptedInvestment, setHasPromptedInvestment] = useState(false);
  const [hasShownNewGoalMessage, setHasShownNewGoalMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, showInvestments, isLoadingInvestments]);
  // Fetch investment recommendations
  const fetchInvestmentRecommendations = useCallback(async () => {
    if (!capacity || investmentData) return;
    setIsLoadingInvestments(true);
    try {
      const data = await getInvestmentSuitability(goal, capacity);
      setInvestmentData(data);
    } catch (error) {
      console.error('Failed to fetch investment recommendations:', error);
    } finally {
      setIsLoadingInvestments(false);
    }
  }, [goal, capacity, investmentData]);
  // Build system prompt for this goal
  const getSystemPrompt = useCallback(() => {
    const deadline = new Date(goal.deadline);
    const monthsRemaining = Math.max(
      1,
      Math.ceil(
        (deadline.getTime() - new Date().getTime()) / (
        1000 * 60 * 60 * 24 * 30)
      )
    );
    const monthlyRequired =
    (goal.targetAmount - goal.savedAmount) / monthsRemaining;
    return buildGoalSystemPrompt({
      goalName: goal.name,
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount,
      deadline: goal.deadline,
      category: goal.category,
      monthlyRequired,
      monthsRemaining,
      savingsCapacity: capacity?.remainingIncome || 0
    });
  }, [goal, capacity]);
  // Auto-open chat and send initial message for new goals
  useEffect(() => {
    if (isNewGoal && !hasShownNewGoalMessage) {
      setIsOpen(true);
      setHasShownNewGoalMessage(true);
      onChatOpened?.();
      const deadline = new Date(goal.deadline);
      const monthsRemaining = Math.max(
        1,
        Math.ceil(
          (deadline.getTime() - new Date().getTime()) / (
          1000 * 60 * 60 * 24 * 30)
        )
      );
      const monthlyRequired =
      (goal.targetAmount - goal.savedAmount) / monthsRemaining;
      // Use Gemini for the initial roadmap message
      setIsTyping(true);
      const initPrompt = getSystemPrompt();
      const initMessage = `The user just created a new goal called "${goal.name}" with a target of ₹${goal.targetAmount.toLocaleString()} and deadline ${goal.deadline}. They need to save ₹${Math.round(monthlyRequired).toLocaleString()}/month for ${monthsRemaining} months. Generate a congratulatory message with a personalized achievement roadmap including milestones, weekly/daily breakdown, and motivational tips. Make it feel exciting!`;
      callGemini(initPrompt, [
      {
        role: 'user',
        parts: [
        {
          text: initMessage
        }]

      }]
      ).
      then((response) => {
        setMessages([
        {
          id: 'new-goal-roadmap',
          goalId: goal.id,
          text: response,
          sender: 'bot',
          timestamp: new Date().toISOString()
        }]
        );
        setIsTyping(false);
      }).
      catch(() => {
        // Fallback to a simple message if API fails
        setMessages([
        {
          id: 'new-goal-roadmap',
          goalId: goal.id,
          text: `🎯 Congratulations on creating your "${goal.name}" goal!\n\nTarget: ₹${goal.targetAmount.toLocaleString()}\nMonthly Required: ₹${Math.round(monthlyRequired).toLocaleString()}\nTimeline: ${monthsRemaining} months\n\nI'm here to help you achieve this! Ask me anything about savings tips, timeline adjustments, or investment options.`,
          sender: 'bot',
          timestamp: new Date().toISOString()
        }]
        );
        setIsTyping(false);
      });
    }
  }, [
  isNewGoal,
  hasShownNewGoalMessage,
  goal,
  capacity,
  onChatOpened,
  getSystemPrompt]
  );
  // Existing initial greeting for non-new goals
  useEffect(() => {
    if (
    isOpen &&
    messages.length === 0 &&
    !isNewGoal &&
    !hasShownNewGoalMessage)
    {
      const deadline = new Date(goal.deadline);
      const monthsRemaining = Math.max(
        1,
        Math.ceil(
          (deadline.getTime() - new Date().getTime()) / (
          1000 * 60 * 60 * 24 * 30)
        )
      );
      const monthlyRequired =
      (goal.targetAmount - goal.savedAmount) / monthsRemaining;
      const initialMsg: GoalChatMessage = {
        id: 'init',
        goalId: goal.id,
        text: `Hi! I'm tracking your ${goal.name} goal.\n\nYou need to save ₹${Math.round(monthlyRequired).toLocaleString()}/month for the next ${monthsRemaining} months to reach your target of ₹${goal.targetAmount.toLocaleString()}.\n\nI can help you with savings tips, timeline adjustments, or investment options to reach your goal faster. What would you like to know?`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setIsTyping(true);
      setTimeout(() => {
        setMessages([initialMsg]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, goal, isNewGoal, hasShownNewGoalMessage]);
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: GoalChatMessage = {
      id: Date.now().toString(),
      goalId: goal.id,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    messageCountRef.current += 1;
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
      const botMsg: GoalChatMessage = {
        id: (Date.now() + 1).toString(),
        goalId: goal.id,
        text: response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, botMsg]);
      // Check if we should prompt investment after 3 messages
      const lower = input.toLowerCase();
      const investmentKeywords = [
      'invest',
      'grow',
      'stock',
      'fund',
      'mutual',
      'sip',
      'faster',
      'returns'];

      if (
      !hasPromptedInvestment && (
      investmentKeywords.some((k) => lower.includes(k)) ||
      messageCountRef.current >= 3))
      {
        setHasPromptedInvestment(true);
        setTimeout(() => {
          setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + '_prompt',
            goalId: goal.id,
            text: 'Would you like to explore investment options that could help you reach this goal faster? I can take you to the Investment Guidance section for detailed recommendations.',
            sender: 'bot',
            timestamp: new Date().toISOString(),
            type: 'investment_prompt'
          }]
          );
        }, 1500);
      }
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
        goalId: goal.id,
        text: errorText,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]
      );
    } finally {
      setIsTyping(false);
    }
  };
  const handleInvestmentResponse = async (interested: boolean) => {
    if (interested) {
      // Redirect to investments page with chat open
      navigate('/investments?openChat=true');
    } else {
      const msg: GoalChatMessage = {
        id: Date.now().toString(),
        goalId: goal.id,
        text: "Not right now, I'll stick to regular savings.",
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        const botMsg: GoalChatMessage = {
          id: Date.now().toString() + '_ack',
          goalId: goal.id,
          text: "No problem! Regular savings is a safe and reliable approach. I'm here whenever you want to explore other options. Is there anything else I can help you with?",
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 1000);
    }
  };
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Moderate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low':
        return <Shield className="w-3.5 h-3.5" />;
      case 'Moderate':
        return <Info className="w-3.5 h-3.5" />;
      case 'High':
        return <TrendingUp className="w-3.5 h-3.5" />;
      default:
        return <Info className="w-3.5 h-3.5" />;
    }
  };
  return (
    <div className="mt-4 border-t border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors rounded-b-xl">

        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-500" />
          <span className="font-medium">Goal Assistant</span>
          {!isOpen &&
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Chat available
            </span>
          }
        </div>
        {isOpen ?
        <ChevronUp className="w-4 h-4" /> :

        <ChevronDown className="w-4 h-4" />
        }
      </button>

      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{
            height: 0,
            opacity: 0
          }}
          animate={{
            height: 'auto',
            opacity: 1
          }}
          exit={{
            height: 0,
            opacity: 0
          }}
          className="overflow-hidden">

            <div className="bg-gray-50 p-4 min-h-[300px] max-h-[500px] flex flex-col rounded-b-xl">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.map((msg) =>
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>

                    <div
                  className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                      <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-white border border-gray-200'}`}>

                        {msg.sender === 'user' ?
                    <User className="w-4 h-4 text-white" /> :

                    <Bot className="w-4 h-4 text-blue-600" />
                    }
                      </div>
                      <div
                    className={`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>

                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>

                    {/* Investment Prompt Actions - Updated to handle redirect */}
                    {msg.type === 'investment_prompt' &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  className="mt-3 ml-10 flex gap-2">

                        <Button
                    onClick={() => handleInvestmentResponse(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 h-auto">

                          <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                          {msg.text.includes('dedicated Investment Guidance') ?
                    'Go to Investments' :
                    'Yes, explore options'}
                        </Button>
                        <Button
                    variant="outline"
                    onClick={() => handleInvestmentResponse(false)}
                    className="text-xs px-4 py-2 h-auto">

                          Maybe later
                        </Button>
                      </motion.div>
                }

                    {/* Investment Options Display */}
                    {msg.type === 'investment_options' && showInvestments &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  className="mt-3 ml-10 w-full max-w-lg">

                        {isLoadingInvestments ?
                  <div className="bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                            <span className="text-gray-600">
                              Finding best options for you...
                            </span>
                          </div> :
                  investmentData ?
                  <div className="space-y-3">
                            {/* Risk Profile Badge */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-xl border border-indigo-100">
                              <div className="flex items-center gap-2">
                                <div
                          className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border ${getRiskColor(investmentData.riskProfile)}`}>

                                  {getRiskIcon(investmentData.riskProfile)}
                                  {investmentData.riskProfile} Risk Profile
                                </div>
                                <span className="text-xs text-gray-500">
                                  Based on your goal timeline
                                </span>
                              </div>
                            </div>

                            {/* Fund Cards */}
                            {investmentData.recommendations.map(
                      (rec, index) =>
                      <motion.div
                        key={rec.fundId}
                        initial={{
                          opacity: 0,
                          x: -10
                        }}
                        animate={{
                          opacity: 1,
                          x: 0
                        }}
                        transition={{
                          delay: index * 0.1
                        }}>

                                  <Card className="p-4 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                          <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 border ${getRiskColor(rec.risk)}`}>

                                            {getRiskIcon(rec.risk)}
                                            {rec.risk}
                                          </span>
                                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {rec.category}
                                          </span>
                                        </div>
                                        <h5 className="font-bold text-gray-900 text-sm">
                                          {rec.fundName}
                                        </h5>
                                      </div>
                                      <div className="text-right ml-3">
                                        <p className="text-xs text-gray-500">
                                          3Y Returns
                                        </p>
                                        <p className="text-xl font-bold text-emerald-600">
                                          +{rec.returns3Yr}%
                                        </p>
                                      </div>
                                    </div>

                                    <div className="bg-blue-50 p-2.5 rounded-lg mb-3 text-xs text-blue-800">
                                      💡 {rec.reason}
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                      <p className="text-xs text-gray-500">
                                        Min SIP:{' '}
                                        <span className="font-semibold text-gray-900">
                                          ₹{rec.minSip}
                                        </span>
                                      </p>
                                      <Button
                              variant="outline"
                              className="text-xs h-7 px-3">

                                        Learn More{' '}
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </Button>
                                    </div>
                                  </Card>
                                </motion.div>

                    )}

                            {/* Disclaimer */}
                            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-xs text-amber-800 border border-amber-100">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <p>
                                Mutual fund investments are subject to market
                                risks. Past performance is not indicative of
                                future returns. Please read all scheme documents
                                carefully before investing.
                              </p>
                            </div>
                          </div> :

                  <div className="bg-white rounded-xl p-4 border border-gray-200 text-center text-gray-500 text-sm">
                            Unable to load investment options. Please try again
                            later.
                          </div>
                  }
                      </motion.div>
                }
                  </div>
              )}

                {isTyping &&
              <div className="flex gap-2">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{
                      animationDelay: '0.1s'
                    }}>
                  </span>
                      <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{
                      animationDelay: '0.2s'
                    }}>
                  </span>
                    </div>
                  </div>
              }
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your goal..."
                className="border-0 focus:ring-0 px-2" />

                <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4">

                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}