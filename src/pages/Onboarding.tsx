import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/database';
import { UserProfile } from '../types';
import { ProgressBar } from '../components/onboarding/ProgressBar';
import { WelcomeStep } from '../components/onboarding/WelcomeStep';
import { AgeStep } from '../components/onboarding/AgeStep';
import { TypeStep } from '../components/onboarding/TypeStep';
import { StudentDataStep } from '../components/onboarding/StudentDataStep';
import { EmployeeDataStep } from '../components/onboarding/EmployeeDataStep';
import { CompletionStep } from '../components/onboarding/CompletionStep';
export function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  // Calculate total steps dynamically based on age
  const getTotalSteps = () => {
    if (!profileData.age) return 4;
    // Under 18: Welcome → Age → Financial Data → Completion (4 steps)
    // 18+: Welcome → Age → Type Selection → Financial Data → Completion (5 steps)
    return profileData.age < 18 ? 4 : 5;
  };
  const handleNext = (data?: any) => {
    if (data) {
      setProfileData((prev) => ({
        ...prev,
        ...data
      }));
      // Auto-assign student type for users under 18
      if (data.age && data.age < 18) {
        setProfileData((prev) => ({
          ...prev,
          age: data.age,
          type: 'student'
        }));
      }
    }
    setStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setStep((prev) => prev - 1);
  };
  const handleFinish = () => {
    if (!user) return;
    const finalProfile: UserProfile = {
      userId: user.id,
      age: profileData.age || 18,
      type: profileData.type as 'student' | 'employee',
      onboardingComplete: true,
      ...profileData
    };
    db.profiles.create(finalProfile);
    refreshProfile();
    navigate('/dashboard');
  };
  // Determine which step to show based on age
  const shouldShowTypeStep =
  profileData.age !== undefined && profileData.age >= 18;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="font-bold text-xl text-gray-900">
            FinGenius Setup
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <ProgressBar currentStep={step} totalSteps={getTotalSteps()} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 1 && <WelcomeStep onNext={() => handleNext()} />}

          {step === 2 &&
          <AgeStep
            onNext={(age) =>
            handleNext({
              age
            })
            }
            onBack={handleBack} />

          }

          {/* Type selection step - only shown for users 18+ */}
          {step === 3 && shouldShowTypeStep &&
          <TypeStep
            onNext={(type) =>
            handleNext({
              type
            })
            }
            onBack={handleBack} />

          }

          {/* Financial data step - step 3 for under 18, step 4 for 18+ */}
          {(step === 3 && !shouldShowTypeStep ||
          step === 4 && shouldShowTypeStep) &&
          <>
              {profileData.type === 'student' &&
            <StudentDataStep
              onNext={(data) => {
                setProfileData((prev) => ({
                  ...prev,
                  ...data
                }));
                setStep(step + 1);
              }}
              onBack={handleBack} />

            }

              {profileData.type === 'employee' &&
            <EmployeeDataStep
              onNext={(data) => {
                setProfileData((prev) => ({
                  ...prev,
                  ...data
                }));
                setStep(step + 1);
              }}
              onBack={handleBack} />

            }
            </>
          }

          {/* Completion step - step 4 for under 18, step 5 for 18+ */}
          {(step === 4 && !shouldShowTypeStep ||
          step === 5 && shouldShowTypeStep) &&
          <CompletionStep onFinish={handleFinish} />
          }
        </div>
      </main>
    </div>);

}