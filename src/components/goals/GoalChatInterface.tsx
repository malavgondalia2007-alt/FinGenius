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
  // Auto-open chat and send initial message for new goals
  useEffect(() => {
    if (isNewGoal && !hasShownNewGoalMessage) {
      // Auto-open the chat
      setIsOpen(true);
      setHasShownNewGoalMessage(true);
      onChatOpened?.();
      // Generate personalized achievement roadmap message
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
      const weeklyRequired = monthlyRequired / 4;
      const dailyRequired = monthlyRequired / 30;
      // Calculate milestones
      const milestone25 = Math.ceil(monthsRemaining * 0.25);
      const milestone50 = Math.ceil(monthsRemaining * 0.5);
      const milestone75 = Math.ceil(monthsRemaining * 0.75);
      // Format deadline date
      const deadlineFormatted = deadline.toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
      });
      // Determine if goal is aggressive or comfortable
      const savingsCapacity = capacity?.monthlySavingsCapacity || 0;
      const isAggressive = monthlyRequired > savingsCapacity * 0.8;
      const isComfortable = monthlyRequired <= savingsCapacity * 0.5;
      const achievementMessage: GoalChatMessage = {
        id: 'new-goal-roadmap',
        goalId: goal.id,
        text: `🎯 **Congratulations on creating your "${goal.name}" goal!**

I'll help you achieve your target of **₹${goal.targetAmount.toLocaleString()}** by **${deadlineFormatted}**.

---

**📊 Your Personalized Strategy:**

**Monthly Savings Required:** ₹${Math.round(monthlyRequired).toLocaleString()}
• Weekly: ~₹${Math.round(weeklyRequired).toLocaleString()}
• Daily: ~₹${Math.round(dailyRequired).toLocaleString()}

---

**🏁 Milestone Roadmap:**
• Month ${milestone25}: Save ₹${Math.round(goal.targetAmount * 0.25).toLocaleString()} (25%)
• Month ${milestone50}: Save ₹${Math.round(goal.targetAmount * 0.5).toLocaleString()} (50%)
• Month ${milestone75}: Save ₹${Math.round(goal.targetAmount * 0.75).toLocaleString()} (75%)
• Month ${monthsRemaining}: Reach ₹${goal.targetAmount.toLocaleString()} (100%) 🎉

---

${
        isAggressive ?
        `**⚡ Pro Tips for Your Ambitious Goal:**
• Consider setting up automatic transfers on salary day
• Look for areas to reduce non-essential spending
• Explore investment options for potentially higher returns` :
        isComfortable ?
        `**✨ You're in Great Shape!**
• This goal fits comfortably within your savings capacity
• Consider investing a portion for better returns
• You might even reach your goal ahead of schedule!` :
        `**💡 Smart Strategies:**
• Automate your savings with recurring transfers
• Track your progress weekly to stay motivated
• Consider a mix of savings and low-risk investments`}

---

**What would you like to know?**
• Tips to save faster
• Investment options to grow your money
• How to adjust if things get tight

Just ask! I'm here to help you succeed. 🚀`,

        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      // Show typing indicator then message
      setIsTyping(true);
      setTimeout(() => {
        setMessages([achievementMessage]);
        setIsTyping(false);
      }, 1500);
    }
  }, [isNewGoal, hasShownNewGoalMessage, goal, capacity, onChatOpened]);
  // Existing initial greeting - only show if not a new goal
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
        text: `Hi! I'm tracking your **${goal.name}** goal. 
        
You need to save **₹${Math.round(monthlyRequired).toLocaleString()}/month** for the next **${monthsRemaining} months** to reach your target of ₹${goal.targetAmount.toLocaleString()}.

I can help you with savings tips, timeline adjustments, or investment options to reach your goal faster. What would you like to know?`,
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
  const shouldPromptInvestment = (text: string, msgCount: number): boolean => {
    const lower = text.toLowerCase();
    const investmentKeywords = [
    'invest',
    'grow',
    'stock',
    'fund',
    'mutual',
    'sip',
    'faster',
    'quick',
    'returns',
    'interest'];

    // Prompt if user mentions investment-related keywords
    if (investmentKeywords.some((keyword) => lower.includes(keyword))) {
      return true;
    }
    // Prompt after 3 user messages if not already prompted
    if (msgCount >= 3 && !hasPromptedInvestment) {
      return true;
    }
    return false;
  };
  const handleSend = async () => {
    if (!input.trim()) return;
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
    const shouldShowInvestments = shouldPromptInvestment(
      input,
      messageCountRef.current
    );
    // Simulate AI response
    setTimeout(async () => {
      const response = generateResponse(
        input,
        goal,
        capacity,
        shouldShowInvestments
      );
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
      // If we should show investments, fetch them
      if (shouldShowInvestments && !hasPromptedInvestment) {
        setHasPromptedInvestment(true);
        // Add investment prompt after a short delay
        setTimeout(() => {
          const promptMsg: GoalChatMessage = {
            id: Date.now().toString() + '_prompt',
            goalId: goal.id,
            text: 'Would you like to explore investment options that could help you reach this goal faster? I can show you suitable funds based on your timeline and risk profile.',
            sender: 'bot',
            timestamp: new Date().toISOString(),
            type: 'investment_prompt'
          };
          setMessages((prev) => [...prev, promptMsg]);
        }, 1500);
      }
    }, 1500);
  };
  const generateResponse = (
  text: string,
  goal: Goal,
  capacity: SavingsCapacity | null,
  willPromptInvestment: boolean)
  : GoalChatMessage => {
    const lower = text.toLowerCase();
    let responseText = '';
    if (
    lower.includes('invest') ||
    lower.includes('grow') ||
    lower.includes('stock') ||
    lower.includes('fund') ||
    lower.includes('sip'))
    {
      responseText =
      'Great thinking! Investing can help your money grow faster than a regular savings account. Let me show you some options that match your goal timeline and risk profile.';
      setShowInvestments(true);
      fetchInvestmentRecommendations();
    } else if (
    lower.includes('fast') ||
    lower.includes('quick') ||
    lower.includes('sooner'))
    {
      responseText = `To reach your goal faster, here are some strategies:

1. **Increase monthly savings** by cutting non-essential expenses
2. **Allocate windfalls** (bonuses, refunds, gifts) directly to this goal
3. **Consider investing** a portion for potentially higher returns

${willPromptInvestment ? '' : 'Would you like me to suggest some investment options?'}`;
    } else if (
    lower.includes('hard') ||
    lower.includes('difficult') ||
    lower.includes("can't") ||
    lower.includes('struggle'))
    {
      const deadline = new Date(goal.deadline);
      const monthsRemaining = Math.max(
        1,
        Math.ceil(
          (deadline.getTime() - new Date().getTime()) / (
          1000 * 60 * 60 * 24 * 30)
        )
      );
      const currentMonthly =
      (goal.targetAmount - goal.savedAmount) / monthsRemaining;
      const extendedMonthly =
      (goal.targetAmount - goal.savedAmount) / (monthsRemaining + 6);
      responseText = `I understand saving can be challenging. Here are some options:

1. **Extend your timeline by 6 months** - This would reduce your monthly requirement from ₹${Math.round(currentMonthly).toLocaleString()} to ₹${Math.round(extendedMonthly).toLocaleString()}

2. **Review your commitments** - Small reductions in non-essentials can add up

3. **Set up auto-transfer** - Automating savings removes the temptation to skip

Would you like me to help with any of these?`;
    } else if (
    lower.includes('progress') ||
    lower.includes('how am i') ||
    lower.includes('status'))
    {
      const progress = goal.savedAmount / goal.targetAmount * 100;
      const remaining = goal.targetAmount - goal.savedAmount;
      responseText = `Here's your progress update:

📊 **${Math.round(progress)}% complete**
✅ Saved: ₹${goal.savedAmount.toLocaleString()}
🎯 Remaining: ₹${remaining.toLocaleString()}

${progress >= 50 ? "You're doing great! More than halfway there! 🎉" : 'Keep going! Every contribution brings you closer to your goal.'}`;
    } else {
      responseText = `I'm here to help you reach your **${goal.name}** goal! 

You can ask me about:
• Your current progress and timeline
• Tips to save faster
• Investment options to grow your savings
• Adjusting your goal if needed

What would you like to know?`;
    }
    return {
      id: Date.now().toString(),
      goalId: goal.id,
      text: responseText,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: showInvestments ? 'investment_options' : 'text'
    };
  };
  const handleInvestmentResponse = async (interested: boolean) => {
    if (interested) {
      const msg: GoalChatMessage = {
        id: Date.now().toString(),
        goalId: goal.id,
        text: 'Yes, show me investment options!',
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, msg]);
      setIsTyping(true);
      setShowInvestments(true);
      // Fetch investment data
      await fetchInvestmentRecommendations();
      setTimeout(() => {
        const botMsg: GoalChatMessage = {
          id: Date.now().toString() + '_opts',
          goalId: goal.id,
          text: 'Here are some investment options tailored to your goal. These are selected based on your timeline and a balanced approach to risk:',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          type: 'investment_options'
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 1000);
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

                    {/* Investment Prompt Actions */}
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
                          Yes, explore options
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