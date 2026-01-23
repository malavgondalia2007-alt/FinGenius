import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { SupportCard } from '../components/SupportCard';
import { HelpChatbot } from '../components/HelpChatbot';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/database';
import { SupportTicket } from '../types';
import {
  Mail,
  MessageCircle,
  Phone,
  Clock,
  HelpCircle,
  FileText,
  TrendingUp,
  User,
  Download,
  ExternalLink,
  Send,
  CheckCircle,
  MessageSquare } from
'lucide-react';
export function Support() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  // Ticket State
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
  useEffect(() => {
    if (user) {
      const tickets = db.support.getByUserId(user.id);
      setUserTickets(tickets);
    }
  }, [user, submitSuccess]);
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject || !message) return;
    setIsSubmitting(true);
    const newTicket: SupportTicket = {
      id: `t${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      subject,
      message,
      status: 'open',
      priority,
      createdAt: new Date().toISOString()
    };
    db.support.create(newTicket);
    // Simulate network delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSubject('');
      setMessage('');
      setPriority('medium');
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 1000);
  };
  const faqCategories = {
    'getting-started': [
    {
      question: 'How do I create an account?',
      answer:
      'Click on the "Sign Up" button on the login page. Fill in your name, email, and password. After creating your account, you\'ll be guided through a quick onboarding process to set up your financial profile based on whether you\'re a student or employee.'
    },
    {
      question: 'What information do I need to provide during onboarding?',
      answer:
      'Students need to provide their age and weekly pocket money. Employees need to provide their age, monthly income, and fixed expenses (rent, groceries, utilities). This helps us provide personalized financial recommendations.'
    },
    {
      question: 'Can I change my profile type later?',
      answer:
      'Yes! You can update your profile type and financial information anytime from the Settings page. Your data and recommendations will automatically adjust to reflect the changes.'
    }],

    features: [
    {
      question: 'How does expense tracking work?',
      answer:
      'You can manually log expenses by category (Food, Transport, Housing, etc.) or upload a CSV file with bulk expenses. Each expense is categorized as essential or non-essential, helping you understand your spending patterns.'
    },
    {
      question: 'What is the Smart Goal Planner?',
      answer:
      'The Smart Goal Planner uses AI to help you set realistic savings goals based on your income and expenses. It calculates your savings capacity and suggests optimal timelines for achieving your financial goals.'
    },
    {
      question: 'How do I track my progress?',
      answer:
      'Your Dashboard shows real-time metrics including net savings, total expenses, and goal progress. You can also view detailed monthly reports and AI-powered insights about your financial health.'
    }],

    investments: [
    {
      question: 'Can I invest through FinGenius?',
      answer:
      "FinGenius is an educational platform that provides investment guidance and suggestions. We don't facilitate actual investments, but we show you live market data for stocks, mutual funds, and SIP plans to help you make informed decisions."
    },
    {
      question: 'Are there age restrictions for viewing investments?',
      answer:
      'Users under 18 can view investment information for educational purposes but cannot invest. Students are advised to build an emergency fund first before considering investments.'
    },
    {
      question: 'How accurate is the investment data?',
      answer:
      'We display real-time market data for educational purposes. Always consult with a certified financial advisor before making any investment decisions.'
    }],

    account: [
    {
      question: 'Is my financial data secure?',
      answer:
      'Yes! Your data is stored securely using industry-standard encryption. We never share your financial information with third parties without your explicit consent. All data is stored locally in your browser.'
    },
    {
      question: 'How do I reset my password?',
      answer:
      'Click "Forgot Password" on the login page and follow the instructions sent to your email. For security reasons, password resets require email verification.'
    },
    {
      question: 'Can I export my financial data?',
      answer:
      'Yes! You can export your expense data as CSV files from the Expenses page. This allows you to analyze your data in external tools or keep backups.'
    }]

  };
  const categories = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: HelpCircle
  },
  {
    id: 'features',
    label: 'Features',
    icon: FileText
  },
  {
    id: 'investments',
    label: 'Investments',
    icon: TrendingUp
  },
  {
    id: 'account',
    label: 'Account',
    icon: User
  }];

  return (
    <Layout>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Support & Help Center
        </h1>
        <p className="text-lg text-gray-600">
          Everything you need to know about FinGenius
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Ticket Submission Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Submit a Request
                </h2>
                <p className="text-gray-500 text-sm">
                  Our team typically responds within 24 hours
                </p>
              </div>
            </div>

            {submitSuccess ?
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Ticket Submitted!
                </h3>
                <p className="text-green-700">
                  We've received your request and will get back to you shortly.
                  You can track the status in "My Tickets".
                </p>
                <Button
                className="mt-6"
                onClick={() => setSubmitSuccess(false)}
                variant="outline">

                  Submit Another Request
                </Button>
              </div> :

            <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input
                    placeholder="Brief summary of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all">

                      <option value="low">Low - General Question</option>
                      <option value="medium">Medium - Feature Issue</option>
                      <option value="high">High - Critical Problem</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                  rows={6}
                  placeholder="Describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none" />

                </div>

                <div className="flex justify-end">
                  <Button
                  type="submit"
                  disabled={isSubmitting || !subject || !message}>

                    {isSubmitting ?
                  <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </span> :

                  <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Submit Ticket
                      </span>
                  }
                  </Button>
                </div>
              </form>
            }
          </Card>
        </div>

        {/* My Tickets Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              My Tickets
            </h2>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[400px]">
              {userTickets.length > 0 ?
              userTickets.map((ticket) =>
              <div
                key={ticket.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">

                    <div className="flex justify-between items-start mb-2">
                      <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${ticket.status === 'open' ? 'bg-blue-100 text-blue-700' : ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>

                        {ticket.status.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">
                      {ticket.subject}
                    </h3>
                    {ticket.adminResponse &&
                <div className="mt-2 text-xs bg-purple-50 text-purple-700 p-2 rounded border border-purple-100">
                        <span className="font-bold">Admin:</span>{' '}
                        {ticket.adminResponse}
                      </div>
                }
                  </div>
              ) :

              <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No tickets yet</p>
                </div>
              }
            </div>
          </Card>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SupportCard
          title="Email Support"
          description="Get help via email within 24 hours"
          contact="support@fingenius.com"
          icon={<Mail className="w-8 h-8" />}
          bgColor="bg-blue-500" />

        <SupportCard
          title="Live Chat"
          description="Chat with our support team in real-time"
          contact="Available 9 AM - 6 PM IST"
          icon={<MessageCircle className="w-8 h-8" />}
          bgColor="bg-green-500" />

        <SupportCard
          title="Phone Support"
          description="Call our support team directly"
          contact="+91 1800-123-4567"
          icon={<Phone className="w-8 h-8" />}
          bgColor="bg-purple-500" />

        <SupportCard
          title="Response Time"
          description="Average response time"
          contact="Less than 1 hour"
          icon={<Clock className="w-8 h-8" />}
          bgColor="bg-orange-500" />

      </div>

      {/* FAQ Section */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>

        {/* Category Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedFaq(null);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>

                <Icon className="w-4 h-4" />
                {cat.label}
              </button>);

          })}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqCategories[activeCategory as keyof typeof faqCategories].map(
            (faq, index) =>
            <Card
              key={index}
              className={`transition-all cursor-pointer ${expandedFaq === index ? 'border-purple-200 shadow-md' : 'hover:border-gray-300'}`}
              onClick={() =>
              setExpandedFaq(expandedFaq === index ? null : index)
              }>

                <div className="p-5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <span
                    className={`text-gray-400 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}>

                      ▼
                    </span>
                  </div>
                  {expandedFaq === index &&
                <p className="mt-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </p>
                }
                </div>
              </Card>

          )}
        </div>

        {/* Additional Resources */}
        <Card className="mt-12 p-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Additional Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="#"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group">

              <Download className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-purple-600">
                  User Guide PDF
                </p>
                <p className="text-xs text-gray-500">Complete documentation</p>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group">

              <ExternalLink className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-purple-600">
                  Knowledge Base
                </p>
                <p className="text-xs text-gray-500">
                  Detailed articles and guides
                </p>
              </div>
            </a>
          </div>
        </Card>
      </div>

      <HelpChatbot />
    </Layout>);

}