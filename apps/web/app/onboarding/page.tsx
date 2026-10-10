"use client";

import { useOnboarding } from './OnboardingContext';
import { StepForms } from '@/components/onboarding/StepForms';
import { PlacementTest } from '@/components/onboarding/PlacementTest';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function OnboardingContent() {
  const { currentStep, isHydrated, updateData, data } = useOnboarding();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isHydrated && searchParams?.has('country') && !data.goal?.target_country) {
      const country = searchParams.get('country');
      if (country) {
        setTimeout(() => {
          updateData({ goal: { ...data.goal, target_country: country as any, purpose: data.goal?.purpose || '' } as any });
        }, 0);
      }
    }
  }, [isHydrated, searchParams, data.goal?.target_country, updateData]);

  if (!isHydrated) return null; // Avoid hydration mismatch on initial render

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Step {currentStep} of 8</span>
          <span>{currentStep === 8 ? 'Placement Test' : 'Profile Setup'}</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
        {currentStep < 8 ? <StepForms /> : <PlacementTest />}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading onboarding...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

