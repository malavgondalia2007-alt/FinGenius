import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Briefcase,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  HelpCircle,
  LifeBuoy,
  Shield,
  LogOut,
  ChevronRight,
  GraduationCap,
  Lock } from
'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/database';
import { UserProfile } from '../types';
export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<'student' | 'employee'>('student');
  // Student fields
  const [pocketMoney, setPocketMoney] = useState('');
  const [expenses, setExpenses] = useState('');
  // Employee fields
  const [income, setIncome] = useState('');
  const [showCommitments, setShowCommitments] = useState(true);
  // Fixed Expenses
  const [rent, setRent] = useState('');
  const [groceries, setGroceries] = useState('');
  const [utilities, setUtilities] = useState('');
  // Loans
  const [homeLoan, setHomeLoan] = useState('');
  const [carLoan, setCarLoan] = useState('');
  const [personalLoan, setPersonalLoan] = useState('');
  const [educationLoan, setEducationLoan] = useState('');
  // SIP
  const [sipCommitments, setSipCommitments] = useState('');
  useEffect(() => {
    if (user) {
      const p = db.profiles.getByUserId(user.id);
      if (p) {
        setProfile(p);
        setMode(p.type);
        if (p.type === 'student') {
          setPocketMoney(p.weeklyPocketMoney?.toString() || '');
          setExpenses(p.weeklyExpenses?.toString() || '');
        } else {
          setIncome(p.monthlyIncome?.toString() || '');
          setRent(p.fixedExpenses?.rent?.toString() || '');
          setGroceries(p.fixedExpenses?.groceries?.toString() || '');
          setUtilities(p.fixedExpenses?.utilities?.toString() || '');
          setHomeLoan(p.loans?.homeLoan?.toString() || '');
          setCarLoan(p.loans?.carLoan?.toString() || '');
          setPersonalLoan(p.loans?.personalLoan?.toString() || '');
          setEducationLoan(p.loans?.educationLoan?.toString() || '');
          setSipCommitments(p.sipCommitments?.toString() || '');
        }
      }
    }
  }, [user]);
  const totalFixedExpenses =
  (parseFloat(rent) || 0) + (
  parseFloat(groceries) || 0) + (
  parseFloat(utilities) || 0);
  const totalLoans =
  (parseFloat(homeLoan) || 0) + (
  parseFloat(carLoan) || 0) + (
  parseFloat(personalLoan) || 0) + (
  parseFloat(educationLoan) || 0);
  const totalSips = parseFloat(sipCommitments) || 0;
  const totalCommitments = totalFixedExpenses + totalLoans + totalSips;
  const remainingIncome = (parseFloat(income) || 0) - totalCommitments;
  const handleSave = () => {
    if (!user || !profile) return;
    const updates: Partial<UserProfile> = {};
    if (mode === 'student') {
      updates.weeklyPocketMoney = parseFloat(pocketMoney) || 0;
      updates.weeklyExpenses = parseFloat(expenses) || 0;
    } else {
      updates.monthlyIncome = parseFloat(income) || 0;
      updates.fixedExpenses = {
        rent: parseFloat(rent) || 0,
        groceries: parseFloat(groceries) || 0,
        utilities: parseFloat(utilities) || 0
      };
      updates.loans = {
        homeLoan: parseFloat(homeLoan) || 0,
        carLoan: parseFloat(carLoan) || 0,
        personalLoan: parseFloat(personalLoan) || 0,
        educationLoan: parseFloat(educationLoan) || 0
      };
      updates.sipCommitments = parseFloat(sipCommitments) || 0;
    }
    db.profiles.update(user.id, updates);
    alert('Settings saved successfully!');
    const updatedProfile = db.profiles.getByUserId(user.id);
    if (updatedProfile) setProfile(updatedProfile);
  };
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };
  if (!user || !profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </Layout>);

  }
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Settings & Preferences
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your account, profile, and app preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Profile */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Financial Profile
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Switching modes will adapt the dashboard, advice, and goals to
                your current life stage.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Student Mode */}
                <button
                  onClick={() => setMode('student')}
                  className={`p-6 rounded-xl border-2 transition-all ${mode === 'student' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>

                  <GraduationCap
                    className={`w-12 h-12 mx-auto mb-3 ${mode === 'student' ? 'text-purple-600' : 'text-gray-400'}`} />

                  <h3
                    className={`font-bold mb-2 ${mode === 'student' ? 'text-purple-900' : 'text-gray-900'}`}>

                    Student Mode
                  </h3>
                  <p className="text-sm text-gray-600">
                    Weekly budget, pocket money tracking, small goals.
                  </p>
                </button>

                {/* Employee Mode */}
                <button
                  onClick={() => setMode('employee')}
                  className={`p-6 rounded-xl border-2 transition-all ${mode === 'employee' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>

                  <Briefcase
                    className={`w-12 h-12 mx-auto mb-3 ${mode === 'employee' ? 'text-purple-600' : 'text-gray-400'}`} />

                  <h3
                    className={`font-bold mb-2 ${mode === 'employee' ? 'text-purple-900' : 'text-gray-900'}`}>

                    Employee Mode
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monthly salary, fixed expenses, investments, tax planning.
                  </p>
                </button>
              </div>
            </Card>

            {/* Financial Details */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Financial Details
              </h2>

              <div className="space-y-6">
                {mode === 'student' ?
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                    label="Weekly Pocket Money (₹)"
                    type="number"
                    value={pocketMoney}
                    onChange={(e) => setPocketMoney(e.target.value)} />

                    <Input
                    label="Est. Weekly Expenses (₹)"
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)} />

                  </div> :

                <div className="space-y-6">
                    {/* Monthly Income */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Income (₹)
                      </label>
                      <Input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      placeholder="85000" />

                      <p className="text-xs text-gray-500 mt-2">
                        💡 Fixed expenses can be updated in the Onboarding flow
                        (reset required).
                      </p>
                    </div>

                    {/* Commitments Toggle */}
                    <div className="text-center">
                      <button
                      type="button"
                      onClick={() => setShowCommitments(!showCommitments)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all font-medium shadow-sm">

                        {showCommitments ?
                      <>
                            <ChevronUp className="w-5 h-5" />
                            Hide Financial Commitments
                          </> :

                      <>
                            <ChevronDown className="w-5 h-5" />
                            Edit Financial Commitments
                          </>
                      }
                      </button>
                    </div>

                    {showCommitments &&
                  <div className="space-y-6 animate-fade-in">
                        {/* Fixed Expenses */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <h3 className="font-bold text-gray-900 mb-4">
                            Fixed Monthly Expenses
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                          label="Rent"
                          type="number"
                          value={rent}
                          onChange={(e) => setRent(e.target.value)}
                          placeholder="0" />

                            <Input
                          label="Groceries"
                          type="number"
                          value={groceries}
                          onChange={(e) => setGroceries(e.target.value)}
                          placeholder="0" />

                            <Input
                          label="Utilities"
                          type="number"
                          value={utilities}
                          onChange={(e) => setUtilities(e.target.value)}
                          placeholder="0" />

                          </div>
                          {totalFixedExpenses > 0 &&
                      <div className="mt-4 text-right text-sm bg-blue-50 p-3 rounded-lg">
                              Total:{' '}
                              <span className="font-bold text-blue-700">
                                ₹{totalFixedExpenses.toLocaleString()}
                              </span>
                            </div>
                      }
                        </div>

                        {/* Loans */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <h3 className="font-bold text-gray-900 mb-4">
                            Loan EMIs (Monthly)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                          label="Home Loan"
                          type="number"
                          value={homeLoan}
                          onChange={(e) => setHomeLoan(e.target.value)}
                          placeholder="0" />

                            <Input
                          label="Car Loan"
                          type="number"
                          value={carLoan}
                          onChange={(e) => setCarLoan(e.target.value)}
                          placeholder="0" />

                            <Input
                          label="Personal Loan"
                          type="number"
                          value={personalLoan}
                          onChange={(e) => setPersonalLoan(e.target.value)}
                          placeholder="0" />

                            <Input
                          label="Education Loan"
                          type="number"
                          value={educationLoan}
                          onChange={(e) => setEducationLoan(e.target.value)}
                          placeholder="0" />

                          </div>
                          {totalLoans > 0 &&
                      <div className="mt-4 text-right text-sm bg-orange-50 p-3 rounded-lg">
                              Total:{' '}
                              <span className="font-bold text-orange-700">
                                ₹{totalLoans.toLocaleString()}
                              </span>
                            </div>
                      }
                        </div>

                        {/* SIP */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <h3 className="font-bold text-gray-900 mb-4">
                            SIP Commitments
                          </h3>
                          <Input
                        label="Total Monthly SIP (₹)"
                        type="number"
                        value={sipCommitments}
                        onChange={(e) => setSipCommitments(e.target.value)}
                        placeholder="0" />

                        </div>

                        {/* Summary */}
                        {income &&
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                            <h3 className="font-bold text-blue-900 mb-4">
                              Your Savings Capacity
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-blue-800">
                                  Monthly Income:
                                </span>
                                <span className="font-bold text-blue-900">
                                  ₹{(parseFloat(income) || 0).toLocaleString()}
                                </span>
                              </div>
                              {totalCommitments > 0 &&
                        <>
                                  {totalFixedExpenses > 0 &&
                          <div className="flex justify-between text-gray-600">
                                      <span>− Fixed Expenses:</span>
                                      <span>
                                        ₹{totalFixedExpenses.toLocaleString()}
                                      </span>
                                    </div>
                          }
                                  {totalLoans > 0 &&
                          <div className="flex justify-between text-gray-600">
                                      <span>− Loan EMIs:</span>
                                      <span>
                                        ₹{totalLoans.toLocaleString()}
                                      </span>
                                    </div>
                          }
                                  {totalSips > 0 &&
                          <div className="flex justify-between text-gray-600">
                                      <span>− SIP Commitments:</span>
                                      <span>₹{totalSips.toLocaleString()}</span>
                                    </div>
                          }
                                  <div className="border-t-2 border-blue-300 pt-2 flex justify-between">
                                    <span className="font-bold text-blue-900">
                                      Remaining Income:
                                    </span>
                                    <span className="font-bold text-blue-900 text-lg">
                                      ₹
                                      {Math.max(
                                0,
                                remainingIncome
                              ).toLocaleString()}
                                    </span>
                                  </div>
                                </>
                        }
                            </div>
                          </div>
                    }
                      </div>
                  }
                  </div>
                }
              </div>

              <Button onClick={handleSave} className="mt-6 w-full md:w-auto">
                💾 Save Changes
              </Button>
            </Card>
          </div>

          {/* Quick Actions Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-2">
                {/* Monthly Report */}
                <button
                  onClick={() => navigate('/report')}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">Monthly Report</p>
                      <p className="text-xs text-gray-600">
                        View financial summary
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </button>

                {/* How It Works */}
                <button
                  onClick={() => navigate('/how-it-works')}
                  className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors group">

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                      <HelpCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">How It Works</p>
                      <p className="text-xs text-gray-600">Guide & features</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </button>

                {/* Support & Help */}
                <button
                  onClick={() => navigate('/support')}
                  className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group">

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <LifeBuoy className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">Support & Help</p>
                      <p className="text-xs text-gray-600">Get assistance</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </button>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-white hover:bg-red-50 rounded-xl transition-colors group border-2 border-gray-200 hover:border-red-200 mt-6">

                  <LogOut className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-600">Sign Out</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>);

}