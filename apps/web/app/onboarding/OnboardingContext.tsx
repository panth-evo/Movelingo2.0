/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProfileInput } from '@/lib/types';

interface OnboardingContextType {
  data: Partial<ProfileInput>;
  updateData: (stepData: Partial<ProfileInput>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isHydrated: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Partial<ProfileInput>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('onboarding_draft');
    let hasName = false;
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData(parsed);
        if (parsed.name) hasName = true;
      } catch (e) {}
    }
    const savedStep = localStorage.getItem('onboarding_step');
    if (savedStep) {
      const step = parseInt(savedStep, 10);
      if (step > 1 && !hasName) {
        setCurrentStep(1);
        localStorage.setItem('onboarding_step', '1');
      } else {
        setCurrentStep(step);
      }
    }
    setIsHydrated(true);
  }, []);

  const updateData = (stepData: Partial<ProfileInput>) => {
    setData((prev) => {
      const newData = { ...prev };
      
      // Perform a shallow merge for top level, and merge nested objects (like education, work, goal)
      for (const k in stepData) {
        const key = k as keyof ProfileInput;
        if (
          typeof stepData[key] === 'object' && 
          stepData[key] !== null && 
          !Array.isArray(stepData[key])
        ) {
          newData[key] = { ...(newData[key] as any), ...(stepData[key] as any) } as any;
        } else {
          newData[key] = stepData[key] as any;
        }
      }
      
      localStorage.setItem('onboarding_draft', JSON.stringify(newData));
      return newData;
    });
  };

  const nextStep = () => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      localStorage.setItem('onboarding_step', next.toString());
      return next;
    });
  };

  const prevStep = () => {
    setCurrentStep((prev) => {
      const next = Math.max(1, prev - 1);
      localStorage.setItem('onboarding_step', next.toString());
      return next;
    });
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, currentStep, setCurrentStep, nextStep, prevStep, isHydrated }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}
