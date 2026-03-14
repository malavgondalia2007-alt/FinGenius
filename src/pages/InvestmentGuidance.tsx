import React, { useState, Component } from 'react';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { InvestmentGuidanceChat } from '../components/investments/InvestmentGuidanceChat';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/database';
import { calculateSavingsCapacity } from '../utils/savingsCalculations';
export function InvestmentGuidance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = user ? db.profiles.getByUserId(user.id) : null;
  const savingsCapacity = profile ? calculateSavingsCapacity(profile) : null;
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/investments')}
            className="flex items-center gap-2">

            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-coral p-2.5 rounded-xl shadow-warm-md">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-charcoal">
                Investment Guidance
              </h1>
              <p className="text-sm text-charcoal-500">
                AI-powered investment assistant
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-cream border border-gray-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="bg-white p-2 rounded-lg flex-shrink-0 border border-gray-100">
          <Lightbulb className="w-5 h-5 text-coral" />
        </div>
        <div>
          <h3 className="font-semibold text-charcoal mb-1">
            Your Personal Investment Assistant
          </h3>
          <p className="text-sm text-charcoal-600">
            Ask about mutual funds, SIPs, risk profiles, or get personalized
            investment recommendations based on your financial goals.
          </p>
        </div>
      </div>

      {/* Chat Component */}
      <div className="bg-white rounded-2xl shadow-warm-md border border-gray-100 overflow-hidden">
        <InvestmentGuidanceChat
          profile={profile}
          capacity={savingsCapacity}
          isOpen={true}
          onToggle={() => {}} />

      </div>

      {/* Disclaimer */}
      <div className="text-center pb-4">
        <p className="text-xs text-charcoal-400">
          💡 This is an AI assistant for educational purposes. Always consult a
          certified financial advisor before making investment decisions.
        </p>
      </div>
    </div>);

}