import React from 'react';
import { Layout } from '../components/Layout';
import { FeatureCard } from '../components/FeatureCard';
import { Card } from '../components/ui/Card';
import {
  LayoutDashboard,
  CreditCard,
  Target,
  TrendingUp,
  UserPlus,
  ClipboardList,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
  Brain,
  Shield,
  TrendingDown,
  Calendar,
  Wallet } from
'lucide-react';
export function HowItWorks() {
  const gettingStartedSteps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Create Your Account',
    description:
    'Sign up in seconds with just your email and password. No credit card required.',
    color: 'bg-blue-600'
  },
  {
    number: 2,
    icon: ClipboardList,
    title: 'Complete Onboarding',
    description:
    "Tell us if you're a student or employee, your income, and basic expenses. Takes less than 2 minutes.",
    color: 'bg-purple-600'
  },
  {
    number: 3,
    icon: BarChart3,
    title: 'Start Tracking',
    description:
    'Log your first expense, set a savings goal, or explore investment options. Your financial journey begins!',
    color: 'bg-emerald-600'
  }];

  const workflowSteps = [
  {
    icon: CreditCard,
    title: 'Track Every Rupee',
    description:
    'Log expenses manually or upload CSV files. FinGenius automatically categorizes them as essential or non-essential.',
    features: [
    'Manual entry',
    'Bulk CSV upload',
    'Auto-categorization',
    'Spending insights'],

    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    icon: Brain,
    title: 'AI Analyzes Your Habits',
    description:
    'Our AI engine studies your spending patterns, income, and commitments to understand your financial behavior.',
    features: [
    'Pattern recognition',
    'Spending trends',
    'Savings capacity',
    'Smart warnings'],

    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    icon: Target,
    title: 'Set Smart Goals',
    description:
    'Create savings goals with AI-powered recommendations. Get realistic timelines based on your actual capacity.',
    features: [
    'Goal wizard',
    'Timeline calculator',
    'Progress tracking',
    'AI chat assistant'],

    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Wealth',
    description:
    'Explore investment options tailored to your goals. View live market data and get personalized fund recommendations.',
    features: [
    'Mutual funds',
    'SIP plans',
    'Risk profiling',
    'Performance tracking'],

    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }];

  const integrationFeatures = [
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    description:
    'Get personalized recommendations based on your unique financial situation.'
  },
  {
    icon: Shield,
    title: 'Smart Warnings',
    description:
    'Receive alerts when spending exceeds healthy limits or goals are at risk.'
  },
  {
    icon: Calendar,
    title: 'Scenario Planning',
    description:
    'Test "what-if" scenarios before making major financial decisions.'
  },
  {
    icon: Wallet,
    title: 'Holistic View',
    description:
    'See how expenses, goals, and investments work together in one dashboard.'
  }];

  return (
    <Layout>
      <div className="text-center mb-16 mt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          How FinGenius Works
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Master your finances with our AI-powered personal finance assistant
        </p>
      </div>

      {/* Getting Started Section */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Getting Started in 3 Easy Steps
          </h2>
          <p className="text-gray-600">
            From signup to your first financial insight in under 5 minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {gettingStartedSteps.map((step, index) =>
          <div key={step.number} className="relative">
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <div
                className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-md`}>

                  {step.number}
                </div>
                <div
                className={`p-3 ${step.color} bg-opacity-10 rounded-lg inline-block mb-4`}>

                  <step.icon
                  className={`w-6 h-6 ${step.color.replace('bg-', 'text-')}`} />

                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </Card>
              {index < gettingStartedSteps.length - 1 &&
            <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-gray-300" />
                </div>
            }
            </div>
          )}
        </div>
      </div>

      {/* Your Financial Journey Section */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Your Financial Journey with FinGenius
          </h2>
          <p className="text-gray-600">
            A complete workflow designed to help you achieve financial success
          </p>
        </div>

        <div className="space-y-6">
          {workflowSteps.map((step, index) =>
          <Card key={index} className="p-6 hover:shadow-lg transition-all">
              <div className="flex flex-col md:flex-row gap-6">
                <div
                className={`flex-shrink-0 w-16 h-16 ${step.bgColor} rounded-xl flex items-center justify-center`}>

                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Step {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {step.features.map((feature, idx) =>
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm">

                        <CheckCircle
                      className={`w-4 h-4 ${step.color} flex-shrink-0`} />

                        <span className="text-gray-700">{feature}</span>
                      </div>
                  )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* How Features Work Together */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Everything Works Together
          </h2>
          <p className="text-gray-600">
            FinGenius integrates all features to give you a complete financial
            picture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {integrationFeatures.map((feature, index) =>
          <Card
            key={index}
            className="p-6 text-center hover:shadow-lg transition-shadow">

              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </Card>
          )}
        </div>

        {/* Integration Flow Diagram */}
        <Card className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            The Complete Integration Flow
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">Expenses</p>
              <p className="text-xs text-gray-600">Track spending</p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">AI Analysis</p>
              <p className="text-xs text-gray-600">Find patterns</p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">Smart Goals</p>
              <p className="text-xs text-gray-600">Plan savings</p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">Investments</p>
              <p className="text-xs text-gray-600">Grow wealth</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Real-World Example */}
      <div className="max-w-4xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Real-World Example
          </h2>
          <p className="text-gray-600">
            See how Priya used FinGenius to save ₹50,000 in 6 months
          </p>
        </div>

        <Card className="p-8 bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 border-2 border-purple-100">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">
                  Month 1: Setup & Discovery
                </h4>
                <p className="text-gray-700 text-sm">
                  Priya signed up, completed onboarding (₹40,000 monthly income,
                  ₹25,000 expenses). She logged her expenses for 2 weeks and
                  discovered she was spending ₹8,000/month on food delivery.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">
                  Month 2-3: Smart Adjustments
                </h4>
                <p className="text-gray-700 text-sm">
                  Using AI insights, she reduced food delivery to ₹4,000/month
                  by cooking more. She set a goal to save ₹50,000 in 6 months.
                  FinGenius calculated she needed to save ₹8,333/month.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">
                  Month 4-6: Goal Achievement
                </h4>
                <p className="text-gray-700 text-sm">
                  With consistent tracking and smart warnings, Priya stayed on
                  track. She even started a small SIP of ₹2,000/month. By month
                  6, she reached her ₹50,000 goal!
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-emerald-600" />
                <h4 className="font-bold text-gray-900">Key Success Factors</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">₹4,000</p>
                  <p className="text-xs text-gray-600">
                    Monthly savings from insights
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">100%</p>
                  <p className="text-xs text-gray-600">Goal completion rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">6</p>
                  <p className="text-xs text-gray-600">
                    Months to achieve goal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Core Features Section */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Core Features
          </h2>
          <p className="text-gray-600">
            Powerful tools designed to help you succeed financially
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeatureCard
            title="Dashboard"
            description="Get a complete overview of your financial health with key metrics, trends, and insights at a glance."
            features={[
            'Real-time financial metrics',
            'Savings trends visualization',
            'Goal progress tracking',
            'Investment portfolio snapshot']
            }
            icon={<LayoutDashboard className="w-10 h-10 text-white" />}
            colorClass="bg-blue-600" />


          <FeatureCard
            title="Expense Tracking"
            description="Log and categorize expenses effortlessly. Visualize spending patterns with interactive charts."
            features={[
            'Quick expense logging',
            'Category-based breakdown',
            'Essential vs Non-essential tracking',
            'Expense charts and analytics']
            }
            icon={<CreditCard className="w-10 h-10 text-white" />}
            colorClass="bg-orange-500" />


          <FeatureCard
            title="Financial Goals"
            description="Set savings goals and use our Smart Goal Planner to get personalized recommendations."
            features={[
            'Create custom savings goals',
            'Track progress with visual bars',
            'Smart contribution suggestions',
            'Timeline estimation']
            }
            icon={<Target className="w-10 h-10 text-white" />}
            colorClass="bg-emerald-500" />


          <FeatureCard
            title="Investment Portfolio"
            description="Browse mutual funds, stocks, and set up Systematic Investment Plans (SIPs) to grow your wealth."
            features={[
            'Curated fund recommendations',
            'Risk-based categorization',
            'Performance tracking',
            'One-click investment']
            }
            icon={<TrendingUp className="w-10 h-10 text-white" />}
            colorClass="bg-purple-600" />

        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <Card className="p-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already mastering their finances
            with FinGenius. Start your journey to financial freedom today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
              Get Started Free
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-colors">
              View Demo
            </button>
          </div>
        </Card>
      </div>
    </Layout>);

}